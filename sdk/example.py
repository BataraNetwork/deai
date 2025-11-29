#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os
from dotenv import load_dotenv
from deai_sdk.client import DeAIClient

# --- Environment Setup ---
# Load environment variables from .env file
# Ensure you have DEAI_PRIVATE_KEY, RPC_URL, and DEAI_TOKEN_CONTRACT_ADDRESS set.
load_dotenv()

# --- Example Usage ---
def main():
    """Demonstrates the full lifecycle of using the DeAIClient."""
    private_key = os.getenv("DEAI_PRIVATE_KEY")
    if not private_key:
        raise ValueError("DEAI_PRIVATE_KEY must be set in the environment.")

    # --- Initialization with Failover ---
    # Provide a list of potential gateway nodes.
    # The client will automatically find and connect to a healthy one.
    # You can also set this as a comma-separated string in the DEAI_API_URLS environment variable.
    gateway_nodes = [
        "http://localhost:8000", # Your local node
        "http://localhost:8001", # A potential second local node for testing
        "https://deai-node.some-production-url.com" # A hypothetical production node
    ]

    try:
        print("Initializing DeAIClient with failover support...")
        client = DeAIClient(
            private_key=private_key,
            api_base_urls=gateway_nodes
        )

        # --- 1. Check Balance ---
        balance = client.get_balance()
        print(f"\nWallet Balance: {balance} DeAI tokens")

        # --- 2. List Available Models ---
        print("\nFetching available models...")
        models = client.get_models()
        if not models:
            print("No models available from the gateway.")
            return
        
        print("Available Models:")
        for m in models:
            print(f"- ID: {m.id}, Cost: {m.cost} DeAI/token")
        
        # Select a model to use
        # For this example, we'll use the first available model
        target_model = models[0]

        # --- 3. Submit a Generation Job ---
        print(f"\nSubmitting a job to model: {target_model.id}...")
        # The client will automatically handle token approval if needed
        task = client.generate(
            model_id=target_model.id,
            prompt="Explain the significance of the Decentralized Physical Infrastructure Network (DePIN) in 50 words.",
        )
        print(f"Job submitted successfully! Task ID: {task.task_id}")

        # --- 4. Poll for Result ---
        print("\nWaiting for job to complete...")
        try:
            result = client.get_job_result(task_id=task.task_id)
            print("\n--- Job Result ---")
            if result.status == "SUCCESS":
                print(f"Status: {result.status}")
                print(f"Result: {result.result}")
                print(f"Cost: {result.cost}")
            else:
                print(f"Status: {result.status}")
                print(f"Error: {result.error}")

        except TimeoutError as e:
            print(f"\nError: {e}")

    except ConnectionError as e:
        print(f"\nInitialization Failed: {e}")
    except Exception as e:
        print(f"\nAn unexpected error occurred: {e}")

if __name__ == "__main__":
    main()
