'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  connectWallet,
  getCurrentAccount,
  getCurrentChainId,
  switchToCronosTestnet,
  isWalletInstalled,
  getEthereumProvider,
  CRONOS_TESTNET
} from '@/lib/web3';

interface WalletContextType {
  account: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Check if already connected on mount
    async function checkConnection() {
      try {
        const currentAccount = await getCurrentAccount();
        if (currentAccount) {
          setAccount(currentAccount);

          // Verify we're on the correct network
          const chainId = await getCurrentChainId();
          if (chainId && chainId !== CRONOS_TESTNET.chainId) {
            setError('Wrong network. Please switch to Cronos Testnet.');
          }
        }
      } catch (err) {
        console.error('Failed to check connection:', err);
      }
    }

    checkConnection();

    // Listen for account and network changes
    const provider = getEthereumProvider();
    if (provider) {
      const handleAccountsChanged = (accounts: string[]) => {
        console.log('Accounts changed:', accounts);
        if (accounts.length === 0) {
          setAccount(null);
          setError(null);
        } else {
          setAccount(accounts[0]);
          setError(null);
        }
      };

      const handleChainChanged = async (chainId: string) => {
        console.log('Chain changed:', chainId);
        // Verify we're on Cronos Testnet
        if (chainId !== CRONOS_TESTNET.chainId) {
          setError('Wrong network. Please switch to Cronos Testnet.');
        } else {
          setError(null);
          // Reload to refresh data
          window.location.reload();
        }
      };

      const handleDisconnect = () => {
        console.log('Wallet disconnected');
        setAccount(null);
        setError(null);
      };

      provider.on('accountsChanged', handleAccountsChanged);
      provider.on('chainChanged', handleChainChanged);
      provider.on('disconnect', handleDisconnect);

      return () => {
        provider.removeListener('accountsChanged', handleAccountsChanged);
        provider.removeListener('chainChanged', handleChainChanged);
        provider.removeListener('disconnect', handleDisconnect);
      };
    }
  }, [mounted]);

  const connect = async () => {
    setError(null);
    setIsConnecting(true);

    try {
      if (!isWalletInstalled()) {
        setError('No wallet detected');
        // Open wallet installation page
        window.open('https://crypto.com/defi-wallet', '_blank');
        return;
      }

      // Connect wallet
      const connectedAccount = await connectWallet();
      console.log('Connected account:', connectedAccount);

      // Switch to Cronos Testnet
      try {
        await switchToCronosTestnet();
        console.log('Switched to Cronos Testnet');
      } catch (switchErr: any) {
        console.error('Failed to switch network:', switchErr);
        // Don't fail the connection if network switch fails
        // User can manually switch later
        if (switchErr.message && !switchErr.message.includes('rejected')) {
          setError('Please switch to Cronos Testnet manually');
        }
      }

      setAccount(connectedAccount);
    } catch (err: any) {
      console.error('Failed to connect wallet:', err);
      setError(err.message || 'Failed to connect wallet');
      setAccount(null);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAccount(null);
    setError(null);
  };

  const value: WalletContextType = {
    account,
    isConnected: !!account,
    isConnecting,
    error,
    connect,
    disconnect,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

