'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    MessageCircle,
    Send,
    Loader2,
    Sparkles,
    CheckCircle2,
    FileText,
    User,
    Building2,
    Briefcase,
    Phone,
    RefreshCw,
    AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { getCrmWhatsAppTemplatesAction, dispatchWhatsAppFromCrmAction } from '../_actions/whatsapp-template-actions';

export default function CrmWhatsAppOutreachSheet({
    isOpen,
    onClose,
    workspaceId,
    recipient = null, // { name, phone, email, jobTitle, company, candidateId, contactId }
    onSuccess
}) {
    const [mode, setMode] = useState('TEMPLATE'); // 'TEMPLATE' or 'CUSTOM'
    const [templates, setTemplates] = useState([]);
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const [variableValues, setVariableValues] = useState({});
    const [customText, setCustomText] = useState('');
    const [isSending, setIsSending] = useState(false);

    // Fetch templates when sheet opens
    useEffect(() => {
        if (!isOpen || !workspaceId) return;

        async function loadTemplates() {
            setIsLoadingTemplates(true);
            try {
                const res = await getCrmWhatsAppTemplatesAction(workspaceId);
                if (res.success && Array.isArray(res.data)) {
                    setTemplates(res.data);
                    if (res.data.length > 0 && !selectedTemplateId) {
                        setSelectedTemplateId(res.data[0].id || res.data[0].name);
                    }
                }
            } catch (err) {
                console.error("Failed to load WhatsApp templates:", err);
            } finally {
                setIsLoadingTemplates(false);
            }
        }

        loadTemplates();
    }, [isOpen, workspaceId]);

    // Active template object
    const activeTemplate = useMemo(() => {
        if (!selectedTemplateId) return templates[0] || null;
        return templates.find(t => (t.id || t.name) === selectedTemplateId) || templates.find(t => t.name === selectedTemplateId) || templates[0] || null;
    }, [templates, selectedTemplateId]);

    // Auto-populate variable defaults when template or recipient changes
    useEffect(() => {
        if (!activeTemplate || !recipient) return;

        const defaults = {};
        (activeTemplate.variables || []).forEach((v, index) => {
            const varNum = v.replace(/[{}]/g, '');
            if (varNum === '1') {
                defaults[varNum] = recipient.name || '';
            } else if (varNum === '2') {
                defaults[varNum] = recipient.jobTitle || recipient.company || 'Devlomatix';
            } else if (varNum === '3') {
                defaults[varNum] = 'Tomorrow at 11:00 AM';
            } else {
                defaults[varNum] = '';
            }
        });

        setVariableValues(defaults);
    }, [activeTemplate, recipient]);

    // Render resolved message preview text with variables replaced
    const resolvedPreviewText = useMemo(() => {
        if (!activeTemplate?.bodyText) return '';
        let text = activeTemplate.bodyText;

        Object.entries(variableValues).forEach(([key, val]) => {
            const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
            text = text.replace(regex, val?.trim() || `[Var ${key}]`);
        });

        return text;
    }, [activeTemplate, variableValues]);

    const handleVariableChange = (key, value) => {
        setVariableValues(prev => ({ ...prev, [key]: value }));
    };

    const handleQuickTemplateText = (type) => {
        const name = recipient?.name || 'there';
        if (type === 'interview') {
            setCustomText(`Hi ${name}, congratulations! We reviewed your profile for ${recipient?.jobTitle || 'the position'} and would love to schedule a video interview with you. Please let us know your availability.`);
        } else if (type === 'followup') {
            setCustomText(`Hello ${name}, following up on our recent conversation regarding ${recipient?.company || 'our proposal'}. Do you have 10 minutes today for a quick sync?`);
        } else if (type === 'general') {
            setCustomText(`Hi ${name}, this is from Devlomatix. Please let us know if you have any questions or require any assistance.`);
        }
    };

    const handleSend = async (e) => {
        e?.preventDefault();

        if (!recipient?.phone) {
            toast.error("Recipient phone number is missing.");
            return;
        }

        setIsSending(true);
        try {
            let payload;

            if (mode === 'TEMPLATE') {
                if (!activeTemplate) {
                    toast.error("Please select a WhatsApp template.");
                    setIsSending(false);
                    return;
                }

                // Construct component parameters for WhatsApp Cloud API
                const parameters = Object.keys(variableValues)
                    .sort((a, b) => parseInt(a) - parseInt(b))
                    .map(key => ({
                        type: 'text',
                        text: variableValues[key] || ''
                    }));

                const templateComponents = parameters.length > 0 ? [
                    {
                        type: 'body',
                        parameters
                    }
                ] : [];

                payload = {
                    recipientPhone: recipient.phone,
                    recipientName: recipient.name || 'Recipient',
                    messageType: 'TEMPLATE',
                    templateName: activeTemplate.name,
                    templateLanguage: activeTemplate.language || 'en',
                    templateComponents,
                    resolvedBodyText: resolvedPreviewText,
                    contactId: recipient.contactId || null,
                    candidateId: recipient.candidateId || null,
                    dealId: recipient.dealId || null
                };
            } else {
                if (!customText.trim()) {
                    toast.error("Please enter a message to send.");
                    setIsSending(false);
                    return;
                }

                payload = {
                    recipientPhone: recipient.phone,
                    recipientName: recipient.name || 'Recipient',
                    messageType: 'CUSTOM',
                    customText: customText.trim(),
                    contactId: recipient.contactId || null,
                    candidateId: recipient.candidateId || null,
                    dealId: recipient.dealId || null
                };
            }

            const res = await dispatchWhatsAppFromCrmAction(workspaceId, payload);

            if (res.success) {
                toast.success(`WhatsApp message sent to ${recipient.name || recipient.phone}!`);
                setCustomText('');
                onSuccess?.(res.data);
                onClose();
            } else {
                toast.error(res.error || "Failed to dispatch WhatsApp message");
            }
        } catch (error) {
            console.error("WhatsApp dispatch error:", error);
            toast.error(error.message || "An unexpected error occurred");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent
                side="right"
                className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl p-2 flex flex-col h-full overflow-hidden border-0 bg-transparent shadow-2xl z-50"
            >
                <div className="bg-background h-full border rounded-xl flex flex-col overflow-hidden shadow-2xl">
                    {/* Header */}
                    <SheetHeader className="p-5 border-b border-border bg-emerald-500/5 shrink-0 text-left">
                        <div className="flex items-center justify-between gap-3">
                            <SheetTitle className="flex items-center gap-2.5 text-lg font-bold text-foreground">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                    <MessageCircle className="w-4 h-4" />
                                </div>
                                <span>WhatsApp Outreach</span>
                            </SheetTitle>
                            {recipient?.phone && (
                                <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-mono">
                                    {recipient.phone}
                                </Badge>
                            )}
                        </div>
                        <SheetDescription className="text-xs text-muted-foreground mt-0.5">
                            Direct dispatch to <span className="font-semibold text-foreground">{recipient?.name || 'Contact'}</span> via KonnectX WhatsApp Cloud.
                        </SheetDescription>

                        {/* Mode Switcher Tabs */}
                        <div className="flex items-center bg-muted/60 p-1 rounded-lg border border-border mt-3 w-fit">
                            <button
                                type="button"
                                onClick={() => setMode('TEMPLATE')}
                                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                                    mode === 'TEMPLATE'
                                        ? 'bg-background text-foreground shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <FileText className="w-3.5 h-3.5 text-emerald-500" />
                                <span>Approved Template</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setMode('CUSTOM')}
                                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                                    mode === 'CUSTOM'
                                        ? 'bg-background text-foreground shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                                <span>Custom Message</span>
                            </button>
                        </div>
                    </SheetHeader>

                    {/* Form & Scrollable Body */}
                    <form onSubmit={handleSend} className="flex flex-col flex-1 min-h-0">
                        <div className="flex-1 overflow-y-auto p-5 space-y-4">
                            {/* Recipient Context Card */}
                            {recipient && (
                                <div className="p-3 bg-muted/30 rounded-xl border border-border flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                            {recipient.name?.charAt(0)?.toUpperCase() || 'R'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-foreground">{recipient.name}</p>
                                            <p className="text-[11px] text-muted-foreground">
                                                {recipient.jobTitle ? `Applicant: ${recipient.jobTitle}` : (recipient.company || 'CRM Contact')}
                                            </p>
                                        </div>
                                    </div>
                                    {recipient.email && (
                                        <span className="text-[11px] text-muted-foreground hidden sm:inline">
                                            {recipient.email}
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Mode 1: APPROVED WHATSAPP TEMPLATE */}
                            {mode === 'TEMPLATE' ? (
                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-xs font-semibold mb-1.5 block">
                                            Select KonnectX WhatsApp Template
                                        </Label>
                                        {isLoadingTemplates ? (
                                            <div className="flex items-center gap-2 p-3 text-xs text-muted-foreground bg-card border rounded-lg">
                                                <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />
                                                <span>Loading approved templates from KonnectX...</span>
                                            </div>
                                        ) : templates.length === 0 ? (
                                            <div className="p-4 text-center border border-dashed rounded-xl bg-card text-xs text-muted-foreground">
                                                <AlertCircle className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                                                <p className="font-medium text-foreground">No templates available</p>
                                                <p className="text-[11px] mt-0.5">Please sync your Meta WhatsApp templates in KonnectX.</p>
                                            </div>
                                        ) : (
                                            <Select
                                                value={activeTemplate ? (activeTemplate.id || activeTemplate.name) : ''}
                                                onValueChange={(val) => setSelectedTemplateId(val)}
                                            >
                                                <SelectTrigger className="h-9 text-xs">
                                                    <SelectValue placeholder="Choose a template" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {templates.map((tpl, idx) => {
                                                        const uniqueKey = tpl.id ? String(tpl.id) : `${tpl.name}_${tpl.language || 'en'}_${idx}`;
                                                        const itemVal = tpl.id ? String(tpl.id) : `${tpl.name}_${tpl.language || 'en'}_${idx}`;
                                                        return (
                                                            <SelectItem key={uniqueKey} value={itemVal} className="text-xs">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-semibold">{tpl.name}</span>
                                                                    <Badge variant="outline" className="text-[9px] py-0 px-1 font-mono">
                                                                        {tpl.category}
                                                                    </Badge>
                                                                    <span className="text-[10px] text-muted-foreground">
                                                                        ({tpl.language})
                                                                    </span>
                                                                </div>
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </div>

                                    {/* Template Variable Inputs */}
                                    {activeTemplate && activeTemplate.variables?.length > 0 && (
                                        <div className="p-3.5 bg-muted/20 rounded-xl border border-border/80 space-y-3">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                                                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                                                <span>Template Variables Mapping</span>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {activeTemplate.variables.map((v) => {
                                                    const varKey = v.replace(/[{}]/g, '');
                                                    return (
                                                        <div key={varKey}>
                                                            <Label className="text-[11px] font-semibold text-muted-foreground mb-1 block">
                                                                Variable {v} {varKey === '1' ? '(Name)' : varKey === '2' ? '(Role / Company)' : ''}
                                                            </Label>
                                                            <Input
                                                                value={variableValues[varKey] || ''}
                                                                onChange={(e) => handleVariableChange(varKey, e.target.value)}
                                                                className="h-8 text-xs font-medium"
                                                                placeholder={`Value for ${v}`}
                                                            />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Live Simulated WhatsApp Bubble Preview */}
                                    {activeTemplate && (
                                        <div>
                                            <Label className="text-xs font-semibold mb-1.5 block text-muted-foreground">
                                                Live WhatsApp Message Preview
                                            </Label>
                                            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/20 via-background to-emerald-900/10 border border-emerald-500/20 flex flex-col items-end">
                                                {/* Simulated WhatsApp Bubble */}
                                                <div className="max-w-[85%] rounded-2xl rounded-tr-xs bg-emerald-100 dark:bg-emerald-900/60 border border-emerald-500/30 p-3.5 text-xs shadow-sm text-foreground space-y-2">
                                                    {activeTemplate.headerText && (
                                                        <div className="font-bold text-emerald-800 dark:text-emerald-300 border-b border-emerald-500/20 pb-1">
                                                            {activeTemplate.headerText}
                                                        </div>
                                                    )}
                                                    <p className="whitespace-pre-line leading-relaxed text-[12px]">
                                                        {resolvedPreviewText}
                                                    </p>
                                                    {activeTemplate.footerText && (
                                                        <p className="text-[10px] text-muted-foreground italic pt-1">
                                                            {activeTemplate.footerText}
                                                        </p>
                                                    )}
                                                    <div className="text-[10px] text-emerald-700 dark:text-emerald-400 text-right font-medium">
                                                        Just now • ✓✓
                                                    </div>
                                                </div>

                                                {/* Template Quick Action Buttons (if any) */}
                                                {activeTemplate.buttons?.length > 0 && (
                                                    <div className="max-w-[85%] w-full flex flex-col gap-1.5 mt-2">
                                                        {activeTemplate.buttons.map((btnText, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="py-1.5 px-3 rounded-xl bg-background/80 border border-emerald-500/30 text-center text-[11px] font-bold text-emerald-600 dark:text-emerald-400 shadow-2xs"
                                                            >
                                                                {btnText}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* Mode 2: CUSTOM TEXT MESSAGE */
                                <div className="space-y-3.5">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        <span className="text-[11px] font-semibold text-muted-foreground mr-1">Quick prompts:</span>
                                        <button
                                            type="button"
                                            onClick={() => handleQuickTemplateText('interview')}
                                            className="px-2 py-0.5 rounded-md bg-muted hover:bg-muted/80 text-[10px] font-medium border border-border"
                                        >
                                            Interview Invite
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleQuickTemplateText('followup')}
                                            className="px-2 py-0.5 rounded-md bg-muted hover:bg-muted/80 text-[10px] font-medium border border-border"
                                        >
                                            Sales Follow-up
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleQuickTemplateText('general')}
                                            className="px-2 py-0.5 rounded-md bg-muted hover:bg-muted/80 text-[10px] font-medium border border-border"
                                        >
                                            General Intro
                                        </button>
                                    </div>

                                    <div>
                                        <Label className="text-xs font-semibold mb-1.5 block">
                                            Message Content *
                                        </Label>
                                        <Textarea
                                            rows={6}
                                            value={customText}
                                            onChange={(e) => setCustomText(e.target.value)}
                                            placeholder="Type your WhatsApp message here..."
                                            className="text-xs leading-relaxed"
                                            required
                                        />
                                        <p className="text-[10px] text-muted-foreground mt-1 text-right">
                                            {customText.length} characters
                                        </p>
                                    </div>

                                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-700 dark:text-amber-400 flex items-start gap-2">
                                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                        <span>
                                            Custom messages can only be delivered if the recipient has messaged your business in the last 24 hours. For cold outreach, please use an <strong>Approved Template</strong>.
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <SheetFooter className="p-4 px-5 border-t border-border bg-background/95 backdrop-blur shrink-0 flex flex-row items-center justify-between sm:justify-between gap-3">
                            <Button type="button" variant="outline" onClick={onClose} disabled={isSending} size="sm">
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSending || (mode === 'TEMPLATE' && !activeTemplate) || (mode === 'CUSTOM' && !customText.trim())}
                                size="sm"
                                className="gap-1.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                            >
                                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                <span>{isSending ? "Sending..." : "Send WhatsApp"}</span>
                            </Button>
                        </SheetFooter>
                    </form>
                </div>
            </SheetContent>
        </Sheet>
    );
}
