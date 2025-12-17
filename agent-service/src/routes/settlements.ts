import { Router } from "express";
import { getAgent, hasAgent, listAgents } from "../agents/registry.js";
import type { AgentContext } from "../agents/types.js";
import { clampLimit, sanitizeReason } from "../agents/clamp.js";
import { getSimpleVaultReadonly, getSimpleVaultWithSigner } from "../contracts/simpleVault.js";

const router = Router();
const paidJobs = new Set<string>();

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

router.post("/pay", (req, res) => {
  try {
    const jobId = mustString(req.body?.jobId, "jobId");
    paidJobs.add(jobId);
    return res.json({ status: "payment_accepted", jobId });
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

    // x402 gate (demo)
    if (!paidJobs.has(jobId)) {
      return res.status(402).json({
        error: "Payment Required",
        x402: {
          jobId,
          amount: "1.00",
          asset: "USDC",
          chain: "Cronos Testnet",
          recipient: "merchant-demo-address",
          memo: `x402 settlement job ${jobId}`
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
