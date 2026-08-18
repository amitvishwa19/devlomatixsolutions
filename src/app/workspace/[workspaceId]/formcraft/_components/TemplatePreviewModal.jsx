'use client';

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Sparkles,
    Copy,
    CheckCircle2,
    Layers,
    List,
    ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

export function TemplatePreviewModal({ open, onOpenChange, template, onUseTemplate }) {
    if (!template) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg bg-card border-border/80 p-0 overflow-hidden flex flex-col max-h-[85vh]">
                <DialogHeader className="p-4 border-b border-border/60 bg-amber-500/10">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                            <DialogTitle className="text-sm font-bold text-foreground">
                                Blueprint: {template.title}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground">
                                {template.category || 'Pre-configured workflow template'}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
                    <p className="text-xs text-muted-foreground">{template.description}</p>

                    <div className="space-y-2">
                        <span className="font-semibold text-xs text-foreground uppercase tracking-wider text-[10px]">
                            Included Form Schema Fields
                        </span>
                        <div className="grid grid-cols-1 gap-2">
                            {template.fields && template.fields.map((f, idx) => (
                                <div key={idx} className="flex items-center gap-2 p-2.5 rounded-lg bg-secondary/30 border border-border/40">
                                    <Badge variant="outline" className="text-[9px] font-mono">#{idx + 1}</Badge>
                                    <span className="font-medium text-foreground">{typeof f === 'string' ? f : f.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-3.5 border-t border-border/60 bg-secondary/15 flex items-center justify-between gap-2 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="h-8 text-xs">
                        Close
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => {
                            if (onUseTemplate) onUseTemplate(template);
                            onOpenChange(false);
                        }}
                        className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white gap-1 shadow-xs"
                    >
                        <span>Use This Blueprint</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
