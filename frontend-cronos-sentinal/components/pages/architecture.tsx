'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Layers, Shield, Zap, Database, Server, Cpu, CreditCard } from 'lucide-react';

export function ArchitecturePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100 mb-2">System Architecture</h1>
        <p className="text-slate-400">Design overview and technology stack</p>
      </div>

      <Card className="bg-[#1E293B] border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-100">Architecture Diagram</CardTitle>
          <CardDescription className="text-slate-400">Data flow and component relationships</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <div className="flex items-center justify-center gap-6 flex-wrap">
              <div className="flex flex-col items-center gap-3">
                <div className="w-40 h-24 bg-blue-950 border-2 border-blue-700 rounded-lg flex flex-col items-center justify-center">
                  <Layers className="w-8 h-8 text-blue-400 mb-2" />
                  <span className="text-sm font-medium text-slate-200">Frontend</span>
                  <span className="text-xs text-slate-400">Next.js + React</span>
                </div>
              </div>

              <ArrowRight className="w-6 h-6 text-slate-500" />

              <div className="flex flex-col items-center gap-3">
                <div className="w-40 h-24 bg-blue-950 border-2 border-blue-700 rounded-lg flex flex-col items-center justify-center">
                  <Server className="w-8 h-8 text-blue-400 mb-2" />
                  <span className="text-sm font-medium text-slate-200">Backend API</span>
                  <span className="text-xs text-slate-400">Node.js</span>
                </div>
              </div>

              <ArrowRight className="w-6 h-6 text-slate-500" />

              <div className="flex flex-col items-center gap-3">
                <div className="w-40 h-24 bg-blue-950 border-2 border-blue-700 rounded-lg flex flex-col items-center justify-center">
                  <Database className="w-8 h-8 text-blue-400 mb-2" />
                  <span className="text-sm font-medium text-slate-200">Smart Contracts</span>
                  <span className="text-xs text-slate-400">Solidity</span>
                </div>
              </div>

              <ArrowRight className="w-6 h-6 text-slate-500" />

              <div className="flex flex-col items-center gap-3">
                <div className="w-40 h-24 bg-blue-950 border-2 border-blue-700 rounded-lg flex flex-col items-center justify-center">
                  <Shield className="w-8 h-8 text-blue-400 mb-2" />
                  <span className="text-sm font-medium text-slate-200">Cronos Network</span>
                  <span className="text-xs text-slate-400">Blockchain</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-700 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-yellow-950/20 border border-yellow-800/50 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <CreditCard className="w-5 h-5 text-yellow-400" />
                    <span className="font-medium text-slate-200">x402 Payment Gate</span>
                  </div>
                  <p className="text-sm text-slate-400">
                    HTTP 402 protocol integration intercepts execution requests and requires micropayment authorization
                    before processing.
                  </p>
                </div>

                <div className="p-4 bg-cyan-950/20 border border-cyan-800/50 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Cpu className="w-5 h-5 text-cyan-400" />
                    <span className="font-medium text-slate-200">Agent Layer</span>
                  </div>
                  <p className="text-sm text-slate-400">
                    Hybrid intelligence system with 3 deterministic agents and 1 AI advisor operating under strict
                    guardrails.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1E293B] border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-100">Technology Stack</CardTitle>
          <CardDescription className="text-slate-400">Core technologies and frameworks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-3">Frontend</h3>
              <div className="space-y-2">
                {[
                  { name: 'Next.js 13', description: 'React framework with App Router' },
                  { name: 'TypeScript', description: 'Type-safe development' },
                  { name: 'Tailwind CSS', description: 'Utility-first styling' },
                  { name: 'shadcn/ui', description: 'Component library' },
                  { name: 'Recharts', description: 'Data visualization' },
                  { name: 'Framer Motion', description: 'Animation library' },
                ].map((tech) => (
                  <div key={tech.name} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="font-medium text-slate-200 text-sm">{tech.name}</div>
                    <div className="text-xs text-slate-400 mt-1">{tech.description}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-3">Backend & Blockchain</h3>
              <div className="space-y-2">
                {[
                  { name: 'Node.js', description: 'Backend runtime' },
                  { name: 'Cronos Network', description: 'EVM-compatible blockchain' },
                  { name: 'Solidity', description: 'Smart contract language' },
                  { name: 'x402 Protocol', description: 'Payment-gated API access' },
                  { name: 'Lightning Network', description: 'Micropayment infrastructure' },
                  { name: 'PostgreSQL', description: 'Audit log persistence' },
                ].map((tech) => (
                  <div key={tech.name} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="font-medium text-slate-200 text-sm">{tech.name}</div>
                    <div className="text-xs text-slate-400 mt-1">{tech.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1E293B] border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-100">Innovation Highlights</CardTitle>
          <CardDescription className="text-slate-400">Key architectural differentiators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-slate-200 mb-2">
                    First x402 Payment Protocol Integration on Cronos
                  </h4>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Novel implementation of HTTP 402 (Payment Required) status code for micropayment-gated vault
                    operations. Every execution action requires cryptographic payment authorization, creating an
                    auditable economic barrier against unauthorized access and enabling pay-per-use security models.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="flex items-start gap-3">
                <Cpu className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-slate-200 mb-2">
                    Hybrid Intelligence: 3 Deterministic + 1 AI + Fallback
                  </h4>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Deterministic agents handle risk assessment, emergency braking, and settlement optimization with
                    rule-based certainty. AI agent operates in advisory-only mode for portfolio recommendations,
                    ensuring humans retain final authority. Built-in fallback ensures system resilience if AI becomes
                    unavailable.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-slate-200 mb-2">Safety-First Design: User Control + Audit Trail</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Every execution operation requires explicit user confirmation. Emergency brake provides instant
                    circuit-breaker protection. Complete audit trail of all actions and decisions with cryptographic
                    immutability. Clear separation between monitoring (read-only) and execution (dangerous) operations
                    in the UI.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1E293B] border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-100">Security Model</CardTitle>
          <CardDescription className="text-slate-400">Multi-layered defense architecture</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                layer: 'Layer 1: x402 Payment Gate',
                description: 'Economic barrier requiring micropayment for every execution operation',
              },
              {
                layer: 'Layer 2: Agent Checkpoint',
                description:
                  'Deterministic risk assessment and policy enforcement before any vault state change',
              },
              {
                layer: 'Layer 3: User Confirmation',
                description: 'Explicit approval required for all execution actions; no autonomous modifications',
              },
              {
                layer: 'Layer 4: Emergency Brake',
                description: 'Instant circuit breaker to halt all operations if critical conditions detected',
              },
              {
                layer: 'Layer 5: Audit Trail',
                description:
                  'Immutable log of all actions, decisions, and state changes with cryptographic integrity',
              },
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-950 border border-blue-700 text-blue-300 text-xs font-semibold flex-shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium text-slate-200 text-sm mb-1">{item.layer}</div>
                  <div className="text-xs text-slate-400">{item.description}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
