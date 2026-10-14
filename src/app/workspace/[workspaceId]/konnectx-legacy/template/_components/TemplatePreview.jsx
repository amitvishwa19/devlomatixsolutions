'use client';

import React from 'react';
import {
    Smartphone,
    CheckCheck,
    Phone,
    ExternalLink,
    CornerDownLeft,
    FileText,
    Image as ImageIcon,
    Video
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

/**
 * Realistic WhatsApp Chat Bubble & Phone Mockup for Template Previews
 */
export default function TemplatePreview({
    template,
    sampleValues = {},
    showDeviceFrame = true
}) {
    if (!template) return null;

    const {
        name,
        category = 'MARKETING',
        headerType = 'NONE',
        headerText = '',
        headerMedia = '',
        body = '',
        footer = '',
        buttons = []
    } = template;

    // Substitute variables with sample values if provided
    const renderWithVariables = (text) => {
        if (!text) return '';
        return text.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
            const trimmed = key.trim();
            const val = sampleValues[trimmed];
            return val !== undefined && val !== '' ? val : match;
        });
    };

    const renderedHeader = renderWithVariables(headerText);
    const renderedBody = renderWithVariables(body);

    const bubbleContent = (
        <div className="bg-[#DCF8C6] dark:bg-[#054640] text-slate-900 dark:text-slate-100 rounded-2xl rounded-tr-none p-3 shadow-md border border-emerald-500/20 max-w-sm w-full space-y-2 text-xs">
            {/* Header */}
            {headerType === 'TEXT' && renderedHeader && (
                <div className="font-bold text-[13px] text-emerald-950 dark:text-emerald-200 border-b border-emerald-900/10 dark:border-emerald-100/10 pb-1">
                    {renderedHeader}
                </div>
            )}

            {headerType === 'IMAGE' && (
                <div className="rounded-xl overflow-hidden bg-black/10 dark:bg-black/30 aspect-video flex items-center justify-center border border-border/20">
                    {headerMedia ? (
                        <img
                            src={headerMedia}
                            alt="Header Media"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-1 text-muted-foreground text-[10px]">
                            <ImageIcon size={22} className="text-emerald-500" />
                            <span>Image Header</span>
                        </div>
                    )}
                </div>
            )}

            {headerType === 'VIDEO' && (
                <div className="rounded-xl overflow-hidden bg-black/20 dark:bg-black/40 aspect-video flex items-center justify-center border border-border/20">
                    <div className="flex flex-col items-center gap-1 text-muted-foreground text-[10px]">
                        <Video size={22} className="text-emerald-500" />
                        <span>Video Header</span>
                    </div>
                </div>
            )}

            {headerType === 'DOCUMENT' && (
                <div className="p-2.5 rounded-xl bg-white/40 dark:bg-black/20 border border-border/20 flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                        <FileText size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="font-semibold text-xs truncate">{name || 'Document'}.pdf</div>
                        <div className="text-[10px] text-muted-foreground">PDF Document</div>
                    </div>
                </div>
            )}

            {/* Body */}
            <div className="leading-relaxed whitespace-pre-wrap select-text text-[12px] break-words">
                {renderedBody || <span className="text-muted-foreground italic">Your template message body will appear here...</span>}
            </div>

            {/* Footer */}
            {footer && (
                <div className="text-[10px] text-slate-500 dark:text-slate-400 border-t border-black/5 dark:border-white/5 pt-1 italic">
                    {footer}
                </div>
            )}

            {/* Timestamp & Status */}
            <div className="flex items-center justify-end gap-1 text-[9px] text-slate-500 dark:text-slate-400 pt-0.5">
                <span>12:00 PM</span>
                <CheckCheck size={13} className="text-cyan-600 dark:text-cyan-400" />
            </div>

            {/* Interactive Buttons */}
            {Array.isArray(buttons) && buttons.length > 0 && (
                <div className="pt-1.5 space-y-1 border-t border-black/5 dark:border-white/10">
                    {buttons.map((btn, idx) => {
                        const btnText = typeof btn === 'string' ? btn : btn.text || btn.title || `Button ${idx + 1}`;
                        const btnType = typeof btn === 'object' ? btn.type : 'QUICK_REPLY';

                        return (
                            <div
                                key={idx}
                                className="w-full py-1.5 px-3 bg-white/70 dark:bg-slate-800/80 rounded-xl text-center text-emerald-700 dark:text-emerald-300 font-semibold text-[11px] shadow-2xs border border-emerald-500/20 flex items-center justify-center gap-1.5"
                            >
                                {btnType === 'URL' && <ExternalLink size={11} />}
                                {btnType === 'PHONE_NUMBER' && <Phone size={11} />}
                                {btnType === 'QUICK_REPLY' && <CornerDownLeft size={11} />}
                                <span className="truncate">{btnText}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );

    if (!showDeviceFrame) {
        return bubbleContent;
    }

    return (
        <div className="w-full max-w-[340px] mx-auto rounded-[32px] border-4 border-slate-800 dark:border-slate-700 bg-slate-900 p-2 shadow-2xl">
            {/* Phone Notch / Header */}
            <div className="flex items-center justify-between px-4 py-1 text-[10px] text-slate-400 font-mono">
                <span>9:41</span>
                <div className="w-16 h-3 bg-slate-800 rounded-full" />
                <span>100%</span>
            </div>

            {/* Phone Screen Background */}
            <div className="rounded-[24px] bg-[#E5DDD5] dark:bg-[#0B141A] p-3 min-h-[460px] flex flex-col justify-end relative overflow-hidden">
                {/* Chat Top Bar */}
                <div className="absolute top-0 left-0 right-0 p-3 bg-slate-100 dark:bg-[#1F2C34] border-b border-border/30 flex items-center justify-between z-10">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center">
                            D
                        </div>
                        <div>
                            <div className="text-xs font-bold text-foreground">Devlomatix</div>
                            <div className="text-[9px] text-emerald-500 font-medium">online</div>
                        </div>
                    </div>
                    <Badge variant="outline" className="text-[8px] h-4 px-1.5 border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                        {category}
                    </Badge>
                </div>

                {/* Bubble Container */}
                <div className="pt-14 pb-2 flex justify-start">
                    {bubbleContent}
                </div>
            </div>
        </div>
    );
}
