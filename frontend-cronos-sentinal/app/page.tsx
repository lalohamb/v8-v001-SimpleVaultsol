'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { OverviewPage } from '@/components/pages/overview';
import { AgentsPage } from '@/components/pages/agents';
import { VaultPage } from '@/components/pages/vault';
import { X402Page } from '@/components/pages/x402';
import { MonitoringPage } from '@/components/pages/monitoring';
import { ArchitecturePage } from '@/components/pages/architecture';

export default function Home() {
  const [currentPage, setCurrentPage] = useState('overview');

  const renderPage = () => {
    switch (currentPage) {
      case 'overview':
        return <OverviewPage />;
      case 'agents':
        return <AgentsPage />;
      case 'vault':
        return <VaultPage />;
      case 'x402':
        return <X402Page />;
      case 'monitoring':
        return <MonitoringPage />;
      case 'architecture':
        return <ArchitecturePage />;
      default:
        return <OverviewPage />;
    }
  };

  return (
    <DashboardLayout
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      systemStatus="healthy"
    >
      {renderPage()}
    </DashboardLayout>
  );
}
