"""Custom exceptions for the DeAI SDK."""

class DeAIException(Exception):
    """Base exception for all DeAI SDK errors."""
    pass

class ConnectionError(DeAIException):
    """Raised when the SDK cannot connect to the DeAI network."""
    pass

class APIError(DeAIException):
    """Raised when the DeAI API returns an error response."""
    def __init__(self, status_code: int, message: str):
        self.status_code = status_code
        self.message = message
        super().__init__(f"API Error {status_code}: {message}")

class TimeoutError(DeAIException):
    """Raised when an operation times out."""
    pass
