import os
import time
import requests
from typing import List, Optional

from .models import Task, TaskStatus, Model

class DeAIClient:
    def __init__(self, api_base_url: str = None):
        self.api_base_url = api_base_url or os.getenv("DEAI_API_URL", "http://localhost:8080")
        self._validate_connection()

    def _validate_connection(self):
        try:
            response = requests.get(f"{self.api_base_url}/health")
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            raise ConnectionError(f"Failed to connect to DeAI API at {self.api_base_url}. Please check the URL and ensure the service is running.") from e

    def get_models(self) -> List[Model]:
        """Retrieves a list of available models from the network."""
        response = requests.get(f"{self.api_base_url}/health")
        response.raise_for_status()
        data = response.json()
        return [Model(name=name) for name in data.get("available_models", [])]

    def submit_job(
        self, 
        model: str, 
        prompt: str, 
        temperature: float = 0.7, 
        max_new_tokens: int = 150
    ) -> Task:
        """Submits a new inference job to the network."""
        request_data = {
            "model": model,
            "prompt": prompt,
            "temperature": temperature,
            "max_new_tokens": max_new_tokens
        }
        response = requests.post(f"{self.api_base_url}/generate", json=request_data)
        response.raise_for_status()
        task_data = response.json()
        return Task(task_id=task_data["task_id"])

    def get_job_status(self, task_id: str) -> TaskStatus:
        """Retrieves the status of a specific inference job."""
        response = requests.get(f"{self.api_base_url}/result/{task_id}")
        response.raise_for_status()
        data = response.json()
        return TaskStatus(**data)

    def get_job_result(
        self, 
        task_id: str, 
        timeout: int = 120, 
        polling_interval: int = 5
    ) -> TaskStatus:
        """Waits for a job to complete and retrieves the final result."""
        start_time = time.time()
        while time.time() - start_time < timeout:
            status = self.get_job_status(task_id)
            if status.status in ["SUCCESS", "FAILURE"]:
                return status
            print(f"Job is still {status.status}... polling again in {polling_interval}s")
            time.sleep(polling_interval)
        
        raise TimeoutError(f"Job {task_id} did not complete within the {timeout} second timeout.")
