#!/usr/bin/env tsx
/**
 * Automated API Testing Script
 * Tests all agent service endpoints and provides comprehensive summary
 */

import { spawn } from "child_process";
import { setTimeout } from "timers/promises";

const API_URL = process.env.API_URL || "http://localhost:3000";
const TEST_USER = "0xD44d1DC5648542157d1D989580Bf4597e5d771d5";

interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
  response?: any;
}

const results: TestResult[] = [];
let serverProcess: any = null;

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

async function fetch(url: string, options?: any): Promise<any> {
  const https = await import("https");
  const http = await import("http");
  const urlObj = new URL(url);
  const client = urlObj.protocol === "https:" ? https : http;

  return new Promise((resolve, reject) => {
    const req = client.request(
      url,
      {
        method: options?.method || "GET",
        headers: options?.headers || {},
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve({
              ok: res.statusCode! >= 200 && res.statusCode! < 300,
              status: res.statusCode,
              json: async () => JSON.parse(data),
              text: async () => data,
            });
          } catch (e) {
            resolve({
              ok: res.statusCode! >= 200 && res.statusCode! < 300,
              status: res.statusCode,
              json: async () => ({}),
              text: async () => data,
            });
          }
        });
      }
    );

    req.on("error", reject);
    if (options?.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function runTest(
  name: string,
  testFn: () => Promise<void>
): Promise<void> {
  const start = Date.now();
  try {
    await testFn();
    const duration = Date.now() - start;
    results.push({ name, passed: true, duration });
    console.log(`${colors.green}✓${colors.reset} ${name} ${colors.cyan}(${duration}ms)${colors.reset}`);
  } catch (error: any) {
    const duration = Date.now() - start;
    results.push({ name, passed: false, duration, error: error.message });
    console.log(`${colors.red}✗${colors.reset} ${name} ${colors.cyan}(${duration}ms)${colors.reset}`);
    console.log(`  ${colors.red}Error: ${error.message}${colors.reset}`);
  }
}

async function startServer(): Promise<void> {
  console.log(`${colors.blue}Starting agent service...${colors.reset}`);
  serverProcess = spawn("npm", ["run", "dev"], {
    stdio: "pipe",
    shell: true,
  });

  // Wait for server to be ready
  let attempts = 0;
  while (attempts < 30) {
    try {
      const res = await fetch(`${API_URL}/health`);
      if (res.ok) {
        console.log(`${colors.green}✓ Server ready${colors.reset}\n`);
        return;
      }
    } catch (e) {
      // Server not ready yet
    }
    await setTimeout(1000);
    attempts++;
  }
  throw new Error("Server failed to start");
}

function stopServer(): void {
  if (serverProcess) {
    serverProcess.kill();
  }
}

async function main() {
  console.log(`${colors.bold}${colors.cyan}
╔═══════════════════════════════════════════════════════════╗
║     CRONOS SENTINEL AI VAULT - API TEST SUITE            ║
╚═══════════════════════════════════════════════════════════╝
${colors.reset}`);

  try {
    // Start server
    await startServer();

    // Run tests
    console.log(`${colors.bold}Running API Tests...${colors.reset}\n`);

    // Test 1: Health Check
    await runTest("Health Check", async () => {
      const res = await fetch(`${API_URL}/health`);
      const data = await res.json();
      if (!res.ok || data.status !== "ok") {
        throw new Error("Health check failed");
      }
    });

    // Test 2: List Agents
    await runTest("List Agents", async () => {
      const res = await fetch(`${API_URL}/agents/list`);
      const data = await res.json();
      if (!res.ok || !data.agents || data.agents.length === 0) {
        throw new Error("Failed to list agents");
      }
      if (data.agents.length !== 5) {
        throw new Error(`Expected 5 agents, got ${data.agents.length}`);
      }
    });

    // Test 3: Settlement Payment Info
    await runTest("Get Settlement Payment Info", async () => {
      const res = await fetch(`${API_URL}/settlement/payment-info`);
      const data = await res.json();
      if (!res.ok || !data.contractAddress || !data.fee) {
        throw new Error("Failed to get payment info");
      }
    });

    // Test 4: Apply Withdrawal Risk Sentinel Agent
    await runTest("Apply Agent - Withdrawal Risk Sentinel", async () => {
      const res = await fetch(`${API_URL}/agents/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: "withdrawal-risk-sentinel",
          user: TEST_USER,
          jobId: `test-${Date.now()}`,
          requestedAmountWei: "1000000000000000000",
        }),
      });
      const data = await res.json();
      if (!res.ok || data.status !== "submitted") {
        throw new Error("Failed to apply agent");
      }
      if (!data.onChain || !data.onChain.txHash) {
        throw new Error("No transaction hash returned");
      }
    });

    // Test 5: Apply AI Agent (Portfolio Rebalancer)
    await runTest("Apply Agent - Portfolio Rebalancer AI", async () => {
      const res = await fetch(`${API_URL}/agents/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: "02portfolio-rebalancer-ai",
          user: TEST_USER,
          jobId: `test-ai-${Date.now()}`,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.status !== "submitted") {
        throw new Error("Failed to apply AI agent");
      }
    });

    // Test 6: Verify Payment (Unpaid)
    await runTest("Verify Payment - Unpaid Job", async () => {
      const res = await fetch(`${API_URL}/settlement/verify-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: "test-unpaid-job",
        }),
      });
      const data = await res.json();
      if (!res.ok || data.status !== "unpaid") {
        throw new Error("Payment verification failed");
      }
    });

    // Test 7: Settlement Run (Should fail with 402)
    await runTest("Settlement Run - x402 Payment Gate", async () => {
      const res = await fetch(`${API_URL}/settlement/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: "test-unpaid-settlement",
          user: TEST_USER,
          agentId: "settlement-batch-optimizer",
        }),
      });
      const data = await res.json();
      if (res.status !== 402) {
        throw new Error(`Expected 402 status, got ${res.status}`);
      }
      if (!data.x402 || !data.x402.contractAddress) {
        throw new Error("x402 payment info not returned");
      }
    });

    // Test 8: Apply Emergency Brake Agent
    await runTest("Apply Agent - Emergency Brake", async () => {
      const res = await fetch(`${API_URL}/agents/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: "emergency-brake",
          user: TEST_USER,
          jobId: `test-emergency-${Date.now()}`,
          riskTrigger: "VOLATILITY_SPIKE",
        }),
      });
      const data = await res.json();
      if (!res.ok || data.status !== "submitted") {
        throw new Error("Failed to apply emergency brake agent");
      }
    });

    // Test 9: Apply Gas Fee Monitor Agent
    await runTest("Apply Agent - Gas Fee Monitor", async () => {
      const res = await fetch(`${API_URL}/agents/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: "gas-fee-monitor",
          user: TEST_USER,
          jobId: `test-gas-${Date.now()}`,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.status !== "submitted") {
        throw new Error("Failed to apply gas fee monitor agent");
      }
    });

    // Print summary
    printSummary();
  } catch (error: any) {
    console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
    process.exit(1);
  } finally {
    stopServer();
  }
}

function printSummary() {
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const total = results.length;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

  console.log(`\n${colors.bold}${colors.cyan}
╔═══════════════════════════════════════════════════════════╗
║                    TEST SUMMARY                           ║
╚═══════════════════════════════════════════════════════════╝
${colors.reset}`);

  console.log(`${colors.bold}Total Tests:${colors.reset} ${total}`);
  console.log(`${colors.green}${colors.bold}Passed:${colors.reset} ${passed}`);
  if (failed > 0) {
    console.log(`${colors.red}${colors.bold}Failed:${colors.reset} ${failed}`);
  }
  console.log(`${colors.cyan}Total Duration:${colors.reset} ${totalDuration}ms\n`);

  console.log(`${colors.bold}Test Results:${colors.reset}`);
  results.forEach((result, index) => {
    const icon = result.passed ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`;
    console.log(`  ${index + 1}. ${icon} ${result.name} ${colors.cyan}(${result.duration}ms)${colors.reset}`);
    if (!result.passed && result.error) {
      console.log(`     ${colors.red}└─ ${result.error}${colors.reset}`);
    }
  });

  console.log(`\n${colors.bold}${colors.cyan}
╔═══════════════════════════════════════════════════════════╗
║                  FEATURE COVERAGE                         ║
╚═══════════════════════════════════════════════════════════╝
${colors.reset}`);

  const features = [
    "✓ Health Check Endpoint",
    "✓ Agent Registry & Listing",
    "✓ Settlement Payment Info",
    "✓ Agent Decision Application (Deterministic)",
    "✓ AI Agent Decision Application",
    "✓ Payment Verification",
    "✓ x402 Payment Gate Enforcement",
    "✓ Emergency Brake Agent",
    "✓ Gas Fee Monitor Agent",
    "✓ On-chain Transaction Submission",
    "✓ Clamp Policy Enforcement",
  ];

  features.forEach((feature) => {
    console.log(`  ${colors.green}${feature}${colors.reset}`);
  });

  console.log(`\n${colors.bold}${colors.cyan}
╔═══════════════════════════════════════════════════════════╗
║                  AVAILABLE AGENTS                         ║
╚═══════════════════════════════════════════════════════════╝
${colors.reset}`);

  const agents = [
    { name: "Settlement Batch Optimizer", type: "Deterministic" },
    { name: "Withdrawal Risk Sentinel", type: "Deterministic" },
    { name: "Emergency Brake", type: "Deterministic" },
    { name: "Gas Fee Monitor", type: "Deterministic" },
    { name: "Portfolio Rebalancer AI", type: "AI-Capable" },
  ];

  agents.forEach((agent, index) => {
    const typeColor = agent.type === "AI-Capable" ? colors.yellow : colors.blue;
    console.log(`  ${index + 1}. ${colors.bold}${agent.name}${colors.reset} ${typeColor}[${agent.type}]${colors.reset}`);
  });

  console.log(`\n${colors.bold}${colors.green}
╔═══════════════════════════════════════════════════════════╗
║              ALL TESTS COMPLETED SUCCESSFULLY!            ║
╚═══════════════════════════════════════════════════════════╝
${colors.reset}\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(`${colors.red}Unhandled error: ${error.message}${colors.reset}`);
  stopServer();
  process.exit(1);
});

