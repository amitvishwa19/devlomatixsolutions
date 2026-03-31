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
    ExternalLink
} from 'lucide-react';
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
    ContextMenuSeparator,
} from "@/components/ui/context-menu";

const NodeWrapper = ({ children, selected, title, icon: Icon, colorClass, status, configured, nodeId, onDelete }) => {
    return (
        <ContextMenu>
            <ContextMenuTrigger>
                <div className={`
                    relative p-2 rounded-md border transition-all duration-300 group
                    dark:bg-[#1e1e2e] backdrop-blur-md min-w-[200px] shadow-lg
                    ${selected ? `border-${colorClass} shadow-${colorClass}/20 -translate-y-1` : 'border-border/50 hover:border-border'}
                `}>
                    {/* Status Line */}
                    <div className={`absolute -top-px left-4 right-4 h-[2px] rounded-full opacity-60 ${`bg-${colorClass}`}`} />

                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg bg-${colorClass}/10`}>
                                <Icon size={14} className={`text-${colorClass}`} />
                            </div>
                            <span className="text-[10px] font-bold  ">{title}</span>
                        </div>
                        {configured ? (
                            <CheckCircle2 size={12} className="text-emerald-500" />
                        ) : (
                            <AlertCircle size={12} className="text-amber-500 animate-pulse" />
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
            >
                <h3 className="text-xs font-bold truncate leading-tight">{data.label}</h3>
                <p className="text-[10px] text-muted-foreground line-clamp-1">{data.description || "Waiting for signal..."}</p>
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
    return (
        <div className={`
            relative px-5 py-4 rounded-xl border-2 transition-all duration-300
            bg-card min-w-[220px] shadow-2xl
            ${selected ? 'border-indigo-500 shadow-indigo-500/20 -translate-y-1' : 'border-slate-700 hover:border-slate-600'}
        `}>
            {/* Left Sequence Handle */}
            <Handle
                type="target"
                id="seq-in"
                position={Position.Left}
                className="w-4 h-4 bg-[#cdd6f4]! border-2 border-[#1e1e2e]! rounded-sm transition-transform hover:scale-125"
            />

            <div className="flex items-center gap-4 py-2">
                <div className="p-2 rounded-xl bg-slate-800/50">
                    <Bot size={32} className="text-[#cdd6f4]" />
                </div>
                <div className="space-y-0.5">
                    <h3 className="text-sm font-black text-[#cdd6f4] leading-tight tracking-tight uppercase">AI Agent</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{data.reasoning || 'Tools Agent'}</p>
                </div>
            </div>

            {/* Bottom Attachment handles */}
            <div className="absolute -bottom-6 left-0 right-0 flex justify-around px-4">
                <div className="flex flex-col items-center">
                    <Handle
                        type="target"
                        id="model-in"
                        position={Position.Bottom}
                        className="w-3 h-3 bg-[#cdd6f4]! border-2 border-[#1e1e2e]! rotate-45 transition-transform hover:scale-125"
                        style={{ left: '15%', bottom: '24px' }}
                    />
                    <span className="text-[8px] font-black uppercase text-slate-500 mt-2">Chat Model</span>
                </div>

                <div className="flex flex-col items-center">
                    <Handle
                        type="target"
                        id="memory-in"
                        position={Position.Bottom}
                        className="w-3 h-3 bg-[#cdd6f4]! border-2 border-[#1e1e2e]! rotate-45 transition-transform hover:scale-125"
                        style={{ left: '50%', bottom: '24px' }}
                    />
                    <span className="text-[8px] font-black uppercase text-slate-500 mt-2">Memory</span>
                </div>

                <div className="flex flex-col items-center">
                    <Handle
                        type="target"
                        id="tools-in"
                        position={Position.Bottom}
                        className="w-3 h-3 bg-[#cdd6f4]! border-2 border-[#1e1e2e]! rotate-45 transition-transform hover:scale-125"
                        style={{ left: '85%', bottom: '24px' }}
                    />
                    <span className="text-[8px] font-black uppercase text-slate-500 mt-2">Tool</span>
                </div>
            </div>

            {/* Right Sequence Handle */}
            <Handle
                type="source"
                id="seq-out"
                position={Position.Right}
                className="w-4 h-4 bg-[#cdd6f4]! border-2 border-[#1e1e2e]! rounded-full transition-transform hover:scale-125"
            />
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
