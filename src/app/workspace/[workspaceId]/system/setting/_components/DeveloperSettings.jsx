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
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-6 bg-fuchsia-500/10 rounded-xl border border-fuchsia-500/20 flex gap-6 items-center"
      >
        <div className="w-16 h-16 bg-fuchsia-500/20 rounded-xl flex items-center justify-center border border-fuchsia-500/30 shrink-0">
          <Terminal className="w-8 h-8 text-fuchsia-500" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="bg-fuchsia-500/20 text-fuchsia-500 border-fuchsia-500/30 text-xs font-semibold">Dev Hub</Badge>
            <h3 className="text-lg font-bold text-white">Developer Operations</h3>
          </div>
          <p className="text-sm text-zinc-400">
            Control your external integrations, API connectivity, and real-time event distribution.
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Tabs defaultValue="webhooks" className="w-full">
          <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl mb-6">
            <TabsTrigger value="webhooks" className="rounded-lg gap-2 text-sm font-semibold px-4 py-2 transition-all data-[state=active]:bg-fuchsia-500/20 data-[state=active]:text-fuchsia-500">
              <Webhook className="w-4 h-4" />
              Webhooks & Automation
            </TabsTrigger>
            <TabsTrigger value="apikeys" className="rounded-lg gap-2 text-sm font-semibold px-4 py-2 transition-all data-[state=active]:bg-fuchsia-500/20 data-[state=active]:text-fuchsia-500">
              <Key className="w-4 h-4" />
              API Access
            </TabsTrigger>
            <TabsTrigger value="activity" className="rounded-lg gap-2 text-sm font-semibold px-4 py-2 transition-all data-[state=active]:bg-fuchsia-500/20 data-[state=active]:text-fuchsia-500">
              <Activity className="w-4 h-4" />
              Live Feed
            </TabsTrigger>
            <TabsTrigger value="cleaner" className="rounded-lg gap-2 text-sm font-semibold px-4 py-2 transition-all data-[state=active]:bg-fuchsia-500/20 data-[state=active]:text-fuchsia-500">
              <Sparkles className="w-4 h-4" />
              Class Cleaner
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cleaner" className="mt-0 space-y-4">
            <Card className="bg-card border-white/10 backdrop-blur-xl">
              <CardHeader className="border-b border-white/10 bg-fuchsia-500/10 pb-6 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-fuchsia-500" />
                      Global Class Search
                    </CardTitle>
                    <CardDescription className="text-xs text-zinc-500">Find all occurrences of a specific CSS class across your project (src/app).</CardDescription>
                  </div>
                  {searchResults.length > 0 && (
                    <Badge className="bg-fuchsia-500/20 text-fuchsia-500 border-fuchsia-500/30 font-semibold px-3 py-1">
                      {searchResults.length} Matches
                    </Badge>
                  )}
                </div>
                <div className="flex gap-3 mt-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input
                      placeholder="Enter class name (e.g. font-bold, italic, uppercase...)"
                      className="pl-11 h-12 bg-white/5 border-white/10 rounded-xl font-semibold text-sm"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={handleClassSearch}
                    disabled={isSearching}
                    className="rounded-xl bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-semibold h-12 px-6 shadow-lg shadow-fuchsia-500/20"
                  >
                    {isSearching ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
                    Scan Project
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px]">
                  {searchResults.length > 0 ? (
                    <div className="divide-y divide-white/5">
                      {searchResults.map((result, i) => (
                        <div key={i} className="p-4 hover:bg-fuchsia-500/5 transition-all group">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4 flex-1 min-w-0">
                              <div className="p-2.5 bg-fuchsia-500/10 rounded-lg border border-fuchsia-500/20 mt-0.5 shrink-0">
                                <FileCode className="w-4 h-4 text-fuchsia-500" />
                              </div>
                              <div className="flex-1 min-w-0 space-y-2">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-semibold text-white truncate">{result.file}</p>
                                  <Badge variant="outline" className="text-[10px] font-semibold opacity-60">Line {result.line}</Badge>
                                </div>
                                <div className="bg-white/5 p-3 rounded-lg border border-white/10 overflow-x-auto whitespace-pre font-mono text-xs text-zinc-400 group-hover:text-fuchsia-400/80 transition-colors">
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
                      <p className="text-sm font-semibold text-zinc-500 opacity-40">Scan results will appear here</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="webhooks" className="mt-0 space-y-4">
            <Card className="bg-card border-white/10 backdrop-blur-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-6 p-6 border-b border-white/10">
                <div>
                  <CardTitle className="text-lg font-bold text-white">Webhook Endpoints</CardTitle>
                  <CardDescription className="text-xs text-zinc-500">Receive real-time notifications when events happen in your workspace.</CardDescription>
                </div>
                <Dialog open={isAddWebhookOpen} onOpenChange={setIsAddWebhookOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="rounded-xl gap-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-semibold h-10">
                      <Plus className="w-4 h-4" />
                      Add Endpoint
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] rounded-xl bg-[#0a0a0a] border-white/10">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold text-fuchsia-500">Configure Webhook</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                      <div className="grid gap-3">
                        <Label className="text-xs font-semibold opacity-70">Endpoint URL</Label>
                        <Input
                          placeholder="https://your-api.com/webhooks"
                          className="rounded-xl border border-white/10 h-12 bg-white/5 shadow-inner font-semibold text-sm"
                          value={newWebhook.url}
                          onChange={(e) => setNewWebhook(prev => ({ ...prev, url: e.target.value }))}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddWebhook} className="rounded-xl bg-fuchsia-600 hover:bg-fuchsia-700 text-white w-full h-12 font-semibold">Deploy Endpoint</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="p-0">
                {webhooks.length > 0 ? (
                  webhooks.map((hook) => (
                    <motion.div
                      key={hook.id}
                      className="p-6 border-t border-white/10 hover:bg-fuchsia-500/5 transition-colors flex items-center justify-between group"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                          <Globe className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold truncate max-w-xs text-white">{hook.url}</p>
                          <div className="flex gap-2 mt-2">
                            {hook.events.map(event => (
                              <Badge key={event} variant="secondary" className="text-[10px] font-semibold bg-white/5 border border-white/10">{event}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                        onClick={() => handleDeleteWebhook(hook.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </motion.div>
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
            <Card className="bg-card border-white/10 backdrop-blur-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-6 p-6 border-b border-white/10">
                <div>
                  <CardTitle className="text-lg font-bold text-white">Secret API Keys</CardTitle>
                  <CardDescription className="text-xs text-zinc-500">Authenticate requests to the Devlomatix API.</CardDescription>
                </div>
                <Button size="sm" className="rounded-xl gap-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-semibold h-10">
                  <Plus className="w-4 h-4" />
                  Create New Key
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {apiKeys.map((key) => (
                  <div key={key.id} className="flex items-center justify-between p-6 border-t border-white/10 hover:bg-fuchsia-500/5 transition-colors group">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-white">{key.name}</p>
                      <code className="text-xs bg-white/10 px-2 py-1.5 rounded-lg border border-white/10 font-mono text-zinc-400">{key.key}</code>
                    </div>
                    <Button variant="ghost" size="icon" className="h-10 w-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white/5 rounded-lg" onClick={() => copyToClipboard(key.key)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="mt-0 space-y-4">
            <Card className="bg-card border-white/10 backdrop-blur-xl min-h-[400px]">
              <CardHeader className="flex flex-row items-center justify-between pb-6 p-6 border-b border-white/10">
                <div>
                  <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-500" />
                    Webhook Activity
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-500">Real-time log of outgoing deliveries.</CardDescription>
                </div>
                <Button variant="ghost" size="icon" className="h-10 w-10 bg-white/5 rounded-lg" onClick={fetchLogs} disabled={isLoadingLogs}>
                  <RefreshCw className={`w-4 h-4 ${isLoadingLogs ? 'animate-spin' : ''}`} />
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px]">
                  {activityLogs.length > 0 ? (
                    activityLogs.map((log) => (
                      <div key={log.id} className="p-6 border-t border-white/10 hover:bg-white/5 transition-colors flex gap-4 items-start">
                        <div className={`p-2.5 rounded-lg mt-0.5 ${log.level === 'SUCCESS' ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-rose-500/10 border border-rose-500/20'}`}>
                          {log.level === 'SUCCESS' ? <Check className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-rose-500" />}
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold truncate text-white">{log.message}</p>
                            <div className="flex items-center gap-2 text-zinc-500">
                              <Clock className="w-4 h-4" />
                              <span className="text-xs font-medium">{new Date(log.createdAt).toLocaleTimeString()}</span>
                            </div>
                          </div>
                          <p className="text-xs opacity-50 truncate font-mono">{JSON.stringify(log.details)}</p>
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
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20 flex gap-4 items-start"
      >
        <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-sm text-zinc-400 font-medium leading-relaxed">
          Sensitive developer operations are recorded in secure audit vaults for compliance and tracking.
        </p>
      </motion.div>
    </div>
  );
};
