import React from "react";
import Layout from "../components/Layout";

export default function FAQ() {
  const faqs = [
    {
      q: "What is Sentinel SimpleVault?",
      a: "Sentinel SimpleVault is an AI-powered vault management platform on Cronos blockchain. It uses intelligent agents to analyze your vault and recommend safe withdrawal limits based on risk factors."
    },
    {
      q: "How do the AI agents work?",
      a: "Our agents use a hybrid approach: AI-powered analysis when enabled (using OpenAI GPT-4) and deterministic rule-based logic as fallback. They analyze your vault balance, transaction history, and risk factors to recommend safe withdrawal limits."
    },
    {
      q: "What's the difference between AI Mode and Rule-Based Mode?",
      a: "AI Mode uses advanced language models to analyze context and make intelligent recommendations. Rule-Based Mode uses predetermined mathematical formulas. Both are safe and auditable on-chain."
    },
    {
      q: "Is my money safe?",
      a: "Yes! All funds are stored in audited smart contracts on Cronos blockchain. Agents can only recommend limits - they cannot withdraw your funds. Only you control your wallet."
    },
    {
      q: "What are the different agents?",
      a: "We have 5 agents: Settlement Batch Optimizer (for settlements), Withdrawal Risk Sentinel (monitors risk), Emergency Brake (crisis protection), Gas Fee Monitor (optimizes gas costs), and Portfolio Rebalancer AI (AI-powered recommendations)."
    },
    {
      q: "How do I deposit funds?",
      a: "Connect your Cronos wallet, go to the Dashboard, and use the Vault Interaction section to deposit TCRO. Your funds are immediately available in your vault."
    },
    {
      q: "Can I withdraw anytime?",
      a: "Yes! You can withdraw up to your recommended limit at any time. The agents help you make safe decisions, but you're always in control."
    },
    {
      q: "What is the 'Safety Adjustments' section?",
      a: "Safety Adjustments show how the system applies safety rules (clamping) to agent recommendations. This ensures limits never exceed safe thresholds like 50% of your balance."
    },
    {
      q: "Why do I see both CRO and wei values?",
      a: "CRO is the human-readable amount (like dollars). Wei is the smallest unit (like cents). We show both for transparency - wei is what's actually stored on the blockchain."
    },
    {
      q: "Where can I see my transaction history?",
      a: "All transactions are recorded on the Cronos blockchain. Visit the Cronos Explorer and search for the vault address: 0xe30093CF82Cb6bc4176a2e1F60B66DFb02811E8a"
    },
    {
      q: "What network should I use?",
      a: "Currently we're on Cronos Testnet (Chain ID 338). Make sure your wallet is connected to the correct network."
    },
    {
      q: "Is there a fee?",
      a: "Only standard Cronos network gas fees apply. There are no platform fees."
    }
  ];

  return (
    <Layout>
      <div className="page-header">
        <h1>Frequently Asked Questions</h1>
        <p className="subtitle">Everything you need to know about Sentinel SimpleVault</p>
      </div>

      <div className="faq-container">
        {faqs.map((faq, index) => (
          <div key={index} className="faq-item">
            <h3 className="faq-question">{faq.q}</h3>
            <p className="faq-answer">{faq.a}</p>
          </div>
        ))}
      </div>

      <div className="faq-footer">
        <h3>Still have questions?</h3>
        <p>Check out our <a href="/about">About page</a> or view the smart contract on <a href="https://explorer.cronos.org/testnet/address/0xe30093CF82Cb6bc4176a2e1F60B66DFb02811E8a" target="_blank" rel="noopener noreferrer">Cronos Explorer</a>.</p>
      </div>
    </Layout>
  );
}
