/**
 * Test Environment Verification Script
 * 
 * Run this before executing tests to ensure everything is configured correctly.
 * 
 * Usage: npx tsx tests/verify-test-env.ts
 */

import { ethers } from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

const CRONOS_TESTNET_RPC = process.env.CRONOS_TESTNET_RPC || "";
const SIMPLE_VAULT_ADDRESS = process.env.SIMPLE_VAULT_ADDRESS || "";
const AGENT_PRIVATE_KEY = process.env.AGENT_PRIVATE_KEY || "";

const SIMPLE_VAULT_ABI = [
  "function agent() view returns (address)",
  "function owner() view returns (address)",
  "function balances(address) view returns (uint256)",
];

async function verifyEnvironment() {
  console.log("\n🔍 Verifying Test Environment...\n");

  let hasErrors = false;

  // 1. Check environment variables
  console.log("1️⃣  Environment Variables:");
  
  if (!CRONOS_TESTNET_RPC) {
    console.log("   ❌ CRONOS_TESTNET_RPC not set");
    hasErrors = true;
  } else {
    console.log(`   ✅ CRONOS_TESTNET_RPC: ${CRONOS_TESTNET_RPC}`);
  }

  if (!SIMPLE_VAULT_ADDRESS) {
    console.log("   ❌ SIMPLE_VAULT_ADDRESS not set");
    hasErrors = true;
  } else if (!/^0x[a-fA-F0-9]{40}$/.test(SIMPLE_VAULT_ADDRESS)) {
    console.log(`   ❌ SIMPLE_VAULT_ADDRESS invalid format: ${SIMPLE_VAULT_ADDRESS}`);
    hasErrors = true;
  } else {
    console.log(`   ✅ SIMPLE_VAULT_ADDRESS: ${SIMPLE_VAULT_ADDRESS}`);
  }

  if (!AGENT_PRIVATE_KEY) {
    console.log("   ❌ AGENT_PRIVATE_KEY not set");
    hasErrors = true;
  } else if (!/^(0x)?[a-fA-F0-9]{64}$/.test(AGENT_PRIVATE_KEY)) {
    console.log("   ❌ AGENT_PRIVATE_KEY invalid format");
    hasErrors = true;
  } else {
    console.log("   ✅ AGENT_PRIVATE_KEY: configured");
  }

  if (hasErrors) {
    console.log("\n❌ Environment configuration incomplete. Please check your .env file.\n");
    process.exit(1);
  }

  // 2. Check network connectivity
  console.log("\n2️⃣  Network Connectivity:");
  
  try {
    const provider = new ethers.JsonRpcProvider(CRONOS_TESTNET_RPC);
    const network = await provider.getNetwork();
    
    if (network.chainId !== 338n) {
      console.log(`   ❌ Wrong network! Expected Chain ID 338, got ${network.chainId}`);
      hasErrors = true;
    } else {
      console.log(`   ✅ Connected to Cronos Testnet (Chain ID: ${network.chainId})`);
    }

    const blockNumber = await provider.getBlockNumber();
    console.log(`   ✅ Current block: ${blockNumber}`);
  } catch (error: any) {
    console.log(`   ❌ Failed to connect to RPC: ${error.message}`);
    hasErrors = true;
  }

  // 3. Check agent wallet
  console.log("\n3️⃣  Agent Wallet:");
  
  try {
    const provider = new ethers.JsonRpcProvider(CRONOS_TESTNET_RPC);
    const wallet = new ethers.Wallet(AGENT_PRIVATE_KEY, provider);
    const address = wallet.address;
    
    console.log(`   ✅ Agent Address: ${address}`);
    
    const balance = await provider.getBalance(address);
    const balanceEth = ethers.formatEther(balance);
    
    if (balance === 0n) {
      console.log(`   ⚠️  Agent balance: ${balanceEth} CRO (ZERO - tests will fail!)`);
      console.log(`   💡 Get testnet CRO from: https://cronos.org/faucet`);
      hasErrors = true;
    } else if (balance < ethers.parseEther("0.1")) {
      console.log(`   ⚠️  Agent balance: ${balanceEth} CRO (LOW - may not be enough for all tests)`);
    } else {
      console.log(`   ✅ Agent balance: ${balanceEth} CRO`);
    }
  } catch (error: any) {
    console.log(`   ❌ Failed to check agent wallet: ${error.message}`);
    hasErrors = true;
  }

  // 4. Check contract
  console.log("\n4️⃣  SimpleVault Contract:");
  
  try {
    const provider = new ethers.JsonRpcProvider(CRONOS_TESTNET_RPC);
    const vault = new ethers.Contract(SIMPLE_VAULT_ADDRESS, SIMPLE_VAULT_ABI, provider);
    
    // Check if contract exists
    const code = await provider.getCode(SIMPLE_VAULT_ADDRESS);
    if (code === "0x") {
      console.log(`   ❌ No contract deployed at ${SIMPLE_VAULT_ADDRESS}`);
      hasErrors = true;
    } else {
      console.log(`   ✅ Contract deployed at ${SIMPLE_VAULT_ADDRESS}`);
    }

    // Read contract state
    const owner = await vault.owner();
    console.log(`   ✅ Contract Owner: ${owner}`);

    const configuredAgent = await vault.agent();
    console.log(`   ℹ️  Configured Agent: ${configuredAgent}`);

    const wallet = new ethers.Wallet(AGENT_PRIVATE_KEY, provider);
    if (configuredAgent.toLowerCase() !== wallet.address.toLowerCase()) {
      console.log(`   ⚠️  Agent mismatch!`);
      console.log(`      Expected: ${wallet.address}`);
      console.log(`      Actual: ${configuredAgent}`);
      console.log(`   💡 Run: npx hardhat run scripts/setAgent.ts --network cronosTestnet`);
      hasErrors = true;
    } else {
      console.log(`   ✅ Agent correctly configured`);
    }

    // Check if agent has any balance in vault
    const agentVaultBalance = await vault.balances(wallet.address);
    console.log(`   ℹ️  Agent vault balance: ${ethers.formatEther(agentVaultBalance)} CRO`);
    
  } catch (error: any) {
    console.log(`   ❌ Failed to interact with contract: ${error.message}`);
    hasErrors = true;
  }

  // Final summary
  console.log("\n" + "=".repeat(60));
  if (hasErrors) {
    console.log("❌ Environment verification FAILED");
    console.log("   Please fix the issues above before running tests.\n");
    process.exit(1);
  } else {
    console.log("✅ Environment verification PASSED");
    console.log("   You can now run: npm test\n");
    process.exit(0);
  }
}

verifyEnvironment().catch((error) => {
  console.error("\n💥 Unexpected error:", error);
  process.exit(1);
});

