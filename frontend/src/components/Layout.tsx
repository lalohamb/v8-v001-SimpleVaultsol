import React from "react";
import Link from "next/link";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-container">
          <Link href="/" className="nav-logo">
            Sentinel SimpleVault Platform
          </Link>
          <div className="nav-links">
            <Link href="/">Dashboard</Link>
            <Link href="/agents">Agent Console</Link>
            <Link href="/settlements">Settlements</Link>
          </div>
        </div>
      </nav>
      <main className="main-content">{children}</main>
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Sentinel SimpleVault</h4>
            <p>AI-Powered & Deterministic Agents for Cronos Blockchain Vault Management</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <Link href="/">Dashboard</Link>
            <Link href="/agents">Agents</Link>
            <Link href="/about">About</Link>
            <Link href="/faq">FAQ</Link>
          </div>
          <div className="footer-section">
            <h4>Resources</h4>
            <a href="https://cronos.org" target="_blank" rel="noopener noreferrer">Cronos Network</a>
            <a href="https://explorer.cronos.org/testnet" target="_blank" rel="noopener noreferrer">Block Explorer</a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
          </div>
          <div className="footer-section">
            <h4>Contract</h4>
            <p className="contract-address">0xe30093CF82Cb6bc4176a2e1F60B66DFb02811E8a</p>
            <p className="footer-note">Cronos Testnet</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 Sentinel SimpleVault. Built for Cronos Hackathon.</p>
        </div>
      </footer>
    </div>
  );
}

