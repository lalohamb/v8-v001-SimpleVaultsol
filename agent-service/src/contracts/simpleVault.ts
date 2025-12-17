import * as dotenv from "dotenv";
import { ethers } from "ethers";

dotenv.config();

const CRONOS_TESTNET_RPC =
  process.env.CRONOS_TESTNET_RPC || "https://evm-t3.cronos.org";
const SIMPLE_VAULT_ADDRESS = process.env.SIMPLE_VAULT_ADDRESS || "";

if (!SIMPLE_VAULT_ADDRESS) {
  console.warn(
    "[simpleVault] WARNING: SIMPLE_VAULT_ADDRESS is not set. Contract interactions will fail until configured."
  );
}

// Minimal ABI for SimpleVault (only functions we use)
const SIMPLE_VAULT_ABI = [
  "function balances(address) view returns (uint256)",
  "function recommendedWithdrawLimit(address) view returns (uint256)",
  "function agentSetWithdrawLimit(address user, uint256 newLimit, string reason)",
  "function agent() view returns (address)",
  "function owner() view returns (address)"
];

export function getProvider(): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(CRONOS_TESTNET_RPC);
}

/**
 * For read-only operations.
 */
export function getSimpleVaultReadonly() {
  const provider = getProvider();
  return new ethers.Contract(
    SIMPLE_VAULT_ADDRESS,
    SIMPLE_VAULT_ABI,
    provider
  );
}

/**
 * For write operations using a local private key.
 * DO NOT use a mainnet main wallet key here.
 */
export function getSimpleVaultWithSigner(privateKey: string) {
  const provider = getProvider();
  const wallet = new ethers.Wallet(privateKey, provider);
  return new ethers.Contract(
    SIMPLE_VAULT_ADDRESS,
    SIMPLE_VAULT_ABI,
    wallet
  );
}
