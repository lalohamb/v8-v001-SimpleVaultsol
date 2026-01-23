import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import SettlementResult from "../components/SettlementResult";
import SettlementPaymentForm from "../components/SettlementPaymentForm";
import { listAgents, runSettlement, etherToWei } from "../lib/api";
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
  const [hasExecuted, setHasExecuted] = useState(false);

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

  function handlePaymentSuccess() {
    setIsPaid(true);
    setError(null);
  }

  function handlePaymentError(errorMsg: string) {
    setError(errorMsg);
    setIsPaid(false);
  }

  async function handleRunSettlement(e: React.FormEvent) {
    e.preventDefault();
    if (!jobId || !userAddress || !selectedAgentId) {
      setError("Please fill in all required fields");
      return;
    }

    if (hasExecuted) {
      setError("Settlement already executed for this Job ID. Use a different Job ID for a new settlement.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);

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
      setHasExecuted(true);
    } catch (err: any) {
      if (err.type === "payment_required") {
        setError("Payment required. Please complete Step 1 first.");
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
        <p className="subtitle">Execute x402 payment-gated settlement workflows</p>

        {/* Documentation Section */}
        <div className="settlement-docs">
          <div className="docs-card">
            <h2>📋 What is a Settlement?</h2>
            <p>
              A <strong>settlement</strong> is a payment-gated workflow that uses AI agents to analyze vault state
              and recommend safe withdrawal limits before executing multi-step settlement operations. This implements
              the <strong>x402 Payment Required</strong> protocol, where settlements must be paid for before execution.
            </p>
          </div>

          <div className="docs-grid">
            <div className="docs-card">
              <h3>🔑 What is a Job ID?</h3>
              <p>
                A <strong>Job ID</strong> is a unique identifier for your settlement request (e.g., "job-001", "settlement-abc").
                It tracks the payment status and links the payment (Step 1) to the execution (Step 2).
                You can use any string, but it must be the same in both steps.
              </p>
              <div className="example-box">
                <strong>Examples:</strong>
                <ul>
                  <li><code>job-001</code> - Simple numeric ID</li>
                  <li><code>settlement-2024-001</code> - Date-based ID</li>
                  <li><code>user-alice-batch-1</code> - User-specific ID</li>
                </ul>
              </div>
            </div>

            <div className="docs-card">
              <h3>⚙️ Parameters Explained</h3>
              <ul className="param-list">
                <li>
                  <strong>Job ID</strong> (required) - Unique identifier for this settlement
                </li>
                <li>
                  <strong>User Address</strong> (required) - The wallet address to analyze (0x...)
                </li>
                <li>
                  <strong>Agent</strong> (required) - Which AI agent to use for analysis
                </li>
                <li>
                  <strong>Requested Amount</strong> (optional) - Amount you want to withdraw in CRO.
                  If provided, the agent will validate if it's safe. If omitted, the agent will recommend
                  an optimal limit based on your vault balance.
                </li>
              </ul>
            </div>
          </div>

          <div className="docs-card workflow-card">
            <h2>🔄 Two-Step Workflow</h2>
            <div className="workflow-steps">
              <div className="workflow-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3>Payment (x402)</h3>
                  <p>
                    <strong>Purpose:</strong> Pay for the settlement service before execution.
                  </p>
                  <p>
                    <strong>What happens:</strong> You submit a Job ID and pay <strong>1.0 TCRO</strong> via your Web3 wallet.
                    The payment is sent to the SettlementPayment smart contract on Cronos Testnet, which marks
                    this Job ID as "paid" on-chain and allows you to proceed to Step 2.
                  </p>
                  <p>
                    <strong>Why it's needed:</strong> The x402 protocol ensures settlements are paid for
                    before consuming computational resources (AI analysis, blockchain transactions).
                  </p>
                  <div className="step-note">
                    💡 <strong>Note:</strong> This uses real blockchain payments in TCRO. Make sure you have
                    a Web3 wallet (Cronos Wallet, MetaMask, etc.) connected to Cronos Testnet with sufficient TCRO balance.
                  </div>
                </div>
              </div>

              <div className="workflow-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3>Run Settlement</h3>
                  <p>
                    <strong>Purpose:</strong> Execute the AI-powered settlement analysis and on-chain transaction.
                  </p>
                  <p>
                    <strong>What happens:</strong>
                  </p>
                  <ol className="step-list">
                    <li>System verifies the Job ID was paid (from Step 1)</li>
                    <li>Reads your current vault balance and withdrawal limit from the blockchain</li>
                    <li>Selected AI agent analyzes your vault state and recommends a safe withdrawal limit</li>
                    <li>System applies safety clamps (max 50% of balance by default)</li>
                    <li>If you provided a requested amount, validates it doesn't exceed the recommended limit</li>
                    <li>Writes the new recommended limit to the blockchain via <code>agentSetWithdrawLimit()</code></li>
                    <li>Executes settlement pipeline (validate, calculate fees, route payouts, finalize)</li>
                  </ol>
                  <div className="step-note">
                    ⚠️ <strong>Enforcement:</strong> If your requested amount exceeds the AI-recommended limit,
                    the settlement will be <strong>refused</strong> with a 409 Conflict error.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="docs-card">
            <h2>🤖 Agent Selection</h2>
            <p>
              Different agents use different strategies to recommend withdrawal limits:
            </p>
            <ul className="agent-strategy-list">
              <li>
                <strong>Portfolio Rebalancer AI</strong> - Uses GPT-4 for intelligent analysis (if AI enabled),
                falls back to 20% of balance
              </li>
              <li>
                <strong>Settlement Batch Optimizer</strong> - Recommends 40% of balance, optimized for batch operations
              </li>
              <li>
                <strong>Withdrawal Risk Sentinel</strong> - Conservative approach, starts at 50% and tightens by 5% on subsequent calls
              </li>
              <li>
                <strong>Emergency Brake</strong> - Crisis mode, recommends only 10% for high-risk situations
              </li>
            </ul>
          </div>
        </div>

        <div className="page-grid">
          <div className="left-panel">
            <section className="section">
              <h2>Step 1: Payment (x402)</h2>
              <div className="settlement-form">
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

                {jobId && (
                  <SettlementPaymentForm
                    jobId={jobId}
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                  />
                )}
              </div>
            </section>

            <section className="section">
              <h2>Step 2: Run Settlement</h2>
              <form onSubmit={handleRunSettlement} className="settlement-form">
                <div className="form-group">
                  <label htmlFor="step2JobId">Job ID * <span className="field-note">(Must match Step 1)</span></label>
                  <input
                    id="step2JobId"
                    type="text"
                    value={jobId}
                    onChange={(e) => setJobId(e.target.value)}
                    placeholder="job-001"
                    required
                  />
                  <small>Enter the same Job ID you used for payment in Step 1</small>
                </div>

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

                <button type="submit" disabled={loading || hasExecuted} className="btn-primary">
                  {loading ? "Executing..." : hasExecuted ? "✓ Settlement Executed" : "Run Settlement"}
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

