'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams } from 'next/navigation';
import axios from "@/utils/axios";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
    Loader2,
    RefreshCcw,
    Trash2,
    Terminal,
    AlertCircle,
    CheckCircle2,
    Info,
    AlertTriangle,
    Eye,
    ChevronLeft,
    ChevronRight,
    Search,
    Download,
    Clock,
    Activity,
    Shield,
    Zap,
    Copy,
    Radio,
    Database,
    Cpu,
    Webhook,
    Bot,
    Timer,
    Hash,
    ArrowUpDown,
    X,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";

// Severity color mapping — soft muted tones
const SEVERITY_CONFIG = {
    ERROR: { color: 'text-rose-400/80', bg: 'bg-rose-500/5', border: 'border-rose-500/10', stripe: 'bg-rose-400/60', icon: AlertCircle, label: 'CRITICAL' },
    WARNING: { color: 'text-amber-400/80', bg: 'bg-amber-500/5', border: 'border-amber-500/10', stripe: 'bg-amber-400/60', icon: AlertTriangle, label: 'WARNING' },
    SUCCESS: { color: 'text-emerald-400/80', bg: 'bg-emerald-500/5', border: 'border-emerald-500/10', stripe: 'bg-emerald-400/60', icon: CheckCircle2, label: 'SUCCESS' },
    INFO: { color: 'text-sky-400/80', bg: 'bg-sky-500/5', border: 'border-sky-500/10', stripe: 'bg-sky-400/60', icon: Info, label: 'INFO' },
};

const MODULE_CONFIG = {
    CRON: { icon: Timer, color: 'text-muted-foreground' },
    TRIGGER: { icon: Zap, color: 'text-muted-foreground' },
    AI: { icon: Bot, color: 'text-muted-foreground' },
    SYSTEM: { icon: Cpu, color: 'text-muted-foreground' },
    SYSTEM_WEBHOOK: { icon: Webhook, color: 'text-muted-foreground' },
    AUTH: { icon: Shield, color: 'text-muted-foreground' },
    WEBHOOK: { icon: Webhook, color: 'text-muted-foreground' },
};

export default function LogPage() {
    const params = useParams();
    const workspaceId = params?.workspaceId;

    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, pages: 1 });
    const [filters, setFilters] = useState({ level: 'ALL', type: 'ALL' });
    const [selectedLog, setSelectedLog] = useState(null);
    const [logToDelete, setLogToDelete] = useState(null);
    const [selectedLogIds, setSelectedLogIds] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [countdown, setCountdown] = useState(15);
    const [sortOrder, setSortOrder] = useState('desc');
    const intervalRef = useRef(null);

    const fetchLogs = useCallback(async () => {
        if (!workspaceId) return;
        setIsLoading(true);
        try {
            const query = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                level: filters.level,
                type: filters.type
            });
            const res = await axios.get(`/api/workspace/${workspaceId}/system/logs?${query}`);
            setLogs(res.data.logs);
            setPagination(res.data.pagination);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load system logs");
        } finally {
            setIsLoading(false);
        }
    }, [workspaceId, pagination.page, filters.level, filters.type]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    // Auto-refresh timer
    useEffect(() => {
        if (autoRefresh) {
            setCountdown(15);
            intervalRef.current = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        fetchLogs();
                        return 15;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [autoRefresh, fetchLogs]);

    // Filtered logs (client-side search)
    const displayedLogs = useMemo(() => {
        let result = [...logs];
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(log =>
                log.message?.toLowerCase().includes(q) ||
                log.type?.toLowerCase().includes(q) ||
                log.level?.toLowerCase().includes(q) ||
                JSON.stringify(log.details || {}).toLowerCase().includes(q)
            );
        }
        if (sortOrder === 'asc') {
            result.reverse();
        }
        return result;
    }, [logs, searchQuery, sortOrder]);

    // Severity distribution stats
    const severityStats = useMemo(() => {
        const stats = { ERROR: 0, WARNING: 0, SUCCESS: 0, INFO: 0, OTHER: 0 };
        logs.forEach(log => {
            if (stats[log.level] !== undefined) stats[log.level]++;
            else stats.OTHER++;
        });
        return stats;
    }, [logs]);

    const handleClearLogs = async () => {
        if (!confirm("Are you sure you want to clear logs older than 30 days?")) return;
        try {
            await axios.delete(`/api/workspace/${workspaceId}/system/logs`);
            toast.success("Old logs cleared");
            fetchLogs();
        } catch (error) {
            toast.error("Failed to clear logs");
        }
    };

    const handleClearAllLogs = async () => {
        if (!confirm("⚠️ DESTRUCTIVE: This will purge ALL system logs immediately. This cannot be undone. Continue?")) return;
        try {
            await axios.delete(`/api/workspace/${workspaceId}/system/logs?clearAll=true`);
            toast.success("Global log registry completely purged.");
            setSelectedLogIds([]);
            fetchLogs();
        } catch (error) {
            toast.error("Failed to purge global logs");
        }
    };

    const handleExportLogs = () => {
        let content = `# Devlomatix System Log Export\n# Generated: ${new Date().toISOString()}\n# Workspace: ${workspaceId}\n# Total Records: ${displayedLogs.length}\n${'─'.repeat(80)}\n\n`;
        displayedLogs.forEach(log => {
            content += `[${log.level}] [${log.type}] ${format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss')}\n`;
            content += `  ${log.message}\n`;
            if (log.details) content += `  Details: ${JSON.stringify(log.details)}\n`;
            content += '\n';
        });
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `devlomatix_logs_${format(new Date(), 'yyyyMMdd_HHmmss')}.log`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(`Exported ${displayedLogs.length} log entries`);
    };

    const triggerDeleteSingleLog = (e, logId) => {
        e.stopPropagation();
        setLogToDelete(logId);
    };

    const triggerDeleteSelectedLogs = () => {
        if (selectedLogIds.length === 0) return;
        setLogToDelete(selectedLogIds);
    };

    const toggleSelectAll = () => {
        if (selectedLogIds.length === displayedLogs.length && displayedLogs.length > 0) {
            setSelectedLogIds([]);
        } else {
            setSelectedLogIds(displayedLogs.map(log => log.id));
        }
    };

    const confirmDeleteLog = async () => {
        if (!logToDelete) return;
        try {
            if (Array.isArray(logToDelete)) {
                await axios.delete(`/api/workspace/${workspaceId}/system/logs?ids=${logToDelete.join(',')}`);
                toast.success(`Deleted ${logToDelete.length} log entries`);
                setSelectedLogIds([]);
            } else {
                await axios.delete(`/api/workspace/${workspaceId}/system/logs?id=${logToDelete}`);
                toast.success("Log entry deleted");
                setSelectedLogIds(prev => prev.filter(id => id !== logToDelete));
            }
            fetchLogs();
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete log entry");
        } finally {
            setLogToDelete(null);
        }
    };

    const handleCopyLogId = (e, id) => {
        e.stopPropagation();
        navigator.clipboard.writeText(id);
        toast.success("Log ID copied to clipboard");
    };

    const getSeverityConfig = (level) => SEVERITY_CONFIG[level] || { color: 'text-muted-foreground', bg: 'bg-muted/30', border: 'border-border', stripe: 'bg-muted-foreground', icon: Info, label: level };
    const getModuleConfig = (type) => MODULE_CONFIG[type] || { icon: Database, color: 'text-muted-foreground' };

    const getLevelBadge = (level) => {
        const config = getSeverityConfig(level);
        const Icon = config.icon;
        return (
            <Badge variant="outline" className={`${config.bg} ${config.color} ${config.border} font-bold flex items-center gap-1 text-[9px] tracking-widest rounded-sm px-2 py-0.5`}>
                <Icon size={10} /> {config.label}
            </Badge>
        );
    };

    return (
        <div className="p-6 space-y-5 animate-fade-in bg-background/50 min-h-screen">

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <Terminal className="text-primary w-5 h-5" />
                        </div>
                        System Telemetry Console
                    </h1>
                    <p className="text-xs text-muted-foreground font-medium mt-1.5 ml-12">
                        Real-time diagnostics, event tracing, and observability infrastructure.
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {selectedLogIds.length > 0 && (
                        <div className="flex items-center gap-2 animate-in slide-in-from-right-4 duration-300">
                            <Badge variant="outline" className="px-3 h-8 font-mono tracking-widest text-[9px] border-border/60">
                                {selectedLogIds.length} SELECTED
                            </Badge>
                            <Button variant="destructive" onClick={triggerDeleteSelectedLogs} size="sm" className="h-8 font-bold text-[10px] shadow-sm">
                                <Trash2 className="mr-1.5 h-3 w-3" /> Purge Selected
                            </Button>
                        </div>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={`h-8 text-[10px] font-bold transition-all ${autoRefresh ? 'border-primary/30 text-primary bg-primary/5' : ''}`}
                    >
                        <Radio className={`mr-1.5 h-3 w-3 ${autoRefresh ? 'text-primary animate-pulse' : ''}`} />
                        {autoRefresh ? `Live (${countdown}s)` : 'Auto-Refresh'}
                    </Button>
                    <Button variant="outline" onClick={handleExportLogs} disabled={displayedLogs.length === 0} size="sm" className="h-8 text-[10px] font-bold">
                        <Download className="mr-1.5 h-3 w-3 text-muted-foreground" /> Export
                    </Button>
                    <Button variant="outline" onClick={fetchLogs} disabled={isLoading} size="sm" className="h-8 text-[10px] font-bold">
                        <RefreshCcw className={`mr-1.5 h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
                    </Button>
                    <Button variant="secondary" onClick={handleClearLogs} size="sm" className="h-8 text-[10px] font-bold">
                        <Clock className="mr-1.5 h-3 w-3" /> Clear 30d+
                    </Button>
                    <Button variant="destructive" onClick={handleClearAllLogs} size="sm" className="h-8 text-[10px] font-bold">
                        <Trash2 className="mr-1.5 h-3 w-3" /> Purge All
                    </Button>
                </div>
            </div>

            {/* Severity Distribution Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(SEVERITY_CONFIG).map(([key, config]) => {
                    const Icon = config.icon;
                    const count = severityStats[key] || 0;
                    const pct = logs.length > 0 ? Math.min(Math.round((count / logs.length) * 100), 100) : 0;
                    return (
                        <button
                            key={key}
                            onClick={() => setFilters(prev => ({ ...prev, level: prev.level === key ? 'ALL' : key }))}
                            className={`relative overflow-hidden rounded-md border p-3 text-left transition-all hover:scale-[1.01] active:scale-[0.99] ${
                                filters.level === key
                                    ? `${config.border} ${config.bg} shadow-sm`
                                    : 'border-border/30 bg-card/40 hover:border-border/50'
                            }`}
                        >
                            <div className={`absolute left-0 top-0 w-1 h-full ${config.stripe}`} />
                            <div className="flex items-center justify-between pl-2">
                                <div>
                                    <div className={`text-[9px] font-bold tracking-widest uppercase ${config.color} opacity-70`}>{config.label}</div>
                                    <div className="text-2xl font-black mt-0.5 text-foreground/80">{count}</div>
                                </div>
                                <div className={`w-10 h-10 rounded-md ${config.bg} flex items-center justify-center`}>
                                    <Icon className={`w-5 h-5 ${config.color}`} />
                                </div>
                            </div>
                            <div className="mt-2 pl-2">
                                <div className="w-full bg-muted/40 rounded-full h-1">
                                    <div className={`${config.stripe} h-1 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                                </div>
                                <div className="text-[8px] text-muted-foreground/60 font-mono mt-1">{pct}% of page</div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Command Bar */}
            <div className="flex flex-col xl:flex-row items-center justify-between gap-3 bg-card/60 border border-border/60 p-2.5 rounded-md shadow-inner backdrop-blur-sm">
                <div className="flex items-center w-full xl:w-auto overflow-x-auto scrollbar-hide gap-1 p-1 bg-muted/40 rounded-sm border border-border/40">
                    <Button variant="ghost" size="sm" onClick={() => setFilters(prev => ({ ...prev, type: 'ALL' }))} className={`px-3 text-[9px] font-bold tracking-wider rounded-sm transition-all ${filters.type === 'ALL' ? 'bg-background shadow-sm text-foreground border border-border/50' : 'text-muted-foreground hover:text-foreground'}`}>
                        ALL MODULES
                    </Button>
                    {Object.entries(MODULE_CONFIG).map(([key, config]) => {
                        const Icon = config.icon;
                        return (
                            <Button key={key} variant="ghost" size="sm" onClick={() => setFilters(prev => ({ ...prev, type: prev.type === key ? 'ALL' : key }))} className={`px-3 text-[9px] font-bold tracking-wider rounded-sm transition-all whitespace-nowrap ${filters.type === key ? `${config.color} bg-background shadow-sm border border-border/50` : 'text-muted-foreground hover:text-foreground'}`}>
                                <Icon className="w-3 h-3 mr-1.5" /> {key}
                            </Button>
                        );
                    })}
                </div>
                <div className="flex items-center w-full xl:w-auto gap-3">
                    <div className="relative w-full xl:w-[280px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
                        <Input
                            placeholder="Search logs, metadata, modules..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-9 h-9 w-full text-xs font-medium bg-background shadow-inner border-border/60 focus-visible:ring-1 focus-visible:ring-primary rounded-md"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                                <X className="w-3 h-3 text-muted-foreground/60 hover:text-foreground" />
                            </button>
                        )}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')} className="h-9 px-3 text-[9px] font-bold shrink-0">
                        <ArrowUpDown className="w-3 h-3 mr-1.5" /> {sortOrder === 'desc' ? 'NEWEST' : 'OLDEST'}
                    </Button>
                </div>
            </div>

            {/* Table */}
            <Card className="border-border/60 shadow-sm overflow-hidden rounded-md">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/20">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[40px] px-4 py-3.5">
                                    <Checkbox checked={displayedLogs.length > 0 && selectedLogIds.length === displayedLogs.length} onCheckedChange={toggleSelectAll} aria-label="Select all" />
                                </TableHead>
                                <TableHead className="w-[4px] p-0"></TableHead>
                                <TableHead className="w-[90px] text-[9px] py-3.5 font-bold tracking-widest uppercase text-muted-foreground/70">Severity</TableHead>
                                <TableHead className="w-[130px] text-[9px] py-3.5 font-bold tracking-widest uppercase text-muted-foreground/70">Module</TableHead>
                                <TableHead className="text-[9px] py-3.5 font-bold tracking-widest uppercase text-muted-foreground/70">Event Description</TableHead>
                                <TableHead className="w-[160px] text-right text-[9px] py-3.5 font-bold tracking-widest uppercase text-muted-foreground/70">Timestamp</TableHead>
                                <TableHead className="w-[80px] text-right py-3.5"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-52 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="relative">
                                                <div className="w-12 h-12 rounded-full border-2 border-primary/20 flex items-center justify-center">
                                                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                                </div>
                                            </div>
                                            <span className="text-[10px] tracking-[0.3em] text-muted-foreground/50 font-bold">SYNCHRONIZING TELEMETRY...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : displayedLogs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-52 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-30">
                                            <Terminal className="w-12 h-12" />
                                            <span className="text-sm font-bold">No telemetry events match current filters</span>
                                            <span className="text-[10px] text-muted-foreground">Adjust severity or module filters to discover events</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                displayedLogs.map((log) => {
                                    const severity = getSeverityConfig(log.level);
                                    const module = getModuleConfig(log.type);
                                    const ModuleIcon = module.icon;
                                    return (
                                        <TableRow key={log.id} className="group cursor-pointer hover:bg-muted/20 border-b border-border/20 transition-all" onClick={() => setSelectedLog(log)}>
                                            <TableCell className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                                <Checkbox checked={selectedLogIds.includes(log.id)} onCheckedChange={(checked) => setSelectedLogIds(prev => checked ? [...prev, log.id] : prev.filter(id => id !== log.id))} />
                                            </TableCell>
                                            <TableCell className="p-0 w-[4px]">
                                                <div className={`w-1 h-full min-h-[48px] ${severity.stripe} opacity-70`} />
                                            </TableCell>
                                            <TableCell className="py-3">
                                                {getLevelBadge(log.level)}
                                            </TableCell>
                                            <TableCell className="py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-6 h-6 rounded-sm ${severity.bg} flex items-center justify-center`}>
                                                        <ModuleIcon className={`w-3.5 h-3.5 ${module.color}`} />
                                                    </div>
                                                    <span className="text-[10px] font-bold tracking-wider uppercase">{log.type}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-3">
                                                <div className="max-w-[440px]">
                                                    <div className="text-[11px] font-semibold truncate leading-relaxed text-foreground/90">{log.message}</div>
                                                    {log.details && (
                                                        <div className="text-[9px] text-muted-foreground/50 font-mono mt-0.5 truncate max-w-[400px]">
                                                            {typeof log.details === 'object' ? Object.keys(log.details).slice(0, 3).join(' · ') : ''}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-3 text-right">
                                                <div className="text-[10px] font-bold text-muted-foreground/80 font-mono">{format(new Date(log.createdAt), 'HH:mm:ss')}</div>
                                                <div className="text-[8px] text-muted-foreground/40 font-medium">{formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}</div>
                                            </TableCell>
                                            <TableCell className="py-3 text-right pr-3">
                                                <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(e) => handleCopyLogId(e, log.id)}>
                                                        <Hash size={12} className="text-muted-foreground" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); setSelectedLog(log); }}>
                                                        <Eye size={12} />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={(e) => triggerDeleteSingleLog(e, log.id)}>
                                                        <Trash2 size={12} />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Pagination */}
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-3">
                    <p className="text-[10px] font-bold text-muted-foreground">
                        {displayedLogs.length} of {pagination.total} records
                    </p>
                    {searchQuery && (
                        <Badge variant="outline" className="text-[8px] h-5 px-2 font-mono">
                            FILTERED: {displayedLogs.length} matches
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Select value={pagination.limit.toString()} onValueChange={(val) => setPagination(prev => ({ ...prev, limit: parseInt(val), page: 1 }))}>
                        <SelectTrigger className="h-7 w-[80px] text-[10px] font-bold bg-background rounded-sm">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10 / pg</SelectItem>
                            <SelectItem value="25">25 / pg</SelectItem>
                            <SelectItem value="50">50 / pg</SelectItem>
                            <SelectItem value="100">100 / pg</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="ghost" size="sm" disabled={pagination.page <= 1 || isLoading} onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))} className="h-7 w-7 p-0 rounded-sm border bg-background">
                        <ChevronLeft size={14} />
                    </Button>
                    <div className="flex items-center gap-1 px-2">
                        <span className="text-[10px] font-bold">{pagination.page}</span>
                        <span className="text-[10px] text-muted-foreground/30">/</span>
                        <span className="text-[10px] text-muted-foreground/50">{pagination.pages}</span>
                    </div>
                    <Button variant="ghost" size="sm" disabled={pagination.page >= pagination.pages || isLoading} onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))} className="h-7 w-7 p-0 rounded-sm border bg-background">
                        <ChevronRight size={14} />
                    </Button>
                </div>
            </div>

            {/* Log Inspector Dialog */}
            <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
                <DialogContent className="max-w-2xl bg-card border border-border shadow-2xl overflow-hidden flex flex-col max-h-[85vh] rounded-md">
                    {selectedLog && (() => {
                        const severity = getSeverityConfig(selectedLog.level);
                        const module = getModuleConfig(selectedLog.type);
                        const ModuleIcon = module.icon;
                        return (
                            <>
                                <DialogHeader className="p-6 pb-4 border-b border-border/30">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${severity.stripe} animate-pulse`} />
                                            {getLevelBadge(selectedLog.level)}
                                            <Badge variant="outline" className="text-[8px] font-mono tracking-wider px-2 py-0.5">
                                                <ModuleIcon className={`w-3 h-3 mr-1 ${module.color}`} />{selectedLog.type}
                                            </Badge>
                                        </div>
                                        <button
                                            onClick={(e) => handleCopyLogId(e, selectedLog.id)}
                                            className="flex items-center gap-1.5 text-[9px] text-muted-foreground/60 hover:text-foreground transition-colors bg-muted/30 px-2 py-1 rounded-sm border border-border/30"
                                        >
                                            <Hash size={10} /> {selectedLog.id.slice(0, 12)}...
                                            <Copy size={9} className="ml-1 opacity-50" />
                                        </button>
                                    </div>
                                    <DialogTitle className="text-base font-bold leading-snug">
                                        {selectedLog.message}
                                    </DialogTitle>
                                    <DialogDescription className="text-[10px] font-medium font-mono mt-1">
                                        {format(new Date(selectedLog.createdAt), 'EEEE, MMMM do yyyy | HH:mm:ss.SSS')}
                                        <span className="ml-2 opacity-50">({formatDistanceToNow(new Date(selectedLog.createdAt), { addSuffix: true })})</span>
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 scrollbar-hide">
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="bg-muted/30 p-3 rounded-md border border-border/30">
                                            <span className="text-[8px] text-muted-foreground/60 font-bold tracking-widest uppercase block mb-1.5">Severity</span>
                                            <div className={`font-bold text-xs ${severity.color}`}>{severity.label}</div>
                                        </div>
                                        <div className="bg-muted/30 p-3 rounded-md border border-border/30">
                                            <span className="text-[8px] text-muted-foreground/60 font-bold tracking-widest uppercase block mb-1.5">Module</span>
                                            <div className="flex items-center font-bold text-xs">
                                                <ModuleIcon className={`w-3.5 h-3.5 mr-1.5 ${module.color}`} />{selectedLog.type}
                                            </div>
                                        </div>
                                        <div className="bg-muted/30 p-3 rounded-md border border-border/30">
                                            <span className="text-[8px] text-muted-foreground/60 font-bold tracking-widest uppercase block mb-1.5">Workspace</span>
                                            <div className="font-mono text-[10px] font-bold truncate">{selectedLog.workspaceId || 'GLOBAL'}</div>
                                        </div>
                                    </div>

                                    {selectedLog.details && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[9px] text-muted-foreground/60 font-bold tracking-widest uppercase">Structured Payload</span>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(JSON.stringify(selectedLog.details, null, 2));
                                                        toast.success("JSON payload copied");
                                                    }}
                                                    className="text-[8px] text-muted-foreground/50 hover:text-foreground flex items-center gap-1 transition-colors"
                                                >
                                                    <Copy size={9} /> Copy JSON
                                                </button>
                                            </div>
                                            <div className="bg-[#0d1117] p-5 rounded-md overflow-hidden shadow-inner border border-white/5 relative">
                                                <pre className="text-[10px] font-mono text-[#79c0ff] overflow-x-auto scrollbar-hide leading-[1.7]">
                                                    {JSON.stringify(selectedLog.details, null, 2)}
                                                </pre>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        );
                    })()}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!logToDelete} onOpenChange={(open) => !open && setLogToDelete(null)}>
                <AlertDialogContent className="rounded-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-md bg-destructive/10 flex items-center justify-center">
                                <Trash2 className="w-4 h-4 text-destructive" />
                            </div>
                            Confirm Permanent Deletion
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-xs">
                            {Array.isArray(logToDelete)
                                ? `You are about to permanently delete ${logToDelete.length} log entries. This action is irreversible and cannot be recovered.`
                                : "This will permanently remove this telemetry record from the database. This action cannot be undone."
                            }
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="text-[10px] font-bold tracking-wider rounded-md h-8">CANCEL</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDeleteLog} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-[10px] font-bold tracking-wider rounded-md h-8">
                            DELETE {Array.isArray(logToDelete) ? `${logToDelete.length} ENTRIES` : 'LOG'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}