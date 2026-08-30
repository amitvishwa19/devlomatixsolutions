import React from 'react';
import { ExternalLink, Phone, MessageSquare, Workflow, Image as ImageIcon, Film, FileText, Music, Loader2, AlertCircle, Check, CheckCheck } from 'lucide-react';

const CheckTick = ({ status }) => {
    switch (status) {
        case 'PENDING': return <Loader2 className="w-3 h-3 text-[#8696a0] animate-spin" title="Sending..." />;
        case 'READ': return <CheckCheck className="w-3 h-3 text-[#53bdeb]" title="Read" />;
        case 'DELIVERED': return <CheckCheck className="w-3 h-3 text-[#53bdeb]" title="Delivered" />;
        case 'SENT': return <Check className="w-3 h-3 text-[#8696a0]" title="Sent to Meta" />;
        case 'FAILED': return <AlertCircle className="w-3 h-3 text-red-500 animate-pulse" title="Message Failed" />;
        default: return <Check className="w-3 h-3 text-[#8696a0]" />;
    }
};

/**
 * WhatsApp-authentic Template Message Bubble for the Chat interface.
 * Mirrors the official WhatsApp rendering (white incoming / green outgoing bubble,
 * media header, interpolated body, footer, quick-reply buttons, carousel cards).
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
    let headerText = headerComponent?.text || templateDefinition?.header || meta.headerText || null;
    let headerMediaUrl = meta.mediaUrl || meta.originalPayload?.mediaUrl || templateDefinition?.metadata?.mediaUrl || null;

    // Fallback: pull media link from the original sent/webhook payload header parameters
    if (!headerMediaUrl) {
        const comps = meta.originalPayload?.template?.components || meta.components || [];
        const hComp = comps.find(c => c.type?.toLowerCase() === 'header');
        const param = hComp?.parameters?.[0];
        if (param && ['image', 'video', 'document'].includes(param.type)) {
            headerMediaUrl = param[param.type]?.link || null;
        }
    }

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

    const isInteractiveGroup = templateDefinition?.type === 'interactive-group' ||
        meta.type === 'interactive-group';

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
                        <p className="text-[14px] leading-relaxed font-medium">{afterTag}</p>
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
    const isOutgoing = msg.fromMe;

    const timeStr = msg.timestamp
        ? new Date(msg.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const fillCardBody = (body) => {
        let text = body || '';
        const payloadComponents = meta.originalPayload?.template?.components || meta.components || [];
        const bodyComp = payloadComponents.find(c => c.type?.toLowerCase() === 'body');
        const params = bodyComp?.parameters || [];
        params.forEach((p, idx) => {
            const val = p.text || '';
            if (val) text = text.replace(new RegExp(`\\{\\{${idx + 1}\\}\\}`, 'g'), val);
        });
        return text.replace(/\{\{\d+\}\}/g, '').trim();
    };

    const CardButtonIcon = ({ type }) => {
        const upper = (type || '').toUpperCase();
        if (upper === 'URL') return <ExternalLink className="w-3.5 h-3.5 opacity-70" />;
        if (upper === 'PHONE_NUMBER') return <Phone className="w-3.5 h-3.5 opacity-70" />;
        if (upper === 'FLOW') return <Workflow className="w-3.5 h-3.5 opacity-70" />;
        return (
            <svg viewBox="0 0 24 24" width="15" height="15" className="opacity-70 rotate-180 shrink-0">
                <path fill="currentColor" d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-12.1z"></path>
            </svg>
        );
    };

    if (isCarousel) {
        return (
            <div className={`flex flex-col w-full max-w-[340px] ${isOutgoing ? 'items-end' : 'items-start'}`}>
                {/* Carousel Header / Body / Footer Bubble */}
                <div className="relative w-full max-w-[280px]">
                    <div className="relative z-10 rounded-lg rounded-tl-none shadow-sm overflow-hidden">
                        <div className={`${isOutgoing
                            ? 'bg-[#d9fdd3] dark:bg-[#005c4b] text-[#111b21] dark:text-[#e9edef]'
                            : 'bg-white dark:bg-[#202c33] text-[#111b21] dark:text-[#e9edef]'}`}>
                            <div className="px-3 py-2 text-[14px] leading-relaxed whitespace-pre-wrap break-words">
                                {typeof renderedBody === 'string' ? renderedBody : renderedBody}
                            </div>
                            {templateDefinition?.footer && (
                                <div className="px-3 pb-2 -mt-1 text-[11.5px] text-[#667781] dark:text-[#8696a0] italic">
                                    {templateDefinition.footer}
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Source beak */}
                    <div className={`absolute -left-[6px] top-0 w-2 h-2 ${isOutgoing
                        ? '' : 'text-white dark:text-[#202c33]'}`}>
                        {!isOutgoing && (
                            <svg viewBox="0 0 8 13" width="8" height="13">
                                <path fill="currentColor" d="M1.533 3.568L8 12.193V1H2.812C1.042 1 .474 2.156 1.533 3.568z"></path>
                            </svg>
                        )}
                    </div>
                </div>

                {/* Horizontal Cards */}
                <div className="flex gap-3 overflow-x-auto pb-2 px-1 w-full hide-scrollbar snap-x snap-mandatory" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {cards.map((card, cIdx) => (
                        <div key={cIdx} className={`min-w-[240px] rounded-xl overflow-hidden shadow-lg snap-center flex flex-col border ${isOutgoing
                            ? 'bg-[#d9fdd3] dark:bg-[#005c4b] border-black/5 dark:border-white/10'
                            : 'bg-white dark:bg-[#202c33] border-black/5 dark:border-white/10'}`}>
                            <div className="flex items-center justify-center relative bg-black/5 dark:bg-black/20">
                                {card.mediaUrl ? (
                                    <img src={card.mediaUrl} className="w-full h-full object-cover" alt={`Card ${cIdx + 1}`} />
                                ) : (
                                    <ImageIcon className="w-10 h-10 opacity-10 my-10" />
                                )}
                            </div>
                            <div className={`p-3.5 flex-1 flex flex-col gap-1.5 ${isOutgoing ? 'text-[#111b21] dark:text-[#e9edef]' : 'text-[#111b21] dark:text-[#e9edef]'}`}>
                                <h4 className="text-[14px] font-bold truncate">{card.title || 'Untitled Card'}</h4>
                                <p className="text-[12.5px] line-clamp-2 leading-snug text-[#667781] dark:text-[#8696a0]">
                                    {card.description || ''}
                                </p>
                                <p className="text-[13px] leading-snug whitespace-pre-wrap break-words">
                                    {fillCardBody(card.body)}
                                </p>
                                {/* Card Buttons */}
                                {card.buttons && card.buttons.length > 0 && (
                                    <div className="flex flex-col">
                                        {card.buttons.filter(Boolean).map((btn, bIdx) => {
                                            const b = typeof btn === 'object' ? btn : { type: 'QUICK_REPLY', text: btn };
                                            return (
                                                <div key={bIdx} className={`mt-3 pt-2.5 border-t border-black/5 dark:border-white/10 text-center text-[13.5px] text-[#00a884] dark:text-[#53bdeb] flex items-center justify-center gap-1.5 font-bold`}>
                                                    <CardButtonIcon type={b.type} />
                                                    <span>{b.text || 'View Details'}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={`relative flex flex-col w-full max-w-[340px] ${isOutgoing ? 'items-end' : 'items-start'}`}>
            {/* Source Beak */}
            {isOutgoing ? (
                <div className="absolute -right-[8px] top-0 w-3 h-3 text-[#d9fdd3] dark:text-[#005c4b] z-0">
                    <svg viewBox="0 0 8 13" width="8" height="13">
                        <path fill="currentColor" d="M6.467 3.568L0 12.193V1h5.188C6.958 1 7.526 2.156 6.467 3.568z"></path>
                    </svg>
                </div>
            ) : (
                <div className="absolute -left-[8px] top-0 w-3 h-3 text-white dark:text-[#202c33] z-0">
                    <svg viewBox="0 0 8 13" width="8" height="13">
                        <path fill="currentColor" d="M1.533 3.568L8 12.193V1H2.812C1.042 1 .474 2.156 1.533 3.568z"></path>
                    </svg>
                </div>
            )}

            <div className={`relative z-10 rounded-xl overflow-hidden shadow-md ${isOutgoing
                ? 'bg-[#d9fdd3] dark:bg-[#005c4b] rounded-tr-none'
                : 'bg-white dark:bg-[#202c33] rounded-tl-none'}`}>
                {/* Media Header */}
                {headerType === 'IMAGE' && (
                    <div className="relative h-[180px] bg-black/5 dark:bg-black/20 flex items-center justify-center overflow-hidden border-b border-black/5 dark:border-white/10">
                        {headerMediaUrl ? (
                            <img src={headerMediaUrl} alt="Template media" className="absolute inset-0 w-full h-full object-cover" />
                        ) : (
                            <ImageIcon className="w-10 h-10 opacity-10" />
                        )}
                    </div>
                )}
                {headerType === 'VIDEO' && (
                    <div className="relative h-[180px] bg-black/90 flex items-center justify-center border-b border-black/5 dark:border-white/10">
                        {headerMediaUrl ? (
                            <video src={headerMediaUrl} poster={headerMediaUrl} controls className="w-full h-full object-cover" />
                        ) : (
                            <>
                                <div className="w-12 h-12 rounded-full border-2 border-white/50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                                    <Film className="w-6 opacity-80 text-white" />
                                </div>
                                <span className="absolute bottom-2 right-2 text-[10px] text-white/60 font-medium">[Template Video]</span>
                            </>
                        )}
                    </div>
                )}
                {headerType === 'DOCUMENT' && (
                    <div className={`p-3.5 flex items-center gap-3 border-b border-black/5 dark:border-white/10 ${isOutgoing ? 'bg-[#e7fce3] dark:bg-[#095948]' : 'bg-[#f0f2f5] dark:bg-black/20'}`}>
                        <div className="p-2.5 bg-blue-500/10 rounded-lg shrink-0">
                            <FileText className="w-6 h-6 text-blue-500" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[13.5px] font-bold truncate text-[#111b21] dark:text-[#e9edef]">Attachment Document</span>
                            <span className="text-[10px] text-[#667781] dark:text-[#8696a0] uppercase tracking-widest font-medium">Template • PDF</span>
                        </div>
                    </div>
                )}
                {headerType === 'AUDIO' && (
                    <div className={`p-3 flex items-center gap-3 border-b border-black/5 dark:border-white/10 ${isOutgoing ? 'bg-[#e7fce3] dark:bg-[#095948]' : 'bg-[#f0f2f5] dark:bg-black/20'}`}>
                        <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center text-white shadow-lg shrink-0">
                            <Music className="w-5 h-5 ml-0.5" />
                        </div>
                        <div className="flex-1 h-1 bg-black/10 dark:bg-white/20 rounded-full overflow-hidden relative">
                            <div className="absolute inset-y-0 left-0 w-1/3 bg-[#00a884]" />
                        </div>
                        <span className="text-[10px] font-mono text-[#667781] dark:text-[#8696a0]">0:24</span>
                    </div>
                )}

                {/* Header Text */}
                {headerType === 'TEXT' && headerText && (
                    <div className="px-3 pt-2.5 pb-0">
                        <div className="text-[14.5px] font-bold leading-tight text-[#111b21] dark:text-[#e9edef]">
                            {headerText}
                        </div>
                    </div>
                )}

                {/* Body */}
                <div className="py-1.5 px-3">
                    <div className="text-[14.5px] leading-relaxed break-words whitespace-pre-wrap text-[#111b21] dark:text-[#e9edef]">
                        {typeof renderedBody === 'string' ? renderedBody : renderedBody}
                    </div>

                    {templateDefinition?.footer && (
                        <div className="text-[12px] mt-1.5 text-[#667781] dark:text-[#8696a0] italic">
                            {templateDefinition.footer}
                        </div>
                    )}

                    {/* Time + Status inside bubble (WhatsApp style) */}
                    <div className="flex justify-end items-center gap-1 mt-1">
                        <span className="text-[10px] text-[#667781] dark:text-[#8696a0] font-mono uppercase">
                            {timeStr}
                            {isOutgoing && <span className="ml-0.5 inline-flex align-middle"><CheckTick status={msg.status} /></span>}
                        </span>
                    </div>
                </div>

                {/* Interactive Action Buttons */}
                {buttons.length > 0 && buttons[0] !== '' && (
                    <div className={`border-t divide-y divide-black/5 dark:divide-white/10 ${isOutgoing
                        ? 'border-black/5 dark:border-white/10 bg-[#e7fce3] dark:bg-[#095948]'
                        : 'border-black/5 dark:border-white/10 bg-white dark:bg-[#202c33]'}`}>
                        {buttons.filter(Boolean).map((btn, idx) => {
                            const b = typeof btn === 'object' ? btn : { type: 'QUICK_REPLY', text: btn };
                            const btnType = (b.type || 'QUICK_REPLY').toUpperCase();
                            const btnText = b.text || "Button";

                            return (
                                <div key={idx} className="py-2.5 px-4 text-center text-[14px] text-[#00a884] dark:text-[#53bdeb] hover:bg-black/[0.02] active:bg-black/[0.05] transition-colors cursor-pointer flex items-center justify-center gap-2">
                                    {btnType === 'QUICK_REPLY' && (
                                        <svg viewBox="0 0 24 24" width="16" height="16" className="opacity-70 rotate-180 shrink-0">
                                            <path fill="currentColor" d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-12.1z"></path>
                                        </svg>
                                    )}
                                    {btnType === 'URL' && <ExternalLink className="w-3.5 h-3.5 opacity-70 shrink-0" />}
                                    {btnType === 'PHONE_NUMBER' && <Phone className="w-3.5 h-3.5 opacity-70 shrink-0" />}
                                    {btnType === 'FLOW' && <Workflow className="w-3.5 h-3.5 opacity-70 shrink-0" />}
                                    <span className="font-semibold tracking-tight leading-none">{btnText}</span>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Interactive List Toggle */}
                {isInteractiveGroup && !buttons.some(b => b) && (
                    <div className={`border-t border-black/5 dark:border-white/10 p-3 text-center text-[13.5px] font-bold text-[#00a884] dark:text-[#53bdeb] uppercase tracking-widest flex items-center justify-center gap-2 ${isOutgoing ? 'bg-[#e7fce3] dark:bg-[#095948]' : 'bg-[#f8f9fa] dark:bg-transparent'}`}>
                        <MessageSquare className="w-4 h-4 opacity-50" />
                        {meta.listButton || 'View Options'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TemplateMessage;