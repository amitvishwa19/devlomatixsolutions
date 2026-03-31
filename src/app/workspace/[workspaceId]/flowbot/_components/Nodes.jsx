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
                    relative p-2 rounded-md border bg-card transition-all duration-300 group
                    backdrop-blur-md min-w-[200px] shadow-lg
                    ${selected ? `border-${colorClass} shadow-${colorClass}/20 -translate-y-1` : 'border-border/50 hover:border-border'}
                `}>
                    {/* Status Line */}
                    <div className={`absolute -top-px left-4 right-4 h-[3px] rounded-full opacity-60 ${`bg-${colorClass}`}`} />

                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg bg-${colorClass}/10`}>
                                <Icon size={14} className={`text-${colorClass}`} />
                            </div>
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-foreground/80">{title}</span>
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

export const nodeTypes = {
    triggerNode: TriggerNode,
    actionNode: ActionNode,
};
