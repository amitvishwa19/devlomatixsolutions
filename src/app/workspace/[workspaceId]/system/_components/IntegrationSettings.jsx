'use client';

import React, { useState, useEffect } from 'react';
import { useSettings } from '@/providers/WorkspaceProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
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
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Card className="bg-white/5 border-white/10 backdrop-blur-xl hover:border-emerald-500/30 transition-colors">
                    <CardHeader className="pb-4 border-b border-white/5">
                        <div className="flex flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                    <Globe className="w-5 h-5 text-emerald-500" />
                                </div>
                                <div>
                                    <CardTitle className="text-base font-bold text-white">Outgoing Webhooks</CardTitle>
                                    <CardDescription className="text-xs text-zinc-500">
                                        Real-time event notifications via HTTPS.
                                    </CardDescription>
                                </div>
                            </div>
                            <Button
                                onClick={handleAddWebhook}
                                disabled={saving}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-10 px-4 gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                ADD ENDPOINT
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {webhooks.length === 0 ? (
                            <div className="p-12 flex flex-col items-center justify-center gap-3">
                                <Puzzle className="w-12 h-12 text-zinc-600" />
                                <p className="text-sm font-semibold text-zinc-500 uppercase tracking-widest">No Webhooks</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader className="bg-white/5">
                                    <TableRow className="hover:bg-transparent border-b border-white/10">
                                        <TableHead className="h-12 text-xs font-semibold uppercase tracking-wider px-6 text-zinc-400">Endpoint</TableHead>
                                        <TableHead className="h-12 text-xs font-semibold uppercase tracking-wider px-6 text-zinc-400">Status</TableHead>
                                        <TableHead className="h-12 text-right text-xs font-semibold uppercase tracking-wider px-6 text-zinc-400">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {webhooks.map((hook) => (
                                        <TableRow key={hook.id} className="hover:bg-white/5 border-b border-white/10 last:border-0">
                                            <TableCell className="py-4 px-6 font-mono text-sm text-zinc-300 truncate max-w-[300px]">{hook.url}</TableCell>
                                            <TableCell className="py-4 px-6">
                                                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 rounded-lg text-xs font-semibold px-3 py-1">
                                                    {hook.status.toUpperCase()}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-rose-500 hover:bg-rose-500/10 rounded-lg"
                                                    onClick={() => handleDeleteWebhook(hook.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
            >
                <Card className="bg-white/5 border-white/10 backdrop-blur-xl hover:border-indigo-500/30 transition-colors">
                    <CardHeader className="pb-4 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                                <Key className="w-5 h-5 text-indigo-500" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-bold text-white">API Governance</CardTitle>
                                <CardDescription className="text-xs text-zinc-500">
                                    Access keys for custom applications.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                            <div className="space-y-1">
                                <Label className="text-sm font-semibold text-white">Development Key</Label>
                                <p className="text-xs text-zinc-500">Active • Last rotated 2d ago</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <code className="bg-white/10 px-3 py-2 rounded-lg border border-white/10 font-mono text-sm text-zinc-300">
                                    dvlx_live_••••••••••••••••
                                </code>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-10 w-10 border border-white/10 rounded-lg bg-white/5"
                                    onClick={() => {
                                        navigator.clipboard.writeText("dvlx_live_example_key");
                                        toast.success("Key copied to clipboard");
                                    }}
                                >
                                    <Copy className="w-4 h-4 text-zinc-400" />
                                </Button>
                                <Button variant="ghost" className="rounded-lg bg-white/5 border border-white/10 text-xs font-semibold h-10 px-4">
                                    ROTATE
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="border-t border-white/5 pt-4 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                        <span className="text-sm font-semibold text-indigo-500 uppercase tracking-tighter">
                            Keys are AES-256 encrypted
                        </span>
                    </CardFooter>
                </Card>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
            >
                <Card className="bg-white/5 border-white/10 backdrop-blur-xl hover:border-amber-500/30 transition-colors opacity-60">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-amber-500/10 rounded-lg border border-amber-500/20">
                                <Puzzle className="w-5 h-5 text-amber-500" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-bold text-white">App Marketplace</CardTitle>
                                <CardDescription className="text-xs text-zinc-500">Launching in Q4 2026</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>
            </motion.div>
        </div>
    );
};
