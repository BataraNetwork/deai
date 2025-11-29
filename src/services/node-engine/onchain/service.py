#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os
import json
from pathlib import Path
from web3 import Web3
from web3.middleware import geth_poa_middleware
from dotenv import load_dotenv

# --- Configuration & Setup ---

# Load environment variables from .env file
load_dotenv()

# --- Environment Variable Loading ---
RPC_URL = os.environ.get("RPC_URL")
DEAI_TOKEN_CONTRACT_ADDRESS = os.environ.get("DEAI_TOKEN_CONTRACT_ADDRESS")
OPERATOR_PRIVATE_KEY = os.environ.get("OPERATOR_PRIVATE_KEY")
OPERATOR_ADDRESS = os.environ.get("OPERATOR_ADDRESS")

# --- ABI Loading ---
# Load the ABI from the contract artifact
_abi_path = Path(__file__).parent.parent.parent.parent / "artifacts" / "contracts" / "DeAIToken.sol" / "DeAIToken.json"
if not _abi_path.exists():
    raise FileNotFoundError(f"Contract ABI not found at {_abi_path}")
with open(_abi_path, 'r') as f:
    _artifact = json.load(f)
    DEAI_TOKEN_ABI = _artifact["abi"]

# --- Validation ---
if not all([RPC_URL, DEAI_TOKEN_CONTRACT_ADDRESS, OPERATOR_PRIVATE_KEY, OPERATOR_ADDRESS]):
    raise ValueError("One or more required environment variables are missing (RPC_URL, DEAI_TOKEN_CONTRACT_ADDRESS, OPERATOR_PRIVATE_KEY, OPERATOR_ADDRESS)")

class OnChainService:
    """
    Service to interact with the DeAI smart contracts on the blockchain.
    Handles checking token allowances and processing payments via `transferFrom`.
    """
    def __init__(self):
        self.w3 = Web3(Web3.HTTPProvider(RPC_URL))
        # Inject middleware for PoA chains like Polygon, Rinkeby, etc.
        self.w3.middleware_onion.inject(geth_poa_middleware, layer=0)

        if not self.w3.is_connected():
            raise ConnectionError(f"Failed to connect to blockchain node at {RPC_URL}")

        # Checksum addresses for safety
        self.contract_address = self.w3.to_checksum_address(DEAI_TOKEN_CONTRACT_ADDRESS)
        self.operator_address = self.w3.to_checksum_address(OPERATOR_ADDRESS)

        # Load operator account from private key
        self.operator_account = self.w3.eth.account.from_key(OPERATOR_PRIVATE_KEY)
        if self.operator_account.address != self.operator_address:
            raise ValueError("OPERATOR_PRIVATE_KEY does not correspond to OPERATOR_ADDRESS")

        # Initialize contract instance
        self.token_contract = self.w3.eth.contract(address=self.contract_address, abi=DEAI_TOKEN_ABI)

        # Get token decimals for conversions
        self.token_decimals = self.token_contract.functions.decimals().call()
        print("OnChainService initialized successfully.")

    def _convert_usd_to_token_units(self, amount_usd: float) -> int:
        """
        Converts a USD amount to the token's smallest unit (e.g., wei).
        For now, this assumes a fixed 1:1 conversion rate (1 USD = 1 DeAI Token).
        In a real system, this would involve a price oracle.
        """
        return int(amount_usd * (10 ** self.token_decimals))

    def process_payment(self, user_address: str, amount_usd: float) -> bool:
        """
        Checks a user's token allowance for the operator and, if sufficient, 
        executes `transferFrom` to process the payment.

        Args:
            user_address: The user's wallet address.
            amount_usd: The cost of the job in USD.

        Returns:
            True if the payment was successfully processed, False otherwise.
        """
        try:
            user_address_checksum = self.w3.to_checksum_address(user_address)
            token_amount = self._convert_usd_to_token_units(amount_usd)

            # 1. Check Allowance
            print(f"Checking allowance for {user_address_checksum}... The operator is {self.operator_address}")
            allowance = self.token_contract.functions.allowance(user_address_checksum, self.operator_address).call()
            print(f"Allowance is: {allowance}, Required: {token_amount}")

            if allowance < token_amount:
                print(f"Insufficient allowance for user {user_address_checksum}")
                return False

            # 2. Build & Sign Transaction
            print("Allowance is sufficient. Building transaction...")
            nonce = self.w3.eth.get_transaction_count(self.operator_address)
            tx = self.token_contract.functions.transferFrom(
                user_address_checksum,
                self.operator_address,
                token_amount
            ).build_transaction({
                'chainId': self.w3.eth.chain_id,
                'gas': 200000, # Can be estimated with .estimateGas()
                'gasPrice": self.w3.eth.gas_price,
                'nonce': nonce,
            })

            signed_tx = self.w3.eth.account.sign_transaction(tx, private_key=self.operator_account.key)

            # 3. Send Transaction & Wait for Receipt
            print("Sending transaction...")
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
            tx_receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)

            # 4. Check Receipt Status
            if tx_receipt['status'] == 1:
                print(f"Successfully processed payment of {amount_usd} USD from {user_address_checksum}")
                return True
            else:
                print(f"On-chain transaction failed for user {user_address_checksum}")
                return False

        except Exception as e:
            print(f"An error occurred during on-chain payment processing: {e}")
            return False

# --- Service Singleton ---
try:
    onchain_service = OnChainService()
except (ValueError, ConnectionError, FileNotFoundError) as e:
    print(f"Failed to initialize OnChainService: {e}")
    # In a real app, you might want to exit or run in a degraded mode.
    onchain_service = None
