#!/bin/sh
source .venv/bin/activate
# The module path should point to the app object inside the services directory
uvicorn services.node-engine.app:app --host 0.0.0.0 --port=${PORT:-8080} --reload
