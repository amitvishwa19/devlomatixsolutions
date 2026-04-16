'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
    Bot, 
    Cpu, 
    ArrowUpDown, 
    X, 
    Plus, 
    Info, 
    Zap, 
    RefreshCw,
    Sparkles, 
    Terminal,
    BrainCircuit,
    ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';
import axios from '@/utils/axios';
import { ScrollArea } from '@/components/ui/scroll-area';

import { useParams } from 'next/navigation';
import { useModal } from "@/hooks/useModal";
import { useSession } from 'next-auth/react';

export const AddAgentPersonaModal = () => {
    const { onClose, activeModals } = useModal();
    const modalData = activeModals["addAgentPersona"];
    const isModalOpen = !!modalData;

    const params = useParams();
    const workspaceId = params.workspaceId;

    const { data: session } = useSession();
    const { onApply, agent: editingAgent, userId: passedUserId } = modalData || {};
    const userId = passedUserId || session?.user?.userId;

    const [loading, setLoading] = useState(false);
    const [fetchingModels, setFetchingModels] = useState(false);
    const [availableModels, setAvailableModels] = useState([]);
    
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        description: '',
        systemPrompt: '',
        type: 'OpenClaw',
        modelIds: [] // Ordered list of model IDs
    });

    useEffect(() => {
        if (isModalOpen) {
            fetchVerifiedModels();
            if (editingAgent) {
                setFormData({
                    name: editingAgent.name || '',
                    role: editingAgent.role || '',
                    description: editingAgent.description || '',
                    systemPrompt: editingAgent.systemPrompt || '',
                    type: editingAgent.type || 'OpenClaw',
                    modelIds: editingAgent.models?.map(m => m.modelId) || []
                });
            } else {
                setFormData({
                    name: '',
                    role: '',
                    description: '',
                    systemPrompt: '',
                    type: 'OpenClaw',
                    modelIds: []
                });
            }
        }
    }, [isModalOpen, editingAgent]);

    const fetchVerifiedModels = async () => {
        setFetchingModels(true);
        try {
            const res = await axios.get(`/api/workspace/${workspaceId}/agent/model`);
            // STRICT FILTERING: Only show models with 'Excellent' health status
            const verified = res.data.filter(m => m.healthStatus === 'Excellent');
            setAvailableModels(verified);
        } catch (error) {
            console.error("Failed to fetch verified models:", error);
            toast.error("Cluster discovery failed. Please verify Mission Control status.");
        } finally {
            setFetchingModels(false);
        }
    };

    const handleSave = async () => {
        if (!formData.name || !formData.role) {
            toast.error("Persona name and role are mandatory parameters.");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                id: editingAgent?.id
            };

            await axios.patch(`/api/workspace/${workspaceId}/agent`, payload);
            toast.success(editingAgent ? "Persona telemetry updated" : "New Persona deployed to workforce");
            onApply?.();
            onClose();
        } catch (error) {
            console.error("Save Persona Error:", error);
            toast.error("Orchestration failure during deployment.");
        } finally {
            setLoading(false);
        }
    };

    const toggleModel = (modelId) => {
        setFormData(prev => {
            const isSelected = prev.modelIds.includes(modelId);
            if (isSelected) {
                return { ...prev, modelIds: prev.modelIds.filter(id => id !== modelId) };
            } else {
                return { ...prev, modelIds: [...prev.modelIds, modelId] };
            }
        });
    };

    const movePriority = (index, direction) => {
        const newIds = [...formData.modelIds];
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= newIds.length) return;
        
        [newIds[index], newIds[targetIndex]] = [newIds[targetIndex], newIds[index]];
        setFormData({ ...formData, modelIds: newIds });
    };

    return (
        <Dialog open={isModalOpen} onOpenChange={() => onClose('addAgentPersona')}>
            <DialogContent className="max-w-2xl bg-[#0a0a0a] border-white/5 backdrop-blur-2xl shadow-2xl p-0 overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-br from-indigo-500/5 via-transparent to-transparent pointer-events-none" />
                
                <DialogHeader className="p-6 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                            <Bot className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl text-foreground font-bold">
                                {editingAgent ? `Calibrate ${editingAgent.name}` : "Persona Factory"}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                                <Sparkles className="w-3 h-3" /> Defining specialized AI workforce intelligence
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {/* Basic Configuration */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-black">Persona Name</Label>
                            <Input 
                                placeholder="e.g. Lead Architect"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="bg-white/5 border-white/10 rounded-xl h-11 focus:border-indigo-500/50 transition-all font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-black">Specialized Role</Label>
                            <Input 
                                placeholder="e.g. Code Reviewer"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="bg-white/5 border-white/10 rounded-xl h-11 focus:border-indigo-500/50 transition-all font-bold"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-black">Mission Objective (Description)</Label>
                        <Input 
                            placeholder="Primary purpose of this agent in the cluster..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="bg-white/5 border-white/10 rounded-xl h-11 focus:border-indigo-500/50 transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-black">System Intelligence (Prompt)</Label>
                            <Badge variant="outline" className="text-[9px] bg-indigo-500/5 border-indigo-500/20 text-indigo-400 capitalize">
                                <Terminal className="w-2.5 h-2.5 mr-1" /> RAW EXECUTION
                            </Badge>
                        </div>
                        <Textarea 
                            placeholder="Define the persona's core logic, constraints, and behavioral patterns..."
                            value={formData.systemPrompt}
                            onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                            className="bg-white/5 border-white/10 rounded-xl min-h-[120px] focus:border-indigo-500/50 transition-all font-mono text-xs leading-relaxed"
                        />
                    </div>

                    {/* Intelligence Assignment */}
                    <div className="space-y-4 pt-4 border-t border-white/5">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-black flex items-center gap-2">
                                    <BrainCircuit className="w-3 h-3 text-indigo-400" /> Intelligence Priority Chain
                                </Label>
                                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <ShieldCheck className="w-2.5 h-2.5 text-emerald-500" /> Verified models only from Mission Control
                                </p>
                            </div>
                            <Badge variant="outline" className="text-[9px] font-bold">
                                {formData.modelIds.length} Linked Nodes
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                            {/* Available (Filtered) */}
                            <div className="space-y-3">
                                <p className="text-[10px] font-black uppercase text-white/20 tracking-tighter">Available Cluster Nodes</p>
                                <ScrollArea className="h-40 rounded-xl border border-white/5 bg-white/[0.02] p-2">
                                    {fetchingModels ? (
                                        <div className="flex items-center justify-center h-full">
                                            <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : availableModels.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full p-4 opacity-40">
                                            <Info className="w-4 h-4 mb-2" />
                                            <p className="text-[9px] text-center uppercase tracking-widest leading-4">No verified nodes in cluster.<br/>Run Mission Control handshakes.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-1">
                                            {availableModels.map(model => {
                                                const isSelected = formData.modelIds.includes(model.id);
                                                return (
                                                    <div 
                                                        key={model.id}
                                                        onClick={() => toggleModel(model.id)}
                                                        className={`p-2 rounded-lg flex items-center justify-between cursor-pointer transition-all ${
                                                            isSelected ? 'bg-indigo-500/20 text-indigo-400' : 'hover:bg-white/5 text-muted-foreground'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center">
                                                                <Cpu className="w-3 h-3" />
                                                            </div>
                                                            <span className="text-[11px] font-bold truncate max-w-[120px]">{model.name.split('/').pop()}</span>
                                                        </div>
                                                        {isSelected ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3 opacity-20" />}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </ScrollArea>
                            </div>

                            {/* Priority Order */}
                            <div className="space-y-3">
                                <p className="text-[10px] font-black uppercase text-indigo-500/40 tracking-tighter">Fallback Architecture</p>
                                <ScrollArea className="h-40 rounded-xl border border-indigo-500/20 bg-indigo-500/[0.03] p-2">
                                    {formData.modelIds.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full p-4 opacity-40">
                                            <Zap className="w-4 h-4 mb-2" />
                                            <p className="text-[9px] text-center uppercase tracking-widest">Assign models to define fallback strategy</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-1">
                                            {formData.modelIds.map((id, index) => {
                                                const model = availableModels.find(m => m.id === id);
                                                if (!model) return null;
                                                return (
                                                    <div key={id} className="p-2 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between group">
                                                        <div className="flex items-center gap-2 overflow-hidden">
                                                            <div className="w-5 h-5 rounded-full bg-indigo-500/10 flex items-center justify-center text-[9px] font-black text-indigo-400">
                                                                {index + 1}
                                                            </div>
                                                            <span className="text-[11px] font-bold text-white/80 truncate">{model.name.split('/').pop()}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button 
                                                                size="icon" 
                                                                variant="ghost" 
                                                                className="w-5 h-5" 
                                                                onClick={() => movePriority(index, -1)}
                                                                disabled={index === 0}
                                                            >
                                                                <ArrowUpDown className="w-2.5 h-2.5 rotate-180" />
                                                            </Button>
                                                            <Button 
                                                                size="icon" 
                                                                variant="ghost" 
                                                                className="w-5 h-5" 
                                                                onClick={() => movePriority(index, 1)}
                                                                disabled={index === formData.modelIds.length - 1}
                                                            >
                                                                <ArrowUpDown className="w-2.5 h-2.5" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </ScrollArea>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-6 border-t border-white/5 bg-white/[0.02] flex items-center justify-between sm:justify-between">
                    <p className="text-[9px] text-muted-foreground font-medium flex items-center gap-2">
                        <Info className="w-3 h-3" /> Telemetry will be synced across swarm
                    </p>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" onClick={onClose} disabled={loading} className="text-xs font-bold rounded-xl hover:bg-white/5 transition-all px-6">Cancel</Button>
                        <Button 
                            onClick={handleSave} 
                            disabled={loading}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/20 px-8 h-10 gap-2"
                        >
                            {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                            {editingAgent ? "Update Persona" : "Deploy Persona"}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
