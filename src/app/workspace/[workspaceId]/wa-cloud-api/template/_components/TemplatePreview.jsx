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
    Video as VideoIcon
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
            initial={isModal ? { opacity: 0, scale: 0.95, y: 10 } : false}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
            className="relative z-10 self-start max-w-[90%]"
        >
            <div className="relative bg-white rounded-xl rounded-tl-none shadow-[0_1px_2px_rgba(0,0,0,0.1)] overflow-hidden">
                {/* Tail */}
                <div className="absolute -left-2 top-0 text-white">
                    <svg viewBox="0 0 8 13" width="8" height="13">
                        <path fill="currentColor" d="M1.533 3.568L8 12.193V1H2.812C1.042 1 .474 2.156 1.533 3.568z"></path>
                    </svg>
                </div>

                {/* Media */}
                {['image', 'video', 'document', 'audio'].includes(template.type) && (
                    <div className="p-1">
                        <div className="rounded-xl overflow-hidden bg-zinc-100 border border-black/5">
                            {template.type === 'image' && (
                                <div className="aspect-square flex items-center justify-center bg-zinc-50">
                                    {metadata.mediaUrl ? (
                                        <img src={metadata.mediaUrl} className="w-full h-full object-cover" alt="preview" />
                                    ) : (
                                        <ImageIcon className="w-10 h-10 text-zinc-300" />
                                    )}
                                </div>
                            )}
                            {template.type === 'video' && (
                                <div className="aspect-video bg-zinc-900 flex items-center justify-center relative">
                                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                                        <Video className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                            )}
                            {template.type === 'document' && (
                                <div className="p-3 bg-[#f0f2f5] flex items-center gap-3">
                                    <div className="p-2 bg-blue-500 rounded-lg shadow-sm">
                                        <File className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[12px] font-bold text-zinc-800 truncate">Project_File.pdf</span>
                                        <span className="text-[9px] text-zinc-500 font-medium">128 KB • PDF</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="p-2.5 pb-1.5 px-3">
                    {metadata.headerText && (
                        <div className="text-[13.5px] font-bold text-zinc-900 mb-1 leading-tight">
                            {metadata.headerText}
                        </div>
                    )}
                    <div className="text-[13.5px] leading-[1.4] text-zinc-800 break-words whitespace-pre-wrap">
                        {template.body || <span className="text-zinc-400 italic">No message content</span>}
                    </div>
                    {template.footer && (
                        <div className="text-[11px] text-zinc-400 mt-1.5 leading-tight italic">
                            {template.footer}
                        </div>
                    )}
                    <div className="flex justify-end items-center gap-1 mt-1">
                        <span className="text-[9px] text-zinc-400 font-medium">
                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </span>
                        <Check className="w-3 h-3 text-[#53bdeb]" />
                    </div>
                </div>

                {/* Action Buttons */}
                {buttons.length > 0 && buttons[0] !== '' && (
                    <div className="border-t border-zinc-100 flex flex-col divide-y divide-zinc-100">
                        {buttons.filter(Boolean).map((btn, idx) => {
                            const btnText = typeof btn === 'object' ? (btn.text || "Button") : btn;
                            const isUrl = typeof btn === 'object' && btn.type === 'URL';
                            return (
                                <div key={idx} className="p-2.5 flex items-center justify-center gap-2 hover:bg-zinc-50 transition-colors cursor-pointer active:scale-95 duration-75">
                                    {isUrl ? <ExternalLink size={12} className="text-[#007aff]" /> : <MessageSquare size={12} className="text-[#007aff]" />}
                                    <span className="text-[13px] font-semibold text-[#007aff]">{btnText}</span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </motion.div>
    );

    if (!isModal) {
        return (
            <div className="relative w-full rounded-2xl bg-[#efeae2] border border-black/5 overflow-hidden p-4 min-h-[150px]">
                <div className="absolute inset-0 z-0 opacity-[0.06] pointer-events-none grayscale brightness-50"
                    style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: '400px' }} />
                <MessageBubble />
            </div>
        );
    }

    const Content = (
        <div className="relative w-full max-w-[320px] mx-auto group">
            <div className="relative h-[70vh] w-[36vh] bg-card rounded-2xl p-3 border-[6px]  overflow-hidden ring-1 ring-white/10">
                {/* <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-50 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[#1a1a1a] ml-auto mr-4" />
                </div> */}

                <div className="absolute top-0 left-0 right-0 h-10 flex items-center justify-between px-8 z-40 text-black/80">
                    <span className="text-[11px] font-bold">9:41</span>
                    <div className="flex gap-1.5 items-center">
                        <Wifi size={10} />
                        <Battery size={10} className="rotate-0" />
                    </div>
                </div>

                <div className="relative h-full w-full bg-[#efeae2] rounded-2xl overflow-hidden flex flex-col">
                    <div className="bg-[#f0f2f5]/90 backdrop-blur-md border-b border-black/5 p-3 pt-9 flex items-center gap-2 z-30 rounded-t-2xl">
                        <ChevronLeft className="w-5 h-5 text-[#007aff]" />
                        <div className="w-8 h-8 rounded-full bg-zinc-300 flex items-center justify-center text-zinc-500 shadow-sm border border-white">
                            <Smartphone className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-[13px] font-bold text-zinc-800 leading-tight truncate">WhatsApp Preview</span>
                            <span className="text-[10px] text-green-600 font-medium leading-tight">online</span>
                        </div>
                        <div className="flex items-center gap-3 text-[#007aff] px-1">
                            <VideoIcon size={16} />
                            <Phone size={14} />
                            <MoreVertical size={16} />
                        </div>
                    </div>

                    <div className="flex-1 relative overflow-y-auto custom-scrollbar p-3 pt-4 flex flex-col gap-2">
                        <div className="absolute inset-0 z-0 opacity-[0.06] pointer-events-none grayscale brightness-50"
                            style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: '400px' }} />
                        <MessageBubble />
                    </div>

                    <div className="p-2.5 bg-[#f0f2f5] flex items-center gap-2 pb-6">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-zinc-400">
                            <Plus size={20} />
                        </div>
                        <div className="flex-1 bg-white rounded-full h-8 px-4 flex items-center text-zinc-300 text-[12px]">
                            Type a message
                        </div>
                    </div>
                </div>
            </div>
            <div className="absolute -inset-1 bg-gradient-to-tr from-primary/20 to-transparent blur-2xl opacity-50 -z-10 group-hover:opacity-70 transition-opacity" />
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
