import type { Agent, AgentDecision, AgentContext } from "../types";

/**
 * Minimal demo logic:
 * - If current limit is 0, suggest 50% of balance
 * - If current limit exists, nudge slightly down to show “dynamic risk response”
 */
export const withdrawalRiskSentinel: Agent = {
  id: "withdrawal-risk-sentinel",
  describe: () => ({
    name: "Withdrawal Risk Sentinel",
    summary: "Monitors the account state and recommends a safe withdrawal limit; emits an auditable on-chain reason."
  }),
  decide: async (ctx: AgentContext): Promise<AgentDecision> => {
    const b = ctx.balanceWei;
    const current = ctx.currentLimitWei;

    const half = (b * 50n) / 100n;
    const proposed = current > 0n ? (current * 95n) / 100n : half;

    return {
      proposedLimitWei: proposed,
      reason: current > 0n
        ? `risk-sentinel: tightening limit by 5% from current to reduce sudden-drain risk`
        : `risk-sentinel: initial safe limit at 50% of balance`,
      confidence: 0.7
    };
  }
};
