'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Circle, PlayCircle, CreditCard, History } from 'lucide-react';
import { fetchX402Transactions, type X402Transaction } from '@/lib/data-service';
import { mockHttp402Response } from '@/lib/mock-data';
import { format } from 'date-fns';
import { SettlementConsole } from '@/components/settlement-console';

export function X402Page() {
  const [selectedTx, setSelectedTx] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<X402Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('console');

  useEffect(() => {
    loadTransactions();
  }, []);

  async function loadTransactions() {
    try {
      setLoading(true);
      const txs = await fetchX402Transactions(10);
      setTransactions(txs);
    } catch (error) {
      console.error('Failed to load X402 transactions:', error);
    } finally {
      setLoading(false);
    }
  }

  const transaction = transactions.find((tx) => tx.id === selectedTx);

  const getStepIcon = (status: string) => {
    if (status === 'completed') return Check;
    return Circle;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100 mb-2">x402 Settlement Console</h1>
        <p className="text-slate-400">Payment-gated execution with full audit trail</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-slate-800 border border-slate-700">
          <TabsTrigger value="console" className="data-[state=active]:bg-blue-900/50 data-[state=active]:text-blue-300">
            <CreditCard className="w-4 h-4 mr-2" />
            Settlement Console
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-blue-900/50 data-[state=active]:text-blue-300">
            <History className="w-4 h-4 mr-2" />
            Manual Overview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="console" className="mt-6">
          <SettlementConsole />
        </TabsContent>

        <TabsContent value="history" className="mt-6 space-y-6">
          <Card className="bg-[#1E293B] border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100">Transaction Lifecycle</CardTitle>
              <CardDescription className="text-slate-400">
                Every execution operation follows this auditable pipeline
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                {[
                  { step: 1, label: 'Action Initiated' },
                  { step: 2, label: 'HTTP 402 Challenge' },
                  { step: 3, label: 'Payment Authorized' },
                  { step: 4, label: 'Agent Checkpoint' },
                  { step: 5, label: 'On-Chain Settlement' },
                ].map((item, index, array) => (
                  <div key={item.step} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-950 border-2 border-blue-700 flex items-center justify-center text-blue-300 font-semibold">
                        {item.step}
                      </div>
                      <div className="text-xs text-slate-400 mt-2 text-center max-w-[100px]">{item.label}</div>
                    </div>
                    {index < array.length - 1 && (
                      <div className="flex-1 h-0.5 bg-blue-900 mx-2" style={{ minWidth: '40px' }} />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1E293B] border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100">HTTP 402 Protocol Example</CardTitle>
              <CardDescription className="text-slate-400">
                Payment-required response from API gateway
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-slate-900 border border-slate-700 rounded-lg p-4 overflow-x-auto">
                <code className="text-xs font-mono text-slate-300">{mockHttp402Response}</code>
              </pre>
            </CardContent>
          </Card>

          <Card className="bg-[#1E293B] border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100">Transaction History</CardTitle>
              <CardDescription className="text-slate-400">All payment-gated operations from blockchain</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-slate-400">Loading transactions...</div>
                </div>
              ) : transactions.length === 0 ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-slate-400">No transactions found</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:bg-slate-800/70 transition-colors cursor-pointer"
                      onClick={() => setSelectedTx(tx.id)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-medium text-slate-200 mb-1">{tx.action}</div>
                          {tx.amount && (
                            <div className="text-sm text-slate-400">
                              {tx.amount.toLocaleString()} {tx.currency}
                            </div>
                          )}
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            tx.status === 'completed'
                              ? 'bg-green-950 text-green-400 border-green-800'
                              : 'bg-yellow-950 text-yellow-400 border-yellow-800'
                          }
                        >
                          {tx.status.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-500">Payment:</span>
                          <span className="text-slate-300 ml-2">
                            {tx.paymentAmount} {tx.paymentCurrency}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">Method:</span>
                          <span className="text-slate-300 ml-2">{tx.paymentMethod}</span>
                        </div>
                      </div>

                      <div className="mt-3 text-xs font-mono text-slate-500 truncate">{tx.txHash}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {format(new Date(tx.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-3 text-xs text-slate-400 hover:text-slate-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTx(tx.id);
                        }}
                      >
                        <PlayCircle className="w-3 h-3 mr-1" />
                        View Full Trace
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Sheet open={!!selectedTx} onOpenChange={() => setSelectedTx(null)}>
        <SheetContent className="w-full sm:max-w-2xl bg-[#1E293B] border-slate-700">
          {transaction && (
            <>
              <SheetHeader>
                <SheetTitle className="text-slate-100">Transaction Trace</SheetTitle>
                <SheetDescription className="text-slate-400 font-mono text-xs">{transaction.id}</SheetDescription>
              </SheetHeader>

              <ScrollArea className="h-[calc(100vh-180px)] mt-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-slate-300 mb-3">Transaction Details</h3>
                    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Action:</span>
                        <span className="text-slate-200">{transaction.action}</span>
                      </div>
                      {transaction.amount && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Amount:</span>
                          <span className="text-slate-200">
                            {transaction.amount.toLocaleString()} {transaction.currency}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Status:</span>
                        <Badge
                          variant="outline"
                          className={
                            transaction.status === 'completed'
                              ? 'bg-green-950 text-green-400 border-green-800'
                              : 'bg-yellow-950 text-yellow-400 border-yellow-800'
                          }
                        >
                          {transaction.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Payment:</span>
                        <span className="text-slate-200">
                          {transaction.paymentAmount} {transaction.paymentCurrency}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Method:</span>
                        <span className="text-slate-200">{transaction.paymentMethod}</span>
                      </div>
                      <div className="pt-2 border-t border-slate-700">
                        <span className="text-slate-400 text-xs">Transaction Hash:</span>
                        <div className="text-xs font-mono text-slate-300 mt-1 break-all">{transaction.txHash}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-slate-300 mb-3">Execution Pipeline</h3>
                    <div className="space-y-3">
                      {transaction.steps.map((step) => {
                        const Icon = getStepIcon(step.status);
                        return (
                          <div key={step.step} className="flex items-start gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                step.status === 'completed'
                                  ? 'bg-green-950 border border-green-800'
                                  : 'bg-slate-800 border border-slate-700'
                              }`}
                            >
                              <Icon
                                className={`w-4 h-4 ${
                                  step.status === 'completed' ? 'text-green-400' : 'text-slate-400'
                                }`}
                              />
                            </div>
                            <div className="flex-1 pt-1">
                              <div className="flex items-center justify-between">
                                <div className="font-medium text-slate-200">{step.label}</div>
                                <Badge
                                  variant="outline"
                                  className={
                                    step.status === 'completed'
                                      ? 'bg-green-950 text-green-400 border-green-800'
                                      : 'bg-slate-700 text-slate-400 border-slate-600'
                                  }
                                >
                                  {step.status.toUpperCase()}
                                </Badge>
                              </div>
                              <div className="text-xs font-mono text-slate-500 mt-1">
                                {format(new Date(step.timestamp), 'MMM dd, HH:mm:ss.SSS')}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

