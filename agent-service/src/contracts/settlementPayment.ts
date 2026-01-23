import { ethers } from "ethers";

const SETTLEMENT_PAYMENT_ABI = [
  "function payForSettlement(string calldata jobId) external payable",
  "function checkPayment(string calldata jobId) external view returns (bool isPaid, address payer, uint256 amount)",
  "function isJobPaid(string calldata jobId) external view returns (bool)",
  "function isJobExecuted(string calldata jobId) external view returns (bool)",
  "function isJobAvailable(string calldata jobId) external view returns (bool)",
  "function markJobExecuted(string calldata jobId) external",
  "function getSettlementFee() external view returns (uint256)",
  "function getRecipient() external view returns (address)",
  "event SettlementPaid(bytes32 indexed jobId, address indexed payer, uint256 amount, uint256 timestamp)",
  "event SettlementExecuted(bytes32 indexed jobId, address indexed executor, uint256 timestamp)"
];

/**
 * Get a read-only instance of the SettlementPayment contract
 */
export function getSettlementPaymentReadonly(): ethers.Contract {
  const rpc = process.env.CRONOS_TESTNET_RPC;
  const address = process.env.SETTLEMENT_PAYMENT_ADDRESS;

  if (!rpc) throw new Error("CRONOS_TESTNET_RPC not configured");
  if (!address) throw new Error("SETTLEMENT_PAYMENT_ADDRESS not configured");

  const provider = new ethers.JsonRpcProvider(rpc);
  return new ethers.Contract(address, SETTLEMENT_PAYMENT_ABI, provider);
}

/**
 * Get a write-enabled instance of the SettlementPayment contract with signer
 */
export function getSettlementPaymentWithSigner(privateKey: string): ethers.Contract {
  const rpc = process.env.CRONOS_TESTNET_RPC;
  const address = process.env.SETTLEMENT_PAYMENT_ADDRESS;

  if (!rpc) throw new Error("CRONOS_TESTNET_RPC not configured");
  if (!address) throw new Error("SETTLEMENT_PAYMENT_ADDRESS not configured");

  const provider = new ethers.JsonRpcProvider(rpc);
  const wallet = new ethers.Wallet(privateKey, provider);
  return new ethers.Contract(address, SETTLEMENT_PAYMENT_ABI, wallet);
}

/**
 * Check if a job has been paid for on-chain
 * @param jobId The job identifier
 * @returns Object with payment status, payer address, and amount
 */
export async function checkJobPayment(jobId: string): Promise<{
  isPaid: boolean;
  payer: string;
  amount: bigint;
}> {
  const contract = getSettlementPaymentReadonly();
  const [isPaid, payer, amount] = await contract.checkPayment(jobId);
  
  return {
    isPaid,
    payer,
    amount
  };
}

/**
 * Check if a job is available for execution (paid but not executed)
 * @param jobId The job identifier
 * @returns True if job is paid and not yet executed
 */
export async function isJobAvailable(jobId: string): Promise<boolean> {
  const contract = getSettlementPaymentReadonly();
  return await contract.isJobAvailable(jobId);
}

/**
 * Mark a job as executed on-chain (use-once enforcement)
 * @param jobId The job identifier
 * @param executorPrivateKey Private key of authorized executor
 */
export async function markJobExecuted(jobId: string, executorPrivateKey: string): Promise<void> {
  const contract = getSettlementPaymentWithSigner(executorPrivateKey);
  const tx = await contract.markJobExecuted(jobId);
  await tx.wait();
}

/**
 * Get the current settlement fee
 * @returns Settlement fee in wei (TCRO)
 */
export async function getSettlementFee(): Promise<bigint> {
  const contract = getSettlementPaymentReadonly();
  return await contract.getSettlementFee();
}

/**
 * Get the payment recipient address
 * @returns Recipient address
 */
export async function getPaymentRecipient(): Promise<string> {
  const contract = getSettlementPaymentReadonly();
  return await contract.getRecipient();
}

