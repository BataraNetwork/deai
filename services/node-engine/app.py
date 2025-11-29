from fastapi import FastAPI, status
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import threading

# Load environment variables from .env file
load_dotenv()

# Import the router from the main module
from services.node_engine.main.routes import router

# Import WebSocket connection functions
from services.node_engine.main.websocket import connect_websocket, ws_client

# Import the gRPC server
from services.node_engine.grpc.server import serve as grpc_serve

# --- App Lifecycle ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Handles application startup and shutdown events.
    """
    print("FastAPI server starting...")
    # Establish WebSocket connection on startup
    connect_websocket()

    # Start the gRPC server in a separate thread
    grpc_thread = threading.Thread(target=grpc_serve)
    grpc_thread.daemon = True
    grpc_thread.start()

    yield
    print("FastAPI server shutting down...")
    # Gracefully close WebSocket connection on shutdown
    if ws_client:
        ws_client.close()

# --- FastAPI App Initialization ---
# Initialize the FastAPI app with the lifespan manager
app = FastAPI(lifespan=lifespan)

# --- Health Check Endpoint ---
@app.get("/health", status_code=status.HTTP_200_OK)
def health_check():
    """
    Health check endpoint to verify service is running.
    Required for Docker health checks.
    """
    return {"status": "ok"}

# --- Include API Router ---
# Include the routes from the main module
app.include_router(router)

# Optional: Add a root endpoint for basic verification
@app.get("/")
def read_root():
    return {"message": "Welcome to the Node Engine"}