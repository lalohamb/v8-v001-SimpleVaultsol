'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle } from 'lucide-react';

interface ManualOverrideModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: ManualOverrideData) => void;
  agentId: string;
  agentName: string;
}

export interface ManualOverrideData {
  requestedAmount?: string;
  jobId?: string;
  userAddress?: string;
  reason: string;
}

export function ManualOverrideModal({
  open,
  onClose,
  onConfirm,
  agentId,
  agentName,
}: ManualOverrideModalProps) {
  const [requestedAmount, setRequestedAmount] = useState('');
  const [jobId, setJobId] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isSettlementOptimizer = agentId === 'settlement-batch-optimizer';

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};

    // Validate reason is always required
    if (!reason.trim()) {
      newErrors.reason = 'Reason is required for manual override';
    }

    // Validate Settlement Batch Optimizer specific fields
    if (isSettlementOptimizer) {
      if (requestedAmount && isNaN(parseFloat(requestedAmount))) {
        newErrors.requestedAmount = 'Must be a valid number';
      }
      if (requestedAmount && parseFloat(requestedAmount) <= 0) {
        newErrors.requestedAmount = 'Must be greater than 0';
      }
      if (userAddress && !userAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
        newErrors.userAddress = 'Must be a valid Ethereum address';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onConfirm({
      requestedAmount: requestedAmount || undefined,
      jobId: jobId || undefined,
      userAddress: userAddress || undefined,
      reason,
    });

    // Reset form
    setRequestedAmount('');
    setJobId('');
    setUserAddress('');
    setReason('');
    setErrors({});
  };

  const handleClose = () => {
    setRequestedAmount('');
    setJobId('');
    setUserAddress('');
    setReason('');
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-[#1E293B] border-slate-700 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-slate-100 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            Manual Override: {agentName}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Override the agent's automatic operation with custom parameters. This action will be logged in the audit trail.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isSettlementOptimizer && (
            <>
              <div className="space-y-2">
                <Label htmlFor="jobId" className="text-slate-300">
                  Job ID
                </Label>
                <Input
                  id="jobId"
                  value={jobId}
                  onChange={(e) => setJobId(e.target.value)}
                  placeholder="e.g., job-001"
                  className="bg-slate-800 border-slate-600 text-slate-100 placeholder:text-slate-500"
                />
                <p className="text-xs text-slate-500">
                  Optional identifier for tracking this settlement workflow
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="userAddress" className="text-slate-300">
                  User Address
                </Label>
                <Input
                  id="userAddress"
                  value={userAddress}
                  onChange={(e) => {
                    setUserAddress(e.target.value);
                    if (errors.userAddress) {
                      setErrors({ ...errors, userAddress: '' });
                    }
                  }}
                  placeholder="0x..."
                  className={`bg-slate-800 border-slate-600 text-slate-100 placeholder:text-slate-500 ${
                    errors.userAddress ? 'border-red-500' : ''
                  }`}
                />
                {errors.userAddress && (
                  <p className="text-xs text-red-400">{errors.userAddress}</p>
                )}
                <p className="text-xs text-slate-500">
                  Optional wallet address to analyze for settlement
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="requestedAmount" className="text-slate-300">
                  Requested Amount (CRO) *
                </Label>
                <Input
                  id="requestedAmount"
                  type="number"
                  step="0.000001"
                  value={requestedAmount}
                  onChange={(e) => {
                    setRequestedAmount(e.target.value);
                    if (errors.requestedAmount) {
                      setErrors({ ...errors, requestedAmount: '' });
                    }
                  }}
                  placeholder="e.g., 100.5"
                  className={`bg-slate-800 border-slate-600 text-slate-100 placeholder:text-slate-500 ${
                    errors.requestedAmount ? 'border-red-500' : ''
                  }`}
                />
                {errors.requestedAmount && (
                  <p className="text-xs text-red-400">{errors.requestedAmount}</p>
                )}
                <p className="text-xs text-slate-500">
                  Settlement amount requested in TCRO. Agent will validate if it's safe.
                </p>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="reason" className="text-slate-300">
              Override Reason *
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (errors.reason) {
                  setErrors({ ...errors, reason: '' });
                }
              }}
              placeholder="Explain why manual override is necessary..."
              rows={4}
              className={`bg-slate-800 border-slate-600 text-slate-100 placeholder:text-slate-500 resize-none ${
                errors.reason ? 'border-red-500' : ''
              }`}
            />
            {errors.reason && (
              <p className="text-xs text-red-400">{errors.reason}</p>
            )}
            <p className="text-xs text-slate-500">
              Required for audit trail compliance
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            className="bg-slate-700 text-slate-200 hover:bg-slate-600 border-slate-600"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-yellow-900 text-yellow-100 hover:bg-yellow-800"
          >
            Confirm Override
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

