import { ethers } from "ethers";

const SETTLEMENT_PAYMENT_ABI = [
  "function payForSettlement(string calldata jobId) external payable",
  "function checkPayment(string calldata jobId) external view returns (bool isPaid, address payer, uint256 amount)",
  "function isJobPaid(string calldata jobId) external view returns (bool)",
  "function getSettlementFee() external view returns (uint256)",
  "function getRecipient() external view returns (address)",
  "event SettlementPaid(bytes32 indexed jobId, address indexed payer, uint256 amount, uint256 timestamp)"
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

