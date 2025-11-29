#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os
import importlib.util
from pathlib import Path
from typing import Dict, Any, List, Optional

from .celery_app import celery_app

# --- Global Model Registries ---
# These dictionaries will be populated on worker start.
_model_pipelines: Dict[str, Any] = {}
_model_costs: Dict[str, float] = {}

# --- Dynamic Model Loading ---

def _load_dynamic_models():
    """
    Scans the 'models' directory, dynamically imports each model's 'loader.py',
    and populates the global model registries.
    """
    models_dir = Path(__file__).parent / "models"
    if not models_dir.is_dir():
        print(f"Models directory not found at: {models_dir}")
        return

    print("--- Starting Dynamic Model Loading ---")
    for model_dir in models_dir.iterdir():
        if model_dir.is_dir():
            model_name = model_dir.name
            loader_path = model_dir / "loader.py"
            if loader_path.is_file():
                try:
                    spec = importlib.util.spec_from_file_location(f"models.{model_name}.loader", loader_path)
                    model_loader = importlib.util.module_from_spec(spec)
                    spec.loader.exec_module(model_loader)

                    # Load the model pipeline
                    _model_pipelines[model_name] = model_loader.load_model()
                    # Load the model cost
                    _model_costs[model_name] = model_loader.get_cost()

                    print(f"Successfully loaded model plugin: '{model_name}'")
                except Exception as e:
                    print(f"Failed to load model plugin '{model_name}'. Error: {e}")
    print("--- Dynamic Model Loading Finished ---")

@celery_app.on_after_configure.connect
def load_models_on_worker_start(sender, **kwargs):
    """Loads all dynamic models when the Celery worker starts."""
    _load_dynamic_models()

# --- Public Functions to Access Model Data ---

def get_available_models() -> List[str]:
    """Returns a list of names of the loaded models."""
    return list(_model_pipelines.keys())

def get_model_cost(model_name: str) -> float:
    """Returns the cost for a specific model."""
    return _model_costs.get(model_name)

def get_all_model_costs() -> Dict[str, float]:
    """Returns the entire dictionary of model costs."""
    return _model_costs

# --- Celery Task Definition ---

@celery_app.task(bind=True, name="generate_text_task")
def generate_text_task(self, prompt: str, model_name: str, temperature: float = 0.7, max_new_tokens: int = 150):
    """
    Celery task to run model inference using a dynamically loaded model.
    The signature now matches the API request for simpler invocation.
    """
    self.update_state(state='PROGRESS', meta={'status': 'Fetching model...'})

    model_pipeline = _model_pipelines.get(model_name.lower())

    if not model_pipeline:
        error_msg = f"Model '{model_name}' not loaded on this worker."
        print(error_msg)
        self.update_state(state='FAILURE', meta={'exc_type': 'ValueError', 'exc_message': error_msg})
        raise ValueError(error_msg)

    try:
        self.update_state(state='PROGRESS', meta={'status': f'Generating text with {model_name}...'})

        # Prepare generation parameters
        gen_params = {
            "temperature": temperature,
            "max_new_tokens": max_new_tokens,
        }

        # Perform the core inference task
        generated_text = model_pipeline(prompt, **gen_params)

        # The result from the pipeline might be a list with a dictionary
        if isinstance(generated_text, list) and generated_text:
            output = generated_text[0].get('generated_text', '')
        else:
            output = str(generated_text)

        return {"status": "SUCCESS", "output": output}

    except Exception as e:
        print(f"Task failed during inference for model {model_name}: {e}")
        self.update_state(
            state='FAILURE',
            meta={
                'exc_type': type(e).__name__,
                'exc_message': str(e),
                'status': 'An error occurred during text generation.'
            }
        )
        raise e
