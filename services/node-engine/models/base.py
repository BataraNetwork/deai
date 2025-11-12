from abc import ABC, abstractmethod

class BaseModel(ABC):
    """
    Abstract base class for all language models.
    This defines the interface that all model plugins must implement.
    """

    @abstractmethod
    def load(self):
        """Load the model and tokenizer into memory."""
        pass

    @abstractmethod
    def generate(self, prompt: str, **kwargs):
        """Generate text from a given prompt."""
        pass
