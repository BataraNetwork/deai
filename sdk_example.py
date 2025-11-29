#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os
import sys
import time
import requests
from dotenv import load_dotenv

# This is necessary to run the example from the project root
# after the SDK has been moved to its own package directory.
# In a real-world scenario, you would install the SDK via pip.
sys.path.append(os.path.abspath('sdk/src'))

from deai_sdk.client import DeAIClient

# --- Configuration ---
load_dotenv() # Load variables from .env file

# Node and Blockchain details
NODE_URL = "http://localhost:8000"
RPC_URL = os.environ.get("RPC_URL")
DEAI_TOKEN_ADDRESS = os.environ.get("DEAI_TOKEN_CONTRACT_ADDRESS")

# User wallet
# IMPORTANT: Use a development/test private key. Do not expose a mainnet key.
USER_PRIVATE_KEY = os.environ.get("OPERATOR_PRIVATE_KEY") # For testing, we'll use the operator key

def main():
    """Demonstrates the full workflow of using the DeAIClient."""
    # --- 1. Initialization ---
    print("Initializing DeAI Client...")
    if not all([RPC_URL, USER_PRIVATE_KEY, DEAI_TOKEN_ADDRESS]):
        print("Error: RPC_URL, USER_PRIVATE_KEY, or DEAI_TOKEN_ADDRESS not found in .env file.")
        return

    try:
        client = DeAIClient(node_engine_url=NODE_URL, rpc_url=RPC_URL, private_key=USER_PRIVATE_KEY)
    except Exception as e:
        print(f"Failed to initialize client: {e}")
        return

    # --- 2. Approve Spending ---
    # In a real app, you would check the allowance first and only approve if needed.
    print("\n--- Approving Token Spending ---")
    # This is the amount in the smallest unit (wei). 10 * 10**18 is 10 full tokens.
    approval_amount = 10 * (10**18)
    approval_successful = client.approve_spending(DEAI_TOKEN_ADDRESS, approval_amount)

    if not approval_successful:
        print("Token spending approval failed. Aborting.")
        return
    
    print("Waiting a moment for the approval to be confirmed on-chain...")
    time.sleep(15) # Give the blockchain a moment to process

    # --- 3. Request Generation ---
    print("\n--- Requesting AI Text Generation ---")
    prompt = "Write a short story about a robot who discovers music."
    task_info = client.generate(prompt=prompt, model="gemma")

    if not task_info:
        print("Failed to submit generation task.")
        return

    # --- 4. Poll for Result ---
    print("\n--- Polling for Result ---")
    status_url = task_info['status_url']
    timeout = 180  # seconds
    poll_interval = 5 # seconds
    start_time = time.time()

    while time.time() - start_time < timeout:
        try:
            response = requests.get(status_url)
            response.raise_for_status()
            data = response.json()

            if data['status'] == 'SUCCESS':
                print("\n--- Task Completed Successfully! ---")
                print("Result:", data['result']['generated_text'])
                return
            elif data['status'] in ['FAILURE', 'REVOKED']:
                print(f"Task failed with status: {data['status']}")
                return
            else:
                print(f"Task status: {data['status']}...")
                time.sleep(poll_interval)
        except requests.exceptions.RequestException as e:
            print(f"Error polling for status: {e}")
            time.sleep(poll_interval)
    
    print("Task timed out.")

if __name__ == "__main__":
    main()
