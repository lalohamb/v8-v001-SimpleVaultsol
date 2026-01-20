export type AgentId =
  | "settlement-batch-optimizer"
  | "withdrawal-risk-sentinel"
  | "emergency-brake"
  | "gas-fee-monitor"
  | "02portfolio-rebalancer-ai";

export type AgentContext = {
  user: string;
  nowTs: number;

  balanceWei: bigint;
  currentLimitWei: bigint;

  // Optional job inputs (x402 / workflows)
  jobId?: string;
  requestedAmountWei?: bigint;

  // Optional: demo / triggers
  riskTrigger?: "NONE" | "VOLATILITY_SPIKE" | "ANOMALY";
};

export type AgentDecision = {
  proposedLimitWei: bigint;
  reason: string;       // <= 200 chars (enforced later)
  confidence: number;   // 0..1
};

export type AgentResult = AgentDecision & {
  finalLimitWei: bigint;
  clampNotes: string;
};

export type Agent = {
  id: AgentId;
  describe: () => { name: string; summary: string };
  decide: (ctx: AgentContext) => Promise<AgentDecision>;
};
