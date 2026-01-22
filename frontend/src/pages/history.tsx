import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { getRecentVaultEvents } from "../lib/web3";
import { formatAddress } from "../lib/web3";
import { weiToEther } from "../lib/api";
import { format } from "date-fns";

interface VaultEvent {
  eventType: string;
  user?: string;
  amount?: string;
  agent?: string;
  reason?: string;
  timestamp: number;
  transactionHash: string;
  blockNumber: number;
}

export default function TransactionHistory() {
  const [events, setEvents] = useState<VaultEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      setLoading(true);
      const recentEvents = await getRecentVaultEvents(100);
      setEvents(recentEvents);
    } catch (error) {
      console.error("Failed to load events:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredEvents = events.filter(event => {
    if (filter === "all") return true;
    return event.eventType.toLowerCase() === filter.toLowerCase();
  });

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>Transaction History</h1>
          <p className="subtitle">All vault activity recorded on the Cronos blockchain</p>
        </div>
      </div>

      <div className="filter-bar">
        <button 
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All ({events.length})
        </button>
        <button 
          className={`filter-btn ${filter === "deposited" ? "active" : ""}`}
          onClick={() => setFilter("deposited")}
        >
          Deposits ({events.filter(e => e.eventType === "Deposited").length})
        </button>
        <button 
          className={`filter-btn ${filter === "withdrawn" ? "active" : ""}`}
          onClick={() => setFilter("withdrawn")}
        >
          Withdrawals ({events.filter(e => e.eventType === "Withdrawn").length})
        </button>
        <button 
          className={`filter-btn ${filter === "agentrecommendation" ? "active" : ""}`}
          onClick={() => setFilter("agentrecommendation")}
        >
          Agent Actions ({events.filter(e => e.eventType === "AgentRecommendation").length})
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading transaction history...</div>
      ) : (
        <div className="events-list">
          {filteredEvents.map((event, index) => (
            <div key={`${event.transactionHash}-${index}`} className="event-card">
              <div className="event-header">
                <span className={`event-type ${event.eventType.toLowerCase()}`}>
                  {event.eventType === "Deposited" && "💰 Deposit"}
                  {event.eventType === "Withdrawn" && "📤 Withdrawal"}
                  {event.eventType === "AgentRecommendation" && "🤖 Agent Action"}
                </span>
                <span className="event-time">
                  {format(new Date(event.timestamp * 1000), "MMM dd, yyyy HH:mm:ss")}
                </span>
              </div>

              <div className="event-details">
                {event.user && (
                  <div className="event-row">
                    <span className="label">User:</span>
                    <span className="value">{formatAddress(event.user)}</span>
                  </div>
                )}
                {event.amount && (
                  <div className="event-row">
                    <span className="label">Amount:</span>
                    <span className="value">{weiToEther(event.amount)} CRO</span>
                  </div>
                )}
                {event.agent && (
                  <div className="event-row">
                    <span className="label">Agent:</span>
                    <span className="value">{formatAddress(event.agent)}</span>
                  </div>
                )}
                {event.reason && (
                  <div className="event-row">
                    <span className="label">Reason:</span>
                    <span className="value">{event.reason}</span>
                  </div>
                )}
                <div className="event-row">
                  <span className="label">Transaction:</span>
                  <a
                    href={`https://explorer.cronos.org/testnet/tx/${event.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tx-link"
                  >
                    {formatAddress(event.transactionHash)}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
