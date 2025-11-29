
import grpc
from concurrent import futures
import time
import threading

# Import the generated gRPC files
from . import node_pb2
from . import node_pb2_grpc

# Import the gRPC health checking library
from grpc_health.v1 import health
from grpc_health.v1 import health_pb2
from grpc_health.v1 import health_pb2_grpc

# --- Global Peer State ---
# This lock and set are imported by the FastAPI app to share peer state.
peers_lock = threading.Lock()
peers = set() # A thread-safe set to store the addresses of known peers (e.g., 'localhost:50051')


def _add_peers(new_peers):
    """Safely adds multiple new peers to the set."""
    with peers_lock:
        for peer in new_peers:
            if peer not in peers:
                peers.add(peer)
                print(f"Discovered new peer: {peer}")

def _remove_peer(peer_address):
    """Safely removes a peer from the set."""
    with peers_lock:
        if peer_address in peers:
            peers.remove(peer_address)
            print(f"Removed unresponsive peer: {peer_address}")

def _probe_peer(peer_address):
    """Probes a single peer for its health status."""
    try:
        with grpc.insecure_channel(peer_address) as channel:
            health_stub = health_pb2_grpc.HealthStub(channel)
            response = health_stub.Check(health_pb2.HealthCheckRequest(service=""), timeout=2)

            if response.status != health_pb2.HealthCheckResponse.SERVING:
                _remove_peer(peer_address)
    except grpc.RpcError:
        _remove_peer(peer_address)

def _start_peer_probing():
    """Starts a background thread to periodically probe all known peers."""
    def probe_loop():
        while True:
            with peers_lock:
                current_peers = peers.copy()
            
            for peer in current_peers:
                threading.Thread(target=_probe_peer, args=(peer,), daemon=True).start()
            
            time.sleep(30) # Probe every 30 seconds

    probing_thread = threading.Thread(target=probe_loop, daemon=True)
    probing_thread.start()
    print("gRPC server started peer health probing.")

class NodeServicer(node_pb2_grpc.NodeServicer):
    """
    Implementation of the NodeServicer.
    """
    def AnnouncePeer(self, request, context):
        """
        Handles a peer announcement.
        1. Adds the announcer to its peer list.
        2. Returns its own full list of peers in response.
        """
        peer_address = request.address
        print(f"Received peer announcement from: {peer_address}")
        
        with peers_lock:
            current_peers = list(peers)
            if peer_address not in peers:
                peers.add(peer_address)
        
        return node_pb2.AnnouncePeerResponse(peers=current_peers)

def serve():
    """
    Starts the gRPC server, enables health checking, and starts peer probing.
    """
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    node_pb2_grpc.add_NodeServicer_to_server(NodeServicer(), server)

    # Setup and enable the gRPC Health Checking Protocol.
    health_servicer = health.HealthServicer()
    health_pb2_grpc.add_HealthServicer_to_server(health_servicer, server)
    health_servicer.set("", health_pb2.HealthCheckResponse.SERVING)
    health_servicer.set(node_pb2.DESCRIPTOR.services_by_name['Node'].full_name, health_pb2.HealthCheckResponse.SERVING)
    
    # Start the server.
    server.add_insecure_port('[::]:50051')
    server.start()
    print("gRPC server started on port 50051.")

    # Start background tasks.
    _start_peer_probing()

    try:
        server.wait_for_termination()
    except KeyboardInterrupt:
        print("Shutting down gRPC server.")
        server.stop(0)

if __name__ == '__main__':
    serve()
