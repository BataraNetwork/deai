"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoSConsensus = void 0;
const crypto_1 = require("crypto");
const ethers_1 = require("ethers");
const BLOCK_TRANSACTION_LIMIT = 100;
class PoSConsensus {
    constructor(validators, mempool) {
        this.chain = [];
        this.peerManager = null;
        this.validators = validators;
        this.mempool = mempool;
        this.chain.push(this.createGenesisBlock());
    }
    setPeerManager(peerManager) {
        this.peerManager = peerManager;
    }
    createGenesisBlock() {
        const genesisBlock = {
            height: 0,
            timestamp: Date.now(),
            validator: 'genesis',
            parentHash: '0',
            transactions: [],
        };
        const hash = this.calculateHash(genesisBlock);
        return { ...genesisBlock, hash };
    }
    calculateHash(block) {
        const txHashes = block.transactions.map(tx => tx.id).join('');
        const str = `${block.height}${block.timestamp}${block.validator}${block.parentHash}${txHashes}`;
        return (0, crypto_1.createHash)('sha256').update(str).digest('hex');
    }
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }
    updateValidators(validators) {
        this.validators = validators;
    }
    createBlock() {
        const latestBlock = this.getLatestBlock();
        const selectedValidator = this.selectValidator();
        if (!selectedValidator) {
            console.error('Could not select a validator.');
            return null;
        }
        const transactions = this.mempool.getTransactions(BLOCK_TRANSACTION_LIMIT);
        const newBlockData = {
            height: latestBlock.height + 1,
            timestamp: Date.now(),
            validator: selectedValidator.publicKey,
            parentHash: latestBlock.hash,
            transactions: transactions,
        };
        const hash = this.calculateHash(newBlockData);
        const newBlock = { ...newBlockData, hash };
        this.chain.push(newBlock);
        this.mempool.removeTransactions(transactions);
        console.log(`Block #${newBlock.height} created with ${transactions.length} transactions.`);
        if (this.peerManager) {
            this.peerManager.broadcastBlock(newBlock);
        }
        return newBlock;
    }
    selectValidator() {
        const totalStake = this.validators.reduce((acc, v) => acc + v.stake, 0);
        if (totalStake === 0)
            return null;
        let random = Math.random() * totalStake;
        for (const validator of this.validators) {
            random -= validator.stake;
            if (random <= 0) {
                return validator;
            }
        }
        return this.validators[this.validators.length - 1];
    }
    validateBlock(block, parentBlock) {
        if (!this.validators.find(v => v.publicKey === block.validator) && block.validator !== 'genesis') {
            return false;
        }
        const parent = parentBlock || this.chain.find(b => b.hash === block.parentHash);
        if (!parent && block.height !== 0) {
            return false;
        }
        // Verify each transaction's signature
        for (const tx of block.transactions) {
            if (!this.isValidTransactionSignature(tx)) {
                console.error(`Invalid transaction signature in block #${block.height} for tx ${tx.id}`);
                return false;
            }
        }
        const expectedHash = this.calculateHash(block);
        if (block.hash !== expectedHash) {
            return false;
        }
        return true;
    }
    isValidTransactionSignature(tx) {
        try {
            const message = JSON.stringify({ to: tx.to, amount: tx.amount, timestamp: tx.timestamp });
            const signerAddress = ethers_1.ethers.verifyMessage(message, tx.signature);
            return signerAddress === tx.from;
        }
        catch (error) {
            return false;
        }
    }
    async handleIncomingBlock(block, fromPeer) {
        const latestBlock = this.getLatestBlock();
        if (block.height > latestBlock.height) {
            if (this.peerManager) {
                const newChain = await this.peerManager.getChainFromPeer(fromPeer);
                if (newChain && this.validateChain(newChain) && newChain.length > this.chain.length) {
                    console.log('Switching to a new, longer, valid chain.');
                    this.chain = newChain;
                    const oldTxs = new Set(this.chain.flatMap(b => b.transactions.map((t) => t.id)));
                    const newTxs = new Set(newChain.flatMap(b => b.transactions.map((t) => t.id)));
                    const txsToReAdd = [...oldTxs].filter(id => !newTxs.has(id));
                    console.log(`Re-adding ${txsToReAdd.length} transactions to the mempool.`);
                }
            }
        }
        else if (this.validateBlock(block) && block.height === latestBlock.height + 1) {
            this.chain.push(block);
            this.mempool.removeTransactions(block.transactions);
            console.log(`Block #${block.height} added to the chain.`);
        }
    }
    validateChain(chain) {
        for (let i = 1; i < chain.length; i++) {
            const block = chain[i];
            const parentBlock = chain[i - 1];
            if (!this.validateBlock(block, parentBlock)) {
                return false;
            }
        }
        return true;
    }
}
exports.PoSConsensus = PoSConsensus;
