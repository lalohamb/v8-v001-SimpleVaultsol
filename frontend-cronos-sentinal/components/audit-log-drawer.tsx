'use client';

import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { fetchAuditLog, type AuditLogEntry } from '@/lib/data-service';
import { format } from 'date-fns';

interface AuditLogDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function AuditLogDrawer({ open, onClose }: AuditLogDrawerProps) {
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadAuditLog();
    }
  }, [open]);

  async function loadAuditLog() {
    try {
      setLoading(true);
      const log = await fetchAuditLog(20);
      setAuditLog(log);
    } catch (error) {
      console.error('Failed to load audit log:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl bg-[#1E293B] border-slate-700">
        <SheetHeader>
          <SheetTitle className="text-slate-100">Audit Log</SheetTitle>
          <SheetDescription className="text-slate-400">
            Last 20 system actions and blockchain events
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] mt-6">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-slate-400">Loading audit log...</div>
            </div>
          ) : auditLog.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-slate-400">No audit entries found</div>
            </div>
          ) : (
            <div className="space-y-4">
              {auditLog.map((entry, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-slate-800/50 border border-slate-700"
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="font-medium text-slate-200">{entry.action}</div>
                    <div className="text-xs text-slate-400 font-mono whitespace-nowrap">
                      {format(new Date(entry.timestamp), 'MMM dd, HH:mm:ss')}
                    </div>
                  </div>
                  <div className="text-sm text-slate-400 mb-1">
                    User: <span className="font-mono text-slate-300">{entry.user}</span>
                  </div>
                  <div className="text-sm text-slate-400">{entry.details}</div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
