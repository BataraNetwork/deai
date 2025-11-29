
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

# A thread-safe set to store the addresses of known peers
peers_lock = threading.Lock()
peers = set()

def _remove_peer(peer_address):
    """Safely removes a peer from the set."""
    with peers_lock:
        if peer_address in peers:
            peers.remove(peer_address)
            print(f"Removed unresponsive peer: {peer_address}")

def _probe_peer(peer_address):
    """Probes a single peer for its health status."""
    try:
        # Create a channel to the peer
        with grpc.insecure_channel(peer_address) as channel:
            # Create a stub for the health checking service
            health_stub = health_pb2_grpc.HealthStub(channel)
            # Check the health of the service with a timeout.
            response = health_stub.Check(health_pb2.HealthCheckRequest(service=""), timeout=1)

            # If the peer is not serving, remove it.
            if response.status != health_pb2.HealthCheckResponse.SERVING:
                print(f"Peer {peer_address} is not serving (status: {response.status}). Removing.")
                _remove_peer(peer_address)
    except grpc.RpcError as e:
        # This catches errors like the peer being unreachable
        print(f"Error probing peer {peer_address}: {e.details()}. Removing.")
        _remove_peer(peer_address)


def _start_peer_probing():
    """Starts a background thread to periodically probe peers."""
    def probe_loop():
        while True:
            # Create a copy of the set to iterate over
            with peers_lock:
                current_peers = peers.copy()

            for peer in current_peers:
                # Probe each peer in a separate thread
                probe_thread = threading.Thread(target=_probe_peer, args=(peer,))
                probe_thread.daemon = True
                probe_thread.start()
            
            # Wait before the next probing cycle
            time.sleep(15) # Probe every 15 seconds

    probing_thread = threading.Thread(target=probe_loop)
    probing_thread.daemon = True
    probing_thread.start()
    print("Started background peer health probing.")


class NodeServicer(node_pb2_grpc.NodeServicer):
    """
    Implementation of the NodeServicer.
    """
    def AnnouncePeer(self, request, context):
        """
        Handles the AnnouncePeer RPC. Adds a new peer and returns the current list.
        """
        peer_address = request.peer
        with peers_lock:
            if peer_address not in peers:
                peers.add(peer_address)
                print(f"Announced peer: {peer_address}")
            current_peers = list(peers)

        return node_pb2.AnnouncePeerResponse(
            message=f"Peer {peer_address} announced.",
            peers=current_peers
        )


def serve():
    """
    Starts the gRPC server with health checking and peer probing.
    """
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))

    # Add the NodeServicer
    node_pb2_grpc.add_NodeServicer_to_server(NodeServicer(), server)

    # --- Health Checking Setup ---
    health_servicer = health.HealthServicer()
    health_pb2_grpc.add_HealthServicer_to_server(health_servicer, server)
    health_servicer.set("", health_pb2.HealthCheckResponse.SERVING)
    health_servicer.set(node_pb2.DESCRIPTOR.services_by_name['Node'].full_name, health_pb2.HealthCheckResponse.SERVING)
    # --- End Health Checking Setup ---

    server.add_insecure_port('[::]:50051')
    server.start()
    print("gRPC server started on port 50051 with health checking enabled.")

    _start_peer_probing()

    try:
        while True:
            time.sleep(86400)
    except KeyboardInterrupt:
        server.stop(0)
    finally:
        health_servicer.set("", health_pb2.HealthCheckResponse.NOT_SERVING)
        health_servicer.set(node_pb2.DESCRIPTOR.services_by_name['Node'].full_name, health_pb2.HealthCheckResponse.NOT_SERVING)


if __name__ == '__main__':
    serve()
