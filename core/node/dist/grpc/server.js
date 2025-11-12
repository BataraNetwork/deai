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
exports.startGRPC = void 0;
const grpc = __importStar(require("@grpc/grpc-js"));
const node_grpc_pb_1 = require("./node_grpc_pb");
const node_pb_1 = require("./node_pb");
const manager_1 = require("../p2p/manager");
const gprc_utils_1 = require("../utils/gprc.utils");
const startGRPC = (validatorRegistry, consensus, mempool) => {
    let peerManager;
    const nodeServer = {
        getStatus(call, callback) {
            const response = new node_pb_1.StatusReply();
            response.setStatus('running');
            response.setTimestamp(Date.now());
            callback(null, response);
        },
        listValidators(call, callback) {
            const response = new node_pb_1.ListValidatorsResponse();
            const validators = validatorRegistry.getValidators().map(v => {
                const val = new node_pb_1.ValidatorMessage();
                val.setPublickey(v.publicKey);
                val.setStake(v.stake);
                return val;
            });
            response.setValidatorsList(validators);
            callback(null, response);
        },
        addValidator(call, callback) {
            const request = call.request;
            const publicKey = request.getPublickey();
            const stake = request.getStake();
            if (!publicKey || stake === undefined) {
                return callback({
                    code: grpc.status.INVALID_ARGUMENT,
                    details: 'Missing publicKey or stake',
                }, null);
            }
            const newValidator = { publicKey, stake };
            validatorRegistry.addValidator(newValidator);
            peerManager.broadcastValidatorUpdate({ update_type: 'ADD', publicKey, stake });
            const response = new node_pb_1.AddValidatorResponse();
            response.setMessage(`Validator ${publicKey} added`);
            callback(null, response);
        },
        removeValidator(call, callback) {
            const publicKey = call.request.getPublickey();
            if (!publicKey) {
                return callback({
                    code: grpc.status.INVALID_ARGUMENT,
                    details: 'Missing publicKey',
                }, null);
            }
            validatorRegistry.removeValidator(publicKey);
            peerManager.broadcastValidatorUpdate({ update_type: 'REMOVE', publicKey });
            const response = new node_pb_1.RemoveValidatorResponse();
            response.setMessage(`Validator ${publicKey} removed`);
            callback(null, response);
        },
        announcePeer(call, callback) {
            const address = call.request.getAddress();
            if (!address) {
                return callback({ code: grpc.status.INVALID_ARGUMENT, details: 'Missing address' }, null);
            }
            const currentPeers = peerManager.addPeer(address, false);
            const response = new node_pb_1.AnnouncePeerResponse();
            response.setMessage(`Peer ${address} announced`);
            response.setCurrentPeersList(currentPeers);
            callback(null, response);
        },
        syncValidatorUpdate(call, callback) {
            const updateType = call.request.getUpdateType();
            const publicKey = call.request.getPublickey();
            const stake = call.request.getStake();
            if (updateType === undefined || !publicKey) {
                return callback({ code: grpc.status.INVALID_ARGUMENT, details: 'Invalid update payload' }, null);
            }
            if (updateType === node_pb_1.SyncValidatorUpdateRequest.UpdateType.ADD) {
                validatorRegistry.addValidator({ publicKey, stake: stake || 0 });
            }
            else if (updateType === node_pb_1.SyncValidatorUpdateRequest.UpdateType.REMOVE) {
                validatorRegistry.removeValidator(publicKey);
            }
            const response = new node_pb_1.SyncValidatorUpdateResponse();
            response.setMessage('Validator set updated');
            callback(null, response);
        },
        gossipPeers(call, callback) {
            const fromAddress = call.request.getFromAddress();
            const peersList = call.request.getPeersList();
            if (!fromAddress || !peersList) {
                return callback({ code: grpc.status.INVALID_ARGUMENT, details: 'Missing from_address or peers' }, null);
            }
            const knownPeers = peerManager.handleGossip(fromAddress, peersList);
            const response = new node_pb_1.GossipPeersResponse();
            response.setMessage('Thanks for the gossip');
            response.setKnownPeersList(knownPeers);
            callback(null, response);
        },
        announceBlock(call, callback) {
            const grpcBlock = call.request.getBlock();
            const fromPeer = call.request.getFromPeer();
            if (!grpcBlock) {
                return callback({ code: grpc.status.INVALID_ARGUMENT, details: 'Missing block data' }, null);
            }
            const block = (0, gprc_utils_1.fromGrpcBlock)(grpcBlock);
            consensus.handleIncomingBlock(block, fromPeer || call.getPeer());
            const response = new node_pb_1.AnnounceBlockResponse();
            response.setMessage('Block received');
            callback(null, response);
        },
        getChain(call, callback) {
            const grpcBlocks = consensus.chain.map(gprc_utils_1.toGrpcBlock);
            const response = new node_pb_1.GetChainResponse();
            response.setBlocksList(grpcBlocks);
            callback(null, response);
        },
        submitTransaction(call, callback) {
            const signedTx = (0, gprc_utils_1.fromGrpcToSignedTransaction)(call.request);
            const newTx = mempool.addTransaction(signedTx);
            if (newTx) {
                peerManager.broadcastTransaction(newTx, call.getPeer());
                const response = new node_pb_1.SubmitTransactionResponse();
                response.setTransactionId(newTx.id);
                response.setMessage('Transaction accepted');
                callback(null, response);
            }
            else {
                callback({ code: grpc.status.INVALID_ARGUMENT, details: 'Invalid or duplicate transaction' }, null);
            }
        },
        announceTransaction(call, callback) {
            const signedTx = (0, gprc_utils_1.fromGrpcToSignedTransaction)(call.request);
            const added = mempool.addTransaction(signedTx);
            if (added) {
                peerManager.broadcastTransaction(added, call.getPeer());
            }
            const response = new node_pb_1.AnnounceTransactionResponse();
            response.setMessage('Transaction received');
            callback(null, response);
        }
    };
    const server = new grpc.Server();
    server.addService(node_grpc_pb_1.NodeService, nodeServer);
    peerManager = new manager_1.PeerManager();
    consensus.setPeerManager(peerManager);
    const port = process.env.NODE_ADDRESS
        ? parseInt(process.env.NODE_ADDRESS.split(':')[1])
        : 50051;
    server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
        if (err) {
            console.error(`Error starting gRPC server: ${err.message}`);
            return;
        }
        console.log(`gRPC server listening on port ${port}`);
        server.start();
    });
    const BOOTSTRAP_PEER = process.env.BOOTSTRAP_PEER;
    if (BOOTSTRAP_PEER) {
        peerManager.connectToBootstrapPeer(BOOTSTRAP_PEER);
    }
};
exports.startGRPC = startGRPC;
