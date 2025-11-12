"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pos_1 = require("./consensus/pos");
const server_1 = require("./rpc/server");
const server_2 = require("./grpc/server");
const registry_1 = require("./validator/registry");
const mempool_1 = require("./mempool/mempool"); // Import Mempool
// Initial validators
const initialValidators = [
    { publicKey: '0xValidator1PublicKey', stake: 100 },
    { publicKey: '0xValidator2PublicKey', stake: 50 },
    { publicKey: '0xValidator3PublicKey', stake: 200 },
];
const validatorRegistry = new registry_1.ValidatorRegistry(initialValidators);
const mempool = new mempool_1.Mempool(); // Create an instance of Mempool
const consensus = new pos_1.PoSConsensus(validatorRegistry.getValidators(), mempool);
// Update consensus when validator set changes
validatorRegistry.on('update', (validators) => {
    consensus.updateValidators(validators);
});
// Simulate block production
setInterval(() => {
    // The createBlock method now handles adding to the chain and broadcasting
    const newBlock = consensus.createBlock();
    if (newBlock) {
        console.log(`--- Chain length: ${consensus.chain.length} ---`);
    }
}, 10000); // Create a new block every 10 seconds
console.log('Core Node is running with PoS consensus...');
// Start the RPC server
(0, server_1.startRPC)(validatorRegistry);
// Start the gRPC server, now with consensus and mempool module integration
(0, server_2.startGRPC)(validatorRegistry, consensus, mempool);
