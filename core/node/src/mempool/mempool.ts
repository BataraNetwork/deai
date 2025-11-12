import { createHash } from 'crypto';
import { ethers } from 'ethers';

// Represents the data that is signed by the sender
export interface TransactionData {
    to: string;
    amount: number;
    timestamp: number;
}

// Represents a transaction as submitted to the network
export interface SignedTransaction extends TransactionData {
    publicKey: string;
    signature: string;
}

// Represents a transaction once it's validated and stored in the mempool
export interface Transaction extends SignedTransaction {
    id: string;
    from: string;
}

export class Mempool {
    private transactions: Map<string, Transaction> = new Map();

    /**
     * Adds and validates a new signed transaction to the mempool.
     */
    addTransaction(signedTx: SignedTransaction): Transaction | null {
        if (!this.isValidSignature(signedTx)) {
            console.error('Invalid signature for transaction');
            return null;
        }

        // The transaction ID is a hash of its signature to ensure uniqueness
        const txId = createHash('sha256').update(signedTx.signature).digest('hex');

        if (this.transactions.has(txId)) {
            return null; // Transaction already exists
        }

        const fromAddress = ethers.computeAddress(signedTx.publicKey);

        const newTransaction: Transaction = {
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
    getTransactions(limit: number): Transaction[] {
        const txs = Array.from(this.transactions.values()).sort((a, b) => a.timestamp - b.timestamp);
        return txs.slice(0, limit);
    }

    /**
     * Removes transactions from the mempool (e.g., after they are mined).
     */
    removeTransactions(transactions: Transaction[]): void {
        for (const tx of transactions) {
            if (this.transactions.has(tx.id)) {
                this.transactions.delete(tx.id);
            }
        }
    }

    /**
     * Verifies the cryptographic signature of a transaction.
     */
    private isValidSignature(signedTx: SignedTransaction): boolean {
        try {
            const message = this.getTransactionDataToSign(signedTx);
            const signerAddress = ethers.verifyMessage(message, signedTx.signature);
            const expectedAddress = ethers.computeAddress(signedTx.publicKey);
            return signerAddress === expectedAddress;
        } catch (error) {
            console.error('Signature verification failed:', error);
            return false;
        }
    }

    /**
     * Creates a consistent, signable string from transaction data.
     */
    private getTransactionDataToSign(tx: TransactionData): string {
        return JSON.stringify({ to: tx.to, amount: tx.amount, timestamp: tx.timestamp });
    }
}
