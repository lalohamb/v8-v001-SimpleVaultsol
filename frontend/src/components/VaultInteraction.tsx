import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  getVaultContract,
  getSigner,
  weiToEther,
  etherToWei,
  SIMPLE_VAULT_ADDRESS,
  getCurrentAccount,
} from "../lib/web3";
import { getCronosTestnetExplorerUrl } from "../lib/api";

interface VaultInteractionProps {
  userAddress: string | null;
}

interface TransactionDetails {
  hash: string;
  type: 'deposit' | 'withdraw';
  amount: string;
  gasUsed?: string;
  gasPrice?: string;
  totalGasFee?: string;
  blockNumber?: number;
  timestamp?: number;
  status?: 'pending' | 'confirmed' | 'failed';
}

export default function VaultInteraction({ userAddress: _userAddress }: VaultInteractionProps) {
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>("0");
  const [recommendedLimit, setRecommendedLimit] = useState<string>("0");
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txDetails, setTxDetails] = useState<TransactionDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    detectWallet();
    
    // Listen for account changes
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', detectWallet);
      return () => {
        window.ethereum.removeListener('accountsChanged', detectWallet);
      };
    }
  }, []);

  async function detectWallet() {
    const account = await getCurrentAccount();
    setUserAddress(account);
    if (account) {
      loadVaultData(account);
    }
  }

  useEffect(() => {
    if (userAddress) {
      loadVaultData(userAddress);
    }
  }, [userAddress]);

  async function loadVaultData(address?: string) {
    const addr = address || userAddress;
    if (!addr) return;

    try {
      setRefreshing(true);
      const contract = getVaultContract();
      
      const [userBalance, userLimit] = await Promise.all([
        contract.balances(addr),
        contract.recommendedWithdrawLimit(addr),
      ]);

      setBalance(userBalance.toString());
      setRecommendedLimit(userLimit.toString());
    } catch (err) {
      console.error("Failed to load vault data:", err);
    } finally {
      setRefreshing(false);
    }
  }

  async function handleDeposit(e: React.FormEvent) {
    e.preventDefault();
    if (!userAddress || !depositAmount) return;

    try {
      setLoading(true);
      setError(null);
      setTxHash(null);
      setTxDetails(null);

      const signer = await getSigner();
      const contract = getVaultContract(signer);
      const value = etherToWei(depositAmount);

      const tx = await contract.deposit({ value });
      setTxHash(tx.hash);

      // Set initial transaction details
      setTxDetails({
        hash: tx.hash,
        type: 'deposit',
        amount: depositAmount,
        status: 'pending',
      });

      const receipt = await tx.wait();

      // Calculate gas fees
      const gasUsed = receipt.gasUsed;
      const gasPrice = receipt.gasPrice || tx.gasPrice;
      const totalGasFee = gasUsed * gasPrice;

      // Update transaction details with receipt info
      setTxDetails({
        hash: tx.hash,
        type: 'deposit',
        amount: depositAmount,
        gasUsed: gasUsed.toString(),
        gasPrice: gasPrice.toString(),
        totalGasFee: ethers.formatEther(totalGasFee),
        blockNumber: receipt.blockNumber,
        timestamp: Date.now(),
        status: receipt.status === 1 ? 'confirmed' : 'failed',
      });

      // Reload data
      await loadVaultData();
      setDepositAmount("");
    } catch (err: any) {
      setError(err.message || "Failed to deposit");
      if (txDetails) {
        setTxDetails({ ...txDetails, status: 'failed' });
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleWithdraw(e: React.FormEvent) {
    e.preventDefault();
    if (!userAddress || !withdrawAmount) return;

    try {
      setLoading(true);
      setError(null);
      setTxHash(null);
      setTxDetails(null);

      const signer = await getSigner();
      const contract = getVaultContract(signer);
      const amount = etherToWei(withdrawAmount);

      const tx = await contract.withdraw(amount);
      setTxHash(tx.hash);

      // Set initial transaction details
      setTxDetails({
        hash: tx.hash,
        type: 'withdraw',
        amount: withdrawAmount,
        status: 'pending',
      });

      const receipt = await tx.wait();

      // Calculate gas fees
      const gasUsed = receipt.gasUsed;
      const gasPrice = receipt.gasPrice || tx.gasPrice;
      const totalGasFee = gasUsed * gasPrice;

      // Update transaction details with receipt info
      setTxDetails({
        hash: tx.hash,
        type: 'withdraw',
        amount: withdrawAmount,
        gasUsed: gasUsed.toString(),
        gasPrice: gasPrice.toString(),
        totalGasFee: ethers.formatEther(totalGasFee),
        blockNumber: receipt.blockNumber,
        timestamp: Date.now(),
        status: receipt.status === 1 ? 'confirmed' : 'failed',
      });

      // Reload data
      await loadVaultData();
      setWithdrawAmount("");
    } catch (err: any) {
      setError(err.message || "Failed to withdraw");
      if (txDetails) {
        setTxDetails({ ...txDetails, status: 'failed' });
      }
    } finally {
      setLoading(false);
    }
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="vault-interaction">
        <p className="empty-state">Loading...</p>
      </div>
    );
  }

  if (!userAddress) {
    return (
      <div className="vault-interaction">
        <p className="empty-state">Connect your wallet to interact with the vault</p>
      </div>
    );
  }

  return (
    <div className="vault-interaction">
      <div className="vault-header">
        <h2>Your Vault</h2>
        <button onClick={() => loadVaultData()} disabled={refreshing} className="btn-refresh">
          {refreshing ? "⟳" : "↻"} Refresh
        </button>
      </div>

      <div className="vault-stats">
        <div className="stat-card">
          <div className="stat-label">Balance</div>
          <div className="stat-value">{weiToEther(balance)} TCRO</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Recommended Limit</div>
          <div className="stat-value">{weiToEther(recommendedLimit)} TCRO</div>
        </div>
      </div>

      <div className="vault-actions">
        <form onSubmit={handleDeposit} className="action-form">
          <h3>Deposit</h3>
          <input
            type="number"
            step="0.001"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            placeholder="Amount in TCRO"
            disabled={loading}
          />
          <button type="submit" disabled={loading || !depositAmount} className="btn-primary">
            {loading ? "Processing..." : "Deposit"}
          </button>
        </form>

        <form onSubmit={handleWithdraw} className="action-form">
          <h3>Withdraw</h3>
          <input
            type="number"
            step="0.001"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            placeholder="Amount in TCRO"
            disabled={loading}
          />
          <button type="submit" disabled={loading || !withdrawAmount} className="btn-primary">
            {loading ? "Processing..." : "Withdraw"}
          </button>
        </form>
      </div>

      {txDetails && (
        <div className={`tx-details-card ${txDetails.status}`}>
          <div className="tx-header">
            <div className="tx-status-badge">
              {txDetails.status === 'pending' && (
                <>
                  <span className="spinner">⟳</span>
                  <span>Transaction Pending...</span>
                </>
              )}
              {txDetails.status === 'confirmed' && (
                <>
                  <span className="success-icon">✓</span>
                  <span>Transaction Confirmed!</span>
                </>
              )}
              {txDetails.status === 'failed' && (
                <>
                  <span className="error-icon">✗</span>
                  <span>Transaction Failed</span>
                </>
              )}
            </div>
            <div className="tx-type-badge">
              {txDetails.type === 'deposit' ? '📥 Deposit' : '📤 Withdraw'}
            </div>
          </div>

          <div className="tx-info-grid">
            <div className="tx-info-item">
              <span className="tx-info-label">Amount</span>
              <span className="tx-info-value highlight">{txDetails.amount} TCRO</span>
            </div>

            {txDetails.totalGasFee && (
              <div className="tx-info-item">
                <span className="tx-info-label">Network Fee</span>
                <span className="tx-info-value">{parseFloat(txDetails.totalGasFee).toFixed(6)} TCRO</span>
              </div>
            )}

            {txDetails.gasUsed && (
              <div className="tx-info-item">
                <span className="tx-info-label">Gas Used</span>
                <span className="tx-info-value">{parseInt(txDetails.gasUsed).toLocaleString()}</span>
              </div>
            )}

            {txDetails.gasPrice && (
              <div className="tx-info-item">
                <span className="tx-info-label">Gas Price</span>
                <span className="tx-info-value">{(parseFloat(ethers.formatUnits(txDetails.gasPrice, 'gwei'))).toFixed(2)} Gwei</span>
              </div>
            )}

            {txDetails.blockNumber && (
              <div className="tx-info-item">
                <span className="tx-info-label">Block Number</span>
                <span className="tx-info-value">#{txDetails.blockNumber.toLocaleString()}</span>
              </div>
            )}

            {txDetails.timestamp && (
              <div className="tx-info-item">
                <span className="tx-info-label">Timestamp</span>
                <span className="tx-info-value">{new Date(txDetails.timestamp).toLocaleTimeString()}</span>
              </div>
            )}
          </div>

          <div className="tx-hash-section">
            <div className="tx-hash-label">Transaction Hash</div>
            <div className="tx-hash-value">
              <code>{txDetails.hash.slice(0, 10)}...{txDetails.hash.slice(-8)}</code>
              <button
                onClick={() => navigator.clipboard.writeText(txDetails.hash)}
                className="copy-btn"
                title="Copy full hash"
              >
                📋
              </button>
            </div>
          </div>

          <a
            href={getCronosTestnetExplorerUrl(txDetails.hash)}
            target="_blank"
            rel="noopener noreferrer"
            className="explorer-link"
          >
            View on Cronos Explorer →
          </a>
        </div>
      )}

      {error && <div className="error-banner">{error}</div>}

      <div className="vault-info">
        <p className="info-text">
          Contract: <code>{SIMPLE_VAULT_ADDRESS}</code>
        </p>
      </div>
    </div>
  );
}

