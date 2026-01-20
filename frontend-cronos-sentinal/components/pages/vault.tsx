'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Lock, Settings, ShieldAlert, ShieldOff } from 'lucide-react';
import { ConfirmationModal } from '@/components/confirmation-modal';
import { Badge } from '@/components/ui/badge';

export function VaultPage() {
  const [emergencyBrakeActive, setEmergencyBrakeActive] = useState(false);
  const [showBrakeModal, setShowBrakeModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showLimitsModal, setShowLimitsModal] = useState(false);
  const [autoExecutionEnabled, setAutoExecutionEnabled] = useState(true);
  const [showAutoExecModal, setShowAutoExecModal] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('emergencyBrakeActive');
    if (saved) {
      setEmergencyBrakeActive(JSON.parse(saved));
    }
  }, []);

  const toggleEmergencyBrake = () => {
    const newState = !emergencyBrakeActive;
    setEmergencyBrakeActive(newState);
    localStorage.setItem('emergencyBrakeActive', JSON.stringify(newState));
    setShowBrakeModal(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100 mb-2">Vault Controls</h1>
        <p className="text-slate-400">Execution operations and safety mechanisms</p>
      </div>

      <Card className={`border-2 ${emergencyBrakeActive ? 'bg-red-950/20 border-red-800' : 'bg-[#1E293B] border-slate-700'}`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-slate-100 flex items-center gap-2">
                {emergencyBrakeActive ? (
                  <ShieldOff className="w-5 h-5 text-red-400" />
                ) : (
                  <ShieldAlert className="w-5 h-5 text-blue-400" />
                )}
                Emergency Brake
              </CardTitle>
              <CardDescription className="text-slate-400 mt-2">
                Circuit breaker that immediately halts all execution operations
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className={
                emergencyBrakeActive
                  ? 'bg-red-950 text-red-400 border-red-800'
                  : 'bg-green-950 text-green-400 border-green-800'
              }
            >
              {emergencyBrakeActive ? 'ACTIVE' : 'ARMED'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {emergencyBrakeActive && (
            <div className="p-4 bg-red-950/50 rounded-lg border border-red-800">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-red-300 mb-1">All Execution Operations Blocked</h4>
                  <p className="text-sm text-red-400">
                    The emergency brake is currently active. All withdrawal requests and automated executions are
                    suspended. Only monitoring operations are permitted.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button
              variant={emergencyBrakeActive ? 'outline' : 'default'}
              className={
                emergencyBrakeActive
                  ? 'flex-1 border-red-800 text-red-400 hover:bg-red-950'
                  : 'flex-1 bg-red-900 text-red-100 hover:bg-red-800'
              }
              onClick={() => setShowBrakeModal(true)}
            >
              {emergencyBrakeActive ? 'Disengage Emergency Brake' : 'Engage Emergency Brake'}
            </Button>
          </div>

          <div className="text-xs text-slate-500">
            <strong>Triggers:</strong> Balance drop {'>'} 15% in 1 hour, failed transaction rate {'>'} 30%, or manual
            activation. Requires two-step confirmation.
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#1E293B] border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-100 flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-400" />
              Withdrawal Operations
            </CardTitle>
            <CardDescription className="text-slate-400">Initiate and manage vault withdrawals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label className="text-slate-300">Amount (CRO)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  className="mt-1.5 bg-slate-800 border-slate-700 text-slate-100"
                  disabled={emergencyBrakeActive}
                />
              </div>
              <div>
                <Label className="text-slate-300">Destination Address</Label>
                <Input
                  type="text"
                  placeholder="0x..."
                  className="mt-1.5 bg-slate-800 border-slate-700 text-slate-100 font-mono text-sm"
                  disabled={emergencyBrakeActive}
                />
              </div>
            </div>

            <Button
              className="w-full bg-blue-900 text-blue-100 hover:bg-blue-800"
              disabled={emergencyBrakeActive}
              onClick={() => setShowWithdrawalModal(true)}
            >
              Propose Withdrawal
            </Button>

            {emergencyBrakeActive && (
              <div className="p-3 bg-red-950/30 rounded-lg border border-red-800/50">
                <p className="text-xs text-red-400">Blocked by Emergency Brake</p>
              </div>
            )}

            <div className="text-xs text-slate-500">
              Note: Requires x402 payment authorization and agent checkpoint approval before execution.
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1E293B] border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-100 flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-400" />
              Vault Limits
            </CardTitle>
            <CardDescription className="text-slate-400">Configure spending and velocity limits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label className="text-slate-300">Daily Withdrawal Cap (CRO)</Label>
                <Input
                  type="number"
                  defaultValue="50000"
                  className="mt-1.5 bg-slate-800 border-slate-700 text-slate-100"
                  disabled={emergencyBrakeActive}
                />
              </div>
              <div>
                <Label className="text-slate-300">Single Transaction Limit (CRO)</Label>
                <Input
                  type="number"
                  defaultValue="25000"
                  className="mt-1.5 bg-slate-800 border-slate-700 text-slate-100"
                  disabled={emergencyBrakeActive}
                />
              </div>
              <div>
                <Label className="text-slate-300">Hourly Velocity Limit (transactions)</Label>
                <Input
                  type="number"
                  defaultValue="5"
                  className="mt-1.5 bg-slate-800 border-slate-700 text-slate-100"
                  disabled={emergencyBrakeActive}
                />
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
              disabled={emergencyBrakeActive}
              onClick={() => setShowLimitsModal(true)}
            >
              Update Limits
            </Button>

            {emergencyBrakeActive && (
              <div className="p-3 bg-red-950/30 rounded-lg border border-red-800/50">
                <p className="text-xs text-red-400">Blocked by Emergency Brake</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#1E293B] border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-100">Automated Execution Settings</CardTitle>
          <CardDescription className="text-slate-400">
            Control deterministic agent auto-execution (AI remains recommend-only)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <div>
              <div className="font-medium text-slate-200 mb-1">Enable Auto-Execution</div>
              <div className="text-sm text-slate-400">
                Allow deterministic agents to execute approved actions automatically
              </div>
            </div>
            <Button
              variant={autoExecutionEnabled ? 'default' : 'outline'}
              className={
                autoExecutionEnabled
                  ? 'bg-green-900 text-green-100 hover:bg-green-800'
                  : 'border-slate-600 text-slate-300 hover:bg-slate-700'
              }
              onClick={() => setShowAutoExecModal(true)}
              disabled={emergencyBrakeActive}
            >
              {autoExecutionEnabled ? 'Enabled' : 'Disabled'}
            </Button>
          </div>

          {emergencyBrakeActive && (
            <div className="p-3 bg-red-950/30 rounded-lg border border-red-800/50">
              <p className="text-xs text-red-400">Setting locked while Emergency Brake is active</p>
            </div>
          )}

          <div className="text-xs text-slate-500">
            Note: AI agent (Portfolio Rebalancer) always operates in recommend-only mode regardless of this setting.
          </div>
        </CardContent>
      </Card>

      <ConfirmationModal
        open={showBrakeModal}
        onClose={() => setShowBrakeModal(false)}
        onConfirm={toggleEmergencyBrake}
        title={emergencyBrakeActive ? 'Disengage Emergency Brake' : 'Engage Emergency Brake'}
        description={
          emergencyBrakeActive
            ? 'You are about to disengage the emergency brake and resume normal operations. All automated executions will be re-enabled. This action will be logged in the audit trail.'
            : 'You are about to engage the emergency brake. This will immediately halt ALL execution operations including withdrawals and automated transactions. Only monitoring will remain active. This action will be logged in the audit trail.'
        }
        actionLabel={emergencyBrakeActive ? 'Disengage' : 'Engage'}
        variant={emergencyBrakeActive ? 'default' : 'destructive'}
      />

      <ConfirmationModal
        open={showWithdrawalModal}
        onClose={() => setShowWithdrawalModal(false)}
        onConfirm={() => setShowWithdrawalModal(false)}
        title="Confirm Withdrawal Request"
        description="This will initiate a withdrawal request that requires x402 payment authorization and agent checkpoint approval. The transaction will be processed through the standard security pipeline before execution."
        actionLabel="Initiate Withdrawal"
        variant="default"
      />

      <ConfirmationModal
        open={showLimitsModal}
        onClose={() => setShowLimitsModal(false)}
        onConfirm={() => setShowLimitsModal(false)}
        title="Confirm Limit Update"
        description="You are about to update vault spending limits. This will affect all future transactions and agent decision-making. Changes will take effect immediately and be logged in the audit trail."
        actionLabel="Update Limits"
        variant="default"
      />

      <ConfirmationModal
        open={showAutoExecModal}
        onClose={() => setShowAutoExecModal(false)}
        onConfirm={() => {
          setAutoExecutionEnabled(!autoExecutionEnabled);
          setShowAutoExecModal(false);
        }}
        title={autoExecutionEnabled ? 'Disable Auto-Execution' : 'Enable Auto-Execution'}
        description={
          autoExecutionEnabled
            ? 'Disabling auto-execution will require manual approval for all deterministic agent actions. This increases operational overhead but provides additional control.'
            : 'Enabling auto-execution will allow deterministic agents to execute approved actions automatically within their configured guardrails. AI agent will remain recommend-only.'
        }
        actionLabel={autoExecutionEnabled ? 'Disable' : 'Enable'}
        variant="default"
      />
    </div>
  );
}
