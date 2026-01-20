#!/usr/bin/env tsx
/**
 * Quick E2E Test Setup Verification
 * Checks environment and dependencies before running full test suite
 */

import * as dotenv from "dotenv";
import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";

dotenv.config();

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

interface CheckResult {
  name: string;
  status: "pass" | "fail" | "warn";
  message: string;
}

const results: CheckResult[] = [];

function check(name: string, status: "pass" | "fail" | "warn", message: string) {
  results.push({ name, status, message });
  const icon = status === "pass" ? "✓" : status === "fail" ? "✗" : "⚠";
  const color = status === "pass" ? colors.green : status === "fail" ? colors.red : colors.yellow;
  console.log(`${color}${icon}${colors.reset} ${name}: ${message}`);
}

async function main() {
  console.log(`${colors.bold}${colors.cyan}
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║           E2E Test Setup Verification                         ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
${colors.reset}\n`);

  console.log(`${colors.bold}Checking environment configuration...${colors.reset}\n`);

  // Check .env file exists
  const envPath = path.join(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    check("Environment File", "pass", ".env file found");
  } else {
    check("Environment File", "fail", ".env file not found");
  }

  // Check required environment variables
  const requiredVars = [
    "CRONOS_TESTNET_RPC",
    "SIMPLE_VAULT_ADDRESS",
    "AGENT_PRIVATE_KEY",
  ];

  for (const varName of requiredVars) {
    if (process.env[varName]) {
      check(`Env: ${varName}`, "pass", "Set");
    } else {
      check(`Env: ${varName}`, "fail", "Not set");
    }
  }

  // Check optional variables
  if (process.env.OPENAI_API_KEY) {
    check("Env: OPENAI_API_KEY", "pass", "Set (AI agents enabled)");
  } else {
    check("Env: OPENAI_API_KEY", "warn", "Not set (AI agents will use fallback)");
  }

  console.log(`\n${colors.bold}Checking blockchain connectivity...${colors.reset}\n`);

  // Check RPC connection
  try {
    const provider = new ethers.JsonRpcProvider(process.env.CRONOS_TESTNET_RPC);
    const network = await provider.getNetwork();
    
    if (network.chainId === 338n) {
      check("RPC Connection", "pass", `Connected to Cronos Testnet (Chain ID: ${network.chainId})`);
    } else {
      check("RPC Connection", "warn", `Connected but unexpected chain ID: ${network.chainId}`);
    }
  } catch (error: any) {
    check("RPC Connection", "fail", `Failed to connect: ${error.message}`);
  }

  // Check vault contract
  try {
    const provider = new ethers.JsonRpcProvider(process.env.CRONOS_TESTNET_RPC);
    const vaultAddress = process.env.SIMPLE_VAULT_ADDRESS;
    
    if (vaultAddress && ethers.isAddress(vaultAddress)) {
      const code = await provider.getCode(vaultAddress);
      if (code !== "0x") {
        check("Vault Contract", "pass", `Contract deployed at ${vaultAddress}`);
      } else {
        check("Vault Contract", "fail", "No contract code at address");
      }
    } else {
      check("Vault Contract", "fail", "Invalid vault address");
    }
  } catch (error: any) {
    check("Vault Contract", "fail", `Failed to verify: ${error.message}`);
  }

  // Check agent wallet
  try {
    const provider = new ethers.JsonRpcProvider(process.env.CRONOS_TESTNET_RPC);
    const wallet = new ethers.Wallet(process.env.AGENT_PRIVATE_KEY!, provider);
    const balance = await provider.getBalance(wallet.address);
    const balanceCRO = ethers.formatEther(balance);
    
    check("Agent Address", "pass", wallet.address);
    
    if (Number(balanceCRO) > 1) {
      check("Agent Balance", "pass", `${balanceCRO} CRO`);
    } else if (Number(balanceCRO) > 0) {
      check("Agent Balance", "warn", `${balanceCRO} CRO (low balance, get more from faucet)`);
    } else {
      check("Agent Balance", "fail", "0 CRO (need testnet CRO from faucet)");
    }
  } catch (error: any) {
    check("Agent Wallet", "fail", `Failed to load: ${error.message}`);
  }

  console.log(`\n${colors.bold}Checking test files...${colors.reset}\n`);

  // Check test files exist
  const testFiles = [
    "tests/e2e-agents.test.ts",
    "tests/run-e2e.ts",
    "tests/contract-integration.test.ts",
  ];

  for (const file of testFiles) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      check(`Test File: ${file}`, "pass", "Found");
    } else {
      check(`Test File: ${file}`, "fail", "Not found");
    }
  }

  console.log(`\n${colors.bold}Checking dependencies...${colors.reset}\n`);

  // Check node_modules
  if (fs.existsSync(path.join(process.cwd(), "node_modules"))) {
    check("Dependencies", "pass", "node_modules found");
  } else {
    check("Dependencies", "fail", "Run 'npm install' first");
  }

  // Check Jest
  if (fs.existsSync(path.join(process.cwd(), "node_modules", "jest"))) {
    check("Jest", "pass", "Installed");
  } else {
    check("Jest", "fail", "Not installed");
  }

  // Print summary
  console.log(`\n${colors.bold}${colors.cyan}
╔═══════════════════════════════════════════════════════════════╗
║                        SUMMARY                                ║
╚═══════════════════════════════════════════════════════════════╝
${colors.reset}\n`);

  const passed = results.filter((r) => r.status === "pass").length;
  const failed = results.filter((r) => r.status === "fail").length;
  const warnings = results.filter((r) => r.status === "warn").length;

  console.log(`${colors.green}✓ Passed:   ${passed}${colors.reset}`);
  console.log(`${colors.red}✗ Failed:   ${failed}${colors.reset}`);
  console.log(`${colors.yellow}⚠ Warnings: ${warnings}${colors.reset}\n`);

  if (failed === 0) {
    console.log(`${colors.bold}${colors.green}
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║              ✓ READY TO RUN E2E TESTS!                       ║
║                                                               ║
║              Run: npm run test:e2e:run                        ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${colors.bold}${colors.red}
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║              ✗ SETUP INCOMPLETE                              ║
║                                                               ║
║              Please fix the issues above                      ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
${colors.reset}\n`);

    console.log(`${colors.bold}Quick fixes:${colors.reset}\n`);
    
    if (!fs.existsSync(envPath)) {
      console.log(`  1. Copy .env.sample to .env`);
      console.log(`     ${colors.cyan}cp .env.sample .env${colors.reset}\n`);
    }
    
    if (!process.env.AGENT_PRIVATE_KEY) {
      console.log(`  2. Add your agent private key to .env`);
      console.log(`     ${colors.cyan}AGENT_PRIVATE_KEY=0x...${colors.reset}\n`);
    }
    
    if (results.find(r => r.name === "Agent Balance" && r.status === "fail")) {
      console.log(`  3. Get testnet CRO from faucet`);
      console.log(`     ${colors.cyan}https://cronos.org/faucet${colors.reset}\n`);
    }
    
    if (!fs.existsSync(path.join(process.cwd(), "node_modules"))) {
      console.log(`  4. Install dependencies`);
      console.log(`     ${colors.cyan}npm install${colors.reset}\n`);
    }

    process.exit(1);
  }
}

main().catch((error) => {
  console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  process.exit(1);
});
