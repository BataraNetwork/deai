import * as grpc from '@grpc/grpc-js';
import { NodeClient } from '../grpc/node_grpc_pb';
import {
    AnnouncePeerRequest,
    GossipPeersRequest,
    SyncValidatorUpdateRequest,
    AnnounceBlockRequest,
    TransactionMessage,
    GetChainRequest,
    AnnouncePeerResponse,
    GossipPeersResponse,
    GetChainResponse
} from '../grpc/node_pb';
import { Block } from '../consensus/pos';
import { Transaction } from '../mempool/mempool'; // Changed from SignedTransaction
import { toGrpcBlock, toGrpcTransactionMessage, fromGrpcBlock } from '../utils/gprc.utils';

export class PeerManager {
    private peers: Map<string, NodeClient> = new Map();
    private ownAddress: string;

    constructor() {
        this.ownAddress = process.env.NODE_ADDRESS || 'localhost:50051';
        console.log(`PeerManager initialized with address: ${this.ownAddress}`);
    }

    connectToBootstrapPeer(address: string) {
        console.log(`Connecting to bootstrap peer at ${address}...`);
        this.addPeer(address, true);
    }

    addPeer(address: string, isBootstrap: boolean = false): string[] {
        if (address === this.ownAddress || this.peers.has(address)) {
            return Array.from(this.peers.keys());
        }

        console.log(`Adding new peer: ${address}`);
        const client = new NodeClient(address, grpc.credentials.createInsecure());
        this.peers.set(address, client);

        if (!isBootstrap) {
            const announcement = new AnnouncePeerRequest();
            announcement.setAddress(this.ownAddress);
            client.announcePeer(announcement, (err: grpc.ServiceError | null, response?: AnnouncePeerResponse) => {
                if (err) {
                    console.error(`Error announcing to peer ${address}:`, err);
                    this.peers.delete(address);
                } else if (response) {
                    console.log(`Successfully announced to peer ${address}.`);
                    response.getCurrentPeersList().forEach((peerAddress: string) => {
                        this.addPeer(peerAddress);
                    });
                }
            });
        }

        return this.getPeerAddresses();
    }

    handleGossip(fromAddress: string, peers: string[]): string[] {
        console.log(`Received gossip from ${fromAddress} with ${peers.length} peers.`);
        peers.forEach((peerAddress: string) => {
            if (peerAddress !== this.ownAddress) {
                this.addPeer(peerAddress);
            }
        });
        return this.getPeerAddresses();
    }

    broadcast(method: string, request: any, fromPeer?: string) {
        console.log(`Broadcasting ${method} to ${this.peers.size} peers...`);
        this.peers.forEach((client, address) => {
            if(address === fromPeer) return; // Don't broadcast back to the sender

            // @ts-ignore - Dynamic method call on client
            client[method](request, (err: grpc.ServiceError | null, response: any) => {
                if (err) {
                    console.error(`Error broadcasting ${method} to ${address}:`, err.details || err.message);
                }
            });
        });
    }
    
    broadcastValidatorUpdate(update: { update_type: 'ADD' | 'REMOVE', publicKey: string, stake?: number }) {
        const validatorUpdate = new SyncValidatorUpdateRequest();
        const updateType = update.update_type === 'ADD' ? SyncValidatorUpdateRequest.UpdateType.ADD : SyncValidatorUpdateRequest.UpdateType.REMOVE;
        validatorUpdate.setUpdateType(updateType);
        validatorUpdate.setPublickey(update.publicKey);
        if (update.stake !== undefined) {
            validatorUpdate.setStake(update.stake);
        }
        this.broadcast('syncValidatorUpdate', validatorUpdate);
    }

    broadcastBlock(block: Block, fromPeer?: string) {
        const blockRequest = new AnnounceBlockRequest();
        blockRequest.setBlock(toGrpcBlock(block));
        blockRequest.setFromPeer(this.ownAddress);
        this.broadcast('announceBlock', blockRequest, fromPeer);
    }

    // Changed method signature to accept the full Transaction object
    broadcastTransaction(tx: Transaction, fromPeer?: string) {
        const transactionMessage = toGrpcTransactionMessage(tx);
        this.broadcast('announceTransaction', transactionMessage, fromPeer);
    }

    getPeerAddresses(): string[] {
        return Array.from(this.peers.keys());
    }

    getChainFromPeer(peerAddress: string): Promise<Block[]> {
        return new Promise((resolve, reject) => {
            const client = this.peers.get(peerAddress);
            if (!client) {
                return reject(new Error('Peer not found'));
            }
            
            const request = new GetChainRequest();
            client.getChain(request, (err: grpc.ServiceError | null, response: GetChainResponse) => {
                if (err) {
                    return reject(err);
                }
                const chain = response.getBlocksList().map(fromGrpcBlock);
                resolve(chain);
            });
        });
    }
}
