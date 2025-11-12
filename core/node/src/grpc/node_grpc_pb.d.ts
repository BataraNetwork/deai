// GENERATED CODE -- DO NOT EDIT!

// package: node
// file: node.proto

import * as node_pb from "./node_pb";
import * as grpc from "grpc";

interface INodeService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
  getStatus: grpc.MethodDefinition<node_pb.StatusRequest, node_pb.StatusReply>;
  listValidators: grpc.MethodDefinition<node_pb.ListValidatorsRequest, node_pb.ListValidatorsResponse>;
  addValidator: grpc.MethodDefinition<node_pb.AddValidatorRequest, node_pb.AddValidatorResponse>;
  removeValidator: grpc.MethodDefinition<node_pb.RemoveValidatorRequest, node_pb.RemoveValidatorResponse>;
  announcePeer: grpc.MethodDefinition<node_pb.AnnouncePeerRequest, node_pb.AnnouncePeerResponse>;
  syncValidatorUpdate: grpc.MethodDefinition<node_pb.SyncValidatorUpdateRequest, node_pb.SyncValidatorUpdateResponse>;
  gossipPeers: grpc.MethodDefinition<node_pb.GossipPeersRequest, node_pb.GossipPeersResponse>;
  announceBlock: grpc.MethodDefinition<node_pb.AnnounceBlockRequest, node_pb.AnnounceBlockResponse>;
  getChain: grpc.MethodDefinition<node_pb.GetChainRequest, node_pb.GetChainResponse>;
  submitTransaction: grpc.MethodDefinition<node_pb.TransactionMessage, node_pb.SubmitTransactionResponse>;
  announceTransaction: grpc.MethodDefinition<node_pb.TransactionMessage, node_pb.AnnounceTransactionResponse>;
}

export const NodeService: INodeService;

export interface INodeServer extends grpc.UntypedServiceImplementation {
  getStatus: grpc.handleUnaryCall<node_pb.StatusRequest, node_pb.StatusReply>;
  listValidators: grpc.handleUnaryCall<node_pb.ListValidatorsRequest, node_pb.ListValidatorsResponse>;
  addValidator: grpc.handleUnaryCall<node_pb.AddValidatorRequest, node_pb.AddValidatorResponse>;
  removeValidator: grpc.handleUnaryCall<node_pb.RemoveValidatorRequest, node_pb.RemoveValidatorResponse>;
  announcePeer: grpc.handleUnaryCall<node_pb.AnnouncePeerRequest, node_pb.AnnouncePeerResponse>;
  syncValidatorUpdate: grpc.handleUnaryCall<node_pb.SyncValidatorUpdateRequest, node_pb.SyncValidatorUpdateResponse>;
  gossipPeers: grpc.handleUnaryCall<node_pb.GossipPeersRequest, node_pb.GossipPeersResponse>;
  announceBlock: grpc.handleUnaryCall<node_pb.AnnounceBlockRequest, node_pb.AnnounceBlockResponse>;
  getChain: grpc.handleUnaryCall<node_pb.GetChainRequest, node_pb.GetChainResponse>;
  submitTransaction: grpc.handleUnaryCall<node_pb.TransactionMessage, node_pb.SubmitTransactionResponse>;
  announceTransaction: grpc.handleUnaryCall<node_pb.TransactionMessage, node_pb.AnnounceTransactionResponse>;
}

export class NodeClient extends grpc.Client {
  constructor(address: string, credentials: grpc.ChannelCredentials, options?: object);
  getStatus(argument: node_pb.StatusRequest, callback: grpc.requestCallback<node_pb.StatusReply>): grpc.ClientUnaryCall;
  getStatus(argument: node_pb.StatusRequest, metadataOrOptions: grpc.Metadata | grpc.CallOptions | null, callback: grpc.requestCallback<node_pb.StatusReply>): grpc.ClientUnaryCall;
  getStatus(argument: node_pb.StatusRequest, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<node_pb.StatusReply>): grpc.ClientUnaryCall;
  listValidators(argument: node_pb.ListValidatorsRequest, callback: grpc.requestCallback<node_pb.ListValidatorsResponse>): grpc.ClientUnaryCall;
  listValidators(argument: node_pb.ListValidatorsRequest, metadataOrOptions: grpc.Metadata | grpc.CallOptions | null, callback: grpc.requestCallback<node_pb.ListValidatorsResponse>): grpc.ClientUnaryCall;
  listValidators(argument: node_pb.ListValidatorsRequest, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<node_pb.ListValidatorsResponse>): grpc.ClientUnaryCall;
  addValidator(argument: node_pb.AddValidatorRequest, callback: grpc.requestCallback<node_pb.AddValidatorResponse>): grpc.ClientUnaryCall;
  addValidator(argument: node_pb.AddValidatorRequest, metadataOrOptions: grpc.Metadata | grpc.CallOptions | null, callback: grpc.requestCallback<node_pb.AddValidatorResponse>): grpc.ClientUnaryCall;
  addValidator(argument: node_pb.AddValidatorRequest, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<node_pb.AddValidatorResponse>): grpc.ClientUnaryCall;
  removeValidator(argument: node_pb.RemoveValidatorRequest, callback: grpc.requestCallback<node_pb.RemoveValidatorResponse>): grpc.ClientUnaryCall;
  removeValidator(argument: node_pb.RemoveValidatorRequest, metadataOrOptions: grpc.Metadata | grpc.CallOptions | null, callback: grpc.requestCallback<node_pb.RemoveValidatorResponse>): grpc.ClientUnaryCall;
  removeValidator(argument: node_pb.RemoveValidatorRequest, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<node_pb.RemoveValidatorResponse>): grpc.ClientUnaryCall;
  announcePeer(argument: node_pb.AnnouncePeerRequest, callback: grpc.requestCallback<node_pb.AnnouncePeerResponse>): grpc.ClientUnaryCall;
  announcePeer(argument: node_pb.AnnouncePeerRequest, metadataOrOptions: grpc.Metadata | grpc.CallOptions | null, callback: grpc.requestCallback<node_pb.AnnouncePeerResponse>): grpc.ClientUnaryCall;
  announcePeer(argument: node_pb.AnnouncePeerRequest, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<node_pb.AnnouncePeerResponse>): grpc.ClientUnaryCall;
  syncValidatorUpdate(argument: node_pb.SyncValidatorUpdateRequest, callback: grpc.requestCallback<node_pb.SyncValidatorUpdateResponse>): grpc.ClientUnaryCall;
  syncValidatorUpdate(argument: node_pb.SyncValidatorUpdateRequest, metadataOrOptions: grpc.Metadata | grpc.CallOptions | null, callback: grpc.requestCallback<node_pb.SyncValidatorUpdateResponse>): grpc.ClientUnaryCall;
  syncValidatorUpdate(argument: node_pb.SyncValidatorUpdateRequest, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<node_pb.SyncValidatorUpdateResponse>): grpc.ClientUnaryCall;
  gossipPeers(argument: node_pb.GossipPeersRequest, callback: grpc.requestCallback<node_pb.GossipPeersResponse>): grpc.ClientUnaryCall;
  gossipPeers(argument: node_pb.GossipPeersRequest, metadataOrOptions: grpc.Metadata | grpc.CallOptions | null, callback: grpc.requestCallback<node_pb.GossipPeersResponse>): grpc.ClientUnaryCall;
  gossipPeers(argument: node_pb.GossipPeersRequest, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<node_pb.GossipPeersResponse>): grpc.ClientUnaryCall;
  announceBlock(argument: node_pb.AnnounceBlockRequest, callback: grpc.requestCallback<node_pb.AnnounceBlockResponse>): grpc.ClientUnaryCall;
  announceBlock(argument: node_pb.AnnounceBlockRequest, metadataOrOptions: grpc.Metadata | grpc.CallOptions | null, callback: grpc.requestCallback<node_pb.AnnounceBlockResponse>): grpc.ClientUnaryCall;
  announceBlock(argument: node_pb.AnnounceBlockRequest, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<node_pb.AnnounceBlockResponse>): grpc.ClientUnaryCall;
  getChain(argument: node_pb.GetChainRequest, callback: grpc.requestCallback<node_pb.GetChainResponse>): grpc.ClientUnaryCall;
  getChain(argument: node_pb.GetChainRequest, metadataOrOptions: grpc.Metadata | grpc.CallOptions | null, callback: grpc.requestCallback<node_pb.GetChainResponse>): grpc.ClientUnaryCall;
  getChain(argument: node_pb.GetChainRequest, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<node_pb.GetChainResponse>): grpc.ClientUnaryCall;
  submitTransaction(argument: node_pb.TransactionMessage, callback: grpc.requestCallback<node_pb.SubmitTransactionResponse>): grpc.ClientUnaryCall;
  submitTransaction(argument: node_pb.TransactionMessage, metadataOrOptions: grpc.Metadata | grpc.CallOptions | null, callback: grpc.requestCallback<node_pb.SubmitTransactionResponse>): grpc.ClientUnaryCall;
  submitTransaction(argument: node_pb.TransactionMessage, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<node_pb.SubmitTransactionResponse>): grpc.ClientUnaryCall;
  announceTransaction(argument: node_pb.TransactionMessage, callback: grpc.requestCallback<node_pb.AnnounceTransactionResponse>): grpc.ClientUnaryCall;
  announceTransaction(argument: node_pb.TransactionMessage, metadataOrOptions: grpc.Metadata | grpc.CallOptions | null, callback: grpc.requestCallback<node_pb.AnnounceTransactionResponse>): grpc.ClientUnaryCall;
  announceTransaction(argument: node_pb.TransactionMessage, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<node_pb.AnnounceTransactionResponse>): grpc.ClientUnaryCall;
}
