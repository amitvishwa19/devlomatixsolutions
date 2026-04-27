'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Terminal, Key, Webhook, Plus, Copy, RefreshCw, Trash2, ShieldCheck, Zap, Globe, Info, Check, AlertCircle, Loader2, Activity, ShieldAlert, Clock, Sparkles, Search, FileCode, ExternalLink } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from 'sonner';
import { useSettings } from '@/providers/WorkspaceProvider';
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

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

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
        toast.success(`Ping successful! Server responded with ${data.status}`);
        setTimeout(fetchLogs, 1000);
      } else {
        toast.error(`Ping failed: ${data.message || 'Server connection error'}`);
      }
    } catch (error) {
      console.error("Test Ping Error:", error);
      toast.error("An error occurred during ping.");
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

  const handleClassSearch = async () => {
    if (!searchQuery || searchQuery.length < 2) {
      toast.error("Please enter at least 2 characters");
      return;
    }

    setIsSearching(true);
    try {
      const { data } = await axios.get(`/api/workspace/${workspaceId}/system/style-cleaner/search?query=${encodeURIComponent(searchQuery)}`);
      setSearchResults(data.results || []);
    } catch (error) {
      console.error("Search Error:", error);
      toast.error("Scan error occurred");
    } finally {
      setIsSearching(false);
    }
  };

  const cardClasses = "rounded-md border border-border/50 bg-transparent overflow-hidden hover:border-primary/20 transition-colors duration-300";

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Developer Hub Header */}
      <div className="p-6 bg-fuchsia-500/5 rounded-md border border-fuchsia-500/10 flex gap-6 items-center">
        <div className="w-16 h-16 bg-fuchsia-500/10 rounded-md flex items-center justify-center border border-fuchsia-500/20 shadow-inner shrink-0 scale-110">
          <Terminal className="w-8 h-8 text-fuchsia-500" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-fuchsia-500/10 text-fuchsia-600 border-fuchsia-500/20 text-[9px]">Dev Hub</Badge>
            <h3 className="text-lg text-foreground">Developer Operations</h3>
          </div>
          <p className="text-xs text-muted-foreground font-medium mt-1">
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
          <TabsTrigger value="cleaner" className="rounded-md gap-2 text-xs font-bold px-4 transition-all data-[state=active]:bg-card data-[state=active]:text-fuchsia-500">
            <Sparkles className="w-3.5 h-3.5" />
            Class Cleaner
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cleaner" className="mt-0 space-y-4">
          <Card className={cardClasses + " min-h-[500px]"}>
            <CardHeader className="border-b border-border/10 bg-fuchsia-500/5 pb-6 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-fuchsia-500" />
                    Global Class Search
                  </CardTitle>
                  <CardDescription className="text-xs">Find all occurrences of a specific CSS class across your project (src/app).</CardDescription>
                </div>
                {searchResults.length > 0 && (
                  <Badge className="bg-fuchsia-500/20 text-fuchsia-600 border-fuchsia-500/30 font-bold px-3 py-1">
                    {searchResults.length} Matches
                  </Badge>
                )}
              </div>
              <div className="flex gap-3 mt-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                  <Input
                    placeholder="Enter class name (e.g. font-bold, italic, uppercase...)"
                    className="pl-10 h-11 bg-background/50 border-border/40 rounded-md font-bold text-xs"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleClassSearch}
                  disabled={isSearching}
                  className="rounded-md bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold h-11 px-6 shadow-lg shadow-fuchsia-500/20"
                >
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
                  Scan Project
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                {searchResults.length > 0 ? (
                  <div className="divide-y divide-border/10">
                    {searchResults.map((result, i) => (
                      <div key={i} className="p-4 hover:bg-fuchsia-500/5 transition-all group">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            <div className="p-2 bg-fuchsia-500/10 rounded-md mt-0.5 shrink-0">
                              <FileCode className="w-4 h-4 text-fuchsia-500" />
                            </div>
                            <div className="flex-1 min-w-0 space-y-1.5">
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-bold text-foreground truncate">{result.file}</p>
                                <Badge variant="outline" className="text-[9px] h-4 px-1.5 opacity-60">Line {result.line}</Badge>
                              </div>
                              <div className="bg-background/40 p-2.5 rounded-md border border-border/20 overflow-x-auto whitespace-pre font-mono text-[10px] text-muted-foreground/80 group-hover:text-fuchsia-500/80 transition-colors">
                                {result.snippet}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-24 text-center">
                    <Search className="w-16 h-16 mx-auto opacity-20 mb-4" />
                    <p className="text-xs font-bold text-muted-foreground opacity-40">Scan results will appear here</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="mt-0 space-y-4">
          <Card className={cardClasses}>
            <CardHeader className="flex flex-row items-center justify-between pb-4 p-6 border-b border-border/10">
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
                <DialogContent className="sm:max-w-[425px] rounded-md">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-fuchsia-600">Configure Webhook</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-6 py-4">
                    <div className="grid gap-3">
                      <Label className="text-[10px] font-bold opacity-70">Endpoint URL</Label>
                      <Input
                        placeholder="https://your-api.com/webhooks"
                        className="rounded-md border border-border/50 h-11 bg-background shadow-inner font-bold text-xs"
                        value={newWebhook.url}
                        onChange={(e) => setNewWebhook(prev => ({ ...prev, url: e.target.value }))}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddWebhook} className="rounded-md bg-fuchsia-600 hover:bg-fuchsia-700 text-white w-full h-11 font-bold">Deploy Endpoint</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              {webhooks.length > 0 ? (
                webhooks.map((hook) => (
                  <div key={hook.id} className="p-6 border-t border-border/10 hover:bg-fuchsia-500/5 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <Globe className="w-5 h-5 text-emerald-500" />
                      <div>
                        <p className="text-sm font-bold truncate max-w-xs">{hook.url}</p>
                        <div className="flex gap-2 mt-1">
                          {hook.events.map(event => (
                            <Badge key={event} variant="secondary" className="text-[9px] font-bold h-4 px-1.5">{event}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDeleteWebhook(hook.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center opacity-20">
                  <Webhook className="w-12 h-12 mx-auto" />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="apikeys" className="mt-0 space-y-4">
          <Card className={cardClasses}>
            <CardHeader className="flex flex-row items-center justify-between pb-4 p-6 border-b border-border/10">
              <div>
                <CardTitle className="text-lg font-bold">Secret API Keys</CardTitle>
                <CardDescription className="text-xs">Authenticate requests to the Devlomatix API.</CardDescription>
              </div>
              <Button size="sm" className="rounded-md gap-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold h-9">
                <Plus className="w-4 h-4" />
                Create New Key
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {apiKeys.map((key) => (
                <div key={key.id} className="flex items-center justify-between p-6 border-t border-border/10 hover:bg-fuchsia-500/5 transition-colors group">
                  <div className="space-y-1">
                    <p className="text-sm font-bold">{key.name}</p>
                    <code className="text-[10px] bg-background/80 px-2 py-1 rounded border border-border/40 font-mono text-muted-foreground">{key.key}</code>
                  </div>
                  <Button variant="ghost" size="icon" className="h-9 w-9 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => copyToClipboard(key.key)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-0 space-y-4">
          <Card className={cardClasses + " min-h-[400px]"}>
            <CardHeader className="flex flex-row items-center justify-between pb-4 p-6 border-b border-border/10">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-500" />
                  Webhook Activity
                </CardTitle>
                <CardDescription className="text-xs">Real-time log of outgoing deliveries.</CardDescription>
              </div>
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={fetchLogs} disabled={isLoadingLogs}>
                <RefreshCw className={`w-4 h-4 ${isLoadingLogs ? 'animate-spin' : ''}`} />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                {activityLogs.length > 0 ? (
                  activityLogs.map((log) => (
                    <div key={log.id} className="p-6 border-t border-border/10 hover:bg-muted/30 transition-colors flex gap-4 items-start">
                      <div className={`p-2 rounded-md mt-0.5 ${log.level === 'SUCCESS' ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                        {log.level === 'SUCCESS' ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold truncate">{log.message}</p>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-medium">{new Date(log.createdAt).toLocaleTimeString()}</span>
                          </div>
                        </div>
                        <p className="text-[10px] opacity-50 truncate">{JSON.stringify(log.details)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-24 text-center opacity-20">
                    <Activity className="w-12 h-12 mx-auto" />
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="p-4 bg-amber-500/5 rounded-md border border-amber-500/10 flex gap-4 items-start opacity-60">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground font-medium leading-relaxed">
          Sensitive developer operations are recorded in secure audit vaults for compliance and tracking.
        </p>
      </div>
    </div>
  );
};