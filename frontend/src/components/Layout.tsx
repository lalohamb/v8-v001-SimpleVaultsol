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
            <img src="/_MConverter.eu_video.gif" alt="Sentinel" className="hero-logo-image" />
            Sentinel SimpleVault 
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
            <div className="footer-logo">
              <img src="/sentinel_logo.png" alt="Sentinel" className="footer-logo-image" />
              <h4>Sentinel SimpleVault</h4>
            </div>
            <p>Deterministic & AI-Powered Agents for vault contract management for the Cronos Blockchain </p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <Link href="/">Dashboard</Link>
            <Link href="/agents">Agents</Link>
            <Link href="/about">About</Link>
            
          </div>
          <div className="footer-section">
            <h4>Resources</h4>
            <a href="https://cronos.org" target="_blank" rel="noopener noreferrer">Cronos Network</a>
            <a href="https://explorer.cronos.org/testnet" target="_blank" rel="noopener noreferrer">Block Explorer</a>
            <Link href="/faq">FAQ</Link>
            
          </div>
          <div className="footer-section">
            <h4>Contracts (Testnet)</h4>
            <a 
              href="https://explorer.cronos.org/testnet/address/0xe30093cf82cb6bc4176a2e1f60b66dfb02811e8a" 
              target="_blank" 
              rel="noopener noreferrer"
              className="contract-link-compact"
            >
              SimpleVault: 0xe30...E8a
            </a>
            <a 
              href="https://explorer.cronos.org/testnet/address/0xf5c2d702a0d483d4be9c00e44f2c753aa54f1db0" 
              target="_blank" 
              rel="noopener noreferrer"
              className="contract-link-compact"
            >
              Settlement: 0xF5C...db0
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>2026 © Sentinel SimpleVault. Built for Cronos Hackathon.</p>
        </div>
      </footer>
    </div>
  );
}

