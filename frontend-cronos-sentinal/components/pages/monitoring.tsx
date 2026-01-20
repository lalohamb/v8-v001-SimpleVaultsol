'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { fetchSystemLogs, type SystemLog } from '@/lib/data-service';
import { format } from 'date-fns';

export function MonitoringPage() {
  const [severityFilter, setSeverityFilter] = useState('all');
  const [agentFilter, setAgentFilter] = useState('all');
  const [subsystemFilter, setSubsystemFilter] = useState('all');
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  async function loadLogs() {
    try {
      setLoading(true);
      const systemLogs = await fetchSystemLogs(50);
      setLogs(systemLogs);
    } catch (error) {
      console.error('Failed to load system logs:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredLogs = logs.filter((log) => {
    if (severityFilter !== 'all' && log.severity !== severityFilter) return false;
    if (agentFilter !== 'all' && log.agent !== agentFilter) return false;
    if (subsystemFilter !== 'all' && log.subsystem !== subsystemFilter) return false;
    return true;
  });

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return AlertCircle;
      case 'warn':
        return AlertTriangle;
      default:
        return Info;
    }
  };

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-950 text-red-400 border-red-800';
      case 'warn':
        return 'bg-yellow-950 text-yellow-400 border-yellow-800';
      default:
        return 'bg-blue-950 text-blue-400 border-blue-800';
    }
  };

  const uniqueAgents = Array.from(new Set(logs.map((log) => log.agent)));
  const uniqueSubsystems = Array.from(new Set(logs.map((log) => log.subsystem)));

  const handleExport = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `sentinel-logs-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100 mb-2">Monitoring & Logs</h1>
        <p className="text-slate-400">System events and operational telemetry</p>
      </div>

      <Card className="bg-[#1E293B] border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-100">Log Filters</CardTitle>
              <CardDescription className="text-slate-400">Filter by severity, agent, or subsystem</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-slate-600 text-slate-300 hover:bg-slate-700"
              onClick={handleExport}
            >
              <Download className="w-4 h-4" />
              Export JSON
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Severity</label>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warn">Warning</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-2 block">Agent</label>
              <Select value={agentFilter} onValueChange={setAgentFilter}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">All Agents</SelectItem>
                  {uniqueAgents.map((agent) => (
                    <SelectItem key={agent} value={agent}>
                      {agent}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-2 block">Subsystem</label>
              <Select value={subsystemFilter} onValueChange={setSubsystemFilter}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">All Subsystems</SelectItem>
                  {uniqueSubsystems.map((subsystem) => (
                    <SelectItem key={subsystem} value={subsystem}>
                      {subsystem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 text-sm text-slate-400">
            Showing {filteredLogs.length} of {logs.length} log entries
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1E293B] border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-100">System Logs</CardTitle>
          <CardDescription className="text-slate-400">Blockchain events and operational telemetry</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-slate-400">Loading system logs...</div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-slate-400">No logs found matching filters</div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log, index) => {
              const Icon = getSeverityIcon(log.severity);
              return (
                <div
                  key={index}
                  className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:bg-slate-800/70 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        log.severity === 'critical'
                          ? 'bg-red-950'
                          : log.severity === 'warn'
                          ? 'bg-yellow-950'
                          : 'bg-blue-950'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 ${
                          log.severity === 'critical'
                            ? 'text-red-400'
                            : log.severity === 'warn'
                            ? 'text-yellow-400'
                            : 'text-blue-400'
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className={getSeverityBadgeClass(log.severity)}>
                            {log.severity.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="bg-slate-700 text-slate-300 border-slate-600">
                            {log.subsystem}
                          </Badge>
                        </div>
                        <span className="text-xs font-mono text-slate-400 whitespace-nowrap">
                          {format(new Date(log.timestamp), 'MMM dd, HH:mm:ss')}
                        </span>
                      </div>
                      <div className="text-sm text-slate-400 mb-2">
                        Agent: <span className="text-slate-300">{log.agent}</span>
                      </div>
                      <div className="text-sm text-slate-200 leading-relaxed">{log.message}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
