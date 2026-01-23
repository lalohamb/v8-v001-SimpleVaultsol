import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";

import VaultInteraction from "../components/VaultInteraction";
import WelcomeModal from "../components/WelcomeModal";
import StatusModal from "../components/StatusModal";
import { listAgents, checkHealth } from "../lib/api";
import type { AgentInfo } from "../types/api";

export default function Home() {
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [healthStatus, setHealthStatus] = useState<string>("checking...");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");
    if (!hasSeenWelcome) {
      setShowWelcome(true);
    }
  }, []);

  const handleCloseWelcome = () => {
    localStorage.setItem("hasSeenWelcome", "true");
    setShowWelcome(false);
  };

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        // Check health
        const health = await checkHealth();
        setHealthStatus(health.status);

        // Load agents
        const agentData = await listAgents();
        setAgents(agentData.agents);
        setAiEnabled(agentData.aiEnabled);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
        setHealthStatus("error");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <Layout>
      {showWelcome && <WelcomeModal onClose={handleCloseWelcome} />}
      {showStatus && <StatusModal isOpen={showStatus} onClose={() => setShowStatus(false)} />}
      <div className="dashboard">
        <div className="dashboard-header">
          <div>
         
            
            <p className="subtitle">
              Secure, AI-powered vault management on Cronos Testnet with intelligent agents that monitor, analyze, and protect your digital assets 24/7.
            </p>
            <div className="hero-features">
              <div className="hero-feature">
                <span className="feature-icon">🤖</span>
                <div>
                  <strong>AI & Rule-Based Agents</strong>
                  <p>Dual-mode protection with OpenAI-powered insights and deterministic fallback logic</p>
                </div>
              </div>
              <div className="hero-feature">
                <span className="feature-icon">🛡️</span>
                <div>
                  <strong>Real-Time Risk Analysis</strong>
                  <p>Continuous monitoring of withdrawal patterns, velocity checks, and anomaly detection</p>
                </div>
              </div>
              <div className="hero-feature">
                <span className="feature-icon">⚡</span>
                <div>
                  <strong>Automated Settlements</strong>
                  <p>x402 protocol integration for batch processing and optimized transaction workflows</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="section-divider">
          <h2 className="section-title">📊 System Status</h2>
          <p className="section-subtitle">Real-time monitoring of platform health and configuration</p>
        </div>

        <div className="status-cards">
          <div className="status-card" onClick={() => setShowStatus(true)} style={{ cursor: 'pointer' }}>
            <h3>Service Status</h3>
            <div className={`status-indicator ${healthStatus}`}>
              {healthStatus === "ok" ? "✓ Online" : "✗ Offline"}
            </div>
          </div>

          <div className="status-card">
            <h3>AI Mode</h3>
            <div className={`status-indicator ${aiEnabled ? "ok" : "warning"}`}>
              {aiEnabled ? "✓ ENABLED" : "⚠ Fallback Only"}
            </div>
          </div>

          <div className="status-card">
            <h3>Available Agents</h3>
            <div className="status-value">{agents.length}</div>
          </div>
        </div>

        {error && (
          <div className="error-banner">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="section-divider">
          <h2 className="section-title">🤖 Active Agents</h2>
          <p className="section-subtitle">AI-powered and deterministic agents protecting your vault</p>
        </div>

        <div className="main-grid">
          <div className="left-section">
            <VaultInteraction userAddress={null} />
          </div>

          <div className="right-section">
            {loading ? (
              <div className="loading">Loading agents...</div>
            ) : (
              <div className="agents-overview">
                <h2>Registered Agents</h2>
                <div className="agents-grid">
                  {agents.map((agent) => (
                    <a
                      key={agent.id}
                      href={`/agents/${agent.id}`}
                      className="agent-overview-card"
                    >
                      <h3>{agent.name}</h3>
                      <p className="agent-id">{agent.id}</p>
                      <p className="agent-description">{agent.description}</p>
                      <span className="view-link">View Details →</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="quick-links">
              <h2>Quick Actions</h2>
              <div className="links-grid">
                <a href="/agents" className="action-link">
                  <h3>🤖 Agent Library</h3>
                  <p>Browse and execute AI agents</p>
                </a>
                <a href="/agents/02portfolio-rebalancer-ai" className="action-link">
                  <h3>🧠 AI Rebalancer</h3>
                  <p>Get intelligent recommendations</p>
                </a>
                <a href="/settlements" className="action-link">
                  <h3>💰 Settlements</h3>
                  <p>Run x402 settlement workflows</p>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
