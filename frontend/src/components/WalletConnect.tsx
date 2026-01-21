import React, { useState, useEffect } from "react";
import {
  connectWallet,
  switchToCronosTestnet,
  getCurrentAccount,
  getCurrentChainId,
  formatAddress,
  isMetaMaskInstalled,
  CRONOS_TESTNET,
} from "../lib/web3";

interface WalletConnectProps {
  onAccountChange?: (account: string | null) => void;
}

export default function WalletConnect({ onAccountChange }: WalletConnectProps) {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const isCorrectNetwork = chainId === CRONOS_TESTNET.chainId;

  useEffect(() => {
    setMounted(true);

    // Check if already connected
    async function checkConnection() {
      const currentAccount = await getCurrentAccount();
      const currentChainId = await getCurrentChainId();
      setAccount(currentAccount);
      setChainId(currentChainId);
      if (onAccountChange) {
        onAccountChange(currentAccount);
      }
    }

    checkConnection();

    // Listen for account changes
    if (isMetaMaskInstalled()) {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        const newAccount = accounts[0] || null;
        setAccount(newAccount);
        if (onAccountChange) {
          onAccountChange(newAccount);
        }
      });

      window.ethereum.on("chainChanged", (newChainId: string) => {
        setChainId(newChainId);
        // Reload page on chain change (recommended by MetaMask)
        window.location.reload();
      });
    }

    return () => {
      if (isMetaMaskInstalled()) {
        window.ethereum.removeAllListeners("accountsChanged");
        window.ethereum.removeAllListeners("chainChanged");
      }
    };
  }, [onAccountChange]);

  async function handleConnect() {
    try {
      setConnecting(true);
      setError(null);

      const connectedAccount = await connectWallet();
      setAccount(connectedAccount);

      // Check if on correct network
      const currentChainId = await getCurrentChainId();
      setChainId(currentChainId);

      if (currentChainId !== CRONOS_TESTNET.chainId) {
        await switchToCronosTestnet();
        setChainId(CRONOS_TESTNET.chainId);
      }

      if (onAccountChange) {
        onAccountChange(connectedAccount);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet");
    } finally {
      setConnecting(false);
    }
  }

  async function handleSwitchNetwork() {
    try {
      setError(null);
      await switchToCronosTestnet();
      setChainId(CRONOS_TESTNET.chainId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to switch network");
    }
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="wallet-connect">
        <button disabled className="btn-primary">
          Loading...
        </button>
      </div>
    );
  }

  if (!isMetaMaskInstalled()) {
    return (
      <div className="wallet-connect">
        <div className="wallet-error">
          <p>MetaMask/Cronos wallet is not installed</p>
          <a
            href="https://metamask.io/download/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            Install MetaMask
          </a>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="wallet-connect">
        <button onClick={handleConnect} disabled={connecting} className="btn-primary">
          {connecting ? "Connecting..." : "Connect Wallet"}
        </button>
        {error && <div className="error-text">{error}</div>}
      </div>
    );
  }

  return (
    <div className="wallet-connect">
      <div className="wallet-info">
        <div className="wallet-account">
          <span className="wallet-label">Connected:</span>
          <span className="wallet-address">{formatAddress(account)}</span>
        </div>
        {!isCorrectNetwork && (
          <div className="wallet-warning">
            <p>⚠️ Wrong Network</p>
            <button onClick={handleSwitchNetwork} className="btn-warning">
              Switch to Cronos Testnet
            </button>
          </div>
        )}
        {isCorrectNetwork && (
          <div className="wallet-network">
            <span className="network-indicator">✓</span>
            <span>Cronos Testnet</span>
          </div>
        )}
      </div>
      {error && <div className="error-text">{error}</div>}
    </div>
  );
}

