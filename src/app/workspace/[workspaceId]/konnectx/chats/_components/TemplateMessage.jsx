import React from 'react';
import { ExternalLink, Phone, MessageSquare, Workflow, Image as ImageIcon, Film, FileText, Check } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

/**
 * Enhanced TemplateMessage Component for WhatsApp Chat Interface
 * Renders actual interpolated template body text, media headers, footers, and interactive action buttons.
 */
const TemplateMessage = ({ msg, templateDefinition }) => {
    if (!msg) return null;

    // Extract template name
    const templateName = msg.metadata?.templateName ||
        msg.metadata?.originalPayload?.template?.name ||
        (typeof msg.text === 'string' && msg.text.startsWith('[Template:')
            ? msg.text.split('[Template:')[1]?.split(']')[0]?.trim()
            : 'WhatsApp Template');

    // Parse Metadata safely
    let meta = msg.metadata;
    if (typeof meta === 'string' && meta.trim().startsWith('{')) {
        try { meta = JSON.parse(meta); } catch (e) { }
    }
    meta = meta || {};

    // Header Logic
    let headerComponent = templateDefinition?.metadata?.components?.find(c => c.type === 'HEADER');
    let headerType = (headerComponent?.format || templateDefinition?.type || 'TEXT').toUpperCase();
    let headerText = headerComponent?.text || templateDefinition?.header || null;
    let headerMediaUrl = meta.mediaUrl || meta.originalPayload?.mediaUrl || templateDefinition?.metadata?.mediaUrl || null;

    // Buttons Logic
    let buttons = [];
    if (Array.isArray(templateDefinition?.buttons)) {
        buttons = templateDefinition.buttons;
    } else if (typeof templateDefinition?.buttons === 'string') {
        try { buttons = JSON.parse(templateDefinition.buttons); } catch (e) { }
    } else if (Array.isArray(meta.buttons)) {
        buttons = meta.buttons;
    }

    // Carousel Logic
    const isCarousel = templateDefinition?.type?.toUpperCase() === 'CAROUSEL';
    const cards = isCarousel ? (templateDefinition?.metadata?.cards || []) : [];

    // Interpolate & Format Template Body
    const getRenderedBody = () => {
        let bodyTemplate = templateDefinition?.body;

        if (bodyTemplate) {
            let text = bodyTemplate;

            // Extract potential parameter values
            const candidateName = meta.candidateName || meta.name || meta.originalPayload?.candidateName;
            const jobTitle = meta.jobTitle || meta.originalPayload?.jobTitle;
            const companyName = meta.companyName || meta.originalPayload?.companyName;

            // Extract parameters from originalPayload components
            const payloadComponents = meta.originalPayload?.template?.components || meta.components || [];
            const bodyComp = payloadComponents.find(c => c.type?.toLowerCase() === 'body');
            const params = bodyComp?.parameters || [];

            if (params.length > 0) {
                params.forEach((p, idx) => {
                    const val = p.text || p.value || (p.type === 'text' ? p.text : '');
                    if (val) {
                        text = text.replace(new RegExp(`\\{\\{${idx + 1}\\}\\}`, 'g'), val);
                    }
                });
            }

            // Interpolate named parameters or positional fallbacks
            if (candidateName) {
                text = text.replace(/\{\{1\}\}/g, candidateName)
                    .replace(/\{\{name\}\}/gi, candidateName)
                    .replace(/\{\{candidateName\}\}/gi, candidateName);
            }
            if (jobTitle) {
                text = text.replace(/\{\{2\}\}/g, jobTitle)
                    .replace(/\{\{jobTitle\}\}/gi, jobTitle)
                    .replace(/\{\{job\}\}/gi, jobTitle);
            }
            if (companyName) {
                text = text.replace(/\{\{3\}\}/g, companyName)
                    .replace(/\{\{companyName\}\}/gi, companyName)
                    .replace(/\{\{company\}\}/gi, companyName);
            }

            // Clean any remaining unfilled {{N}} tags gracefully
            text = text.replace(/\{\{\d+\}\}/g, '').trim();
            return text;
        }

        // Fallback: If raw text was stored with clean body
        if (msg.text && !msg.text.startsWith('[Template:')) {
            return msg.text;
        }

        // Fallback: Extract descriptive content after [Template: ...]
        if (typeof msg.text === 'string' && msg.text.startsWith('[Template:')) {
            const afterTag = msg.text.replace(/^\[Template:[^\]]+\]\s*/, '').trim();
            if (afterTag) {
                return (
                    <div className="space-y-1.5">
                        <p className="text-[13px] leading-relaxed font-medium">{afterTag}</p>
                        {meta.candidateName && (
                            <p className="text-[11px] opacity-80">
                                <strong>Candidate:</strong> {meta.candidateName}
                            </p>
                        )}
                        {meta.jobTitle && (
                            <p className="text-[11px] opacity-80">
                                <strong>Position:</strong> {meta.jobTitle}
                            </p>
                        )}
                    </div>
                );
            }
        }

        return `Template notification: ${templateName}`;
    };

    const renderedBody = getRenderedBody();

    if (isCarousel) {
        return (
            <div className={`flex flex-col w-full max-w-[340px] ${msg.fromMe ? 'items-end' : 'items-start'}`}>
                {/* Carousel Cards Container */}
                <div
                    className="flex overflow-x-auto gap-2 pb-2 snap-x hide-scrollbar w-full"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {cards.map((card, cIdx) => (
                        <div
                            key={cIdx}
                            className={`flex-none w-[85%] snap-center border overflow-hidden shadow-md flex flex-col rounded-2xl ${
                                msg.fromMe ? 'bg-primary text-primary-foreground border-primary/30' : 'bg-card text-foreground border-border/60'
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
                                            className={`flex items-center justify-center py-2 px-4 text-[12px] font-semibold border-b last:border-b-0 ${
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
        <div className={`relative flex flex-col w-full max-w-[340px] animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.fromMe ? 'items-end' : 'items-start'}`}>
            {/* Bubble Tail */}
            {msg.fromMe ? (
                <div className="absolute -right-[6px] top-0 w-0 h-0 border-t-8 border-t-primary border-r-8 border-r-transparent z-0" />
            ) : (
                <div className="absolute -left-[6px] top-0 w-0 h-0 border-t-8 border-t-card border-l-8 border-l-transparent z-0" />
            )}

            <div className={`flex flex-col w-full shadow-md overflow-hidden relative z-10 rounded-2xl ${
                msg.fromMe 
                    ? 'bg-primary text-primary-foreground border border-primary/20 rounded-tr-none' 
                    : 'bg-card text-foreground border border-border/60 rounded-tl-none'
            }`}>
                {/* Template Badge Header */}
                <div className={`flex items-center justify-between px-3.5 pt-2.5 pb-1.5 border-b text-[10px] font-bold uppercase tracking-wider ${
                    msg.fromMe ? 'border-primary-foreground/15 text-primary-foreground/80' : 'border-border/40 text-muted-foreground'
                }`}>
                    <span className="flex items-center gap-1.5 truncate">
                        <Workflow className={`w-3 h-3 shrink-0 ${msg.fromMe ? 'text-emerald-300' : 'text-emerald-500'}`} />
                        <span className="truncate">{templateName}</span>
                    </span>
                    <Badge variant="outline" className={`text-[9px] px-1.5 py-0 font-mono tracking-normal shrink-0 ${
                        msg.fromMe ? 'border-primary-foreground/30 text-primary-foreground/90' : 'border-border/60 text-muted-foreground'
                    }`}>
                        TEMPLATE
                    </Badge>
                </div>

                {/* Media Header (IMAGE / VIDEO / DOCUMENT) */}
                {headerType === 'IMAGE' && (
                    <div className="relative aspect-video bg-muted/20 flex items-center justify-center border-b border-border/20 overflow-hidden">
                        {headerMediaUrl ? (
                            <img src={headerMediaUrl} alt="Header Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center justify-center gap-1.5 opacity-40 p-4">
                                <ImageIcon className="w-7 h-7" />
                                <span className="text-[10px] font-medium">[Template Image]</span>
                            </div>
                        )}
                    </div>
                )}
                {headerType === 'VIDEO' && (
                    <div className="relative aspect-video bg-black/40 flex items-center justify-center border-b border-border/20 overflow-hidden">
                        {headerMediaUrl ? (
                            <video src={headerMediaUrl} controls className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center justify-center gap-1.5 text-white/60 p-4">
                                <Film className="w-7 h-7" />
                                <span className="text-[10px] font-medium">[Template Video]</span>
                            </div>
                        )}
                    </div>
                )}
                {headerType === 'DOCUMENT' && (
                    <div className={`p-3 flex items-center gap-2.5 border-b ${msg.fromMe ? 'bg-primary-foreground/5 border-primary-foreground/15' : 'bg-muted/30 border-border/40'}`}>
                        <FileText className="w-5 h-5 shrink-0 text-blue-400" />
                        <span className="text-xs font-semibold truncate">Attachment Document</span>
                    </div>
                )}

                {/* Template Body Section */}
                <div className="p-3.5 space-y-2">
                    {/* Header Text (if exists) */}
                    {headerType === 'TEXT' && headerText && (
                        <h4 className={`font-bold text-sm leading-tight ${msg.fromMe ? 'text-primary-foreground' : 'text-foreground'}`}>
                            {headerText}
                        </h4>
                    )}

                    {/* Actual Interpolated Body Text */}
                    <div className={`text-[13px] leading-relaxed whitespace-pre-wrap break-words ${
                        msg.fromMe ? 'text-primary-foreground/95' : 'text-foreground/95'
                    }`}>
                        {typeof renderedBody === 'string' ? renderedBody : renderedBody}
                    </div>

                    {/* Footer Text */}
                    {templateDefinition?.footer && (
                        <p className={`text-[10px] pt-1.5 border-t italic ${
                            msg.fromMe ? 'text-primary-foreground/70 border-primary-foreground/15' : 'text-muted-foreground border-border/30'
                        }`}>
                            {templateDefinition.footer}
                        </p>
                    )}
                </div>

                {/* Template Interactive Action Buttons */}
                {buttons.length > 0 && (
                    <div className={`flex flex-col border-t ${
                        msg.fromMe ? 'border-primary-foreground/20 bg-primary/95' : 'border-border/40 bg-muted/20'
                    }`}>
                        {buttons.filter(Boolean).map((btn, idx) => {
                            const b = typeof btn === 'object' ? btn : { type: 'QUICK_REPLY', text: btn };
                            const btnType = (b.type || 'QUICK_REPLY').toUpperCase();
                            const btnText = b.text || "Action";

                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    className={`flex items-center justify-center gap-2 py-2.5 px-4 text-[12px] font-semibold transition-colors border-b last:border-b-0 ${
                                        msg.fromMe 
                                            ? 'text-primary-foreground border-primary-foreground/15 hover:bg-primary-foreground/10' 
                                            : 'text-primary border-border/30 hover:bg-primary/5 active:bg-primary/10'
                                    }`}
                                >
                                    {btnType === 'URL' && <ExternalLink className="w-3.5 h-3.5 shrink-0" />}
                                    {btnType === 'PHONE_NUMBER' && <Phone className="w-3.5 h-3.5 shrink-0" />}
                                    {btnType === 'QUICK_REPLY' && <MessageSquare className="w-3.5 h-3.5 shrink-0" />}
                                    {btnType === 'FLOW' && <Workflow className="w-3.5 h-3.5 shrink-0" />}
                                    <span className="truncate">{btnText}</span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TemplateMessage;
