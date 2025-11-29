import grpc
import sys
from pathlib import Path

# Add the services directory to the Python path
sys.path.append(str(Path(__file__).parent / 'services' / 'node-engine'))

from grpc import node_pb2
from grpc import node_pb2_grpc

def run():
    # NOTE(gRPC Python Team): .close() is possible on a channel and should be
    # used in circumstances in which the channel is not going to be used
    # anymore.
    print("Connecting to gRPC server at localhost:50051...")
    with grpc.insecure_channel('localhost:50051') as channel:
        stub = node_pb2_grpc.NodeStub(channel)
        # Announce a new peer
        print("Announcing peer: localhost:50052")
source .venv/bin/activate
python grpc_client_example.py
        response = stub.AnnouncePeer(node_pb2.AnnouncePeerRequest(peer='localhost:50052'))
    print("gRPC client received: " + response.message)
    print("Current peers: " + str(response.peers))

if __name__ == '__main__':
    run()
