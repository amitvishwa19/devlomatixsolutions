'use client';

import React, { useState, useEffect } from 'react';
import { 
    X, 
    Save, 
    Settings, 
    Code, 
    Info, 
    ChevronDown, 
    ChevronUp,
    Play,
    Terminal,
    ChevronRight,
    Globe,
    Bot,
    Mail,
    Database,
    Zap,
    Cpu,
    CheckCircle2,
    DatabaseIcon,
    Variable,
    Trash2,
    Clock,
    FileText,
    AlertTriangle,
    RefreshCw,
    Sparkles,
    MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';


export const PropertyPanel = ({ selectedNode, updateNodeData, deleteNode, closePanel }) => {
    const [localData, setLocalData] = useState(selectedNode.data || {});

    // Sync state when selectedNode changes
    useEffect(() => {
        setLocalData(selectedNode.data || {});
    }, [selectedNode.id]);

    const handleInputChange = (field, value) => {
        const newData = { ...localData, [field]: value };
        setLocalData(newData);
        updateNodeData(selectedNode.id, newData);
    };

    const getIcon = () => {
        switch(localData.subType) {
            case 'ai': return Bot;
            case 'email': return Mail;
            case 'http': return Globe;
            case 'db': return Database;
            case 'webhook': return Zap;
            case 'schedule': return Clock;
            case 'manual': return Play;
            case 'form': return FileText;
            case 'api-poll': return RefreshCw;
            case 'error': return AlertTriangle;
            case 'chat': return MessageSquare;
            default: return Cpu;
        }
    };

    const NodeIcon = getIcon();

    const isTrigger = ['webhook', 'schedule', 'manual', 'form', 'api-poll', 'error', 'chat'].includes(localData.subType);

    return (
        <div className="absolute top-4 right-4 bottom-4 w-[380px] bg-card border border-border shadow-2xl rounded-2xl flex flex-col z-50 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-6 border-b border-border space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl bg-${isTrigger ? 'amber' : 'emerald'}-500/10`}>
                            <NodeIcon size={20} className={`text-${isTrigger ? 'amber' : 'emerald'}-500`} />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-foreground uppercase tracking-tight">Configuration</h2>
                            <p className="text-[10px] font-bold text-muted-foreground opacity-50 uppercase tracking-widest">{localData.subType} Node</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={closePanel} className="rounded-full h-8 w-8 hover:bg-muted/50 transition-colors">
                        <X size={16} />
                    </Button>
                </div>

                <div className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold text-foreground/70 uppercase tracking-widest pl-1">Display Label</label>
                        <Input 
                            value={localData.label || ''} 
                            onChange={(e) => handleInputChange('label', e.target.value)}
                            className="bg-muted/20 border-border/50 h-9 text-xs focus:ring-1 focus:ring-primary/20 transition-all font-medium"
                            placeholder="My Action Node"
                        />
                    </div>
                </div>
            </div>

            {/* Scrollable Settings */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar relative">
                {/* General Settings Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <Settings size={14} className="text-primary shadow-lg shadow-primary/20" />
                        <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">Node Parameters</span>
                    </div>

                    {localData.subType === 'webhook' && (
                        <div className="space-y-4">
                            <div className="bg-amber-500/5 rounded-xl border border-amber-500/10 p-4 space-y-3">
                                <div className="flex items-center gap-2">
                                    <Globe size={14} className="text-amber-500" />
                                    <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">Public Webhook URL</span>
                                </div>
                                <div className="flex gap-2">
                                    <Input 
                                        readOnly 
                                        value={`https://api.flowbot.dev/hooks/${selectedNode.id}`}
                                        className="bg-background/50 border-amber-500/20 h-8 text-[10px] font-mono text-amber-600/80"
                                    />
                                    <Button variant="outline" size="sm" className="h-8 text-[10px] bg-card hover:bg-amber-500/10 hover:text-amber-500 border-amber-500/20">Copy</Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {localData.subType === 'schedule' && (
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold text-foreground/70 uppercase tracking-widest pl-1">Cron Expression</label>
                                <Input 
                                    value={localData.cron || '* * * * *'} 
                                    onChange={(e) => handleInputChange('cron', e.target.value)}
                                    className="bg-muted/20 border-border/50 h-9 text-xs focus:ring-1 focus:ring-primary/20 transition-all font-medium font-mono"
                                    placeholder="* * * * *"
                                />
                                <p className="text-[9px] text-muted-foreground pl-1 mt-1">Format: min hour day month weekday</p>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold text-foreground/70 uppercase tracking-widest pl-1">Interval (Minutes)</label>
                                <Input 
                                    type="number"
                                    value={localData.interval || 15} 
                                    onChange={(e) => handleInputChange('interval', e.target.value)}
                                    className="bg-muted/20 border-border/50 h-9 text-xs focus:ring-1 focus:ring-primary/20 transition-all font-medium"
                                />
                            </div>
                        </div>
                    )}

                    {localData.subType === 'manual' && (
                        <div className="space-y-4">
                            <div className="bg-amber-500/5 rounded-xl border border-amber-500/10 p-4 space-y-2">
                                <div className="flex items-center gap-2">
                                    <Play size={14} className="text-amber-500" />
                                    <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">Manual Activation</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground">
                                    This workflow will only run when you click the "Test Run" button or trigger it via the dashboard.
                                </p>
                            </div>
                        </div>
                    )}

                    {localData.subType === 'form' && (
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold text-foreground/70 uppercase tracking-widest pl-1">Form Selection</label>
                                <Input 
                                    value={localData.formId || ''} 
                                    onChange={(e) => handleInputChange('formId', e.target.value)}
                                    className="bg-muted/20 border-border/50 h-9 text-xs focus:ring-1 focus:ring-primary/20 transition-all font-medium"
                                    placeholder="Enter Form ID or Name"
                                />
                            </div>
                        </div>
                    )}

                    {localData.subType === 'api-poll' && (
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold text-foreground/70 uppercase tracking-widest pl-1">Polling URL</label>
                                <Input 
                                    value={localData.pollUrl || ''} 
                                    onChange={(e) => handleInputChange('pollUrl', e.target.value)}
                                    className="bg-muted/20 border-border/50 h-9 text-xs focus:ring-1 focus:ring-primary/20 transition-all font-medium"
                                    placeholder="https://api.example.com/check"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold text-foreground/70 uppercase tracking-widest pl-1">Frequency (Seconds)</label>
                                <Input 
                                    type="number"
                                    value={localData.pollInterval || 60} 
                                    onChange={(e) => handleInputChange('pollInterval', e.target.value)}
                                    className="bg-muted/20 border-border/50 h-9 text-xs focus:ring-1 focus:ring-primary/20 transition-all font-medium"
                                />
                            </div>
                        </div>
                    )}

                    {localData.subType === 'error' && (
                        <div className="space-y-4">
                            <div className="bg-rose-500/5 rounded-xl border border-rose-500/10 p-4 space-y-2">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle size={14} className="text-rose-500" />
                                    <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">Error Handler</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground">
                                    This node will trigger if any other node in this specific workflow fails.
                                </p>
                            </div>
                        </div>
                    )}

                    {localData.subType === 'model' && (
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold text-foreground/70 uppercase tracking-widest pl-1">Model Provider</label>
                                <div className="flex gap-2">
                                    {['gemini', 'openai'].map(p => (
                                        <Button 
                                            key={p} 
                                            size="sm" 
                                            variant={localData.provider === p ? "default" : "outline"}
                                            onClick={() => handleInputChange('provider', p)}
                                            className={`flex-1 h-8 text-[10px] font-bold ${localData.provider === p ? 'bg-purple-500 shadow-lg shadow-purple-500/20' : 'bg-transparent opacity-60'}`}
                                        >
                                            {p === 'gemini' ? 'Gemini Pro' : 'GPT-4o'}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold text-foreground/70 uppercase tracking-widest pl-1">API Key</label>
                                <Input 
                                    type="password"
                                    value={localData.apiKey || ''} 
                                    onChange={(e) => handleInputChange('apiKey', e.target.value)}
                                    className="bg-muted/20 border-border/50 h-9 text-xs focus:ring-1 focus:ring-purple-500/20 transition-all font-medium"
                                    placeholder="sk-..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-extrabold text-foreground/70 uppercase tracking-widest pl-1">Temperature</label>
                                    <Input 
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="1"
                                        value={localData.temperature || 0.7} 
                                        onChange={(e) => handleInputChange('temperature', e.target.value)}
                                        className="bg-muted/20 border-border/50 h-9 text-xs"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-extrabold text-foreground/70 uppercase tracking-widest pl-1">Max Tokens</label>
                                    <Input 
                                        type="number"
                                        value={localData.maxTokens || 2048} 
                                        onChange={(e) => handleInputChange('maxTokens', e.target.value)}
                                        className="bg-muted/20 border-border/50 h-9 text-xs"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {localData.subType === 'memory' && (
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold text-foreground/70 uppercase tracking-widest pl-1">Session ID Key</label>
                                <Input 
                                    value={localData.sessionIdKey || 'chatId'} 
                                    onChange={(e) => handleInputChange('sessionIdKey', e.target.value)}
                                    className="bg-muted/20 border-border/50 h-9 text-xs"
                                    placeholder="chatId"
                                />
                                <p className="text-[9px] text-muted-foreground pl-1 mt-1">Which payload variable identifies the session?</p>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold text-foreground/70 uppercase tracking-widest pl-1">Window Size</label>
                                <Input 
                                    type="number"
                                    value={localData.windowSize || 10} 
                                    onChange={(e) => handleInputChange('windowSize', e.target.value)}
                                    className="bg-muted/20 border-border/50 h-9 text-xs"
                                />
                                <p className="text-[9px] text-muted-foreground pl-1 mt-1">Number of previous messages to remember</p>
                            </div>
                        </div>
                    )}

                    {localData.subType === 'agent' && (
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold text-foreground/70 uppercase tracking-widest pl-1">Agent Instructions (System Prompt)</label>
                                <textarea 
                                    value={localData.systemPrompt || ''} 
                                    onChange={(e) => handleInputChange('systemPrompt', e.target.value)}
                                    className="flex min-h-[140px] w-full rounded-xl border border-border/50 bg-muted/20 px-3 py-3 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500/20 transition-all font-medium leading-relaxed resize-none"
                                    placeholder="You are a helpful assistant that uses the provided tools..."
                                />
                            </div>
                            <div className="bg-indigo-500/5 rounded-xl border border-indigo-500/10 p-4 space-y-2">
                                <div className="flex items-center gap-2">
                                    <Sparkles size={14} className="text-indigo-500" />
                                    <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">Reasoning Engine</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground">
                                    This agent will automatically use any connected Model and Memory to reason about the conversation and decide which tools to call.
                                </p>
                            </div>
                        </div>
                    )}

                    {localData.subType === 'chat' && (
                        <div className="space-y-4">
                            <div className="bg-amber-500/5 rounded-xl border border-amber-500/10 p-4 space-y-3">
                                <div className="flex items-center gap-2">
                                    <MessageSquare size={14} className="text-amber-500" />
                                    <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">Chat Widget Settings</span>
                                </div>
                                <div className="space-y-3">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-extrabold text-foreground/70 uppercase tracking-widest pl-1">Bot Name</label>
                                        <Input 
                                            value={localData.botName || 'Flow Assistant'} 
                                            onChange={(e) => handleInputChange('botName', e.target.value)}
                                            className="bg-background/50 border-amber-500/10 h-8 text-xs font-medium"
                                            placeholder="Flow Assistant"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-extrabold text-foreground/70 uppercase tracking-widest pl-1">Welcome Message</label>
                                        <Input 
                                            value={localData.welcomeMessage || 'Hello! How can I help you today?'} 
                                            onChange={(e) => handleInputChange('welcomeMessage', e.target.value)}
                                            className="bg-background/50 border-amber-500/10 h-8 text-xs font-medium"
                                            placeholder="Hello! How can I help you today?"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {localData.subType === 'ai' && (
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between pl-1">
                                    <label className="text-[10px] font-extrabold text-foreground/70 uppercase tracking-widest">Simple Prompt</label>
                                    <Badge variant="outline" className="text-[9px] opacity-50 bg-primary/5">Stateless</Badge>
                                </div>
                                <textarea 
                                    value={localData.prompt || ''} 
                                    onChange={(e) => handleInputChange('prompt', e.target.value)}
                                    className="flex min-h-[160px] w-full rounded-xl border border-border/50 bg-muted/20 px-3 py-3 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20 transition-all font-medium leading-relaxed resize-none"
                                    placeholder="Ex: Summarize this text. Use {{ input }} for data."
                                />
                            </div>
                        </div>
                    )}

                    {localData.subType === 'email' && (
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold text-foreground/70 uppercase tracking-widest pl-1">To Address</label>
                                <Input 
                                    value={localData.toAddress || ''} 
                                    onChange={(e) => handleInputChange('toAddress', e.target.value)}
                                    className="bg-muted/20 border-border/50 h-9 text-xs focus:ring-1 focus:ring-primary/20 transition-all font-medium"
                                    placeholder="support@example.com"
                                />
                            </div>
                        </div>
                    )}

                    {localData.subType === 'http' && (
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold text-foreground/70 uppercase tracking-widest pl-1">Request Method</label>
                                <div className="flex gap-2">
                                    {['GET', 'POST', 'PUT', 'DELETE'].map(m => (
                                        <Button 
                                            key={m} 
                                            size="sm" 
                                            variant={localData.method === m ? "default" : "outline"}
                                            onClick={() => handleInputChange('method', m)}
                                            className={`flex-1 h-8 text-[10px] font-bold ${localData.method === m ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-transparent opacity-60'}`}
                                        >
                                            {m}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold text-foreground/70 uppercase tracking-widest pl-1">API URL</label>
                                <Input 
                                    value={localData.url || ''} 
                                    onChange={(e) => handleInputChange('url', e.target.value)}
                                    className="bg-muted/20 border-border/50 h-9 text-xs focus:ring-1 focus:ring-primary/20 transition-all font-medium"
                                    placeholder="https://api.external.com/v1/endpoint"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Automation Logs Section */}
                <Separator className="bg-border/30" />
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Terminal size={14} className="text-muted-foreground opacity-60" />
                            <span className="text-[10px] font-bold text-foreground opacity-60 uppercase tracking-wider">Preview Logs</span>
                        </div>
                         <Badge variant="outline" className="text-[9px] opacity-50 bg-muted/20">Dry Run</Badge>
                    </div>
                    
                    <div className="bg-black/5 rounded-xl p-4 font-mono text-[9px] text-muted-foreground space-y-2 leading-relaxed border border-border/50">
                        <div className="flex items-center gap-2">
                            <span className="text-emerald-500">[0ms]</span>
                            <span>Node initialized successfully</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-amber-500">[42ms]</span>
                            <span>Waiting for user input parameters...</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 bg-muted/10 border-t border-border flex gap-3">
                <Button 
                    variant="outline"
                    className="flex-1 rounded-xl border-rose-500/20 text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 font-bold text-xs"
                    onClick={() => deleteNode(selectedNode.id)}
                >
                    <Trash2 size={14} className="mr-2" />
                    Delete Node
                </Button>
                <Button 
                    className="flex-1 rounded-xl bg-primary shadow-lg shadow-primary/20 font-bold text-xs group"
                    onClick={() => {
                        handleInputChange('configured', true);
                        toast.success("Node configuration updated");
                        closePanel();
                    }}
                >
                    <CheckCircle2 size={14} className="mr-2 group-hover:scale-110 transition-transform" />
                    Apply Changes
                </Button>
            </div>
        </div>
    );
};
