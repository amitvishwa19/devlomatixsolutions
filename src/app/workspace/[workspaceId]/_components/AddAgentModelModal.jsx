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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useModal } from "@/hooks/useModal";
import { 
    Cpu, 
    Key, 
    Link as LinkIcon, 
    ShieldCheck, 
    Sparkles, 
    BrainCircuit, 
    Globe, 
    Zap,
    Loader2,
    Lock,
    Info
} from 'lucide-react';
import { toast } from 'sonner';

const PROVIDERS = [
    { id: 'openai', name: 'OpenAI', icon: Cpu, color: 'text-emerald-500' },
    { id: 'anthropic', name: 'Anthropic', icon: BrainCircuit, color: 'text-orange-500' },
    { id: 'google', name: 'Google', icon: Globe, color: 'text-blue-500' },
    { id: 'meta', name: 'Meta', icon: ShieldCheck, color: 'text-indigo-500' },
    { id: 'mistral', name: 'Mistral', icon: Zap, color: 'text-amber-500' },
    { id: 'other', name: 'Other / Custom', icon: LinkIcon, color: 'text-muted-foreground' }
];

export const AddAgentModelModal = () => {
    const { onClose, activeModals } = useModal();
    const modalData = activeModals["addAgentModel"];
    const isModalOpen = !!modalData;
    const { workspaceId, onApply } = modalData || {};

    const [loading, setLoading] = useState(false);
    
    const [config, setConfig] = useState({
        provider: '',
        name: '',
        apiKey: '',
    });

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        
        if (!config.provider || !config.name || !config.apiKey) {
            toast.error("Please fill in all required fields");
            return;
        }

        setLoading(true);
        try {
            // Simulated delay for UI demonstration
            await new Promise(resolve => setTimeout(resolve, 1500));
            toast.success("New model deployed to cluster successfully");
            if (onApply) onApply(config);
            onClose("addAgentModel");
        } catch (error) {
            toast.error("Deployment failed: Verification error");
        } finally {
            setLoading(false);
        }
    };

    if (!workspaceId) return null;

    return (
        <Dialog open={isModalOpen} onOpenChange={() => onClose("addAgentModel")}>
            <DialogContent className="sm:max-w-[480px] bg-card/95 backdrop-blur-xl border-border/40 shadow-2xl rounded-2xl overflow-hidden p-0 gap-0">
                <DialogHeader className="p-8 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/10">
                            <Sparkles className="w-5 h-5 text-indigo-500" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-black tracking-tight text-foreground">Deploy AI Node</DialogTitle>
                            <p className="text-[10px] text-muted-foreground font-black opacity-60 uppercase tracking-widest mt-0.5">Cluster Node Configuration</p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-8 space-y-6">
                    {/* Provider Select */}
                    <div className="space-y-2.5">
                        <Label className="text-[10px] font-black text-muted-foreground opacity-70 uppercase tracking-widest ml-1">AI Provider</Label>
                        <Select 
                            value={config.provider} 
                            onValueChange={(val) => setConfig(prev => ({ ...prev, provider: val }))}
                        >
                            <SelectTrigger className="h-12 rounded-xl border-border/40 bg-background/50 font-bold hover:bg-background transition-colors focus:ring-2 focus:ring-indigo-500/10">
                                <SelectValue placeholder="Select provider..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-border/20 shadow-2xl">
                                {PROVIDERS.map((p) => (
                                    <SelectItem key={p.id} value={p.id} className="focus:bg-indigo-500/10 cursor-pointer">
                                        <div className="flex items-center gap-2 py-1">
                                            <p.icon className={`w-4 h-4 ${p.color}`} />
                                            <span className="font-bold">{p.name}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Model Name */}
                    <div className="space-y-2.5">
                        <Label className="text-[10px] font-black text-muted-foreground opacity-70 uppercase tracking-widest ml-1">Model Identifier</Label>
                        <div className="relative group">
                            <Input 
                                placeholder="e.g. gpt-4o, claude-3-5-sonnet"
                                className="h-12 rounded-xl border-border/40 bg-background/50 font-bold text-sm focus:ring-2 focus:ring-indigo-500/10 shadow-inner px-4"
                                value={config.name}
                                onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                            />
                        </div>
                        <p className="text-[9px] text-muted-foreground opacity-60 font-medium px-1 italic">* Ensure the identifier matches the provider's API documentation.</p>
                    </div>

                    {/* API Key */}
                    <div className="space-y-2.5">
                        <div className="flex items-center justify-between px-1">
                            <Label className="text-[10px] font-black text-muted-foreground opacity-70 uppercase tracking-widest">Security Token</Label>
                            <div className="flex items-center gap-1.5">
                                <Lock className="w-2.5 h-2.5 text-emerald-500" />
                                <span className="text-[8px] font-black text-emerald-600/70 uppercase tracking-tighter">AES-256 Encrypted</span>
                            </div>
                        </div>
                        <div className="relative group">
                            <Input 
                                type="password"
                                placeholder="sk-..."
                                className="h-12 rounded-xl border-border/40 bg-background/50 font-mono text-sm focus:ring-2 focus:ring-emerald-500/10 shadow-inner px-4 pr-12"
                                value={config.apiKey}
                                onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <Key className="w-4 h-4 text-muted-foreground/30" />
                            </div>
                        </div>
                    </div>

                    {/* Security Info */}
                    <div className="bg-indigo-500/[0.03] border border-indigo-500/10 rounded-xl p-4 flex items-start gap-4 transition-all hover:bg-indigo-500/[0.05]">
                        <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="text-[10px] text-indigo-700/80 font-black uppercase tracking-wider">Mission Resilience</p>
                            <p className="text-[10px] text-muted-foreground font-bold leading-relaxed opacity-80">
                                Deploying this node will allow your agents to automatically fallback to this model if the primary gateway fails.
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-8 bg-muted/30 border-t border-border/10 flex sm:justify-between items-center gap-4">
                    <Button 
                        variant="ghost" 
                        onClick={() => onClose("addAgentModel")}
                        className="rounded-xl text-[10px] font-black px-6 uppercase tracking-widest hover:bg-background h-10 transition-all active:scale-95"
                    >
                        Abort
                    </Button>
                    <Button 
                        onClick={handleSave}
                        disabled={loading}
                        className="rounded-xl text-[10px] font-black px-8 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 uppercase tracking-widest gap-2 h-10 transition-all active:scale-95"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                        Commit Node
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
