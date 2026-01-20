/**
 * End-to-End Agent Service Tests
 * Comprehensive testing of all agent functionality
 */

import * as dotenv from "dotenv";
import { ethers } from "ethers";

dotenv.config();

const API_URL = process.env.API_URL || "http://localhost:3000";
const TEST_USER = process.env.AGENT_ADDRESS || "0xD44d1DC5648542157d1D989580Bf4597e5d771d5";

describe("E2E Agent Service Tests", () => {
  describe("1. Health & Configuration", () => {
    test("should respond to health check", async () => {
      const res = await fetch(`${API_URL}/health`);
      expect(res.ok).toBe(true);
      const data = await res.json();
      expect(data.status).toBe("ok");
    });
  });

  describe("2. Agent Registry", () => {
    test("should list all available agents", async () => {
      const res = await fetch(`${API_URL}/agents/list`);
      expect(res.ok).toBe(true);
      const data = await res.json();
      expect(data.agents).toBeDefined();
      expect(Array.isArray(data.agents)).toBe(true);
      expect(data.agents.length).toBeGreaterThan(0);
    });

    test("should include required agent metadata", async () => {
      const res = await fetch(`${API_URL}/agents/list`);
      const data = await res.json();
      
      data.agents.forEach((agent: any) => {
        expect(agent.id).toBeDefined();
        expect(agent.name).toBeDefined();
        expect(agent.description).toBeDefined();
        expect(agent.category).toBeDefined();
        expect(typeof agent.requiresAI).toBe("boolean");
      });
    });

    test("should have all expected agents", async () => {
      const res = await fetch(`${API_URL}/agents/list`);
      const data = await res.json();
      
      const agentIds = data.agents.map((a: any) => a.id);
      expect(agentIds).toContain("withdrawal-risk-sentinel");
      expect(agentIds).toContain("settlement-batch-optimizer");
      expect(agentIds).toContain("emergency-brake");
      expect(agentIds).toContain("gas-fee-monitor");
      expect(agentIds).toContain("02portfolio-rebalancer-ai");
    });
  });

  describe("3. Withdrawal Risk Sentinel Agent", () => {
    test("should apply agent with valid parameters", async () => {
      const res = await fetch(`${API_URL}/agents/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: "withdrawal-risk-sentinel",
          user: TEST_USER,
          jobId: `e2e-test-${Date.now()}`,
          requestedAmountWei: ethers.parseEther("1.0").toString(),
        }),
      });

      expect(res.ok).toBe(true);
      const data = await res.json();
      expect(data.status).toBe("submitted");
      expect(data.decision).toBeDefined();
      expect(data.onChain).toBeDefined();
      expect(data.onChain.txHash).toBeDefined();
    }, 60000);

    test("should enforce clamp policy on large withdrawals", async () => {
      const res = await fetch(`${API_URL}/agents/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: "withdrawal-risk-sentinel",
          user: TEST_USER,
          jobId: `e2e-clamp-${Date.now()}`,
          requestedAmountWei: ethers.parseEther("100000.0").toString(),
        }),
      });

      expect(res.ok).toBe(true);
      const data = await res.json();
      expect(data.decision.recommendedLimit).toBeDefined();
      
      const limitCRO = Number(ethers.formatEther(data.decision.recommendedLimit));
      expect(limitCRO).toBeLessThanOrEqual(25000);
    }, 60000);

    test("should handle small withdrawal amounts", async () => {
      const res = await fetch(`${API_URL}/agents/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: "withdrawal-risk-sentinel",
          user: TEST_USER,
          jobId: `e2e-small-${Date.now()}`,
          requestedAmountWei: ethers.parseEther("0.1").toString(),
        }),
      });

      expect(res.ok).toBe(true);
      const data = await res.json();
      expect(data.status).toBe("submitted");
    }, 60000);
  });

  describe("4. Emergency Brake Agent", () => {
    test("should trigger on volatility spike", async () => {
      const res = await fetch(`${API_URL}/agents/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: "emergency-brake",
          user: TEST_USER,
          jobId: `e2e-emergency-${Date.now()}`,
          riskTrigger: "VOLATILITY_SPIKE",
        }),
      });

      expect(res.ok).toBe(true);
      const data = await res.json();
      expect(data.status).toBe("submitted");
      expect(data.decision.recommendedLimit).toBe("0");
    }, 60000);

    test("should trigger on suspicious activity", async () => {
      const res = await fetch(`${API_URL}/agents/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: "emergency-brake",
          user: TEST_USER,
          jobId: `e2e-suspicious-${Date.now()}`,
          riskTrigger: "SUSPICIOUS_ACTIVITY",
        }),
      });

      expect(res.ok).toBe(true);
      const data = await res.json();
      expect(data.status).toBe("submitted");
    }, 60000);
  });

  describe("5. Gas Fee Monitor Agent", () => {
    test("should analyze gas fees", async () => {
      const res = await fetch(`${API_URL}/agents/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: "gas-fee-monitor",
          user: TEST_USER,
          jobId: `e2e-gas-${Date.now()}`,
        }),
      });

      expect(res.ok).toBe(true);
      const data = await res.json();
      expect(data.status).toBe("submitted");
      expect(data.decision).toBeDefined();
    }, 60000);
  });

  describe("6. Settlement Batch Optimizer", () => {
    test("should optimize settlement batch", async () => {
      const res = await fetch(`${API_URL}/agents/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: "settlement-batch-optimizer",
          user: TEST_USER,
          jobId: `e2e-settlement-${Date.now()}`,
        }),
      });

      expect(res.ok).toBe(true);
      const data = await res.json();
      expect(data.status).toBe("submitted");
    }, 60000);
  });

  describe("7. AI Agent - Portfolio Rebalancer", () => {
    test("should apply AI agent", async () => {
      const res = await fetch(`${API_URL}/agents/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: "02portfolio-rebalancer-ai",
          user: TEST_USER,
          jobId: `e2e-ai-${Date.now()}`,
        }),
      });

      expect(res.ok).toBe(true);
      const data = await res.json();
      expect(data.status).toBe("submitted");
    }, 60000);
  });

  describe("8. Settlement Payment System", () => {
    test("should get payment info", async () => {
      const res = await fetch(`${API_URL}/settlement/payment-info`);
      expect(res.ok).toBe(true);
      const data = await res.json();
      expect(data.contractAddress).toBeDefined();
      expect(data.fee).toBeDefined();
      expect(ethers.isAddress(data.contractAddress)).toBe(true);
    });

    test("should verify unpaid job", async () => {
      const res = await fetch(`${API_URL}/settlement/verify-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: `unpaid-${Date.now()}`,
        }),
      });

      expect(res.ok).toBe(true);
      const data = await res.json();
      expect(data.status).toBe("unpaid");
    });

    test("should enforce x402 payment gate", async () => {
      const res = await fetch(`${API_URL}/settlement/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: `unpaid-settlement-${Date.now()}`,
          user: TEST_USER,
          agentId: "settlement-batch-optimizer",
        }),
      });

      expect(res.status).toBe(402);
      const data = await res.json();
      expect(data.x402).toBeDefined();
      expect(data.x402.contractAddress).toBeDefined();
      expect(data.x402.fee).toBeDefined();
    });
  });

  describe("9. Error Handling", () => {
    test("should reject invalid agent ID", async () => {
      const res = await fetch(`${API_URL}/agents/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: "non-existent-agent",
          user: TEST_USER,
          jobId: `e2e-invalid-${Date.now()}`,
        }),
      });

      expect(res.ok).toBe(false);
    });

    test("should reject missing required parameters", async () => {
      const res = await fetch(`${API_URL}/agents/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: "withdrawal-risk-sentinel",
          // Missing user and jobId
        }),
      });

      expect(res.ok).toBe(false);
    });

    test("should reject invalid user address", async () => {
      const res = await fetch(`${API_URL}/agents/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: "withdrawal-risk-sentinel",
          user: "invalid-address",
          jobId: `e2e-invalid-addr-${Date.now()}`,
          requestedAmountWei: "1000000000000000000",
        }),
      });

      expect(res.ok).toBe(false);
    });
  });

  describe("10. Concurrent Agent Execution", () => {
    test("should handle multiple concurrent requests", async () => {
      const requests = Array.from({ length: 3 }, (_, i) =>
        fetch(`${API_URL}/agents/apply`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agentId: "withdrawal-risk-sentinel",
            user: TEST_USER,
            jobId: `e2e-concurrent-${Date.now()}-${i}`,
            requestedAmountWei: ethers.parseEther("1.0").toString(),
          }),
        })
      );

      const responses = await Promise.all(requests);
      
      for (const res of responses) {
        expect(res.ok).toBe(true);
        const data = await res.json();
        expect(data.status).toBe("submitted");
      }
    }, 120000);
  });
});
