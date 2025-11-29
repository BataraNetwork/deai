from .models import Gemma, Mistral

AVAILABLE_MODELS = {
    "gemma": Gemma(),
    "mistral": Mistral(),
}

def get_models():
    return list(AVAILABLE_MODELS.keys())

def get_model_or_default(model_name):
    return AVAILABLE_MODELS.get(model_name.lower(), AVAILABLE_MODELS["gemma"])
