from fastapi import APIRouter, Response, status, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
from celery.result import AsyncResult
from ..tasks import celery_app, generate_text_task

# --- Pydantic Models ---
class GenerateRequest(BaseModel):
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

# --- Available Models List ---
AVAILABLE_MODELS = ["gemma", "mistral"]

router = APIRouter()

@router.get("/health")
def health_check():
    """
    Checks the health of the API server.
    """
    return {"status": "ok", "available_models": AVAILABLE_MODELS}

@router.get("/health/celery")
def celery_health_check():
    """
    Checks the health of the Celery workers.
    """
    try:
        i = celery_app.control.inspect()
        stats = i.stats()
        if not stats:
            raise HTTPException(status_code=503, detail="No active Celery workers found.")
        return {"status": "ok", "workers": list(stats.keys())}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate", response_model=GenerateResponse, status_code=status.HTTP_202_ACCEPTED)
async def submit_generation(gen_request: GenerateRequest, request: Request):
    """
    Accepts a generation request and submits it to the Celery queue.
    """
    model_name = gen_request.model.lower()
    if model_name not in AVAILABLE_MODELS:
        raise HTTPException(status_code=400, detail=f"Model '{model_name}' not found. Available models: {AVAILABLE_MODELS}")

    gen_params = {
        "temperature": gen_request.temperature,
        "max_new_tokens": gen_request.max_new_tokens,
    }

    task = generate_text_task.delay(
        prompt=gen_request.prompt,
        model_name=model_name,
        gen_params=gen_params
    )

    status_url = request.url_for("get_task_status", task_id=task.id)
    return {"task_id": task.id, "status_url": str(status_url)}


@router.get("/result/{task_id}", response_model=TaskStatusResponse)
async def get_task_status(task_id: str):
    """
    Retrieves the status and result of a Celery task.
    """
    task_result = AsyncResult(task_id, app=celery_app)

    response_data = {
        "task_id": task_id,
        "status": task_result.status,
        "result": task_result.info if task_result.info else None
    }

    return response_data
