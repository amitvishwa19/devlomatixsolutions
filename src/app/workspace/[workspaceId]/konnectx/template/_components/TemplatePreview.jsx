'use client';

import React from 'react';
import {
    MessageSquare,
    Image as ImageIcon,
    Video,
    File,
    Music,
    Check,
    Smartphone,
    ExternalLink,
    Clock,
    Wifi,
    Battery,
    ChevronLeft,
    MoreVertical,
    Phone,
    Plus,
    Video as VideoIcon,
    Workflow
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function TemplatePreview({ template, showHeader = true, isModal = false, isOpen = false, onClose }) {
    if (!template) return null;

    const normalizedType = (template.type || '').toLowerCase();

    const getMetadata = () => {
        if (typeof template.metadata === 'string') {
            try { return JSON.parse(template.metadata); } catch (e) { return {}; }
        }
        return template.metadata || {};
    };

    const getButtons = () => {
        if (typeof template.buttons === 'string') {
            try { return JSON.parse(template.buttons); } catch (e) { return []; }
        }
        return Array.isArray(template.buttons) ? template.buttons : [];
    };

    const metadata = getMetadata();
    const buttons = getButtons();

    const MessageBubble = () => (
        <motion.div
            initial={isModal ? { opacity: 0, scale: 1, y: 10 } : false}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
            className="relative z-10 self-start max-w-[85%]"
        >
            <div className="relative bg-white dark:bg-[#202c33] rounded-xl rounded-tl-none shadow-[0_1px_2px_rgba(0,0,0,0.15)] border border-black/5 dark:border-white/10 overflow-hidden">
                {/* Tail */}
                <div className="absolute -left-2 top-0 text-white dark:text-[#202c33]">
                    <svg viewBox="0 0 8 13" width="8" height="13">
                        <path fill="currentColor" d="M1.533 3.568L8 12.193V1H2.812C1.042 1 .474 2.156 1.533 3.568z"></path>
                    </svg>
                </div>

                {normalizedType === 'carousel' ? (
                    <div className="p-2.5 pb-1.5">
                        {metadata.headerText && (
                            <div className="text-[13.5px] font-bold text-zinc-900 dark:text-[#e9edef] mb-2 leading-tight">
                                {metadata.headerText}
                            </div>
                        )}
                        {template.body && (
                            <div className="text-sm leading-[1.4] text-zinc-800 dark:text-[#e9edef] wrap-break-word whitespace-pre-wrap mb-2">
                                {template.body}
                            </div>
                        )}
                        {/* Carousel Cards */}
                        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory hide-scrollbar">
                            {(metadata.cards || []).map((card, idx) => (
                                <div key={idx} className="min-w-[200px] rounded-xl overflow-hidden border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#111b21] shrink-0 snap-center">
                                    {card.mediaUrl ? (
                                        <div className="aspect-[4/3] overflow-hidden">
                                            <img src={card.mediaUrl} className="w-[180px] h-[200px] object-cover" alt="" />
                                        </div>
                                    ) : (
                                        <div className="aspect-[4/3] bg-zinc-50 dark:bg-white/5 flex items-center justify-center">
                                            <ImageIcon className="w-8 h-8 text-zinc-300 dark:text-zinc-600" />
                                        </div>
                                    )}
                                    <div className="p-2.5">
                                        <div className="text-[12px] leading-[1.3] text-zinc-800 dark:text-[#e9edef] whitespace-pre-wrap">
                                            {card.body || <span className="text-zinc-400 dark:text-zinc-500 italic">No content</span>}
                                        </div>
                                        {(card.buttons || []).filter(Boolean).length > 0 && (
                                            <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-white/10">
                                                {card.buttons.filter(Boolean).map((b, bi) => (
                                                    <div key={bi} className="text-[11px] font-semibold text-[#00a884] dark:text-[#53bdeb] text-center py-1">
                                                        {typeof b === 'object' ? (b.text || 'Button') : b}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {template.footer && (
                            <div className="text-[11px] text-zinc-500 dark:text-[#8696a0] mt-1 leading-tight italic">
                                {template.footer}
                            </div>
                        )}
                        <div className="flex justify-end items-center gap-1 mt-1">
                            <span className="text-[9px] text-zinc-400 dark:text-[#8696a0] font-medium">
                                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </span>
                            <Check className="w-3 h-3 text-[#53bdeb]" />
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Media/Location */}
                        {['image', 'video', 'document', 'audio', 'location'].includes(normalizedType) && (
                            <div className="p-1">
                                <div className="rounded-xl overflow-hidden bg-zinc-100 dark:bg-black/40 border border-black/5 dark:border-white/10">
                                    {normalizedType === 'location' && (
                                        <div className="aspect-video bg-zinc-50 dark:bg-white/5 flex flex-col items-center justify-center p-4 text-center">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                                                <Smartphone className="w-5 h-5 text-primary" />
                                            </div>
                                            <div className="text-[12px] font-bold text-zinc-800 dark:text-[#e9edef] line-clamp-1">{metadata.locationName || 'Location Name'}</div>
                                            <div className="text-[10px] text-zinc-500 dark:text-[#8696a0] line-clamp-2 mt-0.5">{metadata.address || 'Address not provided'}</div>
                                            <div className="text-[8px] text-zinc-400 dark:text-zinc-500 mt-2 uppercase font-mono tracking-tighter">
                                                {metadata.latitude || '0.0'}, {metadata.longitude || '0.0'}
                                            </div>
                                        </div>
                                    )}
                                    {normalizedType === 'image' && (
                                        <div className="w-full bg-zinc-50 dark:bg-white/5 overflow-hidden">
                                            {metadata.mediaUrl ? (
                                                <img src={metadata.mediaUrl} className="w-full h-[180px] object-cover" alt="preview" />
                                            ) : (
                                                <div className="h-[180px] flex items-center justify-center">
                                                    <ImageIcon className="w-10 h-10 text-zinc-300 dark:text-zinc-600" />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {normalizedType === 'video' && (
                                        <div className="aspect-video bg-zinc-900 flex items-center justify-center relative">
                                            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                                                <Video className="w-5 h-5 text-white" />
                                            </div>
                                        </div>
                                    )}
                                    {normalizedType === 'document' && (
                                        <div className="p-3 bg-[#f0f2f5] dark:bg-white/5 flex items-center gap-3">
                                            <div className="p-2 bg-blue-500 rounded-lg shadow-sm">
                                                <File className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[12px] font-bold text-zinc-800 dark:text-[#e9edef] truncate">Project_File.pdf</span>
                                                <span className="text-[9px] text-zinc-500 dark:text-[#8696a0] font-medium">128 KB • PDF</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Content */}
                        <div className="p-2.5 pb-1.5 px-3">
                            {metadata.headerText && (
                                <div className="text-[13.5px] font-bold text-zinc-900 dark:text-[#e9edef] mb-1 leading-tight">
                                    {metadata.headerText}
                                </div>
                            )}
                            <div className="text-[13.5px] leading-[1.4] text-zinc-800 dark:text-[#e9edef] break-words whitespace-pre-wrap">
                                {template.body || <span className="text-zinc-400 dark:text-zinc-500 italic">No message content</span>}
                            </div>
                            {template.footer && (
                                <div className="text-[11px] text-zinc-500 dark:text-[#8696a0] mt-1.5 leading-tight italic">
                                    {template.footer}
                                </div>
                            )}
                            <div className="flex justify-end items-center gap-1 mt-1">
                                <span className="text-[9px] text-zinc-400 dark:text-[#8696a0] font-medium">
                                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                </span>
                                <Check className="w-3 h-3 text-[#53bdeb]" />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {buttons.length > 0 && buttons[0] !== '' && (
                            <div className="border-t border-zinc-100 dark:border-white/10 flex flex-col divide-y divide-zinc-100 dark:divide-white/10">
                                {buttons.filter(Boolean).map((btn, idx) => {
                                    const b = typeof btn === 'object' ? btn : { type: 'QUICK_REPLY', text: btn };
                                    const btnText = b.text || "Button";
                                    return (
                                        <div key={idx} className="p-2.5 flex items-center justify-center gap-2 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors cursor-pointer active:scale-95 duration-75">
                                            {b.type === 'URL' && <ExternalLink size={12} className="text-[#00a884] dark:text-[#53bdeb]" />}
                                            {b.type === 'PHONE_NUMBER' && <Phone size={12} className="text-[#00a884] dark:text-[#53bdeb]" />}
                                            {b.type === 'FLOW' && <Workflow size={12} className="text-[#00a884] dark:text-[#53bdeb]" />}
                                            {(!b.type || b.type === 'QUICK_REPLY') && <MessageSquare size={12} className="text-[#00a884] dark:text-[#53bdeb]" />}
                                            <span className="text-[13px] font-semibold text-[#00a884] dark:text-[#53bdeb]">{btnText}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>
        </motion.div>
    );

    if (!isModal) {
        return (
            <div className="relative w-full rounded-2xl bg-[#efeae2] dark:bg-[#0b141a] border border-black/5 dark:border-white/10 overflow-hidden p-4 min-h-37.5">
                <div className="absolute inset-0 z-0 opacity-[0.06] dark:opacity-[0.03] pointer-events-none grayscale brightness-50 dark:brightness-100"
                    style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: '400px' }} />
                <MessageBubble />
            </div>
        );
    }

    const Content = (
        <div className="relative w-full max-w-[320px] mx-auto group">
            <div className="relative h-[70vh] w-[36vh] bg-card rounded-2xl p-3 border-[6px] border-border/80 dark:border-border/40 overflow-hidden ring-1 ring-black/10 dark:ring-white/10 shadow-2xl">
                <div className="absolute top-0 left-0 right-0 h-10 flex items-center justify-between px-8 z-40 text-black/80 dark:text-white/80">
                    <span className="text-[11px] font-bold">9:41</span>
                    <div className="flex gap-1.5 items-center">
                        <Wifi size={10} />
                        <Battery size={10} className="rotate-0" />
                    </div>
                </div>

                <div className="relative h-full w-full bg-[#efeae2] dark:bg-[#0b141a] rounded-2xl overflow-hidden flex flex-col">
                    <div className="bg-[#f0f2f5]/90 dark:bg-[#202c33]/95 backdrop-blur-md border-b border-black/5 dark:border-white/10 p-3 pt-9 flex items-center gap-2 z-30 rounded-t-2xl">
                        <ChevronLeft className="w-5 h-5 text-[#00a884] dark:text-[#53bdeb]" />
                        <div className="w-8 h-8 rounded-full bg-zinc-300 dark:bg-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300 shadow-sm border border-white/20">
                            <Smartphone className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-[13px] font-bold text-zinc-800 dark:text-[#e9edef] leading-tight truncate">WhatsApp Preview</span>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium leading-tight">online</span>
                        </div>
                        <div className="flex items-center gap-3 text-[#00a884] dark:text-[#53bdeb] px-1">
                            <VideoIcon size={16} />
                            <Phone size={14} />
                            <MoreVertical size={16} />
                        </div>
                    </div>

                    <div className="flex-1 relative overflow-y-auto custom-scrollbar p-3 pt-4 flex flex-col gap-2">
                        <div className="absolute inset-0 z-0 opacity-[0.06] dark:opacity-[0.03] pointer-events-none grayscale brightness-50 dark:brightness-100"
                            style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: '400px' }} />
                        <MessageBubble />
                    </div>

                    <div className="p-2.5 bg-[#f0f2f5] dark:bg-[#202c33] border-t border-black/5 dark:border-white/10 flex items-center gap-2 pb-6">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-zinc-400 dark:text-zinc-500">
                            <Plus size={20} />
                        </div>
                        <div className="flex-1 bg-white dark:bg-[#2a3942] rounded-full h-8 px-4 flex items-center text-zinc-400 dark:text-zinc-500 text-[12px]">
                            Type a message
                        </div>
                    </div>
                </div>
            </div>
            <div className="absolute -inset-1 bg-linear-to-tr from-primary/20 to-transparent blur-2xl opacity-50 -z-10 group-hover:opacity-70 transition-opacity" />
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[400px] p-0 overflow-hidden bg-transparent border-none shadow-none focus-visible:outline-none [&>button]:hidden">
                <DialogHeader className="sr-only">
                    <DialogTitle>Template Preview</DialogTitle>
                </DialogHeader>
                <div className="flex items-center justify-center p-8 animate-in zoom-in-95 duration-300">
                    {Content}
                </div>
            </DialogContent>
        </Dialog>
    );
}
