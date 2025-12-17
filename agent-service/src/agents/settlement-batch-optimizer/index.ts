import type { Agent, AgentDecision, AgentContext } from "../types.js";

/**
 * Hackathon demo logic:
 * - If requestedAmount is provided, propose a limit that safely covers it,
 *   but stays conservative (requestedAmount or 40% of balance, whichever smaller).
 */
export const settlementBatchOptimizer: Agent = {
  id: "settlement-batch-optimizer",
  describe: () => ({
    name: "Settlement Batch Optimizer",
    summary:
      "After x402 payment, computes a safe cap for multi-step settlement execution and logs it on-chain."
  }),
  decide: async (ctx: AgentContext): Promise<AgentDecision> => {
    const b = ctx.balanceWei;
    const req = ctx.requestedAmountWei ?? 0n;

    // baseline: 40% of balance
    const baseline = (b * 40n) / 100n;

    // propose: cover requested amount if small; otherwise baseline
    const proposed = req > 0n ? (req < baseline ? req : baseline) : baseline;

    return {
      proposedLimitWei: proposed,
      reason:
        req > 0n
          ? `x402 settlement guardrail job=${ctx.jobId ?? "n/a"} reqWei=${req}`
          : `x402 settlement guardrail job=${ctx.jobId ?? "n/a"}`,
      confidence: 0.75
    };
  }
};
