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
import { Textarea } from "@/components/ui/textarea";
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
import { useAction } from '@/hooks/use-action';
import { createAgentModel } from '../_actions/create-agent-model';
import { updateAgentModel } from '../_actions/update-agent-model';
import { testAgentModelConnection } from '../_actions/test-agent-model-connection';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

const PROVIDERS = [
    { id: 'openai', name: 'OpenAI', icon: Cpu, color: 'text-emerald-500' },
    { id: 'anthropic', name: 'Anthropic', icon: BrainCircuit, color: 'text-orange-500' },
    { id: 'google', name: 'Google', icon: Globe, color: 'text-blue-500' },
    { id: 'openrouter', name: 'OpenRouter', icon: Zap, color: 'text-indigo-400' },
    { id: 'meta', name: 'Meta', icon: ShieldCheck, color: 'text-indigo-500' },
    { id: 'mistral', name: 'Mistral', icon: Zap, color: 'text-amber-500' },
    { id: 'other', name: 'Other / Custom', icon: LinkIcon, color: 'text-muted-foreground' }
];

export const AddAgentModelModal = () => {
    const { onClose, activeModals } = useModal();
    const modalData = activeModals["addAgentModel"];
    const isModalOpen = !!modalData;

    const params = useParams();
    const workspaceId = params.workspaceId;

    const { data: session, status } = useSession();
    const { onApply, model: editingModel, userId: passedUserId } = modalData || {};

    // Resolve userId: Prioritize passedUserId (from onOpen), fallback to session
    const userId = passedUserId || session?.user?.userId;

    const [config, setConfig] = useState({
        provider: '',
        customProvider: '',
        name: '',
        apiKey: '',
        baseUrl: '',
        description: '',
    });
    const [testResult, setTestResult] = useState(null); // 'success' | 'error' | null

    // Populate form if editing
    useEffect(() => {
        if (editingModel) {
            const providerStr = editingModel.provider || '';
            const isStandardProvider = PROVIDERS.some(p => p.id === providerStr.toLowerCase());
            setConfig({
                provider: isStandardProvider ? providerStr.toLowerCase() : 'other',
                customProvider: isStandardProvider ? '' : providerStr,
                name: editingModel.name || '',
                apiKey: editingModel.apiKey || '',
                baseUrl: editingModel.baseUrl || '',
                description: editingModel.description || '',
            });
        } else {
            setConfig({
                provider: '',
                customProvider: '',
                name: '',
                apiKey: '',
                baseUrl: '',
                description: '',
            });
        }
        setTestResult(null); // Always reset test state when opening/changing
    }, [editingModel, isModalOpen]);

    const { execute: deployModel, isLoading: isCreating } = useAction(createAgentModel, {
        onSuccess: (data) => {
            toast.success("New model deployed to cluster successfully", { id: 'save-model' });
            if (onApply) onApply(data.model);
            onClose("addAgentModel");
        },
        onError: (error) => {
            console.error("Action Error:", error);
            toast.error(error, { id: 'save-model' });
        }
    });

    const { execute: updateModel, isLoading: isUpdating } = useAction(updateAgentModel, {
        onSuccess: (data) => {
            toast.success("Model node configuration updated", { id: 'save-model' });
            if (onApply) onApply(data.model);
            onClose("addAgentModel");
        },
        onError: (error) => {
            console.error("Action Error:", error);
            toast.error(error, { id: 'save-model' });
        }
    });

    const isLoading = isCreating || isUpdating;

    const { execute: testConnection, isLoading: isTesting } = useAction(testAgentModelConnection, {
        onSuccess: (data) => {
            setTestResult('success');
            toast.success(data.message, { id: 'test-connection' });
        },
        onError: (error) => {
            setTestResult('error');
            toast.error(error, { id: 'test-connection' });
        }
    });

    const handleTestConnection = () => {
        setTestResult(null);
        if (!config.provider || !config.name || !config.apiKey) {
            toast.error("Please provide Model, Provider and API Key to test connection.");
            return;
        }

        toast.loading("Testing connection handshake...", { id: 'test-connection' });

        testConnection({
            provider: config.provider === 'other' ? config.customProvider : config.provider,
            name: config.name,
            apiKey: config.apiKey,
            baseUrl: config.baseUrl
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();

        if (!config.provider || !config.name || !config.apiKey) {
            toast.error("Please fill in all required fields.");
            return;
        }

        const payload = {
            ...config,
            workspaceId,
            userId,
            provider: config.provider === 'other' ? config.customProvider : config.provider,
            healthStatus: testResult === 'success' ? 'Excellent' : (editingModel?.healthStatus || 'UNTESTED')
        };

        if (editingModel) {
            toast.loading("Updating AI node configuration...", { id: 'save-model' });
            updateModel({ ...payload, id: editingModel.id });
        } else {
            toast.loading("Deploying new AI node to cluster...", { id: 'save-model' });
            deployModel(payload);
        }
    };

    if (!workspaceId) return null;

    return (
        <Dialog open={isModalOpen} onOpenChange={() => onClose("addAgentModel")} className='p-0'>
            <DialogContent className="sm:max-w-[480px] bg-card/95 backdrop-blur-xl border-border/40 shadow-2xl rounded-2xl overflow-hidden p-0 gap-0">
                <DialogHeader className="p-4 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/10">
                            {editingModel ? <ShieldCheck className="w-5 h-5 text-indigo-500" /> : <Sparkles className="w-5 h-5 text-indigo-500" />}
                        </div>
                        <div>
                            <DialogTitle className="text-xl  text-foreground">{editingModel ? "Update AI Node" : "Deploy AI Node"}</DialogTitle>
                            <p className="text-xs text-muted-foreground opacity-60  mt-0.5">{editingModel ? "Modify existing node configuration" : "Cluster Node Configuration"}</p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-4 space-y-6">
                    {/* Provider Select */}
                    <div className="space-y-2.5">
                        <Label className="text-xs  text-muted-foreground opacity-70     ml-1">AI Provider</Label>
                        <Select
                            value={config.provider}
                            onValueChange={(val) => setConfig(prev => ({
                                ...prev,
                                provider: val,
                                baseUrl: val === 'openrouter' ? 'https://openrouter.ai/api/v1' : (val === 'other' ? prev.baseUrl : '')
                            }))}
                        >
                            <SelectTrigger className="rounded-md text-sm shadow-inner h-10 border-border/40 bg-background/50 font-bold hover:bg-background transition-colors focus:ring-2 focus:ring-indigo-500/10 px-4">
                                <SelectValue placeholder="Select provider..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-border/20 shadow-2xl">
                                {PROVIDERS.map((p) => (
                                    <SelectItem key={p.id} value={p.id} className=" cursor-pointer">
                                        <div className="flex items-center gap-2 py-1">
                                            <p.icon className={`w-4 h-4 ${p.color}`} />
                                            <span className="font-bold">{p.name}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Custom Provider Input (Conditional) */}
                    {config.provider === 'other' && (
                        <div className="space-y-2.5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                            <Label className="text-xs text-muted-foreground opacity-70 ml-1">Custom Provider Name</Label>
                            <Input
                                placeholder="e.g. Perplexity, Groq, DeepSeek"
                                className="rounded-md text-sm shadow-inner h-10 border-border/40 bg-background/50 font-bold focus:ring-2 focus:ring-indigo-500/10 px-4"
                                value={config.customProvider}
                                onChange={(e) => setConfig(prev => ({ ...prev, customProvider: e.target.value }))}
                            />
                        </div>
                    )}

                    {/* Model Name */}
                    <div className="space-y-2.5">
                        <Label className="text-xs  text-muted-foreground opacity-70     ml-1">Model Identifier</Label>
                        <div className="relative group">
                            <Input
                                placeholder="e.g. gpt-4o, claude-3-5-sonnet"
                                className="rounded-md text-sm shadow-inner h-10 border-border/40 bg-background/50 font-bold focus:ring-2 focus:ring-indigo-500/10 px-4"
                                value={config.name}
                                onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground opacity-60 font-medium px-1 italic">* Ensure the identifier matches the provider's API documentation.</p>
                    </div>

                    {/* API Key */}
                    <div className="space-y-2.5">
                        <div className="flex items-center justify-between px-1">
                            <Label className="text-xs  text-muted-foreground opacity-70    ">Security Token</Label>
                            <div className="flex items-center gap-1.5">
                                <Lock className="w-2.5 h-2.5 text-emerald-500" />
                                <span className="text-xs  text-emerald-600/70   ">AES-256 Encrypted</span>
                            </div>
                        </div>
                        <div className="relative group">
                            <Input
                                type="password"
                                placeholder="sk-..."
                                className="rounded-md text-sm shadow-inner h-10 border-border/40 bg-background/50 font-mono focus:ring-2 focus:ring-emerald-500/10 px-4 pr-12"
                                value={config.apiKey}
                                onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <Key className="w-4 h-4 text-muted-foreground/30" />
                            </div>
                        </div>
                    </div>

                    {/* Description (Optional) */}
                    <div className="space-y-2.5">
                        <Label className="text-xs text-muted-foreground opacity-70 ml-1">Notes / Description (Optional)</Label>
                        <Textarea
                            rows={4}
                            placeholder="Add specific details about this model's use case or context..."
                            className="rounded-md text-sm shadow-inner min-h-[100px] border-border/40 bg-background/50 font-medium focus:ring-2 focus:ring-indigo-500/10 px-4 py-3"
                            value={config.description}
                            onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                        />
                    </div>

                    {/* Security Info */}
                    <div className="bg-indigo-500/3 border border-indigo-500/10 rounded-xl p-4 flex items-start gap-4 transition-all hover:bg-indigo-500/5">
                        <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="text-xs text-indigo-700/80    tracking-wider">Mission Resilience</p>
                            <p className="text-xs text-muted-foreground font-bold leading-relaxed opacity-80">
                                Deploying this node will allow your agents to automatically fallback to this model if the primary gateway fails.
                            </p>
                        </div>
                    </div>

                    {/* Base URL (Optional but important for custom) */}
                    <div className="space-y-2.5">
                        <div className="flex items-center justify-between px-1">
                            <Label className="text-xs text-muted-foreground opacity-70">Custom Endpoint / Base URL</Label>
                            <Badge variant="outline" className="text-[10px] opacity-50 px-1.5 h-4">Optional</Badge>
                        </div>
                        <Input
                            placeholder="e.g. https://api.groq.com/openai/v1"
                            className="rounded-md text-sm shadow-inner h-10 border-border/40 bg-background/50 font-medium focus:ring-2 focus:ring-indigo-500/10 px-4"
                            value={config.baseUrl}
                            onChange={(e) => setConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
                        />
                    </div>
                </div>

                <DialogFooter className="p-8 bg-muted/30 border-t border-border/10 flex sm:flex-row flex-col sm:justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => onClose("addAgentModel")}
                            className="rounded-md px-6 hover:bg-background h-10 transition-all active:scale-95 text-xs font-bold"
                        >
                            Abort
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={handleTestConnection}
                            disabled={isTesting || isLoading}
                            className="rounded-md px-4 bg-background border hover:bg-muted h-10 transition-all active:scale-95 text-xs font-bold gap-2"
                        >
                            {isTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-amber-500" />}
                            Test Handshake
                        </Button>
                    </div>

                    <Button
                        onClick={handleSave}
                        disabled={isLoading || isTesting}
                        className="rounded-md   px-8 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20     gap-2 h-10 transition-all active:scale-95"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                        Deploy Model
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
