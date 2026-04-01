'use client';

import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import {
    Zap,
    Bot,
    Mail,
    Globe,
    Database,
    Clock,
    Cpu,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    Search,
    MessageSquare,
    Workflow,
    ArrowRight,
    Play,
    FileText,
    AlertTriangle,
    RefreshCw,
    Trash2,
    Copy,
    ExternalLink,
    Key
} from 'lucide-react';
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
    ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { Button } from '@/components/ui/button';

const NodeWrapper = ({ children, selected, title, icon: Icon, colorClass, status, configured, nodeId, onDelete, hasCredential }) => {
    const isWorking = status === 'working';
    const displayColor = isWorking ? 'amber-500' : colorClass;

    return (
        <ContextMenu>
            <ContextMenuTrigger>
                <div className={`
                    relative p-2 rounded-md border transition-all duration-300 group
                    dark:bg-[#1e1e2e] backdrop-blur-md min-w-[200px] shadow-lg
                    ${selected ? `border-${colorClass} shadow-${colorClass}/20 -translate-y-1` : 'border-border/50 hover:border-border'}
                    ${isWorking ? `border-amber-500 ring-4 ring-amber-500/10 animate-pulse` : ''}
                `}>
                    {/* Status Line */}
                    <div className={`absolute -top-px left-4 right-4 h-[2px] rounded-full opacity-60 ${isWorking ? 'bg-amber-400' : `bg-${colorClass}`}`} />

                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg ${isWorking ? 'bg-amber-400/20 text-amber-400' : `bg-${colorClass}/10`}`}>
                                <Icon size={14} className={isWorking ? 'animate-spin-slow' : `text-${colorClass}`} />
                            </div>
                            <span className="text-[10px] font-bold">{title}</span>
                        </div>
                        {isWorking ? (
                             <div className="flex items-center gap-1.5 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                                <span className="h-1 w-1 rounded-full bg-amber-400 animate-ping" />
                                <span className="text-[8px] font-black uppercase text-amber-400 tracking-tighter">Working</span>
                             </div>
                        ) : configured ? (
                            <div className="flex items-center gap-1.5">
                                {hasCredential && <Key size={10} className="text-emerald-500 animate-pulse" />}
                                <CheckCircle2 size={12} className="text-emerald-500" />
                            </div>
                        ) : (
                            <AlertCircle size={12} className="text-amber-500" />
                        )}
                    </div>

                    <div className="space-y-1.5 px-0.5">
                        {children}
                    </div>

                    {/* Glowing effect on selection */}
                    {selected && (
                        <div className={`absolute inset-0 rounded-xl bg-${colorClass}/5 animate-pulse -z-10`} />
                    )}
                </div>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-56 rounded-xl shadow-lg border-border/50 bg-card/95 backdrop-blur-md">
                <ContextMenuItem className="text-[10px] uppercase font-bold text-muted-foreground opacity-50 px-3 py-2" disabled>
                    Node: {nodeId?.substring(0, 8)}...
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem className="flex items-center gap-2 px-3 py-2 cursor-pointer focus:bg-primary/10 focus:text-primary transition-colors hover:bg-primary/5" onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(nodeId);
                }}>
                    <Copy size={14} />
                    <span className="text-xs font-medium">Copy Node ID</span>
                </ContextMenuItem>
                <ContextMenuItem className="flex items-center gap-2 px-3 py-2 cursor-pointer focus:bg-primary/10 focus:text-primary transition-colors hover:bg-primary/5" onClick={(e) => e.stopPropagation()}>
                    <ExternalLink size={14} />
                    <span className="text-xs font-medium">View JSON Data</span>
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem
                    className="flex items-center gap-2 px-3 py-2 cursor-pointer text-rose-500 focus:bg-rose-500/10 focus:text-rose-500 transition-colors"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDelete && onDelete(nodeId);
                    }}
                >
                    <Trash2 size={14} />
                    <span className="text-xs font-bold">Delete Node</span>
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
};

export const TriggerNode = memo(({ id, data, selected }) => {
    const getIcon = () => {
        switch (data.subType) {
            case 'schedule': return Clock;
            case 'manual': return Play;
            case 'form': return FileText;
            case 'api-poll': return RefreshCw;
            case 'error': return AlertTriangle;
            case 'chat': return MessageSquare;
            default: return Zap;
        }
    };

    return (
        <>
            <NodeWrapper
                nodeId={id}
                onDelete={data.onDelete}
                selected={selected}
                title={data.subType?.toUpperCase() || "Trigger"}
                icon={getIcon()}
                colorClass="amber-500"
                configured={data.configured}
                status={data.status}
                hasCredential={!!data.credentialId}
            >
                <h3 className="text-xs font-bold truncate leading-tight">{data.label}</h3>
                <p className="text-[10px] text-muted-foreground line-clamp-1">{data.description || "Waiting for signal..."}</p>
                
                {data.subType === 'chat' && (
                    <div className="pt-3">
                        <Button 
                            variant="secondary" 
                            size="xs" 
                            onClick={(e) => {
                                e.stopPropagation();
                                data.onOpenChat && data.onOpenChat();
                            }}
                            className="w-full h-7 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 border border-amber-500/20 text-[9px] font-black uppercase tracking-tighter transition-all active:scale-95"
                        >
                            <MessageSquare size={10} className="mr-1.5" /> Test Chat
                        </Button>
                    </div>
                )}
            </NodeWrapper>
            <Handle
                type="source"
                position={Position.Right}
                className="w-3 h-3 bg-amber-500! border-2 border-background ring-4 ring-amber-500/10 transition-transform hover:scale-125"
            />
        </>
    );
});

export const ActionNode = memo(({ id, data, selected }) => {
    const getIcon = () => {
        switch (data.subType) {
            case 'ai': return Bot;
            case 'email': return Mail;
            case 'http': return Globe;
            case 'db': return Database;
            default: return Cpu;
        }
    };

    return (
        <>
            <Handle
                type="target"
                position={Position.Left}
                className="w-3 h-3 bg-emerald-500! border-2 border-background ring-4 ring-emerald-500/10 transition-transform hover:scale-125"
            />
            <NodeWrapper
                nodeId={id}
                onDelete={data.onDelete}
                selected={selected}
                title={data.subType?.toUpperCase() || "Action"}
                icon={getIcon()}
                colorClass="emerald-500"
                configured={data.configured}
                status={data.status}
                hasCredential={!!data.credentialId}
            >
                <h3 className="text-xs font-bold truncate leading-tight">{data.label}</h3>
                <p className="text-[10px] text-muted-foreground line-clamp-1 italic">
                    {data.description || "Pending configuration..."}
                </p>

                {data.configured && (
                    <div className="pt-2 flex items-center gap-1.5 text-[9px] text-emerald-500/80 font-medium">
                        <ArrowRight size={10} /> Ready for production
                    </div>
                )}
            </NodeWrapper>
            <Handle
                type="source"
                position={Position.Right}
                className="w-3 h-3 bg-emerald-500! border-2 border-background ring-4 ring-emerald-500/10 transition-transform hover:scale-125"
            />
        </>
    );
});

export const ModelNode = memo(({ id, data, selected }) => {
    return (
        <>
            <NodeWrapper
                nodeId={id}
                onDelete={data.onDelete}
                selected={selected}
                title="Model"
                icon={Cpu}
                colorClass="purple-500"
                configured={data.configured}
                status={data.status}
                hasCredential={!!data.credentialId}
            >
                <h3 className="text-xs font-bold truncate leading-tight">{data.label}</h3>
                <div className="mt-2 flex items-center gap-2">
                    <Badge variant="outline" className="text-[8px] bg-purple-500/5 text-purple-500 border-purple-500/20 px-1 py-0 uppercase font-black">
                        {data.subType === 'model' ? 'Large Language Model' : 'Embedding'}
                    </Badge>
                </div>
            </NodeWrapper>
            <Handle
                type="source"
                id="model-out"
                position={Position.Right}
                className="w-3 h-3 bg-purple-500! border-2 border-background ring-4 ring-purple-500/10 transition-transform hover:scale-125"
            />
            <Handle
                type="source"
                id="model-attachment"
                position={Position.Bottom}
                className="w-3 h-3 bg-purple-500! border-2 border-background ring-4 ring-purple-500/10 transition-transform hover:scale-125"
            />
        </>
    );
});

export const MemoryNode = memo(({ id, data, selected }) => {
    return (
        <>
            <NodeWrapper
                nodeId={id}
                onDelete={data.onDelete}
                selected={selected}
                title="Memory"
                icon={History}
                colorClass="blue-500"
                configured={data.configured}
                status={data.status}
            >
                <h3 className="text-xs font-bold truncate leading-tight">{data.label}</h3>
                <p className="text-[10px] text-muted-foreground line-clamp-1 italic">
                    Type: {data.subType === 'window' ? 'Sliding Window' : 'Persistent'}
                </p>
            </NodeWrapper>
            <Handle
                type="source"
                id="memory-out"
                position={Position.Right}
                className="w-3 h-3 bg-blue-500! border-2 border-background ring-4 ring-blue-500/10 transition-transform hover:scale-125"
            />
            <Handle
                type="source"
                id="memory-attachment"
                position={Position.Bottom}
                className="w-3 h-3 bg-blue-500! border-2 border-background ring-4 ring-blue-500/10 transition-transform hover:scale-125"
            />
        </>
    );
});

export const AgentNode = memo(({ id, data, selected }) => {
    const isWorking = data.status === 'working';
    
    return (
        <div className={`
            relative px-4 py-3 rounded-md border transition-all duration-300
            bg-[#2a2a3a] min-w-[180px] shadow-2xl
            ${selected ? 'border-indigo-500 ring-1 ring-indigo-500/50' : 'border-slate-700'}
            ${isWorking ? 'animate-pulse ring-4 ring-indigo-500/20' : ''}
        `}>
            {/* Left Sequence Handle - Square Notched */}
            <Handle
                type="target"
                id="seq-in"
                position={Position.Left}
                className="w-[6px]! h-3! bg-slate-400! border-none! rounded-sm! -left-[3px]!"
            />

            <div className="flex items-center gap-3">
                <div className="text-white/90">
                    <Bot size={24} strokeWidth={1.5} />
                </div>
                <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-white leading-tight tracking-tight">AI Agent</span>
                    <span className="text-[9px] text-slate-400 font-medium leading-tight tracking-wide uppercase">{data.reasoning || 'Tools Agent'}</span>
                </div>
            </div>

            {/* Bottom Attachment handles - Triangular */}
            <div className="absolute -bottom-[6px] left-0 right-0 flex justify-around px-4">
                <Handle
                    type="target"
                    id="model-in"
                    position={Position.Bottom}
                    className="w-3! h-2.5! bg-slate-400! border-none! rounded-none! static! translate-x-0!"
                    style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
                />
                <Handle
                    type="target"
                    id="memory-in"
                    position={Position.Bottom}
                    className="w-3! h-2.5! bg-slate-400! border-none! rounded-none! static! translate-x-0!"
                    style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
                />
                <Handle
                    type="target"
                    id="tools-in"
                    position={Position.Bottom}
                    className="w-3! h-2.5! bg-slate-400! border-none! rounded-none! static! translate-x-0!"
                    style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
                />
            </div>

            {/* Right Sequence Handle - Circle Notched */}
            <Handle
                type="source"
                id="seq-out"
                position={Position.Right}
                className="w-[6px]! h-[6px]! bg-slate-400! border-none! rounded-full! -right-[3px]!"
            />

            {/* Working State Badge */}
            {isWorking && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-indigo-500 px-2 py-0.5 rounded-full border border-indigo-400 shadow-xl z-20 flex items-center gap-1.5">
                    <RefreshCw size={8} className="text-white animate-spin" />
                    <span className="text-[8px] font-black uppercase text-white tracking-widest">Reasoning</span>
                </div>
            )}
        </div>
    );
});

export const nodeTypes = {
    triggerNode: TriggerNode,
    actionNode: ActionNode,
    modelNode: ModelNode,
    memoryNode: MemoryNode,
    agentNode: AgentNode,
};

const Badge = ({ children, className, variant }) => (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${className}`}>
        {children}
    </span>
);
