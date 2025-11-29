#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os
import time
import requests
import threading
from typing import List, Optional, Union
from web3 import Web3
from eth_account import Account
from dotenv import load_dotenv

from .models import Task, TaskStatus, Model
from .abi import DEAI_TOKEN_ABI

# --- Constants ---
TOKEN_DECIMALS = 18

class DeAIClient:
    """Client for interacting with the DeAI Gateway and Blockchain with dynamic node discovery."""

    def __init__(self, private_key: str, api_base_urls: Union[str, List[str]] = None, rpc_url: str = None):
        load_dotenv()
        self._lock = threading.Lock()

        # --- API URL Initialization ---
        if api_base_urls is None:
            urls_str = os.getenv("DEAI_API_URLS", "http://localhost:8000")
        else:
            urls_str = api_base_urls
        
        if isinstance(urls_str, list):
            self.api_base_urls = urls_str
        else:
            self.api_base_urls = [url.strip() for url in urls_str.split(',')]
        
        self.active_api_url = None

        # --- Blockchain Initialization ---
        self.rpc_url = rpc_url or os.getenv("RPC_URL")
        self.deai_token_address = os.getenv("DEAI_TOKEN_CONTRACT_ADDRESS")

        if not self.rpc_url or not self.deai_token_address:
            raise ValueError("RPC_URL and DEAI_TOKEN_CONTRACT_ADDRESS must be set.")

        self.w3 = Web3(Web3.HTTPProvider(self.rpc_url))
        if not self.w3.is_connected():
            raise ConnectionError(f"Failed to connect to blockchain RPC at {self.rpc_url}")

        self.account = Account.from_key(private_key if private_key.startswith("0x") else "0x" + private_key)
        self.address = self.account.address
        self.token_contract = self.w3.eth.contract(address=self.deai_token_address, abi=DEAI_TOKEN_ABI)
        
        # --- Initial Connection and Discovery ---
        self._find_healthy_node()
        self.refresh_nodes() # Initial population of the node list from the mesh
        self.operator_address = self._get_gateway_operator_address()

        print(f"DeAIClient initialized for address: {self.address}")
        print(f"Connected to active gateway: {self.active_api_url}")

    def _find_healthy_node(self):
        """Finds the first healthy node from the current list of base URLs."""
        with self._lock:
            for url in self.api_base_urls:
                try:
                    response = requests.get(f"{url}/health", timeout=5)
                    if response.status_code == 200:
                        self.active_api_url = url
                        print(f"Found healthy node: {url}")
                        return
                except requests.exceptions.RequestException:
                    print(f"Node {url} is unreachable.")
            
            raise ConnectionError(f"Failed to connect to any DeAI Gateway in the list: {self.api_base_urls}")

    def refresh_nodes(self):
        """Refreshes the list of API URLs from the active gateway's /nodes endpoint."""
        if not self.active_api_url:
            print("Cannot refresh nodes without an active connection.")
            return

        try:
            print(f"Refreshing node list from gateway: {self.active_api_url}")
            response = requests.get(f"{self.active_api_url}/nodes", timeout=5)
            response.raise_for_status()
            data = response.json()
            new_nodes = data.get("nodes", [])
            
            if new_nodes:
                with self._lock:
                    current_nodes_set = set(self.api_base_urls)
                    new_nodes_set = set(new_nodes)
                    updated_nodes_set = current_nodes_set.union(new_nodes_set)
                    self.api_base_urls = list(updated_nodes_set)
                print(f"Node list refreshed. Total known nodes: {len(self.api_base_urls)}")
        except requests.exceptions.RequestException as e:
            print(f"Could not refresh node list: {e}")

    def _make_request(self, method: str, endpoint: str, **kwargs) -> requests.Response:
        """
        Makes a request to the active gateway, with built-in retry, failover, and node list refresh.
        """
        if not self.active_api_url:
            self._find_healthy_node()

        url = f"{self.active_api_url}{endpoint}"

        try:
            response = requests.request(method, url, **kwargs)
            response.raise_for_status()
            return response
        except requests.exceptions.RequestException as e:
            print(f"Request to {self.active_api_url} failed. Reason: {e}. Attempting failover...")
            # 1. Find a new healthy node from the existing list
            self._find_healthy_node()
            # 2. After failover, refresh the node list from the new active node
            self.refresh_nodes()
            # 3. Retry the original request on the new active node
            print(f"Retrying request on new active node: {self.active_api_url}")
            new_url = f"{self.active_api_url}{endpoint}"
            response = requests.request(method, new_url, **kwargs)
            response.raise_for_status()
            return response

    def get_models(self) -> List[Model]:
        """Retrieves available models from a gateway node."""
        response = self._make_request("get", "/api/gateway/models")
        models_data = response.json()
        return [Model(id=model["id"], cost=model["cost"]) for model in models_data]

    def get_balance(self) -> float:
        """Retrieves the user's DeAI token balance from the blockchain."""
        balance_wei = self.token_contract.functions.balanceOf(self.address).call()
        return balance_wei / (10**TOKEN_DECIMALS)

    def _get_gateway_operator_address(self) -> str:
        """Fetches the operator address from the active gateway."""
        response = self._make_request("get", "/api/gateway/operator-address")
        return response.json()['operatorAddress']

    def approve_spending(self, amount: float):
        """Approves the gateway operator to spend tokens on the user's behalf."""
        amount_in_wei = int(amount * (10**TOKEN_DECIMALS))
        nonce = self.w3.eth.get_transaction_count(self.address)
        tx = self.token_contract.functions.approve(self.operator_address, amount_in_wei).build_transaction({
            'from': self.address, 'nonce': nonce, 'gas': 200000, 'gasPrice': self.w3.eth.gas_price
        })
        signed_tx = self.account.sign_transaction(tx)
        tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        print(f"Approval transaction sent. Tx Hash: {tx_hash.hex()}")
        receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
        print("Approval confirmed!")
        return receipt

    def generate(self, model_id: str, prompt: str, **kwargs) -> Task:
        """Submits a generation job to the gateway."""
        # ... (approval logic remains the same)
        request_data = {"address": self.address, "model": model_id, "prompt": prompt, **kwargs}
        response = self._make_request("post", "/api/gateway/generate", json=request_data)
        return Task(**response.json())

    def get_job_status(self, task_id: str) -> TaskStatus:
        """Retrieves the status of a specific job."""
        response = self._make_request("get", f"/api/gateway/result/{task_id}")
        return TaskStatus(**response.json())

    def get_job_result(self, task_id: str, timeout: int = 120, polling_interval: int = 5) -> TaskStatus:
        """Waits for a job to complete and retrieves the final result."""
        start_time = time.time()
        while time.time() - start_time < timeout:
            status = self.get_job_status(task_id)
            if status.status in ["SUCCESS", "FAILURE"]:
                return status
            print(f"Job is still {status.status}... polling again in {polling_interval}s")
            time.sleep(polling_interval)
        raise TimeoutError(f"Job {task_id} timed out after {timeout} seconds.")
