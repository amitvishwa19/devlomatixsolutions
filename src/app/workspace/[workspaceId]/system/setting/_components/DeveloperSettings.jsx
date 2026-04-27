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

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Developer Hub Header */}
      <div className="p-4 rounded-md border border-fuchsia-500/10 flex gap-4 items-center bg-fuchsia-500/[0.01]">
        <div className="w-10 h-10 bg-fuchsia-500/5 rounded-md flex items-center justify-center border border-fuchsia-500/10 shrink-0">
          <Terminal className="w-5 h-5 text-fuchsia-500" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-fuchsia-500/5 text-fuchsia-600 border-fuchsia-500/10 text-[8px] h-4 uppercase font-bold tracking-tighter px-1.5">Dev Hub</Badge>
            <h3 className="text-sm font-bold text-foreground">Developer Operations</h3>
          </div>
          <p className="text-[10px] text-muted-foreground font-medium mt-0.5 opacity-60">
            Control API connectivity and real-time event distribution.
          </p>
        </div>
      </div>

      <Tabs defaultValue="webhooks" className="w-full">
        <TabsList className="bg-transparent border border-border/50 p-1 rounded-md mb-4 h-9 gap-1">
          {['webhooks', 'apikeys', 'activity', 'cleaner'].map((tab) => (
            <TabsTrigger 
              key={tab} 
              value={tab} 
              className="rounded-md gap-2 text-[10px] font-bold px-3 transition-all data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:border-primary/20 border border-transparent h-7"
            >
              {tab === 'webhooks' && <Webhook className="w-3 h-3" />}
              {tab === 'apikeys' && <Key className="w-3 h-3" />}
              {tab === 'activity' && <Activity className="w-3 h-3" />}
              {tab === 'cleaner' && <Sparkles className="w-3 h-3" />}
              <span className="capitalize">{tab}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="cleaner" className="mt-0 space-y-3">
          <Card className="rounded-md border border-border/50 bg-transparent overflow-hidden">
            <CardHeader className="border-b border-border/10 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-fuchsia-500" />
                    Global Class Search
                  </CardTitle>
                </div>
                {searchResults.length > 0 && (
                  <Badge variant="outline" className="text-[9px] h-4">
                    {searchResults.length} Matches
                  </Badge>
                )}
              </div>
              <div className="flex gap-2 mt-3">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground/40" />
                  <Input
                    placeholder="Search CSS classes..."
                    className="pl-8 h-8 bg-transparent border-border/50 rounded-md font-medium text-[11px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button
                  size="sm"
                  onClick={handleClassSearch}
                  disabled={isSearching}
                  className="rounded-md bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold h-8 px-4 text-[10px]"
                >
                  {isSearching ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Search className="w-3 h-3 mr-2" />}
                  Scan
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[300px]">
                {searchResults.length > 0 ? (
                  <div className="divide-y divide-border/10">
                    {searchResults.map((result, i) => (
                      <div key={i} className="p-3 hover:bg-fuchsia-500/5 transition-all group">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <FileCode className="w-3.5 h-3.5 text-fuchsia-500 mt-0.5 shrink-0" />
                            <div className="flex-1 min-w-0 space-y-1">
                              <p className="text-[10px] font-bold text-foreground truncate">{result.file} <span className="opacity-40 ml-1">L{result.line}</span></p>
                              <div className="bg-muted/5 p-2 rounded border border-border/50 font-mono text-[9px] text-muted-foreground truncate">
                                {result.snippet}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center opacity-30">
                    <Search className="w-10 h-10 mx-auto mb-2" />
                    <p className="text-[10px] font-bold uppercase">Search results</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="mt-0 space-y-3">
          <Card className="rounded-md border border-border/50 bg-transparent overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between p-3 border-b border-border/10">
              <div>
                <CardTitle className="text-sm font-bold">Endpoints</CardTitle>
              </div>
              <Dialog open={isAddWebhookOpen} onOpenChange={setIsAddWebhookOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="rounded-md h-7 px-3 bg-fuchsia-600 hover:bg-fuchsia-700 text-white text-[10px] font-bold">
                    <Plus className="w-3 h-3 mr-1" />
                    Add
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[400px] rounded-md">
                  <DialogHeader>
                    <DialogTitle className="text-base font-bold text-fuchsia-600">Configure Webhook</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">URL</Label>
                      <Input
                        placeholder="https://your-api.com/webhooks"
                        className="rounded-md border border-border/50 h-9 bg-transparent font-medium text-xs"
                        value={newWebhook.url}
                        onChange={(e) => setNewWebhook(prev => ({ ...prev, url: e.target.value }))}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddWebhook} className="rounded-md bg-fuchsia-600 hover:bg-fuchsia-700 text-white w-full h-9 text-xs font-bold">Deploy Endpoint</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              {webhooks.length > 0 ? (
                webhooks.map((hook) => (
                  <div key={hook.id} className="p-3 border-b border-border/10 last:border-0 flex items-center justify-between group">
                    <div className="flex items-center gap-3 truncate">
                      <Globe className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <div className="truncate">
                        <p className="text-[11px] font-bold truncate">{hook.url}</p>
                        <div className="flex gap-1 mt-0.5">
                          {hook.events.map(event => (
                            <span key={event} className="text-[8px] bg-muted px-1 rounded opacity-60">{event}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDeleteWebhook(hook.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center opacity-30">
                  <Webhook className="w-8 h-8 mx-auto" />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="apikeys" className="mt-0 space-y-3">
          <Card className="rounded-md border border-border/50 bg-transparent overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between p-3 border-b border-border/10">
              <CardTitle className="text-sm font-bold">API Access Keys</CardTitle>
              <Button size="sm" className="rounded-md h-7 px-3 bg-fuchsia-600 hover:bg-fuchsia-700 text-white text-[10px] font-bold">New Key</Button>
            </CardHeader>
            <CardContent className="p-0">
              {apiKeys.map((key) => (
                <div key={key.id} className="p-3 border-b border-border/10 last:border-0 flex items-center justify-between group">
                  <div className="space-y-0.5">
                    <p className="text-[11px] font-bold">{key.name}</p>
                    <code className="text-[9px] opacity-60 font-mono">{key.key}</code>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 border border-border/50" onClick={() => copyToClipboard(key.key)}>
                    <Copy className="w-3 h-3 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-0 space-y-3">
          <Card className="rounded-md border border-border/50 bg-transparent overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between p-3 border-b border-border/10">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-500" />
                Live Feed
              </CardTitle>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={fetchLogs} disabled={isLoadingLogs}>
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLogs ? 'animate-spin' : ''}`} />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[300px]">
                {activityLogs.length > 0 ? (
                  activityLogs.map((log) => (
                    <div key={log.id} className="p-3 border-b border-border/10 last:border-0 flex gap-3 items-start">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${log.level === 'SUCCESS' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-bold truncate">{log.message}</p>
                          <span className="text-[8px] opacity-40">{new Date(log.createdAt).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-[9px] opacity-50 truncate">{JSON.stringify(log.details)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center opacity-20">
                    <Activity className="w-8 h-8 mx-auto" />
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="p-2.5 rounded-md border border-amber-500/10 bg-amber-500/[0.02] flex gap-2.5 items-start">
        <ShieldCheck className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Sensitive developer operations are recorded in secure audit vaults.
        </p>
      </div>
    </div>
  );
};