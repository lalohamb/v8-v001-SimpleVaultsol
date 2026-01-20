import type { Agent, AgentId } from "./types";

import { settlementBatchOptimizer } from "./settlement-batch-optimizer/index.js";
import { withdrawalRiskSentinel } from "./withdrawal-risk-sentinel/index.js";
import { emergencyBrake } from "./emergency-brake/index.js";
import { gasFeeMonitor } from "./gas-fee-monitor/index.js";

import { portfolioRebalancerAI } from "./02portfolio-rebalancer-ai/index.js";

const AGENTS: Record<AgentId, Agent> = {
  "settlement-batch-optimizer": settlementBatchOptimizer,
  "withdrawal-risk-sentinel": withdrawalRiskSentinel,
  "emergency-brake": emergencyBrake,
  "gas-fee-monitor": gasFeeMonitor,
  "02portfolio-rebalancer-ai": portfolioRebalancerAI
};

// Minimal metadata: governance-friendly and UI-ready
const AGENT_META: Record<AgentId, { aiCapable: boolean }> = {
  "settlement-batch-optimizer": { aiCapable: false },
  "withdrawal-risk-sentinel": { aiCapable: false },
  "emergency-brake": { aiCapable: false },
  "gas-fee-monitor": { aiCapable: false },
  "02portfolio-rebalancer-ai": { aiCapable: true }
};

export function hasAgent(agentId: string): agentId is AgentId {
  return agentId in AGENTS;
}

export function getAgent(agentId: AgentId): Agent {
  return AGENTS[agentId];
}

export function isAiCapable(agentId: AgentId): boolean {
  return AGENT_META[agentId]?.aiCapable === true;
}

export function listAgents(): Array<{ id: AgentId; name: string; summary: string; aiCapable: boolean }> {
  return (Object.keys(AGENTS) as AgentId[]).map((id) => {
    const d = AGENTS[id].describe();
    return { id, name: d.name, summary: d.summary, aiCapable: isAiCapable(id) };
  });
}
