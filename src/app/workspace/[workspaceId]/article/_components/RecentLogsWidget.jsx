'use client';

import { useState, useEffect } from 'react';
import axios from "@/utils/axios";
import { Badge } from "@/components/ui/badge";
import { 
    Terminal, 
    AlertCircle, 
    CheckCircle2, 
    Info, 
    AlertTriangle,
    Loader2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const RecentLogsWidget = ({ workspaceId }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecentLogs = async () => {
            if (!workspaceId) return;
            try {
                const res = await axios.get(`/api/workspace/${workspaceId}/system/logs?limit=5`);
                setLogs(res.data.logs);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecentLogs();
        // Refresh every minute
        const interval = setInterval(fetchRecentLogs, 60000);
        return () => clearInterval(interval);
    }, [workspaceId]);

    if (loading && logs.length === 0) return null;

    const getLevelColor = (level) => {
        switch (level) {
            case 'ERROR': return 'text-rose-500';
            case 'WARNING': return 'text-amber-500';
            case 'SUCCESS': return 'text-emerald-500';
            default: return 'text-primary';
        }
    };

    const getLevelIcon = (level) => {
        switch (level) {
            case 'ERROR': return <AlertCircle size={12} />;
            case 'WARNING': return <AlertTriangle size={12} />;
            case 'SUCCESS': return <CheckCircle2 size={12} />;
            default: return <Info size={12} />;
        }
    };

    return (
        <div className="bg-card/30 backdrop-blur-md rounded-xl border border-border/60 overflow-hidden mb-6 group transition-all hover:bg-card/50">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border/30 bg-muted/20">
                <div className="flex items-center gap-2">
                    <Terminal size={12} className="text-primary opacity-70" />
                    <span className="text-[9px] font-black text-muted-foreground">Recent System Pulse</span>
                </div>
                {loading && <Loader2 size={10} className="animate-spin text-muted-foreground opacity-50" />}
            </div>
            <div className="p-3 px-4 flex items-center gap-8 overflow-x-auto scrollbar-hide">
                {logs.length === 0 ? (
                    <span className="text-[10px] font-bold text-muted-foreground italic opacity-50">No recent activity detected</span>
                ) : (
                    logs.map((log) => (
                        <div key={log.id} className="flex items-center gap-2.5 whitespace-nowrap shrink-0 border-r border-border/20 pr-8 last:border-0 last:pr-0">
                            <div className={getLevelColor(log.level)}>
                                {getLevelIcon(log.level)}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[11px] font-bold text-foreground/90 leading-none mb-1">
                                    {log.message.length > 40 ? log.message.slice(0, 40) + '...' : log.message}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-[8px] font-black text-muted-foreground/50 tracking-tighter">
                                        {log.type}
                                    </span>
                                    <span className="text-[8px] font-bold text-primary/40">
                                        • {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
