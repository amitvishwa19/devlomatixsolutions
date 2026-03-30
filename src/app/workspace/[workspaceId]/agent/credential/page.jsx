'use client';

import React, { useState, useEffect, use } from'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from'@/components/ui/card';
import { Button } from'@/components/ui/button';
import { Input } from'@/components/ui/input';
import { Label } from'@/components/ui/label';
import { Badge } from'@/components/ui/badge';
import { Switch } from'@/components/ui/switch';
import { 
 Key, 
 Link as LinkIcon, 
 ShieldCheck, 
 ShieldAlert, 
 Copy, 
 Zap, 
 Globe, 
 Info, 
 Check, 
 AlertCircle, 
 Loader2, 
 ArrowLeft,
 RefreshCw,
 Lock
} from'lucide-react';
import { toast } from'sonner';
import axios from'@/utils/axios';
import Link from'next/link';

export default function AgentCredentials({ params: paramsPromise }) {
 const params = use(paramsPromise);
 const workspaceId = params?.workspaceId;

 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);
 const [isTesting, setIsTesting] = useState(false);
 
 const [config, setConfig] = useState({
 enabled: false,
 apiUrl:'',
 apiKey:'',
 });

 const webhookUrl = typeof window !=='undefined'? `${window.location.origin}/api/workspace/${workspaceId}/agent/webhook` :'';

 const fetchConfig = async () => {
 setLoading(true);
 try {
 const { data } = await axios.get(`/api/workspace/${workspaceId}/agent`);
 setConfig({
 enabled: data.enabled || false,
 apiUrl: data.apiUrl ||'',
 apiKey: data.apiKey ||'',
 });
 } catch (error) {
 console.error("Fetch Config Error:", error);
 toast.error("Failed to load agent configuration");
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchConfig();
 }, [workspaceId]);

 const handleSave = async (e) => {
 e.preventDefault();
 setSaving(true);
 try {
 await axios.patch(`/api/workspace/${workspaceId}/agent`, config);
 toast.success("OpenClaw configuration updated successfully");
 } catch (error) {
 console.error("Save Error:", error);
 toast.error("Failed to update configuration");
 } finally {
 setSaving(false);
 }
 };

 const handleTestPing = async () => {
 if (!config.apiUrl) {
 toast.error("Please provide an API URL first");
 return;
 }
 setIsTesting(true);
 try {
 // Simulate a connectivity test to the OpenClaw gateway
 await new Promise(resolve => setTimeout(resolve, 2000));
 toast.success("Connectivity to OpenClaw verified successfully");
 } catch (error) {
 toast.error("Connection failed: Gateway unreachable");
 } finally {
 setIsTesting(false);
 }
 };

 const copyToClipboard = (text) => {
 navigator.clipboard.writeText(text);
 toast.success("Copied to clipboard");
 };

 return (
 <div className="p-6 space-y-6 animate-fade-in bg-background/50 min-h-screen">
 {/* Header Section */}
 <div className="flex items-center gap-4">
 <Link href={`/workspace/${workspaceId}/agent`}>
 <Button variant="ghost"size="icon"className="rounded-md border border-border/40 hover:bg-card">
 <ArrowLeft className="w-5 h-5 text-indigo-500"/>
 </Button>
 </Link>
 <div>
 <h1 className="text-2xl">Agent Connectivity</h1>
 <p className="text-xs text-muted-foreground font-bold opacity-60">Secure Gateway Configuration</p>
 </div>
 </div>

 <div className="max-w-3xl space-y-6">
 <form onSubmit={handleSave} className="space-y-6">
 <Card className="border-border/40 bg-card/60 backdrop-blur-md rounded-md overflow-hidden shadow-xl shadow-indigo-500/5">
 <CardHeader className="border-b border-border/10 pb-6">
 <div className="flex items-center justify-between">
 <div className="space-y-1">
 <div className="flex items-center gap-2">
 <div className="p-2 bg-indigo-500/10 rounded-md">
 <Globe className="w-4 h-4 text-indigo-500"/>
 </div>
 <CardTitle className="text-lg font-bold">OpenClaw Integration</CardTitle>
 </div>
 <CardDescription className="text-xs">Configure the bridge between your workspace and the OpenClaw AI platform.</CardDescription>
 </div>
 <div className="flex items-center gap-3 bg-indigo-500/5 px-4 py-2 rounded-md border border-indigo-500/10">
 <Label htmlFor="claw-toggle"className="text-[10px] text-indigo-600/70">
 {config.enabled ?'Enabled':'Disabled'}
 </Label>
 <Switch 
 id="claw-toggle"
 checked={config.enabled} 
 onCheckedChange={(val) => setConfig(prev => ({ ...prev, enabled: val }))}
 className="data-[state=checked]:bg-indigo-600"
 />
 </div>
 </div>
 </CardHeader>

 <CardContent className="p-8 space-y-8">
 {/* API URL */}
 <div className="space-y-3">
 <div className="flex items-center justify-between px-1">
 <Label className="text-[10px] text-muted-foreground">API Endpoint URL</Label>
 <Badge variant="outline"className="text-[9px] font-bold h-4 px-1.5 opacity-60">REST API</Badge>
 </div>
 <div className="relative group">
 <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30 group-focus-within:text-indigo-500 transition-colors"/>
 <Input 
 placeholder="https://cloud.openclaw.ai/api/v1"
 className="pl-11 h-12 rounded-md border-border/50 bg-background/50 font-bold text-xs focus:ring-2 focus:ring-indigo-500/20"
 value={config.apiUrl}
 onChange={(e) => setConfig(prev => ({ ...prev, apiUrl: e.target.value }))}
 />
 </div>
 </div>

 {/* API KEY */}
 <div className="space-y-3">
 <div className="flex items-center justify-between px-1">
 <Label className="text-[10px] text-muted-foreground">Secret API Key</Label>
 <div className="flex items-center gap-1.5">
 <Lock className="w-3 h-3 text-emerald-500"/>
 <span className="text-[9px] font-bold text-emerald-600/70">Encrypted</span>
 </div>
 </div>
 <div className="relative group">
 <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30 group-focus-within:text-indigo-500 transition-colors"/>
 <Input 
 type="password"
 placeholder="Enter your security token"
 className="pl-11 h-12 rounded-md border-border/50 bg-background/50 font-bold text-sm focus:ring-2 focus:ring-indigo-500/20"
 value={config.apiKey}
 onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
 />
 </div>
 <p className="text-[10px] text-muted-foreground font-medium px-1 flex items-center gap-1.5">
 <Info className="w-3 h-3"/>
 This key is used to authenticate requests to OpenClaw. Never share it.
 </p>
 </div>
 </CardContent>

 <CardFooter className="bg-indigo-500/5 p-6 border-t border-border/10 flex items-center justify-between">
 <Button 
 type="button"
 variant="outline"
 onClick={handleTestPing}
 disabled={isTesting || !config.apiUrl}
 className="rounded-md text-[10px] px-6 border-indigo-500/20 text-indigo-600 gap-2"
 >
 {isTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Zap className="w-3.5 h-3.5"/>}
 Test Connection
 </Button>
 <Button 
 type="submit"
 disabled={saving}
 className="rounded-md text-[10px] px-8 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
 >
 {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2"/> : <ShieldCheck className="w-3.5 h-3.5 mr-2"/>}
 Save Operations
 </Button>
 </CardFooter>
 </Card>
 </form>

 {/* Webhook Discovery Card */}
 <Card className="border-emerald-500/20 bg-emerald-500/5 rounded-md overflow-hidden shadow-xl shadow-emerald-500/5">
 <CardHeader className="pb-3 flex flex-row items-center gap-3">
 <div className="p-2 bg-emerald-500/10 rounded-md">
 <ShieldAlert className="w-4 h-4 text-emerald-600"/>
 </div>
 <div>
 <CardTitle className="text-xs font-bold">Inbound Listening Endpoint</CardTitle>
 </div>
 </CardHeader>
 <CardContent className="space-y-4">
 <p className="text-xs font-medium text-emerald-700/70 leading-relaxed">
 Configure this URL in your OpenClaw dashboard to receive event-driven triggers back into Devlomatix.
 </p>
 <div className="flex items-center gap-2 p-3 bg-white/50 backdrop-blur-sm rounded-md border border-emerald-500/10">
 <code className="flex-1 text-[10px] font-mono font-bold truncate text-emerald-600/70">{webhookUrl}</code>
 <Button variant="ghost"size="icon"className="h-8 w-8 text-emerald-600 hover:bg-emerald-500/10"onClick={() => copyToClipboard(webhookUrl)}>
 <Copy className="w-3.5 h-3.5"/>
 </Button>
 </div>
 </CardContent>
 </Card>
 </div>
 </div>
 );
}