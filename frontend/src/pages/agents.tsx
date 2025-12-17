import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import AgentCard from "../components/AgentCard";
import VaultStateCard from "../components/VaultStateCard";
import DecisionResult from "../components/DecisionResult";
import { listAgents, applyAgent, etherToWei } from "../lib/api";
import type { AgentInfo, AgentId, RiskTrigger, AgentApplyResponse } from "../types/api";

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<AgentId | null>(null);
  const [userAddress, setUserAddress] = useState("");
  const [requestedAmount, setRequestedAmount] = useState("");
  const [riskTrigger, setRiskTrigger] = useState<RiskTrigger>("NONE");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AgentApplyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAgents() {
      try {
        const data = await listAgents();
        setAgents(data.agents);
        if (data.agents.length > 0) {
          setSelectedAgentId(data.agents[0].id as AgentId);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load agents");
      }
    }
    loadAgents();
  }, []);

  async function handleApplyAgent(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedAgentId || !userAddress) {
      setError("Please select an agent and enter a user address");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const requestedAmountWei = requestedAmount
        ? etherToWei(requestedAmount)
        : undefined;

      const response = await applyAgent({
        agentId: selectedAgentId,
        user: userAddress,
        requestedAmountWei,
        riskTrigger,
      });

      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to apply agent");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="agents-page">
        <h1>Agent Console</h1>
        <p className="subtitle">Execute AI agents and view decisions</p>

        <div className="page-grid">
          <div className="left-panel">
            <section className="section">
              <h2>Select Agent</h2>
              <div className="agents-list">
                {agents.map((agent) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    onSelect={(id) => setSelectedAgentId(id as AgentId)}
                    selected={selectedAgentId === agent.id}
                  />
                ))}
              </div>
            </section>

            <section className="section">
              <h2>Parameters</h2>
              <form onSubmit={handleApplyAgent} className="agent-form">
                <div className="form-group">
                  <label htmlFor="userAddress">User Address *</label>
                  <input
                    id="userAddress"
                    type="text"
                    value={userAddress}
                    onChange={(e) => setUserAddress(e.target.value)}
                    placeholder="0x..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="requestedAmount">Requested Amount (CRO)</label>
                  <input
                    id="requestedAmount"
                    type="number"
                    step="0.000001"
                    value={requestedAmount}
                    onChange={(e) => setRequestedAmount(e.target.value)}
                    placeholder="Optional"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="riskTrigger">Risk Trigger</label>
                  <select
                    id="riskTrigger"
                    value={riskTrigger}
                    onChange={(e) => setRiskTrigger(e.target.value as RiskTrigger)}
                  >
                    <option value="NONE">None</option>
                    <option value="VOLATILITY_SPIKE">Volatility Spike</option>
                    <option value="ANOMALY">Anomaly</option>
                  </select>
                </div>

                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? "Executing..." : "Execute Agent"}
                </button>
              </form>
            </section>
          </div>

          <div className="right-panel">
            {error && (
              <div className="error-banner">
                <strong>Error:</strong> {error}
              </div>
            )}

            {result && (
              <>
                <VaultStateCard
                  balanceWei={result.state.balanceWei}
                  recommendedLimitWei={result.state.previousRecommendedWei}
                  userAddress={result.user}
                />
                <DecisionResult result={result} />
              </>
            )}

            {!result && !error && (
              <div className="empty-state">
                <p>Select an agent and execute to see results</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

