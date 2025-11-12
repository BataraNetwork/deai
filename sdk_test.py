import os
import time
from deai_sdk import DeAIClient

print("Starting DeAI SDK test...")

# Point the SDK to the local running service
os.environ["DEAI_API_URL"] = "http://127.0.0.1:8080"

def run_test():
    try:
        # 1. Initialize the client
        print("Initializing DeAIClient...")
        client = DeAIClient()
        print("Client initialized successfully.")

        # 2. Get available models
        print("\nFetching available models...")
        models = client.get_models()
        
        if models:
            print(f"Successfully fetched {len(models)} models:")
            model_names = [model.name for model in models]
            for name in model_names:
                print(f"- {name}")
        else:
            print("No models found.")
            return

        # 3. Test a model if available
        test_model = "mistral" # Let's test our new model
        if test_model in model_names:
            print(f"\n--- Testing model: {test_model} ---")
            prompt = "The capital of France is"
            print(f"Submitting generation task with prompt: '{prompt}'")
            
            task = client.generate(prompt, model=test_model)
            print(f"Task submitted with ID: {task.task_id}")

            # 4. Poll for the result
            print("Polling for result...")
            start_time = time.time()
            while time.time() - start_time < 120: # 2-minute timeout
                status = task.get_status()
                print(f"Current task status: {status.status}")
                if status.is_finished():
                    result = task.get_result()
                    print("\n--- Generation Result ---")
                    print(result.result)
                    print("-------------------------")
                    break
                time.sleep(5) # Wait 5 seconds before polling again
            else:
                print("Test timed out.")

        else:
            print(f"Model '{test_model}' not found, skipping generation test.")

        print("\nSDK test finished successfully!")

    except Exception as e:
        print(f"\nAn error occurred during the SDK test: {e}")

if __name__ == "__main__":
    run_test()
