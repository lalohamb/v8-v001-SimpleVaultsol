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
        <h4>Limits</h4>
        <div className="result-row">
          <span className="label">Proposed Limit:</span>
          <span className="value">
            {weiToEther(result.decision.proposedLimitWei)} CRO
          </span>
        </div>
        <div className="result-row">
          <span className="label">Final Limit (after clamp):</span>
          <span className="value">
            {weiToEther(result.decision.finalLimitWei)} CRO
          </span>
        </div>
        <div className="result-row">
          <span className="label">Clamp Notes:</span>
          <span className="value">{result.decision.clampNotes}</span>
        </div>
      </div>

      <div className="result-section">
        <h4>On-Chain</h4>
        <div className="result-row">
          <span className="label">Transaction:</span>
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
          <span className="label">Previous Balance:</span>
          <span className="value">{weiToEther(result.state.balanceWei)} CRO</span>
        </div>
        <div className="result-row">
          <span className="label">Previous Limit:</span>
          <span className="value">
            {weiToEther(result.state.previousRecommendedWei)} CRO
          </span>
        </div>
      </div>
    </div>
  );
}

