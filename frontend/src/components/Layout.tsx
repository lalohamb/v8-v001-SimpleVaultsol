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
        <p>AI-Powered & Deterministic Agents for Cronos Blockchain Vault Management</p>
      </footer>
    </div>
  );
}

