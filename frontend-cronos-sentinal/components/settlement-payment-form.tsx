'use client';

import { useState, useEffect } from 'react';
import { getSettlementPaymentContract, getSigner, weiToEther } from '@/lib/web3';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ExternalLink, Loader2 } from 'lucide-react';

interface SettlementPaymentFormProps {
  jobId: string;
  onPaymentSuccess: () => void;
  onPaymentError: (error: string) => void;
}

export function SettlementPaymentForm({
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
      console.error('Failed to load payment info:', error);
    }
  }

  async function checkPaymentStatus() {
    if (!jobId) return;
    
    try {
      const contract = getSettlementPaymentContract();
      const [isPaid] = await contract.checkPayment(jobId);
      setIsPaid(isPaid);
    } catch (error) {
      console.error('Failed to check payment status:', error);
    }
  }

  async function handlePayment() {
    if (!jobId || !fee) {
      onPaymentError('Missing job ID or fee information');
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
      console.error('Payment failed:', error);
      onPaymentError(error.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <div className="text-slate-400">Loading payment information...</div>
        </CardContent>
      </Card>
    );
  }

  if (isPaid) {
    return (
      <Card className="bg-green-950/30 border-green-800">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-400 mb-2">Payment Confirmed</h3>
              <p className="text-sm text-slate-300 mb-3">
                Job ID: <code className="bg-slate-800 px-2 py-1 rounded text-green-400">{jobId}</code>
              </p>
              {txHash && (
                <a
                  href={`https://explorer.cronos.org/testnet/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  View Transaction <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardContent className="p-6 space-y-4">
        <div>
          <h4 className="text-sm font-medium text-slate-300 mb-3">Payment Required</h4>
          {fee && (
            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700">
              <span className="text-sm text-slate-400">Settlement Fee:</span>
              <Badge variant="outline" className="bg-blue-950 text-blue-400 border-blue-800 text-base font-semibold">
                {fee} TCRO
              </Badge>
            </div>
          )}
        </div>

        <Button
          onClick={handlePayment}
          disabled={loading || !jobId}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing Payment...
            </>
          ) : (
            `Pay ${fee || '...'} TCRO`
          )}
        </Button>

        {txHash && !isPaid && (
          <div className="p-3 bg-yellow-950/30 border border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-400 mb-2">Transaction submitted. Waiting for confirmation...</p>
            <a
              href={`https://explorer.cronos.org/testnet/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              View on Explorer <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

