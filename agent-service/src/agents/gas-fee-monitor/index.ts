import type { Agent, AgentDecision, AgentContext } from "../types.js";
import { ethers } from "ethers";

/**
 * Gas Fee Monitor Agent
 * 
 * Deterministic agent that monitors current gas fees on Cronos Testnet and Mainnet.
 * Provides real-time gas price information and recommends withdrawal limits based on
 * gas cost efficiency.
 * 
 * Logic:
 * - Fetches current gas prices from both networks
 * - Calculates estimated transaction costs
 * - Recommends withdrawal limits that make economic sense given gas costs
 * - If gas is high, suggests larger withdrawals to amortize costs
 * - If gas is low, allows more flexible smaller withdrawals
 */

interface GasFeeData {
  testnet: {
    gasPrice: bigint;
    gasPriceGwei: string;
    estimatedTxCost: bigint;
  };
  mainnet: {
    gasPrice: bigint;
    gasPriceGwei: string;
    estimatedTxCost: bigint;
  };
}

async function fetchGasFees(): Promise<GasFeeData> {
  const CRONOS_TESTNET_RPC = process.env.CRONOS_TESTNET_RPC || "https://evm-t3.cronos.org";
  const CRONOS_MAINNET_RPC = process.env.CRONOS_MAINNET_RPC || "https://evm.cronos.org";
  
  // Estimated gas for a typical withdrawal transaction
  const ESTIMATED_GAS_UNITS = 50000n;

  try {
    // Fetch testnet gas price
    const testnetProvider = new ethers.JsonRpcProvider(CRONOS_TESTNET_RPC);
    const testnetFeeData = await testnetProvider.getFeeData();
    const testnetGasPrice = testnetFeeData.gasPrice || 0n;
    const testnetTxCost = testnetGasPrice * ESTIMATED_GAS_UNITS;

    // Fetch mainnet gas price
    const mainnetProvider = new ethers.JsonRpcProvider(CRONOS_MAINNET_RPC);
    const mainnetFeeData = await mainnetProvider.getFeeData();
    const mainnetGasPrice = mainnetFeeData.gasPrice || 0n;
    const mainnetTxCost = mainnetGasPrice * ESTIMATED_GAS_UNITS;

    return {
      testnet: {
        gasPrice: testnetGasPrice,
        gasPriceGwei: ethers.formatUnits(testnetGasPrice, "gwei"),
        estimatedTxCost: testnetTxCost
      },
      mainnet: {
        gasPrice: mainnetGasPrice,
        gasPriceGwei: ethers.formatUnits(mainnetGasPrice, "gwei"),
        estimatedTxCost: mainnetTxCost
      }
    };
  } catch (error) {
    console.error("Failed to fetch gas fees:", error);
    // Return fallback values
    return {
      testnet: {
        gasPrice: 5000000000n, // 5 Gwei fallback
        gasPriceGwei: "5.0",
        estimatedTxCost: 5000000000n * ESTIMATED_GAS_UNITS
      },
      mainnet: {
        gasPrice: 5000000000n, // 5 Gwei fallback
        gasPriceGwei: "5.0",
        estimatedTxCost: 5000000000n * ESTIMATED_GAS_UNITS
      }
    };
  }
}

export const gasFeeMonitor: Agent = {
  id: "gas-fee-monitor",
  describe: () => ({
    name: "Gas Fee Monitor",
    summary: "Monitors current gas fees on Cronos Testnet and Mainnet, recommending economically efficient withdrawal limits."
  }),
  decide: async (ctx: AgentContext): Promise<AgentDecision> => {
    const b = ctx.balanceWei;
    
    // Fetch current gas fees
    const gasFees = await fetchGasFees();
    
    // Use testnet gas price for calculations (since we're on testnet)
    const txCost = gasFees.testnet.estimatedTxCost;
    const gasPriceGwei = gasFees.testnet.gasPriceGwei;
    
    // Calculate minimum economical withdrawal (tx cost should be < 1% of withdrawal)
    const minEconomicalWithdrawal = txCost * 100n;
    
    // Determine recommended limit based on gas efficiency
    let proposedLimit: bigint;
    let reason: string;
    let confidence: number;
    
    // If balance is very low, suggest waiting or minimal withdrawal
    if (b < minEconomicalWithdrawal) {
      proposedLimit = b / 2n; // 50% of balance
      reason = `Gas=${gasPriceGwei}Gwei (T:${gasFees.testnet.gasPriceGwei} M:${gasFees.mainnet.gasPriceGwei}). Balance too low for economical withdrawal. Min recommended: ${ethers.formatEther(minEconomicalWithdrawal)} TCRO`;
      confidence = 0.9;
    }
    // If gas is relatively high (> 10 Gwei), suggest larger withdrawals
    else if (gasFees.testnet.gasPrice > 10000000000n) {
      proposedLimit = (b * 60n) / 100n; // 60% of balance
      reason = `High gas=${gasPriceGwei}Gwei (T:${gasFees.testnet.gasPriceGwei} M:${gasFees.mainnet.gasPriceGwei}). Recommend larger withdrawals to amortize cost. Est tx cost: ${ethers.formatEther(txCost)} TCRO`;
      confidence = 0.85;
    }
    // If gas is low (< 5 Gwei), allow more flexible withdrawals
    else if (gasFees.testnet.gasPrice < 5000000000n) {
      proposedLimit = (b * 40n) / 100n; // 40% of balance
      reason = `Low gas=${gasPriceGwei}Gwei (T:${gasFees.testnet.gasPriceGwei} M:${gasFees.mainnet.gasPriceGwei}). Favorable for flexible withdrawals. Est tx cost: ${ethers.formatEther(txCost)} TCRO`;
      confidence = 0.8;
    }
    // Normal gas range
    else {
      proposedLimit = (b * 50n) / 100n; // 50% of balance
      reason = `Normal gas=${gasPriceGwei}Gwei (T:${gasFees.testnet.gasPriceGwei} M:${gasFees.mainnet.gasPriceGwei}). Standard withdrawal limit. Est tx cost: ${ethers.formatEther(txCost)} TCRO`;
      confidence = 0.75;
    }

    return {
      proposedLimitWei: proposedLimit,
      reason,
      confidence
    };
  }
};

