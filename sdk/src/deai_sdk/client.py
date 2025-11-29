#!/usr/bin/env python
# -*- coding: utf-8 -*-
import requests
import time
import json
from pathlib import Path
from typing import Optional, Dict
from web3 import Web3
from web3.middleware import geth_poa_middleware

# --- ABI Loading ---
# In a real package, you might vendor this or fetch it.
_abi_path = Path(__file__).parent.parent.parent.parent / "artifacts" / "contracts" / "DeAIToken.sol" / "DeAIToken.json"
if not _abi_path.exists():
    raise FileNotFoundError(f"SDK requires contract ABI, not found at {_abi_path}")
with open(_abi_path, 'r') as f:
    _artifact = json.load(f)
    DEAI_TOKEN_ABI = _artifact["abi"]

class DeAIClient:
    """
    A client for interacting with a DeAI node engine, handling approvals, 
    inference requests, and result fetching.
    """
    def __init__(self, node_engine_url: str, rpc_url: str, private_key: str):
        """
        Initializes the client and connects to the blockchain.

        Args:
            node_engine_url: The base URL of the DeAI node engine (e.g., http://localhost:8000).
            rpc_url: The URL of the blockchain RPC endpoint.
            private_key: The user's private key for signing transactions.
        """
        # --- API Setup ---
        if not node_engine_url.endswith('/'):
            node_engine_url += '/'
        self.base_url = node_engine_url
        self.api_url = f"{self.base_url}api/gateway/"

        # --- Web3 Setup ---
        self.w3 = Web3(Web3.HTTPProvider(rpc_url))
        self.w3.middleware_onion.inject(geth_poa_middleware, layer=0)
        if not self.w3.is_connected():
            raise ConnectionError(f"Failed to connect to blockchain node at {rpc_url}")
        
        self.account = self.w3.eth.account.from_key(private_key)
        self.user_address = self.account.address

        print(f"DeAI Client initialized for node: {self.base_url}")
        print(f"User address: {self.user_address}")

    def get_operator_address(self) -> Optional[str]:
        """Retrieves the operator's wallet address from the node."""
        try:
            response = requests.get(f"{self.api_url}operator-address")
            response.raise_for_status()
            return response.json()['address']
        except requests.exceptions.RequestException as e:
            print(f"Error fetching operator address: {e}")
            return None

    def approve_spending(self, token_contract_address: str, amount: int) -> bool:
        """
        Approves the node's operator to spend a certain amount of DeAI tokens.

        Args:
            token_contract_address: The address of the DeAI token contract.
            amount: The amount of tokens to approve (in the smallest unit, e.g., wei).

        Returns:
            True if the approval was successful, False otherwise.
        """
        operator_address = self.get_operator_address()
        if not operator_address:
            return False

        try:
            token_contract = self.w3.eth.contract(
                address=self.w3.to_checksum_address(token_contract_address), 
                abi=DEAI_TOKEN_ABI
            )
            nonce = self.w3.eth.get_transaction_count(self.user_address)

            tx = token_contract.functions.approve(
                self.w3.to_checksum_address(operator_address),
                amount
            ).build_transaction({
                'chainId': self.w3.eth.chain_id,
                'gas': 100000,
                'gasPrice': self.w3.eth.gas_price,
                'nonce': nonce,
            })

            signed_tx = self.w3.eth.account.sign_transaction(tx, private_key=self.account.key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
            print(f"Approval transaction sent. Tx Hash: {tx_hash.hex()}")

            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            if receipt['status'] == 1:
                print("Approval successful.")
                return True
            else:
                print("Approval transaction failed on-chain.")
                return False
        except Exception as e:
            print(f"An error occurred during approval: {e}")
            return False

    def generate(self, prompt: str, model: str = "gemma") -> Optional[Dict]:
        """
        Submits a generation request. The user address is now taken from the wallet 
        initialized with the private key.
        """
        request_payload = {
            "address": self.user_address,
            "prompt": prompt,
            "model": model,
        }
        try:
            submit_response = requests.post(f"{self.api_url}generate", json=request_payload)
            submit_response.raise_for_status()
            task_info = submit_response.json()
            print(f"Task submitted successfully. Task ID: {task_info['task_id']}")
            # For simplicity, this example doesn't poll. 
            # A real app would use the status_url to get the result.
            return task_info
        except requests.exceptions.RequestException as e:
            print(f"An error occurred during generation request: {e}")
            return None
