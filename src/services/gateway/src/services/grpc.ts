// @ts-nocheck
import * as grpc from "@grpc/grpc-js";
import { NodeService } from "../grpc/node_grpc_pb";
import { getStatus, listValidators } from "./node";

export function setupGrpcServer() {
  const grpcServer = new grpc.Server();
  grpcServer.addService(NodeService, {
    getStatus,
    listValidators,
    // ... other gRPC methods
  });

  grpcServer.bindAsync(
    "0.0.0.0:50051",
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error(`Server error: ${err.message}`);
      } else {
        console.log(`gRPC Server is running on port ${port}`);
        grpcServer.start();
      }
    }
  );

  return grpcServer;
}
