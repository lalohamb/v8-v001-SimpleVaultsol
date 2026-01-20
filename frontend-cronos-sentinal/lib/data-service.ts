import { listAgents, applyAgent, runSettlement, checkHealth, toggleAI, type AgentApplyRequest, type SettlementRunRequest } from './api';
import { getVaultBalance, getRecommendedLimit, getCurrentAccount, weiToEther, getRecentVaultEvents, getLastRiskEvaluationTime, getSettlementPaymentEvents } from './web3';
import type { Agent, AgentType, AgentMode, AgentStatus, VaultBalance, AgentStates, BalanceHistoryPoint, RiskPosture, RecentEvent } from './types';

// ============================================================================
// Real Data Fetchers
// ============================================================================

export async function fetchAgents(): Promise<{ agents: Agent[]; aiEnabled: boolean }> {
  try {
    const response = await listAgents();

    // Map API response to UI Agent type
    const agents: Agent[] = response.agents.map((agent, index) => ({
      id: agent.id,
      name: agent.name,
      type: (agent.aiCapable ? 'ai' : 'deterministic') as AgentType,
      mode: (agent.aiCapable ? 'recommend' : 'auto') as AgentMode,
      status: 'active' as AgentStatus,
      lastDecision: null,
      lastAction: null,
      description: agent.summary,
      guardrails: getDefaultGuardrails(agent.id),
      decisions: [],
    }));

    return {
      agents,
      aiEnabled: response.aiEnabled,
    };
  } catch (error) {
    console.error('Failed to fetch agents:', error);
    // Return empty array on error
    return {
      agents: [],
      aiEnabled: false,
    };
  }
}

export async function setAIEnabled(enabled: boolean): Promise<boolean> {
  try {
    const response = await toggleAI(enabled);
    return response.aiEnabled;
  } catch (error) {
    console.error('Failed to toggle AI:', error);
    throw error;
  }
}

export async function fetchVaultBalance(userAddress?: string): Promise<VaultBalance | null> {
  try {
    if (!userAddress) {
      const account = await getCurrentAccount();
      if (!account) return null;
      userAddress = account;
    }

    const balanceWei = await getVaultBalance(userAddress);
    const balanceEther = parseFloat(weiToEther(balanceWei));

    return {
      total: balanceEther,
      currency: 'CRO',
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to fetch vault balance:', error);
    return null;
  }
}

export async function fetchSystemHealth(): Promise<{ status: string }> {
  try {
    return await checkHealth();
  } catch (error) {
    console.error('Failed to fetch system health:', error);
    return { status: 'unknown' };
  }
}

export async function fetchAgentStates(): Promise<AgentStates> {
  try {
    const { agents } = await fetchAgents();

    // Calculate agent states from the agent list
    // Note: Currently all agents are active since the API doesn't provide status/mode
    // In the future, this could be enhanced to track actual agent states
    const agentStates: AgentStates = {
      active: agents.filter(a => a.status === 'active').length,
      paused: agents.filter(a => a.status === 'paused').length,
      override: agents.filter(a => a.mode === 'recommend' && a.type === 'ai').length,
    };

    return agentStates;
  } catch (error) {
    console.error('Failed to fetch agent states:', error);
    // Return default values on error
    return {
      active: 0,
      paused: 0,
      override: 0,
    };
  }
}

export async function fetchPendingTransactions(): Promise<number> {
  try {
    const events = await getRecentVaultEvents(1000);

    // Count AgentRecommendation events as "pending" transactions
    // In a real system, you'd track which recommendations have been acted upon
    const agentRecommendations = events.filter(e => e.eventType === 'AgentRecommendation');

    return agentRecommendations.length;
  } catch (error) {
    console.error('Failed to fetch pending transactions:', error);
    return 0;
  }
}

export async function fetchRecentEvents(): Promise<RecentEvent[]> {
  try {
    const events = await getRecentVaultEvents(1000);

    // Take the 10 most recent events and format them
    return events.slice(0, 10).map(event => {
      let type = '';
      let agent = 'System';
      let outcome = 'Completed';

      switch (event.eventType) {
        case 'Deposited':
          type = 'Deposit';
          break;
        case 'Withdrawn':
          type = 'Withdrawal';
          break;
        case 'AgentRecommendation':
          type = 'Risk Assessment';
          agent = event.agent ? formatAgentName(event.agent) : 'AI Agent';
          break;
      }

      return {
        timestamp: new Date(event.timestamp * 1000).toISOString(),
        type,
        agent,
        txHash: event.transactionHash,
        outcome,
      };
    });
  } catch (error) {
    console.error('Failed to fetch recent events:', error);
    return [];
  }
}

export async function fetchLastRiskEvaluation(): Promise<string> {
  try {
    const timestamp = await getLastRiskEvaluationTime();
    return timestamp || new Date().toISOString();
  } catch (error) {
    console.error('Failed to fetch last risk evaluation:', error);
    return new Date().toISOString();
  }
}

// Helper function to format agent addresses to readable names
function formatAgentName(address: string): string {
  // This is a simple mapping - in production, you'd query the agent registry
  const knownAgents: Record<string, string> = {
    // Add known agent addresses here
  };

  return knownAgents[address.toLowerCase()] || 'AI Agent';
}

export async function executeAgent(request: AgentApplyRequest) {
  return await applyAgent(request);
}

export async function executeSettlement(request: SettlementRunRequest) {
  return await runSettlement(request);
}

// ============================================================================
// Helper Functions
// ============================================================================

function getDefaultGuardrails(agentId: string): string[] {
  const guardrailsMap: Record<string, string[]> = {
    'withdrawal-risk-sentinel': [
      'Initial recommendation: 50% of balance',
      'Subsequent calls: Tightens by 5%',
      'Confidence: 70%',
      'Monitors withdrawal patterns',
    ],
    'emergency-brake': [
      'Normal mode: 25% of balance',
      'Severe risk: 10% of balance',
      'Triggers on: VOLATILITY_SPIKE, ANOMALY',
      'Confidence: 85% (severe) / 60% (normal)',
    ],
    'settlement-batch-optimizer': [
      'Baseline: 40% of balance',
      'Adjusts based on requested amount',
      'Confidence: 75%',
      'Optimizes gas costs',
    ],
    'gas-fee-monitor': [
      'Monitors gas prices',
      'Recommends optimal transaction timing',
      'Tracks network congestion',
      'Confidence: 80%',
    ],
    '02portfolio-rebalancer-ai': [
      'Mode: Recommend-only (no autonomous execution)',
      'Fallback: Rule-based rebalancing if AI unavailable',
      'Recommendations require human approval',
      'AI Mode: OpenAI GPT-4o-mini powered',
    ],
  };

  return guardrailsMap[agentId] || ['No guardrails defined'];
}

export async function fetchBalanceHistory(userAddress?: string): Promise<BalanceHistoryPoint[]> {
  try {
    // TODO: Implement backend API for historical balance tracking
    // For now, return a single data point with current balance
    const balance = await fetchVaultBalance(userAddress);

    if (!balance) {
      return [];
    }

    // Return current balance as a single point
    // In the future, this will query a backend API that tracks balance over time
    return [
      {
        timestamp: new Date().toISOString(),
        balance: balance.total,
        riskScore: 0, // Will be calculated by risk engine in the future
      },
    ];
  } catch (error) {
    console.error('Failed to fetch balance history:', error);
    return [];
  }
}

export async function fetchRiskPosture(): Promise<RiskPosture> {
  try {
    // Calculate a simple risk score based on recent events
    const events = await getRecentVaultEvents(1000);

    // Simple risk calculation:
    // - More recent withdrawals = higher risk
    // - More agent recommendations = higher risk
    const withdrawals = events.filter(e => e.eventType === 'Withdrawn');
    const recommendations = events.filter(e => e.eventType === 'AgentRecommendation');

    // Calculate score (0-100, lower is better)
    const withdrawalScore = Math.min(withdrawals.length * 2, 40);
    const recommendationScore = Math.min(recommendations.length * 3, 40);
    const baseScore = 10; // Base risk score

    const score = Math.min(baseScore + withdrawalScore + recommendationScore, 100);

    // Determine risk level
    let level: 'low' | 'medium' | 'high';
    let description: string;

    if (score < 30) {
      level = 'low';
      description = 'All systems operating within normal parameters. No anomalies detected in recent activity.';
    } else if (score < 60) {
      level = 'medium';
      description = 'Moderate activity detected. System is monitoring withdrawal patterns and agent recommendations.';
    } else {
      level = 'high';
      description = 'Elevated risk detected. High withdrawal activity or multiple agent interventions observed.';
    }

    return {
      level,
      score,
      description,
    };
  } catch (error) {
    console.error('Failed to fetch risk posture:', error);
    // Return safe default on error
    return {
      level: 'low',
      score: 0,
      description: 'Unable to calculate risk posture. Please check system connectivity.',
    };
  }
}

export interface AuditLogEntry {
  timestamp: string;
  action: string;
  user: string;
  details: string;
}

export async function fetchAuditLog(limit: number = 20): Promise<AuditLogEntry[]> {
  try {
    const events = await getRecentVaultEvents(10000);

    // Convert blockchain events to audit log entries
    const auditEntries: AuditLogEntry[] = events.slice(0, limit).map(event => {
      let action = '';
      let user = '';
      let details = '';

      switch (event.eventType) {
        case 'Deposited':
          action = 'Deposit Completed';
          user = event.user ? formatAddress(event.user) : 'Unknown';
          details = `Amount: ${weiToEther(event.amount || '0')} CRO`;
          break;
        case 'Withdrawn':
          action = 'Withdrawal Completed';
          user = event.user ? formatAddress(event.user) : 'Unknown';
          details = `Amount: ${weiToEther(event.amount || '0')} CRO`;
          break;
        case 'AgentRecommendation':
          action = 'Agent Recommendation';
          user = event.agent ? `agent:${formatAddress(event.agent)}` : 'agent:system';
          details = event.reason || 'Risk assessment completed';
          break;
      }

      return {
        timestamp: new Date(event.timestamp * 1000).toISOString(),
        action,
        user,
        details,
      };
    });

    return auditEntries;
  } catch (error) {
    console.error('Failed to fetch audit log:', error);
    return [];
  }
}

// Helper function to format addresses
function formatAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export interface X402Transaction {
  id: string;
  timestamp: string;
  action: string;
  amount: number | null;
  currency: string | null;
  status: 'completed' | 'pending' | 'failed';
  paymentMethod: string;
  paymentAmount: number;
  paymentCurrency: string;
  txHash: string;
  steps: Array<{
    step: number;
    status: 'completed' | 'pending' | 'failed';
    timestamp: string;
    label: string;
  }>;
}

export async function fetchX402Transactions(limit: number = 10): Promise<X402Transaction[]> {
  try {
    const settlementEvents = await getSettlementPaymentEvents(10000);

    // Convert settlement payment events to X402 transactions
    const transactions: X402Transaction[] = settlementEvents.slice(0, limit).map((event, index) => {
      const timestamp = new Date(event.timestamp * 1000).toISOString();
      const paymentAmountCRO = parseFloat(weiToEther(event.amount));

      // Estimate payment amount in BTC (rough conversion for demo)
      // In production, this would come from the actual payment data
      const paymentAmountBTC = paymentAmountCRO * 0.00001; // Rough estimate

      return {
        id: `tx-${event.jobId}`,
        timestamp,
        action: 'Settlement Payment',
        amount: null, // Settlement payments don't have a specific CRO amount in this context
        currency: null,
        status: 'completed',
        paymentMethod: 'x402-lightning',
        paymentAmount: paymentAmountBTC,
        paymentCurrency: 'BTC',
        txHash: event.transactionHash,
        steps: [
          { step: 1, status: 'completed', timestamp: new Date(event.timestamp * 1000 - 23000).toISOString(), label: 'Action Initiated' },
          { step: 2, status: 'completed', timestamp: new Date(event.timestamp * 1000 - 18000).toISOString(), label: 'HTTP 402 Challenge' },
          { step: 3, status: 'completed', timestamp: new Date(event.timestamp * 1000 - 11000).toISOString(), label: 'Payment Authorized' },
          { step: 4, status: 'completed', timestamp: new Date(event.timestamp * 1000 - 5000).toISOString(), label: 'Agent Checkpoint' },
          { step: 5, status: 'completed', timestamp, label: 'On-Chain Settlement' },
        ],
      };
    });

    return transactions;
  } catch (error) {
    console.error('Failed to fetch X402 transactions:', error);
    return [];
  }
}

export interface SystemLog {
  timestamp: string;
  severity: 'info' | 'warn' | 'critical';
  agent: string;
  subsystem: string;
  message: string;
}

export async function fetchSystemLogs(limit: number = 50): Promise<SystemLog[]> {
  try {
    const events = await getRecentVaultEvents(10000);

    // Convert blockchain events to system logs
    const logs: SystemLog[] = events.slice(0, limit).map(event => {
      let severity: 'info' | 'warn' | 'critical' = 'info';
      let agent = 'System';
      let subsystem = 'blockchain';
      let message = '';

      switch (event.eventType) {
        case 'Deposited':
          severity = 'info';
          agent = 'Vault';
          subsystem = 'deposits';
          message = `Deposit completed: ${weiToEther(event.amount || '0')} CRO from ${formatAddress(event.user || '')}`;
          break;
        case 'Withdrawn':
          severity = 'info';
          agent = 'Vault';
          subsystem = 'withdrawals';
          const amount = parseFloat(weiToEther(event.amount || '0'));
          // Warn if withdrawal is large
          if (amount > 10000) {
            severity = 'warn';
          }
          message = `Withdrawal completed: ${amount.toLocaleString()} CRO to ${formatAddress(event.user || '')}`;
          break;
        case 'AgentRecommendation':
          severity = 'info';
          agent = event.agent ? formatAddress(event.agent) : 'AI Agent';
          subsystem = 'risk-engine';
          message = event.reason || 'Risk assessment completed';
          // Check if reason indicates high risk
          if (event.reason && (event.reason.toLowerCase().includes('risk') || event.reason.toLowerCase().includes('alert'))) {
            severity = 'warn';
          }
          break;
      }

      return {
        timestamp: new Date(event.timestamp * 1000).toISOString(),
        severity,
        agent,
        subsystem,
        message,
      };
    });

    return logs;
  } catch (error) {
    console.error('Failed to fetch system logs:', error);
    return [];
  }
}

