'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Activity, Search, RefreshCw, CheckCircle2, AlertTriangle, ArrowRightLeft } from 'lucide-react';

export function LogsTab() {
    const logs = [
        { id: "log-101", time: "13:42:10", requestModel: "auto/coding", resolvedProvider: "Anthropic", resolvedModel: "claude-3-7-sonnet", tokens: "4,210", latency: "310ms", status: 200, compressed: "68%" },
        { id: "log-102", time: "13:41:55", requestModel: "auto/fast", resolvedProvider: "Groq Cloud", resolvedModel: "llama-3.3-70b", tokens: "850", latency: "85ms", status: 200, compressed: "82%" },
        { id: "log-103", time: "13:40:12", requestModel: "auto/cheap", resolvedProvider: "DeepSeek API", resolvedModel: "deepseek-chat-v3", tokens: "1,940", latency: "190ms", status: 200, compressed: "45%" },
        { id: "log-104", time: "13:38:04", requestModel: "auto", resolvedProvider: "Google AI Studio", resolvedModel: "gemini-2.0-flash", tokens: "3,100", latency: "240ms", status: 200, compressed: "52%" },
        { id: "log-105", time: "13:35:22", requestModel: "auto/coding", resolvedProvider: "OpenRouter (Fallback)", resolvedModel: "qwen-2.5-coder", tokens: "2,400", latency: "390ms", status: 200, compressed: "70%" }
    ];

    return (
        <div className="space-y-6 pb-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-border/50 bg-card/40">
                <div>
                    <h2 className="text-base font-bold flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" /> Gateway Telemetry & Logs
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Live real-time request logs, provider resolution, latencies, and token savings.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="text-xs font-semibold gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5" /> Refresh Telemetry
                    </Button>
                </div>
            </div>

            {/* Table Card */}
            <Card className="border-border/50 bg-card/40">
                <CardHeader className="p-4 pb-3">
                    <div className="flex items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input placeholder="Search request model or provider..." className="pl-9 bg-secondary/30 border-border/40 text-xs h-9" />
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent text-[11px] uppercase tracking-wider font-bold">
                                <TableHead className="w-[100px]">Time</TableHead>
                                <TableHead>Request Preset</TableHead>
                                <TableHead>Resolved Provider</TableHead>
                                <TableHead>Resolved Model</TableHead>
                                <TableHead className="text-right">Tokens</TableHead>
                                <TableHead className="text-right">Compression</TableHead>
                                <TableHead className="text-right">Latency</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.map((log) => (
                                <TableRow key={log.id} className="text-xs font-mono hover:bg-secondary/20">
                                    <TableCell className="text-muted-foreground font-semibold">{log.time}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                                            {log.requestModel}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-semibold text-foreground">{log.resolvedProvider}</TableCell>
                                    <TableCell className="text-muted-foreground">{log.resolvedModel}</TableCell>
                                    <TableCell className="text-right font-medium">{log.tokens}</TableCell>
                                    <TableCell className="text-right text-emerald-500 font-bold">{log.compressed}</TableCell>
                                    <TableCell className="text-right text-amber-500">{log.latency}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30 text-[9px]">
                                            {log.status} OK
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
