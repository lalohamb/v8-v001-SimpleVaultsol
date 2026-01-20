'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Info } from 'lucide-react';
import { listAgents, runSettlement, etherToWei, type AgentInfo, type AgentId, type SettlementRunResponse } from '@/lib/api';
import { SettlementPaymentForm } from '@/components/settlement-payment-form';
import { SettlementResult } from '@/components/settlement-result';

export function SettlementConsole() {
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [jobId, setJobId] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState<AgentId | null>(null);
  const [requestedAmount, setRequestedAmount] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SettlementRunResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAgents() {
      try {
        const data = await listAgents();
        setAgents(data.agents);
        if (data.agents.length > 0) {
          setSelectedAgentId(data.agents[0].id as AgentId);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load agents');
      }
    }
    loadAgents();
  }, []);

  function handlePaymentSuccess() {
    setIsPaid(true);
    setError(null);
  }

  function handlePaymentError(errorMsg: string) {
    setError(errorMsg);
    setIsPaid(false);
  }

  async function handleRunSettlement(e: React.FormEvent) {
    e.preventDefault();
    if (!jobId || !userAddress || !selectedAgentId) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const requestedAmountWei = requestedAmount
        ? etherToWei(requestedAmount)
        : undefined;

      const response = await runSettlement({
        jobId,
        user: userAddress,
        agentId: selectedAgentId,
        requestedAmountWei,
      });

      setResult(response);
    } catch (err: any) {
      if (err.type === 'payment_required') {
        setError('Payment required. Please complete Step 1 first.');
      } else if (err.type === 'refused') {
        setError(
          `Settlement refused: ${err.data.reason}. ${err.data.guidance || ''}`
        );
      } else {
        setError(err instanceof Error ? err.message : 'Failed to run settlement');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Panel - Forms */}
      <div className="space-y-6">
        {/* Documentation */}
        <Card className="bg-blue-950/20 border-blue-800">
          <CardHeader>
            <CardTitle className="text-blue-300 flex items-center gap-2">
              <Info className="w-5 h-5" />
              What is a Settlement?
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-300 space-y-2">
            <p>
              A <strong>settlement</strong> is a payment-gated workflow that uses AI agents to analyze vault state
              and recommend safe withdrawal limits before executing multi-step settlement operations.
            </p>
            <p>
              This implements the <strong>x402 Payment Required</strong> protocol, where settlements must be paid for before execution.
            </p>
          </CardContent>
        </Card>

        {/* Step 1: Payment */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-100">Step 1: Payment (x402)</CardTitle>
            <CardDescription className="text-slate-400">
              Pay 1.0 TCRO via MetaMask to authorize settlement execution
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="jobId" className="text-slate-300">Job ID *</Label>
              <Input
                id="jobId"
                type="text"
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
                placeholder="job-001"
                className="bg-slate-900 border-slate-700 text-slate-100 mt-1.5"
                required
              />
              <p className="text-xs text-slate-500 mt-1">
                Unique identifier for this settlement (e.g., "job-001", "settlement-abc")
              </p>
            </div>

            {jobId && (
              <SettlementPaymentForm
                jobId={jobId}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
              />
            )}
          </CardContent>
        </Card>

        {/* Step 2: Run Settlement */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-100">Step 2: Run Settlement</CardTitle>
            <CardDescription className="text-slate-400">
              Execute AI-powered settlement analysis and on-chain transaction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRunSettlement} className="space-y-4">
              <div>
                <Label htmlFor="userAddress" className="text-slate-300">User Address *</Label>
                <Input
                  id="userAddress"
                  type="text"
                  value={userAddress}
                  onChange={(e) => setUserAddress(e.target.value)}
                  placeholder="0x..."
                  className="bg-slate-900 border-slate-700 text-slate-100 mt-1.5"
                  required
                />
              </div>

              <div>
                <Label htmlFor="agentId" className="text-slate-300">Agent *</Label>
                <Select value={selectedAgentId || ''} onValueChange={(value) => setSelectedAgentId(value as AgentId)}>
                  <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-100 mt-1.5">
                    <SelectValue placeholder="Select an agent" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700">
                    {agents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id} className="text-slate-100">
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="requestedAmount" className="text-slate-300">Requested Amount (CRO)</Label>
                <Input
                  id="requestedAmount"
                  type="number"
                  step="0.000001"
                  value={requestedAmount}
                  onChange={(e) => setRequestedAmount(e.target.value)}
                  placeholder="Optional"
                  className="bg-slate-900 border-slate-700 text-slate-100 mt-1.5"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Leave empty for agent to recommend optimal limit
                </p>
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
                {loading ? 'Executing...' : 'Run Settlement'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Results */}
      <div className="space-y-6">
        {error && (
          <Alert variant="destructive" className="bg-red-950/30 border-red-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-400">
              <strong>Error:</strong> {error}
            </AlertDescription>
          </Alert>
        )}

        {result && <SettlementResult result={result} />}

        {!result && !error && (
          <Card className="bg-slate-800/30 border-slate-700">
            <CardContent className="flex items-center justify-center h-64">
              <p className="text-slate-400">Complete the steps to execute a settlement</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

