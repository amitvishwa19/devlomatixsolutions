'use client';

import React, { memo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Forward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TemplateMessage from './TemplateMessage';
import MediaBubble from './MediaBubble';

export const MessageBubble = memo(function MessageBubble({
    msg,
    workspaceId,
    templates = [],
    onTemplateClick,
    onForwardClick,
    MessageStatus
}) {
    let msgMeta = msg.metadata || {};
    if (typeof msgMeta === 'string') {
        try { msgMeta = JSON.parse(msgMeta); } catch (_) { msgMeta = {}; }
    }

    const isTemplate = msgMeta.type === 'template' ||
        msgMeta.type === 'TEMPLATE' ||
        Boolean(msgMeta.templateName) ||
        Boolean(msgMeta.originalPayload?.template?.name) ||
        (typeof msg.text === 'string' && msg.text.startsWith('[Template:'));

    const isFlowResponse = Boolean(msgMeta.flow_data) ||
        Boolean(msgMeta.flow_name) ||
        Boolean(msgMeta.raw?.flow_data) ||
        msgMeta.interactiveType === 'nfm_reply' ||
        msgMeta.interactive?.type === 'nfm_reply' ||
        msgMeta.raw?.interactive?.type === 'nfm_reply' ||
        (typeof msg.text === 'string' && (msg.text.startsWith('[Flow:') || msg.text.startsWith('Flow Response:') || /screen[_\s-]*\d+/i.test(msg.text)));

    const type = (msgMeta.type || msg.type || msg.mediaType || msgMeta.interactiveType || '').toLowerCase();

    const isInteractiveOrProduct = isFlowResponse || type === 'interactive' || type === 'nfm_reply' || type === 'order' || type === 'product' || type === 'catalog_message' ||
        (typeof msg.text === 'string' && (msg.text.startsWith('[Product:') || msg.text.startsWith('[Catalog]') || msg.text.startsWith('🛒 Order') || msg.text.startsWith('[Flow:') || msg.text.startsWith('Flow Response:')));

    const isMedia = !isTemplate && (isInteractiveOrProduct || ['image', 'video', 'audio', 'document', 'sticker', 'voice', 'location', 'contacts', 'poll', 'poll_creation', 'interactive', 'nfm_reply', 'order', 'unsupported'].includes(type));

    const templateName = msgMeta.templateName ||
        msgMeta.originalPayload?.template?.name ||
        (typeof msg.text === 'string' && msg.text.startsWith('[Template:')
            ? msg.text.split('[Template:')[1]?.split(']')[0]?.trim()
            : null);

    const templateDef = (isTemplate && templateName)
        ? (templates.find(t => t.templateName?.toLowerCase() === templateName.toLowerCase() || t.name?.toLowerCase() === templateName.toLowerCase())
            || msgMeta.templateDefinition
            || null)
        : null;

    return (
        <div className={`flex w-full mb-4 ${msg.fromMe ? 'justify-end' : 'justify-start'}`}>
            <div className={`relative group max-w-[85%] ${msg.fromMe ? 'mr-2' : 'ml-2'}`}>
                {isTemplate ? (
                    <div
                        onClick={() => onTemplateClick?.(msg)}
                        className="cursor-pointer transition-transform active:scale-[0.98]"
                    >
                        <TemplateMessage
                            msg={msg}
                            templateDefinition={templateDef}
                        />
                    </div>
                ) : isMedia ? (
                    <div className={`relative ${isFlowResponse ? 'w-full' : 'px-1 py-1 rounded-2xl shadow-sm text-sm transition-all duration-200 ' + (msg.fromMe ? 'bg-primary/5 border border-primary/20 rounded-tr-none' : 'bg-card border border-border/50 rounded-tl-none')}`}>
                        <MediaBubble msg={msg} workspaceId={workspaceId} />
                    </div>
                ) : (
                    <div
                        className={`relative px-4 py-2.5 rounded-2xl shadow-sm text-sm transition-all duration-200 ${msg.fromMe
                            ? 'bg-primary text-primary-foreground rounded-tr-none'
                            : 'bg-card border border-border/50 rounded-tl-none'
                            }`}
                    >
                        <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>

                        {/* Source Tail (Bubble Hook) for regular text */}
                        {msg.fromMe ? (
                            <div className="absolute -right-[6px] top-0 w-0 h-0 border-t-8 border-t-primary border-r-8 border-r-transparent" />
                        ) : (
                            <div className="absolute -left-[6px] top-0 w-0 h-0 border-t-8 border-t-card border-l-8 border-l-transparent" />
                        )}
                    </div>
                )}

                {/* Hover Action: Forward */}
                <div
                    className={`absolute top-1 ${msg.fromMe ? '-left-8' : '-right-8'} opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center gap-1`}
                >
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-full bg-card/90 border border-border/60 shadow-xs hover:bg-muted text-muted-foreground hover:text-primary transition-all"
                        onClick={(e) => {
                            e.stopPropagation();
                            onForwardClick?.(msg);
                        }}
                        title="Forward message"
                    >
                        <Forward className="w-3 h-3" />
                    </Button>
                </div>

                {/* Common Meta Info (Time & Status) */}
                {!isTemplate && (
                    <div className={`flex items-center justify-end gap-1 mt-1 text-[9px] px-1 ${msg.fromMe ? 'text-primary/60' : 'text-muted-foreground/60'}`}>
                        {formatDistanceToNow(new Date(msg.timestamp * 1000))} ago
                        {msg.fromMe && MessageStatus && <MessageStatus status={msg.status} />}
                    </div>
                )}
            </div>
        </div>
    );
});

export default MessageBubble;
