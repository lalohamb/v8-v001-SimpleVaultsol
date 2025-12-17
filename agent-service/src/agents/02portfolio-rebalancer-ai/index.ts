import type { Agent, AgentDecision, AgentContext } from "../types.js";

/**
 * Toggle rules (non-breaking):
 * - If ENABLE_AI_AGENTS !== "true" -> deterministic fallback
 * - If OPENAI_API_KEY missing -> deterministic fallback
 * - Only instantiate OpenAI INSIDE decide()
 */

function deterministicFallback(ctx: AgentContext): AgentDecision {
  // Conservative default: 20% of balance
  const baseline = (ctx.balanceWei * 20n) / 100n;

  // If requestedAmount is present, allow only if below baseline
  const req = ctx.requestedAmountWei ?? 0n;
  const proposed = req > 0n ? (req < baseline ? req : baseline) : baseline;

  return {
    proposedLimitWei: proposed,
    reason: `fallback: rebalance cap job=${ctx.jobId ?? "n/a"} reqWei=${req}`,
    confidence: 0.6
  };
}

function parseAiJson(raw: string): { proposedLimitWei: bigint; reason: string; confidence: number } {
  const obj = JSON.parse(raw);

  const proposedStr = obj?.proposedLimitWei;
  if (typeof proposedStr !== "string" || !/^\d+$/.test(proposedStr)) {
    throw new Error("AI output proposedLimitWei must be a base-10 integer string");
  }

  const reason = typeof obj.reason === "string" ? obj.reason : "no reason";
  const confidence =
    typeof obj.confidence === "number" && obj.confidence >= 0 && obj.confidence <= 1 ? obj.confidence : 0.5;

  return { proposedLimitWei: BigInt(proposedStr), reason, confidence };
}

export const portfolioRebalancerAI: Agent = {
  id: "02portfolio-rebalancer-ai",
  describe: () => ({
    name: "02 Portfolio Rebalancer (AI, toggleable)",
    summary:
      "If enabled, uses an LLM to propose a conservative settlement/rebalance budget cap; otherwise falls back to deterministic rules."
  }),

  decide: async (ctx: AgentContext): Promise<AgentDecision> => {
    const enabled = process.env.ENABLE_AI_AGENTS === "true";
    const apiKey = process.env.OPENAI_API_KEY;

    // Fail-closed: deterministic if not enabled or no key
    if (!enabled || !apiKey) return deterministicFallback(ctx);

    // Lazy import + lazy instantiation (prevents startup crash)
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({ apiKey });

    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    const prompt = {
      task: "Propose a conservative cap (wei) for a portfolio rebalance/settlement batch.",
      constraints: [
        "Return ONLY valid JSON (no markdown).",
        "proposedLimitWei must be a base-10 integer string (wei).",
        "confidence must be 0..1.",
        "reason must be short (<= 160 chars)."
      ],
      context: {
        jobId: ctx.jobId ?? "n/a",
        user: ctx.user,
        balanceWei: ctx.balanceWei.toString(),
        currentLimitWei: ctx.currentLimitWei.toString(),
        requestedAmountWei: (ctx.requestedAmountWei ?? 0n).toString(),
        riskTrigger: ctx.riskTrigger ?? "NONE"
      },
      outputSchema: { proposedLimitWei: "string", reason: "string", confidence: "number" }
    };

    try {
      const resp = await client.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content:
              "You are a cautious risk manager. Propose small caps. Do not execute trades. The service clamps/enforces limits deterministically."
          },
          { role: "user", content: JSON.stringify(prompt) }
        ]
      });

      const content = resp.choices?.[0]?.message?.content?.trim();
      if (!content) return deterministicFallback(ctx);

      const parsed = parseAiJson(content);

      return {
        proposedLimitWei: parsed.proposedLimitWei,
        reason: `ai: ${parsed.reason}`.slice(0, 160),
        confidence: parsed.confidence
      };
    } catch {
      return deterministicFallback(ctx);
    }
  }
};
