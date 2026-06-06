'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RefreshCw, CheckCircle2, XCircle, DollarSign, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToolCall {
  name: string;
  input: Record<string, any>;
  output: string;
  timestamp: string;
}

interface RefundLog {
  id: string;
  customerId: string;
  orderId: string;
  reason: string;
  status: string;
  timestamp: string;
  decision: {
    approved: boolean;
    amount: number;
    reason: string;
  };
  toolCalls: ToolCall[];
}

export default function AdminDashboard() {
  const [refundLogs, setRefundLogs] = useState<RefundLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<RefundLog | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch('/api/refund/process');
        const data = await response.json();
        setRefundLogs(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [refreshCount]);

  const stats = {
    total: refundLogs.length,
    approved: refundLogs.filter(l => l.decision?.approved).length,
    denied: refundLogs.filter(l => !l.decision?.approved).length,
    totalAmount: refundLogs
      .filter(l => l.decision?.approved)
      .reduce((sum, l) => sum + (l.decision?.amount || 0), 0),
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm">
        <div className="px-6 py-5 max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md">
              <Activity className="size-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">AI refund requests and decision analysis</p>
            </div>
          </div>
          <Button 
            onClick={() => setRefreshCount(c => c + 1)} 
            variant="outline"
            size="sm"
            data-icon="inline-start"
          >
            <RefreshCw className="size-4" data-icon="inline-start" />
            Refresh
          </Button>
        </div>
      </header>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-foreground">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-2">All processed requests</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <CheckCircle2 className="size-4 text-green-600" />
                Approved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-600">{stats.approved}</div>
              <p className="text-xs text-muted-foreground mt-2">{stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}% approval rate</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <XCircle className="size-4 text-red-600" />
                Denied
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-red-600">{stats.denied}</div>
              <p className="text-xs text-muted-foreground mt-2">Policy violations</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <DollarSign className="size-4 text-purple-600" />
                Total Approved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-purple-600">${stats.totalAmount.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-2">Refund value processed</p>
            </CardContent>
          </Card>
        </div>

        {/* Logs Table and Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Logs Table */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Refund Requests</CardTitle>
              <CardDescription>All refund processing history with AI agent decisions</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="p-8 text-center text-muted-foreground">Loading...</div>
              ) : refundLogs.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">No refund requests yet</div>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-2 pr-4">
                    {refundLogs.map((log) => (
                      <button
                        key={log.id}
                        onClick={() => setSelectedLog(log)}
                        className={cn(
                          'w-full p-3 rounded-lg border border-border text-left hover:bg-secondary transition-colors',
                          selectedLog?.id === log.id && 'bg-secondary border-accent'
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <code className="text-xs text-accent">{log.id.slice(0, 8)}</code>
                              <Badge variant={log.decision?.approved ? 'default' : 'destructive'}>
                                {log.decision?.approved ? 'APPROVED' : 'DENIED'}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-0.5">
                              <div>{log.customerId} • {log.orderId}</div>
                              <div className="text-xs">
                                {log.decision?.approved && `$${log.decision.amount.toFixed(2)}`}
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Details Panel */}
          <Card className="h-fit sticky top-6 border-2 border-purple-200 dark:border-purple-900 shadow-lg">
            {selectedLog ? (
              <ScrollArea className="h-[600px]">
                <div className="p-5 space-y-5">
                  {/* Decision Summary */}
                  <div>
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <Activity className="size-5 text-purple-600 dark:text-purple-400" />
                      Decision Details
                    </h3>
                    <div className="space-y-3 text-sm bg-secondary/50 rounded-lg p-4">
                      <div>
                        <p className="text-muted-foreground text-xs font-semibold mb-1">Request ID</p>
                        <code className="text-xs font-mono text-accent bg-background px-2 py-1 rounded inline-block">{selectedLog.id}</code>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs font-semibold mb-1">Customer</p>
                        <p className="font-semibold text-foreground">{selectedLog.customerId}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs font-semibold mb-1">Order</p>
                        <p className="font-semibold text-foreground">{selectedLog.orderId}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs font-semibold mb-1">Reason</p>
                        <p className="font-semibold text-foreground capitalize">{selectedLog.reason.replace(/_/g, ' ')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status and Amount */}
                  <div className="border-t border-border pt-4 space-y-3">
                    <div>
                      <p className="text-muted-foreground text-xs mb-2">Decision</p>
                      <Badge 
                        variant={selectedLog.decision?.approved ? 'default' : 'destructive'}
                        className="text-base py-1 px-3"
                      >
                        {selectedLog.decision?.approved ? '✓ APPROVED' : '✗ DENIED'}
                      </Badge>
                    </div>
                    {selectedLog.decision?.approved && (
                      <div>
                        <p className="text-muted-foreground text-xs mb-2">Refund Amount</p>
                        <p className="text-2xl font-bold text-accent">${selectedLog.decision.amount.toFixed(2)}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-muted-foreground text-xs mb-2">Decision Reason</p>
                      <p className="text-xs text-foreground">{selectedLog.decision?.reason}</p>
                    </div>
                  </div>

                  {/* Tool Calls */}
                  <div className="border-t border-border pt-5">
                    <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                      <div className="size-2 rounded-full bg-blue-500 animate-pulse" />
                      Agent Reasoning Trail
                    </h4>
                    <div className="space-y-2">
                      {selectedLog.toolCalls.map((call, idx) => (
                        <details 
                          key={idx} 
                          className="group bg-secondary/50 rounded-lg border border-border hover:border-blue-500/50 hover:bg-secondary transition-all cursor-pointer"
                        >
                          <summary className="px-3 py-3 cursor-pointer text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold flex items-center gap-2">
                            <span className="inline-flex items-center justify-center size-5 rounded bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-xs font-bold">
                              {idx + 1}
                            </span>
                            {call.name}
                          </summary>
                          <div className="px-3 py-3 text-xs space-y-3 border-t border-border bg-background">
                            <div>
                              <p className="text-muted-foreground text-xs font-bold mb-2 uppercase">Input</p>
                              <pre className="bg-slate-950 dark:bg-slate-800 text-slate-200 p-2 rounded overflow-x-auto text-xs whitespace-pre-wrap break-words font-mono">
                                {JSON.stringify(call.input, null, 2)}
                              </pre>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs font-bold mb-2 uppercase">Output</p>
                              <pre className="bg-slate-950 dark:bg-slate-800 text-slate-200 p-2 rounded overflow-x-auto text-xs whitespace-pre-wrap break-words font-mono">
                                {typeof call.output === 'string' ? call.output : JSON.stringify(call.output, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </details>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            ) : (
              <CardContent className="flex items-center justify-center h-80">
                <p className="text-muted-foreground text-center">Select a request to view details</p>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
