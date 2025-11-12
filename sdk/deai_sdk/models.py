from pydantic import BaseModel
from typing import Optional, Dict, Any

class Model(BaseModel):
    """Represents an available AI model in the network."""
    name: str

class Task(BaseModel):
    """Represents a submitted inference task."""
    task_id: str

class TaskStatus(BaseModel):
    """Represents the status and result of an inference task."""
    task_id: str
    status: str
    result: Optional[Dict[str, Any]] = None
