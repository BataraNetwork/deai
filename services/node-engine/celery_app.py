import os
from celery import Celery
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get broker and backend URLs from environment variables, with defaults
broker_url = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
result_backend = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")

# Initialize the Celery application
celery_app = Celery(
    "node_engine",
    broker=broker_url,
    backend=result_backend,
    include=["services.node-engine.tasks"]  # Include the tasks module
)

# Optional: Configure other Celery settings
celery_app.conf.update(
    task_track_started=True,
    result_expires=3600,  # Expire results after 1 hour
)

if __name__ == "__main__":
    # This allows running the Celery worker directly
    # Example: python -m services.node-engine.celery_app worker -l info
    celery_app.start()
