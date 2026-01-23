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

  // Parse gas-fee-monitor reason for better formatting
  const isGasMonitor = result.agentId === "gas-fee-monitor";
  const parseGasReason = (reason: string) => {
    const match = reason.match(/High gas=([\d.]+)Gwei \(T:([\d.]+) M:([\d.]+)\)\. (.+)\. Est tx cost: ([\d.]+) TCRO/);
    if (match) {
      return {
        avgGas: match[1],
        testnetGas: match[2],
        mainnetGas: match[3],
        recommendation: match[4],
        txCost: match[5]
      };
    }
    const lowMatch = reason.match(/Low gas=([\d.]+)Gwei \(T:([\d.]+) M:([\d.]+)\)\. (.+)\. Est tx cost: ([\d.]+) TCRO/);
    if (lowMatch) {
      return {
        avgGas: lowMatch[1],
        testnetGas: lowMatch[2],
        mainnetGas: lowMatch[3],
        recommendation: lowMatch[4],
        txCost: lowMatch[5]
      };
    }
    const normalMatch = reason.match(/Normal gas=([\d.]+)Gwei \(T:([\d.]+) M:([\d.]+)\)\. (.+)\. Est tx cost: ([\d.]+) TCRO/);
    if (normalMatch) {
      return {
        avgGas: normalMatch[1],
        testnetGas: normalMatch[2],
        mainnetGas: normalMatch[3],
        recommendation: normalMatch[4],
        txCost: normalMatch[5]
      };
    }
    return null;
  };

  const gasData = isGasMonitor ? parseGasReason(result.decision.reason) : null;

  return (
    <div className="decision-result">
      <div className="result-header">
        <h3>Agent Decision</h3>
        <span className={`mode-badge ${result.mode}`}>
          {result.mode === "ai" ? "🤖 AI-Powered" : "⚙️ Rule-Based (Fallback)"}
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
          {gasData ? (
            <div className="value" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div><strong>Gas Prices:</strong></div>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', listStyle: 'disc' }}>
                <li>Average: {gasData.avgGas} Gwei ({(parseFloat(gasData.avgGas) / 1e9).toFixed(9)} CRO/gas)</li>
                <li>Testnet (T): {gasData.testnetGas} Gwei ({(parseFloat(gasData.testnetGas) / 1e9).toFixed(9)} CRO/gas)</li>
                <li>Mainnet (M): {gasData.mainnetGas} Gwei ({(parseFloat(gasData.mainnetGas) / 1e9).toFixed(9)} CRO/gas)</li>
              </ul>
              <div><strong>Recommendation:</strong> {gasData.recommendation}</div>
              <div><strong>Estimated TX Cost:</strong> {gasData.txCost} TCRO</div>
            </div>
          ) : (
            <span className="value">{result.decision.reason}</span>
          )}
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
          <div className="value safety-notes">
            {result.decision.clampNotes.split(' • ').map((note, i) => (
              <div key={i} className="safety-note-item">• {note}</div>
            ))}
          </div>
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

