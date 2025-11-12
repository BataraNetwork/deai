import { BlockMessage, TransactionMessage } from '../grpc/node_pb';
import { Block } from '../consensus/pos';
import { Transaction, SignedTransaction } from '../mempool/mempool';
import { ethers } from 'ethers';
import { createHash } from 'crypto';

// Converts a native Block to a gRPC BlockMessage
export function toGrpcBlock(block: Block): BlockMessage {
    const grpcBlock = new BlockMessage();
    grpcBlock.setHeight(block.height);
    grpcBlock.setTimestamp(block.timestamp);
    grpcBlock.setValidator(block.validator);
    grpcBlock.setParenthash(block.parentHash);
    grpcBlock.setHash(block.hash);
    grpcBlock.setTransactionsList(block.transactions.map(toGrpcTransactionMessage));
    return grpcBlock;
}

// Converts a gRPC BlockMessage to a native Block
export function fromGrpcBlock(grpcBlock: BlockMessage): Block {
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
export function toGrpcTransactionMessage(tx: Transaction): TransactionMessage {
    const grpcTx = new TransactionMessage();
    grpcTx.setPublickey(tx.publicKey);
    grpcTx.setTo(tx.to);
    grpcTx.setAmount(tx.amount);
    grpcTx.setTimestamp(tx.timestamp);
    grpcTx.setSignature(tx.signature);
    return grpcTx;
}

// Converts a gRPC TransactionMessage to a fully-formed native Transaction
export function fromGrpcTransactionMessage(grpcTx: TransactionMessage): Transaction {
    const publicKey = grpcTx.getPublickey();
    const fromAddress = ethers.computeAddress(publicKey);
    const signature = grpcTx.getSignature();

    // The transaction ID is a hash of its signature, mirroring the mempool logic
    const txId = createHash('sha256').update(signature).digest('hex');

    const tx: Transaction = {
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
export function fromGrpcToSignedTransaction(grpcTx: TransactionMessage): SignedTransaction {
    return {
        to: grpcTx.getTo(),
        amount: grpcTx.getAmount(),
        timestamp: grpcTx.getTimestamp(),
        publicKey: grpcTx.getPublickey(),
        signature: grpcTx.getSignature(),
    };
}
