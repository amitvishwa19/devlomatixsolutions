'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    FileSpreadsheet,
    Search,
    Download,
    Check,
    CheckCheck,
    Clock,
    ArrowUpRight,
    ArrowDownLeft,
    RefreshCw,
    MessageSquare,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { getDeliveryReportsAction } from '../_actions/reports-actions';

export default function KonnectReportsPage() {
    const params = useParams();
    const router = useRouter();
    const workspaceId = params.workspaceId;

    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState({ total: 0, sent: 0, delivered: 0, read: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const loadReports = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getDeliveryReportsAction(workspaceId, {
                status: statusFilter,
                search,
                limit: 100
            });
            if (res.success) {
                setLogs(res.logs);
                setStats(res.stats);
            } else {
                toast.error(res.error || "Failed to load telemetry logs");
            }
        } catch (e) {
            toast.error("Network error loading logs");
        } finally {
            setLoading(false);
        }
    }, [workspaceId, statusFilter, search]);

    useEffect(() => {
        loadReports();
    }, [loadReports]);

    const handleExportCsv = () => {
        if (logs.length === 0) {
            toast.error("No telemetry records to export");
            return;
        }

        const headers = ["Timestamp", "Direction", "Phone", "Message", "Status"];
        const rows = logs.map(l => [
            new Date(l.timestamp).toISOString(),
            l.isOutbound ? "Outbound" : "Inbound",
            l.phone,
            `"${(l.text || '').replace(/"/g, '""')}"`,
            l.status
        ]);

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `konnect_legacy_delivery_report_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("CSV report exported successfully!");
    };

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
                        Delivery Telemetry & Message Reports
                    </h1>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Audit trail of every message transmitted or received through your linked WhatsApp multi-device session.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={loadReports}
                        disabled={loading}
                        className="h-8 text-xs gap-1.5"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleExportCsv}
                        className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                        <Download className="h-3.5 w-3.5" />
                        <span>Export CSV</span>
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card className="bg-card/40 border-border/40 backdrop-blur-sm">
                    <CardContent className="p-3.5">
                        <p className="text-[11px] font-medium text-muted-foreground">Logged Messages</p>
                        <p className="text-lg font-bold text-foreground mt-1">{stats.total}</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/40 border-border/40 backdrop-blur-sm">
                    <CardContent className="p-3.5">
                        <p className="text-[11px] font-medium text-muted-foreground">Sent Dispatches</p>
                        <p className="text-lg font-bold text-blue-500 mt-1">{stats.sent}</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/40 border-border/40 backdrop-blur-sm">
                    <CardContent className="p-3.5">
                        <p className="text-[11px] font-medium text-muted-foreground">Delivered</p>
                        <p className="text-lg font-bold text-emerald-500 mt-1">{stats.delivered}</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/40 border-border/40 backdrop-blur-sm">
                    <CardContent className="p-3.5">
                        <p className="text-[11px] font-medium text-muted-foreground">Read by Contact</p>
                        <p className="text-lg font-bold text-indigo-500 mt-1">{stats.read}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                        placeholder="Search logs by phone number or text..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8 h-8 text-xs bg-card/40 border-border/40"
                    />
                </div>
                <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto scrollbar-none py-1">
                    {['ALL', 'SENT', 'DELIVERED', 'READ'].map((st) => (
                        <Button
                            key={st}
                            size="sm"
                            variant={statusFilter === st ? 'default' : 'outline'}
                            onClick={() => setStatusFilter(st)}
                            className="h-7 text-[11px] px-2.5"
                        >
                            {st}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Telemetry Table */}
            <Card className="bg-card/40 border-border/40 backdrop-blur-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                        <thead className="bg-muted/40 text-muted-foreground border-b border-border/40 font-medium">
                            <tr>
                                <th className="px-3 py-2.5">Time</th>
                                <th className="px-3 py-2.5">Direction</th>
                                <th className="px-3 py-2.5">Phone / Contact</th>
                                <th className="px-3 py-2.5">Message Content</th>
                                <th className="px-3 py-2.5">Status</th>
                                <th className="px-3 py-2.5 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                                        <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-emerald-500" />
                                        Loading telemetry logs...
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                                        No delivery records matching current filters.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap font-mono text-[11px]">
                                            {new Date(log.timestamp).toLocaleString([], {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                second: '2-digit'
                                            })}
                                        </td>
                                        <td className="px-3 py-2.5 whitespace-nowrap">
                                            {log.isOutbound ? (
                                                <span className="flex items-center gap-1 text-emerald-500 font-medium">
                                                    <ArrowUpRight className="h-3 w-3" />
                                                    Outbound
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-blue-500 font-medium">
                                                    <ArrowDownLeft className="h-3 w-3" />
                                                    Inbound
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-3 py-2.5 font-mono font-medium">
                                            +{log.phone}
                                        </td>
                                        <td className="px-3 py-2.5 max-w-[320px] truncate text-foreground">
                                            {log.text || '—'}
                                        </td>
                                        <td className="px-3 py-2.5 whitespace-nowrap">
                                            <Badge
                                                variant="outline"
                                                className={`text-[10px] px-1.5 py-0 font-medium ${
                                                    log.status === 'READ'
                                                        ? 'border-indigo-500/30 text-indigo-500 bg-indigo-500/5'
                                                        : log.status === 'DELIVERED'
                                                        ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/5'
                                                        : 'border-blue-500/30 text-blue-500 bg-blue-500/5'
                                                }`}
                                            >
                                                {log.status}
                                            </Badge>
                                        </td>
                                        <td className="px-3 py-2.5 text-right whitespace-nowrap">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => router.push(`/workspace/${workspaceId}/konnectx-legacy/chats?jid=${log.jid}`)}
                                                className="h-6 text-[11px] px-2 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 gap-1"
                                            >
                                                <MessageSquare className="h-3 w-3" />
                                                <span>View Chat</span>
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
