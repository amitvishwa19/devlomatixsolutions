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
    Reply,
    ExternalLink,
    Sparkles,
    Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function TemplatePreview({ template, showHeader = true, isModal = false, isOpen = false, onClose }) {
    if (!template) return null;

    // Helper to ensure metadata is an object
    const getMetadata = () => {
        if (typeof template.metadata === 'string') {
            try { return JSON.parse(template.metadata); } catch (e) { return {}; }
        }
        return template.metadata || {};
    };

    // Helper to ensure buttons is an array
    const getButtons = () => {
        if (typeof template.buttons === 'string') {
            try { return JSON.parse(template.buttons); } catch (e) { return []; }
        }
        return Array.isArray(template.buttons) ? template.buttons : [];
    };

    const metadata = getMetadata();
    const buttons = getButtons();

    const Content = (
        <div className={`relative flex flex-col w-full max-w-[340px] mx-auto overflow-hidden rounded-lg border-4 border-primary shadow-2xl transition-all duration-500 bg-[#e5ddd5]`}>


            {/* Phone Notch/Status Bar */}
            <div className="h-6 flex items-center justify-between px-6 py-4 bg-muted/10 opacity-50 relative z-20">
                <span className="text-[10px] font-bold text-zinc-800">9:41</span>
                <div className="flex gap-1 items-center">
                    <div className="w-3.5 h-2 rounded-[2px] border border-foreground/30 flex items-center p-[1px]">
                        <div className="w-full h-full bg-foreground/50 rounded-[0.5px]" />
                    </div>
                </div>
            </div>

            {/* Preview Toolbar */}
            {showHeader && (
                <div className={`px-4 py-2 flex items-center justify-between border-b border-white/5 relative z-20 bg-[#00000020] backdrop-blur-sm`}>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-zinc-800/10 flex items-center justify-center">
                            <Smartphone className="w-4 h-4 text-zinc-800" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[12px] font-bold text-zinc-800 leading-none">WhatsApp Preview</span>
                            <span className="text-[9px] text-zinc-800/60">online</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-1 p-4 flex flex-col gap-4 relative custom-scrollbar overflow-y-auto min-h-[400px]">
                {/* Preview Content Toggle */}
                {template.type === 'carousel' ? (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        {/* Header Body Footer */}
                        <div className={`relative rounded-md rounded-tl-none p-3 shadow-md max-w-[280px] self-start bg-white text-zinc-800 transition-all`}>
                            <div className="absolute -left-[6px] top-0 w-0 h-0 border-t-8 border-t-inherit border-l-8 border-l-transparent" />
                            <div className="text-[14.5px] leading-relaxed whitespace-pre-wrap">{template.body || <span className="opacity-40 italic text-zinc-800/50">Body content...</span>}</div>
                            {template.footer && <div className={`text-[11.5px] mt-2 opacity-70 text-zinc-800/70`}>{template.footer}</div>}
                        </div>

                        {/* Horizontal Cards */}
                        <div className="flex gap-3 overflow-x-auto pb-6 px-1 custom-scrollbar snap-x snap-mandatory">
                            {(metadata.carouselCards || []).map((card, idx) => (
                                <div key={idx} className={`min-w-[240px] rounded-xl overflow-hidden shadow-lg snap-center flex flex-col border bg-white border-white/20 transition-all`}>
                                    <div className="aspect-[16/10] bg-muted/10 flex items-center justify-center relative group">
                                        {card.imageUrl ? (
                                            <img src={card.imageUrl} className="w-full h-full object-cover" alt="card" />
                                        ) : (
                                            <ImageIcon className="w-10 h-10 opacity-10" />
                                        )}
                                    </div>
                                    <div className="p-3.5 flex-1 flex flex-col gap-1.5">
                                        <h4 className={`text-[14px] font-bold truncate text-zinc-800`}>{card.title || 'Untitled Card'}</h4>
                                        <p className={`text-[12.5px] leading-snug text-zinc-800/70`}>
                                            {card.description || 'No description added yet...'}
                                        </p>
                                        <div className={`mt-3 pt-3 border-t border-white/5 text-center font-bold text-[13.5px] text-[#00a884] hover:bg-black/[0.02] rounded transition-colors cursor-pointer`}>
                                            {card.buttonText || 'View Details'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* Standard Bubble Preview */
                    <div className={`relative z-10 rounded-xl rounded-tl-none overflow-hidden shadow-[0_1px_0.5px_rgba(0,0,0,0.13)] max-w-[85%] self-start transition-all duration-300 animate-in fade-in slide-in-from-left-2 bg-white text-zinc-800`}>
                        {/* Source Peak */}
                        <div className={`absolute -left-[8px] top-0 w-3 h-3 text-white transition-all`}>
                            <svg viewBox="0 0 8 13" width="8" height="13">
                                <path fill="currentColor" d="M1.533 3.568L8 12.193V1H2.812C1.042 1 .474 2.156 1.533 3.568z"></path>
                            </svg>
                        </div>

                        {/* Media Rendering */}
                        {['image', 'video', 'document', 'audio'].includes(template.type) && (
                            <div className="flex flex-col">
                                {template.type === 'image' && (
                                    <div className="bg-muted/10 flex items-center justify-center relative overflow-hidden h-[180px]">
                                        {metadata.mediaUrl ? (
                                            <img src={metadata.mediaUrl} className="w-full h-full object-cover" alt="preview" />
                                        ) : (
                                            <ImageIcon className="w-10 h-10 opacity-10" />
                                        )}
                                    </div>
                                )}
                                {template.type === 'video' && (
                                    <div className="h-[180px] bg-black/90 flex items-center justify-center text-white relative">
                                        <div className="w-12 h-12 rounded-full border-2 border-white/50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                                            <Video className="w-6 opacity-80" />
                                        </div>
                                    </div>
                                )}
                                {template.type === 'document' && (
                                    <div className={`p-3.5 flex items-center gap-3 border-b border-black/[0.03] bg-[#f0f2f5]`}>
                                        <div className="p-2.5 bg-blue-500/10 rounded-lg">
                                            <File className="w-6 h-6 text-blue-500" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[13.5px] font-bold truncate text-zinc-800">Project_File.pdf</span>
                                            <span className="text-[10px] opacity-60 uppercase tracking-widest text-zinc-800/60">128 KB • PDF</span>
                                        </div>
                                    </div>
                                )}
                                {template.type === 'audio' && (
                                    <div className={`p-3 flex items-center gap-3 border-b border-black/[0.03] bg-[#f0f2f5]`}>
                                        <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center text-white shadow-lg">
                                            <Music className="w-5 h-5 ml-0.5" />
                                        </div>
                                        <div className="flex-1 h-1 bg-muted/20 rounded-full overflow-hidden relative">
                                            <div className="absolute inset-y-0 left-0 w-1/3 bg-[#00a884]" />
                                        </div>
                                        <span className={`text-[10px] font-mono opacity-60 text-zinc-800/60`}>0:24</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Header Text */}
                        {metadata.headerText && (
                            <div className="p-3 pb-0">
                                <div className={`text-[14.5px] font-bold leading-tight text-zinc-800`}>
                                    {metadata.headerText}
                                </div>
                            </div>
                        )}

                        {/* Text Body */}
                        <div className="p-3 pb-1.5">
                            <div className="text-[14.5px] leading-relaxed break-words whitespace-pre-wrap text-zinc-800">
                                {template.body || <span className="opacity-30 italic text-zinc-800/40">Type your message...</span>}
                            </div>

                            {template.footer && (
                                <div className={`text-[12px] mt-2 opacity-80 italic text-zinc-800/60`}>
                                    {template.footer}
                                </div>
                            )}

                            <div className="flex justify-end mt-1.5">
                                <span className="text-[10px] opacity-60 flex items-center gap-1 font-mono uppercase text-zinc-800/50">
                                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    <Check className="w-2.5 h-2.5 text-blue-400" />
                                </span>
                            </div>
                        </div>

                        {/* Buttons Section */}
                        {buttons.length > 0 && buttons[0] !== '' && (
                            <div className={`mt-1 border-t border-black/5 divide-y divide-black/5 bg-white`}>
                                {buttons.filter(b => b).map((btn, idx) => {
                                    const btnText = typeof btn === 'object' ? (btn.text || btn.url || "Button") : btn;
                                    const isUrl = typeof btn === 'object' && btn.type === 'URL';

                                    return (
                                        <div key={idx} className="py-3 px-4 text-center text-[14px] text-[#00a884] hover:bg-black/[0.02] active:bg-black/[0.05] transition-colors cursor-pointer flex items-center justify-center gap-2">
                                            {!isUrl && (
                                                <svg viewBox="0 0 24 24" width="16" height="16" className="opacity-70 rotate-180">
                                                    <path fill="currentColor" d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-12.1z"></path>
                                                </svg>
                                            )}
                                            {isUrl && <ExternalLink className="w-3.5 h-3.5 opacity-70" />}
                                            <span className="font-semibold tracking-tight leading-none">{btnText}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Interactive List Toggle */}
                        {template.type === 'interactive-group' && (
                            <div className={`border-t border-black/5 p-3 text-center text-[13.5px] font-bold text-[#00a884] hover:bg-black/[0.02] transition-all uppercase tracking-widest flex items-center justify-center gap-2 bg-[#f8f9fa]`}>
                                <MessageSquare className="w-4 h-4 opacity-50" />
                                {metadata.listButton || 'View Options'}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Background Pattern Doodles */}
            <div className={`absolute inset-0 z-0 opacity-[0.05] pointer-events-none`} style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: '400px' }} />
        </div>
    );

    if (isModal) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-[360px] p-0 overflow-hidden bg-transparent border-none shadow-none focus-visible:outline-none">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Template Preview</DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center justify-center p-4">
                        {Content}
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return Content;
}
