'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    Cpu,
    Plus,
    Copy,
    RefreshCw,
    Trash2,
    Globe,
    MoreHorizontal,
    Settings2,
    Zap,
    Database,
    LayoutDashboard,
    ChevronRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import DynamicIcon from './DynamicIcon';

export default function GeneralTab({
    cloudCreds,
    testState,
    onAddAccount,
    onSetDefault,
    onTestConnection,
    onEditAccount,
    onDeleteAccount,
    copyToClipboard,
    // Analytics props
    analyticsWabaId,
    setAnalyticsWabaId,
    analyticsDateRange,
    setAnalyticsDateRange,
    analyticsGranularity,
    setAnalyticsGranularity,
    metaCloudVersion,
    analyticsMsgTesting,
    handleFetchMsgAnalytics,
    analyticsMsgResult,
    analyticsMsgOpen,
    setAnalyticsMsgOpen,
    analyticsConvTesting,
    handleFetchConvAnalytics,
    analyticsConvResult,
    analyticsConvOpen,
    setAnalyticsConvOpen
}) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Primary List (Left) */}
            <div className="md:col-span-8 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                            Meta Engine Nodes
                            <Badge variant="outline" className="text-[9px] font-black tracking-widest px-2 h-5 border-primary/20 text-primary bg-primary/5">
                                {cloudCreds.length} ACTIVE
                            </Badge>
                        </h2>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider opacity-60">Provisioned Cloud API Handlers</p>
                    </div>
                    <Button
                        size="sm"
                        onClick={onAddAccount}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-black text-[10px] uppercase tracking-widest px-6 h-10 rounded-xl shadow-lg shadow-primary/20 transition-all border-none"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Provision New Node
                    </Button>
                </div>

                <Card className="glass-card border-none shadow-none overflow-hidden">
                    <CardContent className="p-0">
                        <div className="divide-y divide-border/20">
                            {cloudCreds.map((cred) => (
                                <div key={cred.id} className="group hover:bg-primary/5 transition-all duration-300">
                                    <div className="p-6 flex items-center justify-between">
                                        <div className="flex items-center gap-5">
                                            <div className="relative">
                                                <div className="w-14 h-14 rounded-2xl bg-muted/20 border border-border/40 flex items-center justify-center shadow-inner group-hover:border-primary/30 transition-colors overflow-hidden">
                                                    <DynamicIcon name="whatsapp" className="w-7 h-7 text-primary/40 group-hover:text-primary transition-colors" />
                                                </div>
                                                {cred.isDefault && (
                                                    <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-primary border-4 border-background flex items-center justify-center shadow-lg">
                                                        <Zap size={10} className="text-primary-foreground fill-current" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-sm font-bold tracking-tight">{cred.profile}</h3>
                                                    {cred.isDefault && (
                                                        <Badge variant="secondary" className="text-[8px] font-black tracking-widest bg-primary/10 text-primary border-none px-2">DEFAULT NODE</Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 group/id" onClick={() => copyToClipboard(cred.phoneNumberId)}>
                                                    <span className="text-[10px] font-mono text-muted-foreground/60 tracking-tight cursor-pointer hover:text-primary transition-colors">
                                                        ID: {cred.phoneNumberId}
                                                    </span>
                                                    <Copy className="w-2.5 h-2.5 text-muted-foreground/0 group-hover/id:opacity-100 transition-opacity" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className={`h-9 px-4 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all ${testState[cred.id] === 'success' ? 'border-green-500/30 bg-green-500/5 text-green-500' : testState[cred.id] === 'loading' ? 'border-primary/30' : 'border-border/40'}`}
                                                onClick={() => onTestConnection(cred)}
                                                disabled={testState[cred.id] === 'loading'}
                                            >
                                                {testState[cred.id] === 'loading' ? (
                                                    <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                                                ) : testState[cred.id] === 'success' ? (
                                                    <Zap className="w-3 h-3 mr-2 fill-current" />
                                                ) : (
                                                    <Settings2 className="w-3 h-3 mr-2" />
                                                )}
                                                {testState[cred.id] === 'loading' ? 'PINGING' : testState[cred.id] === 'success' ? 'CONNECTED' : 'TEST BRIDGE'}
                                            </Button>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-primary/10">
                                                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 glass-card border-border/20 rounded-xl p-1 shadow-2xl">
                                                    {!cred.isDefault && (
                                                        <DropdownMenuItem className="text-[10px] font-black uppercase tracking-widest cursor-pointer rounded-lg px-3 py-2.5" onClick={() => onSetDefault(cred.id)}>
                                                            Set as Primary Node
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem className="text-[10px] font-black uppercase tracking-widest cursor-pointer rounded-lg px-3 py-2.5" onClick={() => onEditAccount(cred)}>
                                                        Edit Configuration
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-[10px] font-black uppercase tracking-widest cursor-pointer rounded-lg px-3 py-2.5 text-destructive hover:text-destructive focus:text-destructive" onClick={() => onDeleteAccount(cred)}>
                                                        Purge Node
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {cloudCreds.length === 0 && (
                            <div className="text-center py-16 bg-muted/5 border border-dashed border-border/40 rounded-2xl flex flex-col items-center gap-3 m-3">
                                <div className="w-12 h-12 rounded-full bg-muted/10 flex items-center justify-center">
                                    <Globe className="w-6 h-6 text-muted-foreground/30" />
                                </div>
                                <p className="text-xs text-muted-foreground font-medium">No Cloud API accounts linked yet.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="flex items-center justify-between text-[10px] px-3 font-bold tracking-widest uppercase text-muted-foreground/40">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
                        <span>Active Nodes Online</span>
                    </div>
                    <span className="italic">VWA-Engine v3.4.0 (Enterprise)</span>
                </div>

                <div className=''>
                    <Button
                        id='client-onboarding-button'
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 h-10 rounded-md shadow-lg shadow-primary/20 transition-all border-none"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Client Onboarding
                    </Button>
                </div>
            </div>

            {/* Sidebar Stats (Right) */}
            <div className="md:col-span-4 space-y-6">
                <Card className="glass-card border-none p-6 space-y-5">
                    <div className="flex items-center gap-3 text-muted-foreground">
                        <div className="p-2 bg-primary/5 rounded-lg border border-primary/20">
                            <Database size={14} className="text-primary" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest">Instance Health</span>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-xs font-medium">
                            <span className="opacity-60 uppercase tracking-tighter">App Security</span>
                            <Badge variant="outline" className="text-[9px] font-black h-5 border-green-500/20 text-green-500 bg-green-500/5 tracking-widest uppercase">High</Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs font-medium">
                            <span className="opacity-60 uppercase tracking-tight">Latency</span>
                            <span className="font-black text-primary tracking-tighter">0.4ms</span>
                        </div>
                        <div className="pt-2">
                            <div className="w-full h-1 bg-muted/20 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "98%" }}
                                    className="h-full bg-primary"
                                />
                            </div>
                        </div>
                    </div>
                </Card>



                {/* Analytics Section — full width below the grid */}
                <div className="mt-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
                            <LayoutDashboard className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold tracking-tight">Account Analytics</h3>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest opacity-60">On-demand via Meta Graph API</p>
                        </div>
                    </div>

                    <Card className="glass-card border-none shadow-none">
                        <CardContent className="pt-5 space-y-4">

                            {/* Controls Row */}
                            <div className="flex flex-wrap gap-3 items-end">
                                <div className="space-y-1.5 flex-1 min-w-[160px]">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">WABA ID</Label>
                                    <Input
                                        placeholder="WhatsApp Business Account ID"
                                        value={analyticsWabaId ?? ''}
                                        onChange={(e) => setAnalyticsWabaId(e.target.value)}
                                        className="bg-background/40 text-xs font-mono font-medium border rounded-md px-3 shadow-inner"
                                    />
                                </div>
                                <div className="space-y-1.5 w-32">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Date Range</Label>
                                    <Select value={analyticsDateRange} onValueChange={setAnalyticsDateRange}>
                                        <SelectTrigger className="h-9 bg-background/40 text-xs font-bold border rounded-md px-3 shadow-inner"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="7d" className="text-xs">Last 7 days</SelectItem>
                                            <SelectItem value="30d" className="text-xs">Last 30 days</SelectItem>
                                            <SelectItem value="90d" className="text-xs">Last 90 days</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5 w-28">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Granularity</Label>
                                    <Select value={analyticsGranularity} onValueChange={setAnalyticsGranularity}>
                                        <SelectTrigger className="h-9 bg-background/40 text-xs font-bold border rounded-md px-3 shadow-inner"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="DAY" className="text-xs">Day</SelectItem>
                                            <SelectItem value="WEEK" className="text-xs">Week</SelectItem>
                                            <SelectItem value="MONTH" className="text-xs">Month</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Analytics Tabs */}
                            <Tabs defaultValue="messages" className="w-full">
                                <TabsList className="bg-muted/5 w-full justify-start rounded-lg h-auto p-1 gap-1 border border-border/20 mb-3">
                                    <TabsTrigger value="messages" className="text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-md data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                                        Messages
                                    </TabsTrigger>
                                    <TabsTrigger value="conversations" className="text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-md data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                                        Conversations
                                    </TabsTrigger>
                                </TabsList>

                                {/* Messages Analytics */}
                                <TabsContent value="messages" className="space-y-3 mt-0">
                                    <div className="px-3 py-2 bg-muted/10 border border-border/20 rounded-md text-[10px] font-mono text-muted-foreground/60 break-all">
                                        GET https://graph.facebook.com/<span className="text-primary/80">{metaCloudVersion}</span>/<span className="text-primary/80">{analyticsWabaId || '<waba_id>'}</span>/analytics?granularity=<span className="text-primary/80">{analyticsGranularity}</span>&start=...&end=...
                                    </div>
                                    <Button className="px-6 rounded-md text-xs gap-2" onClick={handleFetchMsgAnalytics} disabled={analyticsMsgTesting || !analyticsWabaId.trim()}>
                                        {analyticsMsgTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                                        {analyticsMsgTesting ? 'Fetching...' : 'Fetch Message Analytics'}
                                    </Button>

                                    {analyticsMsgResult && (
                                        <div className="border border-border/20 rounded-lg overflow-hidden animate-in fade-in">
                                            {/* Summary metric cards */}
                                            {analyticsMsgResult.success && analyticsMsgResult.data?.data?.[0] && (() => {
                                                const d = analyticsMsgResult.data.data[0];
                                                const metrics = [
                                                    { label: 'Sent', value: d.sent ?? '–', color: 'text-blue-400' },
                                                    { label: 'Delivered', value: d.delivered ?? '–', color: 'text-green-400' },
                                                    { label: 'Read', value: d.read ?? '–', color: 'text-primary' },
                                                    { label: 'Failed', value: d.failed ?? '–', color: 'text-red-400' },
                                                ];
                                                return (
                                                    <div className="grid grid-cols-4 gap-2 p-3 bg-muted/5 border-b border-border/20">
                                                        {metrics.map(m => (
                                                            <div key={m.label} className="text-center space-y-1 p-2 bg-background/40 rounded-lg">
                                                                <div className={`text-lg font-black ${m.color}`}>{typeof m.value === 'number' ? m.value.toLocaleString() : m.value}</div>
                                                                <div className="text-[9px] uppercase tracking-widest text-muted-foreground/60">{m.label}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                );
                                            })()}
                                            <button onClick={() => setAnalyticsMsgOpen(v => !v)} className="w-full flex items-center gap-2 px-3 py-2 bg-muted/10 hover:bg-muted/20 transition-colors">
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${analyticsMsgResult.success ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                                    {analyticsMsgResult.success ? '✓ Success' : '✗ Failed'}
                                                </span>
                                                {analyticsMsgResult.status && <span className="text-[10px] font-mono text-muted-foreground">{analyticsMsgResult.status} {analyticsMsgResult.statusText}</span>}
                                                <ChevronRight className={`w-3.5 h-3.5 text-muted-foreground ml-auto transition-transform duration-200 ${analyticsMsgOpen ? 'rotate-90' : ''}`} />
                                            </button>
                                            {analyticsMsgOpen && (
                                                <pre className="text-[10px] font-mono bg-muted/5 p-3 overflow-x-auto max-h-56 text-muted-foreground whitespace-pre-wrap break-all">
                                                    {analyticsMsgResult.error ? analyticsMsgResult.error : JSON.stringify(analyticsMsgResult.data, null, 2)}
                                                </pre>
                                            )}
                                        </div>
                                    )}
                                </TabsContent>

                                {/* Conversation Analytics */}
                                <TabsContent value="conversations" className="space-y-3 mt-0">
                                    <div className="px-3 py-2 bg-muted/10 border border-border/20 rounded-md text-[10px] font-mono text-muted-foreground/60 break-all">
                                        GET https://graph.facebook.com/<span className="text-primary/80">{metaCloudVersion}</span>/<span className="text-primary/80">{analyticsWabaId || '<waba_id>'}</span>/conversation_analytics?granularity=<span className="text-primary/80">{analyticsGranularity}</span>&...
                                    </div>
                                    <Button className="px-6 rounded-md text-xs gap-2" onClick={handleFetchConvAnalytics} disabled={analyticsConvTesting || !analyticsWabaId.trim()}>
                                        {analyticsConvTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                                        {analyticsConvTesting ? 'Fetching...' : 'Fetch Conversation Analytics'}
                                    </Button>

                                    {analyticsConvResult && (
                                        <div className="border border-border/20 rounded-lg overflow-hidden animate-in fade-in">
                                            {/* Conversation breakdown */}
                                            {analyticsConvResult.success && analyticsConvResult.data?.data && (() => {
                                                const cats = {};
                                                analyticsConvResult.data.data.forEach(item => {
                                                    if (item.conversation_category) {
                                                        cats[item.conversation_category] = (cats[item.conversation_category] || 0) + (item.conversation_count || 0);
                                                    }
                                                });
                                                const catColors = { MARKETING: 'text-purple-400', UTILITY: 'text-blue-400', AUTHENTICATION: 'text-yellow-400', SERVICE: 'text-green-400' };
                                                const entries = Object.entries(cats);
                                                if (entries.length === 0) return null;
                                                return (
                                                    <div className="grid grid-cols-2 gap-2 p-3 bg-muted/5 border-b border-border/20">
                                                        {entries.map(([cat, count]) => (
                                                            <div key={cat} className="text-center space-y-1 p-2 bg-background/40 rounded-lg">
                                                                <div className={`text-base font-black ${catColors[cat] || 'text-primary'}`}>{count.toLocaleString()}</div>
                                                                <div className="text-[9px] uppercase tracking-widest text-muted-foreground/60">{cat}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                );
                                            })()}
                                            <button onClick={() => setAnalyticsConvOpen(v => !v)} className="w-full flex items-center gap-2 px-3 py-2 bg-muted/10 hover:bg-muted/20 transition-colors">
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${analyticsConvResult.success ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                                    {analyticsConvResult.success ? '✓ Success' : '✗ Failed'}
                                                </span>
                                                {analyticsConvResult.status && <span className="text-[10px] font-mono text-muted-foreground">{analyticsConvResult.status} {analyticsConvResult.statusText}</span>}
                                                <ChevronRight className={`w-3.5 h-3.5 text-muted-foreground ml-auto transition-transform duration-200 ${analyticsConvOpen ? 'rotate-90' : ''}`} />
                                            </button>
                                            {analyticsConvOpen && (
                                                <pre className="text-[10px] font-mono bg-muted/5 p-3 overflow-x-auto max-h-56 text-muted-foreground whitespace-pre-wrap break-all">
                                                    {analyticsConvResult.error ? analyticsConvResult.error : JSON.stringify(analyticsConvResult.data, null, 2)}
                                                </pre>
                                            )}
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>

                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}
