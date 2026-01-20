'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatAddress } from '@/lib/web3';
import { useWallet } from '@/contexts/wallet-context';

export function WalletConnect() {
  const { account, isConnected, isConnecting, error, connect, disconnect } = useWallet();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className="gap-2 border-slate-600 text-slate-400"
      >
        <Wallet className="w-4 h-4" />
        Loading...
      </Button>
    );
  }

  if (isConnected && account) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="bg-green-950 text-green-400 border-green-800 gap-1.5">
          <CheckCircle2 className="w-3 h-3" />
          Connected
        </Badge>
        <Button
          variant="outline"
          size="sm"
          onClick={disconnect}
          className="gap-2 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-slate-100 font-mono text-xs"
        >
          <Wallet className="w-4 h-4" />
          {formatAddress(account)}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {error && (
        <Badge variant="outline" className="bg-red-950 text-red-400 border-red-800 gap-1.5">
          <AlertCircle className="w-3 h-3" />
          {error}
        </Badge>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={connect}
        disabled={isConnecting}
        className="gap-2 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-slate-100"
      >
        <Wallet className="w-4 h-4" />
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>
    </div>
  );
}

