import React from 'react';
import { db } from '@/lib/db';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow, format } from 'date-fns';
import { Play, CheckCircle2, XCircle, Clock, ChevronRight, Activity } from 'lucide-react';
import Link from 'next/link';

export default async function ExecutionsPage({ params }) {
    const { workspaceId } = await params;

    const executions = await db.workflowExecution.findMany({
        where: {
            workflow: {
                workspaceId: workspaceId
            }
        },
        include: {
            workflow: {
                select: { name: true }
            }
        },
        orderBy: {
            startedAt: 'desc'
        }
    });

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

    return (
        <div className="flex flex-col h-full overflow-auto p-4 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <Play className="w-5 h-5 text-primary" />
                        Execution History
                    </h1>
                    <p className="text-xs text-muted-foreground mt-1">
                        Monitor the run status and logs of your automated workflows.
                    </p>
                </div>
            </div>

            <Card className="bg-card backdrop-blur-sm border-border transition-all duration-300 hover:shadow-lg hover:border-primary/20">
                <CardHeader>
                    <CardTitle className="text-base font-semibold">Recent Executions</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {executions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                            <Activity className="w-8 h-8 opacity-20 mb-2" />
                            <p>No executions found in this workspace.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-muted-foreground uppercase bg-muted/20">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Status</th>
                                        <th className="px-6 py-3 font-medium">Workflow</th>
                                        <th className="px-6 py-3 font-medium">Started</th>
                                        <th className="px-6 py-3 font-medium">Duration</th>
                                        <th className="px-6 py-3 font-medium text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {executions.map((execution) => (
                                        <tr key={execution.id} className="group hover:bg-muted/30 transition-all duration-200 hover:shadow-sm cursor-pointer border-l-2 border-transparent hover:border-primary/50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(execution.status)}
                                                    <Badge variant={getStatusVariant(execution.status)} className="capitalize text-[10px]">
                                                        {execution.status.toLowerCase()}
                                                    </Badge>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium">
                                                {execution.workflow?.name || 'Unknown Workflow'}
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">
                                                <div className="flex flex-col">
                                                    <span>{formatDistanceToNow(new Date(execution.startedAt), { addSuffix: true })}</span>
                                                    <span className="text-[10px] opacity-70">
                                                        {format(new Date(execution.startedAt), 'MMM dd, yyyy HH:mm:ss')}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">
                                                {execution.finishedAt
                                                    ? `${((new Date(execution.finishedAt) - new Date(execution.startedAt)) / 1000).toFixed(2)}s`
                                                    : '-'
                                                }
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link href={`/workspace/${workspaceId}/flowbot/executions/${execution.id}`}>
                                                    <Button variant="ghost" size="sm" className="h-8">
                                                        Details
                                                        <ChevronRight className="w-4 h-4 ml-1" />
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
