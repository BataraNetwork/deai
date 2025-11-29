// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var node_pb = require('./node_pb.js');

function serialize_node_AddValidatorRequest(arg) {
  if (!(arg instanceof node_pb.AddValidatorRequest)) {
    throw new Error('Expected argument of type node.AddValidatorRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_node_AddValidatorRequest(buffer_arg) {
  return node_pb.AddValidatorRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_node_AddValidatorResponse(arg) {
  if (!(arg instanceof node_pb.AddValidatorResponse)) {
    throw new Error('Expected argument of type node.AddValidatorResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_node_AddValidatorResponse(buffer_arg) {
  return node_pb.AddValidatorResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_node_AnnounceBlockRequest(arg) {
  if (!(arg instanceof node_pb.AnnounceBlockRequest)) {
    throw new Error('Expected argument of type node.AnnounceBlockRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_node_AnnounceBlockRequest(buffer_arg) {
  return node_pb.AnnounceBlockRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_node_AnnounceBlockResponse(arg) {
  if (!(arg instanceof node_pb.AnnounceBlockResponse)) {
    throw new Error('Expected argument of type node.AnnounceBlockResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_node_AnnounceBlockResponse(buffer_arg) {
  return node_pb.AnnounceBlockResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_node_AnnouncePeerRequest(arg) {
  if (!(arg instanceof node_pb.AnnouncePeerRequest)) {
    throw new Error('Expected argument of type node.AnnouncePeerRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_node_AnnouncePeerRequest(buffer_arg) {
  return node_pb.AnnouncePeerRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_node_AnnouncePeerResponse(arg) {
  if (!(arg instanceof node_pb.AnnouncePeerResponse)) {
    throw new Error('Expected argument of type node.AnnouncePeerResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_node_AnnouncePeerResponse(buffer_arg) {
  return node_pb.AnnouncePeerResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_node_AnnounceTransactionResponse(arg) {
  if (!(arg instanceof node_pb.AnnounceTransactionResponse)) {
    throw new Error('Expected argument of type node.AnnounceTransactionResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_node_AnnounceTransactionResponse(buffer_arg) {
  return node_pb.AnnounceTransactionResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_node_GetChainRequest(arg) {
  if (!(arg instanceof node_pb.GetChainRequest)) {
    throw new Error('Expected argument of type node.GetChainRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_node_GetChainRequest(buffer_arg) {
  return node_pb.GetChainRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_node_GetChainResponse(arg) {
  if (!(arg instanceof node_pb.GetChainResponse)) {
    throw new Error('Expected argument of type node.GetChainResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_node_GetChainResponse(buffer_arg) {
  return node_pb.GetChainResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_node_GossipPeersRequest(arg) {
  if (!(arg instanceof node_pb.GossipPeersRequest)) {
    throw new Error('Expected argument of type node.GossipPeersRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_node_GossipPeersRequest(buffer_arg) {
  return node_pb.GossipPeersRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_node_GossipPeersResponse(arg) {
  if (!(arg instanceof node_pb.GossipPeersResponse)) {
    throw new Error('Expected argument of type node.GossipPeersResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_node_GossipPeersResponse(buffer_arg) {
  return node_pb.GossipPeersResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_node_ListValidatorsRequest(arg) {
  if (!(arg instanceof node_pb.ListValidatorsRequest)) {
    throw new Error('Expected argument of type node.ListValidatorsRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_node_ListValidatorsRequest(buffer_arg) {
  return node_pb.ListValidatorsRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_node_ListValidatorsResponse(arg) {
  if (!(arg instanceof node_pb.ListValidatorsResponse)) {
    throw new Error('Expected argument of type node.ListValidatorsResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_node_ListValidatorsResponse(buffer_arg) {
  return node_pb.ListValidatorsResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_node_RemoveValidatorRequest(arg) {
  if (!(arg instanceof node_pb.RemoveValidatorRequest)) {
    throw new Error('Expected argument of type node.RemoveValidatorRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_node_RemoveValidatorRequest(buffer_arg) {
  return node_pb.RemoveValidatorRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_node_RemoveValidatorResponse(arg) {
  if (!(arg instanceof node_pb.RemoveValidatorResponse)) {
    throw new Error('Expected argument of type node.RemoveValidatorResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_node_RemoveValidatorResponse(buffer_arg) {
  return node_pb.RemoveValidatorResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_node_StatusReply(arg) {
  if (!(arg instanceof node_pb.StatusReply)) {
    throw new Error('Expected argument of type node.StatusReply');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_node_StatusReply(buffer_arg) {
  return node_pb.StatusReply.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_node_StatusRequest(arg) {
  if (!(arg instanceof node_pb.StatusRequest)) {
    throw new Error('Expected argument of type node.StatusRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_node_StatusRequest(buffer_arg) {
  return node_pb.StatusRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_node_SubmitTransactionResponse(arg) {
  if (!(arg instanceof node_pb.SubmitTransactionResponse)) {
    throw new Error('Expected argument of type node.SubmitTransactionResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_node_SubmitTransactionResponse(buffer_arg) {
  return node_pb.SubmitTransactionResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_node_SyncValidatorUpdateRequest(arg) {
  if (!(arg instanceof node_pb.SyncValidatorUpdateRequest)) {
    throw new Error('Expected argument of type node.SyncValidatorUpdateRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_node_SyncValidatorUpdateRequest(buffer_arg) {
  return node_pb.SyncValidatorUpdateRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_node_SyncValidatorUpdateResponse(arg) {
  if (!(arg instanceof node_pb.SyncValidatorUpdateResponse)) {
    throw new Error('Expected argument of type node.SyncValidatorUpdateResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_node_SyncValidatorUpdateResponse(buffer_arg) {
  return node_pb.SyncValidatorUpdateResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_node_TransactionMessage(arg) {
  if (!(arg instanceof node_pb.TransactionMessage)) {
    throw new Error('Expected argument of type node.TransactionMessage');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_node_TransactionMessage(buffer_arg) {
  return node_pb.TransactionMessage.deserializeBinary(new Uint8Array(buffer_arg));
}


// The Node service definition.
var NodeService = exports.NodeService = {
  // ... (other RPCs are unchanged)
getStatus: {
    path: '/node.Node/GetStatus',
    requestStream: false,
    responseStream: false,
    requestType: node_pb.StatusRequest,
    responseType: node_pb.StatusReply,
    requestSerialize: serialize_node_StatusRequest,
    requestDeserialize: deserialize_node_StatusRequest,
    responseSerialize: serialize_node_StatusReply,
    responseDeserialize: deserialize_node_StatusReply,
  },
  listValidators: {
    path: '/node.Node/ListValidators',
    requestStream: false,
    responseStream: false,
    requestType: node_pb.ListValidatorsRequest,
    responseType: node_pb.ListValidatorsResponse,
    requestSerialize: serialize_node_ListValidatorsRequest,
    requestDeserialize: deserialize_node_ListValidatorsRequest,
    responseSerialize: serialize_node_ListValidatorsResponse,
    responseDeserialize: deserialize_node_ListValidatorsResponse,
  },
  addValidator: {
    path: '/node.Node/AddValidator',
    requestStream: false,
    responseStream: false,
    requestType: node_pb.AddValidatorRequest,
    responseType: node_pb.AddValidatorResponse,
    requestSerialize: serialize_node_AddValidatorRequest,
    requestDeserialize: deserialize_node_AddValidatorRequest,
    responseSerialize: serialize_node_AddValidatorResponse,
    responseDeserialize: deserialize_node_AddValidatorResponse,
  },
  removeValidator: {
    path: '/node.Node/RemoveValidator',
    requestStream: false,
    responseStream: false,
    requestType: node_pb.RemoveValidatorRequest,
    responseType: node_pb.RemoveValidatorResponse,
    requestSerialize: serialize_node_RemoveValidatorRequest,
    requestDeserialize: deserialize_node_RemoveValidatorRequest,
    responseSerialize: serialize_node_RemoveValidatorResponse,
    responseDeserialize: deserialize_node_RemoveValidatorResponse,
  },
  announcePeer: {
    path: '/node.Node/AnnouncePeer',
    requestStream: false,
    responseStream: false,
    requestType: node_pb.AnnouncePeerRequest,
    responseType: node_pb.AnnouncePeerResponse,
    requestSerialize: serialize_node_AnnouncePeerRequest,
    requestDeserialize: deserialize_node_AnnouncePeerRequest,
    responseSerialize: serialize_node_AnnouncePeerResponse,
    responseDeserialize: deserialize_node_AnnouncePeerResponse,
  },
  syncValidatorUpdate: {
    path: '/node.Node/SyncValidatorUpdate',
    requestStream: false,
    responseStream: false,
    requestType: node_pb.SyncValidatorUpdateRequest,
    responseType: node_pb.SyncValidatorUpdateResponse,
    requestSerialize: serialize_node_SyncValidatorUpdateRequest,
    requestDeserialize: deserialize_node_SyncValidatorUpdateRequest,
    responseSerialize: serialize_node_SyncValidatorUpdateResponse,
    responseDeserialize: deserialize_node_SyncValidatorUpdateResponse,
  },
  gossipPeers: {
    path: '/node.Node/GossipPeers',
    requestStream: false,
    responseStream: false,
    requestType: node_pb.GossipPeersRequest,
    responseType: node_pb.GossipPeersResponse,
    requestSerialize: serialize_node_GossipPeersRequest,
    requestDeserialize: deserialize_node_GossipPeersRequest,
    responseSerialize: serialize_node_GossipPeersResponse,
    responseDeserialize: deserialize_node_GossipPeersResponse,
  },
  announceBlock: {
    path: '/node.Node/AnnounceBlock',
    requestStream: false,
    responseStream: false,
    requestType: node_pb.AnnounceBlockRequest,
    responseType: node_pb.AnnounceBlockResponse,
    requestSerialize: serialize_node_AnnounceBlockRequest,
    requestDeserialize: deserialize_node_AnnounceBlockRequest,
    responseSerialize: serialize_node_AnnounceBlockResponse,
    responseDeserialize: deserialize_node_AnnounceBlockResponse,
  },
  getChain: {
    path: '/node.Node/GetChain',
    requestStream: false,
    responseStream: false,
    requestType: node_pb.GetChainRequest,
    responseType: node_pb.GetChainResponse,
    requestSerialize: serialize_node_GetChainRequest,
    requestDeserialize: deserialize_node_GetChainRequest,
    responseSerialize: serialize_node_GetChainResponse,
    responseDeserialize: deserialize_node_GetChainResponse,
  },
  // Submit a new, signed transaction to the network.
submitTransaction: {
    path: '/node.Node/SubmitTransaction',
    requestStream: false,
    responseStream: false,
    requestType: node_pb.TransactionMessage,
    responseType: node_pb.SubmitTransactionResponse,
    requestSerialize: serialize_node_TransactionMessage,
    requestDeserialize: deserialize_node_TransactionMessage,
    responseSerialize: serialize_node_SubmitTransactionResponse,
    responseDeserialize: deserialize_node_SubmitTransactionResponse,
  },
  // Announce a new transaction to a peer.
announceTransaction: {
    path: '/node.Node/AnnounceTransaction',
    requestStream: false,
    responseStream: false,
    requestType: node_pb.TransactionMessage,
    responseType: node_pb.AnnounceTransactionResponse,
    requestSerialize: serialize_node_TransactionMessage,
    requestDeserialize: deserialize_node_TransactionMessage,
    responseSerialize: serialize_node_AnnounceTransactionResponse,
    responseDeserialize: deserialize_node_AnnounceTransactionResponse,
  },
};

exports.NodeClient = grpc.makeGenericClientConstructor(NodeService, 'Node');
