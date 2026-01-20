import { Router } from "express";
import { getAgent, hasAgent, listAgents } from "../agents/registry.js";
import type { AgentContext } from "../agents/types.js";
import { clampLimit, sanitizeReason } from "../agents/clamp.js";
import { getSimpleVaultReadonly, getSimpleVaultWithSigner } from "../contracts/simpleVault.js";
import { checkJobPayment, getSettlementFee, getPaymentRecipient } from "../contracts/settlementPayment.js";
import { ethers } from "ethers";

const router = Router();

function mustString(x: any, name: string): string {
  if (!x || typeof x !== "string") throw new Error(`Missing/invalid ${name}`);
  return x;
}

function parseWeiOptional(x: any): bigint | undefined {
  if (x === undefined || x === null || x === "") return undefined;
  const s = String(x);
  if (!/^\d+$/.test(s)) return undefined;
  return BigInt(s);
}

/**
 * GET /settlement/payment-info
 * Returns payment information for settlements
 */
router.get("/payment-info", async (req, res) => {
  try {
    const fee = await getSettlementFee();
    const recipient = await getPaymentRecipient();
    const contractAddress = process.env.SETTLEMENT_PAYMENT_ADDRESS;

    return res.json({
      contractAddress,
      fee: fee.toString(),
      feeInCRO: ethers.formatEther(fee),
      recipient,
      chainId: 338,
      chainName: "Cronos Testnet",
      instructions: "Send payment via MetaMask by calling payForSettlement(jobId) with the fee amount"
    });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Failed to get payment info" });
  }
});

/**
 * POST /settlement/verify-payment
 * Verify if a job has been paid for on-chain
 */
router.post("/verify-payment", async (req, res) => {
  try {
    const jobId = mustString(req.body?.jobId, "jobId");

    const payment = await checkJobPayment(jobId);

    if (payment.isPaid) {
      return res.json({
        status: "paid",
        jobId,
        payer: payment.payer,
        amount: payment.amount.toString(),
        amountInCRO: ethers.formatEther(payment.amount)
      });
    } else {
      return res.json({
        status: "unpaid",
        jobId
      });
    }
  } catch (e: any) {
    return res.status(400).json({ error: e?.message || "Bad request" });
  }
});

/**
 * POST /settlement/run
 * Body:
 * {
 *   "jobId": "job-001",
 *   "user": "0x...",
 *   "agentId": "settlement-batch-optimizer",
 *   "requestedAmountWei": "123..." (optional)
 * }
 */
router.post("/run", async (req, res) => {
  try {
    const jobId = mustString(req.body?.jobId, "jobId");
    const user = mustString(req.body?.user, "user");
    const agentIdRaw = mustString(req.body?.agentId, "agentId");

    // x402 gate - verify on-chain payment
    const payment = await checkJobPayment(jobId);

    if (!payment.isPaid) {
      const fee = await getSettlementFee();
      const recipient = await getPaymentRecipient();
      const contractAddress = process.env.SETTLEMENT_PAYMENT_ADDRESS;

      return res.status(402).json({
        error: "Payment Required",
        x402: {
          jobId,
          contractAddress,
          amount: ethers.formatEther(fee),
          amountWei: fee.toString(),
          asset: "TCRO",
          chain: "Cronos Testnet",
          chainId: 338,
          recipient,
          memo: `x402 settlement job ${jobId}`,
          instructions: "Call payForSettlement(jobId) on the SettlementPayment contract with the fee amount"
        }
      });
    }

    // Validate agentId (clean UX)
    if (!hasAgent(agentIdRaw)) {
      return res.status(400).json({
        status: "error",
        reason: "UNKNOWN_AGENT",
        providedAgentId: agentIdRaw,
        availableAgents: listAgents().map((a) => a.id)
      });
    }

    const agentId = agentIdRaw; // narrowed to AgentId
    const requestedAmountWei = parseWeiOptional(req.body?.requestedAmountWei);

    // Read on-chain state
    const vaultRO = getSimpleVaultReadonly();
    const balanceWei: bigint = await vaultRO.balances(user);
    const currentLimitWei: bigint = await vaultRO.recommendedWithdrawLimit(user);

    // Decide via selected agent (AI-agnostic route)
    const agent = getAgent(agentId);
    const ctx: AgentContext = {
      user,
      nowTs: Math.floor(Date.now() / 1000),
      balanceWei,
      currentLimitWei,
      jobId,
      requestedAmountWei,
      riskTrigger: "NONE"
    };

    const decision = await agent.decide(ctx);

    // Clamp (deterministic safety envelope)
    const maxPct = parseInt(process.env.MAX_RECOMMEND_PCT || "50", 10);
    const maxAbsWei = process.env.MAX_RECOMMEND_WEI ? BigInt(process.env.MAX_RECOMMEND_WEI) : null;

    const { finalWei, notes } = clampLimit({
      balanceWei,
      proposedLimitWei: decision.proposedLimitWei,
      maxPct,
      maxAbsWei
    });

    // ENFORCEMENT (A): refuse execution if request exceeds recommended limit
    if (requestedAmountWei !== undefined && requestedAmountWei > finalWei) {
      return res.status(409).json({
        status: "refused",
        reason: "REQUEST_EXCEEDS_AI_RECOMMENDED_LIMIT",
        policy: {
          agentId,
          requestedAmountWei: requestedAmountWei.toString(),
          recommendedLimitWei: finalWei.toString()
        },
        guidance: "Reduce the requested amount or wait for limits to be adjusted."
      });
    }

    // Write on-chain advisory (only after passing enforcement)
    const agentKey = process.env.AGENT_PRIVATE_KEY;
    if (!agentKey) throw new Error("AGENT_PRIVATE_KEY not configured");

    const vault = getSimpleVaultWithSigner(agentKey);
    const finalReason = sanitizeReason(
      `x402 job=${jobId} agent=${agent.id} | ${decision.reason} | clamp: ${notes}`
    );

    const tx = await vault.agentSetWithdrawLimit(user, finalWei, finalReason);
    await tx.wait();

    // Execute “pipeline” (demo)
    const pipeline = ["validate balances", "calculate fees", "route payouts", "finalize settlement"];

    return res.json({
      status: "settlement_executed",
      jobId,
      agentId: agent.id,
      onChain: { txHash: tx.hash, recommendedLimitWei: finalWei.toString() },
      decision: {
        proposedLimitWei: decision.proposedLimitWei.toString(),
        finalLimitWei: finalWei.toString(),
        confidence: decision.confidence
      },
      pipeline
    });
  } catch (e: any) {
    return res.status(400).json({ error: e?.message || "Bad request" });
  }
});

export default router;
