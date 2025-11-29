#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os
import time
import requests
from typing import List, Optional
from web3 import Web3
from eth_account import Account
from dotenv import load_dotenv

from .models import Task, TaskStatus, Model
from .abi import DEAI_TOKEN_ABI

# --- Constants ---
TOKEN_DECIMALS = 18

class DeAIClient:
    """Client for interacting with the DeAI Gateway and Blockchain."""

    def __init__(self, private_key: str, api_base_url: str = None, rpc_url: str = None):
        """
        Initializes the Web3 client.
        """
        load_dotenv()

        self.api_base_url = api_base_url or os.getenv("DEAI_API_URL", "http://localhost:8000")
        self.rpc_url = rpc_url or os.getenv("RPC_URL")
        self.deai_token_address = os.getenv("DEAI_TOKEN_CONTRACT_ADDRESS")

        if not self.rpc_url:
            raise ValueError("RPC_URL must be provided or set as an environment variable.")
        if not self.deai_token_address:
            raise ValueError("DEAI_TOKEN_CONTRACT_ADDRESS must be provided or set as an environment variable.")

        self.w3 = Web3(Web3.HTTPProvider(self.rpc_url))
        if not self.w3.is_connected():
            raise ConnectionError(f"Failed to connect to blockchain RPC at {self.rpc_url}")

        if not private_key.startswith("0x"):
            private_key = "0x" + private_key
            
        self.account = Account.from_key(private_key)
        self.address = self.account.address
        self.token_contract = self.w3.eth.contract(address=self.deai_token_address, abi=DEAI_TOKEN_ABI)
        self.operator_address = self._get_gateway_operator_address()

        print(f"DeAIClient initialized for address: {self.address}")
        self._validate_connection()

    def _validate_connection(self):
        """Checks gateway connection."""
        try:
            response = requests.get(f"{self.api_base_url}/health")
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            raise ConnectionError(f"Failed to connect to DeAI Gateway at {self.api_base_url}.") from e

    def get_models(self) -> List[Model]:
        """Retrieves available models."""
        response = requests.get(f"{self.api_base_url}/api/gateway/models")
        response.raise_for_status()
        models_data = response.json()
        return [Model(id=model["id"], cost=model["cost"]) for model in models_data]

    def get_balance(self) -> float:
        """Retrieves the user's DeAI token balance."""
        balance_wei = self.token_contract.functions.balanceOf(self.address).call()
        return balance_wei / (10**TOKEN_DECIMALS)

    def _get_gateway_operator_address(self) -> str:
        """Fetches the operator address from the gateway's public endpoint."""
        try:
            response = requests.get(f"{self.api_base_url}/api/gateway/operator-address")
            response.raise_for_status()
            return response.json()['operatorAddress']
        except requests.exceptions.RequestException as e:
            raise ConnectionError("Failed to fetch gateway operator address.") from e

    def approve_spending(self, amount: float):
        """Approves the gateway operator to spend a certain amount of tokens."""
        amount_in_wei = int(amount * (10**TOKEN_DECIMALS))
        
        print(f"Approving {amount} tokens for gateway operator: {self.operator_address}...")

        nonce = self.w3.eth.get_transaction_count(self.address)
        tx = self.token_contract.functions.approve(self.operator_address, amount_in_wei).build_transaction({
            'from': self.address,
            'nonce': nonce,
            'gas': 200000,
            'gasPrice': self.w3.eth.gas_price
        })

        signed_tx = self.account.sign_transaction(tx)
        tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        
        print(f"Approval transaction sent. Tx Hash: {tx_hash.hex()}")
        receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
        print("Approval confirmed!")
        return receipt

    def generate(
        self, 
        model_id: str, 
        prompt: str, 
        temperature: float = 0.7, 
        max_new_tokens: int = 150
    ) -> Task:
        """
        Submits a job, automatically handling token approval if necessary.
        """
        models = self.get_models()
        model = next((m for m in models if m.id == model_id), None)
        if not model:
            raise ValueError(f"Model '{model_id}' not found.")

        allowance_wei = self.token_contract.functions.allowance(self.address, self.operator_address).call()
        model_cost_wei = int(model.cost * (10**TOKEN_DECIMALS))

        if allowance_wei < model_cost_wei:
            print("Insufficient allowance. Initiating approval transaction...")
            # Approve a higher amount for future transactions to reduce approval requests.
            approval_amount = model.cost * 20
            self.approve_spending(approval_amount)

        print("Sufficient allowance. Submitting job to gateway...")
        request_data = {
            "address": self.address,
            "model": model_id,
            "prompt": prompt,
            "temperature": temperature,
            "max_new_tokens": max_new_tokens
        }
        response = requests.post(f"{self.api_base_url}/api/gateway/generate", json=request_data)
        response.raise_for_status()
        task_data = response.json()
        return Task(task_id=task_data["task_id"])

    def get_job_status(self, task_id: str) -> TaskStatus:
        """Retrieves the status of a specific inference job from the gateway."""
        response = requests.get(f"{self.api_base_url}/api/gateway/result/{task_id}")
        response.raise_for_status()
        data = response.json()
        return TaskStatus(**data)

    def get_job_result(
        self, 
        task_id: str, 
        timeout: int = 120, 
        polling_interval: int = 5
    ) -> TaskStatus:
        """Waits for a job to complete and retrieves the final result."""
        start_time = time.time()
        while time.time() - start_time < timeout:
            status = self.get_job_status(task_id)
            if status.status in ["SUCCESS", "FAILURE"]:
                return status
            print(f"Job is still {status.status}... polling again in {polling_interval}s")
            time.sleep(polling_interval)
        
        raise TimeoutError(f"Job {task_id} did not complete within the {timeout} second timeout.")
