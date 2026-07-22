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
    Eye,
    ChevronLeft,
    ChevronRight,
    Search,
    Download,
    Clock,
    Globe,
    Users,
    Monitor,
    Smartphone,
    Tablet,
    Compass,
    MapPin,
    ExternalLink,
    Radio,
    Copy,
    Hash,
    ArrowUpDown,
    X,
    Laptop,
    Chrome,
    Activity
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

// Convert country code to flag emoji
function getFlagEmoji(countryCode) {
    if (!countryCode || countryCode === "UN" || countryCode === "LOCAL") return "🌐";
    try {
        const codePoints = countryCode
            .toUpperCase()
            .split('')
            .map(char => 127397 + char.charCodeAt(0));
        return String.fromCodePoint(...codePoints);
    } catch (e) {
        return "🌐";
    }
}

export function VisitorsLogTab() {
    const params = useParams();
    const workspaceId = params?.workspaceId;

    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState({ totalVisits: 0, uniqueVisitors: 0, topCountries: [], topPages: [], deviceStats: {} });
    const [isLoading, setIsLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, pages: 1 });
    const [filters, setFilters] = useState({ country: 'ALL', device: 'ALL', dateRange: 'all' });
    const [selectedLog, setSelectedLog] = useState(null);
    const [logToDelete, setLogToDelete] = useState(null);
    const [selectedLogIds, setSelectedLogIds] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [countdown, setCountdown] = useState(15);
    const [sortOrder, setSortOrder] = useState('desc');
    const intervalRef = useRef(null);

    const fetchVisitorLogs = useCallback(async () => {
        if (!workspaceId) return;
        setIsLoading(true);
        try {
            const query = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                country: filters.country,
                device: filters.device,
                dateRange: filters.dateRange,
                search: searchQuery
            });
            const res = await axios.get(`/api/workspace/${workspaceId}/system/visitors?${query}`);
            setLogs(res.data.logs || []);
            setPagination(res.data.pagination || { page: 1, limit: 25, total: 0, pages: 1 });
            if (res.data.stats) setStats(res.data.stats);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load visitor telemetry logs");
        } finally {
            setIsLoading(false);
        }
    }, [workspaceId, pagination.page, pagination.limit, filters.country, filters.device, filters.dateRange, searchQuery]);

    useEffect(() => {
        fetchVisitorLogs();
    }, [fetchVisitorLogs]);

    // Auto-refresh timer
    useEffect(() => {
        if (autoRefresh) {
            setCountdown(15);
            intervalRef.current = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        fetchVisitorLogs();
                        return 15;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [autoRefresh, fetchVisitorLogs]);

    // Client-side sort
    const displayedLogs = useMemo(() => {
        let result = [...logs];
        if (sortOrder === 'asc') {
            result.reverse();
        }
        return result;
    }, [logs, sortOrder]);

    const handleClearLogs = async () => {
        if (!confirm("Are you sure you want to clear visitor logs older than 30 days?")) return;
        try {
            await axios.delete(`/api/workspace/${workspaceId}/system/visitors?olderThan30d=true`);
            toast.success("Visitor logs older than 30 days cleared");
            fetchVisitorLogs();
        } catch (error) {
            toast.error("Failed to clear visitor logs");
        }
    };

    const handleClearAllLogs = async () => {
        if (!confirm("⚠️ DESTRUCTIVE: Purge ALL site visitor telemetry logs? This action is permanent.")) return;
        try {
            await axios.delete(`/api/workspace/${workspaceId}/system/visitors?clearAll=true`);
            toast.success("Global visitor log registry purged.");
            setSelectedLogIds([]);
            fetchVisitorLogs();
        } catch (error) {
            toast.error("Failed to purge visitor logs");
        }
    };

    const handleExportLogs = () => {
        let content = `# Devlomatix Site Visitor Telemetry Export\n# Generated: ${new Date().toISOString()}\n# Workspace: ${workspaceId}\n# Total Records: ${displayedLogs.length}\n${'─'.repeat(80)}\n\n`;
        displayedLogs.forEach(log => {
            content += `[${format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss')}] [${log.ipAddress}] [${log.country || 'Unknown'}]\n`;
            content += `  Visited: ${log.path}\n`;
            content += `  Device: ${log.device} · OS: ${log.os} · Browser: ${log.browser}\n`;
            if (log.referrer) content += `  Referrer: ${log.referrer}\n`;
            content += '\n';
        });
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `devlomatix_visitor_telemetry_${format(new Date(), 'yyyyMMdd_HHmmss')}.log`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(`Exported ${displayedLogs.length} visitor records`);
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
                await axios.delete(`/api/workspace/${workspaceId}/system/visitors?ids=${logToDelete.join(',')}`);
                toast.success(`Deleted ${logToDelete.length} visitor entries`);
                setSelectedLogIds([]);
            } else {
                await axios.delete(`/api/workspace/${workspaceId}/system/visitors?id=${logToDelete}`);
                toast.success("Visitor entry deleted");
                setSelectedLogIds(prev => prev.filter(id => id !== logToDelete));
            }
            fetchVisitorLogs();
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete visitor record");
        } finally {
            setLogToDelete(null);
        }
    };

    const handleCopyText = (e, text, msg) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        toast.success(msg || "Copied to clipboard");
    };

    const getDeviceIcon = (device) => {
        if (device === 'Mobile') return <Smartphone size={12} className="text-amber-400" />;
        if (device === 'Tablet') return <Tablet size={12} className="text-purple-400" />;
        return <Monitor size={12} className="text-sky-400" />;
    };

    return (
        <div className="space-y-5">
            {/* Header Toolbar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-bold flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <Globe className="text-emerald-400 w-4 h-4" />
                        </div>
                        Site Visitors & Traffic Telemetry
                    </h2>
                    <p className="text-xs text-muted-foreground font-medium mt-1">
                        Real-time visitor locations, devices, page paths, referrers, and audience insights.
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
                        className={`h-8 text-[10px] font-bold transition-all ${autoRefresh ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' : ''}`}
                    >
                        <Radio className={`mr-1.5 h-3 w-3 ${autoRefresh ? 'text-emerald-400 animate-pulse' : ''}`} />
                        {autoRefresh ? `Live (${countdown}s)` : 'Auto-Refresh'}
                    </Button>
                    <Button variant="outline" onClick={handleExportLogs} disabled={displayedLogs.length === 0} size="sm" className="h-8 text-[10px] font-bold">
                        <Download className="mr-1.5 h-3 w-3 text-muted-foreground" /> Export
                    </Button>
                    <Button variant="outline" onClick={fetchVisitorLogs} disabled={isLoading} size="sm" className="h-8 text-[10px] font-bold">
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

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card className="bg-card/50 border-border/40 p-4 rounded-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase">Total Page Views</div>
                            <div className="text-2xl font-black mt-1">{stats.totalVisits}</div>
                        </div>
                        <div className="w-10 h-10 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <Activity className="w-5 h-5 text-emerald-400" />
                        </div>
                    </div>
                </Card>

                <Card className="bg-card/50 border-border/40 p-4 rounded-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase">Unique Visitors</div>
                            <div className="text-2xl font-black mt-1 text-sky-400">{stats.uniqueVisitors}</div>
                        </div>
                        <div className="w-10 h-10 rounded-md bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                            <Users className="w-5 h-5 text-sky-400" />
                        </div>
                    </div>
                </Card>

                <Card className="bg-card/50 border-border/40 p-4 rounded-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase">Top Location</div>
                            <div className="text-base font-bold mt-1 flex items-center gap-1.5 truncate max-w-[140px]">
                                <span>{getFlagEmoji(stats.topCountries?.[0]?.code)}</span>
                                <span className="truncate">{stats.topCountries?.[0]?.country || 'N/A'}</span>
                            </div>
                        </div>
                        <div className="w-10 h-10 rounded-md bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                            <Compass className="w-5 h-5 text-purple-400" />
                        </div>
                    </div>
                </Card>

                <Card className="bg-card/50 border-border/40 p-4 rounded-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase">Top Visited Path</div>
                            <div className="text-sm font-bold font-mono mt-1 truncate max-w-[140px] text-amber-400">
                                {stats.topPages?.[0]?.path || '/'}
                            </div>
                        </div>
                        <div className="w-10 h-10 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                            <ExternalLink className="w-5 h-5 text-amber-400" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Filter & Command Bar */}
            <div className="flex flex-col xl:flex-row items-center justify-between gap-3 bg-card/60 border border-border/60 p-2.5 rounded-md shadow-inner backdrop-blur-sm">
                <div className="flex items-center w-full xl:w-auto overflow-x-auto scrollbar-hide gap-2">
                    {/* Device Select */}
                    <Select value={filters.device} onValueChange={(val) => setFilters(prev => ({ ...prev, device: val }))}>
                        <SelectTrigger className="h-8 w-[130px] text-[10px] font-bold bg-background rounded-sm">
                            <SelectValue placeholder="All Devices" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Devices</SelectItem>
                            <SelectItem value="Desktop">Desktop</SelectItem>
                            <SelectItem value="Mobile">Mobile</SelectItem>
                            <SelectItem value="Tablet">Tablet</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Date Range Select */}
                    <Select value={filters.dateRange} onValueChange={(val) => setFilters(prev => ({ ...prev, dateRange: val }))}>
                        <SelectTrigger className="h-8 w-[130px] text-[10px] font-bold bg-background rounded-sm">
                            <SelectValue placeholder="Date Range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Time</SelectItem>
                            <SelectItem value="24h">Last 24 Hours</SelectItem>
                            <SelectItem value="7d">Last 7 Days</SelectItem>
                            <SelectItem value="30d">Last 30 Days</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center w-full xl:w-auto gap-3">
                    <div className="relative w-full xl:w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
                        <Input
                            placeholder="Search IP, location, page path, browser..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-9 h-9 w-full text-xs font-medium bg-background shadow-inner border-border/60 focus-visible:ring-1 focus-visible:ring-emerald-500 rounded-md"
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

            {/* Visitors Table */}
            <Card className="border-border/60 shadow-sm overflow-hidden rounded-md">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/20">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[40px] px-4 py-3.5">
                                    <Checkbox checked={displayedLogs.length > 0 && selectedLogIds.length === displayedLogs.length} onCheckedChange={toggleSelectAll} aria-label="Select all" />
                                </TableHead>
                                <TableHead className="w-[140px] text-[9px] py-3.5 font-bold tracking-widest uppercase text-muted-foreground/70">Location</TableHead>
                                <TableHead className="w-[130px] text-[9px] py-3.5 font-bold tracking-widest uppercase text-muted-foreground/70">IP Address</TableHead>
                                <TableHead className="text-[9px] py-3.5 font-bold tracking-widest uppercase text-muted-foreground/70">Visited Path</TableHead>
                                <TableHead className="w-[140px] text-[9px] py-3.5 font-bold tracking-widest uppercase text-muted-foreground/70">Device / Browser</TableHead>
                                <TableHead className="w-[150px] text-right text-[9px] py-3.5 font-bold tracking-widest uppercase text-muted-foreground/70">Timestamp</TableHead>
                                <TableHead className="w-[80px] text-right py-3.5"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-52 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
                                            <span className="text-[10px] tracking-[0.3em] text-muted-foreground/50 font-bold">LOADING VISITOR TELEMETRY...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : displayedLogs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-52 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-30">
                                            <Globe className="w-12 h-12" />
                                            <span className="text-sm font-bold">No site visitor activity recorded yet</span>
                                            <span className="text-[10px] text-muted-foreground">Visitor logs will automatically populate as users browse public and workspace pages.</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                displayedLogs.map((log) => (
                                    <TableRow key={log.id} className="group cursor-pointer hover:bg-muted/20 border-b border-border/20 transition-all" onClick={() => setSelectedLog(log)}>
                                        <TableCell className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                            <Checkbox checked={selectedLogIds.includes(log.id)} onCheckedChange={(checked) => setSelectedLogIds(prev => checked ? [...prev, log.id] : prev.filter(id => id !== log.id))} />
                                        </TableCell>

                                        {/* Location */}
                                        <TableCell className="py-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-base">{getFlagEmoji(log.countryCode)}</span>
                                                <div>
                                                    <div className="text-[11px] font-bold leading-none">{log.country || 'Unknown'}</div>
                                                    <div className="text-[9px] text-muted-foreground/60 mt-0.5">{log.city || 'Unknown City'}</div>
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* IP */}
                                        <TableCell className="py-3">
                                            <div className="flex items-center gap-1">
                                                <span className="font-mono text-xs font-semibold text-foreground/80">{log.ipAddress || '127.0.0.1'}</span>
                                                <Button variant="ghost" size="sm" className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => handleCopyText(e, log.ipAddress, "IP address copied")}>
                                                    <Copy size={10} className="text-muted-foreground" />
                                                </Button>
                                            </div>
                                        </TableCell>

                                        {/* Path */}
                                        <TableCell className="py-3">
                                            <div className="max-w-[320px]">
                                                <div className="font-mono text-[11px] font-bold text-emerald-400 truncate">{log.path}</div>
                                                {log.title && (
                                                    <div className="text-[9px] text-muted-foreground truncate mt-0.5">{log.title}</div>
                                                )}
                                            </div>
                                        </TableCell>

                                        {/* Device / Browser */}
                                        <TableCell className="py-3">
                                            <div className="flex items-center gap-1.5">
                                                {getDeviceIcon(log.device)}
                                                <span className="text-[10px] font-bold tracking-wider">{log.browser || 'Browser'}</span>
                                                <span className="text-[9px] text-muted-foreground/50 font-mono">({log.os || 'OS'})</span>
                                            </div>
                                        </TableCell>

                                        {/* Timestamp */}
                                        <TableCell className="py-3 text-right">
                                            <div className="text-[10px] font-bold text-muted-foreground/80 font-mono">{format(new Date(log.createdAt), 'HH:mm:ss')}</div>
                                            <div className="text-[8px] text-muted-foreground/40 font-medium">{formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}</div>
                                        </TableCell>

                                        {/* Actions */}
                                        <TableCell className="py-3 text-right pr-3">
                                            <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); setSelectedLog(log); }}>
                                                    <Eye size={12} />
                                                </Button>
                                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={(e) => triggerDeleteSingleLog(e, log.id)}>
                                                    <Trash2 size={12} />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Pagination */}
            <div className="flex items-center justify-between px-1">
                <p className="text-[10px] font-bold text-muted-foreground">
                    {displayedLogs.length} of {pagination.total} visitor records
                </p>
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

            {/* Visitor Inspector Dialog */}
            <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
                <DialogContent className="max-w-2xl bg-card border border-border shadow-2xl overflow-hidden flex flex-col max-h-[85vh] rounded-md">
                    {selectedLog && (
                        <>
                            <DialogHeader className="p-6 pb-4 border-b border-border/30">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">{getFlagEmoji(selectedLog.countryCode)}</span>
                                        <Badge variant="outline" className="text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                                            {selectedLog.country || 'Unknown Country'}
                                        </Badge>
                                        <Badge variant="outline" className="text-[8px] font-mono tracking-wider px-2 py-0.5">
                                            {selectedLog.device} · {selectedLog.browser}
                                        </Badge>
                                    </div>
                                    <button
                                        onClick={(e) => handleCopyText(e, selectedLog.id, "Visitor ID copied")}
                                        className="flex items-center gap-1.5 text-[9px] text-muted-foreground/60 hover:text-foreground transition-colors bg-muted/30 px-2 py-1 rounded-sm border border-border/30"
                                    >
                                        <Hash size={10} /> {selectedLog.id.slice(0, 12)}...
                                        <Copy size={9} className="ml-1 opacity-50" />
                                    </button>
                                </div>
                                <DialogTitle className="text-base font-bold font-mono text-emerald-400 leading-snug">
                                    {selectedLog.path}
                                </DialogTitle>
                                <DialogDescription className="text-[10px] font-medium font-mono mt-1">
                                    {format(new Date(selectedLog.createdAt), 'EEEE, MMMM do yyyy | HH:mm:ss.SSS')}
                                    <span className="ml-2 opacity-50">({formatDistanceToNow(new Date(selectedLog.createdAt), { addSuffix: true })})</span>
                                </DialogDescription>
                            </DialogHeader>

                            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 scrollbar-hide">
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-muted/30 p-3 rounded-md border border-border/30">
                                        <span className="text-[8px] text-muted-foreground/60 font-bold tracking-widest uppercase block mb-1.5">IP Address</span>
                                        <div className="font-mono text-xs font-bold text-foreground">{selectedLog.ipAddress || '127.0.0.1'}</div>
                                    </div>
                                    <div className="bg-muted/30 p-3 rounded-md border border-border/30">
                                        <span className="text-[8px] text-muted-foreground/60 font-bold tracking-widest uppercase block mb-1.5">City / Region</span>
                                        <div className="font-bold text-xs">{selectedLog.city || 'Unknown'}, {selectedLog.region || 'N/A'}</div>
                                    </div>
                                    <div className="bg-muted/30 p-3 rounded-md border border-border/30">
                                        <span className="text-[8px] text-muted-foreground/60 font-bold tracking-widest uppercase block mb-1.5">Session ID</span>
                                        <div className="font-mono text-[10px] font-bold truncate text-sky-400">{selectedLog.sessionId || 'N/A'}</div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <span className="text-[9px] text-muted-foreground/60 font-bold tracking-widest uppercase">System Metadata</span>
                                    <div className="bg-[#0d1117] p-4 rounded-md overflow-hidden shadow-inner border border-white/5 space-y-2">
                                        <div className="text-[10px] font-mono text-[#79c0ff] leading-relaxed">
                                            <div><span className="text-muted-foreground">User Agent:</span> {selectedLog.userAgent}</div>
                                            {selectedLog.referrer && <div><span className="text-muted-foreground">Referrer:</span> {selectedLog.referrer}</div>}
                                            {selectedLog.latitude !== null && <div><span className="text-muted-foreground">Coordinates:</span> Lat {selectedLog.latitude}, Lng {selectedLog.longitude}</div>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!logToDelete} onOpenChange={(open) => !open && setLogToDelete(null)}>
                <AlertDialogContent className="rounded-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <Trash2 className="w-4 h-4 text-destructive" />
                            Confirm Visitor Record Deletion
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-xs">
                            {Array.isArray(logToDelete)
                                ? `Delete ${logToDelete.length} selected visitor log entries?`
                                : "Permanently remove this site visitor telemetry record?"
                            }
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="text-[10px] font-bold tracking-wider rounded-md h-8">CANCEL</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDeleteLog} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-[10px] font-bold tracking-wider rounded-md h-8">
                            DELETE
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
