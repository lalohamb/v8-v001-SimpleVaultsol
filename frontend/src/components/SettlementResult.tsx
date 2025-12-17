import React from "react";
import { weiToEther, formatTxHash, getCronosTestnetExplorerUrl } from "../lib/api";
import type { SettlementRunResponse } from "../types/api";

interface SettlementResultProps {
  result: SettlementRunResponse;
}

export default function SettlementResult({ result }: SettlementResultProps) {
  const confidencePercent = (result.decision.confidence * 100).toFixed(1);

  return (
    <div className="settlement-result">
      <div className="result-header">
        <h3>Settlement Executed</h3>
        <span className="status-badge success">✓ Complete</span>
      </div>

      <div className="result-section">
        <h4>Job Details</h4>
        <div className="result-row">
          <span className="label">Job ID:</span>
          <span className="value monospace">{result.jobId}</span>
        </div>
        <div className="result-row">
          <span className="label">Agent:</span>
          <span className="value">{result.agentId}</span>
        </div>
        <div className="result-row">
          <span className="label">Confidence:</span>
          <span className="value">{confidencePercent}%</span>
        </div>
      </div>

      <div className="result-section">
        <h4>Decision</h4>
        <div className="result-row">
          <span className="label">Proposed Limit:</span>
          <span className="value">
            {weiToEther(result.decision.proposedLimitWei)} CRO
          </span>
        </div>
        <div className="result-row">
          <span className="label">Final Limit:</span>
          <span className="value">
            {weiToEther(result.decision.finalLimitWei)} CRO
          </span>
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
          <span className="label">Recommended Limit:</span>
          <span className="value">
            {weiToEther(result.onChain.recommendedLimitWei)} CRO
          </span>
        </div>
      </div>

      <div className="result-section">
        <h4>Pipeline</h4>
        <ol className="pipeline-list">
          {result.pipeline.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}

