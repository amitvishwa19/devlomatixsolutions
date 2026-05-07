'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import axios from '@/utils/axios';
import { useParams } from 'next/navigation';
import {
  Terminal,
  Key,
  Webhook,
  Plus,
  Copy,
  RefreshCw,
  Trash2,
  ShieldCheck,
  Globe,
  Check,
  AlertCircle,
  Loader2,
  Activity,
  ShieldAlert,
  Clock,
  Sparkles,
  Search,
  FileCode,
} from 'lucide-react';
import { toast } from 'sonner';
import { useSettings } from '@/providers/WorkspaceProvider';

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
    <div className="space-y-3">
      <Card className="bg-fuchsia-500/10 border-fuchsia-500/20">
        <CardContent className="p-3 flex gap-4 items-center">
          <div className="w-12 h-12 bg-fuchsia-500/20 rounded-lg flex items-center justify-center border border-fuchsia-500/30 shrink-0">
            <Terminal className="w-6 h-6 text-fuchsia-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="bg-fuchsia-500/20 text-fuchsia-500 border-fuchsia-500/30 text-[10px] font-semibold">Dev Hub</Badge>
              <h3 className="text-sm font-bold text-white">Developer Operations</h3>
            </div>
            <p className="text-[10px] text-zinc-500">
              Control your external integrations, API connectivity, and real-time event distribution.
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="webhooks" className="w-full">
        <TabsList className="bg-white/5 border border-white/10 p-1 rounded-lg mb-3 w-full justify-start">
          <TabsTrigger value="webhooks" className="rounded gap-1.5 text-[10px] font-semibold px-3 py-1.5 transition-all data-[state=active]:bg-fuchsia-500/20 data-[state=active]:text-fuchsia-500">
            <Webhook className="w-3 h-3" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="apikeys" className="rounded gap-1.5 text-[10px] font-semibold px-3 py-1.5 transition-all data-[state=active]:bg-fuchsia-500/20 data-[state=active]:text-fuchsia-500">
            <Key className="w-3 h-3" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="activity" className="rounded gap-1.5 text-[10px] font-semibold px-3 py-1.5 transition-all data-[state=active]:bg-fuchsia-500/20 data-[state=active]:text-fuchsia-500">
            <Activity className="w-3 h-3" />
            Live Feed
          </TabsTrigger>
          <TabsTrigger value="cleaner" className="rounded gap-1.5 text-[10px] font-semibold px-3 py-1.5 transition-all data-[state=active]:bg-fuchsia-500/20 data-[state=active]:text-fuchsia-500">
            <Sparkles className="w-3 h-3" />
            Cleaner
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cleaner" className="mt-0 space-y-2">
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="border-b border-white/10 bg-fuchsia-500/10 pb-3 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-fuchsia-500" />
                    Global Class Search
                  </CardTitle>
                  <CardDescription className="text-[10px] text-zinc-500">Find CSS class occurrences in src/app.</CardDescription>
                </div>
                {searchResults.length > 0 && (
                  <Badge className="bg-fuchsia-500/20 text-fuchsia-500 border-fuchsia-500/30 font-semibold text-[10px] px-2 py-0.5">
                    {searchResults.length} Matches
                  </Badge>
                )}
              </div>
              <div className="flex gap-2 mt-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500" />
                  <Input
                    placeholder="Enter class name..."
                    className="pl-8 h-8 bg-white/5 border-white/10 rounded text-xs font-medium"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleClassSearch}
                  disabled={isSearching}
                  className="rounded bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-semibold text-[10px] h-8 px-3"
                >
                  {isSearching ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Search className="w-3 h-3 mr-1" />}
                  Scan
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[200px]">
                {searchResults.length > 0 ? (
                  <div className="divide-y divide-white/5">
                    {searchResults.map((result, i) => (
                      <div key={i} className="p-2.5 hover:bg-fuchsia-500/5 transition-all">
                        <div className="flex items-start gap-2">
                          <div className="p-1.5 bg-fuchsia-500/10 rounded border border-fuchsia-500/20 mt-0.5 shrink-0">
                            <FileCode className="w-3 h-3 text-fuchsia-500" />
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-semibold text-white truncate">{result.file}</p>
                              <Badge variant="outline" className="text-[9px] font-medium opacity-60">Line {result.line}</Badge>
                            </div>
                            <div className="bg-white/5 p-1.5 rounded border border-white/10 overflow-x-auto whitespace-pre font-mono text-[10px] text-zinc-400">
                              {result.snippet}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Search className="w-8 h-8 mx-auto opacity-20 mb-2" />
                    <p className="text-xs font-medium text-zinc-500 opacity-40">Scan results appear here</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="mt-0 space-y-2">
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="flex flex-row items-center justify-between pb-3 p-3 border-b border-white/10">
              <div>
                <CardTitle className="text-sm font-bold text-white">Webhook Endpoints</CardTitle>
                <CardDescription className="text-[10px] text-zinc-500">Real-time event notifications.</CardDescription>
              </div>
              <Dialog open={isAddWebhookOpen} onOpenChange={setIsAddWebhookOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="rounded gap-1 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-semibold text-[10px] h-7 px-2">
                    <Plus className="w-3 h-3" />
                    Add
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[400px] rounded-lg bg-[#0a0a0a] border-white/10">
                  <DialogHeader>
                    <DialogTitle className="text-base font-bold text-fuchsia-500">Configure Webhook</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-3">
                    <div className="grid gap-2">
                      <Label className="text-[10px] font-semibold opacity-70">Endpoint URL</Label>
                      <Input
                        placeholder="https://your-api.com/webhooks"
                        className="rounded border border-white/10 h-9 bg-white/5 font-medium text-xs"
                        value={newWebhook.url}
                        onChange={(e) => setNewWebhook(prev => ({ ...prev, url: e.target.value }))}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddWebhook} className="rounded bg-fuchsia-600 hover:bg-fuchsia-700 text-white w-full h-9 font-semibold">Deploy Endpoint</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              {webhooks.length > 0 ? (
                webhooks.map((hook) => (
                  <div key={hook.id} className="p-2.5 border-t border-white/10 hover:bg-fuchsia-500/5 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-emerald-500/10 rounded border border-emerald-500/20">
                        <Globe className="w-3.5 h-3.5 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold truncate max-w-[150px] text-white">{hook.url}</p>
                        <div className="flex gap-1 mt-1">
                          {hook.events.map(event => (
                            <Badge key={event} variant="secondary" className="text-[9px] font-medium bg-white/5 border border-white/10">{event}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded"
                      onClick={() => handleDeleteWebhook(hook.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center opacity-20">
                  <Webhook className="w-6 h-6 mx-auto" />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="apikeys" className="mt-0 space-y-2">
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="flex flex-row items-center justify-between pb-3 p-3 border-b border-white/10">
              <div>
                <CardTitle className="text-sm font-bold text-white">Secret API Keys</CardTitle>
                <CardDescription className="text-[10px] text-zinc-500">Authenticate requests to the Devlomatix API.</CardDescription>
              </div>
              <Button size="sm" className="rounded gap-1 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-semibold text-[10px] h-7 px-2">
                <Plus className="w-3 h-3" />
                New Key
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {apiKeys.map((key) => (
                <div key={key.id} className="flex items-center justify-between p-2.5 border-t border-white/10 hover:bg-fuchsia-500/5 transition-colors group">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-white">{key.name}</p>
                    <code className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded border border-white/10 font-mono text-zinc-400">{key.key}</code>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity bg-white/5 rounded" onClick={() => copyToClipboard(key.key)}>
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-0 space-y-2">
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="flex flex-row items-center justify-between pb-3 p-3 border-b border-white/10">
              <div>
                <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-500" />
                  Webhook Activity
                </CardTitle>
                <CardDescription className="text-[10px] text-zinc-500">Real-time log of outgoing deliveries.</CardDescription>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 bg-white/5 rounded" onClick={fetchLogs} disabled={isLoadingLogs}>
                <RefreshCw className={`w-3 h-3 ${isLoadingLogs ? 'animate-spin' : ''}`} />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[200px]">
                {activityLogs.length > 0 ? (
                  activityLogs.map((log) => (
                    <div key={log.id} className="p-2.5 border-t border-white/10 hover:bg-white/5 transition-colors flex gap-2 items-start">
                      <div className={`p-1.5 rounded mt-0.5 ${log.level === 'SUCCESS' ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-rose-500/10 border border-rose-500/20'}`}>
                        {log.level === 'SUCCESS' ? <Check className="w-3 h-3 text-emerald-500" /> : <AlertCircle className="w-3 h-3 text-rose-500" />}
                      </div>
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold truncate text-white">{log.message}</p>
                          <div className="flex items-center gap-1 text-zinc-500">
                            <Clock className="w-3 h-3" />
                            <span className="text-[10px] font-medium">{new Date(log.createdAt).toLocaleTimeString()}</span>
                          </div>
                        </div>
                        <p className="text-[10px] opacity-50 truncate font-mono">{JSON.stringify(log.details)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center opacity-20">
                    <Activity className="w-6 h-6 mx-auto" />
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="p-2.5 bg-amber-500/10 rounded-lg border border-amber-500/20 flex gap-2 items-start">
        <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">
          Sensitive developer operations are recorded in secure audit vaults for compliance and tracking.
        </p>
      </div>
    </div>
  );
};
