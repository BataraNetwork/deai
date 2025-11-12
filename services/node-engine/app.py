import asyncio
import json
import os
import threading
import time
import websocket
from fastapi import FastAPI, Response, status
from pydantic import BaseModel
from typing import Optional
from contextlib import asynccontextmanager
from celery.result import AsyncResult
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Import the Celery task and app instance
from .tasks import celery_app, generate_text_task

# --- WebSocket Client for Gateway Communication ---

ws_client = None

def on_message(ws, message):
    try:
        msg = json.loads(message)
        if msg.get("type") == "route_inference":
            request_id = msg.get("requestId")
            payload = msg.get("payload", {})
            prompt = payload.get("prompt")
            model_name = payload.get("model_id", "gemma") # Default to gemma

            if not prompt or not request_id:
                print("Missing prompt or request ID in inference request.")
                return

            print(f"Received inference request {request_id} for model {model_name}.")

            # Use Celery to run the task asynchronously
            task = generate_text_task.delay(prompt, model_name, {})
            
            # Note: This is a simplified approach. For robust production systems,
            # you might want to have a separate process that polls for task completion
            # and then sends the result, to avoid blocking the WebSocket thread.
            result_payload = task.get(timeout=120) # Wait for the result

            response = {
                "type": "inference_result",
                "requestId": request_id,
                "payload": result_payload,
            }
            ws.send(json.dumps(response))
            print(f"Sent inference result for request {request_id}.")

    except Exception as e:
        print(f"Error processing message: {e}")

def on_error(ws, error):
    print(f"WebSocket Error: {error}")

def on_close(ws, close_status_code, close_msg):
    print("WebSocket connection closed. Reconnecting...")
    time.sleep(5) # Wait before reconnecting
    connect_websocket()

def on_open(ws):
    print("WebSocket connection to gateway opened.")
    # Start sending metrics periodically
    def send_metrics():
        while True:
            try:
                # These metrics are just placeholders
                metrics = {
                    "type": "metrics",
                    "score": 0.95, 
                    "load": 0.1
                }
                if ws.sock and ws.sock.connected:
                    ws.send(json.dumps(metrics))
                else:
                    break # Stop if the connection is closed
                time.sleep(10) # Send metrics every 10 seconds
            except Exception as e:
                print(f"Error sending metrics: {e}")
                break
        
    threading.Thread(target=send_metrics, daemon=True).start()

def connect_websocket():
    global ws_client
    gateway_url = os.getenv("GATEWAY_WEBSOCKET_URL", "ws://localhost:3000")
    ws_client = websocket.WebSocketApp(
        gateway_url,
        on_open=on_open,
        on_message=on_message,
        on_error=on_error,
        on_close=on_close
    )
    # Run the client in a separate thread
    wst = threading.Thread(target=ws_client.run_forever)
    wst.daemon = True
    wst.start()

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
AVAILABLE_MODELS = ["gemma", "mistral"] # Add mistral here

# --- App Lifecycle ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("FastAPI server started.")
    connect_websocket()
    yield
    print("FastAPI server shutting down.")
    if ws_client:
        ws_client.close()

# --- FastAPI App Initialization ---
app = FastAPI(lifespan=lifespan)

# --- API Endpoints ---
@app.get("/health")
def health_check():
    """
    Checks the health of the API server.
    """
    return {"status": "ok", "available_models": AVAILABLE_MODELS}

@app.get("/health/celery")
def celery_health_check():
    """
    Checks the health of the Celery workers.
    """
    try:
        # Check if there are any active workers
        i = celery_app.control.inspect()
        stats = i.stats()
        if not stats:
            return {"status": "error", "message": "No active Celery workers found."}
        return {"status": "ok", "workers": list(stats.keys())}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/generate", response_model=GenerateResponse, status_code=status.HTTP_202_ACCEPTED)
async def submit_generation(request: GenerateRequest, http_response: Response):
    """
    Accepts a generation request and submits it to the Celery queue.
    """
    model_name = request.model.lower()
    if model_name not in AVAILABLE_MODELS:
        return {"error": f"Model '{model_name}' not found. Available models: {AVAILABLE_MODELS}"}, 400

    gen_params = {
        "temperature": request.temperature,
        "max_new_tokens": request.max_new_tokens,
    }

    # Queue the task
    task = generate_text_task.delay(
        prompt=request.prompt, 
        model_name=model_name, 
        gen_params=gen_params
    )

    status_url = app.url_path_for("get_task_status", task_id=task.id)
    return {"task_id": task.id, "status_url": status_url}


@app.get("/result/{task_id}", response_model=TaskStatusResponse)
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
