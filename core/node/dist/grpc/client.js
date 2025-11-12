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
const grpc = __importStar(require("@grpc/grpc-js"));
const protoLoader = __importStar(require("@grpc/proto-loader"));
const PROTO_PATH = __dirname + '/node.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});
const proto = grpc.loadPackageDefinition(packageDefinition);
const client = new proto.node.Node('localhost:50051', grpc.credentials.createInsecure());
const main = async () => {
    // Get Status
    client.GetStatus({}, (err, response) => {
        if (err) {
            console.error('GetStatus Error:', err.message);
            return;
        }
        console.log('GetStatus Response:', response);
    });
    // List Validators
    client.ListValidators({}, (err, response) => {
        if (err) {
            console.error('ListValidators Error:', err.message);
            return;
        }
        console.log('ListValidators Response:', response);
    });
    // Add Validator
    const newValidator = { publicKey: '0xNewValidatorPublicKey', stake: 150 };
    client.AddValidator(newValidator, (err, response) => {
        if (err) {
            console.error('AddValidator Error:', err.message);
            return;
        }
        console.log('AddValidator Response:', response);
    });
    // List Validators again to see the new one
    setTimeout(() => {
        client.ListValidators({}, (err, response) => {
            if (err) {
                console.error('ListValidators Error:', err.message);
                return;
            }
            console.log('ListValidators after Add:', response);
        });
    }, 1000);
    // Remove Validator
    setTimeout(() => {
        const validatorToRemove = { publicKey: '0xValidator1PublicKey' };
        client.RemoveValidator(validatorToRemove, (err, response) => {
            if (err) {
                console.error('RemoveValidator Error:', err.message);
                return;
            }
            console.log('RemoveValidator Response:', response);
        });
    }, 2000);
    // List Validators again to see the removed one
    setTimeout(() => {
        client.ListValidators({}, (err, response) => {
            if (err) {
                console.error('ListValidators Error:', err.message);
                return;
            }
            console.log('ListValidators after Remove:', response);
        });
    }, 3000);
};
main();
