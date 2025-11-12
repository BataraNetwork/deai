import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import * as grpc from '@grpc/grpc-js';
import { NodeClient } from './grpc/node_grpc_pb'; 
import { TransactionMessage, SubmitTransactionResponse } from './grpc/node_pb';

const WALLET_FILE = 'wallet.json';
const NODE_ADDRESS = 'localhost:50051';

const client = new NodeClient(NODE_ADDRESS, grpc.credentials.createInsecure());

function getTransactionDataToSign(tx: { to: string, amount: number, timestamp: number }): string {
    return JSON.stringify({ to: tx.to, amount: tx.amount, timestamp: tx.timestamp });
}

yargs(hideBin(process.argv))
  .command(
    'generate-wallet',
    'Generates a new wallet and saves the private key',
    () => {},
    (argv) => {
      const wallet = ethers.Wallet.createRandom();
      console.log(`Generated new wallet:`);
      console.log(`  Address: ${wallet.address}`);
      console.log(`  Private Key: ${wallet.privateKey}`);

      fs.writeFileSync(WALLET_FILE, JSON.stringify({ privateKey: wallet.privateKey, address: wallet.address }));
      console.log(`Wallet saved to ${WALLET_FILE}`);
    }
  )
  .command(
    'send-transaction <to> <amount>',
    'Sends a transaction to the specified address',
    (yargs) => {
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
      },
    async (argv) => {
        if (!fs.existsSync(WALLET_FILE)) {
            console.error(`Error: Wallet file not found. Please run 'generate-wallet' first.`);
            return;
        }

        const walletData = JSON.parse(fs.readFileSync(WALLET_FILE, 'utf8'));
        const wallet = new ethers.Wallet(walletData.privateKey);

        const txData = {
            to: argv.to, 
            amount: argv.amount,
            timestamp: Date.now(),
        };

        const messageToSign = getTransactionDataToSign(txData);
        const signature = await wallet.signMessage(messageToSign);
        
        const transaction = new TransactionMessage();
        transaction.setTo(txData.to);
        transaction.setAmount(txData.amount);
        transaction.setTimestamp(txData.timestamp);
        transaction.setPublickey(wallet.signingKey.publicKey); // Corrected case
        transaction.setSignature(signature);

        console.log('Submitting transaction...', transaction.toObject());

        client.submitTransaction(transaction, (err: grpc.ServiceError | null, response: SubmitTransactionResponse) => {
            if (err) {
                console.error('Error submitting transaction:', err.details);
                return;
            }
            console.log('Transaction submitted successfully!');
            console.log(`  Message: ${response.getMessage()}`);
            console.log(`  Tx ID: ${response.getTransactionId()}`);
        });
    }
  )
  .demandCommand(1, 'You must provide a valid command.')
  .help()
  .argv;
