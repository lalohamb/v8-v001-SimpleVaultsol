import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import WalletConnect from "../../components/WalletConnect";
import DecisionResult from "../../components/DecisionResult";
import { applyAgent } from "../../lib/api";
import { etherToWei as web3EtherToWei } from "../../lib/web3";
import type { AgentId, RiskTrigger, AgentApplyResponse } from "../../types/api";

// Check AI mode status
async function checkAiMode(): Promise<{ enabled: boolean; model?: string }> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/agents`);
    const data = await response.json();
    // Check if the response includes AI mode info (we'll need to add this to the backend)
    return { enabled: true, model: "gpt-4o-mini" }; // Default assumption
  } catch {
    return { enabled: false };
  }
}

// Agent metadata
const AGENT_METADATA: Record<AgentId, {
  name: string;
  description: string;
  longDescription: string;
  icon: string;
  aiToggleable?: boolean;
  aiModeDescription?: string;
  fallbackDescription?: string;
  parameters: {
    name: string;
    type: string;
    required: boolean;
    description: string;
    options?: string[];
  }[];
  useCases: string[];
  logic: string;
}> = {
  "02portfolio-rebalancer-ai": {
    name: "Portfolio Rebalancer AI",
    description: "AI-powered portfolio rebalancing with intelligent limit recommendations",
    longDescription: "This agent has TWO modes: (1) AI Mode - When ENABLE_AI_AGENTS=true and OPENAI_API_KEY is set, uses OpenAI GPT-4 to analyze your vault state and provide intelligent withdrawal limit recommendations. (2) Deterministic Fallback - When AI is disabled or unavailable, uses conservative deterministic rules (20% of balance).",
    icon: "🧠",
    aiToggleable: true,
    aiModeDescription: "AI Mode is currently ENABLED. This agent will use GPT-4 for intelligent analysis.",
    fallbackDescription: "If AI fails or is disabled, falls back to: 20% of balance (confidence: 0.6)",
    parameters: [
      {
        name: "requestedAmount",
        type: "number",
        required: false,
        description: "Amount you want to withdraw (in TCRO). The AI will evaluate if this is safe."
      },
      {
        name: "riskTrigger",
        type: "select",
        required: false,
        description: "Current risk level affecting your decision",
        options: ["NONE", "LOW", "MEDIUM", "HIGH", "CRITICAL"]
      }
    ],
    useCases: [
      "Portfolio rebalancing decisions",
      "Conservative withdrawal planning",
      "AI-powered risk assessment",
      "Dynamic limit adjustments"
    ],
    logic: "AI Mode (when enabled): Uses GPT-4 to analyze context and propose limits (confidence: ~0.85). Deterministic Fallback (when AI disabled): 20% of balance (confidence: 0.6)"
  },
  "withdrawal-risk-sentinel": {
    name: "Withdrawal Risk Sentinel",
    description: "Monitors account state and dynamically adjusts withdrawal limits",
    longDescription: "Continuously monitors your vault and adjusts limits to reduce drain risk. Initial limit is 50% of balance, then tightens by 5% on each subsequent check to prevent rapid depletion.",
    icon: "⚠️",
    parameters: [
      {
        name: "requestedAmount",
        type: "number",
        required: false,
        description: "Optional: Amount you're considering withdrawing (in TCRO)"
      }
    ],
    useCases: [
      "Continuous risk monitoring",
      "Gradual limit tightening",
      "Drain risk prevention",
      "Dynamic safety adjustments"
    ],
    logic: "Initial: 50% of balance. Subsequent: Tightens by 5% from current limit (confidence: 0.7)"
  },
  "emergency-brake": {
    name: "Emergency Brake",
    description: "Crisis-mode limiter for abnormal conditions",
    longDescription: "Triggers emergency stops and aggressively clamps withdrawal limits during crisis situations. Responds to risk triggers by reducing limits to protect your vault.",
    icon: "🚨",
    parameters: [
      {
        name: "riskTrigger",
        type: "select",
        required: true,
        description: "Risk level triggering the emergency brake",
        options: ["NONE", "LOW", "MEDIUM", "HIGH", "CRITICAL"]
      }
    ],
    useCases: [
      "Emergency situations",
      "Market volatility protection",
      "Anomaly detection response",
      "Crisis management"
    ],
    logic: "This agent operates in two distinct modes based on risk assessment:\n\n🚨 EMERGENCY MODE (Risk Trigger: LOW/MEDIUM/HIGH/CRITICAL):\n• Proposed Limit: 10% of vault balance\n• Confidence: 85%\n• Rationale: When any risk trigger is detected, the agent immediately clamps withdrawal limits to 10% to protect vault assets from potential threats. This aggressive restriction ensures maximum capital preservation during crisis conditions.\n\n✅ NORMAL MODE (Risk Trigger: NONE):\n• Proposed Limit: 25% of vault balance\n• Confidence: 60%\n• Rationale: Under normal conditions with no detected risks, the agent applies a precautionary 25% limit as a baseline safety measure.\n\nThe agent evaluates the riskTrigger parameter and automatically selects the appropriate protection level, prioritizing vault security over withdrawal flexibility during uncertain conditions."
  },
  "settlement-batch-optimizer": {
    name: "Settlement Batch Optimizer",
    description: "Optimizes multi-step settlement execution with safe caps",
    longDescription: "Designed for x402 payment-gated settlement workflows. Computes safe caps for batch operations, ensuring settlements stay within conservative limits.",
    icon: "📦",
    parameters: [
      {
        name: "requestedAmount",
        type: "number",
        required: false,
        description: "Settlement amount requested (in TCRO)"
      },
      {
        name: "jobId",
        type: "text",
        required: false,
        description: "Optional job ID for tracking settlement workflows"
      }
    ],
    useCases: [
      "x402 settlement workflows",
      "Batch payment processing",
      "Multi-step settlements",
      "Gas optimization"
    ],
    logic: "Baseline: 40% of balance. If amount requested: min(requested, baseline) (confidence: 0.75)"
  },
  "gas-fee-monitor": {
    name: "Gas Fee Monitor",
    description: "Real-time gas fee monitoring on Cronos Testnet and Mainnet",
    longDescription: "Deterministic agent that monitors current gas prices on both Cronos Testnet and Mainnet. Recommends economically efficient withdrawal limits based on gas costs. If gas is high, suggests larger withdrawals to amortize costs. If gas is low, allows more flexible smaller withdrawals.",
    icon: "⛽",
    parameters: [
      {
        name: "requestedAmount",
        type: "number",
        required: false,
        description: "Optional: Amount you're considering withdrawing (in TCRO)"
      }
    ],
    useCases: [
      "Gas price monitoring",
      "Cost-efficient withdrawals",
      "Network fee analysis",
      "Multi-network comparison"
    ],
    logic: "Fetches real-time gas from Testnet & Mainnet. High gas (>10 Gwei): 60% limit. Low gas (<5 Gwei): 40% limit. Normal: 50% limit. Ensures withdrawals are economically viable."
  }
};

export default function AgentDetailPage() {
  const router = useRouter();
  const { agentId } = router.query;
  
  const [connectedAccount, setConnectedAccount] = useState<string | null>(null);
  const [userAddress, setUserAddress] = useState("");
  const [requestedAmount, setRequestedAmount] = useState("");
  const [riskTrigger, setRiskTrigger] = useState<RiskTrigger>("NONE");
  const [jobId, setJobId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AgentApplyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const agentMetadata = agentId ? AGENT_METADATA[agentId as AgentId] : null;

  useEffect(() => {
    if (connectedAccount && !userAddress) {
      setUserAddress(connectedAccount);
    }
  }, [connectedAccount, userAddress]);

  async function handleExecute(e: React.FormEvent) {
    e.preventDefault();
    if (!agentId || !userAddress) return;

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const requestedAmountWei = requestedAmount
        ? web3EtherToWei(requestedAmount).toString()
        : undefined;

      const response = await applyAgent({
        agentId: agentId as AgentId,
        user: userAddress,
        requestedAmountWei,
        riskTrigger: riskTrigger !== "NONE" ? riskTrigger : undefined,
        jobId: jobId || undefined,
      });

      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to execute agent");
    } finally {
      setLoading(false);
    }
  }

  if (!agentId || !agentMetadata) {
    return (
      <Layout>
        <div className="agent-detail-page">
          <h1>Agent Not Found</h1>
          <p>The requested agent does not exist.</p>
          <a href="/agents" className="btn-primary">← Back to Agents</a>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="agent-detail-page">
        <div className="page-header">
          <div>
            <a href="/agents" className="back-link">← All Agents</a>
            <h1>
              <span className="agent-icon">{agentMetadata.icon}</span>
              {agentMetadata.name}
            </h1>
            <p className="subtitle">{agentMetadata.description}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
            <small style={{ color: '#666', fontSize: '0.75rem', fontStyle: 'italic' }}>Optional: Auto-fill address</small>
            <WalletConnect onAccountChange={setConnectedAccount} />
          </div>
        </div>

        <div className="agent-detail-grid">
          <div className="agent-info-section">
            <div className="info-card">
              <h2>About This Agent</h2>
              <p>{agentMetadata.longDescription}</p>
            </div>

            {agentMetadata.aiToggleable && (
              <div className="info-card ai-mode-card">
                <h2>🤖 AI Mode Status</h2>
                <div className="ai-mode-status">
                  <div className="ai-mode-badge enabled">
                    <span className="status-dot"></span>
                    AI Mode: ENABLED
                  </div>
                  <p className="ai-mode-info">{agentMetadata.aiModeDescription}</p>
                </div>
                <div className="fallback-info">
                  <h3>Fallback Mode</h3>
                  <p>{agentMetadata.fallbackDescription}</p>
                  <small>
                    <strong>Note:</strong> AI mode requires <code>ENABLE_AI_AGENTS=true</code> and a valid <code>OPENAI_API_KEY</code> in the backend environment.
                  </small>
                </div>
              </div>
            )}

            <div className="info-card">
              <h2>Decision Logic</h2>
              <p className="logic-text">{agentMetadata.logic}</p>
            </div>

            <div className="info-card">
              <h2>Use Cases</h2>
              <ul className="use-cases-list">
                {agentMetadata.useCases.map((useCase, idx) => (
                  <li key={idx}>{useCase}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="agent-execution-section">
            <div className="execution-card">
              <h2>Execute Agent</h2>

              <form onSubmit={handleExecute} className="execution-form">
                <div style={{ padding: '1rem', background: 'rgba(102, 126, 234, 0.1)', borderRadius: '8px', marginBottom: '1rem', borderLeft: '3px solid #667eea' }}>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#333' }}>
                    ℹ️ <strong>No wallet signature required.</strong> This agent executes on the backend. You only need to provide an address to analyze.
                  </p>
                </div>

                <div className="form-group">
                  <label>User Address</label>
                  <input
                    type="text"
                    value={userAddress}
                    onChange={(e) => setUserAddress(e.target.value)}
                    placeholder="0x... (or connect wallet above)"
                    required
                    disabled={loading}
                  />
                  <small>Connect wallet above to auto-fill, or enter any address to analyze</small>
                </div>

                {agentMetadata.parameters.map((param) => (
                  <div key={param.name} className="form-group">
                    <label>
                      {param.name.charAt(0).toUpperCase() + param.name.slice(1).replace(/([A-Z])/g, ' $1')}
                      {param.required && <span className="required">*</span>}
                    </label>

                    {param.type === "select" && param.options ? (
                      <select
                        value={param.name === "riskTrigger" ? riskTrigger : ""}
                        onChange={(e) => {
                          if (param.name === "riskTrigger") {
                            setRiskTrigger(e.target.value as RiskTrigger);
                          }
                        }}
                        required={param.required}
                        disabled={loading}
                      >
                        {param.options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : param.type === "number" ? (
                      <input
                        type="number"
                        step="0.001"
                        value={param.name === "requestedAmount" ? requestedAmount : ""}
                        onChange={(e) => {
                          if (param.name === "requestedAmount") {
                            setRequestedAmount(e.target.value);
                          }
                        }}
                        placeholder="0.0"
                        required={param.required}
                        disabled={loading}
                      />
                    ) : (
                      <input
                        type="text"
                        value={param.name === "jobId" ? jobId : ""}
                        onChange={(e) => {
                          if (param.name === "jobId") {
                            setJobId(e.target.value);
                          }
                        }}
                        placeholder={param.description}
                        required={param.required}
                        disabled={loading}
                      />
                    )}

                    <small>{param.description}</small>
                  </div>
                ))}

                <button
                  type="submit"
                  disabled={loading || !userAddress}
                  className="btn-primary btn-large"
                >
                  {loading ? "Executing..." : `Execute ${agentMetadata.name}`}
                </button>
              </form>

              {error && (
                <div className="error-banner">
                  <strong>Error:</strong> {error}
                </div>
              )}

              {result && (
                <div className="result-section">
                  {result.state?.balanceWei === "0" && (
                    <div className="error-banner" style={{ background: '#fff3cd', border: '1px solid #ffc107', color: '#856404' }}>
                      <strong>Note:</strong> Your vault balance is 0. Deposit TCRO into the vault to get meaningful recommendations.
                    </div>
                  )}
                  <DecisionResult result={result} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}


