'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Terminal, Key, Webhook, Plus, Copy, RefreshCw, Trash2, ShieldCheck, Zap, Globe, Info, Settings2, Check, AlertCircle, Loader2, Activity, ShieldAlert, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useSettings } from '../_provider/SettingProvider';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import axios from '@/utils/axios';
import { useParams } from 'next/navigation';

export const DeveloperSettings = () => {
 const { settings, updateSettings, saving } = useSettings();
 const params = useParams();
 const workspaceId = params.workspaceId;

 const [isAddWebhookOpen, setIsAddWebhookOpen] = useState(false);
 const [testingWebhookId, setTestingWebhookId] = useState(null);
 const [isPrechecking, setIsPrechecking] = useState(false);
 
 const [apiKeys, setApiKeys] = useState([]);
 const [webhooks, setWebhooks] = useState([]);
 const [activityLogs, setActivityLogs] = useState([]);
 const [isLoadingLogs, setIsLoadingLogs] = useState(false);

 const [newWebhook, setNewWebhook] = useState({
 url: '',
 events: []
 });

 const mockUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/workspace/${workspaceId}/system/webhooks/mock` : '';

 const fetchLogs = useCallback(async () => {
 setIsLoadingLogs(true);
 try {
 const { data } = await axios.get(`/api/workspace/${workspaceId}/system/webhooks/logs`);
 setActivityLogs(data || []);
 } catch (error) {
 console.error("Fetch Logs Error:", error);
 } finally {
 setIsLoadingLogs(false);
 }
 }, [workspaceId]);

 useEffect(() => {
 if (settings?.developer) {
 setApiKeys(settings.developer.apiKeys || []);
 setWebhooks(settings.developer.webhooks || []);
 } else {
 setApiKeys([
 { id: '1', name: 'Production Dashboard', key: 'dv_live_4k82...9j2m', created: '2026-03-20', lastUsed: '2 hours ago' },
 { id: '2', name: 'Staging Environment', key: 'dv_test_7h1s...1s2b', created: '2026-03-22', lastUsed: 'Yesterday' }
 ]);
 setWebhooks([
 { id: '1', url: 'https://api.myapp.com/webhooks/health', status: 'active', events: ['user.created', 'payment.success'] }
 ]);
 }
 }, [settings]);

 useEffect(() => {
 fetchLogs();
 }, [fetchLogs]);

 const availableEvents = [
 { id: 'user.created', label: 'User Created' },
 { id: 'user.updated', label: 'User Updated' },
 { id: 'payment.success', label: 'Payment Success' },
 { id: 'payment.failed', label: 'Payment Failed' },
 { id: 'workspace.updated', label: 'Workspace Updated' }
 ];

 const handleAddWebhook = () => {
 const isDevelopment = process.env.NODE_ENV === 'development';
 const urlValue = newWebhook.url.toLowerCase();
 
 if (!newWebhook.url || (!urlValue.startsWith('https://') && (!isDevelopment || !urlValue.startsWith('http://')))) {
 toast.error(isDevelopment ? "Please enter a valid HTTP or HTTPS URL" : "Please enter a valid HTTPS URL (starting with https://)");
 return;
 }

 if (newWebhook.events.length === 0) {
 toast.error("Please select at least one event to subscribe to");
 return;
 }

 const webhookDto = {
 id: Math.random().toString(36).substr(2, 9),
 url: newWebhook.url,
 status: 'active',
 events: newWebhook.events,
 created: new Date().toISOString().split('T')[0]
 };

 const updatedWebhooks = [...webhooks, webhookDto];
 updateSettings({ 
 developer: { 
 ...settings?.developer, 
 apiKeys: apiKeys,
 webhooks: updatedWebhooks 
 } 
 });
 
 setIsAddWebhookOpen(false);
 setNewWebhook({ url: '', events: [] });
 };

 const handleDeleteWebhook = (id) => {
 const updatedWebhooks = webhooks.filter(w => w.id !== id);
 updateSettings({ 
 developer: { 
 ...settings?.developer, 
 apiKeys: apiKeys,
 webhooks: updatedWebhooks 
 } 
 });
 };

 const handleTestPing = async (url, id = null) => {
 if (id) setTestingWebhookId(id);
 else setIsPrechecking(true);

 try {
 const { data } = await axios.post(`/api/workspace/${workspaceId}/system/webhooks/test`, {
 url: url
 });

 if (data.success) {
 toast.success(`Ping successful! Server responded with ${data.status} ${data.statusText}`);
 setTimeout(fetchLogs, 1000); // Wait for log creation
 } else {
 toast.error(`Ping failed: ${data.message || 'Server connection error'}`);
 }
 } catch (error) {
 console.error("Test Ping Error:", error);
 toast.error("An error occurred while attempting to ping the endpoint.");
 } finally {
 setTestingWebhookId(null);
 setIsPrechecking(false);
 }
 };

 const toggleEvent = (eventId) => {
 setNewWebhook(prev => ({
 ...prev,
 events: prev.events.includes(eventId) 
 ? prev.events.filter(id => id !== eventId)
 : [...prev.events, eventId]
 }));
 };

 const copyToClipboard = (text) => {
 navigator.clipboard.writeText(text);
 toast.success("Copied to clipboard");
 };

 return (
 <div className="space-y-6 animate-fade-in">
 {/* Developer Hub Header */}
 <div className="p-6 bg-fuchsia-500/5 rounded-md border border-fuchsia-500/10 flex gap-6 items-center">
 <div className="w-16 h-16 bg-fuchsia-500/10 rounded-md flex items-center justify-center border border-fuchsia-500/20 shadow-inner shrink-0 scale-110">
 <Terminal className="w-8 h-8 text-fuchsia-500" />
 </div>
 <div className="flex-1">
 <div className="flex items-center gap-2">
 <Badge variant="outline" className="bg-fuchsia-500/10 text-fuchsia-600 border-fuchsia-500/20 text-[9px] ">Dev Hub</Badge>
 <h3 className="text-lg text-foreground ">Developer Operations</h3>
 </div>
 <p className="text-sm text-muted-foreground font-medium mt-1">
 Control your external integrations, API connectivity, and real-time event distribution.
 </p>
 </div>
 </div>

 <Tabs defaultValue="webhooks" className="w-full">
 <TabsList className="bg-background/50 border border-border/40 p-1 rounded-md mb-6">
 <TabsTrigger value="webhooks" className="rounded-md gap-2 text-xs font-bold px-4 transition-all data-[state=active]:bg-card data-[state=active]:text-fuchsia-500">
 <Webhook className="w-3.5 h-3.5" />
 Webhooks & Automation
 </TabsTrigger>
 <TabsTrigger value="apikeys" className="rounded-md gap-2 text-xs font-bold px-4 transition-all data-[state=active]:bg-card data-[state=active]:text-fuchsia-500">
 <Key className="w-3.5 h-3.5" />
 API Access
 </TabsTrigger>
 <TabsTrigger value="activity" className="rounded-md gap-2 text-xs font-bold px-4 transition-all data-[state=active]:bg-card data-[state=active]:text-fuchsia-500">
 <Activity className="w-3.5 h-3.5" />
 Live Feed
 </TabsTrigger>
 </TabsList>

 <TabsContent value="webhooks" className="mt-0 space-y-4">
 <Card className="rounded-md border border-border/40 shadow-xl shadow-fuchsia-500/5 bg-card/60 backdrop-blur-md overflow-hidden">
 <CardHeader className="flex flex-row items-center justify-between pb-4">
 <div>
 <CardTitle className="text-lg font-bold">Webhook Endpoints</CardTitle>
 <CardDescription className="text-xs">Receive real-time notifications when events happen in your workspace.</CardDescription>
 </div>
 <Dialog open={isAddWebhookOpen} onOpenChange={setIsAddWebhookOpen}>
 <DialogTrigger asChild>
 <Button size="sm" className="rounded-md gap-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold h-9">
 <Plus className="w-4 h-4" />
 Add Endpoint
 </Button>
 </DialogTrigger>
 <DialogContent className="sm:max-w-[425px] rounded-md border-fuchsia-500/20 bg-card/95 backdrop-blur-xl shadow-2xl">
 <DialogHeader>
 <DialogTitle className="text-xl font-bold flex items-center gap-2 text-fuchsia-600">
 <Webhook className="w-5 h-5" />
 Configure Webhook
 </DialogTitle>
 <DialogDescription className="text-sm font-medium opacity-70">
 Define the endpoint URL and select the workspace events to subscribe to.
 </DialogDescription>
 </DialogHeader>
 <div className="grid gap-6 py-4">
 <div className="grid gap-3">
 <div className="flex items-center justify-between ml-1">
 <Label className="text-[10px] font-bold opacity-70">Endpoint URL</Label>
 <div className="flex items-center gap-2">
 <Button 
 variant="ghost" 
 size="sm" 
 className="h-6 text-[9px] text-indigo-600 hover:bg-indigo-500/10 gap-1 tracking-tighter"
 onClick={() => setNewWebhook(prev => ({ ...prev, url: mockUrl }))}
 >
 <Plus className="w-2.5 h-2.5" />
 Use Internal Mock
 </Button>
 <Button 
 variant="ghost" 
 size="sm" 
 className="h-6 text-[9px] text-fuchsia-600 hover:bg-fuchsia-500/10 gap-1 tracking-tighter"
 disabled={!newWebhook.url || isPrechecking}
 onClick={() => handleTestPing(newWebhook.url)}
 >
 {isPrechecking ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Zap className="w-2.5 h-2.5" />}
 Test Connection
 </Button>
 </div>
 </div>
 <div className="relative">
 <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
 <Input
 placeholder="https://your-api.com/webhooks"
 className="pl-10 rounded-md border border-border/50 h-11 bg-background shadow-inner font-bold text-xs focus:ring-2 focus:ring-fuchsia-500/20"
 value={newWebhook.url}
 onChange={(e) => setNewWebhook(prev => ({ ...prev, url: e.target.value }))}
 />
 </div>
 </div>
 <div className="grid gap-3">
 <Label className="text-[10px] font-bold opacity-70 ml-1">Event Subscriptions</Label>
 <div className="grid grid-cols-1 gap-2 p-3 bg-muted/30 rounded-md border border-border/40 max-h-[150px] overflow-y-auto custom-scrollbar">
 {availableEvents.map((event) => (
 <div key={event.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-background/50 transition-colors group">
 <Checkbox 
 id={`new-${event.id}`}
 checked={newWebhook.events.includes(event.id)} 
 onCheckedChange={() => toggleEvent(event.id)}
 className="border-fuchsia-500/30 data-[state=checked]:bg-fuchsia-500" 
 />
 <Label 
 htmlFor={`new-${event.id}`} 
 className="text-xs font-bold text-foreground/70 group-hover:text-fuchsia-600 transition-colors cursor-pointer flex-1 py-1"
 >
 {event.label}
 </Label>
 </div>
 ))}
 </div>
 </div>
 </div>
 <DialogFooter className="gap-2">
 <Button variant="ghost" onClick={() => setIsAddWebhookOpen(false)} className="rounded-md font-bold text-[10px]">Cancel</Button>
 <Button 
 onClick={handleAddWebhook}
 disabled={saving}
 className="rounded-md font-bold bg-fuchsia-600 hover:bg-fuchsia-700 text-white shadow-xl shadow-fuchsia-500/20 px-6 h-11"
 >
 {saving ? "Saving..." : "Deploy Endpoint"}
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>
 </CardHeader>
 <CardContent className="p-0">
 {webhooks.length > 0 ? (
 webhooks.map((hook) => (
 <div key={hook.id} className="p-4 border-t border-border/10 hover:bg-fuchsia-500/5 transition-colors">
 <div className="flex items-center justify-between mb-3">
 <div className="flex items-center gap-3">
 <div className="p-2 bg-emerald-500/10 rounded-md">
 <Globe className="w-4 h-4 text-emerald-500" />
 </div>
 <div className="min-w-0">
 <div className="flex items-center gap-2">
 <p className="text-sm font-bold truncate max-w-[150px] md:max-w-xs">{hook.url}</p>
 <Button 
 variant="ghost" 
 size="icon" 
 className="h-5 w-5 text-muted-foreground/40 hover:text-fuchsia-600 transition-colors"
 onClick={() => copyToClipboard(hook.url)}
 >
 <Copy className="w-3 h-3" />
 </Button>
 </div>
 <div className="flex flex-wrap gap-2 mt-1">
 {hook.events.map(event => (
 <Badge key={event} variant="secondary" className="text-[9px] font-bold h-4 px-1">{event}</Badge>
 ))}
 </div>
 </div>
 </div>
 <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white text-[9px] h-5 px-2">Active</Badge>
 </div>
 <div className="flex justify-end gap-2">
 <Button 
 variant="ghost" 
 size="sm" 
 className="text-[10px] h-7 px-3 gap-2"
 onClick={() => handleTestPing(hook.url, hook.id)}
 disabled={testingWebhookId === hook.id}
 >
 {testingWebhookId === hook.id ? (
 <>
 <Loader2 className="w-3 h-3 animate-spin" />
 Pinging...
 </>
 ) : (
 <>Test Ping</>
 )}
 </Button>
 <Button 
 variant="ghost" 
 size="sm" 
 onClick={() => handleDeleteWebhook(hook.id)}
 disabled={saving}
 className="text-[10px] h-7 px-3 text-rose-500 hover:bg-rose-500/10"
 >
 Delete
 </Button>
 </div>
 </div>
 ))
 ) : (
 <div className="p-12 text-center">
 <Webhook className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
 <p className="text-sm font-bold text-muted-foreground">No webhook endpoints configured</p>
 </div>
 )}
 </CardContent>
 </Card>

 {/* Automation Assist */}
 <Card className="rounded-md border border-indigo-500/20 bg-indigo-500/5 shadow-xl shadow-indigo-500/5 overflow-hidden">
 <CardHeader className="pb-3">
 <div className="flex items-center gap-3">
 <div className="p-2 bg-indigo-500/20 rounded-md">
 <ShieldAlert className="w-4 h-4 text-indigo-500" />
 </div>
 <CardTitle className="text-sm font-bold ">Internal Mock Tester</CardTitle>
 </div>
 </CardHeader>
 <CardContent className="space-y-4">
 <p className="text-xs font-medium text-muted-foreground opacity-80 leading-relaxed">
 Use our built-in mock endpoint to test your integrations instantly without setting up your own server.
 </p>
 <div className="flex items-center gap-2 p-3 bg-background/50 rounded-md border border-indigo-500/10">
 <code className="flex-1 text-[10px] font-mono font-bold truncate text-indigo-600/70">{mockUrl}</code>
 <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-600 hover:bg-indigo-500/10" onClick={() => copyToClipboard(mockUrl)}>
 <Copy className="w-3.5 h-3.5" />
 </Button>
 </div>
 </CardContent>
 </Card>
 </TabsContent>

 <TabsContent value="apikeys" className="mt-0 space-y-4">
 <Card className="rounded-md border border-border/40 shadow-xl shadow-fuchsia-500/5 bg-card/60 backdrop-blur-md overflow-hidden">
 <CardHeader className="flex flex-row items-center justify-between pb-4">
 <div>
 <CardTitle className="text-lg font-bold">Secret API Keys</CardTitle>
 <CardDescription className="text-xs">Your secret API keys are used to authenticate requests to the Devlomatix API.</CardDescription>
 </div>
 <Button size="sm" className="rounded-md gap-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold h-9">
 <Plus className="w-4 h-4" />
 Create New Key
 </Button>
 </CardHeader>
 <CardContent className="space-y-4 p-0">
 {apiKeys.map((key) => (
 <div key={key.id} className="flex items-center justify-between p-4 border-t border-border/10 hover:bg-fuchsia-500/5 transition-colors group">
 <div className="space-y-1">
 <p className="text-sm font-bold">{key.name}</p>
 <div className="flex items-center gap-2">
 <code className="text-[10px] bg-background/80 px-2 py-1 rounded border border-border/40 font-mono text-muted-foreground">{key.key}</code>
 <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => copyToClipboard(key.key)}>
 <Copy className="w-3 h-3" />
 </Button>
 </div>
 </div>
 <div className="text-right flex items-center gap-6">
 <div>
 <p className="text-[9px] opacity-40">Created</p>
 <p className="text-xs font-bold">{key.created}</p>
 </div>
 <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:bg-rose-500/10">
 <Trash2 className="w-4 h-4" />
 </Button>
 </div>
 </div>
 ))}
 </CardContent>
 </Card>

 <div className="p-4 bg-amber-500/5 rounded-md border border-amber-500/10 flex gap-4 items-start">
 <div className="p-2 bg-amber-500/10 rounded-md mt-0.5">
 <ShieldCheck className="w-4 h-4 text-amber-600" />
 </div>
 <div className="space-y-1">
 <p className="text-[11px] font-bold text-amber-600 tracking-wide ">Security Best Practice</p>
 <p className="text-xs text-amber-600/70 font-medium">
 Never share your secret API keys in public repositories or client-side code. Use environment variables for safety.
 </p>
 </div>
 </div>
 </TabsContent>

 <TabsContent value="activity" className="mt-0 space-y-4">
 <Card className="rounded-md border border-border/40 shadow-xl shadow-indigo-500/5 bg-card/60 backdrop-blur-md overflow-hidden min-h-[400px]">
 <CardHeader className="flex flex-row items-center justify-between pb-4">
 <div>
 <CardTitle className="text-lg font-bold flex items-center gap-2">
 <Activity className="w-5 h-5 text-indigo-500" />
 Webhook Activity
 </CardTitle>
 <CardDescription className="text-xs">Real-time log of outgoing deliveries and incoming mock pings.</CardDescription>
 </div>
 <Button 
 variant="outline" 
 size="sm" 
 className="rounded-md gap-2 h-9 px-4 border-indigo-500/20 text-indigo-600 font-bold text-[10px] "
 onClick={fetchLogs}
 disabled={isLoadingLogs}
 >
 <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLogs ? 'animate-spin' : ''}`} />
 Sync Logs
 </Button>
 </CardHeader>
 <CardContent className="p-0">
 {activityLogs.length > 0 ? (
 activityLogs.map((log) => (
 <div key={log.id} className="p-4 border-t border-border/10 hover:bg-muted/30 transition-colors flex gap-4 items-start">
 <div className={`p-2 rounded-md mt-0.5 ${log.level === 'SUCCESS' ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
 {log.level === 'SUCCESS' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <AlertCircle className="w-3.5 h-3.5 text-rose-600" />}
 </div>
 <div className="flex-1 min-w-0 space-y-1">
 <div className="flex items-center justify-between">
 <p className="text-xs font-bold truncate">{log.message}</p>
 <div className="flex items-center gap-1.5 text-muted-foreground">
 <Clock className="w-3 h-3" />
 <span className="text-[10px] font-medium">{new Date(log.createdAt).toLocaleTimeString()}</span>
 </div>
 </div>
 <div className="flex items-center gap-2">
 <Badge variant="outline" className="text-[9px] h-4 px-1.5 opacity-60">{log.type}</Badge>
 <code className="text-[9px] font-mono text-muted-foreground truncate">{JSON.stringify(log.details)}</code>
 </div>
 </div>
 </div>
 ))
 ) : (
 <div className="p-24 text-center opacity-40">
 <Activity className="w-12 h-12 mx-auto mb-4" />
 <p className="text-xs font-bold ">No activity recorded</p>
 </div>
 )}
 </CardContent>
 </Card>
 </TabsContent>
 </Tabs>
 </div>
 );
};
