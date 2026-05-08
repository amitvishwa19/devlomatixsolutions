'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, Search, Filter, Eye, X, MessageSquare, Phone, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { useAction } from "@/hooks/use-action";
import { getExecutions } from "../_actions/get-executions";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from 'date-fns';

const statusConfig = {
    PROCESSING: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Processing' },
    COMPLETED: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Completed' },
    FAILED: { icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20', label: 'Failed' }
};

export function ExecutionLogs({ workspaceId, botFlowId }) {
    const [executions, setExecutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedExecution, setSelectedExecution] = useState(null);
    const [filter, setFilter] = useState('all');

    const { execute: fetchExecutions, isLoading: isFetching } = useAction(getExecutions, {
        onSuccess: (data) => {
            setExecutions(data.executions || []);
            setLoading(false);
        },
        onError: () => setLoading(false)
    });

    const loadExecutions = () => {
        setLoading(true);
        fetchExecutions({ workspaceId, botFlowId, limit: 50 });
    };

    useEffect(() => {
        loadExecutions();
    }, [workspaceId, botFlowId]);

    const filteredExecutions = executions.filter(exec => {
        const matchesSearch = !search || exec.phone?.includes(search);
        const matchesFilter = filter === 'all' || exec.status === filter;
        return matchesSearch && matchesFilter;
    });

    const getStatusBadge = (status) => {
        const config = statusConfig[status] || statusConfig.PROCESSING;
        return (
            <Badge variant="outline" className={cn("text-[10px] font-bold", config.bg, config.color, config.border)}>
                <config.icon className="h-3 w-3 mr-1" />
                {config.label}
            </Badge>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        <Input
                            placeholder="Search by phone..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 bg-white/5 border-white/10"
                        />
                    </div>
                    <div className="flex gap-2">
                        {['all', 'PROCESSING', 'COMPLETED', 'FAILED'].map((f) => (
                            <Button
                                key={f}
                                variant={filter === f ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFilter(f)}
                                className={cn(
                                    "text-xs font-semibold capitalize",
                                    filter === f ? "bg-primary" : "bg-white/5 border-white/10"
                                )}
                            >
                                {f === 'all' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
                            </Button>
                        ))}
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={loadExecutions}
                    disabled={isFetching}
                    className="bg-white/5 border-white/10"
                >
                    <RefreshCw className={cn("h-4 w-4 mr-2", isFetching && "animate-spin")} />
                    Refresh
                </Button>
            </div>

            {filteredExecutions.length === 0 ? (
                <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-12 flex flex-col items-center">
                        <AlertCircle className="h-12 w-12 text-zinc-600 mb-4" />
                        <h3 className="text-lg font-bold text-white">No executions found</h3>
                        <p className="text-sm text-zinc-500 mt-2">
                            {search || filter !== 'all'
                                ? "Try adjusting your filters"
                                : "Executions will appear here when users interact with your chatbot"}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-2">
                    {filteredExecutions.map((exec, idx) => (
                        <Card
                            key={exec.id}
                            className={cn(
                                "bg-white/5 border-white/10 cursor-pointer hover:bg-white/10 transition-all",
                                selectedExecution?.id === exec.id && "border-primary/50"
                            )}
                            onClick={() => setSelectedExecution(exec)}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-white/5 rounded-xl">
                                            <Phone className="h-4 w-4 text-zinc-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">{exec.phone}</p>
                                            <p className="text-[10px] text-zinc-500 flex items-center gap-2 mt-1">
                                                <MessageSquare className="h-3 w-3" />
                                                {exec.message || 'No message'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {exec.botFlow && (
                                            <span className="text-xs text-zinc-400">{exec.botFlow.name}</span>
                                        )}
                                        {getStatusBadge(exec.status)}
                                        <span className="text-[10px] text-zinc-600">
                                            {formatDistanceToNow(new Date(exec.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Execution Detail Modal */}
            {selectedExecution && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <Card className="w-full max-w-2xl bg-[#0f0f1a] border-white/10">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-white/5">
                            <CardTitle className="text-white flex items-center gap-3">
                                <Eye className="h-5 w-5" />
                                Execution Details
                            </CardTitle>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSelectedExecution(null)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase">Phone</p>
                                    <p className="text-sm text-white font-medium">{selectedExecution.phone}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase">Status</p>
                                    {getStatusBadge(selectedExecution.status)}
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase">Flow</p>
                                    <p className="text-sm text-white font-medium">{selectedExecution.botFlow?.name || 'Unknown'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase">Started</p>
                                    <p className="text-sm text-white font-medium">
                                        {new Date(selectedExecution.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {selectedExecution.message && (
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase">Incoming Message</p>
                                    <p className="text-sm text-white bg-white/5 p-3 rounded-lg">
                                        {selectedExecution.message}
                                    </p>
                                </div>
                            )}

                            {selectedExecution.error && (
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-rose-500 uppercase">Error</p>
                                    <p className="text-sm text-rose-400 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
                                        {selectedExecution.error}
                                    </p>
                                </div>
                            )}

                            {selectedExecution.responses?.length > 0 && (
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase">Bot Responses</p>
                                    <div className="space-y-2">
                                        {selectedExecution.responses.map((resp, i) => (
                                            <p key={i} className="text-sm text-emerald-400 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                                                {resp}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}