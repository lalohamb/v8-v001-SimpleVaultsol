'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { weiToEther, formatTxHash } from '@/lib/api';
import { ExternalLink, CheckCircle2 } from 'lucide-react';
import type { SettlementRunResponse } from '@/lib/api';

interface SettlementResultProps {
  result: SettlementRunResponse;
}

export function SettlementResult({ result }: SettlementResultProps) {
  const confidencePercent = (result.decision.confidence * 100).toFixed(1);

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-slate-100 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            Settlement Executed
          </CardTitle>
          <Badge variant="outline" className="bg-green-950 text-green-400 border-green-800">
            COMPLETE
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Job Details */}
        <div>
          <h4 className="text-sm font-medium text-slate-300 mb-3">Job Details</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg border border-slate-700">
              <span className="text-sm text-slate-400">Job ID:</span>
              <code className="text-sm text-slate-200 font-mono">{result.jobId}</code>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg border border-slate-700">
              <span className="text-sm text-slate-400">Agent:</span>
              <span className="text-sm text-slate-200">{result.agentId}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg border border-slate-700">
              <span className="text-sm text-slate-400">Confidence:</span>
              <Badge variant="outline" className="bg-blue-950 text-blue-400 border-blue-800">
                {confidencePercent}%
              </Badge>
            </div>
          </div>
        </div>

        {/* Decision */}
        <div>
          <h4 className="text-sm font-medium text-slate-300 mb-3">Decision</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg border border-slate-700">
              <span className="text-sm text-slate-400">Proposed Limit:</span>
              <span className="text-sm text-slate-200 font-semibold">
                {weiToEther(result.decision.proposedLimitWei)} CRO
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg border border-slate-700">
              <span className="text-sm text-slate-400">Final Limit:</span>
              <span className="text-sm text-slate-200 font-semibold">
                {weiToEther(result.decision.finalLimitWei)} CRO
              </span>
            </div>
          </div>
        </div>

        {/* On-Chain */}
        <div>
          <h4 className="text-sm font-medium text-slate-300 mb-3">On-Chain</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg border border-slate-700">
              <span className="text-sm text-slate-400">Transaction:</span>
              <a
                href={`https://explorer.cronos.org/testnet/tx/${result.onChain.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors font-mono"
              >
                {formatTxHash(result.onChain.txHash)}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg border border-slate-700">
              <span className="text-sm text-slate-400">Recommended Limit:</span>
              <span className="text-sm text-slate-200 font-semibold">
                {weiToEther(result.onChain.recommendedLimitWei)} CRO
              </span>
            </div>
          </div>
        </div>

        {/* Pipeline */}
        <div>
          <h4 className="text-sm font-medium text-slate-300 mb-3">Execution Pipeline</h4>
          <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
            <ol className="space-y-2">
              {result.pipeline.map((step, index) => (
                <li key={index} className="flex items-start gap-3 text-sm text-slate-300">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-950 border border-blue-800 flex items-center justify-center text-xs text-blue-400 font-semibold">
                    {index + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

