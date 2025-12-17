import React from "react";
import type { AgentInfo } from "../types/api";

interface AgentCardProps {
  agent: AgentInfo;
  onSelect: (agentId: string) => void;
  selected?: boolean;
}

export default function AgentCard({ agent, onSelect, selected }: AgentCardProps) {
  return (
    <div
      className={`agent-card ${selected ? "selected" : ""}`}
      onClick={() => onSelect(agent.id)}
    >
      <h3>{agent.name}</h3>
      <p className="agent-id">ID: {agent.id}</p>
      <p className="agent-description">{agent.description}</p>
    </div>
  );
}

