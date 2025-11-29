#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Refactored test suite for the Node Engine FastAPI application.

This file demonstrates best practices for testing FastAPI applications with pytest,
including the use of absolute imports, mocking, and constants for test data.
"""

import os
import sys
from unittest.mock import patch, MagicMock
import pytest
from fastapi.testclient import TestClient

# FINAL ATTEMPT: Hardcode the absolute project path.
# The testing environment has proven to be unreliable in resolving module paths.
# This is a brute-force, non-portable, but necessary measure to force the import.
# The path '/home/user/deai' was derived from previous error message logs.
ABSOLUTE_PROJECT_ROOT = '/home/user/deai'
if ABSOLUTE_PROJECT_ROOT not in sys.path:
    sys.path.insert(0, ABSOLUTE_PROJECT_ROOT)

from src.services.node_engine.main import app

# --- Test Constants ---
TEST_OPERATOR_ADDRESS = "0x1234567890123456789012345678901234567890"
DEFAULT_OPERATOR_ADDRESS = "0x0000000000000000000000000000000000000000"
TEST_USER_ADDRESS_SUCCESS = "0xUserAddress1"
TEST_USER_ADDRESS_FAILURE = "0xUserAddress2"
TEST_TASK_ID = "test-task-id-12345"


# --- Fixtures ---

@pytest.fixture(scope="module")
def client() -> TestClient:
    """
    Creates a module-scoped test client for the FastAPI app.
    Sets a default operator address for the duration of the tests.
    """
    os.environ["OPERATOR_ADDRESS"] = DEFAULT_OPERATOR_ADDRESS
    with TestClient(app) as c:
        yield c
    del os.environ["OPERATOR_ADDRESS"]


# --- Test Cases ---

def test_get_models_endpoint(client: TestClient):
    """Tests the /api/gateway/models endpoint."""
    response = client.get("/api/gateway/models")
    assert response.status_code == 200
    assert response.json() == {
        "models": [
            {"name": "gemma", "cost": "10"},
            {"name": "stable-diffusion", "cost": "25"},
            {"name": "music-gen", "cost": "50"}
        ]
    }

def test_get_operator_address_endpoint(client: TestClient, monkeypatch):
    """Tests the /api/gateway/operator-address endpoint."""
    monkeypatch.setenv("OPERATOR_ADDRESS", TEST_OPERATOR_ADDRESS)
    response = client.get("/api/gateway/operator-address")
    assert response.status_code == 200
    assert response.json() == {"address": TEST_OPERATOR_ADDRESS}

@patch('src.services.node_engine.main.run_generation_task')
@patch('src.services.node_engine.main.OnChainService')
def test_generate_endpoint_success(
    MockOnChainService: MagicMock,
    mock_run_task: MagicMock,
    client: TestClient
):
    """Tests the happy path for the /api/gateway/generate endpoint."""
    mock_onchain_instance = MockOnChainService.return_value
    mock_onchain_instance.verify_payment.return_value = (True, "Payment verified.")
    mock_task_result = MagicMock()
    mock_task_result.id = TEST_TASK_ID
    mock_run_task.delay.return_value = mock_task_result
    payload = {
        "address": TEST_USER_ADDRESS_SUCCESS,
        "prompt": "A successful test prompt",
        "model": "gemma"
    }
    response = client.post("/api/gateway/generate", json=payload)
    assert response.status_code == 200
    response_data = response.json()
    assert response_data["task_id"] == TEST_TASK_ID
    assert f"/api/gateway/tasks/status/{TEST_TASK_ID}" in response_data["status_url"]
    mock_onchain_instance.verify_payment.assert_called_once_with(
        user_address=TEST_USER_ADDRESS_SUCCESS,
        model="gemma"
    )
    mock_run_task.delay.assert_called_once_with(payload)

@patch('src.services.node_engine.main.OnChainService')
def test_generate_endpoint_payment_failed(
    MockOnChainService: MagicMock,
    client: TestClient
):
    """Tests the /api/gateway/generate endpoint for a failed payment verification."""
    mock_onchain_instance = MockOnChainService.return_value
    mock_onchain_instance.verify_payment.return_value = (False, "Insufficient allowance.")
    payload = {
        "address": TEST_USER_ADDRESS_FAILURE,
        "prompt": "A failing test prompt",
        "model": "stable-diffusion"
    }
    response = client.post("/api/gateway/generate", json=payload)
    assert response.status_code == 402
    assert response.json() == {"detail": "Payment verification failed: Insufficient allowance."}
