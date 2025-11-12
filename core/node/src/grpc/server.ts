import * as grpc from '@grpc/grpc-js';
import { NodeService, INodeServer } from './node_grpc_pb';
import {
    StatusRequest,
    StatusReply,
    ListValidatorsRequest,
    ListValidatorsResponse,
    AddValidatorRequest,
    AddValidatorResponse,
    RemoveValidatorRequest,
    RemoveValidatorResponse,
    AnnouncePeerRequest,
    AnnouncePeerResponse,
    SyncValidatorUpdateRequest,
    SyncValidatorUpdateResponse,
    GossipPeersRequest,
    GossipPeersResponse,
    AnnounceBlockRequest,
    AnnounceBlockResponse,
    GetChainRequest,
    GetChainResponse,
    TransactionMessage, // Used for both Submit & Announce
    SubmitTransactionResponse,
    AnnounceTransactionResponse,
    ValidatorMessage,
    BlockMessage
} from './node_pb';
import { ValidatorRegistry, Validator } from '../validator/registry';
import { PeerManager } from '../p2p/manager';
import { PoSConsensus } from '../consensus/pos';
import { Mempool } from '../mempool/mempool';
import { toGrpcBlock, fromGrpcBlock, fromGrpcToSignedTransaction } from '../utils/gprc.utils';

export const startGRPC = (
  validatorRegistry: ValidatorRegistry,
  consensus: PoSConsensus,
  mempool: Mempool
) => {
  let peerManager: PeerManager;

  const nodeServer: INodeServer = {
    getStatus(
      call: grpc.ServerUnaryCall<StatusRequest, StatusReply>,
      callback: grpc.sendUnaryData<StatusReply>
    ): void {
      const response = new StatusReply();
      response.setStatus('running');
      response.setTimestamp(Date.now());
      callback(null, response);
    },

    listValidators(
        call: grpc.ServerUnaryCall<ListValidatorsRequest, ListValidatorsResponse>,
        callback: grpc.sendUnaryData<ListValidatorsResponse>
    ): void {
        const response = new ListValidatorsResponse();
        const validators = validatorRegistry.getValidators().map(v => {
            const val = new ValidatorMessage();
            val.setPublickey(v.publicKey);
            val.setStake(v.stake);
            return val;
        });
        response.setValidatorsList(validators);
        callback(null, response);
    },

    addValidator(
        call: grpc.ServerUnaryCall<AddValidatorRequest, AddValidatorResponse>,
        callback: grpc.sendUnaryData<AddValidatorResponse>
    ): void {
        const request = call.request;
        const publicKey = request.getPublickey();
        const stake = request.getStake();

        if (!publicKey || stake === undefined) {
            return callback({
                code: grpc.status.INVALID_ARGUMENT,
                details: 'Missing publicKey or stake',
            }, null);
        }
        const newValidator: Validator = { publicKey, stake };
        validatorRegistry.addValidator(newValidator);
        peerManager.broadcastValidatorUpdate({ update_type: 'ADD', publicKey, stake });
        const response = new AddValidatorResponse();
        response.setMessage(`Validator ${publicKey} added`);
        callback(null, response);
    },

    removeValidator(
        call: grpc.ServerUnaryCall<RemoveValidatorRequest, RemoveValidatorResponse>,
        callback: grpc.sendUnaryData<RemoveValidatorResponse>
    ): void {
        const publicKey = call.request.getPublickey();
        if (!publicKey) {
            return callback({
                code: grpc.status.INVALID_ARGUMENT,
                details: 'Missing publicKey',
            }, null);
        }
        validatorRegistry.removeValidator(publicKey);
        peerManager.broadcastValidatorUpdate({ update_type: 'REMOVE', publicKey });
        const response = new RemoveValidatorResponse();
        response.setMessage(`Validator ${publicKey} removed`);
        callback(null, response);
    },
    
    announcePeer(call: grpc.ServerUnaryCall<AnnouncePeerRequest, AnnouncePeerResponse>, callback: grpc.sendUnaryData<AnnouncePeerResponse>): void {
        const address = call.request.getAddress();
        if (!address) {
            return callback({ code: grpc.status.INVALID_ARGUMENT, details: 'Missing address' }, null);
        }
        const currentPeers = peerManager.addPeer(address, false);
        const response = new AnnouncePeerResponse();
        response.setMessage(`Peer ${address} announced`);
        response.setCurrentPeersList(currentPeers);
        callback(null, response);
    },
    
    syncValidatorUpdate(call: grpc.ServerUnaryCall<SyncValidatorUpdateRequest, SyncValidatorUpdateResponse>, callback: grpc.sendUnaryData<SyncValidatorUpdateResponse>): void {
        const updateType = call.request.getUpdateType();
        const publicKey = call.request.getPublickey();
        const stake = call.request.getStake();
    
        if (updateType === undefined || !publicKey) {
            return callback({ code: grpc.status.INVALID_ARGUMENT, details: 'Invalid update payload' }, null);
        }
    
        if (updateType === SyncValidatorUpdateRequest.UpdateType.ADD) {
            validatorRegistry.addValidator({ publicKey, stake: stake || 0 });
        } else if (updateType === SyncValidatorUpdateRequest.UpdateType.REMOVE) {
            validatorRegistry.removeValidator(publicKey);
        }
    
        const response = new SyncValidatorUpdateResponse();
        response.setMessage('Validator set updated');
        callback(null, response);
    },
    
    gossipPeers(call: grpc.ServerUnaryCall<GossipPeersRequest, GossipPeersResponse>, callback: grpc.sendUnaryData<GossipPeersResponse>): void {
        const fromAddress = call.request.getFromAddress();
        const peersList = call.request.getPeersList();
    
        if (!fromAddress || !peersList) {
            return callback({ code: grpc.status.INVALID_ARGUMENT, details: 'Missing from_address or peers' }, null);
        }
    
        const knownPeers = peerManager.handleGossip(fromAddress, peersList);
        const response = new GossipPeersResponse();
        response.setMessage('Thanks for the gossip');
        response.setKnownPeersList(knownPeers);
        callback(null, response);
    },
    
    announceBlock(call: grpc.ServerUnaryCall<AnnounceBlockRequest, AnnounceBlockResponse>, callback: grpc.sendUnaryData<AnnounceBlockResponse>): void {
        const grpcBlock = call.request.getBlock();
        const fromPeer = call.request.getFromPeer();
    
        if (!grpcBlock) {
            return callback({ code: grpc.status.INVALID_ARGUMENT, details: 'Missing block data' }, null);
        }
    
        const block = fromGrpcBlock(grpcBlock);
        consensus.handleIncomingBlock(block, fromPeer || call.getPeer());
    
        const response = new AnnounceBlockResponse();
        response.setMessage('Block received');
        callback(null, response);
    },
    
    getChain(call: grpc.ServerUnaryCall<GetChainRequest, GetChainResponse>, callback: grpc.sendUnaryData<GetChainResponse>): void {
        const grpcBlocks = consensus.chain.map(toGrpcBlock);
        const response = new GetChainResponse();
        response.setBlocksList(grpcBlocks);
        callback(null, response);
    },
    
    submitTransaction(call: grpc.ServerUnaryCall<TransactionMessage, SubmitTransactionResponse>, callback: grpc.sendUnaryData<SubmitTransactionResponse>): void {
        const signedTx = fromGrpcToSignedTransaction(call.request);
    
        const newTx = mempool.addTransaction(signedTx);
        if (newTx) {
            peerManager.broadcastTransaction(newTx, call.getPeer());
            const response = new SubmitTransactionResponse();
            response.setTransactionId(newTx.id);
            response.setMessage('Transaction accepted');
            callback(null, response);
        } else {
            callback({ code: grpc.status.INVALID_ARGUMENT, details: 'Invalid or duplicate transaction' }, null);
        }
    },
    
    announceTransaction(call: grpc.ServerUnaryCall<TransactionMessage, AnnounceTransactionResponse>, callback: grpc.sendUnaryData<AnnounceTransactionResponse>): void {
        const signedTx = fromGrpcToSignedTransaction(call.request);
        const added = mempool.addTransaction(signedTx);
        if (added) {
             peerManager.broadcastTransaction(added, call.getPeer());
        }
        const response = new AnnounceTransactionResponse();
        response.setMessage('Transaction received');
        callback(null, response);
    }
  };

  const server = new grpc.Server();
  server.addService(NodeService as any, nodeServer as any);

  peerManager = new PeerManager(); 
  consensus.setPeerManager(peerManager);

  const port = process.env.NODE_ADDRESS
    ? parseInt(process.env.NODE_ADDRESS.split(':')[1])
    : 50051;

  server.bindAsync(
    `0.0.0.0:${port}`,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error(`Error starting gRPC server: ${err.message}`);
        return;
      }
      console.log(`gRPC server listening on port ${port}`);
      server.start();
    }
  );

  const BOOTSTRAP_PEER = process.env.BOOTSTRAP_PEER;
  if (BOOTSTRAP_PEER) {
    peerManager.connectToBootstrapPeer(BOOTSTRAP_PEER);
  }
};
