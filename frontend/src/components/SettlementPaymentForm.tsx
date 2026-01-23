import React, { useState, useEffect } from "react";
import { getSettlementPaymentContract, getSigner, weiToEther } from "../lib/web3";
import { ethers } from "ethers";

interface SettlementPaymentFormProps {
  jobId: string;
  onPaymentSuccess: () => void;
  onPaymentError: (error: string) => void;
}

export default function SettlementPaymentForm({
  jobId,
  onPaymentSuccess,
  onPaymentError,
}: SettlementPaymentFormProps) {
  const [loading, setLoading] = useState(false);
  const [fee, setFee] = useState<string | null>(null);
  const [recipient, setRecipient] = useState<string | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadPaymentInfo();
    checkPaymentStatus();
  }, [jobId]);

  async function loadPaymentInfo() {
    try {
      const contract = getSettlementPaymentContract();
      const feeWei = await contract.getSettlementFee();
      const recipientAddr = await contract.getRecipient();
      
      setFee(weiToEther(feeWei));
      setRecipient(recipientAddr);
    } catch (error) {
      console.error("Failed to load payment info:", error);
    }
  }

  async function checkPaymentStatus() {
    if (!jobId) return;
    
    try {
      const contract = getSettlementPaymentContract();
      const [isPaid] = await contract.checkPayment(jobId);
      setIsPaid(isPaid);
    } catch (error) {
      console.error("Failed to check payment status:", error);
    }
  }

  async function handlePayment() {
    if (!jobId || !fee) {
      onPaymentError("Missing job ID or fee information");
      return;
    }

    // Check if wallet is available
    if (typeof window === "undefined" || !window.ethereum) {
      onPaymentError("No Web3 wallet detected. Please install Cronos Wallet or MetaMask.");
      return;
    }

    try {
      setLoading(true);
      onPaymentError(""); // Clear previous errors
      
      console.log("Checking wallet connection...");
      
      // First, request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found. Please unlock your wallet.");
      }
      
      console.log("Connected account:", accounts[0]);
      console.log("Getting signer...");
      
      // Get signer from connected wallet
      const signer = await getSigner();
      console.log("Wallet connected, preparing transaction...");
      
      const contract = getSettlementPaymentContract(signer);
      
      // Get fee in wei
      const feeWei = await contract.getSettlementFee();
      console.log("Fee:", ethers.formatEther(feeWei), "TCRO");
      
      console.log("Sending transaction to wallet for approval...");
      // Call payForSettlement with the fee
      const tx = await contract.payForSettlement(jobId, {
        value: feeWei
      });
      
      console.log("Transaction submitted:", tx.hash);
      setTxHash(tx.hash);
      
      console.log("Waiting for confirmation...");
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log("Transaction confirmed in block:", receipt.blockNumber);
      
      setIsPaid(true);
      onPaymentSuccess();
    } catch (error: any) {
      console.error("Payment failed:", error);
      
      // Better error messages
      if (error.code === 4001) {
        onPaymentError("Transaction rejected by user");
      } else if (error.code === -32002) {
        onPaymentError("Please check your wallet - a connection request is pending");
      } else if (error.message?.includes("insufficient funds")) {
        onPaymentError("Insufficient TCRO balance for transaction + gas fees");
      } else {
        onPaymentError(error.message || "Payment failed");
      }
    } finally {
      setLoading(false);
    }
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="settlement-payment-form">
        <div className="payment-info">
          <h4>Loading payment information...</h4>
        </div>
      </div>
    );
  }

  if (isPaid) {
    return (
      <div className="payment-success">
        <div className="success-icon">✓</div>
        <h3>Payment Confirmed</h3>
        <p>Job ID: <code>{jobId}</code></p>
        {txHash && (
          <p className="tx-link">
            <a
              href={`https://explorer.cronos.org/testnet/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Transaction →
            </a>
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="settlement-payment-form">
      <div className="payment-info">
        <h4>Payment Required</h4>
        {fee && (
          <div className="fee-display">
            <span className="fee-label">Settlement Fee:</span>
            <span className="fee-amount">{fee} TCRO</span>
          </div>
        )}
        {recipient && (
          <div className="recipient-info">
            <span className="recipient-label">Recipient:</span>
            <span className="recipient-address">{recipient}</span>
          </div>
        )}
      </div>

      <button
        onClick={handlePayment}
        disabled={loading || !jobId}
        className="btn-primary payment-btn"
        title={loading ? "Check your wallet for pending approval" : "Click to open wallet and approve payment"}
      >
        {loading ? "⏳ Check Your Wallet..." : `Pay ${fee || "..."} TCRO`}
      </button>

      {txHash && !isPaid && (
        <div className="tx-pending">
          <p>Transaction submitted. Waiting for confirmation...</p>
          <a
            href={`https://explorer.cronos.org/testnet/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on Explorer →
          </a>
        </div>
      )}
    </div>
  );
}

