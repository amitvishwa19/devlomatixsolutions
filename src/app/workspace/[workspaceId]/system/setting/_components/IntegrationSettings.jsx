'use client';

import React, { useState, useEffect } from 'react';
import { useSettings } from '@/providers/WorkspaceProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Puzzle, Globe, Key, Plus, Trash2, CheckCircle2, Copy } from 'lucide-react';
import { toast } from 'sonner';

export const IntegrationSettings = () => {
    const { settings, updateSettings, saving } = useSettings();
    const [webhooks, setWebhooks] = useState([]);

    useEffect(() => {
        if (settings?.integrations) {
            setWebhooks(settings.integrations.webhooks || []);
        }
    }, [settings]);

    const handleAddWebhook = () => {
        const newWebhook = {
            id: Math.random().toString(36).substr(2, 9),
            url: "https://",
            status: "active",
            createdAt: new Date().toISOString()
        };
        const updated = [...webhooks, newWebhook];
        setWebhooks(updated);
        updateSettings({ integrations: { ...settings.integrations, webhooks: updated } });
    };

    const handleDeleteWebhook = (id) => {
        const updated = webhooks.filter(w => w.id !== id);
        setWebhooks(updated);
        updateSettings({ integrations: { ...settings.integrations, webhooks: updated } });
    };

    const cardClasses = "rounded-md border border-border/50 bg-transparent overflow-hidden hover:border-primary/20 transition-colors duration-300";

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            {/* Webhooks Section */}
            <Card className={cardClasses}>
                <CardHeader className="p-3 border-b border-border/10">
                    <div className="flex flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-emerald-500/5 rounded-md flex items-center justify-center border border-emerald-500/10">
                                <Globe className="w-4 h-4 text-emerald-500" />
                            </div>
                            <div>
                                <CardTitle className="text-sm font-bold">Outgoing Webhooks</CardTitle>
                                <CardDescription className="text-[10px] font-medium opacity-60">
                                    Real-time event notifications via HTTPS.
                                </CardDescription>
                            </div>
                        </div>
                        <Button
                            onClick={handleAddWebhook}
                            disabled={saving}
                            size="sm"
                            className="rounded-md font-bold bg-emerald-600 hover:bg-emerald-700 text-white h-8 px-4 gap-2 text-[10px]"
                        >
                            <Plus className="w-3 h-3" />
                            ADD ENDPOINT
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {webhooks.length === 0 ? (
                        <div className="p-8 flex flex-col items-center justify-center gap-2 opacity-40">
                            <Puzzle className="w-8 h-8 text-muted-foreground" />
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">No Webhooks</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-muted/5">
                                <TableRow className="hover:bg-transparent border-b border-border/10">
                                    <TableHead className="h-9 text-[10px] font-bold uppercase tracking-wider px-4">Endpoint</TableHead>
                                    <TableHead className="h-9 text-[10px] font-bold uppercase tracking-wider px-4">Status</TableHead>
                                    <TableHead className="h-9 text-right text-[10px] font-bold uppercase tracking-wider px-4">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {webhooks.map((hook) => (
                                    <TableRow key={hook.id} className="hover:bg-muted/5 border-b border-border/10 last:border-0">
                                        <TableCell className="py-2 px-4 font-mono text-[10px] truncate max-w-[200px]">{hook.url}</TableCell>
                                        <TableCell className="py-2 px-4">
                                            <Badge variant="outline" className="bg-emerald-500/5 text-emerald-600 border-emerald-500/10 rounded text-[9px] px-1.5 h-4">
                                                {hook.status.toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-2 px-4 text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="rounded h-6 w-6 text-rose-500 hover:bg-rose-500/10"
                                                onClick={() => handleDeleteWebhook(hook.id)}
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* API Keys Section */}
            <Card className={cardClasses}>
                <CardHeader className="p-3 border-b border-border/10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-500/5 rounded-md flex items-center justify-center border border-indigo-500/10">
                            <Key className="w-4 h-4 text-indigo-500" />
                        </div>
                        <div>
                            <CardTitle className="text-sm font-bold">API Governance</CardTitle>
                            <CardDescription className="text-[10px] font-medium opacity-60">
                                Access keys for custom applications.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4 p-3 rounded-md border border-border/50 bg-muted/5">
                        <div className="space-y-0.5">
                            <Label className="text-[11px] font-bold">Development Key</Label>
                            <p className="text-[9px] text-muted-foreground font-medium opacity-60">Active • Last rotated 2d ago</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <code className="bg-background px-2 py-1 rounded border border-border/50 font-mono text-[9px] font-bold opacity-70">
                                dvlx_live_••••••••••••••••
                            </code>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 border border-border/50"
                                onClick={() => {
                                    navigator.clipboard.writeText("dvlx_live_example_key");
                                    toast.success("Key copied to clipboard");
                                }}
                            >
                                <Copy className="w-3 h-3 text-muted-foreground" />
                            </Button>
                            <Button variant="ghost" size="sm" className="rounded-md text-[9px] font-bold h-7 px-3 border border-border/50 hover:bg-primary/5">
                                ROTATE
                            </Button>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="border-t border-border/10 p-3 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500/40" />
                    <span className="text-[9px] font-bold text-indigo-500/40 uppercase tracking-tighter">
                        Keys are AES-256 encrypted
                    </span>
                </CardFooter>
            </Card>

            {/* Placeholder */}
            <Card className="rounded-md border border-border/30 bg-transparent opacity-40 hover:border-primary/10 transition-colors duration-300">
                <CardHeader className="p-3">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-amber-500/5 rounded flex items-center justify-center border border-amber-500/10">
                            <Puzzle className="w-4 h-4 text-amber-500" />
                        </div>
                        <div className="space-y-0.5">
                            <CardTitle className="text-sm font-bold opacity-70">App Marketplace</CardTitle>
                            <CardDescription className="text-[10px] font-medium">Launching in Q4 2026</CardDescription>
                        </div>
                    </div>
                </CardHeader>
            </Card>
        </div>
    );
};