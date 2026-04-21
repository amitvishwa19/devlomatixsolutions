import React from 'react';
import { ExternalLink, Phone, MessageSquare, Image as ImageIcon, Film } from 'lucide-react';
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

    return (
        <div className="flex flex-col max-w-[320px] bg-card border border-border/50 rounded-2xl overflow-hidden shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Template Header */}
            {headerType === 'IMAGE' && (
                <div className="relative aspect-video bg-muted flex items-center justify-center border-b border-border/20">
                    <ImageIcon className="w-8 h-8 text-muted-foreground opacity-20" />
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] text-muted-foreground/60 font-medium bg-black/5">
                        [Header Image]
                    </div>
                </div>
            )}
            {headerType === 'VIDEO' && (
                <div className="relative aspect-video bg-black flex items-center justify-center border-b border-border/20">
                    <Film className="w-8 h-8 text-white/20" />
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white/40 font-medium bg-black/20">
                        [Header Video]
                    </div>
                </div>
            )}

            <div className="p-3.5 space-y-2">
                {/* Header Text (if exists) */}
                {headerType === 'TEXT' && headerComponent?.text && (
                    <h4 className="font-bold text-sm leading-tight text-foreground underline decoration-primary/30 decoration-2 underline-offset-4">
                        {headerComponent.text}
                    </h4>
                )}

                {/* Body Text */}
                <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                    {msg.text}
                </p>

                {/* Footer Text */}
                {templateDefinition?.footer && (
                    <p className="text-[10px] text-muted-foreground pt-1 border-t border-border/10">
                        {templateDefinition.footer}
                    </p>
                )}
            </div>

            {/* Template Buttons */}
            {buttons.length > 0 && (
                <div className="flex flex-col border-t border-border/30 bg-muted/20">
                    {buttons.map((btn, idx) => (
                        <button
                            key={idx}
                            disabled
                            className={`flex items-center justify-center gap-2 py-2.5 px-4 text-[13px] font-semibold transition-colors hover:bg-primary/5 active:bg-primary/10 border-b border-border/30 last:border-b-0 text-primary`}
                        >
                            {btn.type === 'URL' && <ExternalLink className="w-3.5 h-3.5" />}
                            {btn.type === 'PHONE_NUMBER' && <Phone className="w-3.5 h-3.5" />}
                            {btn.type === 'QUICK_REPLY' && <MessageSquare className="w-3.5 h-3.5" />}
                            {btn.text}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TemplateMessage;
