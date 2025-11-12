#!/bin/sh

# Activate the virtual environment
source .venv/bin/activate

# Start the Celery worker
# -A points to the application module
# -l info sets the log level to info
# --pool=solo is used to ensure tasks run one at a time on a single process.
# This is important because GPU models are loaded into memory, and running
# multiple jobs in parallel on one GPU can lead to memory issues.

echo "Starting Celery worker..."
celery -A node-engine.tasks worker --loglevel=info --pool=solo
