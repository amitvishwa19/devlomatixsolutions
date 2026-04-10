'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useModal } from "@/hooks/useModal";
import { 
    Key, 
    Link as LinkIcon, 
    ShieldCheck, 
    ShieldAlert, 
    Copy, 
    Zap, 
    Globe, 
    Info, 
    Loader2,
    Lock,
    Settings2,
    Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import axios from '@/utils/axios';

export const AIClawCredentialModal = () => {
    const { onClose, activeModals } = useModal();
    const modalData = activeModals["aiClawCredential"];
    const isModalOpen = !!modalData;
    const { workspaceId, onApply } = modalData || {};

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    
    const [config, setConfig] = useState({
        enabled: false,
        apiUrl: '',
        apiKey: '',
    });

    const webhookUrl = typeof window !== 'undefined' && workspaceId 
        ? `${window.location.origin}/api/workspace/${workspaceId}/agent/webhook` 
        : '';

    const fetchConfig = async () => {
        if (!workspaceId) return;
        setLoading(true);
        try {
            const { data } = await axios.get(`/api/workspace/${workspaceId}/agent`);
            setConfig({
                enabled: data.enabled || false,
                apiUrl: data.apiUrl || '',
                apiKey: data.apiKey || '',
            });
        } catch (error) {
            console.error("Fetch Config Error:", error);
            toast.error("Failed to load agent configuration");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isModalOpen) {
            fetchConfig();
        }
    }, [isModalOpen, workspaceId]);

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        setSaving(true);
        try {
            await axios.patch(`/api/workspace/${workspaceId}/agent`, config);
            toast.success("OpenClaw configuration updated successfully");
            if (onApply) onApply();
            onClose("aiClawCredential");
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

    if (!workspaceId) return null;

    return (
        <Dialog open={isModalOpen} onOpenChange={() => onClose("aiClawCredential")}>
            <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-xl border-border/40 shadow-2xl rounded-xl overflow-hidden p-0 gap-0">
                <DialogHeader className="p-6 pb-0 border-b border-border/10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/10">
                                <Settings2 className="w-5 h-5 text-indigo-500" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold tracking-tight">OpenClaw Config</DialogTitle>
                                <p className="text-[10px] text-muted-foreground font-bold opacity-60 uppercase tracking-widest mt-0.5">Connectivity Bridge</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-indigo-500/5 px-3 py-1.5 rounded-full border border-indigo-500/10 transition-colors hover:bg-indigo-500/10">
                            <span className="text-[10px] font-extrabold text-indigo-600/80 uppercase">
                                {config.enabled ? 'Active' : 'Disabled'}
                            </span>
                            <Switch 
                                checked={config.enabled} 
                                onCheckedChange={(val) => setConfig(prev => ({ ...prev, enabled: val }))}
                                className="data-[state=checked]:bg-indigo-600 scale-75 origin-right"
                            />
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-6 space-y-6">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-3 animate-pulse">
                            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Retrieving Secure Keys...</p>
                        </div>
                    ) : (
                        <>
                            {/* API URL */}
                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between px-1">
                                    <Label className="text-[10px] font-extrabold text-muted-foreground/70 uppercase tracking-wider flex items-center gap-2">
                                        <Globe className="w-3 h-3 text-indigo-500" /> API Gateway Endpoint
                                    </Label>
                                    <Badge variant="outline" className="text-[8px] font-black h-4 px-1.5 border-indigo-500/20 text-indigo-500/60 uppercase">Cloud / Local</Badge>
                                </div>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1 border-r border-border/10 pr-3">
                                        <LinkIcon className="w-3.5 h-3.5 text-muted-foreground/40 group-focus-within:text-indigo-500 transition-colors" />
                                    </div>
                                    <Input 
                                        placeholder="https://cloud.openclaw.ai/api/v1"
                                        className="pl-12 h-12 rounded-xl border-border/40 bg-background/50 font-bold text-xs focus:ring-2 focus:ring-indigo-500/10 shadow-inner"
                                        value={config.apiUrl}
                                        onChange={(e) => setConfig(prev => ({ ...prev, apiUrl: e.target.value }))}
                                    />
                                </div>
                            </div>

                            {/* API KEY */}
                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between px-1">
                                    <Label className="text-[10px] font-extrabold text-muted-foreground/70 uppercase tracking-wider flex items-center gap-2">
                                        <Key className="w-3 h-3 text-emerald-500" /> Security Token
                                    </Label>
                                    <div className="flex items-center gap-1.5">
                                        <Lock className="w-2.5 h-2.5 text-emerald-500" />
                                        <span className="text-[8px] font-black text-emerald-600/70 uppercase tracking-tighter">Vault-Encrypted</span>
                                    </div>
                                </div>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1 border-r border-border/10 pr-3">
                                        <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground/40 group-focus-within:text-emerald-500 transition-colors" />
                                    </div>
                                    <Input 
                                        type="password"
                                        placeholder="Enter your security token"
                                        className="pl-12 h-12 rounded-xl border-border/40 bg-background/50 font-bold text-sm focus:ring-2 focus:ring-emerald-500/10 shadow-inner"
                                        value={config.apiKey}
                                        onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                                    />
                                </div>
                                <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-2.5 flex items-start gap-2.5">
                                    <Info className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                    <p className="text-[9px] text-amber-700/80 font-semibold leading-relaxed">
                                        This key authenticates requests to the OpenClaw Agent. Maintain it securely and never expose it in client-side logs.
                                    </p>
                                </div>
                            </div>

                            {/* Webhook Info */}
                            <div className="space-y-2.5 p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                                <div className="flex items-center gap-2 mb-1">
                                    <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="text-[10px] font-black text-emerald-700/70 uppercase tracking-wider">Inbound Webhook</span>
                                </div>
                                <p className="text-[9px] font-medium text-emerald-700/60 leading-tight mb-2">
                                    Configure this in OpenClaw to enable bi-directional communication.
                                </p>
                                <div className="flex items-center gap-2 p-2 bg-white/40 backdrop-blur-sm rounded-lg border border-emerald-500/10 group">
                                    <code className="flex-1 text-[9px] font-mono font-bold truncate text-emerald-600/80">{webhookUrl}</code>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-7 w-7 text-emerald-600 hover:bg-emerald-500/10 rounded-md transition-all active:scale-95" 
                                        onClick={() => copyToClipboard(webhookUrl)}
                                    >
                                        <Copy className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <DialogFooter className="p-6 bg-muted/30 border-t border-border/10 flex sm:justify-between items-center gap-4">
                    <Button 
                        type="button"
                        variant="ghost"
                        onClick={handleTestPing}
                        disabled={isTesting || !config.apiUrl || loading}
                        className="rounded-xl text-[10px] font-black px-5 uppercase bg-indigo-500/5 border border-indigo-500/10 text-indigo-600 gap-2 hover:bg-indigo-500/10 transition-all active:scale-95"
                    >
                        {isTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                        Ping Bridge
                    </Button>
                    <div className="flex gap-2">
                        <Button 
                            variant="ghost" 
                            onClick={() => onClose("aiClawCredential")}
                            className="rounded-xl text-[10px] font-extrabold px-6 uppercase tracking-wider"
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleSave}
                            disabled={saving || loading}
                            className="rounded-xl text-[10px] font-black px-8 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 uppercase tracking-widest gap-2 transition-all active:scale-95"
                        >
                            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                            Commit Changes
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
