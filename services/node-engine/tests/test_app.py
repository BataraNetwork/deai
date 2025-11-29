from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import uuid

from node_engine.app import app

# Initialize the TestClient with our FastAPI app
client = TestClient(app)

def test_health_check():
    """
    Tests the /health endpoint.
    """
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_read_root():
    """
    Tests the root (/) endpoint.
    """
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to the Node Engine"}

@patch('node_engine.main.routes.generate_text_task')
def test_submit_generation_success(mock_generate_text_task):
    """
    Tests the successful submission of a generation task.
    We mock the celery task to verify it was called correctly.
    """
    # Configure the mock to return a mock result with a task_id
    mock_task_id = str(uuid.uuid4())
    mock_async_result = MagicMock()
    mock_async_result.id = mock_task_id
    mock_generate_text_task.delay.return_value = mock_async_result

    # Define the request payload
    payload = {
        "prompt": "Hello, world!",
        "model": "gemma",
        "temperature": 0.8,
        "max_new_tokens": 100
    }

    # Make the request to the /generate endpoint
    response = client.post("/generate", json=payload)

    # Assert the HTTP response is correct
    assert response.status_code == 202  # Accepted
    response_data = response.json()
    assert response_data["task_id"] == mock_task_id
    assert f"/result/{mock_task_id}" in response_data["status_url"]

    # Assert that the Celery task was called once with the correct arguments
    mock_generate_text_task.delay.assert_called_once_with(
        prompt="Hello, world!",
        model_name="gemma",
        gen_params={
            "temperature": 0.8,
            "max_new_tokens": 100
        }
    )

def test_submit_generation_invalid_model():
    """
    Tests that a 400 Bad Request is returned for an invalid model.
    """
    # Define the request payload with an invalid model
    payload = {
        "prompt": "This should fail",
        "model": "invalid-model-name"
    }

    # Make the request
    response = client.post("/generate", json=payload)

    # Assert that the status code is 400 (Bad Request)
    assert response.status_code == 400
    # Assert the detail message is correct
    response_data = response.json()
    assert "Model 'invalid-model-name' not found" in response_data["detail"]