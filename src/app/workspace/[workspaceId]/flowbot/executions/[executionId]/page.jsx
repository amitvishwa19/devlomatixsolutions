import React from 'react';
import { db } from '@/lib/db';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow, format } from 'date-fns';
import { ChevronLeft, CheckCircle2, XCircle, Activity, Clock, Terminal, Box, Play } from 'lucide-react';
import Link from 'next/link';

export default async function ExecutionPage({ params }) {
    const { workspaceId, executionId } = await params;

    const execution = await db.workflowExecution.findUnique({
        where: { id: executionId },
        include: {
            workflow: {
                select: { id: true, name: true, description: true }
            }
        }
    });

    if (!execution) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
                <XCircle className="w-12 h-12 text-muted-foreground opacity-50" />
                <h2 className="text-xl font-bold">Execution Not Found</h2>
                <p className="text-muted-foreground">The execution you are looking for does not exist or has been deleted.</p>
                <Link href={`/workspace/${workspaceId}/flowbot/executions`}>
                    <Button variant="outline">
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Back to Executions
                    </Button>
                </Link>
            </div>
        );
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'SUCCESS': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
            case 'FAILED': return <XCircle className="w-4 h-4 text-rose-500" />;
            case 'RUNNING': return <Activity className="w-4 h-4 text-amber-500 animate-pulse" />;
            default: return <Clock className="w-4 h-4 text-muted-foreground" />;
        }
    };

    const getStatusVariant = (status) => {
        switch (status) {
            case 'SUCCESS': return 'success';
            case 'FAILED': return 'destructive';
            case 'RUNNING': return 'warning';
            default: return 'secondary';
        }
    };

    const logsArray = Array.isArray(execution.logs) ? execution.logs : [];
    
    // Fallbacks just in case nodes are not array
    const nodesArray = Array.isArray(execution.nodes) ? execution.nodes : [];

    const duration = execution.finishedAt 
        ? ((new Date(execution.finishedAt) - new Date(execution.startedAt)) / 1000).toFixed(2) + 's'
        : '-';

    return (
        <div className="flex flex-col h-full bg-background/50 overflow-auto p-8 space-y-8">
            <div className="flex flex-col gap-4">
                <Link href={`/workspace/${workspaceId}/flowbot/executions`} className="self-start">
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back to Executions
                    </Button>
                </Link>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-6">
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            <Play className="w-5 h-5 text-primary" />
                            Execution Details
                        </h1>
                        <p className="text-xs text-muted-foreground mt-1">
                            Viewing log trace and status for execution ID: {execution.id}
                        </p>
                    </div>
                    <div className="flex items-center gap-4 bg-muted/30 px-4 py-2 rounded-lg border border-border/50">
                        <div className="flex items-center gap-2 mr-4 border-r border-border/50 pr-4">
                            <span className="text-xs text-muted-foreground font-medium uppercase">Status</span>
                            <div className="flex items-center gap-1.5">
                                {getStatusIcon(execution.status)}
                                <Badge variant={getStatusVariant(execution.status)} className="capitalize text-[10px]">
                                    {execution.status.toLowerCase()}
                                </Badge>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground font-medium uppercase">Duration</span>
                            <span className="text-sm font-semibold">{duration}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Sidebar details */}
                <div className="space-y-6 md:col-span-1">
                    <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Box className="w-4 h-4 text-primary" />
                                Workflow Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-xs text-muted-foreground mb-1 uppercase font-medium">Name</p>
                                <p className="text-sm font-medium">{execution.workflow?.name}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1 uppercase font-medium">Description</p>
                                <p className="text-sm text-balance">{execution.workflow?.description || 'No description provided.'}</p>
                            </div>
                            <div className="pt-4 mt-2 border-t border-border/50">
                                <Link href={`/workspace/${workspaceId}/flowbot/${execution.workflow?.id}`}>
                                    <Button className="w-full h-8 text-xs font-semibold" variant="secondary">
                                        Open Flow Editor
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Clock className="w-4 h-4 text-blue-500" />
                                Timing
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-xs text-muted-foreground mb-1 uppercase font-medium">Started At</p>
                                <p className="text-sm font-medium">{format(new Date(execution.startedAt), 'MMM dd, yyyy HH:mm:ss')}</p>
                                <p className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(execution.startedAt), { addSuffix: true })}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1 uppercase font-medium">Finished At</p>
                                <p className="text-sm font-medium">
                                    {execution.finishedAt ? format(new Date(execution.finishedAt), 'MMM dd, yyyy HH:mm:ss') : '-'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content (Logs) */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="bg-[#0f111a] text-gray-300 border-[#1f2233] h-full min-h-[400px] flex flex-col font-mono text-sm overflow-hidden shadow-xl shadow-black/20">
                        <CardHeader className="border-b border-[#1f2233] bg-[#0c0d14] px-4 py-3">
                            <CardTitle className="text-xs font-semibold text-gray-400 flex items-center gap-2">
                                <Terminal className="w-4 h-4" />
                                Execution Logs
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 overflow-auto flex-1">
                            {logsArray.length === 0 ? (
                                <div className="p-6 text-center text-gray-500 text-xs">
                                    No logs recorded for this execution.
                                </div>
                            ) : (
                                <div className="divide-y divide-[#1f2233]">
                                    {logsArray.map((log, index) => (
                                        <div key={index} className="px-4 py-2 hover:bg-[#1a1d2d] transition-colors flex gap-4 text-xs">
                                            <span className="text-gray-600 select-none w-16 shrink-0">{format(new Date(log.timestamp || execution.startedAt), 'HH:mm:ss')}</span>
                                            
                                            {/* We support various log formats. Render accordingly */}
                                            {log.level === 'error' || log.type === 'error' ? (
                                                <span className="text-rose-400 font-semibold w-12 shrink-0">ERR</span>
                                            ) : log.level === 'warn' ? (
                                                <span className="text-amber-400 font-semibold w-12 shrink-0">WARN</span>
                                            ) : (
                                                <span className="text-emerald-400 font-semibold w-12 shrink-0">INFO</span>
                                            )}
                                            
                                            <div className="flex-1 wrap-break-word">
                                                <span className="text-gray-300">[{log.nodeType || log.nodeId || 'System'}] </span>
                                                <span className="text-gray-400 ml-1">{log.message || (typeof log === 'string' ? log : JSON.stringify(log))}</span>
                                                
                                                {/* Details payload if present */}
                                                {(log.details || log.output || log.data) && (
                                                    <pre className="mt-2 p-2 bg-[#0c0d14] border border-[#1f2233] rounded text-[10px] text-gray-400 whitespace-pre-wrap overflow-x-auto">
                                                        {JSON.stringify(log.details || log.output || log.data, null, 2)}
                                                    </pre>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
