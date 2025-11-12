// GENERATED CODE -- DO NOT EDIT!

// package: node
// file: node.proto

import * as node_pb from "./node_pb";
import * as grpc from "grpc";

interface INodeService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
  submitTransaction: grpc.MethodDefinition<node_pb.TransactionMessage, node_pb.SubmitTransactionResponse>;
}

export const NodeService: INodeService;

export interface INodeServer extends grpc.UntypedServiceImplementation {
  submitTransaction: grpc.handleUnaryCall<node_pb.TransactionMessage, node_pb.SubmitTransactionResponse>;
}

export class NodeClient extends grpc.Client {
  constructor(address: string, credentials: grpc.ChannelCredentials, options?: object);
  submitTransaction(argument: node_pb.TransactionMessage, callback: grpc.requestCallback<node_pb.SubmitTransactionResponse>): grpc.ClientUnaryCall;
  submitTransaction(argument: node_pb.TransactionMessage, metadataOrOptions: grpc.Metadata | grpc.CallOptions | null, callback: grpc.requestCallback<node_pb.SubmitTransactionResponse>): grpc.ClientUnaryCall;
  submitTransaction(argument: node_pb.TransactionMessage, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<node_pb.SubmitTransactionResponse>): grpc.ClientUnaryCall;
}
