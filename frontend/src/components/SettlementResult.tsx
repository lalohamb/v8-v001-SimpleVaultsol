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

      <div 
        className="result-section x402-section" 
        title="x402 is a blockchain-native payment protocol inspired by HTTP 402. It ensures services are paid for before execution by verifying payment on-chain via smart contracts, preventing abuse of expensive AI/blockchain resources."
      >
        <h4>🔐 x402 Payment Protocol</h4>
        <p className="section-description">
          This settlement used the <strong>x402 Payment Required</strong> protocol. Your payment in Step 1 was verified on-chain 
          via the SettlementPayment smart contract before execution. The contract checked <code>isJobPaid(jobId)</code> returned true, 
          ensuring the 1.0 TCRO fee was paid before consuming AI and blockchain resources.
        </p>
        <div className="x402-tooltip">
          <strong>What is x402 Payment Required?</strong>
          <p>A blockchain-native payment protocol inspired by HTTP 402 status code.</p>
          
          <strong>HTTP 402 Background</strong>
          <ul>
            <li>HTTP has a <strong>402 Payment Required</strong> status code (reserved since 1997)</li>
            <li>Originally intended for digital payment systems on the web</li>
            <li>Never widely implemented in traditional web services</li>
          </ul>

          <strong>x402 in This Project</strong>
          <p>"x402" = Blockchain implementation of payment-required workflows</p>

          <strong>How It Works:</strong>
          <p><strong>Payment First (Step 1)</strong></p>
          <ul>
            <li>User pays 1.0 TCRO to smart contract</li>
            <li>Payment recorded on-chain with Job ID</li>
            <li>Creates immutable payment proof</li>
          </ul>

          <p><strong>Verification (Step 2)</strong></p>
          <ul>
            <li>Backend calls <code>isJobPaid(jobId)</code> on smart contract</li>
            <li>If false → Returns HTTP 402 error</li>
            <li>If true → Proceeds with execution</li>
          </ul>

          <p><strong>Execution</strong></p>
          <ul>
            <li>AI agent analysis runs</li>
            <li>Blockchain transaction submitted</li>
            <li>Resources consumed only after payment verified</li>
          </ul>

          <strong>Why x402?</strong>
          <ul>
            <li><strong>Prevents abuse:</strong> Can't spam expensive AI/blockchain operations</li>
            <li><strong>Trustless:</strong> Payment verification happens on-chain (no centralized database)</li>
            <li><strong>Transparent:</strong> Anyone can verify payment status on blockchain</li>
            <li><strong>Immutable:</strong> Payment records can't be altered or deleted</li>
          </ul>

          <strong>Key Difference from Traditional Payments:</strong>
          <ul>
            <li><strong>Traditional:</strong> Payment processed by centralized server</li>
            <li><strong>x402:</strong> Payment verified by decentralized smart contract on Cronos blockchain</li>
          </ul>

          <p><em>It's essentially "pay-per-use" for blockchain services, enforced by smart contracts rather than traditional payment processors.</em></p>
        </div>
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

