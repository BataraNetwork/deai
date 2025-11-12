# DeAI Python SDK

Welcome to the official Python SDK for interacting with the DeAI network.

This SDK provides a simple interface for:
- Querying available models.
- Submitting inference jobs.
- Checking job status and retrieving results.

## Installation

```bash
pip install deai-sdk
```

## Usage

```python
from deai_sdk import DeAIClient

client = DeAIClient()

# Get available models
models = client.get_models()
print(models)

# Submit a new inference job
task = client.submit_job(
    model="gemma",
    prompt="Write a short story about a robot who discovers music."
)

print(f"Submitted job with task ID: {task.task_id}")

# Check the status
status = client.get_job_status(task.task_id)
print(f"Job status: {status.status}")

# Wait for and get the result
result = client.get_job_result(task.task_id)
print(f"Inference result: {result.result}")
```
