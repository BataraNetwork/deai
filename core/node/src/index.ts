import { PoSConsensus } from './consensus/pos';
import { startRPC } from './rpc/server';
import { startGRPC } from './grpc/server';
import { ValidatorRegistry, Validator } from './validator/registry';
import { Mempool } from './mempool/mempool'; // Import Mempool

// Initial validators
const initialValidators: Validator[] = [
    { publicKey: '0xValidator1PublicKey', stake: 100 },
    { publicKey: '0xValidator2PublicKey', stake: 50 },
    { publicKey: '0xValidator3PublicKey', stake: 200 },
];

const validatorRegistry = new ValidatorRegistry(initialValidators);
const mempool = new Mempool(); // Create an instance of Mempool
const consensus = new PoSConsensus(validatorRegistry.getValidators(), mempool);

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
startRPC(validatorRegistry);

// Start the gRPC server, now with consensus and mempool module integration
startGRPC(validatorRegistry, consensus, mempool);
