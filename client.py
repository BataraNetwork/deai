import os
import time
import json
import requests

# --- Configuration ---
BASE_URL = os.environ.get("API_URL", "http://127.0.0.1:8080")
API_KEY = os.environ.get("API_KEY", "default-secret-key")

def generate_text_polling(prompt: str):
    """Makes a request to the /generate endpoint and polls for the result."""
    print(f"\nSending prompt (polling): '{prompt}'")
    try:
        response = requests.post(
            f"{BASE_URL}/generate",
            headers={"X-API-Key": API_KEY},
            json={"prompt": prompt}
        )
    except requests.exceptions.ConnectionError as e:
        print(f"Connection Error: Could not connect to {BASE_URL}. Is the service running?")
        return

    if response.status_code == 401:
        print("Authentication Error: Invalid or missing API key.")
        return
    if response.status_code != 202:
        print(f"Error: Received status code {response.status_code}")
        print(f"Response: {response.text}")
        return

    task_info = response.json()
    task_id = task_info['task_id']
    status_url = task_info['status_url']
    print(f"Task started with ID: {task_id}")

    while True:
        print("Checking status...")
        try:
            status_response = requests.get(status_url)
            status_data = status_response.json()

            if status_data['state'] == 'SUCCESS':
                print("\n--- Generated Text ---")
                print(status_data['result'])
                print("---------------------\n")
                break
            elif status_data['state'] == 'FAILURE':
                print(f"Task failed: {status_data['error']}")
                break
            else:
                time.sleep(3)
        except requests.exceptions.ConnectionError:
            print("Connection lost while polling. Retrying...")
            time.sleep(5)

def stream_text(prompt: str):
    """Connects to the /stream endpoint and prints tokens as they arrive."""
    print(f"\nSending prompt (streaming): '{prompt}'")
    try:
        response = requests.post(
            f"{BASE_URL}/stream",
            headers={"X-API-Key": API_KEY},
            json={"prompt": prompt},
            stream=True
        )
    except requests.exceptions.ConnectionError as e:
        print(f"Connection Error: Could not connect to {BASE_URL}. Is the service running?")
        return

    if response.status_code == 401:
        print("Authentication Error: Invalid or missing API key.")
        return

    print("\n--- Generated Text (Streaming) ---")
    for line in response.iter_lines():
        if line:
            # SSE sends lines like "data: {token}". We parse it here.
            decoded_line = line.decode('utf-8')
            if decoded_line.startswith('data:'):
                token = decoded_line[5:].strip()
                print(token, end="", flush=True)
    print("\n----------------------------------\n")

if __name__ == "__main__":
    print("--- AI Node Engine Client ---")
    
    # Check which mode to run in
    mode = input("Choose mode: 'poll' or 'stream': ").lower()
    while mode not in ['poll', 'stream']:
        mode = input("Invalid mode. Please choose 'poll' or 'stream': ").lower()

    while True:
        user_prompt = input("Enter a prompt (or 'quit' to exit): ")
        if user_prompt.lower() == 'quit':
            break
        if not user_prompt.strip():
            print("Prompt cannot be empty.")
            continue
        
        if mode == 'poll':
            generate_text_polling(user_prompt)
        else:
            stream_text(user_prompt)
