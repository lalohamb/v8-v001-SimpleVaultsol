'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bot, Cpu, ShieldAlert, TrendingUp, ChevronRight } from 'lucide-react';
import { fetchAgents, setAIEnabled } from '@/lib/data-service';
import { format } from 'date-fns';
import { ManualOverrideModal, type ManualOverrideData } from '@/components/manual-override-modal';
import type { Agent } from '@/lib/types';

export function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [overrideModal, setOverrideModal] = useState(false);

  useEffect(() => {
    async function loadAgents() {
      try {
        setLoading(true);
        const result = await fetchAgents();
        setAgents(result.agents);
        setAiEnabled(result.aiEnabled);
      } catch (error) {
        console.error('Failed to load agents:', error);
      } finally {
        setLoading(false);
      }
    }

    loadAgents();
  }, []);

  const handleToggleAI = async (enabled: boolean) => {
    try {
      setToggling(true);
      const newState = await setAIEnabled(enabled);
      setAiEnabled(newState);
    } catch (error) {
      console.error('Failed to toggle AI:', error);
      // Revert on error
      setAiEnabled(!enabled);
    } finally {
      setToggling(false);
    }
  };

  const handleManualOverride = (data: ManualOverrideData) => {
    console.log('Manual override submitted:', {
      agentId: selectedAgent,
      ...data,
    });

    // TODO: Send override data to backend API
    // For now, just log it and close the modal

    setOverrideModal(false);
    setSelectedAgent(null);

    // Show success message (you could add a toast notification here)
    alert(`Manual override submitted for ${agent?.name}\n\nJob ID: ${data.jobId || 'N/A'}\nUser Address: ${data.userAddress || 'N/A'}\nRequested Amount: ${data.requestedAmount || 'N/A'} CRO\nReason: ${data.reason}`);
  };

  const agent = agents.find((a) => a.id === selectedAgent);

  const getAgentIcon = (type: string) => {
    if (type === 'ai') return Bot;
    return Cpu;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100 mb-2">AI Agents</h1>
          <p className="text-slate-400">Hybrid intelligence: 3 deterministic agents + 1 AI advisor</p>
        </div>

        <div className="flex items-center gap-3 bg-[#1E293B] border border-slate-700 rounded-lg px-4 py-3">
          <div className="flex items-center gap-2">
            <Bot className={`w-5 h-5 ${aiEnabled ? 'text-cyan-400' : 'text-slate-500'}`} />
            <Label htmlFor="ai-toggle" className="text-sm font-medium text-slate-300 cursor-pointer">
              AI Mode
            </Label>
          </div>
          <Switch
            id="ai-toggle"
            checked={aiEnabled}
            onCheckedChange={handleToggleAI}
            disabled={toggling || loading}
            className="data-[state=checked]:bg-cyan-600"
          />
          <Badge
            variant="outline"
            className={
              aiEnabled
                ? 'bg-green-950 text-green-400 border-green-800'
                : 'bg-slate-700 text-slate-400 border-slate-600'
            }
          >
            {aiEnabled ? 'ENABLED ✓' : 'OFF'}
          </Badge>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading agents...</div>
      ) : agents.length === 0 ? (
        <div className="text-center py-12 text-slate-400">No agents available. Make sure the agent-service is running.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {agents.map((agent) => {
          const Icon = getAgentIcon(agent.type);
          return (
            <Card key={agent.id} className="bg-[#1E293B] border-slate-700">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${agent.type === 'ai' ? 'bg-cyan-950' : 'bg-blue-950'}`}>
                      <Icon className={`w-5 h-5 ${agent.type === 'ai' ? 'text-cyan-400' : 'text-blue-400'}`} />
                    </div>
                    <div>
                      <CardTitle className="text-slate-100 text-lg">{agent.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant="outline"
                          className={
                            agent.type === 'ai'
                              ? 'bg-cyan-950 text-cyan-400 border-cyan-800'
                              : 'bg-blue-950 text-blue-400 border-blue-800'
                          }
                        >
                          {agent.type === 'ai' ? 'AI-Powered' : 'Deterministic'}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={
                            agent.mode === 'auto'
                              ? 'bg-green-950 text-green-400 border-green-800'
                              : agent.mode === 'recommend'
                              ? 'bg-yellow-950 text-yellow-400 border-yellow-800'
                              : 'bg-slate-700 text-slate-400 border-slate-600'
                          }
                        >
                          {agent.mode.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-400">{agent.description}</p>

                <div className="space-y-2">
                  {agent.lastDecision && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Last Decision:</span>
                      <span className="text-slate-300 font-mono text-xs">
                        {format(new Date(agent.lastDecision), 'MMM dd, HH:mm:ss')}
                      </span>
                    </div>
                  )}
                  {agent.lastAction && (
                    <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                      <div className="text-xs text-slate-400 mb-1">Last Action</div>
                      <div className="text-sm text-slate-200">{agent.lastAction}</div>
                    </div>
                  )}
                </div>

                <Button
                  variant="outline"
                  className="w-full gap-2 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-slate-100"
                  onClick={() => setSelectedAgent(agent.id)}
                >
                  Open Details
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
        </div>
      )}

      <Sheet open={!!selectedAgent} onOpenChange={() => setSelectedAgent(null)}>
        <SheetContent className="w-full sm:max-w-2xl bg-[#1E293B] border-slate-700">
          {agent && (
            <>
              <SheetHeader>
                <SheetTitle className="text-slate-100 flex items-center gap-2">
                  {agent.name}
                  <Badge
                    variant="outline"
                    className={
                      agent.type === 'ai'
                        ? 'bg-cyan-950 text-cyan-400 border-cyan-800'
                        : 'bg-blue-950 text-blue-400 border-blue-800'
                    }
                  >
                    {agent.type === 'ai' ? 'AI-Powered' : 'Deterministic'}
                  </Badge>
                </SheetTitle>
                <SheetDescription className="text-slate-400">{agent.description}</SheetDescription>
              </SheetHeader>

              <ScrollArea className="h-[calc(100vh-180px)] mt-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-slate-300 mb-3">Operational Mode</h3>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={
                          agent.mode === 'auto'
                            ? 'bg-green-950 text-green-400 border-green-800'
                            : agent.mode === 'recommend'
                            ? 'bg-yellow-950 text-yellow-400 border-yellow-800'
                            : 'bg-slate-700 text-slate-400 border-slate-600'
                        }
                      >
                        {agent.mode.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-slate-300 mb-3">Guardrails & Constraints</h3>
                    <div className="space-y-2">
                      {agent.guardrails.map((guardrail, index) => (
                        <div key={index} className="flex items-start gap-2 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                          <ShieldAlert className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-slate-300">{guardrail}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-slate-300 mb-3">Recent Decisions</h3>
                    <div className="space-y-3">
                      {agent.decisions.map((decision, index) => (
                        <div key={index} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                          <div className="flex items-center justify-between mb-2">
                            <Badge
                              variant="outline"
                              className={
                                decision.action === 'Approved' || decision.action === 'Executed Batch'
                                  ? 'bg-green-950 text-green-400 border-green-800'
                                  : decision.action === 'Blocked'
                                  ? 'bg-red-950 text-red-400 border-red-800'
                                  : decision.action === 'Recommendation'
                                  ? 'bg-cyan-950 text-cyan-400 border-cyan-800'
                                  : 'bg-slate-700 text-slate-400 border-slate-600'
                              }
                            >
                              {decision.action}
                            </Badge>
                            <span className="text-xs font-mono text-slate-400">
                              {format(new Date(decision.timestamp), 'MMM dd, HH:mm:ss')}
                            </span>
                          </div>
                          <p className="text-sm text-slate-300">{decision.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-700">
                    <Button
                      variant="outline"
                      className="w-full border-yellow-800 text-yellow-400 hover:bg-yellow-950"
                      onClick={() => setOverrideModal(true)}
                    >
                      Manual Override
                    </Button>
                    <p className="text-xs text-slate-500 mt-2 text-center">
                      Requires confirmation and will be logged in audit trail
                    </p>
                  </div>
                </div>
              </ScrollArea>
            </>
          )}
        </SheetContent>
      </Sheet>

      <ManualOverrideModal
        open={overrideModal}
        onClose={() => setOverrideModal(false)}
        onConfirm={handleManualOverride}
        agentId={selectedAgent || ''}
        agentName={agent?.name || ''}
      />
    </div>
  );
}
