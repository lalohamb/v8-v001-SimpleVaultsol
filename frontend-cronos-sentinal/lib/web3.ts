import { ethers } from "ethers";

// Contract addresses from environment
export const SIMPLE_VAULT_ADDRESS = process.env.NEXT_PUBLIC_SIMPLE_VAULT_ADDRESS || "0xe30093CF82Cb6bc4176a2e1F60B66DFb02811E8a";
export const SETTLEMENT_PAYMENT_ADDRESS = process.env.NEXT_PUBLIC_SETTLEMENT_PAYMENT_ADDRESS || "0xF5C2d702A0d483D4Be9c00E44f2C753aa54F1db0";

// Cronos Testnet configuration
export const CRONOS_TESTNET = {
  chainId: "0x152", // 338 in hex
  chainName: process.env.NEXT_PUBLIC_CHAIN_NAME || "Cronos Testnet",
  nativeCurrency: {
    name: "TCRO",
    symbol: "TCRO",
    decimals: 18,
  },
  rpcUrls: [process.env.NEXT_PUBLIC_RPC_URL || "https://evm-t3.cronos.org"],
  blockExplorerUrls: [process.env.NEXT_PUBLIC_EXPLORER_URL || "https://explorer.cronos.org/testnet"],
};

// SimpleVault ABI
export const SIMPLE_VAULT_ABI = [
  "function owner() view returns (address)",
  "function agent() view returns (address)",
  "function balances(address user) view returns (uint256)",
  "function recommendedWithdrawLimit(address user) view returns (uint256)",
  "function deposit() payable",
  "function withdraw(uint256 amount)",
  "event Deposited(address indexed user, uint256 amount)",
  "event Withdrawn(address indexed user, uint256 amount)",
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

// Check if any Ethereum wallet is installed
export function isWalletInstalled(): boolean {
  if (typeof window === "undefined") return false;

  // Check for standard ethereum provider
  if (typeof (window as any).ethereum !== "undefined") {
    return true;
  }

  // Check for Cronos/Crypto.com DeFi Wallet
  if (typeof (window as any).defiWallet !== "undefined") {
    return true;
  }

  return false;
}

// Get the ethereum provider (supports multiple wallets)
export function getEthereumProvider(): any {
  if (typeof window === "undefined") return null;

  // Prioritize Cronos/Crypto.com DeFi Wallet if available
  if (typeof (window as any).defiWallet !== "undefined") {
    return (window as any).defiWallet;
  }

  // Fall back to standard ethereum provider
  if (typeof (window as any).ethereum !== "undefined") {
    return (window as any).ethereum;
  }

  return null;
}

// Request account access
export async function connectWallet(): Promise<string> {
  const provider = getEthereumProvider();

  if (!provider) {
    throw new Error("No Ethereum wallet detected. Please install MetaMask or Crypto.com DeFi Wallet.");
  }

  try {
    const accounts = await provider.request({
      method: "eth_requestAccounts",
    });

    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts found");
    }

    return accounts[0];
  } catch (error: any) {
    if (error.code === 4001) {
      throw new Error("User rejected the connection request");
    }
    console.error("Failed to connect wallet:", error);
    throw new Error("Failed to connect wallet");
  }
}

// Legacy function for backwards compatibility
export function isMetaMaskInstalled(): boolean {
  return isWalletInstalled();
}

// Switch to Cronos Testnet
export async function switchToCronosTestnet(): Promise<void> {
  const provider = getEthereumProvider();

  if (!provider) {
    throw new Error("No Ethereum wallet detected");
  }

  const chainId = "0x152"; // 338 in hex

  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId }],
    });
  } catch (switchError: any) {
    // This error code indicates that the chain has not been added to the wallet
    if (switchError.code === 4902) {
      try {
        // Create a fresh object to avoid read-only property issues
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId,
            chainName: "Cronos Testnet",
            nativeCurrency: {
              name: "TCRO",
              symbol: "TCRO",
              decimals: 18,
            },
            rpcUrls: ["https://evm-t3.cronos.org"],
            blockExplorerUrls: ["https://explorer.cronos.org/testnet"],
          }],
        });
      } catch (addError) {
        console.error("Failed to add Cronos Testnet:", addError);
        throw new Error("Failed to add Cronos Testnet to MetaMask");
      }
    } else if (switchError.code === 4001) {
      // User rejected the request
      throw new Error("User rejected network switch");
    } else {
      console.error("Failed to switch network:", switchError);
      throw new Error("Failed to switch to Cronos Testnet");
    }
  }
}

// Get signer from wallet
export async function getSigner(): Promise<ethers.Signer> {
  const provider = getEthereumProvider();

  if (!provider) {
    throw new Error("No Ethereum wallet detected");
  }

  const ethersProvider = new ethers.BrowserProvider(provider);
  return ethersProvider.getSigner();
}

// Get current account
export async function getCurrentAccount(): Promise<string | null> {
  const provider = getEthereumProvider();

  if (!provider) {
    return null;
  }

  try {
    const accounts = await provider.request({
      method: "eth_accounts",
    });
    return accounts[0] || null;
  } catch (error) {
    console.error("Failed to get current account:", error);
    return null;
  }
}

// Get current chain ID
export async function getCurrentChainId(): Promise<string | null> {
  const provider = getEthereumProvider();

  if (!provider) {
    return null;
  }

  try {
    const chainId = await provider.request({
      method: "eth_chainId",
    });
    return chainId;
  } catch (error) {
    console.error("Failed to get chain ID:", error);
    return null;
  }
}

// Get vault balance for a user
export async function getVaultBalance(userAddress: string): Promise<bigint> {
  const contract = getVaultContract();
  return await contract.balances(userAddress);
}

// Get recommended withdraw limit for a user
export async function getRecommendedLimit(userAddress: string): Promise<bigint> {
  const contract = getVaultContract();
  return await contract.recommendedWithdrawLimit(userAddress);
}

// Utility functions
export function weiToEther(wei: bigint | string): string {
  const weiNum = typeof wei === 'string' ? BigInt(wei) : wei;
  return ethers.formatEther(weiNum);
}

export function etherToWei(ether: string): bigint {
  return ethers.parseEther(ether);
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function getCronosTestnetExplorerUrl(txHash: string): string {
  return `${CRONOS_TESTNET.blockExplorerUrls[0]}/tx/${txHash}`;
}

// Event querying functions
export interface BlockchainEvent {
  blockNumber: number;
  transactionHash: string;
  timestamp: number;
  eventType: 'Deposited' | 'Withdrawn' | 'AgentRecommendation';
  user?: string;
  agent?: string;
  amount?: bigint;
  newLimit?: bigint;
  reason?: string;
}

/**
 * Query recent blockchain events from the vault
 * @param blockRange Number of blocks to look back (default: 10000)
 * @returns Array of formatted blockchain events
 */
export async function getRecentVaultEvents(blockRange: number = 10000): Promise<BlockchainEvent[]> {
  try {
    const provider = getProvider();
    const vault = getVaultContract(provider);
    const currentBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, currentBlock - blockRange);

    // Query all event types
    const [depositedEvents, withdrawnEvents, agentEvents] = await Promise.all([
      vault.queryFilter(vault.filters.Deposited(), fromBlock),
      vault.queryFilter(vault.filters.Withdrawn(), fromBlock),
      vault.queryFilter(vault.filters.AgentRecommendation(), fromBlock),
    ]);

    // Format events
    const events: BlockchainEvent[] = [];

    for (const event of depositedEvents) {
      const block = await provider.getBlock(event.blockNumber);
      const args = (event as any).args;
      events.push({
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        timestamp: block?.timestamp || 0,
        eventType: 'Deposited',
        user: args?.[0],
        amount: args?.[1],
      });
    }

    for (const event of withdrawnEvents) {
      const block = await provider.getBlock(event.blockNumber);
      const args = (event as any).args;
      events.push({
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        timestamp: block?.timestamp || 0,
        eventType: 'Withdrawn',
        user: args?.[0],
        amount: args?.[1],
      });
    }

    for (const event of agentEvents) {
      const block = await provider.getBlock(event.blockNumber);
      const args = (event as any).args;
      events.push({
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        timestamp: block?.timestamp || 0,
        eventType: 'AgentRecommendation',
        agent: args?.[0],
        user: args?.[1],
        newLimit: args?.[2],
        reason: args?.[3],
      });
    }

    // Sort by block number (most recent first)
    return events.sort((a, b) => b.blockNumber - a.blockNumber);
  } catch (error) {
    console.error('Failed to fetch vault events:', error);
    return [];
  }
}

/**
 * Get the timestamp of the last agent recommendation
 * @returns ISO timestamp string or null if no events found
 */
export async function getLastRiskEvaluationTime(): Promise<string | null> {
  try {
    const provider = getProvider();
    const vault = getVaultContract(provider);
    const currentBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, currentBlock - 10000);

    const events = await vault.queryFilter(vault.filters.AgentRecommendation(), fromBlock);

    if (events.length === 0) {
      return null;
    }

    // Get the most recent event
    const latestEvent = events[events.length - 1];
    const block = await provider.getBlock(latestEvent.blockNumber);

    if (!block) {
      return null;
    }

    return new Date(block.timestamp * 1000).toISOString();
  } catch (error) {
    console.error('Failed to get last risk evaluation time:', error);
    return null;
  }
}

export interface SettlementPaymentEvent {
  jobId: string;
  payer: string;
  amount: bigint;
  timestamp: number;
  transactionHash: string;
  blockNumber: number;
}

/**
 * Get recent settlement payment events from the SettlementPayment contract
 * @param blockRange Number of blocks to query (default: 10000)
 * @returns Array of settlement payment events
 */
export async function getSettlementPaymentEvents(blockRange: number = 10000): Promise<SettlementPaymentEvent[]> {
  try {
    const provider = getProvider();
    const settlement = getSettlementPaymentContract(provider);
    const currentBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, currentBlock - blockRange);

    const events = await settlement.queryFilter(settlement.filters.SettlementPaid(), fromBlock);

    const paymentEvents: SettlementPaymentEvent[] = await Promise.all(
      events.map(async (event) => {
        const block = await provider.getBlock(event.blockNumber);
        const eventLog = event as ethers.EventLog;
        return {
          jobId: eventLog.args?.jobId || '',
          payer: eventLog.args?.payer || '',
          amount: eventLog.args?.amount || BigInt(0),
          timestamp: block?.timestamp || 0,
          transactionHash: event.transactionHash,
          blockNumber: event.blockNumber,
        };
      })
    );

    // Sort by block number (most recent first)
    return paymentEvents.sort((a, b) => b.blockNumber - a.blockNumber);
  } catch (error) {
    console.error('Failed to get settlement payment events:', error);
    return [];
  }
}
