#!/bin/sh

# Start Gunicorn server in the background
gunicorn --bind 0.0.0.0:8080 "node-engine.app:app" &

# Start Celery worker
celery -A node-engine.app.celery worker --loglevel=info
