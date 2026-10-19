'use client';

import React, { useState, useEffect } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Radio,
  Wifi,
  WifiOff,
  RefreshCw,
  Zap,
  Server,
  Users,
  Copy,
  Check,
  Activity,
  AlertCircle
} from 'lucide-react';
import { useCrmSocket } from '@/providers/CrmSocketProvider';
import { toast } from 'sonner';

export default function SocketStatusIndicator() {
  const {
    socket,
    isConnected,
    connectionStatus = 'disconnected',
    transport = 'websocket',
    socketUrl = '',
    latency = null,
    onlineUsers = [],
    reconnect,
    checkLatency
  } = useCrmSocket() || {};

  const [copied, setCopied] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);

  // Normalize effective status
  const effectiveStatus = isConnected
    ? 'connected'
    : connectionStatus === 'reconnecting'
    ? 'reconnecting'
    : connectionStatus === 'connecting'
    ? 'connecting'
    : connectionStatus === 'error'
    ? 'error'
    : 'disconnected';

  const socketId = socket?.id || '';

  const handleCopyId = () => {
    if (!socketId) return;
    navigator.clipboard.writeText(socketId);
    setCopied(true);
    toast.success('Socket Session ID copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePing = () => {
    if (!isConnected || !checkLatency) return;
    setIsPinging(true);
    checkLatency();
    setTimeout(() => setIsPinging(false), 800);
  };

  const handleReconnect = () => {
    if (!reconnect) return;
    setIsReconnecting(true);
    toast.info('Reconnecting to signaling server...');
    reconnect();
    setTimeout(() => setIsReconnecting(false), 1200);
  };

  // Configure status visual configurations
  const statusConfig = {
    connected: {
      label: 'Live',
      badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/15',
      dotColor: 'bg-emerald-500',
      pingColor: 'bg-emerald-400',
      popoverBadge: 'Operational',
      popoverVariant: 'default',
      description: 'Signaling server connected and synchronized.'
    },
    connecting: {
      label: 'Connecting...',
      badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25 hover:bg-amber-500/15',
      dotColor: 'bg-amber-500',
      pingColor: 'bg-amber-400',
      popoverBadge: 'Connecting',
      popoverVariant: 'secondary',
      description: 'Negotiating connection handshake...'
    },
    reconnecting: {
      label: 'Reconnecting...',
      badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25 hover:bg-amber-500/15',
      dotColor: 'bg-amber-500',
      pingColor: 'bg-amber-400',
      popoverBadge: 'Reconnecting',
      popoverVariant: 'secondary',
      description: 'Attempting to resume server session...'
    },
    error: {
      label: 'Error',
      badgeClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25 hover:bg-rose-500/15',
      dotColor: 'bg-rose-500',
      pingColor: 'bg-rose-400',
      popoverBadge: 'Connection Error',
      popoverVariant: 'destructive',
      description: 'Failed to establish socket connection.'
    },
    disconnected: {
      label: 'Offline',
      badgeClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25 hover:bg-rose-500/15',
      dotColor: 'bg-rose-500',
      pingColor: 'bg-rose-400',
      popoverBadge: 'Disconnected',
      popoverVariant: 'destructive',
      description: 'Socket signaling server is currently offline.'
    }
  };

  const current = statusConfig[effectiveStatus] || statusConfig.disconnected;

  const displayUrl = socketUrl
    ? socketUrl.replace(/^https?:\/\//, '')
    : 'socket.devlomatix.in';

  const isLocalServer = socketUrl.includes('localhost') || socketUrl.includes('127.0.0.1');

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Socket Status: ${current.label}`}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold tracking-tight transition-all duration-200 cursor-pointer select-none border shadow-2xs ${current.badgeClass}`}
        >
          {/* Animated Status Pulse */}
          <span className="relative flex h-2 w-2 shrink-0">
            {effectiveStatus === 'connected' ? (
              <>
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${current.pingColor}`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${current.dotColor}`} />
              </>
            ) : effectiveStatus === 'connecting' || effectiveStatus === 'reconnecting' ? (
              <RefreshCw className="w-2.5 h-2.5 animate-spin" />
            ) : (
              <span className={`relative inline-flex rounded-full h-2 w-2 ${current.dotColor}`} />
            )}
          </span>

          {/* Desktop Text Label */}
          <span className="hidden sm:inline-block font-medium">
            {current.label}
          </span>

          {/* Latency Pill when connected */}
          {effectiveStatus === 'connected' && latency !== null && (
            <span className="hidden md:inline-block text-[9px] font-mono px-1 py-0.2 rounded bg-background/50 text-muted-foreground border border-border/40">
              {latency}ms
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={6}
        className="w-80 p-3.5 bg-card/95 backdrop-blur-xl border border-border/80 shadow-2xl rounded-xl space-y-3 z-50 text-foreground"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg border ${effectiveStatus === 'connected' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-secondary border-border/60 text-muted-foreground'}`}>
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold leading-none text-foreground">Socket.io Signaling</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">Real-time WebRTC & Chat</p>
            </div>
          </div>

          <Badge
            variant={effectiveStatus === 'connected' ? 'default' : 'secondary'}
            className={`text-[9px] font-bold px-1.5 py-0.5 border ${
              effectiveStatus === 'connected'
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                : effectiveStatus === 'connecting' || effectiveStatus === 'reconnecting'
                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
            }`}
          >
            {current.popoverBadge}
          </Badge>
        </div>

        {/* Diagnostics Info Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Target Host */}
          <div className="p-2 rounded-lg bg-secondary/30 border border-border/40 space-y-0.5 col-span-2">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium">
              <span className="flex items-center gap-1">
                <Server className="w-3 h-3 text-primary" />
                Target Server
              </span>
              {isLocalServer && (
                <span className="px-1 py-0.2 rounded bg-amber-500/10 text-amber-500 text-[9px] font-mono font-semibold">
                  Local Dev
                </span>
              )}
            </div>
            <div className="font-mono text-[11px] text-foreground truncate" title={socketUrl}>
              {displayUrl}
            </div>
          </div>

          {/* Transport Protocol */}
          <div className="p-2 rounded-lg bg-secondary/30 border border-border/40 space-y-0.5">
            <div className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
              <Activity className="w-3 h-3 text-primary" />
              Transport
            </div>
            <div className="text-[11px] font-semibold capitalize text-foreground flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              {effectiveStatus === 'connected' ? transport : 'N/A'}
            </div>
          </div>

          {/* Latency */}
          <div className="p-2 rounded-lg bg-secondary/30 border border-border/40 space-y-0.5">
            <div className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500" />
              Ping Latency
            </div>
            <div className="text-[11px] font-mono font-semibold text-foreground">
              {effectiveStatus === 'connected' && latency !== null ? (
                <span className={latency < 80 ? 'text-emerald-500' : latency < 200 ? 'text-amber-500' : 'text-rose-500'}>
                  {latency} ms
                </span>
              ) : (
                <span className="text-muted-foreground">--</span>
              )}
            </div>
          </div>

          {/* Workspace Peers */}
          <div className="p-2 rounded-lg bg-secondary/30 border border-border/40 space-y-0.5 col-span-2">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3 text-indigo-400" />
                Workspace Presence
              </span>
              <span className="font-mono font-semibold text-foreground text-[10px]">
                {onlineUsers.length} member{onlineUsers.length === 1 ? '' : 's'} online
              </span>
            </div>
          </div>
        </div>

        {/* Socket Session ID Bar (if connected) */}
        {effectiveStatus === 'connected' && socketId && (
          <div className="p-2 rounded-lg bg-secondary/20 border border-border/40 flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <div className="text-[9px] text-muted-foreground uppercase font-mono tracking-wider">Socket Session ID</div>
              <div className="text-[10px] font-mono text-muted-foreground truncate max-w-[190px]">
                {socketId}
              </div>
            </div>
            <button
              type="button"
              onClick={handleCopyId}
              className="p-1 rounded hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Copy Socket ID"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}

        {/* Offline Helper Alert */}
        {effectiveStatus !== 'connected' && (
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-[11px]">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Signaling Server Unreachable</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              {isLocalServer ? (
                <>Run <code className="px-1 py-0.2 rounded bg-background/80 font-mono text-foreground">node server.js</code> in <span className="font-medium text-foreground">socket-webrtc-server</span> (port 5001).</>
              ) : (
                <>Verify internet access or check that the remote socket host is operating normally.</>
              )}
            </p>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2 pt-1 border-t border-border/40">
          {effectiveStatus === 'connected' ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPinging}
              onClick={handlePing}
              className="flex-1 h-7 text-xs font-semibold gap-1.5 cursor-pointer hover:bg-secondary/60"
            >
              <Zap className={`w-3 h-3 text-amber-500 ${isPinging ? 'animate-bounce' : ''}`} />
              {isPinging ? 'Pinging...' : 'Test Ping'}
            </Button>
          ) : null}

          <Button
            type="button"
            variant={effectiveStatus === 'connected' ? 'ghost' : 'default'}
            size="sm"
            disabled={isReconnecting}
            onClick={handleReconnect}
            className={`h-7 text-xs font-semibold gap-1.5 cursor-pointer ${
              effectiveStatus === 'connected'
                ? 'flex-1 hover:bg-secondary/50 text-muted-foreground hover:text-foreground'
                : 'w-full bg-primary hover:bg-primary/90 text-primary-foreground'
            }`}
          >
            <RefreshCw className={`w-3 h-3 ${isReconnecting ? 'animate-spin' : ''}`} />
            {isReconnecting ? 'Reconnecting...' : effectiveStatus === 'connected' ? 'Reconnect' : 'Retry Connection'}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
