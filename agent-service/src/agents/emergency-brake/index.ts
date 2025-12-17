import type { Agent, AgentDecision, AgentContext } from "../types";

/**
 * Minimal demo logic:
 * - If riskTrigger is present, aggressively tighten to 10% of balance
 * - Otherwise do a mild tightening to 25%
 */
export const emergencyBrake: Agent = {
  id: "emergency-brake",
  describe: () => ({
    name: "Emergency Brake",
    summary: "Crisis-mode limiter that temporarily clamps recommended limits under abnormal conditions."
  }),
  decide: async (ctx: AgentContext): Promise<AgentDecision> => {
    const b = ctx.balanceWei;

    const severe = ctx.riskTrigger && ctx.riskTrigger !== "NONE";
    const pct = severe ? 10n : 25n;

    const proposed = (b * pct) / 100n;

    return {
      proposedLimitWei: proposed,
      reason: severe
        ? `emergency-brake: trigger=${ctx.riskTrigger} → clamp to 10%`
        : `emergency-brake: precautionary clamp to 25%`,
      confidence: severe ? 0.85 : 0.6
    };
  }
};
