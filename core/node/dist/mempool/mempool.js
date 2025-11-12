"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mempool = void 0;
const crypto_1 = require("crypto");
const ethers_1 = require("ethers");
class Mempool {
    constructor() {
        this.transactions = new Map();
    }
    /**
     * Adds and validates a new signed transaction to the mempool.
     */
    addTransaction(signedTx) {
        if (!this.isValidSignature(signedTx)) {
            console.error('Invalid signature for transaction');
            return null;
        }
        // The transaction ID is a hash of its signature to ensure uniqueness
        const txId = (0, crypto_1.createHash)('sha256').update(signedTx.signature).digest('hex');
        if (this.transactions.has(txId)) {
            return null; // Transaction already exists
        }
        const fromAddress = ethers_1.ethers.computeAddress(signedTx.publicKey);
        const newTransaction = {
            ...signedTx,
            id: txId,
            from: fromAddress,
        };
        this.transactions.set(txId, newTransaction);
        console.log(`Transaction added to mempool: ${txId.substring(0, 10)}...`);
        return newTransaction;
    }
    /**
     * Retrieves a list of transactions to be included in a block.
     */
    getTransactions(limit) {
        const txs = Array.from(this.transactions.values()).sort((a, b) => a.timestamp - b.timestamp);
        return txs.slice(0, limit);
    }
    /**
     * Removes transactions from the mempool (e.g., after they are mined).
     */
    removeTransactions(transactions) {
        for (const tx of transactions) {
            if (this.transactions.has(tx.id)) {
                this.transactions.delete(tx.id);
            }
        }
    }
    /**
     * Verifies the cryptographic signature of a transaction.
     */
    isValidSignature(signedTx) {
        try {
            const message = this.getTransactionDataToSign(signedTx);
            const signerAddress = ethers_1.ethers.verifyMessage(message, signedTx.signature);
            const expectedAddress = ethers_1.ethers.computeAddress(signedTx.publicKey);
            return signerAddress === expectedAddress;
        }
        catch (error) {
            console.error('Signature verification failed:', error);
            return false;
        }
    }
    /**
     * Creates a consistent, signable string from transaction data.
     */
    getTransactionDataToSign(tx) {
        return JSON.stringify({ to: tx.to, amount: tx.amount, timestamp: tx.timestamp });
    }
}
exports.Mempool = Mempool;
