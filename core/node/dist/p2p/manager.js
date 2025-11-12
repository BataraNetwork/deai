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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeerManager = void 0;
const grpc = __importStar(require("@grpc/grpc-js"));
const node_grpc_pb_1 = require("../grpc/node_grpc_pb");
const node_pb_1 = require("../grpc/node_pb");
const gprc_utils_1 = require("../utils/gprc.utils");
class PeerManager {
    constructor() {
        this.peers = new Map();
        this.ownAddress = process.env.NODE_ADDRESS || 'localhost:50051';
        console.log(`PeerManager initialized with address: ${this.ownAddress}`);
    }
    connectToBootstrapPeer(address) {
        console.log(`Connecting to bootstrap peer at ${address}...`);
        this.addPeer(address, true);
    }
    addPeer(address, isBootstrap = false) {
        if (address === this.ownAddress || this.peers.has(address)) {
            return Array.from(this.peers.keys());
        }
        console.log(`Adding new peer: ${address}`);
        const client = new node_grpc_pb_1.NodeClient(address, grpc.credentials.createInsecure());
        this.peers.set(address, client);
        if (!isBootstrap) {
            const announcement = new node_pb_1.AnnouncePeerRequest();
            announcement.setAddress(this.ownAddress);
            client.announcePeer(announcement, (err, response) => {
                if (err) {
                    console.error(`Error announcing to peer ${address}:`, err);
                    this.peers.delete(address);
                }
                else if (response) {
                    console.log(`Successfully announced to peer ${address}.`);
                    response.getCurrentPeersList().forEach((peerAddress) => {
                        this.addPeer(peerAddress);
                    });
                }
            });
        }
        return this.getPeerAddresses();
    }
    handleGossip(fromAddress, peers) {
        console.log(`Received gossip from ${fromAddress} with ${peers.length} peers.`);
        peers.forEach((peerAddress) => {
            if (peerAddress !== this.ownAddress) {
                this.addPeer(peerAddress);
            }
        });
        return this.getPeerAddresses();
    }
    broadcast(method, request, fromPeer) {
        console.log(`Broadcasting ${method} to ${this.peers.size} peers...`);
        this.peers.forEach((client, address) => {
            if (address === fromPeer)
                return; // Don't broadcast back to the sender
            // @ts-ignore - Dynamic method call on client
            client[method](request, (err, response) => {
                if (err) {
                    console.error(`Error broadcasting ${method} to ${address}:`, err.details || err.message);
                }
            });
        });
    }
    broadcastValidatorUpdate(update) {
        const validatorUpdate = new node_pb_1.SyncValidatorUpdateRequest();
        const updateType = update.update_type === 'ADD' ? node_pb_1.SyncValidatorUpdateRequest.UpdateType.ADD : node_pb_1.SyncValidatorUpdateRequest.UpdateType.REMOVE;
        validatorUpdate.setUpdateType(updateType);
        validatorUpdate.setPublickey(update.publicKey);
        if (update.stake !== undefined) {
            validatorUpdate.setStake(update.stake);
        }
        this.broadcast('syncValidatorUpdate', validatorUpdate);
    }
    broadcastBlock(block, fromPeer) {
        const blockRequest = new node_pb_1.AnnounceBlockRequest();
        blockRequest.setBlock((0, gprc_utils_1.toGrpcBlock)(block));
        blockRequest.setFromPeer(this.ownAddress);
        this.broadcast('announceBlock', blockRequest, fromPeer);
    }
    // Changed method signature to accept the full Transaction object
    broadcastTransaction(tx, fromPeer) {
        const transactionMessage = (0, gprc_utils_1.toGrpcTransactionMessage)(tx);
        this.broadcast('announceTransaction', transactionMessage, fromPeer);
    }
    getPeerAddresses() {
        return Array.from(this.peers.keys());
    }
    getChainFromPeer(peerAddress) {
        return new Promise((resolve, reject) => {
            const client = this.peers.get(peerAddress);
            if (!client) {
                return reject(new Error('Peer not found'));
            }
            const request = new node_pb_1.GetChainRequest();
            client.getChain(request, (err, response) => {
                if (err) {
                    return reject(err);
                }
                const chain = response.getBlocksList().map(gprc_utils_1.fromGrpcBlock);
                resolve(chain);
            });
        });
    }
}
exports.PeerManager = PeerManager;
