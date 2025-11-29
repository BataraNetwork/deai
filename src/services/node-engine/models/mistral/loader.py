#!/usr/bin/env python
# -*- coding: utf-8 -*-
import torch
from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM

# --- Model Metadata ---
MODEL_ID = "mistralai/Mistral-7B-Instruct-v0.2"
COST_PER_JOB = 0.002 # USD

def get_cost() -> float:
    """Returns the cost in USD for a single job with this model."""
    return COST_PER_JOB

def load_model():
    """
    Loads the model and tokenizer from Hugging Face and returns a ready-to-use pipeline.
    """
    print(f"Loading model: {MODEL_ID}")

    tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
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
