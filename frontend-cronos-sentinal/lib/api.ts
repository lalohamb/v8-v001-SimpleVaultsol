import axios, { AxiosError } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================================================
// Types
// ============================================================================

export type AgentId =
  | "settlement-batch-optimizer"
  | "withdrawal-risk-sentinel"
  | "emergency-brake"
  | "gas-fee-monitor"
  | "02portfolio-rebalancer-ai";

export interface AgentInfo {
  id: AgentId;
  name: string;
  summary: string;
  aiCapable: boolean;
}

export interface AgentListResponse {
  status: string;
  aiEnabled: boolean;
  agents: AgentInfo[];
}

export interface AgentApplyRequest {
  agentId: AgentId;
  user: string;
  requestedAmountWei?: string;
}

export interface AgentApplyResponse {
  status: string;
  agentId: AgentId;
  decision: {
    proposedLimitWei: string;
    finalLimitWei: string;
    confidence: number;
    reason: string;
    clampNotes?: string;
  };
  onChain: {
    txHash: string;
    recommendedLimitWei: string;
  };
}

export interface SettlementPayRequest {
  jobId: string;
}

export interface SettlementPayResponse {
  status: string;
  jobId: string;
  message: string;
}

export interface SettlementRunRequest {
  jobId: string;
  user: string;
  agentId: AgentId;
  requestedAmountWei?: string;
}

export interface SettlementRunResponse {
  status: string;
  jobId: string;
  agentId: AgentId;
  onChain: {
    txHash: string;
    recommendedLimitWei: string;
  };
  decision: {
    proposedLimitWei: string;
    finalLimitWei: string;
    confidence: number;
  };
  pipeline: string[];
}

export interface ErrorResponse {
  error: string;
  x402?: {
    jobId: string;
    contractAddress: string;
    amount: string;
    amountWei: string;
    asset: string;
    chain: string;
    chainId: number;
    recipient: string;
    memo: string;
    instructions: string;
  };
}

// ============================================================================
// Agent Endpoints
// ============================================================================

export async function listAgents(): Promise<AgentListResponse> {
  const response = await api.get<AgentListResponse>("/agents/list");
  return response.data;
}

export async function toggleAI(enabled: boolean): Promise<{ status: string; aiEnabled: boolean }> {
  const response = await api.post<{ status: string; aiEnabled: boolean }>("/agents/toggle-ai", { enabled });
  return response.data;
}

export async function applyAgent(
  request: AgentApplyRequest
): Promise<AgentApplyResponse> {
  try {
    const response = await api.post<AgentApplyResponse>("/agents/apply", request);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data) {
      throw new Error(error.response.data.error || "Failed to apply agent");
    }
    throw error;
  }
}

// ============================================================================
// Settlement Endpoints
// ============================================================================

export async function payForSettlement(
  request: SettlementPayRequest
): Promise<SettlementPayResponse> {
  try {
    const response = await api.post<SettlementPayResponse>("/settlement/pay", request);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data) {
      throw new Error(error.response.data.error || "Failed to process payment");
    }
    throw error;
  }
}

export async function runSettlement(
  request: SettlementRunRequest
): Promise<SettlementRunResponse> {
  try {
    const response = await api.post<SettlementRunResponse>("/settlement/run", request);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 402) {
        // x402 Payment Required
        throw {
          type: "payment_required",
          data: axiosError.response.data,
        };
      }
      if (axiosError.response?.status === 409) {
        // Settlement refused
        throw {
          type: "refused",
          data: axiosError.response.data,
        };
      }
      if (axiosError.response?.data) {
        const errorData = axiosError.response.data as ErrorResponse;
        throw new Error(errorData.error || "Failed to run settlement");
      }
    }
    throw error;
  }
}

// ============================================================================
// Health Check
// ============================================================================

export async function checkHealth(): Promise<{ status: string }> {
  const response = await api.get<{ status: string }>("/health");
  return response.data;
}

// ============================================================================
// Utility Functions
// ============================================================================

export function weiToEther(wei: string): string {
  const weiNum = BigInt(wei);
  const etherNum = Number(weiNum) / 1e18;
  return etherNum.toFixed(6);
}

export function etherToWei(ether: string): string {
  const etherNum = parseFloat(ether);
  const weiNum = BigInt(Math.floor(etherNum * 1e18));
  return weiNum.toString();
}

export function formatTxHash(txHash: string): string {
  return `${txHash.slice(0, 10)}...${txHash.slice(-8)}`;
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

