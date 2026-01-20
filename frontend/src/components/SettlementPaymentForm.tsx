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

    try {
      setLoading(true);
      
      // Get signer from MetaMask
      const signer = await getSigner();
      const contract = getSettlementPaymentContract(signer);
      
      // Get fee in wei
      const feeWei = await contract.getSettlementFee();
      
      // Call payForSettlement with the fee
      const tx = await contract.payForSettlement(jobId, {
        value: feeWei
      });
      
      setTxHash(tx.hash);
      
      // Wait for transaction confirmation
      await tx.wait();
      
      setIsPaid(true);
      onPaymentSuccess();
    } catch (error: any) {
      console.error("Payment failed:", error);
      onPaymentError(error.message || "Payment failed");
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
      >
        {loading ? "Processing Payment..." : `Pay ${fee || "..."} TCRO`}
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

