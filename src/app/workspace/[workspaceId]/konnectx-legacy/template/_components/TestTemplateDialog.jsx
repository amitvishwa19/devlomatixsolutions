'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Send, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { testSendTemplateAction } from '../../_actions/template-actions';
import TemplatePreview from './TemplatePreview';

export default function TestTemplateDialog({
    isOpen,
    onClose,
    template,
    workspaceId
}) {
    const [recipientPhone, setRecipientPhone] = useState('');
    const [variableValues, setVariableValues] = useState({});
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        if (template) {
            // Pre-fill variable keys
            const initialVals = { ...(template.sampleValues || {}) };
            for (const v of template.variables || []) {
                if (initialVals[v] === undefined) {
                    initialVals[v] = v === '1' ? 'John' : v === 'name' ? 'Amit' : v === 'date' ? 'Tomorrow 10 AM' : `Value_${v}`;
                }
            }
            setVariableValues(initialVals);
        }
    }, [template, isOpen]);

    if (!template) return null;

    const handleVariableChange = (key, val) => {
        setVariableValues(prev => ({ ...prev, [key]: val }));
    };

    const handleSendTest = async (e) => {
        e?.preventDefault();
        if (!recipientPhone.trim()) {
            toast.error("Please enter a recipient phone number");
            return;
        }

        setIsSending(true);
        try {
            const res = await testSendTemplateAction(workspaceId, {
                templateId: template.id,
                recipientPhone: recipientPhone.trim(),
                sampleValues: variableValues
            });

            if (!res.success) throw new Error(res.error);

            toast.success(res.message || "Test template message sent successfully!");
            onClose();
        } catch (err) {
            toast.error(err.message || "Failed to dispatch test message");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-card/95 backdrop-blur-xl border-border/50 text-foreground p-6 rounded-2xl shadow-2xl">
                <DialogHeader className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <Send size={18} />
                        </div>
                        <DialogTitle className="text-base font-bold text-foreground">
                            Test Template: {template.name}
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Send this template to any WhatsApp phone number from your linked device to test variable formatting and appearance.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3">
                    {/* Controls & Variables Input */}
                    <form onSubmit={handleSendTest} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                <Smartphone size={13} className="text-emerald-400" />
                                Test Recipient Phone Number *
                            </Label>
                            <Input
                                placeholder="e.g. 9712340450 or +919712340450"
                                value={recipientPhone}
                                onChange={(e) => setRecipientPhone(e.target.value)}
                                className="h-9 text-xs bg-background/50 border-border/50 rounded-xl font-mono"
                                required
                                autoFocus
                            />
                        </div>

                        {/* Variables Input Fields */}
                        {template.variables?.length > 0 && (
                            <div className="space-y-2.5 p-3 rounded-xl bg-card/40 border border-border/40">
                                <Label className="text-[11px] font-semibold text-foreground flex items-center justify-between">
                                    <span>Variable Substitutions</span>
                                    <Badge variant="outline" className="text-[9px] px-1 py-0">
                                        {template.variables.length} fields
                                    </Badge>
                                </Label>

                                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                    {template.variables.map((v) => (
                                        <div key={v} className="space-y-1">
                                            <span className="text-[10px] font-mono text-emerald-400">
                                                {`{{${v}}}`}
                                            </span>
                                            <Input
                                                placeholder={`Value for {{${v}}}...`}
                                                value={variableValues[v] || ''}
                                                onChange={(e) => handleVariableChange(v, e.target.value)}
                                                className="h-8 text-xs bg-background/50 border-border/50 rounded-lg"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="pt-2 flex items-center justify-end gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={onClose}
                                disabled={isSending}
                                className="h-8 text-xs text-muted-foreground"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={isSending || !recipientPhone.trim()}
                                className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-1.5 rounded-xl shadow-md"
                            >
                                {isSending ? (
                                    <>
                                        <Loader2 size={13} className="animate-spin" />
                                        <span>Dispatching...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send size={13} />
                                        <span>Send Test Message</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>

                    {/* Live Replaced Preview */}
                    <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-muted/20 border border-border/30">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            Live Render Preview
                        </span>
                        <TemplatePreview
                            template={template}
                            sampleValues={variableValues}
                            showDeviceFrame={false}
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
