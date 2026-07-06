import React from 'react';
import { ExternalLink, Phone, MessageSquare, Workflow, Image as ImageIcon, Film } from 'lucide-react';
import { Button } from "@/components/ui/button";

const TemplateMessage = ({ msg, templateDefinition }) => {
    if (!msg) return null;

    // Extract template name from metadata
    const templateName = msg.metadata?.originalPayload?.template?.name || msg.metadata?.templateName;

    // Header Logic
    const headerComponent = templateDefinition?.metadata?.components?.find(c => c.type === 'HEADER');
    const headerType = headerComponent?.format || 'TEXT';

    // Buttons Logic
    const buttons = templateDefinition?.buttons || [];

    const isCarousel = templateDefinition?.type?.toUpperCase() === 'CAROUSEL';
    const cards = isCarousel ? (templateDefinition?.metadata?.cards || []) : [];

    if (isCarousel) {
        return (
            <div className={`flex flex-col w-full max-w-[320px] ${msg.fromMe ? 'items-end' : 'items-start'}`}>
                {/* Top-level body for carousel */}
                {msg.text && msg.text.trim() && (
                    <div className={`relative px-4 py-2.5 rounded-2xl shadow-sm text-[14px] mb-2 w-fit max-w-[85%] ${
                        msg.fromMe 
                            ? 'bg-primary text-primary-foreground rounded-tr-none' 
                            : 'bg-card border border-border/50 rounded-tl-none'
                    }`}>
                        <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                        {/* Bubble Tail */}
                        {msg.fromMe ? (
                            <div className="absolute -right-[6px] top-0 w-0 h-0 border-t-8 border-t-primary border-r-8 border-r-transparent" />
                        ) : (
                            <div className="absolute -left-[6px] top-0 w-0 h-0 border-t-8 border-t-card border-l-8 border-l-transparent" />
                        )}
                    </div>
                )}

                {/* Carousel Cards Container */}
                <div
                    className="flex overflow-x-auto gap-2 pb-2 snap-x hide-scrollbar w-full"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {cards.map((card, cIdx) => (
                        <div
                            key={cIdx}
                            className={`flex-none w-[85%] snap-center border overflow-hidden shadow-sm flex flex-col ${
                                msg.fromMe ? 'bg-primary text-primary-foreground border-primary/30 rounded-2xl' : 'bg-card text-foreground border-border/60 rounded-2xl'
                            }`}
                        >
                            {/* Card Image */}
                            <div className="relative aspect-[1.91/1] bg-muted/40 flex items-center justify-center border-b border-border/40">
                                {card.mediaUrl ? (
                                    <img
                                        src={card.mediaUrl}
                                        alt={`Card ${cIdx + 1}`}
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                ) : (
                                    <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
                                )}
                            </div>

                            {/* Card Body */}
                            <div className="p-3.5 flex-grow">
                                <p className={`text-[13px] leading-snug whitespace-pre-wrap break-words ${msg.fromMe ? 'text-primary-foreground/90' : 'text-foreground/90'}`}>
                                    {card.body}
                                </p>
                            </div>

                            {/* Card Buttons */}
                            {card.buttons && card.buttons.length > 0 && (
                                <div className={`flex flex-col border-t ${msg.fromMe ? 'border-primary-foreground/20 bg-primary/90' : 'border-border/40 bg-background/50'}`}>
                                    {card.buttons.map((btnText, bIdx) => (
                                        <button
                                            key={bIdx}
                                            disabled
                                            className={`flex items-center justify-center py-2.5 px-4 text-[13px] font-medium border-b last:border-b-0 ${
                                                msg.fromMe ? 'text-primary-foreground border-primary-foreground/20' : 'text-primary border-border/30'
                                            }`}
                                        >
                                            {btnText}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={`relative flex flex-col w-full max-w-[320px] animate-in fade-in slide-in-from-bottom-2 duration-500 ${msg.fromMe ? 'items-end' : 'items-start'}`}>
            {/* Bubble Tail */}
            {msg.fromMe ? (
                <div className="absolute -right-[6px] top-0 w-0 h-0 border-t-8 border-t-primary border-r-8 border-r-transparent z-0" />
            ) : (
                <div className="absolute -left-[6px] top-0 w-0 h-0 border-t-8 border-t-card border-l-8 border-l-transparent z-0" />
            )}

            <div className={`flex flex-col w-full shadow-sm overflow-hidden relative z-10 ${
                msg.fromMe 
                    ? 'bg-primary text-primary-foreground border border-primary/20 rounded-2xl rounded-tr-none' 
                    : 'bg-card text-foreground border border-border/50 rounded-2xl rounded-tl-none'
            }`}>
                {/* Template Header */}
            {headerType === 'IMAGE' && (
                <div className="relative aspect-video bg-muted/20 flex items-center justify-center border-b border-border/20">
                    <ImageIcon className={`w-8 h-8 ${msg.fromMe ? 'text-primary-foreground/40' : 'text-muted-foreground opacity-20'}`} />
                    <div className={`absolute inset-0 flex items-center justify-center text-[10px] font-medium bg-black/5 ${msg.fromMe ? 'text-primary-foreground/60' : 'text-muted-foreground/60'}`}>
                        [Header Image]
                    </div>
                </div>
            )}
            {headerType === 'VIDEO' && (
                <div className="relative aspect-video bg-black/40 flex items-center justify-center border-b border-border/20">
                    <Film className="w-8 h-8 text-white/40" />
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white/60 font-medium bg-black/20">
                        [Header Video]
                    </div>
                </div>
            )}

            <div className="p-3.5 space-y-2">
                {/* Header Text (if exists) */}
                {headerType === 'TEXT' && headerComponent?.text && (
                    <h4 className={`font-bold text-sm leading-tight underline decoration-2 underline-offset-4 ${msg.fromMe ? 'text-primary-foreground decoration-primary-foreground/30' : 'text-foreground decoration-primary/30'}`}>
                        {headerComponent.text}
                    </h4>
                )}

                {/* Body Text */}
                <p className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${msg.fromMe ? 'text-primary-foreground/90' : 'text-foreground/90'}`}>
                    {msg.text}
                </p>

                {/* Footer Text */}
                {templateDefinition?.footer && (
                    <p className={`text-[10px] pt-1 border-t ${msg.fromMe ? 'text-primary-foreground/60 border-primary-foreground/20' : 'text-muted-foreground border-border/10'}`}>
                        {templateDefinition.footer}
                    </p>
                )}
            </div>

            {/* Template Buttons */}
            {buttons.length > 0 && (
                <div className={`flex flex-col border-t ${msg.fromMe ? 'border-primary-foreground/20 bg-primary/90' : 'border-border/30 bg-muted/20'}`}>
                    {buttons.map((btn, idx) => (
                        <button
                            key={idx}
                            disabled
                            className={`flex items-center justify-center gap-2 py-2.5 px-4 text-[13px] font-semibold transition-colors border-b last:border-b-0 ${
                                msg.fromMe 
                                    ? 'text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/10' 
                                    : 'text-primary border-border/30 hover:bg-primary/5 active:bg-primary/10'
                            }`}
                        >
                            {btn.type === 'URL' && <ExternalLink className="w-3.5 h-3.5" />}
                            {btn.type === 'PHONE_NUMBER' && <Phone className="w-3.5 h-3.5" />}
                            {btn.type === 'QUICK_REPLY' && <MessageSquare className="w-3.5 h-3.5" />}
                            {btn.type === 'FLOW' && <Workflow className="w-3.5 h-3.5" />}
                            {btn.text}
                        </button>
                    ))}
                </div>
            )}
            </div>
        </div>
    );
};

export default TemplateMessage;
