import torch
from threading import Thread
from transformers import AutoTokenizer, AutoModelForCausalLM, TextIteratorStreamer
from .base import BaseModel

class MistralModel(BaseModel):
    def __init__(self, model_id="mistralai/Mistral-7B-v0.1"):
        self.model_id = model_id
        self.model = None
        self.tokenizer = None

    def load(self):
        """Loads the Mistral model and tokenizer with 4-bit quantization."""
        try:
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_id)
            self.model = AutoModelForCausalLM.from_pretrained(
                self.model_id,
                load_in_4bit=True,
                device_map="auto",
            )
            print(f"Successfully loaded model: {self.model_id} with 4-bit quantization")
            return True
        except Exception as e:
            print(f"Error loading model {self.model_id}: {e}")
            return False

    def generate(self, prompt: str, **kwargs):
        """Generates text using the Mistral model (non-streaming)."""
        if not self.model or not self.tokenizer:
            raise RuntimeError("Model is not loaded. Please call 'load' first.")

        input_ids = self.tokenizer(prompt, return_tensors="pt").to(self.model.device)

        gen_kwargs = {"max_new_tokens": 150, "temperature": 0.7, **kwargs}
        
        outputs = self.model.generate(**input_ids, **gen_kwargs)
        generated_text = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        if generated_text.startswith(prompt):
            generated_text = generated_text[len(prompt):].strip()
            
        return generated_text

    def stream(self, prompt: str, **kwargs):
        """Generates text using the Mistral model (streaming)."""
        if not self.model or not self.tokenizer:
            raise RuntimeError("Model is not loaded. Please call 'load' first.")

        streamer = TextIteratorStreamer(self.tokenizer, skip_prompt=True, skip_special_tokens=True)
        inputs = self.tokenizer(prompt, return_tensors="pt").to(self.model.device)
        
        gen_kwargs = {
            "max_new_tokens": 150,
            "temperature": 0.7,
            "streamer": streamer,
            **kwargs
        }

        # Run generation in a separate thread
        thread = Thread(target=self.model.generate, kwargs={**inputs, **gen_kwargs})
        thread.start()

        # Yield the tokens as they become available
        for new_text in streamer:
            yield new_text
