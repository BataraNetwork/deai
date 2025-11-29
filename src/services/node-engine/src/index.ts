//@ts-nocheck
// node-engine/src/index.ts
import 'dotenv/config';
import * as grpc from '@grpc/grpc-js';
import { NodeClient } from './grpc/node_grpc_pb';
import { AnnouncePeerRequest } from './grpc/node_pb';

const GATEWAY_URL = process.env.GATEWAY_URL || 'localhost:50051';
const NODE_ADDRESS = process.env.NODE_ADDRESS || 'localhost:50052';

const client = new NodeClient(GATEWAY_URL, grpc.credentials.createInsecure());

function announcePeer() {
  const request = new AnnouncePeerRequest();
  request.setAddress(NODE_ADDRESS);

  client.announcePeer(request, (error, response) => {
    if (error) {
      console.error('Error announcing peer:', error.message);
      return;
    }
    console.log('Announcement successful:', response.getMessage());
    console.log('Current peers:', response.getCurrentPeersList());
  });
}

// Announce every 10 seconds
setInterval(announcePeer, 10000);

console.log("Node engine started. Announcing to gateway at...", GATEWAY_URL);
