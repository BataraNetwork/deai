// gateway/src/index.ts
// @ts-nocheck
import 'dotenv/config';
import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import bodyParser from 'body-parser';
import { createPublicClient, http as viemHttp, createWalletClient, Account, Hex, Chain } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import { v4 as uuidv4 } from 'uuid';
import * as grpc from '@grpc/grpc-js';
import { NodeService, INodeServer } from './grpc/node_grpc_pb';
import {
  AnnouncePeerRequest,
  AnnouncePeerResponse,
  BlockMessage,
  GetChainRequest,
  GetChainResponse,
  GossipPeersRequest,
  GossipPeersResponse,
  ListValidatorsRequest,
  ListValidatorsResponse,
  StatusRequest,
  StatusReply,
  SubmitTransactionResponse,
  TransactionMessage,
} from './grpc/node_pb';

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
// --- End Mock Data ---

interface Node {
  id: string;
  lastPing: number;
  score?: number;
  load?: number;
  ws: WebSocket;
  address: string;
}

// A map to hold clients that are web browsers, not worker nodes
const webClients: Map<string, WebSocket> = new Map();
// A map to hold pending inference requests, mapping a request ID to the client that made it
const pendingInferenceRequests: Map<string, string> = new Map(); // requestId -> clientId

interface RateLimit {
  count: number;
  lastReset: number;
}

const app = express();
const port = 3000;
app.use(bodyParser.json()); // Middleware to parse JSON request bodies

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
] as const; 

const deAITokenContractAddress = (process.env.DEAI_TOKEN_CONTRACT_ADDRESS || '0x') as `0x${string}`;
const rpcUrl = process.env.RPC_URL || '';
const privateKey = (process.env.PRIVATE_KEY || '0x') as Hex;

if (!deAITokenContractAddress || !rpcUrl) {
  console.error('FATAL ERROR: Missing environment variables. Please set DEAI_TOKEN_CONTRACT_ADDRESS, RPC_URL, and PRIVATE_KEY.');
  process.exit(1); 
}

const publicClient = createPublicClient({
  chain: sepolia as Chain, 
  transport: viemHttp(rpcUrl),
});

async function getDeAITokenBalance(address: `0x${string}`): Promise<bigint> {
  try {
    const balance = await publicClient.readContract({
      address: deAITokenContractAddress,
      abi: deAITokenABI,
      functionName: 'balanceOf',
      args: [address],
    });
    console.log(`Balance of ${address}: ${balance} DeAI Tokens`);
    return balance;
  } catch (error) {
    console.error(`Error fetching DeAI Token balance for ${address}:`, error);
    throw error; 
  }
}


let account: Account | undefined;
let walletClient: ReturnType<typeof createWalletClient> | undefined;

if (privateKey !== '0x') {
  account = privateKeyToAccount(privateKey);
  walletClient = createWalletClient({
    account,
    chain: sepolia as Chain, 
    transport: viemHttp(rpcUrl),
  });
}

async function deductDeAIToken(clientAddress: `0x${string}`, amount: bigint): Promise<void> {
  console.log(`[Billing] Attempting to deduct ${amount} DeAI Tokens from ${clientAddress}`);
  
  try {

    if (walletClient && account) {
        const { request } = await publicClient.simulateContract({
          address: deAITokenContractAddress,
          abi: deAITokenABI,
          functionName: 'transferFrom',
          args: [clientAddress, account.address, amount], 
          account, 
        } as any);
        const hash = await walletClient.writeContract(request as any);
        console.log(`[Billing] Transaction sent: ${hash}`);
    } else {
        console.warn('[Billing] WalletClient not configured. Cannot perform on-chain deduction.');
    }
  } catch (error) {
    console.error(`[Billing] Error deducting tokens for ${clientAddress}:`, (error as Error).message);
    
    throw error; 
  }
}

// --- End Contract Integration ---

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const activeNodes: Map<string, Node> = new Map();
const rateLimits: Map<string, RateLimit> = new Map();

// --- gRPC Server Implementation ---
const nodeService: INodeServer = {
  getStatus(call: any, callback: any) {
    const reply = new StatusReply();
    reply.setStatus('OK');
    reply.setTimestamp(Date.now());
    callback(null, reply);
  },
  listValidators(call: any, callback: any) {
    // Return an empty list for now.
    const reply = new ListValidatorsResponse();
    callback(null, reply);
  },
  addValidator(call: any, callback: any) {
    // Not implemented
    callback({
      code: grpc.status.UNIMPLEMENTED,
      details: 'Method not implemented.'
    });
  },
  removeValidator(call: any, callback: any) {
    // Not implemented
    callback({
      code: grpc.status.UNIMPLEMENTED,
      details: 'Method not implemented.'
    });
  },
  announcePeer(call: grpc.ServerUnaryCall<AnnouncePeerRequest, AnnouncePeerResponse>, callback: grpc.sendUnaryData<AnnouncePeerResponse>) {
    const address = call.request.getAddress();
    console.log(`Received announcement from peer: ${address}`);

    const reply = new AnnouncePeerResponse();
    reply.setMessage(`Received announcement from ${address}`);
    reply.setCurrentPeersList([address]); 
    callback(null, reply);
  },
  syncValidatorUpdate(call: any, callback: any) {
    // Not implemented
    callback({
      code: grpc.status.UNIMPLEMENTED,
      details: 'Method not implemented.'
    });
  },
  gossipPeers(call: grpc.ServerUnaryCall<GossipPeersRequest, GossipPeersResponse>, callback: grpc.sendUnaryData<GossipPeersResponse>) {
    const fromAddress = call.request.getFromAddress();
    const peers = call.request.getPeersList();
    console.log(`Received gossip from ${fromAddress} with peers: `, peers);

    const reply = new GossipPeersResponse();
    reply.setMessage("Thanks for the gossip!");

    reply.setKnownPeersList(Array.from(activeNodes.keys()));
    callback(null, reply);
  },
  announceBlock(call: any, callback: any) {
    // Not implemented
    callback({
      code: grpc.status.UNIMPLEMENTED,
      details: 'Method not implemented.'
    });
  },
  getChain(call: grpc.ServerUnaryCall<GetChainRequest, GetChainResponse>, callback: grpc.sendUnaryData<GetChainResponse>) {

    const reply = new GetChainResponse();
    const block = new BlockMessage();
    block.setHeight(0);
    block.setTimestamp(Date.now());
    block.setValidator('genesis');
    block.setParenthash('0');
    block.setHash('0');
    reply.addBlocks(block);
callback(null, reply);
  },
  submitTransaction(call: grpc.ServerUnaryCall<TransactionMessage, SubmitTransactionResponse>, callback: grpc.sendUnaryData<SubmitTransactionResponse>) {
    const transaction = call.request;
    console.log('Received transaction:', transaction.toObject());
    const reply = new SubmitTransactionResponse();
    reply.setTransactionId(transaction.getSignature());
    reply.setMessage('Transaction received');
    callback(null, reply);
  },
  announceTransaction(call: any, callback: any) {
    // Not implemented
    callback({
      code: grpc.status.UNIMPLEMENTED,
      details: 'Method not implemented.'
    });
  }
};

const grpcServer = new grpc.Server();
grpcServer.addService(NodeService, nodeService);
grpcServer.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) {
    console.error(`Server error: ${err.message}`);
  } else {
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
  } else {
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
    const balance = await getDeAITokenBalance(address as `0x${string}`);
    // Convert BigInt to string for JSON serialization
    res.json({ address, balance: balance.toString() });
  } catch (error) {
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
    await deductDeAIToken(clientAddress as `0x${string}`, amountBigInt);

    res.status(200).json({ message: 'Token deduction process initiated.' });
  } catch (error) {
    console.error('Error processing token deduction request:', error);
    res.status(500).json({ error: 'Failed to initiate token deduction.', details: (error as Error).message });
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

wss.on('connection', (ws: WebSocket, req) => {
  const clientId = uuidv4();
  // Differentiate between web clients and worker nodes
  // For now, we'll assume a connection is a web client until it sends a specific 'register_node' message
  webClients.set(clientId, ws);
  console.log(`Client ${clientId} connected. Total web clients: ${webClients.size}`);

  ws.on('message', async (message) => { // Make this handler async
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

      } else if (parsedMessage.type === 'inference_request') {
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
            await deductDeAIToken(clientAddress as `0x${string}`, BILLING_AMOUNT);
            console.log(`Successfully billed ${clientAddress} for ${BILLING_AMOUNT} tokens.`);
        } catch (billingError: any) {
            console.error(`Billing failed for ${clientAddress}:`, billingError.message);
            ws.send(JSON.stringify({ type: 'inference_failed', error: `Billing failed: ${billingError.message}` }));
            return;
        }
        // --- End Billing Logic ---
        
        const bestNode = selectBestNode();
        if (bestNode) {
          const requestId = uuidv4();
          pendingInferenceRequests.set(requestId, clientId);
          
          console.log(`Routing inference request ${requestId} to node ${bestNode.id}`);
          bestNode.ws.send(JSON.stringify({ type: 'route_inference', requestId: requestId, payload: parsedMessage.payload }));

          ws.send(JSON.stringify({ type: 'inference_routed', toNodeId: bestNode.id }));
        } else {
          ws.send(JSON.stringify({ type: 'inference_failed', error: 'No available nodes' }));
        }

      } else if (parsedMessage.type === 'inference_result') {
        const { requestId, payload } = parsedMessage;
        const originatingClientId = pendingInferenceRequests.get(requestId);

        if (originatingClientId) {
          const clientWs = webClients.get(originatingClientId);
          if (clientWs && clientWs.readyState === WebSocket.OPEN) {
            console.log(`Forwarding inference result for request ${requestId} to client ${originatingClientId}`);
            clientWs.send(JSON.stringify({ type: 'inference_result', payload }));
          } else {
            console.log(`Could not forward result for request ${requestId}. Client ${originatingClientId} not found or not open.`);
          }
          pendingInferenceRequests.delete(requestId); // Clean up the pending request
        } else {
          console.warn(`Received inference result for unknown request ID: ${requestId}`);
        }
      } else {
        console.log(`Received unhandled message type from ${clientId}: ${parsedMessage.type}`);
      }
    } catch (error) {
      console.error(`Failed to process message from client ${clientId}:`, error);
    }
  });

  ws.on('close', () => {
    if (activeNodes.has(clientId)) {
      activeNodes.delete(clientId);
      console.log(`Worker node ${clientId} disconnected. Total active nodes: ${activeNodes.size}`);
    } else if (webClients.has(clientId)) {
      webClients.delete(clientId);
      console.log(`Web client ${clientId} disconnected. Total web clients: ${webClients.size}`);
    }
  });

  ws.on('error', (error) => {
    console.error(`WebSocket error for client ${clientId}:`, error);
  });
});

function selectBestNode(): Node | undefined {
  let bestNode: Node | undefined = undefined;
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
