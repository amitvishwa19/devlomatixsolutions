'use client';

import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import {
    Zap,
    MessageSquare,
    Image,
    FileText,
    GitBranch,
    Clock,
    Play,
    CheckCircle2,
    AlertCircle,
} from 'lucide-react';
import { cn } from "@/lib/utils";

const NodeWrapper = ({ children, selected, title, icon: Icon, colorClass, configured }) => {
    return (
        <div className={cn(
            "relative rounded-sm border transition-all duration-300 min-w-[220px]  border",
            selected ? "ring-1 ring-primary border-primary/50 -translate-y-1 shadow-primary/10" : "hover:border-primary/40"
        )}>
            <div className="flex items-center justify-between p-2">
                <div className="flex items-center gap-2">
                    <div className={cn("p-1.5 rounded-lg bg-primary/10 text-primary")}>
                        <Icon size={16} />
                    </div>
                    <span className="text-xs font-bold text-muted-foreground">{title}</span>
                </div>
                {configured ? (
                    <CheckCircle2 size={14} className="text-emerald-500" />
                ) : (
                    <AlertCircle size={14} className="text-amber-500 animate-pulse" />
                )}
            </div>
            <div className="space-y-2 p-2">
                {children}
            </div>
        </div>
    );
};

export const TriggerNode = memo(({ id, data, selected }) => {
    return (
        <>
            <NodeWrapper
                selected={selected}
                title={data.type === 'welcome' ? 'Welcome' : 'Keyword'}
                icon={data.type === 'welcome' ? Play : Zap}
                colorClass="amber-500"
                configured={true}
            >
                <div className="text-sm font-semibold text-white">{data.label || 'Start Flow'}</div>
                <div className="text-[10px] text-muted-foreground italic">
                    {data.type === 'welcome' ? 'Triggered on first contact' : `Keywords: ${data.keywords || '...'}`}
                </div>
            </NodeWrapper>
            <Handle type="source" position={Position.Right} className="w-3 h-3 border-2 border-[#1e1e2e] bg-amber-500" />
        </>
    );
});

export const MessageNode = memo(({ id, data, selected }) => {
    const isImage = data.subType === 'imageMessage';
    const isTemplate = data.subType === 'templateMessage';

    return (
        <>
            <Handle type="target" position={Position.Left} className="w-3 h-3 border-2 border-[#1e1e2e] bg-emerald-500" />
            <NodeWrapper
                selected={selected}
                title={isImage ? 'Image' : isTemplate ? 'Template' : 'Message'}
                icon={isImage ? Image : isTemplate ? FileText : MessageSquare}
                colorClass="emerald-500"
                configured={!!(data.text || data.imageUrl || data.templateName)}
            >
                <div className="text-sm font-semibold text-white truncate">{data.label || 'Send Message'}</div>
                <div className="p-2 rounded bg-white/5 border border-white/5 text-[10px] text-muted-foreground line-clamp-2 italic">
                    {data.text || data.imageUrl || data.templateName || 'Click to configure...'}
                </div>
            </NodeWrapper>
            <Handle type="source" position={Position.Right} className="w-3 h-3 border-2 border-[#1e1e2e] bg-emerald-500" />
        </>
    );
});

export const LogicNode = memo(({ id, data, selected }) => {
    const isDelay = data.subType === 'delayNode';

    return (
        <>
            <Handle type="target" position={Position.Left} className="w-3 h-3 border-2 border-[#1e1e2e] bg-blue-500" />
            <NodeWrapper
                selected={selected}
                title={isDelay ? 'Delay' : 'Branch'}
                icon={isDelay ? Clock : GitBranch}
                colorClass="blue-500"
                configured={true}
            >
                <div className="text-sm font-semibold text-white">{data.label}</div>
                <div className="text-[10px] text-muted-foreground">
                    {isDelay ? `Wait for ${data.seconds || 5}s` : `Check: ${data.variable || '...'}`}
                </div>
            </NodeWrapper>
            <Handle type="source" position={Position.Right} className="w-3 h-3 border-2 border-[#1e1e2e] bg-blue-500" />
        </>
    );
});

export const nodeTypes = {
    triggerNode: TriggerNode,
    messageNode: MessageNode,
    logicNode: LogicNode,
};