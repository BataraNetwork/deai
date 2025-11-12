"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toGrpcBlock = toGrpcBlock;
exports.fromGrpcBlock = fromGrpcBlock;
exports.toGrpcTransactionMessage = toGrpcTransactionMessage;
exports.fromGrpcTransactionMessage = fromGrpcTransactionMessage;
exports.fromGrpcToSignedTransaction = fromGrpcToSignedTransaction;
const node_pb_1 = require("../grpc/node_pb");
const ethers_1 = require("ethers");
const crypto_1 = require("crypto");
// Converts a native Block to a gRPC BlockMessage
function toGrpcBlock(block) {
    const grpcBlock = new node_pb_1.BlockMessage();
    grpcBlock.setHeight(block.height);
    grpcBlock.setTimestamp(block.timestamp);
    grpcBlock.setValidator(block.validator);
    grpcBlock.setParenthash(block.parentHash);
    grpcBlock.setHash(block.hash);
    grpcBlock.setTransactionsList(block.transactions.map(toGrpcTransactionMessage));
    return grpcBlock;
}
// Converts a gRPC BlockMessage to a native Block
function fromGrpcBlock(grpcBlock) {
    return {
        height: grpcBlock.getHeight(),
        timestamp: grpcBlock.getTimestamp(),
        validator: grpcBlock.getValidator(),
        parentHash: grpcBlock.getParenthash(),
        hash: grpcBlock.getHash(),
        transactions: grpcBlock.getTransactionsList().map(fromGrpcTransactionMessage)
    };
}
// Converts a native Transaction to a gRPC TransactionMessage
function toGrpcTransactionMessage(tx) {
    const grpcTx = new node_pb_1.TransactionMessage();
    grpcTx.setPublickey(tx.publicKey);
    grpcTx.setTo(tx.to);
    grpcTx.setAmount(tx.amount);
    grpcTx.setTimestamp(tx.timestamp);
    grpcTx.setSignature(tx.signature);
    return grpcTx;
}
// Converts a gRPC TransactionMessage to a fully-formed native Transaction
function fromGrpcTransactionMessage(grpcTx) {
    const publicKey = grpcTx.getPublickey();
    const fromAddress = ethers_1.ethers.computeAddress(publicKey);
    const signature = grpcTx.getSignature();
    // The transaction ID is a hash of its signature, mirroring the mempool logic
    const txId = (0, crypto_1.createHash)('sha256').update(signature).digest('hex');
    const tx = {
        to: grpcTx.getTo(),
        amount: grpcTx.getAmount(),
        timestamp: grpcTx.getTimestamp(),
        publicKey: publicKey,
        signature: signature,
        id: txId,
        from: fromAddress,
    };
    return tx;
}
// Converts a gRPC TransactionMessage to a SignedTransaction, for when the full Transaction object isn't needed yet
function fromGrpcToSignedTransaction(grpcTx) {
    return {
        to: grpcTx.getTo(),
        amount: grpcTx.getAmount(),
        timestamp: grpcTx.getTimestamp(),
        publicKey: grpcTx.getPublickey(),
        signature: grpcTx.getSignature(),
    };
}
