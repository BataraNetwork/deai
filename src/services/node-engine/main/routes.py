#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os
import asyncio
from fastapi import APIRouter, Response, status, HTTPException, Request, Depends
from pydantic import BaseModel
from typing import Optional, Dict
from celery.result import AsyncResult

# --- Refactored Imports ---
# Import the dependency injector and the service class for type hinting
from ..dependencies import get_onchain_service
from ..onchain.service import OnChainService

# Import tasks and celery app
from ..tasks import (
    celery_app,
    generate_text_task,
    get_all_model_costs,
)

# --- Pydantic Models ---
class GenerateRequest(BaseModel):
    address: str
    prompt: str
    model: Optional[str] = "gemma"
    temperature: Optional[float] = 0.7
    max_new_tokens: Optional[int] = 150

class GenerateResponse(BaseModel):
    task_id: str
    status_url: str

class TaskStatusResponse(BaseModel):
    task_id: str
    status: str
    result: Optional[dict] = None

# --- Router Setup ---
router = APIRouter(prefix="/api/gateway")

# --- Health & Info Endpoints ---

@router.get("/models")
def get_models():
    """
    Returns the list of available models and their costs.
    """
    model_costs = get_all_model_costs()
    if not model_costs:
        raise HTTPException(status_code=503, detail="Models are not loaded yet. Please try again.")
    # Align with test expectations and best practices (string costs)
    return [{"name": name, "cost": str(cost)} for name, cost in model_costs.items()]

@router.get("/operator-address")
def get_operator_address():
    """
    Returns the operator's address from the environment.
    """
    operator_address = os.environ.get("OPERATOR_ADDRESS")
    if not operator_address:
        raise HTTPException(status_code=500, detail="OPERATOR_ADDRESS environment variable not set.")
    return {"address": operator_address}

# --- Core Inference Endpoint (Refactored) ---

@router.post("/generate", response_model=GenerateResponse)
async def generate_text(
    request: GenerateRequest,
    http_request: Request,
    onchain_svc: OnChainService = Depends(get_onchain_service)
):
    """
    Accepts a prompt and dispatches a text generation task after verifying
    the user has sufficient token allowance on-chain.
    """
    # 1. Verify On-Chain Payment Allowance (asynchronously)
    # Run in an executor to avoid blocking the asyncio event loop during the RPC call.
    loop = asyncio.get_running_loop()
    is_verified, message = await loop.run_in_executor(
        None,
        onchain_svc.verify_payment,
        request.address,
        request.model
    )

    if not is_verified:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=f"Payment verification failed: {message}"
        )

    # 2. If verification is successful, dispatch the generation task
    task = generate_text_task.delay(
        prompt=request.prompt,
        model_name=request.model,
        temperature=request.temperature,
        max_new_tokens=request.max_new_tokens
    )

    status_url = http_request.url_for('get_task_status', task_id=task.id)
    return GenerateResponse(task_id=task.id, status_url=str(status_url))

@router.get("/tasks/status/{task_id}", response_model=TaskStatusResponse, name="get_task_status")
def get_task_status(task_id: str):
    """
    Returns the status and result of a Celery task.
    (Path changed to be more RESTful)
    """
    task_result = AsyncResult(task_id, app=celery_app)
    
    response_data = {
        "task_id": task_id,
        "status": task_result.status,
        "result": None,
    }
    
    if task_result.successful():
        response_data["result"] = task_result.get()
    elif task_result.failed():
        response_data["result"] = {
            "error": "Task failed.",
            "details": str(task_result.info) # Celery stores exception info here
        }
        
    return response_data
