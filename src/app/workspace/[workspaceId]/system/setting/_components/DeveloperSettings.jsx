'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from 'framer-motion';
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
  Zap,
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
  ExternalLink,
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
      {/* Dev Hub Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="p-3 bg-fuchsia-500/10 rounded-xl border border-fuchsia-500/20 flex gap-3 items-center"
      >
        <div className="w-9 h-9 bg-fuchsia-500/20 rounded-lg flex items-center justify-center border border-fuchsia-500/30 shrink-0">
          <Terminal className="w-4 h-4 text-fuchsia-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-fuchsia-500/20 text-fuchsia-500 border-fuchsia-500/30 text-[9px] font-semibold px-1.5 py-0">Dev Hub</Badge>
            <h3 className="text-xs font-bold text-white">Developer Operations</h3>
          </div>
          <p className="text-[10px] text-zinc-400 truncate mt-0.5">
            External integrations, API connectivity, and real-time event distribution.
          </p>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.05 }}
      >
        <Tabs defaultValue="webhooks" className="w-full">
          <TabsList className="bg-white/5 border border-white/10 p-0.5 rounded-lg mb-3">
            <TabsTrigger value="webhooks" className="rounded-md gap-1.5 text-xs font-semibold px-3 py-1 data-[state=active]:bg-fuchsia-500/20 data-[state=active]:text-fuchsia-500">
              <Webhook className="w-3.5 h-3.5" /> Webhooks
            </TabsTrigger>
            <TabsTrigger value="apikeys" className="rounded-md gap-1.5 text-xs font-semibold px-3 py-1 data-[state=active]:bg-fuchsia-500/20 data-[state=active]:text-fuchsia-500">
              <Key className="w-3.5 h-3.5" /> API Keys
            </TabsTrigger>
            <TabsTrigger value="activity" className="rounded-md gap-1.5 text-xs font-semibold px-3 py-1 data-[state=active]:bg-fuchsia-500/20 data-[state=active]:text-fuchsia-500">
              <Activity className="w-3.5 h-3.5" /> Live Feed
            </TabsTrigger>
            <TabsTrigger value="cleaner" className="rounded-md gap-1.5 text-xs font-semibold px-3 py-1 data-[state=active]:bg-fuchsia-500/20 data-[state=active]:text-fuchsia-500">
              <Sparkles className="w-3.5 h-3.5" /> Class Cleaner
            </TabsTrigger>
          </TabsList>

          {/* Webhooks */}
          <TabsContent value="webhooks" className="mt-0 space-y-3">
            <Card className="bg-card border-border/50 shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between p-3 border-b border-white/5">
                <div>
                  <CardTitle className="text-xs font-bold text-white">Webhook Endpoints</CardTitle>
                  <CardDescription className="text-[10px] text-zinc-500">Receive real-time notifications when events happen.</CardDescription>
                </div>
                <Dialog open={isAddWebhookOpen} onOpenChange={setIsAddWebhookOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="rounded-md gap-1 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold text-xs h-7 px-2.5">
                      <Plus className="w-3 h-3" /> Add Endpoint
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[400px] rounded-xl bg-[#0a0a0a] border-white/10 p-4">
                    <DialogHeader>
                      <DialogTitle className="text-sm font-bold text-fuchsia-500">Configure Webhook</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-3 py-3">
                      <div className="grid gap-1.5">
                        <Label className="text-[10px] font-semibold opacity-70">Endpoint URL</Label>
                        <Input
                          placeholder="https://your-api.com/webhooks"
                          className="rounded-lg border border-white/10 h-8 bg-white/5 text-xs"
                          value={newWebhook.url}
                          onChange={(e) => setNewWebhook(prev => ({ ...prev, url: e.target.value }))}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddWebhook} className="rounded-lg bg-fuchsia-600 hover:bg-fuchsia-700 text-white w-full h-8 text-xs font-bold">
                        Deploy Endpoint
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="p-0 divide-y divide-white/5">
                {webhooks.length > 0 ? (
                  webhooks.map((hook) => (
                    <div
                      key={hook.id}
                      className="p-2.5 px-3 hover:bg-fuchsia-500/5 transition-colors flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-emerald-500/10 rounded-md border border-emerald-500/20 shrink-0">
                          <Globe className="w-3.5 h-3.5 text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold truncate max-w-xs text-white">{hook.url}</p>
                          <div className="flex gap-1 mt-1">
                            {hook.events.map(event => (
                              <Badge key={event} variant="secondary" className="text-[9px] font-semibold bg-white/5 border border-white/10 px-1.5 py-0">{event}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"
                        onClick={() => handleDeleteWebhook(hook.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center opacity-30 text-xs">
                    <Webhook className="w-8 h-8 mx-auto mb-1.5" />
                    <span>No Webhooks registered</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Keys */}
          <TabsContent value="apikeys" className="mt-0 space-y-3">
            <Card className="bg-card border-border/50 shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between p-3 border-b border-white/5">
                <div>
                  <CardTitle className="text-xs font-bold text-white">Secret API Keys</CardTitle>
                  <CardDescription className="text-[10px] text-zinc-500">Authenticate requests to the Devlomatix API.</CardDescription>
                </div>
                <Button size="sm" className="rounded-md gap-1 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold text-xs h-7 px-2.5">
                  <Plus className="w-3 h-3" /> Create Key
                </Button>
              </CardHeader>
              <CardContent className="p-0 divide-y divide-white/5">
                {apiKeys.map((key) => (
                  <div key={key.id} className="flex items-center justify-between p-2.5 px-3 hover:bg-fuchsia-500/5 transition-colors group">
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-white">{key.name}</p>
                      <code className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded border border-white/10 font-mono text-zinc-400">{key.key}</code>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity bg-white/5 rounded-md" onClick={() => copyToClipboard(key.key)}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Live Activity Feed */}
          <TabsContent value="activity" className="mt-0 space-y-3">
            <Card className="bg-card border-border/50 shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between p-3 border-b border-white/5">
                <div>
                  <CardTitle className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-indigo-500" />
                    Webhook Activity
                  </CardTitle>
                  <CardDescription className="text-[10px] text-zinc-500">Real-time log of outgoing deliveries.</CardDescription>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 bg-white/5 rounded-md" onClick={fetchLogs} disabled={isLoadingLogs}>
                  <RefreshCw className={`w-3 h-3 ${isLoadingLogs ? 'animate-spin' : ''}`} />
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[280px]">
                  {activityLogs.length > 0 ? (
                    <div className="divide-y divide-white/5">
                      {activityLogs.map((log) => (
                        <div key={log.id} className="p-2.5 px-3 hover:bg-white/5 transition-colors flex gap-2.5 items-start">
                          <div className={`p-1.5 rounded-md mt-0.5 shrink-0 ${log.level === 'SUCCESS' ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-rose-500/10 border border-rose-500/20'}`}>
                            {log.level === 'SUCCESS' ? <Check className="w-3 h-3 text-emerald-500" /> : <AlertCircle className="w-3 h-3 text-rose-500" />}
                          </div>
                          <div className="flex-1 min-w-0 space-y-0.5">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-semibold truncate text-white">{log.message}</p>
                              <span className="text-[10px] text-zinc-500 font-mono">{new Date(log.createdAt).toLocaleTimeString()}</span>
                            </div>
                            <p className="text-[10px] opacity-50 truncate font-mono">{JSON.stringify(log.details)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 text-center opacity-30 text-xs">
                      <Activity className="w-8 h-8 mx-auto mb-1.5" />
                      <span>No activity logs recorded</span>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Class Cleaner */}
          <TabsContent value="cleaner" className="mt-0 space-y-3">
            <Card className="bg-card border-border/50 shadow-xs">
              <CardHeader className="border-b border-white/10 bg-fuchsia-500/10 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-fuchsia-500" />
                      Global Class Search
                    </CardTitle>
                    <CardDescription className="text-[10px] text-zinc-500">Find occurrences of CSS classes across src/app.</CardDescription>
                  </div>
                  {searchResults.length > 0 && (
                    <Badge className="bg-fuchsia-500/20 text-fuchsia-500 border-fuchsia-500/30 text-[9px] font-semibold px-2 py-0">
                      {searchResults.length} Matches
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2 mt-2.5">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                    <Input
                      placeholder="Enter class name (e.g. font-bold, italic...)"
                      className="pl-8 h-8 bg-white/5 border-white/10 rounded-md text-xs"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={handleClassSearch}
                    disabled={isSearching}
                    className="rounded-md bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold text-xs h-8 px-3"
                  >
                    {isSearching ? <Loader2 className="w-3 h-3 animate-spin mr-1.5" /> : <Search className="w-3 h-3 mr-1.5" />}
                    Scan
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[280px]">
                  {searchResults.length > 0 ? (
                    <div className="divide-y divide-white/5">
                      {searchResults.map((result, i) => (
                        <div key={i} className="p-2.5 px-3 hover:bg-fuchsia-500/5 transition-all group">
                          <div className="flex items-start gap-2.5">
                            <FileCode className="w-3.5 h-3.5 text-fuchsia-500 mt-0.5 shrink-0" />
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-semibold text-white truncate">{result.file}</p>
                                <Badge variant="outline" className="text-[9px] font-semibold opacity-60 px-1 py-0">L{result.line}</Badge>
                              </div>
                              <div className="bg-white/5 p-1.5 rounded-md border border-white/10 overflow-x-auto whitespace-pre font-mono text-[10px] text-zinc-400">
                                {result.snippet}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 text-center opacity-30 text-xs">
                      <Search className="w-8 h-8 mx-auto mb-1.5" />
                      <span>Scan results will appear here</span>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      <div className="p-2.5 bg-amber-500/10 rounded-lg border border-amber-500/20 flex gap-2.5 items-center text-xs text-amber-500">
        <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
        <span className="text-[10px] text-zinc-400 font-medium">
          Sensitive developer operations are recorded in secure audit vaults for compliance.
        </span>
      </div>
    </div>
  );
};
