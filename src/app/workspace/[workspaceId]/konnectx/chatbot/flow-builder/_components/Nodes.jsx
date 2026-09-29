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
    Globe,
    CreditCard,
    Package,
    Sparkles,
    UserCheck,
    Tag,
    Sliders,
    MessageSquareText
} from 'lucide-react';
import { cn } from "@/lib/utils";

const NodeWrapper = ({ children, selected, title, icon: Icon, configured, data, id }) => {
    const handleContextMenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        data?.onContextMenu?.(e, id);
    };

    const isHighlighted = selected || data?.isHighlighted;

    return (
        <div
            style={{ width: '200px', maxWidth: '200px', minWidth: '200px' }}
            className={cn(
                "relative rounded-sm border transition-all duration-300 w-[200px] max-w-[200px] overflow-hidden border-primary/20 bg-card dark:bg-[#1e1e2e]/90",
                isHighlighted 
                    ? "border-emerald-400 ring-2 ring-emerald-500/40 -translate-y-1 shadow-emerald-500/20" 
                    : selected 
                    ? "border-primary/60 -translate-y-1 shadow-primary/10" 
                    : "hover:border-primary/40"
            )}
            onContextMenu={handleContextMenu}
        >
            <div className="flex items-center justify-between p-2 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                    <div className={cn("p-1.5 rounded-lg bg-primary/10 text-primary shrink-0")}>
                        <Icon size={16} />
                    </div>
                    <span className="text-xs font-bold text-muted-foreground truncate">{title}</span>
                </div>
                {configured ? (
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                ) : (
                    <AlertCircle size={14} className="text-amber-500 animate-pulse shrink-0" />
                )}
            </div>
            <div className="space-y-2 p-2 min-w-0">
                {children}
            </div>
        </div>
    );
};

export const TriggerNode = memo(({ id, data, selected }) => {
    const isWelcome = data.type === 'welcome' || data.subType === 'welcome';
    return (
        <>
            <NodeWrapper
                selected={selected}
                title={isWelcome ? 'Welcome' : 'Keyword'}
                icon={isWelcome ? Play : Zap}
                configured={true}
                data={data}
                id={id}
            >
                <div className="text-sm font-semibold text-white truncate">{data.label || 'Start Flow'}</div>
                <div className="text-[10px] text-muted-foreground italic truncate">
                    {isWelcome ? 'Triggered on first contact' : `Keywords: ${data.keywords || '...'}`}
                </div>
            </NodeWrapper>
            <Handle type="source" position={Position.Right} className="w-3 h-3 border-2 border-[#1e1e2e] bg-amber-500" />
        </>
    );
});
TriggerNode.displayName = 'TriggerNode';

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
                configured={!!(data.text || data.imageUrl || data.templateName)}
                data={data}
                id={id}
            >
                <div className="text-sm font-semibold text-white truncate">{data.label || 'Send Message'}</div>
                <div className="p-2 rounded bg-white/5 border border-white/5 text-[10px] text-muted-foreground line-clamp-2 break-all overflow-hidden leading-snug">
                    {data.text || data.imageUrl || (data.templateName ? `Template: ${data.templateName}` : 'Click to configure...')}
                </div>
            </NodeWrapper>
            <Handle type="source" position={Position.Right} className="w-3 h-3 border-2 border-[#1e1e2e] bg-emerald-500" />
        </>
    );
});
MessageNode.displayName = 'MessageNode';

export const LogicNode = memo(({ id, data, selected }) => {
    const isDelay = data.subType === 'delayNode' || data.subType === 'delay';
    const isWaitForInput = data.subType === 'waitForInput';
    const isSetVariable = data.subType === 'setVariable';
    const isCondition = !isDelay && !isWaitForInput && !isSetVariable;

    const isConfigured = isDelay
        ? !!data.seconds
        : isWaitForInput
        ? !!(data.variable)
        : isSetVariable
        ? !!(data.variable && data.value)
        : !!(data.variable && (data.value !== undefined || data.operation === 'exists'));

    return (
        <>
            <Handle type="target" position={Position.Left} className="w-3 h-3 border-2 border-[#1e1e2e] bg-blue-500" />
            <NodeWrapper
                selected={selected}
                title={isDelay ? 'Delay' : isWaitForInput ? 'Wait for Input' : isSetVariable ? 'Set Variable' : 'Condition'}
                icon={isDelay ? Clock : isWaitForInput ? MessageSquareText : isSetVariable ? Sliders : GitBranch}
                configured={isConfigured}
                data={data}
                id={id}
            >
                <div className="text-sm font-semibold text-white truncate">
                    {data.label || (isDelay ? 'Delay' : isWaitForInput ? 'Wait for Input' : isSetVariable ? 'Set Variable' : 'Condition Branch')}
                </div>

                <div className="p-2 rounded bg-white/5 border border-white/5 text-[10px] text-muted-foreground leading-snug break-all overflow-hidden">
                    {isDelay ? (
                        <span>Wait for <strong className="text-white">{data.seconds || 5}s</strong></span>
                    ) : isWaitForInput ? (
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] uppercase font-bold text-blue-400">Save to:</span>
                            <span className="font-mono font-bold text-primary truncate">{`{{${data.variable || 'last_response'}}}`}</span>
                            <span className="text-[9px] text-muted-foreground capitalize">Format: {data.validation || 'any'}</span>
                        </div>
                    ) : isSetVariable ? (
                        <div className="flex flex-col gap-0.5">
                            <span className="font-mono text-primary font-bold">{data.variable || 'custom_var'}</span>
                            <span className="text-white text-[9px] truncate">= &quot;{data.value || 'true'}&quot;</span>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-0.5">
                            <span className="font-mono text-primary text-[9px] font-bold">IF {data.variable || 'last_response'}</span>
                            <span className="text-white font-semibold">{data.operation || 'contains'} &quot;{data.value || ''}&quot;</span>
                        </div>
                    )}
                </div>

                {isCondition && (
                    <div className="flex items-center justify-between pt-1 text-[9px] font-bold text-muted-foreground">
                        <span className="text-emerald-400 flex items-center gap-1">● TRUE (Top)</span>
                        <span className="text-rose-400 flex items-center gap-1">● FALSE (Btm)</span>
                    </div>
                )}
            </NodeWrapper>

            {/* Condition multi-handles: True (top) vs False (bottom) */}
            {isCondition ? (
                <>
                    <Handle
                        type="source"
                        position={Position.Right}
                        id="true"
                        style={{ top: '35%' }}
                        className="w-3 h-3 border-2 border-[#1e1e2e] !bg-emerald-500 hover:scale-125 transition-transform"
                        title="Matched (True Branch)"
                    />
                    <Handle
                        type="source"
                        position={Position.Right}
                        id="false"
                        style={{ top: '65%' }}
                        className="w-3 h-3 border-2 border-[#1e1e2e] !bg-rose-500 hover:scale-125 transition-transform"
                        title="Unmatched (False Branch)"
                    />
                </>
            ) : (
                <Handle
                    type="source"
                    position={Position.Right}
                    className="w-3 h-3 border-2 border-[#1e1e2e] bg-blue-500"
                />
            )}
        </>
    );
});
LogicNode.displayName = 'LogicNode';

export const ActionNode = memo(({ id, data, selected }) => {
    const isHttp = data.subType === 'httpRequest' || data.subType === 'http';
    const isProduct = data.subType === 'productShowcase';
    const isPayment = data.subType === 'paymentRequest';
    const isAi = data.subType === 'aiAgent';
    const isHandoff = data.subType === 'deskflowHandoff' || data.subType === 'deskflow';
    const isTag = data.subType === 'crmTag' || data.subType === 'tag';

    const isConfigured = !!(data.url || data.sku || data.gateway || data.category || data.department || data.tag || data.configured);

    return (
        <>
            <Handle type="target" position={Position.Left} className="w-3 h-3 border-2 border-[#1e1e2e] bg-purple-500" />
            <NodeWrapper
                selected={selected}
                title={isHttp ? 'HTTP API' : isProduct ? 'Product Card' : isPayment ? 'Payment Link' : isAi ? 'AI Agent' : isHandoff ? 'Handoff' : isTag ? 'Tag' : 'Action'}
                icon={isHttp ? Globe : isProduct ? Package : isPayment ? CreditCard : isAi ? Sparkles : isHandoff ? UserCheck : isTag ? Tag : Zap}
                configured={isConfigured}
                data={data}
                id={id}
            >
                <div className="text-sm font-semibold text-white truncate">{data.label || 'Action'}</div>
                <div className="p-2 rounded bg-white/5 border border-white/5 text-[10px] text-muted-foreground line-clamp-2 leading-snug break-all overflow-hidden">
                    {isHttp ? (
                        <span>{data.method || 'GET'} <span className="font-mono text-primary">{data.url || 'https://...'}</span></span>
                    ) : isAi ? (
                        <span>Category: <strong className="text-purple-400">{data.category || 'GENERAL'}</strong></span>
                    ) : isHandoff ? (
                        <span>Transfer to: <strong className="text-amber-400">{data.department || 'Support'}</strong></span>
                    ) : isTag ? (
                        <span>{data.action === 'remove' ? 'Remove' : 'Add'}: <strong className="text-emerald-400">#{data.tag || 'Lead'}</strong></span>
                    ) : isProduct ? (
                        <span>Mode: {data.selectionMode || 'Last Viewed'}</span>
                    ) : isPayment ? (
                        <span>Gateway: {data.gateway || 'Razorpay'}</span>
                    ) : (
                        'Configured'
                    )}
                </div>
            </NodeWrapper>
            <Handle type="source" position={Position.Right} className="w-3 h-3 border-2 border-[#1e1e2e] bg-purple-500" />
        </>
    );
});
ActionNode.displayName = 'ActionNode';

export const nodeTypes = {
    triggerNode: TriggerNode,
    messageNode: MessageNode,
    logicNode: LogicNode,
    actionNode: ActionNode,
};