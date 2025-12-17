import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import SettlementResult from "../components/SettlementResult";
import { listAgents, payForSettlement, runSettlement, etherToWei } from "../lib/api";
import type { AgentInfo, AgentId, SettlementRunResponse } from "../types/api";

export default function SettlementsPage() {
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [jobId, setJobId] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [selectedAgentId, setSelectedAgentId] = useState<AgentId | null>(null);
  const [requestedAmount, setRequestedAmount] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SettlementRunResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);

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

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault();
    if (!jobId) {
      setError("Please enter a job ID");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await payForSettlement({ jobId });
      setIsPaid(true);
      setPaymentInfo(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process payment");
    } finally {
      setLoading(false);
    }
  }

  async function handleRunSettlement(e: React.FormEvent) {
    e.preventDefault();
    if (!jobId || !userAddress || !selectedAgentId) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);
      setPaymentInfo(null);

      const requestedAmountWei = requestedAmount
        ? etherToWei(requestedAmount)
        : undefined;

      const response = await runSettlement({
        jobId,
        user: userAddress,
        agentId: selectedAgentId,
        requestedAmountWei,
      });

      setResult(response);
    } catch (err: any) {
      if (err.type === "payment_required") {
        setPaymentInfo(err.data);
        setError("Payment required. Please pay first.");
      } else if (err.type === "refused") {
        setError(
          `Settlement refused: ${err.data.reason}. ${err.data.guidance || ""}`
        );
      } else {
        setError(err instanceof Error ? err.message : "Failed to run settlement");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="settlements-page">
        <h1>Settlement Console</h1>
        <p className="subtitle">Execute x402 settlement workflows</p>

        <div className="page-grid">
          <div className="left-panel">
            <section className="section">
              <h2>Step 1: Payment (x402)</h2>
              <form onSubmit={handlePayment} className="settlement-form">
                <div className="form-group">
                  <label htmlFor="jobId">Job ID *</label>
                  <input
                    id="jobId"
                    type="text"
                    value={jobId}
                    onChange={(e) => setJobId(e.target.value)}
                    placeholder="job-001"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || isPaid}
                  className="btn-secondary"
                >
                  {isPaid ? "✓ Paid" : loading ? "Processing..." : "Pay for Settlement"}
                </button>
              </form>

              {paymentInfo && paymentInfo.x402 && (
                <div className="payment-info">
                  <h4>Payment Required</h4>
                  <p>Amount: {paymentInfo.x402.amount} {paymentInfo.x402.asset}</p>
                  <p>Chain: {paymentInfo.x402.chain}</p>
                  <p className="small">Memo: {paymentInfo.x402.memo}</p>
                </div>
              )}
            </section>

            <section className="section">
              <h2>Step 2: Run Settlement</h2>
              <form onSubmit={handleRunSettlement} className="settlement-form">
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
                  <label htmlFor="agentId">Agent *</label>
                  <select
                    id="agentId"
                    value={selectedAgentId || ""}
                    onChange={(e) => setSelectedAgentId(e.target.value as AgentId)}
                    required
                  >
                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name}
                      </option>
                    ))}
                  </select>
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

                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? "Executing..." : "Run Settlement"}
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

            {result && <SettlementResult result={result} />}

            {!result && !error && (
              <div className="empty-state">
                <p>Complete the steps to execute a settlement</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

