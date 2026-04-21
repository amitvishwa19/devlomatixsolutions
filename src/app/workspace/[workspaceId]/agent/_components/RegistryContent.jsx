'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Bot, 
    Plus, 
    Settings2, 
    Trash2, 
    BrainCircuit, 
    Layers, 
    Cpu, 
    Cpu as CpuIcon, 
    Globe, 
    Zap 
} from 'lucide-react';

export const RegistryContent = ({ config, models, onOpen, workspaceId, userId, fetchAll, setActiveTab, setSelectedAgentId }) => {
    const handleTalkToAgent = (agentId) => {
        setSelectedAgentId(agentId);
        setActiveTab('terminal');
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Agent Workforce Hub */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                        <Bot className="w-5 h-5 text-indigo-500" />
                        <h2 className="text-sm font-bold tracking-widest text-muted-foreground uppercase">Agent Workforce</h2>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onOpen('addAgentPersona', { workspaceId, userId, onApply: fetchAll })}
                        className="h-8 text-[10px] font-black uppercase tracking-widest rounded-md border-indigo-500/20 text-indigo-400 bg-indigo-500/5 hover:bg-indigo-500/10"
                    >
                        <Plus className="w-3 h-3 mr-1" /> Create Agent
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {config?.agents?.length > 0 ? (
                        config.agents.map((agent) => (
                            <Card key={agent.id} className="border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all group rounded-xl overflow-hidden relative">
                                <div className="p-4 flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                            <Bot className="w-5 h-5 text-indigo-400" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-sm text-foreground/90">{agent.name}</h4>
                                                <Badge variant="outline" className="text-[9px] bg-indigo-500/5 border-indigo-500/20 text-indigo-400 uppercase tracking-widest px-1.5 h-4">
                                                    {agent.role || agent.type}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground font-medium opacity-60">
                                                <span className="flex items-center gap-1"><BrainCircuit className="w-2.5 h-2.5" /> {agent.models?.length || 0} Model Nodes</span>
                                                <span className="flex items-center gap-1"><Layers className="w-2.5 h-2.5" /> {agent.type}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="w-8 h-8 rounded-lg hover:bg-indigo-500/10 hover:text-indigo-500"
                                            onClick={() => handleTalkToAgent(agent.id)}
                                        >
                                            <Rocket className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="w-8 h-8 rounded-lg hover:bg-white/5"
                                            onClick={() => onOpen('addAgentPersona', { agent, workspaceId, userId, onApply: fetchAll })}
                                        >
                                            <Settings2 className="w-3.5 h-3.5 text-muted-foreground" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-rose-500/10 hover:text-rose-500">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                                {/* Priority Chain Visualization */}
                                <div className="px-4 pb-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                                    {agent.models?.map((m, idx) => (
                                        <div key={m.id} className="flex items-center gap-1.5 shrink-0">
                                            <div className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[9px] font-bold text-muted-foreground flex items-center gap-1">
                                                <Cpu className="w-2.5 h-2.5" /> {m.model?.name?.split('/').pop()}
                                            </div>
                                            {idx < agent.models.length - 1 && <div className="w-2 h-[1px] bg-white/10" />}
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className="p-12 text-center border-2 border-dashed border-white/5 rounded-2xl opacity-20 capitalize text-xs tracking-widest italic">
                            No active workforce registered.
                        </div>
                    )}
                </div>
            </div>

            {/* Inventory of Models */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                        <CpuIcon className="w-5 h-5 text-fuchsia-500" />
                        <h2 className="text-sm font-bold tracking-widest text-muted-foreground uppercase">Model Intelligence</h2>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onOpen('addAgentModel', { workspaceId, userId, onApply: fetchAll })}
                        className="h-8 text-[10px] font-black uppercase tracking-widest rounded-md border-fuchsia-500/20 text-fuchsia-400 bg-fuchsia-500/5 hover:bg-fuchsia-500/10"
                    >
                        <Plus className="w-3 h-3 mr-1" /> Add Model
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {models.map((model) => (
                        <Card key={model.id} className="border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all group rounded-xl overflow-hidden relative">
                            <div className="p-4 flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center">
                                        <Globe className="w-5 h-5 text-fuchsia-400" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-sm text-foreground/90">{model.name.split('/').pop()}</h4>
                                            <Badge variant="outline" className="text-[9px] bg-fuchsia-500/5 border-fuchsia-500/20 text-fuchsia-400 uppercase tracking-widest px-1.5 h-4">
                                                {model.provider}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground font-medium opacity-60">
                                            <span className="flex items-center gap-1">
                                                <div className={`w-1.5 h-1.5 rounded-full ${model.healthStatus === 'Excellent' ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
                                                {model.healthStatus}
                                            </span>
                                            <span className="flex items-center gap-1"><Zap className="w-2.5 h-2.5" /> {model.latency}</span>
                                        </div>
                                    </div>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => setActiveTab('llm-models')}
                                    className="w-8 h-8 rounded-lg hover:bg-white/5"
                                >
                                    <Settings2 className="w-3.5 h-3.5 text-muted-foreground" />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};
