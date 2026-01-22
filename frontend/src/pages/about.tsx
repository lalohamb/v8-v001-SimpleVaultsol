import React from "react";
import Layout from "../components/Layout";

export default function About() {
  return (
    <Layout>
      <div className="page-header">
        <h1>About Sentinel SimpleVault</h1>
        <p className="subtitle">AI-Powered Vault Management on Cronos Blockchain</p>
      </div>

      <div className="about-container">
        <section className="about-section">
          <h2>🛡️ What We Do</h2>
          <p>
            Sentinel SimpleVault combines artificial intelligence with blockchain technology to provide intelligent vault management on the Cronos network. Our platform uses AI agents to analyze your vault activity and recommend safe withdrawal limits, protecting your assets while maintaining flexibility.
          </p>
        </section>

        <section className="about-section">
          <h2>🤖 Hybrid Intelligence</h2>
          <p>
            We use a unique hybrid approach that combines:
          </p>
          <ul>
            <li><strong>AI-Powered Analysis:</strong> When enabled, uses OpenAI GPT-4 to analyze context and make intelligent recommendations</li>
            <li><strong>Rule-Based Fallback:</strong> Deterministic algorithms ensure the system always works, even without AI</li>
            <li><strong>On-Chain Transparency:</strong> Every decision is recorded on the Cronos blockchain for full auditability</li>
          </ul>
        </section>

        <section className="about-section">
          <h2>🔧 Our Agents</h2>
          <div className="agents-grid-about">
            <div className="agent-card-about">
              <h3>📦 Settlement Batch Optimizer</h3>
              <p>Computes safe caps for multi-step settlement execution after x402 payments.</p>
            </div>
            <div className="agent-card-about">
              <h3>⚠️ Withdrawal Risk Sentinel</h3>
              <p>Monitors account state and dynamically adjusts withdrawal limits to prevent rapid depletion.</p>
            </div>
            <div className="agent-card-about">
              <h3>🚨 Emergency Brake</h3>
              <p>Crisis-mode limiter that aggressively clamps limits during abnormal conditions.</p>
            </div>
            <div className="agent-card-about">
              <h3>⛽ Gas Fee Monitor</h3>
              <p>Monitors real-time gas prices and recommends economically efficient withdrawal limits.</p>
            </div>
            <div className="agent-card-about">
              <h3>🧠 Portfolio Rebalancer AI</h3>
              <p>AI-powered agent that provides intelligent portfolio rebalancing recommendations.</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>🔒 Security First</h2>
          <p>
            Your security is our priority:
          </p>
          <ul>
            <li>Smart contracts audited and deployed on Cronos Testnet</li>
            <li>Agents can only recommend - never execute withdrawals</li>
            <li>All decisions recorded on-chain for transparency</li>
            <li>Safety rules (clamping) prevent excessive recommendations</li>
            <li>You maintain full control of your wallet and funds</li>
          </ul>
        </section>

        <section className="about-section">
          <h2>🌐 Built on Cronos</h2>
          <p>
            We chose Cronos for its:
          </p>
          <ul>
            <li>Low transaction fees</li>
            <li>Fast block times</li>
            <li>EVM compatibility</li>
            <li>Growing DeFi ecosystem</li>
          </ul>
        </section>

        <section className="about-section">
          <h2>📊 Smart Contracts</h2>
          <div className="contract-info">
            <div>
              <strong>SimpleVault:</strong>
              <code>0xe30093CF82Cb6bc4176a2e1F60B66DFb02811E8a</code>
            </div>
            <div>
              <strong>SettlementPayment:</strong>
              <code>0xF5C2d702A0d483D4Be9c00E44f2C753aa54F1db0</code>
            </div>
            <div>
              <strong>Network:</strong> Cronos Testnet (Chain ID: 338)
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>🚀 Get Started</h2>
          <ol>
            <li>Connect your Cronos wallet (MetaMask or Cronos Wallet)</li>
            <li>Switch to Cronos Testnet</li>
            <li>Deposit TCRO into your vault</li>
            <li>Run agents to get intelligent recommendations</li>
            <li>Withdraw safely based on agent analysis</li>
          </ol>
        </section>
      </div>
    </Layout>
  );
}
