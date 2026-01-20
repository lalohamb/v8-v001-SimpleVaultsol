import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import WalletConnect from "../../components/WalletConnect";
import { listAgents } from "../../lib/api";
import type { AgentInfo, AgentId } from "../../types/api";

// Agent metadata for display
const AGENT_DISPLAY: Record<AgentId, {
  icon: string;
  color: string;
  category: string;
  features: string[];
  aiToggleable?: boolean;
}> = {
  "02portfolio-rebalancer-ai": {
    icon: "🧠",
    color: "#667eea",
    category: "AI-Powered (Toggleable)",
    features: ["GPT-4 Integration", "Intelligent Analysis", "Adaptive Limits", "Fallback Mode"],
    aiToggleable: true
  },
  "withdrawal-risk-sentinel": {
    icon: "⚠️",
    color: "#f59e0b",
    category: "Risk Management",
    features: ["Continuous Monitoring", "Dynamic Tightening", "Drain Prevention", "Safe Defaults"]
  },
  "emergency-brake": {
    icon: "🚨",
    color: "#ef4444",
    category: "Emergency Response",
    features: ["Crisis Detection", "Aggressive Clamping", "Risk Triggers", "Emergency Stops"]
  },
  "settlement-batch-optimizer": {
    icon: "📦",
    color: "#10b981",
    category: "Settlement",
    features: ["Batch Processing", "Safe Caps", "x402 Workflows", "Gas Optimization"]
  },
  "gas-fee-monitor": {
    icon: "⛽",
    color: "#8b5cf6",
    category: "Network Monitoring",
    features: ["Real-time Gas Prices", "Testnet & Mainnet", "Cost Efficiency", "Economic Analysis"]
  }
};

export default function AgentsIndexPage() {
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [connectedAccount, setConnectedAccount] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAgents() {
      try {
        const data = await listAgents();
        setAgents(data.agents);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load agents");
      } finally {
        setLoading(false);
      }
    }
    loadAgents();
  }, []);

  return (
    <Layout>
      <div className="agents-index-page">
        <div className="page-header">
          <div>
            <h1>AI Agent Library</h1>
            <p className="subtitle">
              Explore and execute specialized AI agents for vault management
            </p>
          </div>
          <WalletConnect onAccountChange={setConnectedAccount} />
        </div>

        {error && (
          <div className="error-banner">
            <strong>Error:</strong> {error}
          </div>
        )}

        {loading ? (
          <div className="loading">Loading agents...</div>
        ) : (
          <>
            <div className="agents-stats">
              <div className="stat-box">
                <div className="stat-number">{agents.length}</div>
                <div className="stat-label">Total Agents</div>
              </div>
              <div className="stat-box">
                <div className="stat-number">
                  {agents.filter(a => a.id === "02portfolio-rebalancer-ai").length}
                </div>
                <div className="stat-label">AI-Powered</div>
              </div>
              <div className="stat-box">
                <div className="stat-number">
                  {agents.filter(a => a.id !== "02portfolio-rebalancer-ai").length}
                </div>
                <div className="stat-label">Deterministic</div>
              </div>
            </div>

            <div className="agents-library-grid">
              {agents.map((agent) => {
                const display = AGENT_DISPLAY[agent.id as AgentId];
                return (
                  <a
                    key={agent.id}
                    href={`/agents/${agent.id}`}
                    className="agent-library-card"
                    style={{ borderTopColor: display?.color }}
                  >
                    <div className="agent-card-header">
                      <span className="agent-card-icon">{display?.icon}</span>
                      <div className="agent-header-right">
                        <span className="agent-category">{display?.category}</span>
                        {display?.aiToggleable && (
                          <span className="ai-toggle-badge" title="AI mode can be toggled on/off">
                            🤖 AI
                          </span>
                        )}
                      </div>
                    </div>

                    <h3>{agent.name}</h3>
                    <p className="agent-card-description">{agent.description}</p>
                    
                    <div className="agent-features">
                      {display?.features.map((feature, idx) => (
                        <span key={idx} className="feature-tag">
                          {feature}
                        </span>
                      ))}
                    </div>
                    
                    <div className="agent-card-footer">
                      <span className="agent-id">ID: {agent.id}</span>
                      <span className="view-details">View Details →</span>
                    </div>
                  </a>
                );
              })}
            </div>

            <div className="quick-actions">
              <h2>Quick Actions</h2>
              <div className="action-cards">
                <a href="/agents/02portfolio-rebalancer-ai" className="action-card ai-card">
                  <span className="action-icon">🧠</span>
                  <h3>AI Rebalancer</h3>
                  <p>Get intelligent recommendations powered by GPT-4</p>
                </a>
                <a href="/agents/withdrawal-risk-sentinel" className="action-card risk-card">
                  <span className="action-icon">⚠️</span>
                  <h3>Risk Sentinel</h3>
                  <p>Monitor and adjust withdrawal limits dynamically</p>
                </a>
                <a href="/agents/emergency-brake" className="action-card emergency-card">
                  <span className="action-icon">🚨</span>
                  <h3>Emergency Brake</h3>
                  <p>Activate crisis-mode protection instantly</p>
                </a>
                <a href="/agents/settlement-batch-optimizer" className="action-card settlement-card">
                  <span className="action-icon">📦</span>
                  <h3>Batch Optimizer</h3>
                  <p>Optimize settlement workflows efficiently</p>
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

