'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radio,
  Server,
  Globe,
  Laptop,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Zap,
  Shield,
  Key,
  Copy,
  Check,
  RotateCcw,
  Activity,
  Sliders,
  ExternalLink,
  Loader2,
  Wifi,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';
import { useSettings } from '@/providers/WorkspaceProvider';
import { useCrmSocket } from '@/providers/CrmSocketProvider';
import { StickySaveBar } from './StickySaveBar';

const DEFAULT_DEV_URL = 'http://localhost:5001';
const DEFAULT_PROD_URL = 'https://socket.devlomatix.in';
const DEFAULT_SECRET = 'devlomatix_internal_secret_key_2026';

export const SocketServerSettings = () => {
  const { settings, updateSettings, saving } = useSettings();
  const {
    isConnected,
    connectionStatus = 'disconnected',
    socketUrl: activeLiveUrl = '',
    latency: liveLatency = null,
    reconnect,
    checkLatency
  } = useCrmSocket() || {};

  // Local Form State
  const [formState, setFormState] = useState({
    devUrl: DEFAULT_DEV_URL,
    prodUrl: DEFAULT_PROD_URL,
    environmentMode: 'auto', // 'auto' | 'development' | 'production'
    internalSecret: DEFAULT_SECRET,
    enableLocalFallback: true,
  });

  const [initialState, setInitialState] = useState(null);
  const [showSecret, setShowSecret] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  // Test Connection States
  const [testingDev, setTestingDev] = useState(false);
  const [devTestResult, setDevTestResult] = useState(null);

  const [testingProd, setTestingProd] = useState(false);
  const [prodTestResult, setProdTestResult] = useState(null);

  // Synchronize initial settings from WorkspaceProvider
  useEffect(() => {
    if (settings?.socketServer) {
      const serverConfig = {
        devUrl: settings.socketServer.devUrl || DEFAULT_DEV_URL,
        prodUrl: settings.socketServer.prodUrl || DEFAULT_PROD_URL,
        environmentMode: settings.socketServer.environmentMode || 'auto',
        internalSecret: settings.socketServer.internalSecret || DEFAULT_SECRET,
        enableLocalFallback: settings.socketServer.enableLocalFallback ?? true,
      };
      setFormState(serverConfig);
      setInitialState(serverConfig);
    } else {
      // Check localStorage for any cached configuration
      try {
        const cached = localStorage.getItem('devlomatix_socket_config');
        if (cached) {
          const parsed = JSON.parse(cached);
          const config = {
            devUrl: parsed.devUrl || DEFAULT_DEV_URL,
            prodUrl: parsed.prodUrl || DEFAULT_PROD_URL,
            environmentMode: parsed.environmentMode || 'auto',
            internalSecret: parsed.internalSecret || DEFAULT_SECRET,
            enableLocalFallback: parsed.enableLocalFallback ?? true,
          };
          setFormState(config);
          setInitialState(config);
        }
      } catch (_) {}
    }
  }, [settings]);

  // Track unsaved dirty state
  const isDirty = useMemo(() => {
    if (!initialState) return false;
    return (
      formState.devUrl !== initialState.devUrl ||
      formState.prodUrl !== initialState.prodUrl ||
      formState.environmentMode !== initialState.environmentMode ||
      formState.internalSecret !== initialState.internalSecret ||
      formState.enableLocalFallback !== initialState.enableLocalFallback
    );
  }, [formState, initialState]);

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`Copied ${fieldName} to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Test Server Reachability via Backend Test Endpoint
  const handleTestUrl = async (target, url) => {
    if (!url) {
      toast.error('Please enter a valid URL before testing');
      return;
    }

    if (target === 'dev') {
      setTestingDev(true);
      setDevTestResult(null);
    } else {
      setTestingProd(true);
      setProdTestResult(null);
    }

    try {
      const res = await fetch('/api/system/socket-config/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await res.json();

      if (target === 'dev') {
        setDevTestResult(data);
        if (data.success) {
          toast.success(`Development server is reachable (${data.latency}ms)`);
        } else {
          toast.error(`Development server unreachable: ${data.message}`);
        }
      } else {
        setProdTestResult(data);
        if (data.success) {
          toast.success(`Production server is reachable (${data.latency}ms)`);
        } else {
          toast.error(`Production server unreachable: ${data.message}`);
        }
      }
    } catch (err) {
      const errorResult = { success: false, message: err.message };
      if (target === 'dev') {
        setDevTestResult(errorResult);
        toast.error(`Failed to test development server: ${err.message}`);
      } else {
        setProdTestResult(errorResult);
        toast.error(`Failed to test production server: ${err.message}`);
      }
    } finally {
      if (target === 'dev') setTestingDev(false);
      else setTestingProd(false);
    }
  };

  // Save Settings Globally
  const handleSave = async () => {
    const cleanDevUrl = formState.devUrl.trim().replace(/\/+$/, '');
    const cleanProdUrl = formState.prodUrl.trim().replace(/\/+$/, '');

    if (!cleanDevUrl) {
      toast.error('Development socket server URL cannot be empty');
      return;
    }
    if (!cleanProdUrl) {
      toast.error('Production socket server URL cannot be empty');
      return;
    }

    const payload = {
      ...formState,
      devUrl: cleanDevUrl,
      prodUrl: cleanProdUrl,
      updatedAt: new Date().toISOString()
    };

    // 1. Update Workspace Provider (saves to prisma.appSettings key='global')
    updateSettings({
      socketServer: payload
    });

    // 2. Also directly push to standalone /api/system/socket-config for immediate persistence
    try {
      await fetch('/api/system/socket-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (_) {}

    // 3. Cache in localStorage for immediate client-side instant reloads
    try {
      localStorage.setItem('devlomatix_socket_config', JSON.stringify(payload));
    } catch (_) {}

    // 4. Notify other listeners and reconnect live socket
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('devlomatix-socket-config-changed', { detail: payload }));
    }

    setInitialState(payload);
    toast.success('Socket server settings saved to global configuration!');

    // Trigger instant reconnect with new endpoints
    if (reconnect) {
      setTimeout(() => {
        reconnect();
      }, 500);
    }
  };

  const handleReset = () => {
    if (initialState) {
      setFormState(initialState);
      toast.info('Discarded unsaved socket server changes');
    }
  };

  // Compute what the effective active URL is right now
  const computedActiveUrl = useMemo(() => {
    if (typeof window === 'undefined') return formState.prodUrl;
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (formState.environmentMode === 'development') return formState.devUrl;
    if (formState.environmentMode === 'production') return formState.prodUrl;
    return isLocal ? formState.devUrl : formState.prodUrl;
  }, [formState]);

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-12">
      {/* Overview & Live Status Card */}
      <Card className="bg-gradient-to-br from-card via-card to-cyan-500/5 border-border/70 shadow-sm overflow-hidden">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 shrink-0">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm sm:text-base font-bold text-foreground">
                    WebSocket & WebRTC Signaling Server
                  </h2>
                  <Badge variant="outline" className="text-[10px] bg-cyan-500/10 text-cyan-500 border-cyan-500/30 font-semibold gap-1">
                    <Globe className="w-3 h-3" />
                    Universal Global
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Real-time events, WhatsApp Baileys sync, presence & VoIP WebRTC signaling.
                </p>
              </div>
            </div>

            {/* Live Connection Capsule */}
            <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/40 border border-border/50 text-xs">
                <span className="relative flex h-2 w-2">
                  {isConnected ? (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </>
                  ) : (
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  )}
                </span>
                <span className="font-semibold capitalize text-foreground">
                  {isConnected ? 'Connected' : connectionStatus}
                </span>
                {isConnected && liveLatency !== null && (
                  <span className="font-mono text-[10px] text-muted-foreground bg-background/50 px-1 py-0.5 rounded border border-border/40">
                    {liveLatency}ms
                  </span>
                )}
              </div>

              {reconnect && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={reconnect}
                  className="h-8 text-xs font-semibold gap-1.5 hover:bg-secondary/60 cursor-pointer"
                  title="Reconnect to active signaling server"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span className="hidden sm:inline">Reconnect</span>
                </Button>
              )}
            </div>
          </div>

          {/* Current Active Routing Banner */}
          <div className="mt-4 p-3 rounded-lg bg-secondary/20 border border-border/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <Activity className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
              <span className="text-muted-foreground">Effective Active Server:</span>
              <span className="font-mono font-semibold text-foreground truncate">
                {activeLiveUrl || computedActiveUrl}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground shrink-0">
              <span>Mode:</span>
              <Badge variant="secondary" className="capitalize text-[10px] font-bold">
                {formState.environmentMode}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Environment Mode Selection Card */}
      <Card className="border-border/70 shadow-2xs">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-500" />
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Environment Routing Mode
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Choose how Devlomatix determines which socket server endpoint clients and backend bridges connect to.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Auto Detect */}
            <div
              onClick={() => setFormState(prev => ({ ...prev, environmentMode: 'auto' }))}
              className={`p-3 rounded-xl border transition-all cursor-pointer relative ${
                formState.environmentMode === 'auto'
                  ? 'bg-cyan-500/10 border-cyan-500/40 shadow-xs'
                  : 'bg-card hover:bg-secondary/30 border-border/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                  Auto-Detect (Recommended)
                </span>
                {formState.environmentMode === 'auto' && (
                  <Check className="w-4 h-4 text-cyan-500" />
                )}
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Connects to <strong className="text-foreground">Development URL</strong> on localhost and <strong className="text-foreground">Production URL</strong> on deployed cloud domains.
              </p>
            </div>

            {/* Development Mode */}
            <div
              onClick={() => setFormState(prev => ({ ...prev, environmentMode: 'development' }))}
              className={`p-3 rounded-xl border transition-all cursor-pointer relative ${
                formState.environmentMode === 'development'
                  ? 'bg-amber-500/10 border-amber-500/40 shadow-xs'
                  : 'bg-card hover:bg-secondary/30 border-border/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Laptop className="w-3.5 h-3.5 text-amber-500" />
                  Force Development
                </span>
                {formState.environmentMode === 'development' && (
                  <Check className="w-4 h-4 text-amber-500" />
                )}
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Forces all sessions and backend bridges to connect exclusively to the Development server path.
              </p>
            </div>

            {/* Production Mode */}
            <div
              onClick={() => setFormState(prev => ({ ...prev, environmentMode: 'production' }))}
              className={`p-3 rounded-xl border transition-all cursor-pointer relative ${
                formState.environmentMode === 'production'
                  ? 'bg-emerald-500/10 border-emerald-500/40 shadow-xs'
                  : 'bg-card hover:bg-secondary/30 border-border/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-emerald-500" />
                  Force Production
                </span>
                {formState.environmentMode === 'production' && (
                  <Check className="w-4 h-4 text-emerald-500" />
                )}
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Forces all sessions and backend bridges to connect exclusively to the Production server path.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Development Socket Server Path Card */}
      <Card className="border-border/70 shadow-2xs">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Laptop className="w-4 h-4 text-amber-500" />
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Development Socket Server Path
              </CardTitle>
            </div>
            <span className="text-[11px] text-muted-foreground font-mono">
              Local Machine / Sandbox
            </span>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Target URL used when developing locally or running the standalone <code>socket-webrtc-server</code> process.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Server Endpoint URL</span>
              <span className="text-[10px] text-muted-foreground font-normal">HTTP / WS</span>
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Server className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={formState.devUrl}
                  onChange={(e) => setFormState(prev => ({ ...prev, devUrl: e.target.value }))}
                  placeholder="http://localhost:5001"
                  className="pl-9 font-mono text-xs h-9 bg-secondary/30 border-border/50 focus:border-amber-500/50"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={testingDev || !formState.devUrl}
                onClick={() => handleTestUrl('dev', formState.devUrl)}
                className="h-9 px-3 text-xs font-semibold gap-1.5 border-border/60 hover:bg-secondary/50 cursor-pointer"
              >
                {testingDev ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Testing...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>Test Dev</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-muted-foreground">
            <span className="text-[10px] font-medium mr-1">Quick Presets:</span>
            {[
              { label: 'Localhost:5001', url: 'http://localhost:5001' },
              { label: 'Localhost:5000', url: 'http://localhost:5000' },
              { label: '127.0.0.1:5001', url: 'http://127.0.0.1:5001' }
            ].map(preset => (
              <button
                key={preset.url}
                type="button"
                onClick={() => setFormState(prev => ({ ...prev, devUrl: preset.url }))}
                className="px-2 py-0.5 rounded-md bg-secondary/30 hover:bg-secondary/60 border border-border/40 text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Test Result Display */}
          <AnimatePresence>
            {devTestResult && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className={`p-3 rounded-lg border text-xs flex items-start justify-between gap-3 ${
                  devTestResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                }`}
              >
                <div className="flex items-start gap-2 min-w-0">
                  {devTestResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-0.5 min-w-0">
                    <p className="font-semibold text-xs leading-tight">
                      {devTestResult.message}
                    </p>
                    {devTestResult.data && typeof devTestResult.data === 'object' && (
                      <p className="text-[10px] opacity-80 font-mono truncate">
                        Service: {devTestResult.data.service || devTestResult.data.status} • Clients: {devTestResult.data.connectedClients ?? devTestResult.data.clientsCount ?? 0}
                      </p>
                    )}
                  </div>
                </div>
                {devTestResult.latency !== undefined && (
                  <span className="font-mono text-[10px] font-bold shrink-0 px-1.5 py-0.5 rounded bg-background/50 border border-border/30">
                    {devTestResult.latency}ms
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Production Socket Server Path Card */}
      <Card className="border-border/70 shadow-2xs">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-500" />
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Production Socket Server Path
              </CardTitle>
            </div>
            <span className="text-[11px] text-muted-foreground font-mono">
              Cloud / Render / Production
            </span>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Target URL used when deployed in production or when Force Production is selected.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Production Server URL</span>
              <span className="text-[10px] text-muted-foreground font-normal">HTTPS / WSS</span>
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={formState.prodUrl}
                  onChange={(e) => setFormState(prev => ({ ...prev, prodUrl: e.target.value }))}
                  placeholder="https://socket.devlomatix.in"
                  className="pl-9 font-mono text-xs h-9 bg-secondary/30 border-border/50 focus:border-emerald-500/50"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={testingProd || !formState.prodUrl}
                onClick={() => handleTestUrl('prod', formState.prodUrl)}
                className="h-9 px-3 text-xs font-semibold gap-1.5 border-border/60 hover:bg-secondary/50 cursor-pointer"
              >
                {testingProd ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Testing...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Test Prod</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-muted-foreground">
            <span className="text-[10px] font-medium mr-1">Quick Presets:</span>
            {[
              { label: 'socket.devlomatix.in', url: 'https://socket.devlomatix.in' },
              { label: 'node-server-57yz.onrender.com', url: 'https://node-server-57yz.onrender.com' }
            ].map(preset => (
              <button
                key={preset.url}
                type="button"
                onClick={() => setFormState(prev => ({ ...prev, prodUrl: preset.url }))}
                className="px-2 py-0.5 rounded-md bg-secondary/30 hover:bg-secondary/60 border border-border/40 text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Test Result Display */}
          <AnimatePresence>
            {prodTestResult && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className={`p-3 rounded-lg border text-xs flex items-start justify-between gap-3 ${
                  prodTestResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                }`}
              >
                <div className="flex items-start gap-2 min-w-0">
                  {prodTestResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-0.5 min-w-0">
                    <p className="font-semibold text-xs leading-tight">
                      {prodTestResult.message}
                    </p>
                    {prodTestResult.data && typeof prodTestResult.data === 'object' && (
                      <p className="text-[10px] opacity-80 font-mono truncate">
                        Service: {prodTestResult.data.service || prodTestResult.data.status} • Clients: {prodTestResult.data.connectedClients ?? prodTestResult.data.clientsCount ?? 0}
                      </p>
                    )}
                  </div>
                </div>
                {prodTestResult.latency !== undefined && (
                  <span className="font-mono text-[10px] font-bold shrink-0 px-1.5 py-0.5 rounded bg-background/50 border border-border/30">
                    {prodTestResult.latency}ms
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Advanced Security & Fallback Card */}
      <Card className="border-border/70 shadow-2xs">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-500" />
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Internal Bridge Security & Failover
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Configure authorization secrets for server-to-server event dispatching and local failover options.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-4">
          {/* Internal Secret */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-foreground">
                Internal Service Secret
              </Label>
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
              >
                {showSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{showSecret ? 'Hide Secret' : 'Reveal Secret'}</span>
              </button>
            </div>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type={showSecret ? 'text' : 'password'}
                value={formState.internalSecret}
                onChange={(e) => setFormState(prev => ({ ...prev, internalSecret: e.target.value }))}
                placeholder="devlomatix_internal_secret_key_2026"
                className="pl-9 pr-10 font-mono text-xs h-9 bg-secondary/30 border-border/50"
              />
              <button
                type="button"
                onClick={() => handleCopy(formState.internalSecret, 'Internal Secret')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-1"
                title="Copy Secret"
              >
                {copiedField === 'Internal Secret' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Transmitted in header <code>x-internal-secret</code> when Next.js emits real-time events to the socket server.
            </p>
          </div>

          {/* Local Port Failover Switch */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border border-border/40">
            <div className="space-y-0.5 pr-4">
              <Label className="text-xs font-semibold text-foreground cursor-pointer" htmlFor="failover-switch">
                Automatic Local Port Fallback
              </Label>
              <p className="text-[10px] text-muted-foreground">
                In local development, automatically attempt port 5000 if port 5001 is unreachable.
              </p>
            </div>
            <Switch
              id="failover-switch"
              checked={formState.enableLocalFallback}
              onCheckedChange={(checked) => setFormState(prev => ({ ...prev, enableLocalFallback: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sticky Bottom Save Bar */}
      <StickySaveBar
        isDirty={isDirty}
        saving={saving}
        onSave={handleSave}
        onReset={handleReset}
        label="Unsaved Socket Server Changes"
      />
    </div>
  );
};

export default SocketServerSettings;
