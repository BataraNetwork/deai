# To run this example, ensure the DeAI services are running (e.g., via `docker-compose up --build`)
# Then, from the root of the project, run:
# PYTHONPATH=sdk python3 sdk/example.py

import requests
from deai_sdk.client import DeAIClient
from deai_sdk.models import TaskStatus

# This is a test address. In a real application, this would be the user's actual wallet address.
# This specific address is known to have a balance in the local test environment.
TEST_USER_ADDRESS = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"

def main():
    """Demonstrates how to use the DeAIClient to interact with the gateway."""
    print("Initializing DeAI Client...")
    try:
        client = DeAIClient(api_base_url="http://localhost:8080")
    except ConnectionError as e:
        print(f"Error: {e}")
        print("Please ensure the DeAI gateway service is running.")
        return

    print("\n--- 1. Fetching Available Models ---")
    try:
        models = client.get_models()
        if not models:
            print("No models available from the gateway.")
        else:
            print("Available models:")
            for model in models:
                print(f"- {model.name}")
    except Exception as e:
        print(f"Error fetching models: {e}")
        return

    if not models:
        print("\nCannot proceed without any available models.")
        return
    
    selected_model = models[0].name
    print(f"\n--- 2. Submitting Inference Job for model: '{selected_model}' ---")
    print(f"Using wallet address for token check: {TEST_USER_ADDRESS}")

    prompt = "Write a short, futuristic story about a cat that can talk."
    print(f"Prompt: {prompt}")

    task = None # Initialize task to None
    try:
        # The gateway now requires a user's address to check their token balance.
        task = client.submit_job(
            address=TEST_USER_ADDRESS,
            model=selected_model,
            prompt=prompt
        )
        print(f"Successfully submitted job. Task ID: {task.task_id}")
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 402:
            print("\nJob submission failed: 402 Payment Required. The user has insufficient token balance.")
            print("This confirms the gateway's token-based access control is working correctly.")
        else:
            print(f"\nAn unexpected HTTP error occurred: {e}")
    except Exception as e:
        print(f"\nError submitting job: {e}")

    if not task:
        print("\nSkipping result check as job submission did not return a task.")
        return

    print("\n--- 3. Waiting for Job Completion ---")
    try:
        final_status: TaskStatus = client.get_job_result(task.task_id)
        print(f"Job finished with status: {final_status.status}")

        if final_status.status == "SUCCESS":
            print("\n--- 4. Displaying Result ---")
            print(f"Generated Text: {final_status.result}")
        elif final_status.status == "FAILURE":
            print("\n--- 4. Job Failed ---")
            print(f"Reason: {final_status.result}")

    except TimeoutError as e:
        print(f"\nError: {e}")
    except Exception as e:
        print(f"\nAn unexpected error occurred while waiting for the result: {e}")

if __name__ == "__main__":
    main()
