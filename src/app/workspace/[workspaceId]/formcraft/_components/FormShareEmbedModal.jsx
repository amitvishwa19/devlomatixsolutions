'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Share2,
    Copy,
    Check,
    QrCode,
    Code2,
    ExternalLink,
    Send
} from 'lucide-react';
import { toast } from 'sonner';

export function FormShareEmbedModal({ open, onOpenChange, form }) {
    if (!form) return null;

    const [copied, setCopied] = useState(false);
    const formUrl = `https://forms.devlomatix.com/f/${form.id}`;

    const iframeCode = `<iframe 
  src="${formUrl}" 
  width="100%" 
  height="650" 
  frameborder="0" 
  style="border-radius: 12px; border: 1px solid #e2e8f0;">
</iframe>`;

    const widgetCode = `<script src="https://cdn.devlomatix.com/embed/formcraft.js" 
  data-form-id="${form.id}" 
  data-position="bottom-right">
</script>`;

    const handleCopy = (text, label) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success(`${label} copied to clipboard!`);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShareWhatsApp = () => {
        const text = encodeURIComponent(`Please fill out this form: ${form.title}\n${formUrl}`);
        window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl bg-card border-border/80 p-0 overflow-hidden flex flex-col">
                <DialogHeader className="p-4 border-b border-border/60 bg-amber-500/10">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500">
                            <Share2 className="w-4 h-4" />
                        </div>
                        <div>
                            <DialogTitle className="text-sm font-bold text-foreground">
                                Share & Embed Form: {form.title}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground">
                                Distribute direct public link, QR code, or embed on your website.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-5 space-y-4 text-xs">
                    {/* Direct Link Section */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-foreground">Public Direct Link</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                readOnly
                                value={formUrl}
                                className="h-8 text-xs font-mono bg-secondary/30 border-border/80"
                            />
                            <Button
                                size="sm"
                                onClick={() => handleCopy(formUrl, "Public Link")}
                                className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white gap-1 shrink-0 shadow-xs"
                            >
                                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                Copy Link
                            </Button>
                        </div>
                    </div>

                    {/* Quick WhatsApp Share */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <div className="space-y-0.5">
                            <span className="font-semibold text-foreground text-xs block">WhatsApp Lead Dispatch</span>
                            <p className="text-[11px] text-muted-foreground">Send form directly to leads or customers via WhatsApp.</p>
                        </div>
                        <Button
                            size="sm"
                            onClick={handleShareWhatsApp}
                            className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                        >
                            <Send className="w-3 h-3" /> Share to WhatsApp
                        </Button>
                    </div>

                    {/* Tabs for Embed Options */}
                    <Tabs defaultValue="iframe" className="w-full">
                        <TabsList className="w-full grid grid-cols-2 bg-secondary/30 h-8">
                            <TabsTrigger value="iframe" className="text-xs">
                                <Code2 className="w-3.5 h-3.5 mr-1" /> Inline &lt;iframe&gt;
                            </TabsTrigger>
                            <TabsTrigger value="widget" className="text-xs">
                                <ExternalLink className="w-3.5 h-3.5 mr-1" /> Popup Widget
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="iframe" className="space-y-2 pt-2">
                            <Label className="text-[11px] text-muted-foreground">Embed directly in your React/HTML website container:</Label>
                            <pre className="p-3 rounded-lg bg-secondary/40 border border-border/60 font-mono text-[11px] overflow-x-auto text-foreground">
                                {iframeCode}
                            </pre>
                            <div className="flex justify-end">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCopy(iframeCode, "iFrame code")}
                                    className="h-7 text-xs border-border/80 gap-1"
                                >
                                    <Copy className="w-3 h-3" /> Copy iFrame
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="widget" className="space-y-2 pt-2">
                            <Label className="text-[11px] text-muted-foreground">Add floating launch button on your bottom corner:</Label>
                            <pre className="p-3 rounded-lg bg-secondary/40 border border-border/60 font-mono text-[11px] overflow-x-auto text-foreground">
                                {widgetCode}
                            </pre>
                            <div className="flex justify-end">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCopy(widgetCode, "Widget script")}
                                    className="h-7 text-xs border-border/80 gap-1"
                                >
                                    <Copy className="w-3 h-3" /> Copy Widget
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="p-3.5 border-t border-border/60 bg-secondary/15 flex justify-end">
                    <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="h-8 text-xs">
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
