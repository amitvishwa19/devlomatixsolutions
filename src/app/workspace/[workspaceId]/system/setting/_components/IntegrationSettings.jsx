'use client';

import React, { useState, useEffect } from'react';
import { useSettings } from '@/providers/WorkspaceProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from'@/components/ui/card';
import { Button } from'@/components/ui/button';
import { Input } from'@/components/ui/input';
import { Label } from'@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from'@/components/ui/table';
import { Badge } from'@/components/ui/badge';
import { Puzzle, Globe, Key, Plus, Trash2, Power, CheckCircle2, Copy } from'lucide-react';
import { toast } from'sonner';

export const IntegrationSettings = () => {
 const { settings, updateSettings, saving } = useSettings();
 const [webhooks, setWebhooks] = useState([]);
 const [apiKeys, setApiKeys] = useState([]);

 useEffect(() => {
 if (settings?.integrations) {
 setWebhooks(settings.integrations.webhooks || []);
 setApiKeys(settings.integrations.apiKeys || []);
 }
 }, [settings]);

 const handleAddWebhook = () => {
 const newWebhook = {
 id: Math.random().toString(36).substr(2, 9),
 url:"https://",
 status:"active",
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
 <div className="space-y-6 animate-fade-in">
 {/* Webhooks Section */}
 <Card className="rounded-md border border-border/40 shadow-xl shadow-emerald-500/5 bg-card/60 backdrop-blur-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
 <CardHeader className="pb-4">
 <div className="flex flex-row items-start justify-between">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 bg-emerald-500/10 rounded-md flex items-center justify-center border border-emerald-500/20 shadow-inner">
 <Globe className="w-6 h-6 text-emerald-500"/>
 </div>
 <div>
 <CardTitle className="text-xl font-bold">Outgoing Webhooks</CardTitle>
 <CardDescription className="text-sm font-medium opacity-70">
 Receive real-time notifications when events happen in your workspace.
 </CardDescription>
 </div>
 </div>
 <Button 
 onClick={handleAddWebhook} 
 disabled={saving}
 className="rounded-md font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-500/20 gap-2 px-6"
 >
 <Plus className="w-4 h-4"/>
 ADD ENDPOINT
 </Button>
 </div>
 </CardHeader>
 <CardContent>
 {webhooks.length === 0 ? (
 <div className="p-8 border-2 border-dashed border-border/40 rounded-md flex flex-col items-center justify-center gap-3 opacity-60">
 <div className="text-[10px] tracking-[0.2em] text-muted-foreground">No Webhooks Configured</div>
 <p className="text-xs font-semibold text-muted-foreground/60 text-center">
 Connect your external services via HTTPS endpoints.
 </p>
 </div>
 ) : (
 <div className="rounded-md border border-border overflow-hidden">
 <Table>
 <TableHeader className="bg-muted/50">
 <TableRow>
 <TableHead className="text-[10px] font-bold tracking-wider">URL Endpoint</TableHead>
 <TableHead className="text-[10px] font-bold tracking-wider">Status</TableHead>
 <TableHead className="text-[10px] font-bold tracking-wider">Created</TableHead>
 <TableHead className="text-right text-[10px] font-bold tracking-wider">Actions</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {webhooks.map((hook) => (
 <TableRow key={hook.id} className="hover:bg-muted/30">
 <TableCell className="font-mono text-xs">{hook.url}</TableCell>
 <TableCell>
 <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 rounded-md text-[9px] px-2 py-0.5">
 {hook.status.toUpperCase()}
 </Badge>
 </TableCell>
 <TableCell className="text-xs text-muted-foreground">{new Date(hook.createdAt).toLocaleDateString()}</TableCell>
 <TableCell className="text-right">
 <Button 
 variant="ghost"
 size="icon"
 className="rounded-md h-8 w-8 text-rose-500 hover:bg-rose-500/10"
 onClick={() => handleDeleteWebhook(hook.id)}
 >
 <Trash2 className="w-4 h-4"/>
 </Button>
 </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 </div>
 )}
 </CardContent>
 </Card>

 {/* API Keys Section */}
 <Card className="rounded-md border border-border/40 shadow-xl shadow-indigo-500/5 bg-card/60 backdrop-blur-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
 <CardHeader className="pb-4">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 bg-indigo-500/10 rounded-md flex items-center justify-center border border-indigo-500/20 shadow-inner">
 <Key className="w-6 h-6 text-indigo-500"/>
 </div>
 <div>
 <CardTitle className="text-xl font-bold">API Governance</CardTitle>
 <CardDescription className="text-xs font-medium opacity-70">
 Manage secure access keys for authenticating your custom applications.
 </CardDescription>
 </div>
 </div>
 </CardHeader>
 <CardContent className="space-y-6">
 <div className="grid gap-4">
 <div className="flex items-center justify-between gap-8 p-4 bg-muted/20 rounded-md border border-border/40">
 <div className="space-y-1">
 <Label className="text-sm font-bold">Development Key</Label>
 <p className="text-[10px] text-muted-foreground font-medium opacity-70">
 Last rotated: 2 days ago
 </p>
 </div>
 <div className="flex items-center gap-2">
 <code className="bg-background px-3 py-1.5 rounded-md border border-border font-mono text-[10px] font-bold text-foreground shadow-inner">
 dvlx_live_••••••••••••••••
 </code>
 <Button size="icon"variant="outline"className="rounded-md h-8 w-8"onClick={() => toast.success("Key copied")}>
 <Copy className="w-3 h-3 text-muted-foreground"/>
 </Button>
 <Button variant="outline"size="sm"className="rounded-md text-[10px] font-bold h-8 px-4 border-indigo-500/20 text-indigo-600">
 ROTATE
 </Button>
 </div>
 </div>
 </div>
 </CardContent>
 <CardFooter className="border-t border-border/10 bg-muted/20 p-6 flex items-center gap-2">
 <CheckCircle2 className="w-4 h-4 text-indigo-500/60"/>
 <span className="text-[10px] font-bold text-indigo-500/60 italic">
 All API keys are encrypted at rest using AES-256.
 </span>
 </CardFooter>
 </Card>

 {/* External Integrations Placeholder */}
 <Card className="rounded-md border border-border shadow-soft bg-card/100 opacity-50">
 <CardHeader>
 <div className="w-10 bg-amber-500/10 rounded-md flex items-center justify-center mb-2 border border-amber-500/20">
 <Puzzle className="w-5 h-5 text-amber-500"/>
 </div>
 <CardTitle className="text-xl font-bold">Third-Party Marketplace</CardTitle>
 <CardDescription className="text-xs font-medium opacity-70 font-italic">
 Native integrations for Slack, Discord, and Google Calendar.
 </CardDescription>
 </CardHeader>
 <CardContent className="py-12 flex flex-col items-center">
 <div className="text-[11px] tracking-[0.3em] text-muted-foreground border-b-2 border-amber-500/20 pb-1 mb-2">Integration Engine Offline</div>
 <p className="text-xs font-bold text-muted-foreground/40">Marketplace launching in Q4 2026</p>
 </CardContent>
 </Card>
 </div>
 );
};