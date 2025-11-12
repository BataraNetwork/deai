import os
from celery import Celery

# Import your model classes here to avoid circular imports with app.py
# This is a common pattern for Celery with Flask/FastAPI
from .models.gemma import GemmaModel
from .models.mistral import MistralModel # Import the new model

# --- Celery Configuration ---
# Use the same Redis URL for broker and backend
REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')

celery_app = Celery(
    __name__,
    broker=REDIS_URL,
    backend=REDIS_URL
)

celery_app.conf.update(
    task_track_started=True,
)

# --- Model Store for the Worker ---
# The worker needs its own instance of the models
worker_models = {}

@celery_app.on_after_configure.connect
def load_models_on_worker_start(sender, **kwargs):
    """Load AI models when the Celery worker starts."""
    print("Loading AI models for Celery worker...")
    worker_models["gemma"] = GemmaModel()
    worker_models["gemma"].load()
    worker_models["mistral"] = MistralModel() # Add the new model
    worker_models["mistral"].load()
    print("AI models loaded successfully for Celery worker.")


# --- Celery Task Definition ---
@celery_app.task(bind=True)
def generate_text_task(self, prompt: str, model_name: str, gen_params: dict):
    """
    Celery task to run model inference in the background.
    """
    self.update_state(state='PROGRESS', meta={'status': 'Starting model generation...'})
    
    model = worker_models.get(model_name.lower())
    
    if not model:
        # This should ideally not happen if checks are done in the API endpoint
        raise ValueError(f"Model '{model_name}' not found in worker.")

    try:
        generated_text = model.generate(prompt, **gen_params)
        return {"status": "SUCCESS", "result": generated_text}
    except Exception as e:
        # The task will be marked as FAILED
        self.update_state(
            state='FAILURE',
            meta={
                'exc_type': type(e).__name__,
                'exc_message': str(e),
                'status': 'An error occurred during text generation.'
            }
        )
        # Re-raise the exception to ensure Celery marks it as a failure
        raise e
