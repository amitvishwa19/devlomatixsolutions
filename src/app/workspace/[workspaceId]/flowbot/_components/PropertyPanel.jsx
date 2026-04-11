'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
    MessageSquare,
    Key,
    Puzzle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { WA_NODE_REGISTRY as NODE_REGISTRY } from '@/app/workspace/[workspaceId]/wa/bot-flow-builder/_lib/node-registry';

/**
 * PropertyPanel v2 (n8n Style)
 * A dynamic renderer that builds the configuration UI based on the Node Registry.
 */
export const PropertyPanel = ({ selectedNode, workspaceId, updateNodeData, deleteNode, closePanel }) => {
    const [localData, setLocalData] = useState(selectedNode.data || {});
    const [credentials, setCredentials] = useState([]);
    const [isLoadingCredentials, setIsLoadingCredentials] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState(null);

    // Get node definition from registry
    const nodeDef = useMemo(() => {
        return Object.values(NODE_REGISTRY).find(n => n.name === localData.subType);
    }, [localData.subType]);

    // Sync state when selectedNode changes
    useEffect(() => {
        setLocalData(selectedNode.data || {});
        if (selectedNode.data?.subType) {
            fetchCredentials(selectedNode.data.provider || 'http');
        }
    }, [selectedNode.id]);

    const fetchCredentials = async (platform) => {
        if (!workspaceId) return;
        setIsLoadingCredentials(true);
        try {
            const res = await fetch(`/api/workspace/${workspaceId}/flowbot/credentials?platform=${platform}`);
            if (res.ok) {
                const data = await res.json();
                setCredentials(data);
            }
        } catch (e) {
            console.error("Failed to fetch credentials", e);
        } finally {
            setIsLoadingCredentials(false);
        }
    };

    const handleInputChange = (field, value) => {
        const newData = { ...localData, [field]: value };
        setLocalData(newData);
        updateNodeData(selectedNode.id, newData);
        
        // If provider changes, refetch credentials
        if (field === 'provider') {
            fetchCredentials(value);
        }
    };

    const handleTestCredential = async () => {
        if (!localData.credentialId) return;
        setIsTesting(true);
        setTestResult(null);
        try {
            const res = await fetch(`/api/workspace/${workspaceId}/flowbot/credentials/test`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    credentialId: localData.credentialId,
                    provider: localData.provider || 'gemini'
                })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setTestResult({ success: true, message: data.message });
                toast.success(data.message);
            } else {
                setTestResult({ success: false, message: data.error || "Connection failed" });
                toast.error(data.error || "Connection failed");
            }
        } catch (e) {
            setTestResult({ success: false, message: "Network error" });
            toast.error("Network error");
        } finally {
            setIsTesting(false);
            setTimeout(() => setTestResult(null), 5000);
        }
    };

    const shouldShowField = (field) => {
        if (!field.displayOptions || !field.displayOptions.show) return true;
        
        const show = field.displayOptions.show;
        return Object.entries(show).every(([key, values]) => {
            const currentValue = localData[key];
            return values.includes(currentValue);
        });
    };

    const FieldRenderer = ({ field }) => {
        if (!shouldShowField(field)) return null;

        return (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="flex items-center justify-between pl-1">
                    <label className="text-[10px] font-extrabold text-foreground/70 uppercase tracking-widest leading-none">
                        {field.displayName}
                    </label>
                    {field.description && (
                        <div className="group relative">
                            <Info size={10} className="text-muted-foreground opacity-40 hover:opacity-100 cursor-help" />
                            <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-popover border border-border rounded-lg text-[8px] font-medium text-popover-foreground invisible group-hover:visible shadow-xl z-50">
                                {field.description}
                            </div>
                        </div>
                    )}
                </div>

                {field.type === 'string' && (
                    <div className="relative">
                        {field.typeOptions?.rows ? (
                            <textarea 
                                value={localData[field.name] || field.default || ''}
                                onChange={(e) => handleInputChange(field.name, e.target.value)}
                                rows={field.typeOptions.rows}
                                className="flex w-full rounded-xl border border-border/50 bg-muted/20 px-3 py-3 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20 transition-all font-medium leading-relaxed resize-none"
                                placeholder={field.placeholder || ''}
                            />
                        ) : (
                            <Input 
                                value={localData[field.name] || field.default || ''}
                                onChange={(e) => handleInputChange(field.name, e.target.value)}
                                className="bg-muted/20 border-border/50 h-9 text-xs focus:ring-1 focus:ring-primary/20 transition-all font-medium"
                                placeholder={field.placeholder || ''}
                            />
                        )}
                    </div>
                )}

                {field.type === 'number' && (
                    <Input 
                        type="number"
                        value={localData[field.name] ?? field.default}
                        onChange={(e) => handleInputChange(field.name, Number(e.target.value))}
                        className="bg-muted/20 border-border/50 h-9 text-xs"
                        min={field.typeOptions?.min}
                        max={field.typeOptions?.max}
                        step={field.typeOptions?.step}
                    />
                )}

                {field.type === 'options' && (
                    <div className="relative group">
                        <select 
                            value={localData[field.name] || field.default || ''}
                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                            className="w-full bg-muted/20 border border-border/50 h-9 rounded-lg px-3 text-xs appearance-none focus:ring-1 focus:ring-primary/20 transition-all font-medium pr-8 cursor-pointer"
                        >
                            {field.options?.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.name}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none group-hover:text-primary transition-colors" />
                    </div>
                )}

                {field.type === 'credential' && (
                    <div className="space-y-2">
                        <div className="relative group">
                            <select 
                                value={localData[field.name] || ''}
                                onChange={(e) => handleInputChange(field.name, e.target.value)}
                                className="w-full bg-muted/20 border border-border/50 h-9 rounded-lg px-3 text-xs appearance-none focus:ring-1 focus:ring-primary/20 transition-all font-medium pr-8 cursor-pointer"
                            >
                                <option value="">Manual Entry (No Credential)</option>
                                {credentials.map(c => (
                                    <option key={c.id} value={c.id}>{c.profile || c.platform} ({c.platform})</option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none group-hover:text-primary transition-colors" />
                        </div>
                        
                        {localData[field.name] && (
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handleTestCredential}
                                disabled={isTesting}
                                className={`w-full h-7 rounded-lg text-[10px] font-bold border-dashed transition-all active:scale-95 flex items-center justify-center gap-2
                                    ${testResult?.success ? 'border-emerald-500/50 text-emerald-500 bg-emerald-500/5' : 
                                      testResult?.success === false ? 'border-rose-500/50 text-rose-500 bg-rose-500/5' : 
                                      'border-border hover:border-primary hover:text-primary bg-muted/20'}
                                `}
                            >
                                {isTesting ? <RefreshCw size={10} className="animate-spin" /> : 
                                 testResult?.success ? <CheckCircle2 size={10} /> : 
                                 testResult?.success === false ? <AlertTriangle size={10} /> : <Key size={10} />}
                                {isTesting ? "Verifying..." : testResult?.success ? "Auth Verified" : testResult?.success === false ? "Auth Failed" : "Test Connection"}
                            </Button>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const NodeIcon = nodeDef?.icon || Cpu;

    return (
        <div className="absolute top-4 right-4 bottom-4 w-[380px] bg-card/95 backdrop-blur-md border border-border shadow-2xl rounded-2xl flex flex-col z-50 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-6 border-b border-border space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl bg-primary/10`}>
                            <NodeIcon size={20} className={`text-primary`} />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-foreground uppercase tracking-tight">
                                {nodeDef?.displayName || 'Node Settings'}
                            </h2>
                            <p className="text-[10px] font-bold text-muted-foreground opacity-50 uppercase tracking-widest">
                                node_id: {selectedNode.id.substring(0, 8)}...
                            </p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={closePanel} className="rounded-full h-8 w-8 hover:bg-muted/50 transition-colors">
                        <X size={16} />
                    </Button>
                </div>

                <div className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold text-foreground/70 uppercase tracking-widest pl-1">Node Name</label>
                        <Input 
                            value={localData.label || ''} 
                            onChange={(e) => handleInputChange('label', e.target.value)}
                            className="bg-muted/20 border-border/50 h-9 text-xs focus:ring-1 focus:ring-primary/20 transition-all font-black uppercase"
                        />
                    </div>
                </div>
            </div>

            {/* Scrollable Settings */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                <div className="space-y-6">
                    <div className="flex items-center gap-2 px-1">
                        <Settings size={14} className="text-primary" />
                        <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">Parameters</span>
                        <Separator className="flex-1 bg-border/30" />
                    </div>

                    {nodeDef?.properties ? (
                        <div className="space-y-6">
                            {nodeDef.properties.map(field => (
                                <FieldRenderer key={field.name} field={field} />
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center space-y-3 opacity-40">
                            <Puzzle size={24} className="mx-auto" />
                            <p className="text-[10px] font-medium italic">No parameters available for this node type.</p>
                        </div>
                    )}
                </div>

                {/* Automation Preview (n8n Style) */}
                <div className="pt-4 border-t border-border/30 space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <Code size={14} className="text-muted-foreground/60" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Internal State</span>
                    </div>
                    <div className="bg-black/20 rounded-xl p-4 font-mono text-[9px] text-muted-foreground/80 leading-relaxed border border-border/50">
                        <span className="text-emerald-500/60">"subType":</span> "{localData.subType}",<br/>
                        <span className="text-emerald-500/60">"status":</span> "{localData.status || 'idle'}"
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 bg-muted/5 border-t border-border flex gap-3">
                <Button 
                    variant="outline"
                    className="flex-1 rounded-xl border-rose-500/20 text-rose-500 hover:bg-rose-500/10 font-bold text-[10px] uppercase h-10"
                    onClick={() => deleteNode(selectedNode.id)}
                >
                    <Trash2 size={12} className="mr-2" />
                    Delete
                </Button>
                <Button 
                    className="flex-1 rounded-xl bg-primary shadow-lg shadow-primary/20 font-bold text-[10px] uppercase h-10"
                    onClick={() => {
                        handleInputChange('configured', true);
                        toast.success("Node updated");
                        closePanel();
                    }}
                >
                    <CheckCircle2 size={12} className="mr-2" />
                    Save Changes
                </Button>
            </div>
        </div>
    );
};
