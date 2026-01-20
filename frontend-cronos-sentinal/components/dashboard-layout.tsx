'use client';

import { useState, ReactNode } from 'react';
import { Shield, LayoutDashboard, Bot, Lock, CreditCard, Activity, Network, Menu, X, FileText, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AuditLogDrawer } from '@/components/audit-log-drawer';
import { WalletConnect } from '@/components/wallet-connect';

interface DashboardLayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  systemStatus?: 'healthy' | 'warning' | 'halted';
}

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'agents', label: 'AI Agents', icon: Bot },
  { id: 'vault', label: 'Vault Controls', icon: Lock },
  { id: 'x402', label: 'x402 Transactions', icon: CreditCard },
  { id: 'monitoring', label: 'Monitoring & Logs', icon: Activity },
  { id: 'architecture', label: 'Architecture', icon: Network },
];

export function DashboardLayout({ children, currentPage, onNavigate, systemStatus = 'healthy' }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [auditLogOpen, setAuditLogOpen] = useState(false);

  const statusConfig = {
    healthy: { label: 'Healthy', className: 'bg-green-950 text-green-400 border-green-800' },
    warning: { label: 'Warning', className: 'bg-yellow-950 text-yellow-400 border-yellow-800' },
    halted: { label: 'Halted', className: 'bg-red-950 text-red-400 border-red-800' },
  };

  const status = statusConfig[systemStatus];

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100">
      <div className={cn(
        'fixed left-0 top-0 h-full bg-[#1E293B] border-r border-slate-700 transition-all duration-200 z-40',
        sidebarOpen ? 'w-64' : 'w-0'
      )}>
        <div className={cn('h-full overflow-hidden', !sidebarOpen && 'hidden')}>
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-400" />
              <div>
                <h1 className="text-lg font-semibold text-slate-100">Cronos Sentinel AI</h1>
                <p className="text-xs text-slate-400">Security Operations Console</p>
              </div>
            </div>
          </div>

          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-900/50 text-blue-300 border border-blue-800'
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-slate-100'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className={cn('transition-all duration-200', sidebarOpen ? 'ml-64' : 'ml-0')}>
        <div className="sticky top-0 z-30 bg-[#1E293B] border-b border-slate-700">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-slate-300 hover:text-slate-100"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>

              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-400">System Status:</span>
                <Badge variant="outline" className={status.className}>
                  {status.label}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-400">Network:</span>
                <span className="text-slate-200 font-medium">Cronos Testnet</span>
                <Badge variant="outline" className="text-xs bg-slate-700 text-slate-400 border-slate-600">
                  Mainnet-ready
                </Badge>
              </div>

              <div className="h-6 w-px bg-slate-700" />

              <WalletConnect />

              <div className="h-6 w-px bg-slate-700" />

              <Button
                variant="outline"
                size="sm"
                onClick={() => setAuditLogOpen(true)}
                className="gap-2 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-slate-100"
              >
                <FileText className="w-4 h-4" />
                View Audit Log
              </Button>
            </div>
          </div>
        </div>

        <main className="p-6">
          {children}
        </main>
      </div>

      <AuditLogDrawer open={auditLogOpen} onClose={() => setAuditLogOpen(false)} />
    </div>
  );
}
