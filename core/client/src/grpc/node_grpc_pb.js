// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var node_pb = require('./node_pb.js');

function serialize_node_SubmitTransactionResponse(arg) {
  if (!(arg instanceof node_pb.SubmitTransactionResponse)) {
    throw new Error('Expected argument of type node.SubmitTransactionResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_node_SubmitTransactionResponse(buffer_arg) {
  return node_pb.SubmitTransactionResponse.deserializeBinary(new Uint8Array(buffer_arg));
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


var NodeService = exports.NodeService = {
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
};

exports.NodeClient = grpc.makeGenericClientConstructor(NodeService, 'Node');
