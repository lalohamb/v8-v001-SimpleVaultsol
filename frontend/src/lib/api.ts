import axios, { AxiosError } from "axios";
import type {
  AgentListResponse,
  AgentApplyRequest,
  AgentApplyResponse,
  SettlementPayRequest,
  SettlementPayResponse,
  SettlementRunRequest,
  SettlementRunResponse,
  ErrorResponse,
} from "../types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Agent endpoints
export async function listAgents(): Promise<AgentListResponse> {
  const response = await api.get<AgentListResponse>("/agents/list");
  return response.data;
}

export async function applyAgent(
  request: AgentApplyRequest
): Promise<AgentApplyResponse> {
  try {
    const response = await api.post<AgentApplyResponse>("/agents/apply", request);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      if (error.response?.status === 400) {
        throw new Error("Invalid request. Please check all required fields.");
      }
      if (error.response?.status === 500) {
        throw new Error("Server error. Please check if you have funds in your vault.");
      }
    }
    throw new Error("Failed to apply agent. Please try again.");
  }
}

// Settlement endpoints
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

// Health check
export async function checkHealth(): Promise<{ status: string }> {
  const response = await api.get<{ status: string }>("/health");
  return response.data;
}

// Utility functions
export function weiToEther(wei: string): string {
  const weiNum = BigInt(wei);
  const etherNum = Number(weiNum) / 1e18;
  return etherNum.toFixed(6);
}

export function etherToWei(ether: string): string {
  const etherNum = parseFloat(ether);
  if (isNaN(etherNum) || etherNum < 0) {
    throw new Error("Invalid ether amount");
  }
  const weiNum = BigInt(Math.floor(etherNum * 1e18));
  return weiNum.toString();
}

export function formatTxHash(hash: string): string {
  if (hash.length < 10) return hash;
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
}

export function getCronosTestnetExplorerUrl(txHash: string): string {
  return `https://explorer.cronos.org/testnet/tx/${txHash}`;
}

