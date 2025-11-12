"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yargs_1 = __importDefault(require("yargs"));
const helpers_1 = require("yargs/helpers");
const ethers_1 = require("ethers");
const fs_1 = __importDefault(require("fs"));
const grpc = __importStar(require("@grpc/grpc-js"));
const node_grpc_pb_1 = require("./grpc/node_grpc_pb");
const node_pb_1 = require("./grpc/node_pb");
const WALLET_FILE = 'wallet.json';
const NODE_ADDRESS = 'localhost:50051';
const client = new node_grpc_pb_1.NodeClient(NODE_ADDRESS, grpc.credentials.createInsecure());
function getTransactionDataToSign(tx) {
    return JSON.stringify({ to: tx.to, amount: tx.amount, timestamp: tx.timestamp });
}
(0, yargs_1.default)((0, helpers_1.hideBin)(process.argv))
    .command('generate-wallet', 'Generates a new wallet and saves the private key', () => { }, (argv) => {
    const wallet = ethers_1.ethers.Wallet.createRandom();
    console.log(`Generated new wallet:`);
    console.log(`  Address: ${wallet.address}`);
    console.log(`  Private Key: ${wallet.privateKey}`);
    fs_1.default.writeFileSync(WALLET_FILE, JSON.stringify({ privateKey: wallet.privateKey, address: wallet.address }));
    console.log(`Wallet saved to ${WALLET_FILE}`);
})
    .command('send-transaction <to> <amount>', 'Sends a transaction to the specified address', (yargs) => {
    return yargs
        .positional('to', {
        describe: 'Recipient address',
        type: 'string',
        demandOption: true,
    })
        .positional('amount', {
        describe: 'Amount to send',
        type: 'number',
        demandOption: true,
    });
}, async (argv) => {
    if (!fs_1.default.existsSync(WALLET_FILE)) {
        console.error(`Error: Wallet file not found. Please run 'generate-wallet' first.`);
        return;
    }
    const walletData = JSON.parse(fs_1.default.readFileSync(WALLET_FILE, 'utf8'));
    const wallet = new ethers_1.ethers.Wallet(walletData.privateKey);
    const txData = {
        to: argv.to,
        amount: argv.amount,
        timestamp: Date.now(),
    };
    const messageToSign = getTransactionDataToSign(txData);
    const signature = await wallet.signMessage(messageToSign);
    const transaction = new node_pb_1.TransactionMessage();
    transaction.setTo(txData.to);
    transaction.setAmount(txData.amount);
    transaction.setTimestamp(txData.timestamp);
    transaction.setPublickey(wallet.signingKey.publicKey); // Corrected case
    transaction.setSignature(signature);
    console.log('Submitting transaction...', transaction.toObject());
    client.submitTransaction(transaction, (err, response) => {
        if (err) {
            console.error('Error submitting transaction:', err.details);
            return;
        }
        console.log('Transaction submitted successfully!');
        console.log(`  Message: ${response.getMessage()}`);
        console.log(`  Tx ID: ${response.getTransactionId()}`);
    });
})
    .demandCommand(1, 'You must provide a valid command.')
    .help()
    .argv;
