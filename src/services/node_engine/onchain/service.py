#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os
import json
from pathlib import Path
from web3 import Web3
from web3.middleware import geth_poa_middleware
from dotenv import load_dotenv

# --- Configuration & Setup ---

# It's better to load env vars once at the application entry point,
# but for modularity, we'll keep it here for now.
load_dotenv()

# --- Environment Variable Loading ---
RPC_URL = os.environ.get("RPC_URL")
DEAI_TOKEN_CONTRACT_ADDRESS = os.environ.get("DEAI_TOKEN_CONTRACT_ADDRESS")
OPERATOR_PRIVATE_KEY = os.environ.get("OPERATOR_PRIVATE_KEY")
OPERATOR_ADDRESS = os.environ.get("OPERATOR_ADDRESS")

# --- ABI Loading ---
try:
    _abi_path = Path(__file__).parent.parent.parent.parent / "artifacts" / "contracts" / "DeAIToken.sol" / "DeAIToken.json"
    if not _abi_path.exists():
        raise FileNotFoundError(f"Contract ABI not found at {_abi_path}")
    with open(_abi_path, 'r') as f:
        _artifact = json.load(f)
        DEAI_TOKEN_ABI = _artifact["abi"]
except Exception as e:
    DEAI_TOKEN_ABI = None
    print(f"Warning: Could not load contract ABI. On-chain functions will fail. Error: {e}")


class OnChainService:
    """
    Service to interact with the DeAI smart contracts on the blockchain.
    Handles checking token allowances and processing payments via `transferFrom`.

    This class is now designed to be instantiated and injected as a dependency.
    """
    def __init__(self, rpc_url: str, contract_address: str, operator_pk: str, operator_address: str, contract_abi: dict):
        # --- Validation ---
        if not all([rpc_url, contract_address, operator_pk, operator_address, contract_abi]):
            raise ValueError("One or more required arguments for OnChainService are missing.")

        self.w3 = Web3(Web3.HTTPProvider(rpc_url))
        self.w3.middleware_onion.inject(geth_poa_middleware, layer=0)

        if not self.w3.is_connected():
            raise ConnectionError(f"Failed to connect to blockchain node at {rpc_url}")

        # Checksum addresses for safety
        self.contract_address = self.w3.to_checksum_address(contract_address)
        self.operator_address = self.w3.to_checksum_address(operator_address)

        # Load operator account from private key
        try:
            self.operator_account = self.w3.eth.account.from_key(operator_pk)
        except Exception as e:
            raise ValueError(f"Invalid OPERATOR_PRIVATE_KEY. Error: {e}")

        if self.operator_account.address != self.operator_address:
            raise ValueError("OPERATOR_PRIVATE_KEY does not correspond to OPERATOR_ADDRESS")

        # Initialize contract instance
        self.token_contract = self.w3.eth.contract(address=self.contract_address, abi=contract_abi)

        # Get token decimals for conversions
        try:
            self.token_decimals = self.token_contract.functions.decimals().call()
        except Exception as e:
            raise ConnectionError(f"Failed to call contract. Is the contract address and RPC_URL correct? Error: {e}")
        
        print("OnChainService instance created successfully.")

    def _convert_usd_to_token_units(self, amount_usd: float) -> int:
        """
        Converts a USD amount to the token's smallest unit (e.g., wei).
        Assumes a fixed 1:1 conversion rate (1 USD = 1 DeAI Token).
        """
        return int(amount_usd * (10 ** self.token_decimals))

    def verify_payment(self, user_address: str, model: str) -> tuple[bool, str]:
        """
        Checks if the user has a sufficient token allowance for the operation.
        This is a read-only operation and does not perform any transaction.
        """
        # In a real app, model cost would come from a config or database
        costs = {"gemma": 10, "stable-diffusion": 25, "music-gen": 50}
        amount_usd = costs.get(model)
        if not amount_usd:
            return False, "Invalid model specified"
            
        try:
            user_address_checksum = self.w3.to_checksum_address(user_address)
            token_amount = self._convert_usd_to_token_units(amount_usd)

            print(f"Checking allowance for {user_address_checksum}...")
            allowance = self.token_contract.functions.allowance(user_address_checksum, self.operator_address).call()
            print(f"Allowance is: {allowance}, Required: {token_amount}")

            if allowance < token_amount:
                print(f"Insufficient allowance for user {user_address_checksum}")
                return False, "Insufficient allowance."

            print("Allowance is sufficient.")
            return True, "Payment verified."

        except Exception as e:
            print(f"An error occurred during payment verification: {e}")
            return False, "An error occurred during verification."


# Note: The global singleton instance has been removed.
# The creation of the OnChainService will now be handled by a dependency injector.
