import { ethers } from "ethers";

// Contract addresses
export const SIMPLE_VAULT_ADDRESS = "0xe30093CF82Cb6bc4176a2e1F60B66DFb02811E8a";
export const SETTLEMENT_PAYMENT_ADDRESS = "0xF5C2d702A0d483D4Be9c00E44f2C753aa54F1db0";

// Cronos Testnet configuration
export const CRONOS_TESTNET = {
  chainId: "0x152", // 338 in hex
  chainName: "Cronos Testnet",
  nativeCurrency: {
    name: "TCRO",
    symbol: "TCRO",
    decimals: 18,
  },
  rpcUrls: ["https://evm-t3.cronos.org"],
  blockExplorerUrls: ["https://explorer.cronos.org/testnet"],
};

// SimpleVault ABI (minimal for reading)
export const SIMPLE_VAULT_ABI = [
  "function owner() view returns (address)",
  "function agent() view returns (address)",
  "function balances(address user) view returns (uint256)",
  "function recommendedWithdrawLimit(address user) view returns (uint256)",
  "function deposit() payable",
  "function withdraw(uint256 amount)",
  "event AgentRecommendation(address indexed agent, address indexed user, uint256 newLimit, string reason)",
];

// SettlementPayment ABI
export const SETTLEMENT_PAYMENT_ABI = [
  "function payForSettlement(string calldata jobId) external payable",
  "function checkPayment(string calldata jobId) external view returns (bool isPaid, address payer, uint256 amount)",
  "function isJobPaid(string calldata jobId) external view returns (bool)",
  "function getSettlementFee() external view returns (uint256)",
  "function getRecipient() external view returns (address)",
  "event SettlementPaid(bytes32 indexed jobId, address indexed payer, uint256 amount, uint256 timestamp)"
];

// Get provider (read-only)
export function getProvider(): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(CRONOS_TESTNET.rpcUrls[0]);
}

// Get contract instance (read-only)
export function getVaultContract(signerOrProvider?: ethers.Signer | ethers.Provider): ethers.Contract {
  const provider = signerOrProvider || getProvider();
  return new ethers.Contract(SIMPLE_VAULT_ADDRESS, SIMPLE_VAULT_ABI, provider);
}

// Get SettlementPayment contract instance
export function getSettlementPaymentContract(signerOrProvider?: ethers.Signer | ethers.Provider): ethers.Contract {
  const provider = signerOrProvider || getProvider();
  return new ethers.Contract(SETTLEMENT_PAYMENT_ADDRESS, SETTLEMENT_PAYMENT_ABI, provider);
}

// Check if MetaMask is installed
export function isMetaMaskInstalled(): boolean {
  return typeof window !== "undefined" && typeof window.ethereum !== "undefined";
}

// Request account access
export async function connectWallet(): Promise<string> {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed");
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    return accounts[0];
  } catch (error) {
    throw new Error("Failed to connect wallet");
  }
}

// Switch to Cronos Testnet
export async function switchToCronosTestnet(): Promise<void> {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed");
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: CRONOS_TESTNET.chainId }],
    });
  } catch (switchError: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [CRONOS_TESTNET],
        });
      } catch (addError) {
        throw new Error("Failed to add Cronos Testnet to MetaMask");
      }
    } else {
      throw new Error("Failed to switch to Cronos Testnet");
    }
  }
}

// Get signer from MetaMask
export async function getSigner(): Promise<ethers.Signer> {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  return provider.getSigner();
}

// Get current account
export async function getCurrentAccount(): Promise<string | null> {
  if (!isMetaMaskInstalled()) {
    return null;
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_accounts",
    });
    return accounts[0] || null;
  } catch (error) {
    return null;
  }
}

// Get current chain ID
export async function getCurrentChainId(): Promise<string | null> {
  if (!isMetaMaskInstalled()) {
    return null;
  }

  try {
    const chainId = await window.ethereum.request({
      method: "eth_chainId",
    });
    return chainId;
  } catch (error) {
    return null;
  }
}

// Format address for display
export function formatAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Utility functions
export function weiToEther(wei: string | bigint): string {
  return ethers.formatEther(wei);
}

export function etherToWei(ether: string): bigint {
  return ethers.parseEther(ether);
}

// TypeScript declarations for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

