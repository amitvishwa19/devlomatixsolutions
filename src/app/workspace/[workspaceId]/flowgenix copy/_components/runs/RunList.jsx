"use client";

import { 
    History, 
    RefreshCw,
    Play,
    ScrollText,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function RunList({ runs, loading, onRefresh, onRerun, onOpenLogs, rerunningId }) {
    return (
        <div className="flex flex-col h-full space-y-4">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-lg font-semibold tracking-tight">Execution History</h2>
                    <p className="text-xs text-muted-foreground font-medium">Real-time log of all workflow runs and triggers.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-bold h-5">{runs.length} RUNS</Badge>
                    <Button size="sm" variant="ghost" onClick={onRefresh} disabled={loading} className="h-8 w-8 p-0">
                        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden rounded-xl border border-border/60 bg-card/30">
                <ScrollArea className="h-full">
                    <table className="w-full text-xs">
                        <thead className="sticky top-0 bg-muted/90 backdrop-blur z-10">
                            <tr className="border-b border-border/60 text-left font-bold tracking-tighter text-muted-foreground">
                                <th className="py-3 pl-6">Started At</th>
                                <th>Workflow</th>
                                <th>Status</th>
                                <th>Trigger</th>
                                <th className="pr-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                            {loading && !runs.length && (
                                <tr><td colSpan={5} className="py-20 text-center text-muted-foreground animate-pulse font-mono">Initializing stream...</td></tr>
                            )}
                            {runs.length === 0 && !loading && (
                                <tr><td colSpan={5} className="py-20 text-center text-muted-foreground font-mono">No runs found</td></tr>
                            )}
                            {runs.map((r) => (
                                <tr key={r.id} className="hover:bg-muted/30 transition-colors group">
                                    <td className="py-3 pl-6">
                                        <div className="font-medium">
                                            {new Date(r.startedAt).toLocaleDateString()}
                                            <span className="ml-2 font-mono text-[10px] opacity-40">
                                                {new Date(r.startedAt).toLocaleTimeString([], { hour12: false })}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="font-bold text-sm text-primary/80 truncate max-w-[200px]">
                                            {r.workflow?.name || r.workflowId.slice(0, 8)}
                                        </div>
                                    </td>
                                    <td>
                                        <Badge variant="outline" className={cn(
                                            "text-[9px] h-5 rounded-sm font-bold tracking-tighter",
                                            r.status === 'success' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                r.status === 'error' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                    'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                        )}>
                                            {r.status}
                                        </Badge>
                                    </td>
                                    <td>
                                        <Badge variant="outline" className="text-[9px] h-5 rounded-sm font-bold tracking-tighter opacity-60">
                                            {r.trigger || 'manual'}
                                        </Badge>
                                    </td>
                                    <td className="pr-6 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button size="sm" variant="ghost" onClick={() => onRerun(r)} disabled={rerunningId === r.id} className="gap-1.5 font-mono text-[10px] h-8">
                                                {rerunningId === r.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                                                RERUN
                                            </Button>
                                            <Button size="sm" variant="ghost" onClick={() => onOpenLogs(r.id)} className="gap-1.5 font-mono text-[10px] h-8">
                                                <ScrollText className="h-3.5 w-3.5" /> LOGS
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </ScrollArea>
            </div>
        </div>
    );
}
