import { Router } from "express";
import { listAgents, getAgent } from "../agents/registry.js";
import type { AgentId, AgentContext } from "../agents/types.js";
import { clampLimit, sanitizeReason } from "../agents/clamp.js";
import { getSimpleVaultReadonly, getSimpleVaultWithSigner } from "../contracts/simpleVault.js";
import fs from "fs";
import path from "path";

const router = Router();

function mustString(x: any, name: string): string {
  if (!x || typeof x !== "string") throw new Error(`Missing/invalid ${name}`);
  return x;
}

function parseWeiOptional(x: any): bigint | undefined {
  if (x === undefined || x === null || x === "") return undefined;
  if (typeof x === "string" && /^\d+$/.test(x)) return BigInt(x);
  if (typeof x === "number" && Number.isFinite(x) && x >= 0) return BigInt(Math.floor(x));
  throw new Error("requestedAmountWei must be a base-10 integer string (wei)");
}

//router.get("/list", (_req, res) => res.json({ agents: listAgents() }));
router.get("/list", (_req, res) => {
  return res.json({
    status: "ok",
    aiEnabled: process.env.ENABLE_AI_AGENTS === "true" && !!process.env.OPENAI_API_KEY,
    agents: listAgents()
  });
});

/**
 * POST /agents/apply
 * Body:
 * {
 *   "agentId": "withdrawal-risk-sentinel",
 *   "user": "0x...",
 *   "jobId": "job-001",                (optional)
 *   "requestedAmountWei": "123...",    (optional)
 *   "riskTrigger": "VOLATILITY_SPIKE"  (optional)
 * }
 */
router.post("/apply", async (req, res) => {
  try {
    const agentId = mustString(req.body?.agentId, "agentId") as AgentId;
    const user = mustString(req.body?.user, "user");

    const jobId = req.body?.jobId ? String(req.body.jobId) : undefined;
    const requestedAmountWei = parseWeiOptional(req.body?.requestedAmountWei);
    const riskTrigger = req.body?.riskTrigger ? String(req.body.riskTrigger) : "NONE";

    const agent = getAgent(agentId);

    // Read on-chain state
    const vaultRO = getSimpleVaultReadonly();
    const balanceWei: bigint = await vaultRO.balances(user);
    const currentLimitWei: bigint = await vaultRO.recommendedWithdrawLimit(user);

    const ctx: AgentContext = {
      user,
      nowTs: Math.floor(Date.now() / 1000),
      balanceWei,
      currentLimitWei,
      jobId,
      requestedAmountWei,
      riskTrigger: riskTrigger as any
    };

    // Agent proposes
    const decision = await agent.decide(ctx);
    const mode =
      decision.reason.startsWith("ai:")
        ? "ai"
        : "fallback";


    // Clamp policy (defaults; override per agent later if desired)
    const maxPct = parseInt(process.env.MAX_RECOMMEND_PCT || "50", 10);
    const maxAbsWei = process.env.MAX_RECOMMEND_WEI ? BigInt(process.env.MAX_RECOMMEND_WEI) : null;

    const { finalWei, notes } = clampLimit({
      balanceWei,
      proposedLimitWei: decision.proposedLimitWei,
      maxPct,
      maxAbsWei
    });

    const finalReason = sanitizeReason(
      `${agent.id}: ${decision.reason} | clamp: ${notes}`
    );

    // Write on-chain (requires agent key)
    const agentKey = process.env.AGENT_PRIVATE_KEY;
    if (!agentKey) throw new Error("AGENT_PRIVATE_KEY not configured");

    const vault = getSimpleVaultWithSigner(agentKey);
    const tx = await vault.agentSetWithdrawLimit(user, finalWei, finalReason);
    const receipt = await tx.wait();

    return res.json({
      status: "submitted",
      mode,
      agentId: agent.id,
      user,
      onChain: { txHash: receipt?.hash ?? tx.hash },
      state: {
        balanceWei: balanceWei.toString(),
        previousRecommendedWei: currentLimitWei.toString()
      },
      decision: {
        proposedLimitWei: decision.proposedLimitWei.toString(),
        finalLimitWei: finalWei.toString(),
        confidence: decision.confidence,
        reason: decision.reason,
        clampNotes: notes
      }
    });
  } catch (e: any) {
    return res.status(400).json({ error: e?.message || "Bad request" });
  }
});

/**
 * POST /agents/toggle-ai
 * Body: { "enabled": true/false }
 * Toggles AI mode on/off by updating the ENABLE_AI_AGENTS env variable
 */
router.post("/toggle-ai", async (req, res) => {
  try {
    const enabled = req.body?.enabled === true;

    // Update the environment variable in memory
    process.env.ENABLE_AI_AGENTS = enabled ? "true" : "false";

    // Also update the .env file for persistence
    const envPath = path.join(process.cwd(), ".env");

    try {
      let envContent = "";
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, "utf-8");
      }

      // Update or add ENABLE_AI_AGENTS
      const lines = envContent.split("\n");
      let found = false;
      const updatedLines = lines.map(line => {
        if (line.startsWith("ENABLE_AI_AGENTS=")) {
          found = true;
          return `ENABLE_AI_AGENTS=${enabled}`;
        }
        return line;
      });

      if (!found) {
        updatedLines.push(`ENABLE_AI_AGENTS=${enabled}`);
      }

      fs.writeFileSync(envPath, updatedLines.join("\n"));
    } catch (fileError) {
      console.warn("Could not update .env file:", fileError);
      // Continue anyway - the in-memory change is what matters for current session
    }

    const aiEnabled = process.env.ENABLE_AI_AGENTS === "true" && !!process.env.OPENAI_API_KEY;

    return res.json({
      status: "ok",
      aiEnabled,
      message: `AI mode ${aiEnabled ? "enabled" : "disabled"}`
    });
  } catch (e: any) {
    return res.status(400).json({ error: e?.message || "Bad request" });
  }
});

export default router;
