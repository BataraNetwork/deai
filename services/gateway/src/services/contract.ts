// @ts-nocheck
import {
  createPublicClient, 
  createWalletClient,
  http as viemHttp,
  parseUnits,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { deAITokenABI } from "../constants";

// --- Configuration ---
const deAITokenContractAddress = process.env.DEAI_TOKEN_CONTRACT_ADDRESS || "0x";
const rpcUrl = process.env.RPC_URL || "";

// A private key for the gateway's operator wallet. 
// This wallet is responsible for submitting the `transferFrom` transaction.
// In a real environment, this MUST be stored securely (e.g., in a secret manager).
const gatewayOperatorPrivateKey = process.env.GATEWAY_OPERATOR_PRIVATE_KEY;
if (!gatewayOperatorPrivateKey) {
  throw new Error("FATAL: GATEWAY_OPERATOR_PRIVATE_KEY is not set in the environment.");
}

// This constant represents the number of decimals in the DeAI ERC20 token.
const TOKEN_DECIMALS = 18;

// --- Client Definitions ---

// Public client for read-only operations (like checking balances).
export const publicClient = createPublicClient({
  chain: sepolia,
  transport: viemHttp(rpcUrl),
});

// Account for the gateway operator, derived from the private key.
const operatorAccount = privateKeyToAccount(gatewayOperatorPrivateKey as `0x${string}`);

// Wallet client for write operations (sending transactions).
// This client signs transactions using the operator's private key.
export const walletClient = createWalletClient({
  account: operatorAccount,
  chain: sepolia,
  transport: viemHttp(rpcUrl),
});

// --- Contract Functions ---

/**
 * Returns the public address of the gateway's operator wallet.
 * @returns {string} The operator's Ethereum address.
 */
export function getOperatorAddress() {
  return operatorAccount.address;
}

/**
 * Reads the token balance of a given address.
 * @param {string} address The user's wallet address.
 * @returns {Promise<bigint>} The balance in the smallest unit (e.g., wei).
 */
export async function getDeAITokenBalance(address) {
  const balance = await publicClient.readContract({
    address: deAITokenContractAddress,
    abi: deAITokenABI,
    functionName: "balanceOf",
    args: [address],
  });
  return balance;
}

/**
 * Deducts a specified amount of tokens from a user by calling `transferFrom`.
 * This assumes the user has previously approved the gateway's operator address to spend this amount.
 * @param {string} userAddress The address of the user to deduct from.
 * @param {number} amountInFullTokens The amount of tokens to deduct (e.g., 5 for 5 DeAI tokens).
 * @returns {Promise<string>} The transaction hash.
 */
export async function deductTokensFromUser(userAddress, amountInFullTokens) {
  try {
    // Convert the token amount to the smallest unit (e.g., wei)
    const amountInSmallestUnit = parseUnits(amountInFullTokens.toString(), TOKEN_DECIMALS);

    console.log(
      `Attempting to deduct ${amountInFullTokens} tokens from ${userAddress} to treasury ${operatorAccount.address}...`
    );

    const hash = await walletClient.writeContract({
      address: deAITokenContractAddress,
      abi: deAITokenABI,
      functionName: "transferFrom",
      args: [userAddress, operatorAccount.address, amountInSmallestUnit],
    });

    console.log(`Successfully submitted deduction transaction. Hash: ${hash}`);
    return hash;
  } catch (error) {
    console.error("Error in deductTokensFromUser:", error);
    // Re-throw the error to be handled by the calling function
    throw new Error(`Failed to execute token deduction: ${error.message}`);
  }
}
