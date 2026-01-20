// Agent Types
export type AgentId =
  | "settlement-batch-optimizer"
  | "withdrawal-risk-sentinel"
  | "emergency-brake"
  | "gas-fee-monitor"
  | "02portfolio-rebalancer-ai";

export type AgentType = "deterministic" | "ai";
export type AgentMode = "auto" | "recommend";
export type AgentStatus = "active" | "paused" | "override";

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  mode: AgentMode;
  status: AgentStatus;
  lastDecision: string | null;
  lastAction: string | null;
  description: string;
  guardrails: string[];
  decisions: AgentDecision[];
}

export interface AgentDecision {
  timestamp: string;
  action: string;
  reason: string;
}

// Vault Types
export interface VaultBalance {
  total: number;
  currency: string;
  lastUpdated: string;
}

export interface AgentStates {
  active: number;
  paused: number;
  override: number;
}

export interface BalanceHistoryPoint {
  timestamp: string;
  balance: number;
  riskScore: number;
}

export interface RiskPosture {
  level: "low" | "medium" | "high" | "critical";
  score: number;
  description: string;
}

// Event Types
export interface RecentEvent {
  timestamp: string;
  type: string;
  agent: string;
  txHash: string | null;
  outcome: string;
}

// x402 Types
export interface X402Transaction {
  id: string;
  timestamp: string;
  action: string;
  amount: number | null;
  currency: string | null;
  status: "pending" | "completed" | "failed";
  paymentMethod: string;
  paymentAmount: number;
  paymentCurrency: string;
  txHash: string;
  steps: X402Step[];
}

export interface X402Step {
  step: number;
  status: "pending" | "completed" | "failed";
  timestamp: string;
  label: string;
}

// Log Types
export interface LogEntry {
  timestamp: string;
  severity: "info" | "warn" | "error";
  agent: string;
  subsystem: string;
  message: string;
}

export interface AuditLogEntry {
  timestamp: string;
  action: string;
  user: string;
  details: string;
}

// System Status
export type SystemStatus = "healthy" | "degraded" | "critical";

