import React, { useState, useEffect } from "react";
import { checkHealth, listAgents } from "../lib/api";
import type { AgentInfo } from "../types/api";

interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StatusModal({ isOpen, onClose }: StatusModalProps) {
  const [healthStatus, setHealthStatus] = useState<string>("checking...");
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadStatus();
    }
  }, [isOpen]);

  async function loadStatus() {
    try {
      setLoading(true);
      const [health, agentData] = await Promise.all([
        checkHealth(),
        listAgents()
      ]);
      setHealthStatus(health.status);
      setAgents(agentData.agents);
      setAiEnabled(agentData.aiEnabled);
    } catch (error) {
      setHealthStatus("error");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content status-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>System Status</h2>
          <button onClick={onClose} className="modal-close">✕</button>
        </div>

        <div className="status-modal-body">
          {/* Service Status */}
          <div className="status-section">
            <h3>Service Health</h3>
            <div className="status-grid">
              <div className="status-item">
                <span className="status-label">Agent Service</span>
                <span className={`status-badge ${healthStatus === "ok" ? "success" : "error"}`}>
                  {healthStatus === "ok" ? "✓ Online" : "✗ Offline"}
                </span>
              </div>
              <div className="status-item">
                <span className="status-label">AI Mode</span>
                <span className={`status-badge ${aiEnabled ? "success" : "warning"}`}>
                  {aiEnabled ? "✓ ENABLED" : "⚠ Fallback Only"}
                </span>
              </div>
            </div>
          </div>

          {/* Network Status */}
          <div className="status-section">
            <h3>Network</h3>
            <div className="status-grid">
              <div className="status-item">
                <span className="status-label">Chain</span>
                <span className="status-value">Cronos Testnet</span>
              </div>
              <div className="status-item">
                <span className="status-label">Chain ID</span>
                <span className="status-value">338</span>
              </div>
              <div className="status-item">
                <span className="status-label">RPC</span>
                <span className="status-value">https://evm-t3.cronos.org</span>
              </div>
            </div>
          </div>

          {/* Agents Status */}
          <div className="status-section">
            <h3>Agents ({agents.length})</h3>
            {loading ? (
              <div className="loading-text">Loading agents...</div>
            ) : (
              <div className="agents-status-list">
                {agents.map((agent) => (
                  <div key={agent.id} className="agent-status-item">
                    <div className="agent-status-info">
                      <span className="agent-status-name">{agent.name}</span>
                      <span className="agent-status-id">{agent.id}</span>
                    </div>
                    <span className="status-badge success">✓ Active</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contract Addresses */}
          <div className="status-section">
            <h3>Smart Contracts</h3>
            <div className="contract-list">
              <div className="contract-item">
                <span className="contract-label">SimpleVault</span>
                <code className="contract-address">0xe30093CF82Cb6bc4176a2e1F60B66DFb02811E8a</code>
              </div>
              <div className="contract-item">
                <span className="contract-label">SettlementPayment</span>
                <code className="contract-address">0xF5C2d702A0d483D4Be9c00E44f2C753aa54F1db0</code>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={loadStatus} className="btn-secondary" disabled={loading}>
            {loading ? "Refreshing..." : "Refresh Status"}
          </button>
          <button onClick={onClose} className="btn-primary">Close</button>
        </div>
      </div>
    </div>
  );
}
