import React from "react";
import { weiToEther, formatTxHash, getCronosTestnetExplorerUrl } from "../lib/api";
import type { AgentApplyResponse } from "../types/api";

interface DecisionResultProps {
  result: AgentApplyResponse;
}

export default function DecisionResult({ result }: DecisionResultProps) {
  const confidencePercent = (result.decision.confidence * 100).toFixed(1);
  const confidenceClass =
    result.decision.confidence >= 0.8
      ? "high"
      : result.decision.confidence >= 0.5
      ? "medium"
      : "low";

  return (
    <div className="decision-result">
      <div className="result-header">
        <h3>Agent Decision</h3>
        <span className={`mode-badge ${result.mode}`}>
          {result.mode === "ai" ? "AI Mode" : "Fallback Mode"}
        </span>
      </div>

      <div className="result-section">
        <h4>Agent: {result.agentId}</h4>
        <div className="result-row">
          <span className="label">Confidence:</span>
          <span className={`confidence ${confidenceClass}`}>
            {confidencePercent}%
          </span>
        </div>
        <div className="result-row">
          <span className="label">Reason:</span>
          <span className="value">{result.decision.reason}</span>
        </div>
      </div>

      <div className="result-section">
        <h4>Withdrawal Limits</h4>
        <p className="section-description">The agent recommends safe withdrawal limits based on your vault balance and risk factors.</p>
        <div className="result-row">
          <span className="label">Agent Proposed Limit:</span>
          <span className="value">
            {weiToEther(result.decision.proposedLimitWei)} CRO
          </span>
        </div>
        <div className="result-row">
          <span className="label">Final Approved Limit:</span>
          <span className="value">
            {weiToEther(result.decision.finalLimitWei)} CRO
          </span>
        </div>
        <div className="result-row">
          <span className="label">Safety Adjustments:</span>
          <span className="value">{result.decision.clampNotes}</span>
        </div>
        <p className="help-text">The final limit may be adjusted by safety rules (clamping) to protect your vault.</p>
      </div>

      <div className="result-section">
        <h4>Blockchain Transaction</h4>
        <p className="section-description">This decision has been recorded on the Cronos blockchain for transparency and auditability.</p>
        <div className="result-row">
          <span className="label">Transaction Hash:</span>
          <a
            href={getCronosTestnetExplorerUrl(result.onChain.txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="tx-link"
          >
            {formatTxHash(result.onChain.txHash)}
          </a>
        </div>
        <div className="result-row">
          <span className="label">Your Vault Balance:</span>
          <span className="value">{weiToEther(result.state.balanceWei)} CRO</span>
        </div>
        <div className="result-row">
          <span className="label">Previous Recommended Limit:</span>
          <span className="value">
            {weiToEther(result.state.previousRecommendedWei)} CRO
          </span>
        </div>
        <p className="help-text">Click the transaction hash to view full details on the Cronos explorer.</p>
      </div>
    </div>
  );
}

