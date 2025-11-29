import os
import asyncio
import httpx
import random
import grpc
from typing import Dict, List
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import threading

from fastapi import FastAPI, status, Request
from prometheus_fastapi_instrumentator import Instrumentator

# Load environment variables from .env file
load_dotenv()

# --- gRPC Imports ---
from services.node_engine.grpc.server import serve as grpc_serve, peers, peers_lock, _add_peers
from services.node_engine.grpc import node_pb2, node_pb2_grpc

# --- Local Imports ---
from services.node_engine.main.routes import router as main_router
from services.node_engine.billing.routes import router as billing_router
from services.node_engine.main.websocket import connect_websocket, ws_client

# --- Constants ---
GRPC_PORT = os.getenv("GRPC_PORT", "50051")

# --- Dynamic Peer Discovery (gRPC based) ---
def bootstrap_to_mesh():
    """
    Connects to the gRPC-based peer-to-peer network.
    It uses PEER_NODES from .env as initial bootstrap points.
    """
    bootstrap_nodes_str = os.getenv("PEER_NODES", "")
    if not bootstrap_nodes_str:
        print("No bootstrap PEER_NODES found. Running in standalone mode.")
        return

    bootstrap_peers = [peer.strip() for peer in bootstrap_nodes_str.split(',')]
    my_address = f"localhost:{GRPC_PORT}" # Assuming local development

    for peer_address in bootstrap_peers:
        print(f"Attempting to bootstrap with peer: {peer_address}")
        try:
            with grpc.insecure_channel(peer_address) as channel:
                stub = node_pb2_grpc.NodeStub(channel)
                request = node_pb2.AnnouncePeerRequest(address=my_address)
                
                response = stub.AnnouncePeer(request, timeout=5)
                
                print(f"Successfully bootstrapped with {peer_address}. Discovering network...")
                discovered_peers = list(response.peers)
                
                _add_peers(discovered_peers)
                _add_peers([my_address, peer_address])
                return

        except grpc.RpcError as e:
            print(f"Failed to connect to bootstrap peer {peer_address}: {e.details()}")
    
    print("Could not connect to any bootstrap peers.")


# --- App Lifecycle ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Handles application startup and shutdown events.
    """
    print("FastAPI server starting...")

    grpc_thread = threading.Thread(target=grpc_serve, daemon=True)
    grpc_thread.start()

    bootstrap_thread = threading.Thread(target=bootstrap_to_mesh, daemon=True)
    bootstrap_thread.start()

    yield
    
    print("FastAPI server shutting down...")
    if ws_client:
        ws_client.close()

# --- FastAPI App Initialization ---
app = FastAPI(lifespan=lifespan)

# --- Prometheus Metrics ---
# Instrument the app with default metrics.
instrumentator = Instrumentator().instrument(app)

@app.on_event("startup")
async def startup():
    # Expose the /metrics endpoint.
    instrumentator.expose(app)


# --- Standard Endpoints ---
@app.get("/health", status_code=status.HTTP_200_OK)
def health_check():
    return {"status": "ok"}

@app.get("/")
def read_root():
    return {"message": "Welcome to the Node Engine"}

# --- Gateway Mesh Endpoints ---
@app.get("/nodes", status_code=status.HTTP_200_OK)
def get_nodes() -> Dict[str, List[str]]:
    """
    Returns the current list of known peer nodes from the dynamic gRPC peer set.
    """
    with peers_lock:
        http_peers = [f"http://{peer.split(':')[0]}:8000" for peer in peers]
            
    return {"nodes": http_peers}

@app.post("/proxy-inference")
async def proxy_inference(request: Request):
    """
    Proxies an inference request to a randomly selected healthy node from the gRPC peer list.
    """
    with peers_lock:
        if not peers:
            return {"error": "No healthy nodes available"}, status.HTTP_503_SERVICE_UNAVAILABLE
        http_peers = [f"http://{peer.split(':')[0]}:8000" for peer in peers]
        target_node_url = random.choice(http_peers)

    body = await request.json()
    print(f"Proxying inference request to random mesh node: {target_node_url}")

    async with httpx.AsyncClient(timeout=300) as client:
        try:
            response = await client.post(f"{target_node_url}/generate", json=body)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            print(f"Error from target node {target_node_url}: {e.response.text}")
            return e.response.json(), e.response.status_code
        except httpx.RequestError as e:
            print(f"Failed to proxy request to {target_node_url}: {e}")
            return {"error": f"Failed to proxy to node {target_node_url}"}, status.HTTP_502_BAD_GATEWAY


# --- API Routers ---
app.include_router(main_router)       # Includes local generation endpoints
app.include_router(billing_router)    # Includes Stripe payment endpoints
