#!/usr/bin/env python
# -*- coding: utf-8 -*-
import torch
from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM

# --- Model Metadata ---
MODEL_ID = "google/gemma-2b-it"
COST_PER_JOB = 0.001 # USD

def get_cost() -> float:
    """Returns the cost in USD for a single job with this model."""
    return COST_PER_JOB

def load_model():
    """
    Loads the model and tokenizer from Hugging Face and returns a ready-to-use pipeline.
    This function will be called by the Celery worker when it starts.
    """
    print(f"Loading model: {MODEL_ID}")
    
    tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
    # Note: For production, you'll want to manage device placement more carefully.
    # This will use CUDA if available.
    model = AutoModelForCausalLM.from_pretrained(
        MODEL_ID, 
        device_map="auto",
        torch_dtype=torch.bfloat16
    )

    pipe = pipeline(
        "text-generation",
        model=model,
        tokenizer=tokenizer,
        model_kwargs={"torch_dtype": torch.bfloat16},
        device_map="auto",
    )
    print(f"Model {MODEL_ID} loaded successfully.")
    return pipe
