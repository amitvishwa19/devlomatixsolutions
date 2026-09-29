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
import { getTemplateDisplayName } from '../../../_lib/template-formatter';

const BRANCH_PALETTE = [
    { bg: 'bg-emerald-500', hex: '#10b981', text: 'text-emerald-400' },
    { bg: 'bg-blue-500', hex: '#3b82f6', text: 'text-blue-400' },
    { bg: 'bg-amber-500', hex: '#f59e0b', text: 'text-amber-400' },
    { bg: 'bg-purple-500', hex: '#a855f7', text: 'text-purple-400' },
    { bg: 'bg-cyan-500', hex: '#06b6d4', text: 'text-cyan-400' },
    { bg: 'bg-pink-500', hex: '#ec4899', text: 'text-pink-400' },
    { bg: 'bg-lime-500', hex: '#84cc16', text: 'text-lime-400' },
    { bg: 'bg-orange-500', hex: '#f97316', text: 'text-orange-400' },
];

const NodeWrapper = ({ children, selected, title, icon: Icon, configured, data, id, isMultiBranch }) => {
    const handleContextMenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        data?.onContextMenu?.(e, id);
    };

    const isHighlighted = selected || data?.isHighlighted;

    return (
        <div
            style={{ width: isMultiBranch ? '240px' : '200px', maxWidth: isMultiBranch ? '260px' : '200px', minWidth: isMultiBranch ? '220px' : '200px' }}
            className={cn(
                "relative rounded-sm border transition-all duration-300 overflow-visible border-primary/20 bg-card dark:bg-[#1e1e2e]/90",
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
    const subType = data.subType || data.type || 'keyword';
    const isWelcome = subType === 'welcome';
    const isAnyResponse = subType === 'any_response' || subType === 'response' || subType === 'responseTrigger';
    const keywordList = Array.isArray(data.keywordList) && data.keywordList.length > 0
        ? data.keywordList
        : String(data.keywords || data.keyword || '')
            .split(',')
            .map(k => k.trim())
            .filter(Boolean);

    const isMultiKeyword = !isWelcome && !isAnyResponse && keywordList.length > 1;
    const nodeTitle = isWelcome ? 'Welcome' : isAnyResponse ? 'Response Trigger' : 'Keyword Trigger';
    const NodeIcon = isWelcome ? Play : isAnyResponse ? MessageSquareText : Zap;

    return (
        <>
            <Handle 
                type="target" 
                position={Position.Left} 
                className="w-3 h-3 border-2 border-[#1e1e2e] bg-amber-500 shadow-md hover:scale-125 transition-transform z-20 cursor-crosshair" 
            />
            <NodeWrapper
                selected={selected}
                title={nodeTitle}
                icon={NodeIcon}
                configured={true}
                data={data}
                id={id}
                isMultiBranch={isMultiKeyword}
            >
                <div className="text-sm font-semibold text-white truncate">{data.label || nodeTitle}</div>
                {isWelcome ? (
                    <div className="text-[10px] text-muted-foreground italic truncate">
                        Triggered on first contact
                    </div>
                ) : isAnyResponse ? (
                    <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-300 flex items-center justify-between min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                            <span className="w-2 h-2 rounded-full shrink-0 bg-amber-400 animate-pulse" />
                            <span className="font-semibold truncate">Any User Reply / Tap</span>
                        </div>
                        <span className="text-[9px] text-amber-400/80 font-mono shrink-0 pl-1">
                            {`{{${data.variable || 'last_response'}}}`}
                        </span>
                    </div>
                ) : keywordList.length === 0 ? (
                    <div className="p-2 rounded bg-white/5 border border-dashed border-white/10 text-[10px] text-muted-foreground italic text-center">
                        No keywords configured
                    </div>
                ) : keywordList.length === 1 ? (
                    <div className="relative flex items-center justify-between p-1.5 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0 pr-3">
                            <span className="w-2 h-2 rounded-full shrink-0 bg-amber-500" />
                            <span className="font-mono font-bold text-amber-300 truncate">
                                {keywordList[0]}
                            </span>
                        </div>
                        <span className="text-[9px] text-amber-400/70 font-semibold uppercase shrink-0">Output</span>
                        <Handle
                            type="source"
                            position={Position.Right}
                            id="kw_0"
                            style={{
                                right: -7,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                backgroundColor: '#f59e0b'
                            }}
                            className="w-3 h-3 border-2 border-[#1e1e2e]"
                        />
                    </div>
                ) : (
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[9px] uppercase font-bold text-amber-400 px-0.5">
                            <span>Keyword Outputs</span>
                            <span>{keywordList.length} paths</span>
                        </div>
                        {keywordList.map((kw, idx) => {
                            const palette = BRANCH_PALETTE[idx % BRANCH_PALETTE.length];
                            const handleId = `kw_${idx}`;
                            return (
                                <div
                                    key={handleId}
                                    className="relative flex items-center justify-between p-1.5 rounded bg-white/5 border border-white/5 text-[10px] min-w-0"
                                >
                                    <div className="flex items-center gap-1.5 min-w-0 pr-3">
                                        <span className={cn("w-2 h-2 rounded-full shrink-0", palette.bg)} />
                                        <span className="font-mono font-bold text-white truncate max-w-[120px]">
                                            {kw}
                                        </span>
                                    </div>
                                    <span className="text-[9px] text-muted-foreground font-semibold shrink-0 pr-1">
                                        Path {idx + 1}
                                    </span>
                                    <Handle
                                        type="source"
                                        position={Position.Right}
                                        id={handleId}
                                        style={{
                                            right: -7,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            backgroundColor: palette.hex
                                        }}
                                        className="w-3.5 h-3.5 border-2 border-[#1e1e2e] shadow-md hover:scale-125 transition-transform z-20 cursor-crosshair"
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}
            </NodeWrapper>
            {(isWelcome || isAnyResponse || keywordList.length === 0) && (
                <Handle type="source" position={Position.Right} className="w-3 h-3 border-2 border-[#1e1e2e] bg-amber-500" />
            )}
        </>
    );
});
TriggerNode.displayName = 'TriggerNode';

export const MessageNode = memo(({ id, data, selected }) => {
    const isImage = data.subType === 'imageMessage';
    const isTemplate = data.subType === 'templateMessage';

    const displayLabel = isTemplate
        ? getTemplateDisplayName(data.label || data.templateName || (data.templateData?.name) || 'Official Template')
        : (data.label || 'Send Message');

    const detailText = data.text || data.imageUrl || (data.templateName ? getTemplateDisplayName(data.templateName) : 'Click to configure...');

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
                <div className={cn("text-sm font-semibold text-white leading-snug", isTemplate ? "break-words whitespace-normal" : "truncate")}>
                    {displayLabel}
                </div>
                <div className="p-2 rounded bg-white/5 border border-white/5 text-[10px] text-muted-foreground line-clamp-2 break-all overflow-hidden leading-snug">
                    {detailText}
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

    const hasConditionsArray = Array.isArray(data.conditions) && data.conditions.length > 0;
    const conditions = hasConditionsArray
        ? data.conditions
        : isCondition
        ? [
            {
                id: 'true',
                label: 'Condition 1',
                variable: data.variable || 'last_response',
                operation: data.operation || 'contains',
                value: data.value || ''
            }
        ]
        : [];

    const isConfigured = isDelay
        ? !!data.seconds
        : isWaitForInput
        ? !!(data.variable)
        : isSetVariable
        ? !!(data.variable && data.value)
        : hasConditionsArray
        ? data.conditions.every(c => c.variable && (c.value !== undefined || c.operation === 'exists'))
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
                isMultiBranch={isCondition && conditions.length > 1}
            >
                <div className="text-sm font-semibold text-white truncate">
                    {data.label || (isDelay ? 'Delay' : isWaitForInput ? 'Wait for Input' : isSetVariable ? 'Set Variable' : 'Condition Branch')}
                </div>

                <div className="space-y-1.5">
                    {isDelay ? (
                        <div className="p-2 rounded bg-white/5 border border-white/5 text-[10px] text-muted-foreground leading-snug break-all overflow-hidden">
                            <span>Wait for <strong className="text-white">{data.seconds || 5}s</strong></span>
                        </div>
                    ) : isWaitForInput ? (
                        <div className="p-2 rounded bg-white/5 border border-white/5 text-[10px] text-muted-foreground leading-snug break-all overflow-hidden flex flex-col gap-0.5">
                            <span className="text-[9px] uppercase font-bold text-blue-400">Save to:</span>
                            <span className="font-mono font-bold text-primary truncate">{`{{${data.variable || 'last_response'}}}`}</span>
                            <span className="text-[9px] text-muted-foreground capitalize">Format: {data.validation || 'any'}</span>
                        </div>
                    ) : isSetVariable ? (
                        <div className="p-2 rounded bg-white/5 border border-white/5 text-[10px] text-muted-foreground leading-snug break-all overflow-hidden flex flex-col gap-0.5">
                            <span className="font-mono text-primary font-bold">{data.variable || 'custom_var'}</span>
                            <span className="text-white text-[9px] truncate">= &quot;{data.value || 'true'}&quot;</span>
                        </div>
                    ) : (
                        <div className="space-y-1.5">
                            {conditions.map((cond, idx) => {
                                const palette = BRANCH_PALETTE[idx % BRANCH_PALETTE.length];
                                const condId = cond.id || `cond_${idx}`;
                                return (
                                    <div
                                        key={condId}
                                        className="relative flex items-center justify-between p-1.5 rounded bg-white/5 border border-white/5 text-[10px] min-w-0"
                                    >
                                        <div className="flex items-center gap-1.5 min-w-0 pr-3">
                                            <span className={cn("w-2 h-2 rounded-full shrink-0", palette.bg)} />
                                            <span className="font-semibold text-white truncate max-w-[95px]">
                                                {cond.label || `Case ${idx + 1}`}
                                            </span>
                                        </div>
                                        <span className="text-[9px] text-muted-foreground font-mono truncate max-w-[75px]">
                                            {cond.operation === 'exists' ? 'exists' : cond.value ? `"${cond.value}"` : cond.operation}
                                        </span>
                                        <Handle
                                            type="source"
                                            position={Position.Right}
                                            id={condId}
                                            style={{
                                                right: -7,
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                backgroundColor: palette.hex
                                            }}
                                            className="w-3 h-3 border-2 border-[#1e1e2e] hover:scale-125 transition-transform"
                                            title={`Branch ${idx + 1}: ${cond.label || `Condition ${idx + 1}`}`}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </NodeWrapper>
            {!isCondition && (
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