// Types matching the agent-service API responses

export type AgentId =
  | "settlement-batch-optimizer"
  | "withdrawal-risk-sentinel"
  | "emergency-brake"
  | "02portfolio-rebalancer-ai";

export type RiskTrigger = "NONE" | "VOLATILITY_SPIKE" | "ANOMALY";

export interface AgentInfo {
  id: AgentId;
  name: string;
  description: string;
}

export interface AgentListResponse {
  status: "ok";
  aiEnabled: boolean;
  agents: AgentInfo[];
}

export interface AgentApplyRequest {
  agentId: AgentId;
  user: string;
  jobId?: string;
  requestedAmountWei?: string;
  riskTrigger?: RiskTrigger;
}

export interface AgentApplyResponse {
  status: "submitted";
  mode: "ai" | "fallback";
  agentId: AgentId;
  user: string;
  onChain: {
    txHash: string;
  };
  state: {
    balanceWei: string;
    previousRecommendedWei: string;
  };
  decision: {
    proposedLimitWei: string;
    finalLimitWei: string;
    confidence: number;
    reason: string;
    clampNotes: string;
  };
}

export interface SettlementPayRequest {
  jobId: string;
}

export interface SettlementPayResponse {
  status: "payment_accepted";
  jobId: string;
}

export interface SettlementRunRequest {
  jobId: string;
  user: string;
  agentId: AgentId;
  requestedAmountWei?: string;
}

export interface SettlementRunResponse {
  status: "settlement_executed";
  jobId: string;
  agentId: AgentId;
  onChain: {
    txHash: string;
    recommendedLimitWei: string;
  };
  decision: {
    proposedLimitWei: string;
    finalLimitWei: string;
    confidence: number;
  };
  pipeline: string[];
}

export interface SettlementRefusedResponse {
  status: "refused";
  reason: string;
  policy: {
    agentId: AgentId;
    requestedAmountWei: string;
    recommendedLimitWei: string;
  };
  guidance: string;
}

export interface X402PaymentRequired {
  error: "Payment Required";
  x402: {
    jobId: string;
    amount: string;
    asset: string;
    chain: string;
    recipient: string;
    memo: string;
  };
}

export interface ErrorResponse {
  error: string;
}

