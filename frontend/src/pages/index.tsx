import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { listAgents, checkHealth } from "../lib/api";
import type { AgentInfo } from "../types/api";

export default function Home() {
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [healthStatus, setHealthStatus] = useState<string>("checking...");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <div className="dashboard">
        <h1>Cronos AI Platform Dashboard</h1>
        <p className="subtitle">
          Agent-powered vault management on Cronos EVM
        </p>

        <div className="status-cards">
          <div className="status-card">
            <h3>Service Status</h3>
            <div className={`status-indicator ${healthStatus}`}>
              {healthStatus === "ok" ? "✓ Online" : "✗ Offline"}
            </div>
          </div>

          <div className="status-card">
            <h3>AI Mode</h3>
            <div className={`status-indicator ${aiEnabled ? "ok" : "warning"}`}>
              {aiEnabled ? "✓ Enabled" : "⚠ Fallback Only"}
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

        {loading ? (
          <div className="loading">Loading agents...</div>
        ) : (
          <div className="agents-overview">
            <h2>Registered Agents</h2>
            <div className="agents-grid">
              {agents.map((agent) => (
                <div key={agent.id} className="agent-overview-card">
                  <h3>{agent.name}</h3>
                  <p className="agent-id">{agent.id}</p>
                  <p className="agent-description">{agent.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="quick-links">
          <h2>Quick Actions</h2>
          <div className="links-grid">
            <a href="/agents" className="action-link">
              <h3>Agent Console</h3>
              <p>Execute agents and view decisions</p>
            </a>
            <a href="/settlements" className="action-link">
              <h3>Settlements</h3>
              <p>Run x402 settlement workflows</p>
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}
