'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Clock, Activity, Shield, AlertTriangle } from 'lucide-react';
import { fetchVaultBalance, fetchSystemHealth, fetchAgentStates, fetchPendingTransactions, fetchRecentEvents, fetchLastRiskEvaluation, fetchBalanceHistory, fetchRiskPosture } from '@/lib/data-service';
import { format } from 'date-fns';
import type { VaultBalance, AgentStates, RecentEvent, BalanceHistoryPoint, RiskPosture } from '@/lib/types';
import { useWallet } from '@/contexts/wallet-context';

export function OverviewPage() {
  const { account, isConnected } = useWallet();
  const [vaultBalance, setVaultBalance] = useState<VaultBalance | null>(null);
  const [systemHealth, setSystemHealth] = useState<string>('unknown');
  const [agentStates, setAgentStates] = useState<AgentStates>({ active: 0, paused: 0, override: 0 });
  const [pendingTransactions, setPendingTransactions] = useState<number>(0);
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  const [lastRiskEvaluation, setLastRiskEvaluation] = useState<string>(new Date().toISOString());
  const [balanceHistory, setBalanceHistory] = useState<BalanceHistoryPoint[]>([]);
  const [riskPosture, setRiskPosture] = useState<RiskPosture>({ level: 'low', score: 0, description: 'Loading...' });
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // Fetch real data
        const [balance, health, states, pending, events, lastEval, history, risk] = await Promise.all([
          fetchVaultBalance(account || undefined),
          fetchSystemHealth(),
          fetchAgentStates(),
          fetchPendingTransactions(),
          fetchRecentEvents(),
          fetchLastRiskEvaluation(),
          fetchBalanceHistory(account || undefined),
          fetchRiskPosture(),
        ]);

        if (balance) {
          setVaultBalance(balance);
        }
        setSystemHealth(health.status);
        setAgentStates(states);
        setPendingTransactions(pending);
        setRecentEvents(events);
        setLastRiskEvaluation(lastEval);
        setBalanceHistory(history);
        setRiskPosture(risk);
      } catch (error) {
        console.error('Failed to load overview data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();

    // Refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [account]);

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100 mb-2">System Overview</h1>
          <p className="text-slate-400">Real-time monitoring and operational telemetry</p>
        </div>
        <div className="text-center py-12 text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100 mb-2">System Overview</h1>
        <p className="text-slate-400">Real-time monitoring and operational telemetry</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="bg-[#1E293B] border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Vault Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-2xl font-semibold text-slate-400">Loading...</div>
            ) : vaultBalance ? (
              <>
                <div className="text-2xl font-semibold text-slate-100">
                  {vaultBalance.total.toLocaleString()} {vaultBalance.currency}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Last updated: {format(new Date(vaultBalance.lastUpdated), 'HH:mm:ss')}
                </div>
              </>
            ) : (
              <div className="text-sm text-slate-400">Connect wallet to view balance</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#1E293B] border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-slate-100">{pendingTransactions}</div>
            <div className="text-xs text-slate-500 mt-1">In processing queue</div>
          </CardContent>
        </Card>

        <Card className="bg-[#1E293B] border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Agent State Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-green-400">{agentStates.active}</span>
              <span className="text-sm text-slate-400">Active</span>
              <span className="text-slate-600 mx-1">|</span>
              <span className="text-2xl font-semibold text-slate-400">{agentStates.paused}</span>
              <span className="text-sm text-slate-400">Paused</span>
              <span className="text-slate-600 mx-1">|</span>
              <span className="text-2xl font-semibold text-cyan-400">{agentStates.override}</span>
              <span className="text-sm text-slate-400">Override</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1E293B] border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Last Risk Evaluation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-slate-100">
              {format(new Date(lastRiskEvaluation), 'HH:mm:ss')}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {format(new Date(lastRiskEvaluation), 'MMM dd, yyyy')}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="bg-[#1E293B] border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-100">System Telemetry</CardTitle>
            <CardDescription className="text-slate-400">Balance and risk score over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={balanceHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(value) => format(new Date(value), 'HH:mm')}
                  stroke="#94a3b8"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  yAxisId="left"
                  stroke="#94a3b8"
                  style={{ fontSize: '12px' }}
                  width={60}
                  domain={['auto', 'auto']}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#94a3b8"
                  style={{ fontSize: '12px' }}
                  width={60}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    color: '#e2e8f0',
                  }}
                  labelFormatter={(value) => format(new Date(value), 'MMM dd, HH:mm')}
                />
                <Legend wrapperStyle={{ color: '#94a3b8' }} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="balance"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  name="Balance (CRO)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="riskScore"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={false}
                  name="Risk Score"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#1E293B] border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-100">Current Risk Posture</CardTitle>
            <CardDescription className="text-slate-400">System-wide risk assessment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Risk Level</span>
                  <Badge
                    variant="outline"
                    className={
                      riskPosture.level === 'low'
                        ? 'bg-green-950 text-green-400 border-green-800'
                        : riskPosture.level === 'medium'
                        ? 'bg-yellow-950 text-yellow-400 border-yellow-800'
                        : 'bg-red-950 text-red-400 border-red-800'
                    }
                  >
                    {riskPosture.level.toUpperCase()}
                  </Badge>
                </div>
                <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      riskPosture.level === 'low' ? 'bg-green-500' : riskPosture.level === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${riskPosture.score}%` }}
                  />
                </div>
                <div className="text-xs text-slate-500 mt-1">Score: {riskPosture.score}/100</div>
              </div>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <p className="text-sm text-slate-300">{riskPosture.description}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="bg-[#1E293B] border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-100">Recent Events</CardTitle>
            <CardDescription className="text-slate-400">Last system operations and decisions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentEvents.length === 0 ? (
                <div className="text-sm text-slate-400 text-center py-4">No recent events</div>
              ) : (
                recentEvents.map((event, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-sm font-medium text-slate-200">{event.type}</span>
                      <Badge
                        variant="outline"
                        className={
                          event.outcome === 'Completed'
                            ? 'bg-green-950 text-green-400 border-green-800'
                            : 'bg-yellow-950 text-yellow-400 border-yellow-800'
                        }
                      >
                        {event.outcome}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-400 mb-1">{event.agent}</div>
                    {event.txHash && (
                      <div className="text-xs font-mono text-slate-500 truncate">{event.txHash}</div>
                    )}
                    <div className="text-xs text-slate-500 mt-1">
                      {format(new Date(event.timestamp), 'MMM dd, HH:mm:ss')}
                    </div>
                  </div>
                </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1E293B] border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-100">Action Boundary</CardTitle>
            <CardDescription className="text-slate-400">
              Clear separation between monitoring and execution
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700">
              <div className="flex items-start gap-3 mb-2">
                <Activity className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-slate-200 mb-1">Monitoring Actions</h4>
                  <p className="text-sm text-slate-400">
                    Read-only operations that do not modify vault state or execute transactions.
                  </p>
                  <ul className="mt-2 space-y-1 text-xs text-slate-500">
                    <li>View balances and transaction history</li>
                    <li>Monitor agent decisions and recommendations</li>
                    <li>Access audit logs and system telemetry</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-4 bg-yellow-950/20 rounded-lg border border-yellow-800/50">
              <div className="flex items-start gap-3 mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-slate-200 mb-1">Execution Actions</h4>
                  <p className="text-sm text-slate-400">
                    Operations that require confirmation and may be irreversible.
                  </p>
                  <ul className="mt-2 space-y-1 text-xs text-slate-500">
                    <li>Initiate withdrawals and transfers</li>
                    <li>Modify vault limits and agent settings</li>
                    <li>Override agent recommendations</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
