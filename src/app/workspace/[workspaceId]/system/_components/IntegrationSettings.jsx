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

    return (
        <div className="space-y-3">
            <Card className="bg-white/5 border-white/10">
                <CardHeader className="pb-3 px-3 border-b border-white/5">
                    <div className="flex flex-row items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                <Globe className="w-3.5 h-3.5 text-emerald-500" />
                            </div>
                            <div>
                                <CardTitle className="text-xs font-bold text-white">Outgoing Webhooks</CardTitle>
                                <CardDescription className="text-[10px] text-zinc-500">
                                    Real-time event notifications via HTTPS.
                                </CardDescription>
                            </div>
                        </div>
                        <Button
                            onClick={handleAddWebhook}
                            disabled={saving}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[10px] h-7 px-3 gap-1"
                        >
                            <Plus className="w-3 h-3" />
                            ADD
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {webhooks.length === 0 ? (
                        <div className="p-8 flex flex-col items-center justify-center gap-2">
                            <Puzzle className="w-8 h-8 text-zinc-600" />
                            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">No Webhooks</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-white/5">
                                <TableRow className="hover:bg-transparent border-b border-white/10">
                                    <TableHead className="h-10 text-[10px] font-semibold uppercase tracking-wider px-4 text-zinc-400">Endpoint</TableHead>
                                    <TableHead className="h-10 text-[10px] font-semibold uppercase tracking-wider px-4 text-zinc-400">Status</TableHead>
                                    <TableHead className="h-10 text-right text-[10px] font-semibold uppercase tracking-wider px-4 text-zinc-400">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {webhooks.map((hook) => (
                                    <TableRow key={hook.id} className="hover:bg-white/5 border-b border-white/10 last:border-0">
                                        <TableCell className="py-2.5 px-4 font-mono text-xs text-zinc-300 truncate max-w-[200px]">{hook.url}</TableCell>
                                        <TableCell className="py-2.5 px-4">
                                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 rounded text-[10px] font-semibold px-2 py-0.5">
                                                {hook.status.toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-2.5 px-4 text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-rose-500 hover:bg-rose-500/10 rounded-lg"
                                                onClick={() => handleDeleteWebhook(hook.id)}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
                <CardHeader className="pb-3 px-3 border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                            <Key className="w-3.5 h-3.5 text-indigo-500" />
                        </div>
                        <div>
                            <CardTitle className="text-xs font-bold text-white">API Governance</CardTitle>
                            <CardDescription className="text-[10px] text-zinc-500">
                                Access keys for custom applications.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-3 px-3">
                    <div className="flex items-center justify-between gap-3 p-2 rounded-lg bg-white/5 border border-white/10">
                        <div className="space-y-0.5">
                            <Label className="text-xs font-semibold text-white">Development Key</Label>
                            <p className="text-[10px] text-zinc-500">Active • Last rotated 2d ago</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <code className="bg-white/10 px-2 py-1 rounded border border-white/10 font-mono text-xs text-zinc-300">
                                dvlx_live_••••••••
                            </code>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 border border-white/10 rounded-lg bg-white/5"
                                onClick={() => {
                                    navigator.clipboard.writeText("dvlx_live_example_key");
                                    toast.success("Key copied to clipboard");
                                }}
                            >
                                <Copy className="w-3.5 h-3.5 text-zinc-400" />
                            </Button>
                            <Button variant="ghost" className="rounded-lg bg-white/5 border border-white/10 text-[10px] font-semibold h-7 px-2">
                                ROTATE
                            </Button>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="border-t border-white/5 pt-3 px-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                    <span className="text-[10px] font-semibold text-indigo-500 uppercase tracking-tighter">
                        Keys are AES-256 encrypted
                    </span>
                </CardFooter>
            </Card>

            <Card className="bg-white/5 border-white/10 opacity-60">
                <CardHeader className="pb-3 px-3">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-amber-500/10 rounded-lg border border-amber-500/20">
                            <Puzzle className="w-3.5 h-3.5 text-amber-500" />
                        </div>
                        <div>
                            <CardTitle className="text-xs font-bold text-white">App Marketplace</CardTitle>
                            <CardDescription className="text-[10px] text-zinc-500">Launching in Q4 2026</CardDescription>
                        </div>
                    </div>
                </CardHeader>
            </Card>
        </div>
    );
};
