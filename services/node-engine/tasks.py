import os
import requests
from .celery_app import celery_app
from .models.gemma import GemmaModel
from .models.mistral import MistralModel

# --- Configuration ---

# The internal URL for the gateway service. The node-engine will call this to deduct tokens.
# It's configured via an environment variable for flexibility (e.g., http://localhost:8000 in dev).
GATEWAY_URL = os.environ.get("GATEWAY_INTERNAL_URL", "http://gateway:8000")
DEDUCT_ENDPOINT = f"{GATEWAY_URL}/api/internal/deduct"

# --- Model Store for the Worker ---
worker_models = {}

@celery_app.on_after_configure.connect
def load_models_on_worker_start(sender, **kwargs):
    """Load AI models into memory when the Celery worker starts."""
    print("Loading AI models for Celery worker...")
    if "gemma" not in worker_models:
        worker_models["gemma"] = GemmaModel()
        worker_models["gemma"].load()
    if "mistral" not in worker_models:
        worker_models["mistral"] = MistralModel()
        worker_models["mistral"].load()
    print(f"AI models loaded: {list(worker_models.keys())}")


# --- Celery Task Definition ---

@celery_app.task(bind=True)
def generate_text_task(self, prompt: str, model_name: str, gen_params: dict, user_address: str, model_cost: float):
    """
    Celery task to run model inference and trigger token deduction upon success.
    """
    self.update_state(state='PROGRESS', meta={'status': 'Starting model generation...'})
    
    model = worker_models.get(model_name.lower())
    
    if not model:
        error_msg = f"Model '{model_name}' not found. Available: {list(worker_models.keys())}"
        print(error_msg)
        raise ValueError(error_msg)

    try:
        # 1. Perform the core inference task
        self.update_state(state='PROGRESS', meta={'status': f'Generating text with {model_name}...'})
        generated_text = model.generate(prompt, **gen_params)

        # 2. Trigger token deduction via callback to the gateway
        print(f"Inference successful. Now attempting to deduct {model_cost} tokens from {user_address}.")
        try:
            deduction_payload = {"userAddress": user_address, "amount": model_cost}
            response = requests.post(DEDUCT_ENDPOINT, json=deduction_payload, timeout=10) # 10-second timeout
            response.raise_for_status() # Raises an HTTPError for bad responses (4xx or 5xx)
            
            print(f"Successfully deducted tokens. Gateway response: {response.json()}")

        except requests.exceptions.RequestException as deduct_err:
            # CRITICAL: The user received their result, but we failed to charge them.
            # This must be logged for manual intervention or a reconciliation process.
            print(f"CRITICAL ERROR: Failed to deduct tokens for user {user_address}. Error: {deduct_err}")
            # Do not re-raise the exception here. The user's task succeeded, so we should still
            # return the result to them. The billing failure is an internal issue to be resolved.

        # 3. Return the final result
        return {"status": "SUCCESS", "result": generated_text}
    
    except Exception as e:
        print(f"Task failed during inference: {e}")
        self.update_state(
            state='FAILURE',
            meta={
                'exc_type': type(e).__name__,
                'exc_message': str(e),
                'status': 'An error occurred during text generation.'
            }
        )
        raise e
