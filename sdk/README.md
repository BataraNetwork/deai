# DeAI Python SDK

This SDK provides a convenient Python client (`DeAIClient`) for interacting with a DeAI `node-engine`.

It simplifies the process of:
1.  **Approving Tokens**: Authorizing the node to use your DeAI tokens for payment via an on-chain `approve` transaction.
2.  **Requesting AI Inference**: Sending prompts to the node's `/generate` endpoint.
3.  **Polling for Results**: Checking the status of your task and retrieving the generated output once it's complete.

## Installation

This SDK is designed to be installed as a standard Python package. From within the `sdk` directory, you can install it locally:

```bash
pip install .
```

## Usage

The client requires a few pieces of information to get started:

*   **Node Engine URL**: The HTTP endpoint of the `node-engine` you want to connect to.
*   **Blockchain RPC URL**: A connection to an Ethereum-compatible blockchain.
*   **User Private Key**: The private key of the wallet you will use for payments. **Never expose this in client-side code or public repositories.**

See the `sdk_example.py` file in the project root for a complete, runnable demonstration of the full client workflow.

### Quick Example

```python
from deai_sdk.client import DeAIClient
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

NODE_URL = "http://localhost:8000"
RPC_URL = os.environ.get("RPC_URL")
USER_PRIVATE_KEY = os.environ.get("USER_PRIVATE_KEY")
DEAI_TOKEN_ADDRESS = os.environ.get("DEAI_TOKEN_CONTRACT_ADDRESS")

# 1. Initialize the client
client = DeAIClient(
    node_engine_url=NODE_URL, 
    rpc_url=RPC_URL, 
    private_key=USER_PRIVATE_KEY
)

# 2. Approve spending (amount is in wei, e.g., 10 * 10**18)
client.approve_spending(DEAI_TOKEN_ADDRESS, 10 * (10**18))

# 3. Request generation
task_info = client.generate(
    prompt="Tell me a story about a friendly robot.",
    model="gemma"
)

# 4. Poll task_info['status_url'] to get the result
print(f"Task submitted! Check status at: {task_info['status_url']}")
```
