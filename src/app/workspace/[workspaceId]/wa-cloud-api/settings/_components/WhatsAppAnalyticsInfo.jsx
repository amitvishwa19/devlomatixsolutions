'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Zap, MessageSquare, LayoutDashboard } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAction } from "@/hooks/use-action";
import { testMetaApi } from "../_actions/test-meta-api";
import { getDecryptedCredentials } from "../_actions/get-decrypted-credentials";
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

// Workspace-scoped cache for analytics settings
const analyticsCache = new Map();

export function WhatsAppAnalyticsInfo({ workspaceId, metaCloudVersion = 'v25.0' }) {
    const [wabaId, setWabaId] = useState('');
    const [granularity, setGranularity] = useState('DAY');
    const [since, setSince] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const [until, setUntil] = useState(new Date().toISOString().split('T')[0]);
    
    const [msgTesting, setMsgTesting] = useState(false);
    const [msgResult, setMsgResult] = useState(null);
    const [convTesting, setConvTesting] = useState(false);
    const [convResult, setConvResult] = useState(null);
    
    const [accessToken, setAccessToken] = useState('');

    const { execute: executeTestApi } = useAction(testMetaApi, {
        onSuccess: (data, context) => {
            if (context.type === 'meta_analytics_msg') {
                setMsgResult(data.apiData);
                setMsgTesting(false);
                toast.success("Message analytics fetched");
            } else if (context.type === 'meta_analytics_conv') {
                setConvResult(data.apiData);
                setConvTesting(false);
                toast.success("Conversation analytics fetched");
            }
        },
        onError: (error, context) => {
            if (context.type === 'meta_analytics_msg') setMsgTesting(false);
            else if (context.type === 'meta_analytics_conv') setConvTesting(false);
            toast.error(error);
        }
    });

    const handleFetchMsgAnalytics = (targetToken, targetWabaId) => {
        const activeToken = targetToken || accessToken;
        const activeWabaId = targetWabaId || wabaId;

        if (!activeWabaId?.trim()) { toast.error('WABA ID required.'); return; }
        if (!activeToken?.trim()) { toast.error('Access Token required.'); return; }

        const start = Math.floor(new Date(since).getTime() / 1000);
        const end = Math.floor(new Date(until).getTime() / 1000);
        const url = `https://graph.facebook.com/${metaCloudVersion}/${activeWabaId.trim()}/analytics?start=${start}&end=${end}&granularity=${granularity}&phone_numbers=[]`;

        setMsgTesting(true);
        executeTestApi({
            workspaceId,
            url,
            headers: { 'Authorization': `Bearer ${activeToken.trim()}` },
        }, { type: 'meta_analytics_msg' });
    };

    const handleFetchConvAnalytics = (targetToken, targetWabaId) => {
        const activeToken = targetToken || accessToken;
        const activeWabaId = targetWabaId || wabaId;

        if (!activeWabaId?.trim()) { toast.error('WABA ID required.'); return; }
        if (!activeToken?.trim()) { toast.error('Access Token required.'); return; }

        const start = Math.floor(new Date(since).getTime() / 1000);
        const end = Math.floor(new Date(until).getTime() / 1000);
        const cats = encodeURIComponent('["MARKETING","UTILITY","AUTHENTICATION","SERVICE"]');
        const dims = encodeURIComponent('["CONVERSATION_CATEGORY","CONVERSATION_TYPE"]');
        const url = `https://graph.facebook.com/${metaCloudVersion}/${activeWabaId.trim()}/conversation_analytics?start=${start}&end=${end}&granularity=${granularity}&phone_numbers=[]&conversation_categories=${cats}&dimensions=${dims}`;

        setConvTesting(true);
        executeTestApi({
            workspaceId,
            url,
            headers: { 'Authorization': `Bearer ${activeToken.trim()}` },
        }, { type: 'meta_analytics_conv' });
    };

    const { execute: executeGetDecrypted } = useAction(getDecryptedCredentials, {
        onSuccess: (data) => {
            const token = data?.accessToken || data.data?.accessToken;
            const fetchedWabaId = data?.wabaId || data.data?.wabaId;
            
            if (token) setAccessToken(token);
            if (fetchedWabaId) {
                setWabaId(fetchedWabaId);
                // Auto-trigger fetch on first load
                handleFetchMsgAnalytics(token, fetchedWabaId);
            }
        }
    });

    useEffect(() => {
        if (workspaceId) {
            executeGetDecrypted({ workspaceId });
            
            // Restore from cache if exists
            const cached = analyticsCache.get(workspaceId);
            if (cached) {
                setGranularity(cached.granularity || 'DAY');
                setSince(cached.since || since);
                setUntil(cached.until || until);
            }
        }
    }, [workspaceId]);

    // Save to cache on change
    useEffect(() => {
        if (workspaceId) {
            analyticsCache.set(workspaceId, { granularity, since, until });
        }
    }, [workspaceId, granularity, since, until]);

    return (
        <ScrollArea className="h-full">
            <Card id="analytics-card" className="border shadow-sm p-4 m-4">
            <CardHeader className="px-2 pb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/5 rounded-xl border border-primary/10">
                        <LayoutDashboard className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-lg font-bold">Account Analytics</CardTitle>
                        <CardDescription className="text-xs font-medium">Monitoring WABA: <span className="font-mono text-primary">{wabaId || 'Fetching...'}</span></CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-2 space-y-6">
                <div className="flex flex-wrap gap-4 items-end bg-muted/5 p-4 rounded-xl border border-dashed">
                    <div className="space-y-1.5 flex-1 min-w-[240px]">
                        <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Time Period</Label>
                        <div className="flex gap-2">
                            <Input
                                type="date"
                                className="bg-background text-xs border rounded-md px-4 flex-1 h-10 shadow-sm"
                                value={since}
                                onChange={(e) => setSince(e.target.value)}
                            />
                            <Input
                                type="date"
                                className="bg-background text-xs border rounded-md px-4 flex-1 h-10 shadow-sm"
                                value={until}
                                onChange={(e) => setUntil(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5 w-40">
                        <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Granularity</Label>
                        <Select value={granularity} onValueChange={setGranularity}>
                            <SelectTrigger className="bg-background text-xs border rounded-md px-4 h-10 shadow-sm"><SelectValue /></SelectTrigger>
                            <SelectContent className="rounded-xl border-border/20">
                                <SelectItem value="DAY" className="text-sm">Daily</SelectItem>
                                <SelectItem value="WEEK" className="text-sm">Weekly</SelectItem>
                                <SelectItem value="MONTH" className="text-sm">Monthly</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button 
                        variant="secondary" 
                        size="sm" 
                        className="h-10 px-6 rounded-lg gap-2 font-semibold shadow-sm"
                        onClick={() => handleFetchMsgAnalytics()}
                        disabled={msgTesting || !wabaId}
                    >
                        {msgTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        Refresh All
                    </Button>
                </div>

                <Tabs defaultValue="messages" className="w-full">
                    <TabsList className="bg-muted/10 w-fit justify-start rounded-xl h-auto p-1.5 gap-1.5 border shadow-sm mb-6">
                        <TabsTrigger value="messages" className="flex items-center gap-2.5 text-xs font-bold px-6 py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md transition-all">
                            <MessageSquare size={16} className="text-primary" />
                            Message Metrics
                        </TabsTrigger>
                        <TabsTrigger value="conversations" className="flex items-center gap-2.5 text-xs font-bold px-6 py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md transition-all">
                            <LayoutDashboard size={16} className="text-primary" />
                            Conversation Volume
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="messages" className="space-y-4 mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center justify-between px-1">
                            <div className="text-[11px] font-mono text-muted-foreground/60 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
                                graph.facebook.com/{metaCloudVersion}/{wabaId}/analytics
                            </div>
                        </div>
                        
                        {msgResult ? (
                            <div className="bg-muted/5 border rounded-2xl overflow-hidden shadow-inner">
                                <div className="px-4 py-2 border-b bg-muted/10 flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Live Response Payload</span>
                                    <Badge variant="outline" className="text-[9px] bg-background">JSON</Badge>
                                </div>
                                <div className="p-5 overflow-auto max-h-[400px] custom-scrollbar">
                                    <pre className="text-[11px] font-mono text-foreground/80 leading-relaxed">{JSON.stringify(msgResult, null, 2)}</pre>
                                </div>
                            </div>
                        ) : (
                            <div className="py-20 text-center bg-muted/5 border-2 border-dashed rounded-2xl flex flex-col items-center gap-4">
                                <div className="p-4 bg-muted/10 rounded-full">
                                    <MessageSquare className="w-8 h-8 text-muted-foreground/20" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-muted-foreground">No data fetched yet</p>
                                    <p className="text-[11px] text-muted-foreground/60">Click refresh to load your account metrics</p>
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="conversations" className="space-y-4 mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <Button className="px-8 rounded-lg text-xs font-bold h-10 gap-2 shadow-sm" onClick={() => handleFetchConvAnalytics()} disabled={convTesting || !wabaId}>
                            {convTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                            {convTesting ? 'Fetching...' : 'Fetch Conversation Analytics'}
                        </Button>
                        
                        {convResult ? (
                            <div className="bg-muted/5 border rounded-2xl overflow-hidden shadow-inner">
                                <div className="px-4 py-2 border-b bg-muted/10 flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Conversation Analytics Payload</span>
                                    <Badge variant="outline" className="text-[9px] bg-background">JSON</Badge>
                                </div>
                                <div className="p-5 overflow-auto max-h-[400px] custom-scrollbar">
                                    <pre className="text-[11px] font-mono text-foreground/80 leading-relaxed">{JSON.stringify(convResult, null, 2)}</pre>
                                </div>
                            </div>
                        ) : (
                            <div className="py-20 text-center bg-muted/5 border-2 border-dashed rounded-2xl flex flex-col items-center gap-4">
                                <div className="p-4 bg-muted/10 rounded-full">
                                    <LayoutDashboard className="w-8 h-8 text-muted-foreground/20" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-muted-foreground">No analytics data yet</p>
                                    <p className="text-[11px] text-muted-foreground/60">Pull the latest conversation metrics from Meta</p>
                                </div>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
        </ScrollArea>
    );
}
