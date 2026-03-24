'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import axios from "@/utils/axios";
import { 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle, 
    CardDescription 
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
    Search
} from "lucide-react";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription 
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";

export default function LogPage() {
    const params = useParams();
    const workspaceId = params?.workspaceId;

    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
    const [filters, setFilters] = useState({ level: 'ALL', type: 'ALL' });
    const [selectedLog, setSelectedLog] = useState(null);

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

    const getLevelBadge = (level) => {
        switch (level) {
            case 'ERROR': return <Badge variant="destructive" className="font-bold flex items-center gap-1.5"><AlertCircle size={12} /> ERROR</Badge>;
            case 'WARNING': return <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50 font-bold flex items-center gap-1.5"><AlertTriangle size={12} /> WARNING</Badge>;
            case 'SUCCESS': return <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50 font-bold flex items-center gap-1.5"><CheckCircle2 size={12} /> SUCCESS</Badge>;
            case 'INFO': return <Badge variant="outline" className="border-blue-500 text-blue-600 bg-blue-50 font-bold flex items-center gap-1.5"><Info size={12} /> INFO</Badge>;
            default: return <Badge variant="secondary">{level}</Badge>;
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'CRON': return <RefreshCcw size={14} className="text-muted-foreground mr-2" />;
            case 'TRIGGER': return <Terminal size={14} className="text-muted-foreground mr-2" />;
            case 'AI': return <RefreshCcw size={14} className="text-primary mr-2" />;
            default: return <Info size={14} className="text-muted-foreground mr-2" />;
        }
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
                        <Terminal className="text-primary h-8 w-8" /> System Observation
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium">
                        Monitor system triggers, cron jobs, and error reports in real-time.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={fetchLogs} disabled={isLoading} size="sm" className="font-bold uppercase tracking-wider text-[10px]">
                        <RefreshCcw className={`mr-2 h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
                    </Button>
                    <Button variant="destructive" onClick={handleClearLogs} size="sm" className="font-bold uppercase tracking-wider text-[10px]">
                        <Trash2 className="mr-2 h-3.5 w-3.5" /> Clear Old Logs
                    </Button>
                </div>
            </div>

            {/* Filter Bar */}
            <Card className="bg-card/50 backdrop-blur-md border-border/100 shadow-sm overflow-hidden">
                <CardContent className="p-4 flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Search size={14} className="text-muted-foreground" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Filter By:</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-muted-foreground/60">SEVERITY</span>
                        <Select value={filters.level} onValueChange={(val) => setFilters(prev => ({ ...prev, level: val }))}>
                            <SelectTrigger className="h-8 w-[140px] text-[11px] font-bold bg-background">
                                <SelectValue placeholder="All Levels" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Levels</SelectItem>
                                <SelectItem value="INFO">Info</SelectItem>
                                <SelectItem value="SUCCESS">Success</SelectItem>
                                <SelectItem value="WARNING">Warning</SelectItem>
                                <SelectItem value="ERROR">Error</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-muted-foreground/60">MODULE</span>
                        <Select value={filters.type} onValueChange={(val) => setFilters(prev => ({ ...prev, type: val }))}>
                            <SelectTrigger className="h-8 w-[140px] text-[11px] font-bold bg-background">
                                <SelectValue placeholder="All Types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Modules</SelectItem>
                                <SelectItem value="CRON">Cron Jobs</SelectItem>
                                <SelectItem value="TRIGGER">Triggers</SelectItem>
                                <SelectItem value="AI">AI Integration</SelectItem>
                                <SelectItem value="SYSTEM">System Core</SelectItem>
                                <SelectItem value="AUTH">Authentication</SelectItem>
                                <SelectItem value="WEBHOOK">Webhooks</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Table Area */}
            <Card className="border-border/100 shadow-xl overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[100px] text-[10px] font-black tracking-widest uppercase py-4">Status</TableHead>
                                <TableHead className="w-[120px] text-[10px] font-black tracking-widest uppercase py-4">Module</TableHead>
                                <TableHead className="text-[10px] font-black tracking-widest uppercase py-4">Message</TableHead>
                                <TableHead className="w-[180px] text-right text-[10px] font-black tracking-widest uppercase py-4">Timestamp</TableHead>
                                <TableHead className="w-[60px] text-right py-4"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-48 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-40">
                                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Synchronizing Diagnostics...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : logs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-48 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-30">
                                            <Terminal className="h-10 w-10" />
                                            <span className="text-sm font-bold">No system logs discovered with these filters</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logs.map((log) => (
                                    <TableRow key={log.id} className="group cursor-pointer hover:bg-muted/20 border-b border-border/30 transition-colors" onClick={() => setSelectedLog(log)}>
                                        <TableCell className="py-4 font-medium uppercase text-[10px]">
                                            {getLevelBadge(log.level)}
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex items-center font-black text-[10px] tracking-tight uppercase">
                                                {getTypeIcon(log.type)}
                                                {log.type}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 font-medium text-[12px] max-w-[400px] truncate leading-relaxed">
                                            {log.message}
                                        </TableCell>
                                        <TableCell className="py-4 text-right text-[11px] font-bold text-muted-foreground/80 font-mono">
                                            {format(new Date(log.createdAt), 'MMM dd, HH:mm:ss')}
                                        </TableCell>
                                        <TableCell className="py-4 text-right pr-4">
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Eye size={14} />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Pagination */}
            <div className="flex items-center justify-between px-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Showing {logs.length} of {pagination.total} records
                </p>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        disabled={pagination.page <= 1 || isLoading}
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        className="h-8 w-8 p-0 rounded-full border bg-background"
                    >
                        <ChevronLeft size={16} />
                    </Button>
                    <div className="flex items-center gap-1.5 px-3">
                        <span className="text-[11px] font-black">{pagination.page}</span>
                        <span className="text-[11px] font-bold text-muted-foreground/40">/</span>
                        <span className="text-[11px] font-bold text-muted-foreground/40">{pagination.pages}</span>
                    </div>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        disabled={pagination.page >= pagination.pages || isLoading}
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        className="h-8 w-8 p-0 rounded-full border bg-background"
                    >
                        <ChevronRight size={16} />
                    </Button>
                </div>
            </div>

            {/* Log Inspector Dialog */}
            <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
                <DialogContent className="max-w-2xl bg-card border shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                    <DialogHeader className="p-6 pb-2">
                        <div className="flex items-center justify-between mb-2">
                            {selectedLog && getLevelBadge(selectedLog.level)}
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                Log ID: {selectedLog?.id?.slice(0, 8)}...
                            </span>
                        </div>
                        <DialogTitle className="text-xl font-bold tracking-tight">
                            {selectedLog?.message}
                        </DialogTitle>
                        <DialogDescription className="text-xs font-medium">
                            {selectedLog && format(new Date(selectedLog.createdAt), 'EEEE, MMMM do yyyy | HH:mm:ss.SSS')}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 scrollbar-hide">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-muted/40 p-4 rounded-xl border border-border/50">
                                <span className="text-[10px] font-black uppercase text-muted-foreground block mb-2 tracking-widest">Target Module</span>
                                <div className="flex items-center font-bold text-sm">
                                    {selectedLog && getTypeIcon(selectedLog.type)}
                                    {selectedLog?.type}
                                </div>
                            </div>
                            <div className="bg-muted/40 p-4 rounded-xl border border-border/50">
                                <span className="text-[10px] font-black uppercase text-muted-foreground block mb-2 tracking-widest">Workspace ID</span>
                                <div className="font-mono text-[11px] font-bold truncate">
                                    {selectedLog?.workspaceId || 'GLOBAL / SYSTEM'}
                                </div>
                            </div>
                        </div>

                        {selectedLog?.details && (
                            <div className="space-y-2">
                                <span className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest">Technical Metadata (JSON)</span>
                                <div className="bg-black/95 p-6 rounded-xl overflow-hidden shadow-inner border border-white/5 relative group">
                                    <pre className="text-[11px] font-mono text-blue-400 overflow-x-auto scrollbar-hide leading-relaxed">
                                        {JSON.stringify(selectedLog.details, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}