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
// gateway/src/index.ts
// @ts-nocheck
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const ws_1 = require("ws");
const http_1 = __importDefault(require("http"));
const body_parser_1 = __importDefault(require("body-parser"));
const viem_1 = require("viem");
const accounts_1 = require("viem/accounts");
const chains_1 = require("viem/chains");
const uuid_1 = require("uuid");
const grpc = __importStar(require("@grpc/grpc-js"));
const node_grpc_pb_1 = require("./grpc/node_grpc_pb");
const node_pb_1 = require("./grpc/node_pb");
// --- Mock Data ---
const mockModels = [
    {
        id: 'gemma-7b',
        name: 'Gemma 7B',
        description: 'A lightweight, state-of-the-art open model from Google.',
        owner: 'Google',
        details: 'Gemma is a family of lightweight, state-of-the-art open models built from the same research and technology used to create the Gemini models.'
    },
    {
        id: 'mistral-7b',
        name: 'Mistral 7B',
        description: 'A powerful and efficient model by Mistral AI.',
        owner: 'Mistral AI',
        details: 'The Mistral 7B model is a large language model (LLM) that outperforms Llama 2 13B on all benchmarks.'
    },
    {
        id: 'llama-2-70b',
        name: 'Llama 2 70B',
        description: 'A large-scale model from Meta.',
        owner: 'Meta',
        details: 'Llama 2 is a collection of pretrained and fine-tuned large language models (LLMs) ranging in scale from 7 billion to 70 billion parameters.'
    },
];
// A map to hold clients that are web browsers, not worker nodes
const webClients = new Map();
// A map to hold pending inference requests, mapping a request ID to the client that made it
const pendingInferenceRequests = new Map(); // requestId -> clientId
const app = (0, express_1.default)();
const port = 3000;
app.use(body_parser_1.default.json()); // Middleware to parse JSON request bodies
// --- Contract Integration (viem) ---
// ABI for DeAIToken contract (replace with your actual ABI if different)
// Retrieved from artifacts/contracts/DeAIToken.sol/DeAIToken.json
const deAITokenABI = [
    {
        inputs: [],
        stateMutability: 'nonpayable',
        type: 'constructor',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'spender',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: 'allowance',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'needed',
                type: 'uint256',
            },
        ],
        name: 'ERC20InsufficientAllowance',
        type: 'error',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'sender',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: 'balance',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'needed',
                type: 'uint256',
            },
        ],
        name: 'ERC20InsufficientBalance',
        type: 'error',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'approver',
                type: 'address',
            },
        ],
        name: 'ERC20InvalidApprover',
        type: 'error',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'receiver',
                type: 'address',
            },
        ],
        name: 'ERC20InvalidReceiver',
        type: 'error',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'sender',
                type: 'address',
            },
        ],
        name: 'ERC20InvalidSender',
        type: 'error',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'spender',
                type: 'address',
            },
        ],
        name: 'ERC20InvalidSpender',
        type: 'error',
    },
    { inputs: [{ internalType: 'address', name: 'owner', type: 'address' }], name: 'OwnableInvalidOwner', type: 'error' },
    {
        inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
        name: 'OwnableUnauthorizedAccount',
        type: 'error',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'owner',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'spender',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'value',
                type: 'uint256',
            },
        ],
        name: 'Approval',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'previousOwner',
                type: 'address',
            },
            { indexed: true, internalType: 'address', name: 'newOwner', type: 'address' },
        ],
        name: 'OwnershipTransferred',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: 'address', name: 'from', type: 'address' },
            { indexed: true, internalType: 'address', name: 'to', type: 'address' },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'value',
                type: 'uint256',
            },
        ],
        name: 'Transfer',
        type: 'event',
    },
    {
        inputs: [
            { internalType: 'address', name: 'owner', type: 'address' },
            { internalType: 'address', name: 'spender', type: 'address' },
        ],
        name: 'allowance',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'address', name: 'spender', type: 'address' },
            { internalType: 'uint256', name: 'value', type: 'uint256' },
        ],
        name: 'approve',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'decimals',
        outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'address', name: 'to', type: 'address' },
            { internalType: 'uint256', name: 'amount', type: 'uint256' },
        ],
        name: 'mint',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'name',
        outputs: [{ internalType: 'string', name: '', type: 'string' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'owner',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'renounceOwnership',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'symbol',
        outputs: [{ internalType: 'string', name: '', type: 'string' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'totalSupply',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'address', name: 'to', type: 'address' },
            { internalType: 'uint256', name: 'value', type: 'uint256' },
        ],
        name: 'transfer',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'address', name: 'from', type: 'address' },
            { internalType: 'address', name: 'to', type: 'address' },
            {
                internalType: 'uint256',
                name: 'value',
                type: 'uint256',
            },
        ],
        name: 'transferFrom',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }],
        name: 'transferOwnership',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
];
const deAITokenContractAddress = (process.env.DEAI_TOKEN_CONTRACT_ADDRESS || '0x');
const rpcUrl = process.env.RPC_URL || '';
const privateKey = (process.env.PRIVATE_KEY || '0x');
if (!deAITokenContractAddress || !rpcUrl) {
    console.error('FATAL ERROR: Missing environment variables. Please set DEAI_TOKEN_CONTRACT_ADDRESS, RPC_URL, and PRIVATE_KEY.');
    process.exit(1);
}
const publicClient = (0, viem_1.createPublicClient)({
    chain: chains_1.sepolia,
    transport: (0, viem_1.http)(rpcUrl),
});
async function getDeAITokenBalance(address) {
    try {
        const balance = await publicClient.readContract({
            address: deAITokenContractAddress,
            abi: deAITokenABI,
            functionName: 'balanceOf',
            args: [address],
        });
        console.log(`Balance of ${address}: ${balance} DeAI Tokens`);
        return balance;
    }
    catch (error) {
        console.error(`Error fetching DeAI Token balance for ${address}:`, error);
        throw error;
    }
}
let account;
let walletClient;
if (privateKey !== '0x') {
    account = (0, accounts_1.privateKeyToAccount)(privateKey);
    walletClient = (0, viem_1.createWalletClient)({
        account,
        chain: chains_1.sepolia,
        transport: (0, viem_1.http)(rpcUrl),
    });
}
async function deductDeAIToken(clientAddress, amount) {
    console.log(`[Billing] Attempting to deduct ${amount} DeAI Tokens from ${clientAddress}`);
    try {
        if (walletClient && account) {
            const { request } = await publicClient.simulateContract({
                address: deAITokenContractAddress,
                abi: deAITokenABI,
                functionName: 'transferFrom',
                args: [clientAddress, account.address, amount],
                account,
            });
            const hash = await walletClient.writeContract(request);
            console.log(`[Billing] Transaction sent: ${hash}`);
        }
        else {
            console.warn('[Billing] WalletClient not configured. Cannot perform on-chain deduction.');
        }
    }
    catch (error) {
        console.error(`[Billing] Error deducting tokens for ${clientAddress}:`, error.message);
        throw error;
    }
}
// --- End Contract Integration ---
const server = http_1.default.createServer(app);
const wss = new ws_1.WebSocketServer({ server });
const activeNodes = new Map();
const rateLimits = new Map();
// --- gRPC Server Implementation ---
const nodeService = {
    getStatus(call, callback) {
        const reply = new node_pb_1.StatusReply();
        reply.setStatus('OK');
        reply.setTimestamp(Date.now());
        callback(null, reply);
    },
    listValidators(call, callback) {
        // Return an empty list for now.
        const reply = new node_pb_1.ListValidatorsResponse();
        callback(null, reply);
    },
    addValidator(call, callback) {
        // Not implemented
        callback({
            code: grpc.status.UNIMPLEMENTED,
            details: 'Method not implemented.'
        });
    },
    removeValidator(call, callback) {
        // Not implemented
        callback({
            code: grpc.status.UNIMPLEMENTED,
            details: 'Method not implemented.'
        });
    },
    announcePeer(call, callback) {
        const address = call.request.getAddress();
        console.log(`Received announcement from peer: ${address}`);
        const reply = new node_pb_1.AnnouncePeerResponse();
        reply.setMessage(`Received announcement from ${address}`);
        reply.setCurrentPeersList([address]);
        callback(null, reply);
    },
    syncValidatorUpdate(call, callback) {
        // Not implemented
        callback({
            code: grpc.status.UNIMPLEMENTED,
            details: 'Method not implemented.'
        });
    },
    gossipPeers(call, callback) {
        const fromAddress = call.request.getFromAddress();
        const peers = call.request.getPeersList();
        console.log(`Received gossip from ${fromAddress} with peers: `, peers);
        const reply = new node_pb_1.GossipPeersResponse();
        reply.setMessage("Thanks for the gossip!");
        reply.setKnownPeersList(Array.from(activeNodes.keys()));
        callback(null, reply);
    },
    announceBlock(call, callback) {
        // Not implemented
        callback({
            code: grpc.status.UNIMPLEMENTED,
            details: 'Method not implemented.'
        });
    },
    getChain(call, callback) {
        const reply = new node_pb_1.GetChainResponse();
        const block = new node_pb_1.BlockMessage();
        block.setHeight(0);
        block.setTimestamp(Date.now());
        block.setValidator('genesis');
        block.setParenthash('0');
        block.setHash('0');
        reply.addBlocks(block);
        callback(null, reply);
    },
    submitTransaction(call, callback) {
        const transaction = call.request;
        console.log('Received transaction:', transaction.toObject());
        const reply = new node_pb_1.SubmitTransactionResponse();
        reply.setTransactionId(transaction.getSignature());
        reply.setMessage('Transaction received');
        callback(null, reply);
    },
    announceTransaction(call, callback) {
        // Not implemented
        callback({
            code: grpc.status.UNIMPLEMENTED,
            details: 'Method not implemented.'
        });
    }
};
const grpcServer = new grpc.Server();
grpcServer.addService(node_grpc_pb_1.NodeService, nodeService);
grpcServer.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
        console.error(`Server error: ${err.message}`);
    }
    else {
        console.log(`gRPC Server is running on port ${port}`);
        grpcServer.start();
    }
});
// Rate limit configuration
const RATE_LIMIT_PER_CLIENT = 5;
const RATE_LIMIT_INTERVAL = 10 * 1000; // 10 seconds
const BILLING_AMOUNT = 1n; // 1 token (example amount as BigInt)
// --- API Endpoints ---
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});
app.get('/', (req, res) => {
    res.send('Hello World!');
});
// Endpoint to get all models
app.get('/api/gateway/models', (req, res) => {
    res.json(mockModels);
});
// Endpoint to get a specific model by ID
app.get('/api/gateway/models/:modelId', (req, res) => {
    const model = mockModels.find(m => m.id === req.params.modelId);
    if (model) {
        res.json(model);
    }
    else {
        res.status(404).json({ error: 'Model not found' });
    }
});
// New endpoint to check DeAI token balance
app.get('/api/balance/:address', async (req, res) => {
    const { address } = req.params;
    // Basic address validation
    if (!address || typeof address !== 'string' || !address.startsWith('0x') || address.length !== 42) {
        return res.status(400).json({ error: 'Invalid or missing Ethereum address.' });
    }
    try {
        const balance = await getDeAITokenBalance(address);
        // Convert BigInt to string for JSON serialization
        res.json({ address, balance: balance.toString() });
    }
    catch (error) {
        console.error(`API Error: Failed to get balance for ${address}`, error);
        res.status(500).json({ error: 'Failed to retrieve token balance.' });
    }
});
// New HTTP endpoint for token deduction
app.post('/deduct-token', async (req, res) => {
    const { clientAddress, amount } = req.body;
    // Basic input validation
    if (!clientAddress || typeof clientAddress !== 'string' || !clientAddress.startsWith('0x') || clientAddress.length !== 42) {
        return res.status(400).json({ error: 'Invalid clientAddress provided.' });
    }
    if (!amount || typeof amount !== 'string') {
        return res.status(400).json({ error: 'Invalid amount provided. Must be a string representation of a number.' });
    }
    try {
        const amountBigInt = BigInt(amount);
        console.log(`Received request to deduct ${amountBigInt} tokens from ${clientAddress}`);
        // Call the deduct function (which is now implemented to use WalletClient)
        await deductDeAIToken(clientAddress, amountBigInt);
        res.status(200).json({ message: 'Token deduction process initiated.' });
    }
    catch (error) {
        console.error('Error processing token deduction request:', error);
        res.status(500).json({ error: 'Failed to initiate token deduction.', details: error.message });
    }
});
// Endpoint to get the list of active nodes
app.get('/api/gateway/nodes', (req, res) => {
    const nodes = Array.from(activeNodes.values()).map(node => ({
        id: node.id,
        score: node.score,
        load: node.load,
        address: node.address
    }));
    res.json(nodes);
});
wss.on('connection', (ws, req) => {
    const clientId = (0, uuid_1.v4)();
    // Differentiate between web clients and worker nodes
    // For now, we'll assume a connection is a web client until it sends a specific 'register_node' message
    webClients.set(clientId, ws);
    console.log(`Client ${clientId} connected. Total web clients: ${webClients.size}`);
    ws.on('message', async (message) => {
        try {
            const parsedMessage = JSON.parse(message.toString());
            // A message with 'metrics' identifies a worker node
            if (parsedMessage.type === 'register_node') {
                const { address } = parsedMessage;
                if (webClients.has(clientId)) {
                    webClients.delete(clientId); // Remove from web clients
                    activeNodes.set(clientId, { id: clientId, lastPing: Date.now(), ws, address }); // Add to active nodes
                    console.log(`Client ${clientId} identified as a worker node. Active nodes: ${activeNodes.size}`);
                }
                const node = activeNodes.get(clientId);
                if (node) {
                    node.lastPing = Date.now();
                    node.score = parsedMessage.score;
                    node.load = parsedMessage.load;
                }
            }
            else if (parsedMessage.type === 'inference_request') {
                console.log(`Received inference request from client ${clientId}`);
                const { clientAddress } = parsedMessage; // Extract client address for billing
                // --- Rate Limiting ---
                const now = Date.now();
                const rateLimit = rateLimits.get(clientId) || { count: 0, lastReset: now };
                if (now - rateLimit.lastReset > RATE_LIMIT_INTERVAL) {
                    rateLimit.count = 0;
                    rateLimit.lastReset = now;
                }
                if (rateLimit.count >= RATE_LIMIT_PER_CLIENT) {
                    ws.send(JSON.stringify({ type: 'inference_failed', error: 'Rate limit exceeded. Please try again later.' }));
                    return;
                }
                rateLimit.count++;
                rateLimits.set(clientId, rateLimit);
                // --- End Rate Limiting ---
                // --- Billing Logic ---
                if (!clientAddress || typeof clientAddress !== 'string' || !clientAddress.startsWith('0x')) {
                    ws.send(JSON.stringify({ type: 'inference_failed', error: 'Invalid or missing clientAddress for billing.' }));
                    return;
                }
                try {
                    await deductDeAIToken(clientAddress, BILLING_AMOUNT);
                    console.log(`Successfully billed ${clientAddress} for ${BILLING_AMOUNT} tokens.`);
                }
                catch (billingError) {
                    console.error(`Billing failed for ${clientAddress}:`, billingError.message);
                    ws.send(JSON.stringify({ type: 'inference_failed', error: `Billing failed: ${billingError.message}` }));
                    return;
                }
                // --- End Billing Logic ---
                const bestNode = selectBestNode();
                if (bestNode) {
                    const requestId = (0, uuid_1.v4)();
                    pendingInferenceRequests.set(requestId, clientId);
                    console.log(`Routing inference request ${requestId} to node ${bestNode.id}`);
                    bestNode.ws.send(JSON.stringify({ type: 'route_inference', requestId: requestId, payload: parsedMessage.payload }));
                    ws.send(JSON.stringify({ type: 'inference_routed', toNodeId: bestNode.id }));
                }
                else {
                    ws.send(JSON.stringify({ type: 'inference_failed', error: 'No available nodes' }));
                }
            }
            else if (parsedMessage.type === 'inference_result') {
                const { requestId, payload } = parsedMessage;
                const originatingClientId = pendingInferenceRequests.get(requestId);
                if (originatingClientId) {
                    const clientWs = webClients.get(originatingClientId);
                    if (clientWs && clientWs.readyState === ws_1.WebSocket.OPEN) {
                        console.log(`Forwarding inference result for request ${requestId} to client ${originatingClientId}`);
                        clientWs.send(JSON.stringify({ type: 'inference_result', payload }));
                    }
                    else {
                        console.log(`Could not forward result for request ${requestId}. Client ${originatingClientId} not found or not open.`);
                    }
                    pendingInferenceRequests.delete(requestId); // Clean up the pending request
                }
                else {
                    console.warn(`Received inference result for unknown request ID: ${requestId}`);
                }
            }
            else {
                console.log(`Received unhandled message type from ${clientId}: ${parsedMessage.type}`);
            }
        }
        catch (error) {
            console.error(`Failed to process message from client ${clientId}:`, error);
        }
    });
    ws.on('close', () => {
        if (activeNodes.has(clientId)) {
            activeNodes.delete(clientId);
            console.log(`Worker node ${clientId} disconnected. Total active nodes: ${activeNodes.size}`);
        }
        else if (webClients.has(clientId)) {
            webClients.delete(clientId);
            console.log(`Web client ${clientId} disconnected. Total web clients: ${webClients.size}`);
        }
    });
    ws.on('error', (error) => {
        console.error(`WebSocket error for client ${clientId}:`, error);
    });
});
function selectBestNode() {
    let bestNode = undefined;
    let highestScore = -Infinity;
    let lowestLoad = Infinity;
    activeNodes.forEach(node => {
        // Only consider nodes that have reported metrics
        if (node.score !== undefined && node.load !== undefined) {
            if (bestNode === undefined || node.score > highestScore || (node.score === highestScore && node.load < lowestLoad)) {
                bestNode = node;
                highestScore = node.score;
                lowestLoad = node.load;
            }
        }
    });
    return bestNode;
}
// Node discovery and cleanup
setInterval(() => {
    const now = Date.now();
    activeNodes.forEach((node, nodeId) => {
        if (now - node.lastPing > 20000) { // Check if last ping is older than 20 seconds
            console.log(`Node ${nodeId} timed out. Removing.`);
            node.ws.terminate(); // Close the WebSocket connection
            activeNodes.delete(nodeId);
            console.log(`Total active nodes: ${activeNodes.size}`);
        }
    });
    console.log(`Periodic check: ${activeNodes.size} nodes active.`);
}, 10000); // Run every 10 seconds
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
