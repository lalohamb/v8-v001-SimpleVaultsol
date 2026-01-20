/**
 * Contract Integration Tests
 * 
 * These tests interact with the REAL SimpleVault contract deployed on Cronos Testnet.
 * They are NOT mocked - they perform actual blockchain transactions.
 * 
 * Prerequisites:
 * 1. SIMPLE_VAULT_ADDRESS must be set in .env
 * 2. AGENT_PRIVATE_KEY must be set and funded with testnet CRO
 * 3. CRONOS_TESTNET_RPC must be accessible
 * 4. The agent address must be set on the contract (via setAgent)
 * 
 * Run with: npm test
 */

import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { getSimpleVaultReadonly, getSimpleVaultWithSigner, getProvider } from "../src/contracts/simpleVault.js";

dotenv.config();

// Test configuration
const CRONOS_TESTNET_RPC = process.env.CRONOS_TESTNET_RPC || "https://evm-t3.cronos.org";
const SIMPLE_VAULT_ADDRESS = process.env.SIMPLE_VAULT_ADDRESS || "";
const AGENT_PRIVATE_KEY = process.env.AGENT_PRIVATE_KEY || "";

// Minimal ABI for testing
const SIMPLE_VAULT_ABI = [
  "function balances(address) view returns (uint256)",
  "function recommendedWithdrawLimit(address) view returns (uint256)",
  "function agentSetWithdrawLimit(address user, uint256 newLimit, string reason)",
  "function agent() view returns (address)",
  "function owner() view returns (address)",
  "function deposit() payable",
  "function withdraw(uint256 amount)",
  "function setAgent(address _agent)",
  "event Deposited(address indexed user, uint256 amount)",
  "event Withdrawn(address indexed user, uint256 amount)",
  "event AgentRecommendation(address indexed agent, address indexed user, uint256 newLimit, string reason)"
];

describe("SimpleVault Contract Integration Tests", () => {
  let provider: ethers.JsonRpcProvider;
  let agentWallet: ethers.Wallet;
  let agentAddress: string;
  let vaultReadonly: ethers.Contract;
  let vaultWithSigner: ethers.Contract;
  let testUser: string; // Test user address (will be set to agentAddress)

  beforeAll(async () => {
    // Validate environment
    if (!SIMPLE_VAULT_ADDRESS) {
      throw new Error("SIMPLE_VAULT_ADDRESS not set in .env");
    }
    if (!AGENT_PRIVATE_KEY) {
      throw new Error("AGENT_PRIVATE_KEY not set in .env");
    }

    // Setup provider and wallet
    provider = getProvider();
    agentWallet = new ethers.Wallet(AGENT_PRIVATE_KEY, provider);
    agentAddress = agentWallet.address;
    testUser = agentAddress; // Use agent address as test user

    // Setup contract instances
    vaultReadonly = getSimpleVaultReadonly();
    vaultWithSigner = getSimpleVaultWithSigner(AGENT_PRIVATE_KEY);

    console.log("\n🔧 Test Configuration:");
    console.log(`   Vault Address: ${SIMPLE_VAULT_ADDRESS}`);
    console.log(`   Agent Address: ${agentAddress}`);
    console.log(`   RPC Endpoint: ${CRONOS_TESTNET_RPC}`);
  });

  describe("1. Contract Connection & Configuration", () => {
    test("should connect to Cronos Testnet", async () => {
      const network = await provider.getNetwork();
      expect(network.chainId).toBe(338n); // Cronos Testnet chain ID
    });

    test("should have valid vault address", () => {
      expect(SIMPLE_VAULT_ADDRESS).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(vaultReadonly.target).toBe(SIMPLE_VAULT_ADDRESS);
    });

    test("should have agent wallet with balance", async () => {
      const balance = await provider.getBalance(agentAddress);
      console.log(`   Agent Balance: ${ethers.formatEther(balance)} CRO`);
      expect(balance).toBeGreaterThan(0n);
    }, 30000);

    test("should read contract owner", async () => {
      const owner = await vaultReadonly.owner();
      console.log(`   Contract Owner: ${owner}`);
      expect(owner).toMatch(/^0x[a-fA-F0-9]{40}$/);
    }, 30000);

    test("should read configured agent address", async () => {
      const configuredAgent = await vaultReadonly.agent();
      console.log(`   Configured Agent: ${configuredAgent}`);
      expect(configuredAgent).toMatch(/^0x[a-fA-F0-9]{40}$/);
      
      if (configuredAgent.toLowerCase() !== agentAddress.toLowerCase()) {
        console.warn(`   ⚠️  WARNING: Agent address mismatch!`);
        console.warn(`   Expected: ${agentAddress}`);
        console.warn(`   Actual: ${configuredAgent}`);
        console.warn(`   Run: npx hardhat run scripts/setAgent.ts --network cronosTestnet`);
      }
    }, 30000);
  });

  describe("2. Read Operations", () => {
    test("should read user balance", async () => {
      const testUser = agentAddress; // Use agent address as test user
      const balance = await vaultReadonly.balances(testUser);
      console.log(`   User Balance: ${ethers.formatEther(balance)} CRO (${balance.toString()} wei)`);
      expect(typeof balance).toBe("bigint");
    }, 30000);

    test("should read recommended withdraw limit", async () => {
      const testUser = agentAddress;
      const limit = await vaultReadonly.recommendedWithdrawLimit(testUser);
      console.log(`   Recommended Limit: ${ethers.formatEther(limit)} CRO (${limit.toString()} wei)`);
      expect(typeof limit).toBe("bigint");
    }, 30000);

    test("should read balances for multiple users", async () => {
      const users = [
        agentAddress,
        "0x0000000000000000000000000000000000000001", // Zero balance expected
        "0x0000000000000000000000000000000000000002"
      ];

      for (const user of users) {
        const balance = await vaultReadonly.balances(user);
        console.log(`   ${user}: ${balance.toString()} wei`);
        expect(typeof balance).toBe("bigint");
      }
    }, 60000);
  });

  describe("3. Write Operations - Agent Set Withdraw Limit", () => {
    test("should set withdraw limit as agent", async () => {
      // Read current state
      const balanceBefore = await vaultReadonly.balances(testUser);
      const limitBefore = await vaultReadonly.recommendedWithdrawLimit(testUser);

      console.log(`   Before - Balance: ${balanceBefore.toString()} wei`);
      console.log(`   Before - Limit: ${limitBefore.toString()} wei`);

      // Calculate new limit (50% of balance)
      const newLimit = (balanceBefore * 50n) / 100n;
      const reason = "test: setting 50% limit via integration test";

      console.log(`   Setting new limit: ${newLimit.toString()} wei`);

      // Execute transaction
      const tx = await vaultWithSigner.agentSetWithdrawLimit(testUser, newLimit, reason);
      console.log(`   Transaction hash: ${tx.hash}`);

      // Wait for confirmation
      const receipt = await tx.wait();
      console.log(`   Confirmed in block: ${receipt.blockNumber}`);
      console.log(`   Gas used: ${receipt.gasUsed.toString()}`);

      // Verify state change
      const limitAfter = await vaultReadonly.recommendedWithdrawLimit(testUser);
      console.log(`   After - Limit: ${limitAfter.toString()} wei`);

      expect(limitAfter).toBe(newLimit);
      expect(receipt.status).toBe(1); // Success
    }, 60000);

    test("should emit AgentRecommendation event", async () => {
      const newLimit = 1000000000000000n; // 0.001 CRO
      const reason = "test: event emission check";

      const tx = await vaultWithSigner.agentSetWithdrawLimit(testUser, newLimit, reason);
      const receipt = await tx.wait();

      console.log(`   Transaction logs count: ${receipt.logs.length}`);

      // Find the AgentRecommendation event
      let parsedEvent = null;
      for (const log of receipt.logs) {
        try {
          const parsed = vaultReadonly.interface.parseLog({
            topics: [...log.topics],
            data: log.data
          });
          console.log(`   Found event: ${parsed?.name}`);
          if (parsed?.name === "AgentRecommendation") {
            parsedEvent = parsed;
            break;
          }
        } catch (e) {
          // Skip logs that don't match our interface
        }
      }

      expect(parsedEvent).toBeDefined();

      if (parsedEvent) {
        console.log(`   Event emitted:`);
        console.log(`     Agent: ${parsedEvent.args[0]}`);
        console.log(`     User: ${parsedEvent.args[1]}`);
        console.log(`     New Limit: ${parsedEvent.args[2].toString()}`);
        console.log(`     Reason: ${parsedEvent.args[3]}`);

        expect(parsedEvent.args[1].toLowerCase()).toBe(testUser.toLowerCase());
        expect(parsedEvent.args[2]).toBe(newLimit);
        expect(parsedEvent.args[3]).toBe(reason);
      }
    }, 60000);

    test("should handle multiple limit updates", async () => {
      const limits = [
        { value: 100000000000000n, reason: "test: limit 1" },
        { value: 200000000000000n, reason: "test: limit 2" },
        { value: 300000000000000n, reason: "test: limit 3" }
      ];

      for (const { value, reason } of limits) {
        const tx = await vaultWithSigner.agentSetWithdrawLimit(testUser, value, reason);
        const receipt = await tx.wait();

        console.log(`   Set limit ${value.toString()}: ${receipt.hash}`);

        const currentLimit = await vaultReadonly.recommendedWithdrawLimit(testUser);
        expect(currentLimit).toBe(value);
      }
    }, 120000);

    test("should set limit to zero", async () => {
      const tx = await vaultWithSigner.agentSetWithdrawLimit(testUser, 0n, "test: zero limit");
      await tx.wait();

      const limit = await vaultReadonly.recommendedWithdrawLimit(testUser);
      console.log(`   Limit set to: ${limit.toString()}`);
      expect(limit).toBe(0n);
    }, 60000);

    test("should handle very large limits", async () => {
      const largeLimit = ethers.parseEther("1000000"); // 1M CRO
      const tx = await vaultWithSigner.agentSetWithdrawLimit(testUser, largeLimit, "test: large limit");
      await tx.wait();

      const limit = await vaultReadonly.recommendedWithdrawLimit(testUser);
      console.log(`   Large limit set: ${ethers.formatEther(limit)} CRO`);
      expect(limit).toBe(largeLimit);
    }, 60000);

    test("should handle long reason strings", async () => {
      const longReason = "test: " + "x".repeat(200); // 200+ char reason
      const tx = await vaultWithSigner.agentSetWithdrawLimit(testUser, 1000n, longReason);
      const receipt = await tx.wait();

      console.log(`   Long reason length: ${longReason.length} chars`);
      expect(receipt.status).toBe(1);
    }, 60000);
  });

  describe("4. Error Handling & Edge Cases", () => {
    test("should fail when non-agent tries to set limit", async () => {
      // Create a different wallet (not the agent)
      const randomWallet = ethers.Wallet.createRandom().connect(provider);
      const vaultWithWrongSigner = new ethers.Contract(
        SIMPLE_VAULT_ADDRESS,
        SIMPLE_VAULT_ABI,
        randomWallet
      );

      // This should fail because randomWallet is not the configured agent
      await expect(async () => {
        const tx = await vaultWithWrongSigner.agentSetWithdrawLimit(
          agentAddress,
          1000n,
          "test: unauthorized"
        );
        await tx.wait();
      }).rejects.toThrow();

      console.log(`   ✓ Correctly rejected unauthorized agent`);
    }, 60000);

    test("should handle setting limit for non-existent user", async () => {
      const nonExistentUser = "0x0000000000000000000000000000000000000099";
      const tx = await vaultWithSigner.agentSetWithdrawLimit(
        nonExistentUser,
        5000n,
        "test: non-existent user"
      );
      await tx.wait();

      const limit = await vaultReadonly.recommendedWithdrawLimit(nonExistentUser);
      console.log(`   Limit for non-existent user: ${limit.toString()}`);
      expect(limit).toBe(5000n);
    }, 60000);

    test("should handle empty reason string", async () => {
      const tx = await vaultWithSigner.agentSetWithdrawLimit(agentAddress, 1234n, "");
      const receipt = await tx.wait();

      console.log(`   Empty reason accepted: ${receipt.hash}`);
      expect(receipt.status).toBe(1);
    }, 60000);
  });

  describe("5. Gas Usage Analysis", () => {
    test("should measure gas for setting withdraw limit", async () => {
      const testCases = [
        { limit: 1000n, reason: "short" },
        { limit: ethers.parseEther("1"), reason: "medium length reason string" },
        { limit: ethers.parseEther("100"), reason: "very long reason: " + "x".repeat(150) }
      ];

      console.log(`\n   Gas Usage Comparison:`);
      for (const { limit, reason } of testCases) {
        const tx = await vaultWithSigner.agentSetWithdrawLimit(agentAddress, limit, reason);
        const receipt = await tx.wait();

        console.log(`   Reason length ${reason.length}: ${receipt.gasUsed.toString()} gas`);
        expect(receipt.gasUsed).toBeGreaterThan(0n);
      }
    }, 120000);
  });

  describe("6. Integration with simpleVault.ts Module", () => {
    test("getSimpleVaultReadonly should work correctly", async () => {
      const vault = getSimpleVaultReadonly();
      const owner = await vault.owner();

      console.log(`   Module returned owner: ${owner}`);
      expect(owner).toMatch(/^0x[a-fA-F0-9]{40}$/);
    }, 30000);

    test("getSimpleVaultWithSigner should work correctly", async () => {
      const vault = getSimpleVaultWithSigner(AGENT_PRIVATE_KEY);
      const agent = await vault.agent();

      console.log(`   Module returned agent: ${agent}`);
      expect(agent).toMatch(/^0x[a-fA-F0-9]{40}$/);
    }, 30000);

    test("getProvider should return valid provider", async () => {
      const testProvider = getProvider();
      const network = await testProvider.getNetwork();

      console.log(`   Provider network: ${network.name} (${network.chainId})`);
      expect(network.chainId).toBe(338n);
    }, 30000);
  });

  describe("7. Real-World Scenario Tests", () => {
    test("should simulate agent decision workflow", async () => {
      const user = agentAddress;

      // Step 1: Read current state
      const balance = await vaultReadonly.balances(user);
      const currentLimit = await vaultReadonly.recommendedWithdrawLimit(user);

      console.log(`\n   📊 Agent Decision Workflow:`);
      console.log(`   1. Current balance: ${ethers.formatEther(balance)} CRO`);
      console.log(`   2. Current limit: ${ethers.formatEther(currentLimit)} CRO`);

      // Step 2: Agent calculates new limit (e.g., 40% of balance)
      const newLimit = (balance * 40n) / 100n;
      console.log(`   3. Calculated new limit (40%): ${ethers.formatEther(newLimit)} CRO`);

      // Step 3: Apply safety clamp (max 50%)
      const maxLimit = (balance * 50n) / 100n;
      const finalLimit = newLimit > maxLimit ? maxLimit : newLimit;
      console.log(`   4. After safety clamp: ${ethers.formatEther(finalLimit)} CRO`);

      // Step 4: Set limit on-chain
      const reason = `agent-test: balance=${balance} proposed=${newLimit} final=${finalLimit}`;
      const tx = await vaultWithSigner.agentSetWithdrawLimit(user, finalLimit, reason);
      const receipt = await tx.wait();

      console.log(`   5. Transaction confirmed: ${receipt.hash}`);

      // Step 5: Verify
      const verifyLimit = await vaultReadonly.recommendedWithdrawLimit(user);
      console.log(`   6. Verified on-chain limit: ${ethers.formatEther(verifyLimit)} CRO`);

      expect(verifyLimit).toBe(finalLimit);
    }, 60000);

    test("should handle rapid consecutive updates", async () => {
      console.log(`\n   ⚡ Rapid Update Test:`);
      const updates = [];

      // Send updates sequentially with proper nonce management
      for (let i = 0; i < 3; i++) {
        const limit = BigInt(i + 1) * 1000000000000000n;
        const tx = await vaultWithSigner.agentSetWithdrawLimit(
          agentAddress,
          limit,
          `test: rapid update ${i + 1}`
        );
        console.log(`   Sent update ${i + 1}: ${tx.hash}`);

        // Wait for each transaction to be confirmed before sending the next
        // This prevents nonce conflicts on the blockchain
        const receipt = await tx.wait();
        console.log(`   Confirmed ${i + 1}: block ${receipt.blockNumber}`);
        updates.push(receipt);
      }

      const finalLimit = await vaultReadonly.recommendedWithdrawLimit(agentAddress);
      console.log(`   Final limit: ${finalLimit.toString()}`);
      expect(finalLimit).toBe(3000000000000000n);
    }, 120000);
  });
});

