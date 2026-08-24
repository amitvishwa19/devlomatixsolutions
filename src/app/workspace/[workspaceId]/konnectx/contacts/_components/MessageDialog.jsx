'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Loader2,
    MessageSquare,
    Sparkles,
    Send,
    FileText,
    Image as ImageIcon,
    Video,
    FileCheck,
    Search,
    RefreshCw,
    Check,
    Phone,
    ExternalLink,
    Workflow,
    AlertCircle,
    User,
    Tag,
    ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { useAction } from '@/hooks/use-action';
import { getTemplates } from '../../template/_actions/get-templates';

export default function MessageDialog({
    isOpen,
    onOpenChange,
    onSend,
    activeContact,
    contactName,
    workspaceId,
    isSending
}) {
    const [mode, setMode] = useState('template'); // 'template' | 'custom'
    const [messageText, setMessageText] = useState('');
    const [templates, setTemplates] = useState([]);
    const [templateSearch, setTemplateSearch] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [variableMappings, setVariableMappings] = useState({});
    const [mediaUrl, setMediaUrl] = useState('');

    const targetContact = activeContact || { name: contactName || 'Contact', phone: '' };

    // Fetch templates hook
    const { execute: executeGetTemplates, isLoading: isLoadingTemplates } = useAction(getTemplates, {
        onSuccess: (data) => {
            const list = Array.isArray(data?.templates) ? data.templates : (Array.isArray(data) ? data : []);
            setTemplates(list);
            if (list.length > 0 && !selectedTemplate) {
                // Default to first approved or available template
                const approved = list.find(t => t.status === 'APPROVED') || list[0];
                setSelectedTemplate(approved);
            }
        },
        onError: (err) => {
            console.error("Failed to load templates:", err);
        }
    });

    useEffect(() => {
        if (isOpen && workspaceId) {
            executeGetTemplates({ workspaceId, all: true });
        }
    }, [isOpen, workspaceId]);

    // Reset state when opening/closing or selecting new contact
    useEffect(() => {
        if (isOpen) {
            setMessageText('');
            setVariableMappings({});
            setMediaUrl('');
        }
    }, [isOpen, activeContact?.id]);

    // Auto-populate initial variables when selectedTemplate or contact changes
    useEffect(() => {
        if (!selectedTemplate) return;

        const headerText = selectedTemplate.metadata?.headerText || '';
        const headerVars = [...headerText.matchAll(/{{(\d+)}}/g)].map(m => m[1]);
        const bodyVars = [...(selectedTemplate.body || '').matchAll(/{{(\d+)}}/g)].map(m => m[1]);
        const allVars = [...new Set([...headerVars, ...bodyVars])];

        const initialMappings = {};
        allVars.forEach(v => {
            if (v === '1' && targetContact?.name) {
                initialMappings[v] = targetContact.name;
            } else if (v === '2' && targetContact?.phone) {
                initialMappings[v] = targetContact.phone;
            } else {
                initialMappings[v] = '';
            }
        });

        setVariableMappings(initialMappings);
        if (selectedTemplate.metadata?.mediaUrl) {
            setMediaUrl(selectedTemplate.metadata.mediaUrl);
        } else {
            setMediaUrl('');
        }
    }, [selectedTemplate?.id, targetContact?.id]);

    // Filter templates based on search term
    const filteredTemplates = useMemo(() => {
        if (!templateSearch.trim()) return templates;
        const q = templateSearch.toLowerCase();
        return templates.filter(t =>
            (t.name || t.templateName || '').toLowerCase().includes(q) ||
            (t.body || '').toLowerCase().includes(q) ||
            (t.category || '').toLowerCase().includes(q)
        );
    }, [templates, templateSearch]);

    // Parse variables for selected template
    const { headerVars, bodyVars, allRequiredVars } = useMemo(() => {
        if (!selectedTemplate) return { headerVars: [], bodyVars: [], allRequiredVars: [] };
        const headerText = selectedTemplate.metadata?.headerText || '';
        const hVars = [...headerText.matchAll(/{{(\d+)}}/g)].map(m => m[1]);
        const bVars = [...(selectedTemplate.body || '').matchAll(/{{(\d+)}}/g)].map(m => m[1]);
        return {
            headerVars: hVars,
            bodyVars: bVars,
            allRequiredVars: [...new Set([...hVars, ...bVars])]
        };
    }, [selectedTemplate]);

    // Interpolated live preview text
    const liveBodyPreview = useMemo(() => {
        if (!selectedTemplate?.body) return '';
        let text = selectedTemplate.body;
        bodyVars.forEach(v => {
            const val = variableMappings[v];
            const replacement = val && val.trim() ? val : `{{${v}}}`;
            text = text.replace(new RegExp(`\\{\\{${v}\\}\\}`, 'g'), replacement);
        });
        return text;
    }, [selectedTemplate, variableMappings, bodyVars]);

    const liveHeaderPreview = useMemo(() => {
        if (!selectedTemplate?.metadata?.headerText) return selectedTemplate?.header || null;
        let text = selectedTemplate.metadata.headerText;
        headerVars.forEach(v => {
            const val = variableMappings[v];
            const replacement = val && val.trim() ? val : `{{${v}}}`;
            text = text.replace(new RegExp(`\\{\\{${v}\\}\\}`, 'g'), replacement);
        });
        return text;
    }, [selectedTemplate, variableMappings, headerVars]);

    // Helpers
    const templateType = (selectedTemplate?.type || 'TEXT').toUpperCase();
    const isMediaTemplate = ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(templateType);

    const handleSendCustom = () => {
        const text = messageText.trim();
        if (!text) {
            toast.error("Please enter a message.");
            return;
        }
        onSend({ type: 'text', message: text });
    };

    const handleSendTemplate = () => {
        if (!selectedTemplate) {
            toast.error("Please select a template to send.");
            return;
        }

        // Validate variables
        for (const v of allRequiredVars) {
            const val = variableMappings[v];
            if (!val || val.trim() === '') {
                toast.error(`Please fill in a value for variable {{${v}}}`);
                return;
            }
        }

        // Validate media URL if media template
        if (isMediaTemplate && (!mediaUrl || !mediaUrl.trim())) {
            toast.error(`Please provide a media URL for the ${templateType} header.`);
            return;
        }

        // Construct Meta components payload
        const components = [];

        // Header Component
        if (headerVars.length > 0) {
            components.push({
                type: 'header',
                parameters: headerVars.map(v => ({ type: 'text', text: variableMappings[v] || '-' }))
            });
        } else if (isMediaTemplate && mediaUrl) {
            const mType = templateType.toLowerCase();
            components.push({
                type: 'header',
                parameters: [
                    {
                        type: mType,
                        [mType]: { link: mediaUrl.trim() }
                    }
                ]
            });
        }

        // Body Component
        if (bodyVars.length > 0) {
            components.push({
                type: 'body',
                parameters: bodyVars.map(v => ({ type: 'text', text: variableMappings[v] || '-' }))
            });
        }

        // Button Components (e.g. Flows)
        if (selectedTemplate.buttons && Array.isArray(selectedTemplate.buttons)) {
            selectedTemplate.buttons.forEach((btn, idx) => {
                if (btn.type === 'FLOW') {
                    components.push({
                        type: 'button',
                        sub_type: 'flow',
                        index: idx.toString(),
                        parameters: [
                            {
                                type: 'action',
                                action: {
                                    flow_token: `token_${Date.now()}`
                                }
                            }
                        ]
                    });
                }
            });
        }

        onSend({
            type: 'template',
            template: {
                name: selectedTemplate.templateName || selectedTemplate.name,
                language: { code: selectedTemplate.language || 'en_US' },
                components
            }
        });
    };

    const insertCustomToken = (token) => {
        setMessageText(prev => prev + (prev.endsWith(' ') || prev === '' ? '' : ' ') + token + ' ');
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl sm:max-w-3xl p-0 overflow-hidden border-border bg-card shadow-2xl rounded-2xl">
                {/* Header */}
                <div className="p-5 border-b border-border/50 bg-muted/20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 shadow-xs">
                                <MessageSquare className="w-5 h-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                                    <span>Send WhatsApp Message</span>
                                </DialogTitle>
                                <DialogDescription asChild>
                                    <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                                        <span>Recipient:</span>
                                        <span className="font-semibold text-foreground">{targetContact.name || contactName}</span>
                                        {targetContact.phone && (
                                            <Badge variant="outline" className="text-[10px] font-mono h-4 py-0 px-1.5 bg-background">
                                                {targetContact.phone}
                                            </Badge>
                                        )}
                                    </div>
                                </DialogDescription>
                            </div>
                        </div>

                        {/* Mode Switcher Tabs */}
                        <Tabs value={mode} onValueChange={setMode} className="w-auto">
                            <TabsList className="h-9 p-1 bg-muted/50 border border-border/60 rounded-lg">
                                <TabsTrigger value="template" className="text-xs font-semibold h-7 px-3 gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>Select Template</span>
                                </TabsTrigger>
                                <TabsTrigger value="custom" className="text-xs font-semibold h-7 px-3 gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>Custom Message</span>
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-5">
                    {mode === 'template' ? (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                            {/* Left Column: Template Selection & Variable Inputs */}
                            <div className="md:col-span-7 flex flex-col gap-4">
                                {/* Template Selector */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between text-xs">
                                        <label className="font-bold text-foreground flex items-center gap-1.5">
                                            <span>Select WhatsApp Template</span>
                                        </label>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground gap-1"
                                            onClick={() => executeGetTemplates({ workspaceId, all: true })}
                                            disabled={isLoadingTemplates}
                                            title="Refresh templates from Meta"
                                        >
                                            <RefreshCw className={`w-3 h-3 ${isLoadingTemplates ? 'animate-spin' : ''}`} />
                                            <span>Refresh</span>
                                        </Button>
                                    </div>

                                    {/* Search Templates */}
                                    <div className="relative">
                                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            placeholder="Search templates by name or keyword..."
                                            value={templateSearch}
                                            onChange={(e) => setTemplateSearch(e.target.value)}
                                            className="h-8.5 pl-8 text-xs bg-muted/20 border-border/60 rounded-lg"
                                        />
                                    </div>

                                    {/* Template Scroll List */}
                                    <ScrollArea className="h-40 rounded-lg border border-border/60 p-1.5 bg-background/50">
                                        {isLoadingTemplates ? (
                                            <div className="flex items-center justify-center h-32 gap-2 text-xs text-muted-foreground">
                                                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                                <span>Loading approved templates...</span>
                                            </div>
                                        ) : filteredTemplates.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-32 text-center p-3 text-xs text-muted-foreground">
                                                <p className="font-semibold text-foreground">No templates found</p>
                                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                                    {templates.length === 0 ? "No templates created in this workspace yet." : "No templates match your search."}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-1">
                                                {filteredTemplates.map((tpl) => {
                                                    const isSelected = selectedTemplate?.id === tpl.id;
                                                    return (
                                                        <div
                                                            key={tpl.id}
                                                            onClick={() => setSelectedTemplate(tpl)}
                                                            className={`flex items-center justify-between p-2 rounded-md cursor-pointer text-xs transition-all ${
                                                                isSelected
                                                                    ? 'bg-primary/10 border border-primary/30 text-foreground font-semibold shadow-xs'
                                                                    : 'hover:bg-muted/40 text-foreground/80 border border-transparent'
                                                            }`}
                                                        >
                                                            <div className="min-w-0 flex-1 pr-2">
                                                                <div className="flex items-center gap-2 mb-0.5">
                                                                    <span className="font-bold truncate text-xs">{tpl.name || tpl.templateName}</span>
                                                                    <Badge variant="outline" className="text-[9px] py-0 px-1 h-3.5 opacity-70">
                                                                        {tpl.category || 'UTILITY'}
                                                                    </Badge>
                                                                </div>
                                                                <p className="text-[10px] text-muted-foreground line-clamp-1 truncate opacity-70 font-normal">
                                                                    {tpl.body}
                                                                </p>
                                                            </div>
                                                            {isSelected && (
                                                                <Check className="w-4 h-4 text-primary shrink-0" />
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </ScrollArea>
                                </div>

                                {/* Dynamic Variables Section */}
                                {selectedTemplate && (
                                    <div className="space-y-3 pt-1 border-t border-border/40">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-bold text-foreground">
                                                Template Variables & Media
                                            </label>
                                            <span className="text-[11px] text-muted-foreground">
                                                {allRequiredVars.length} variable{allRequiredVars.length === 1 ? '' : 's'}
                                            </span>
                                        </div>

                                        {/* Media URL Input if Media Template */}
                                        {isMediaTemplate && (
                                            <div className="space-y-1 bg-muted/20 p-2.5 rounded-lg border border-border/40">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                                                        {templateType === 'IMAGE' ? <ImageIcon className="w-3.5 h-3.5 text-blue-500" /> : templateType === 'VIDEO' ? <Video className="w-3.5 h-3.5 text-purple-500" /> : <FileCheck className="w-3.5 h-3.5 text-amber-500" />}
                                                        <span>{templateType} Header URL</span>
                                                    </span>
                                                </div>
                                                <Input
                                                    placeholder={`https://example.com/media.${templateType === 'IMAGE' ? 'jpg' : templateType === 'VIDEO' ? 'mp4' : 'pdf'}`}
                                                    value={mediaUrl}
                                                    onChange={(e) => setMediaUrl(e.target.value)}
                                                    className="h-8 text-xs bg-background"
                                                />
                                            </div>
                                        )}

                                        {/* Variable Inputs */}
                                        {allRequiredVars.length === 0 && !isMediaTemplate ? (
                                            <div className="text-[11.5px] text-muted-foreground italic p-3 bg-muted/15 rounded-lg border border-border/30">
                                                This template has no dynamic variables. It will be delivered exactly as approved.
                                            </div>
                                        ) : (
                                            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                                {allRequiredVars.map((v) => (
                                                    <div key={v} className="space-y-1">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[11px] font-bold text-foreground">
                                                                Variable {`{{${v}}}`}
                                                            </span>
                                                            {/* Quick Auto-Fill Badges */}
                                                            <div className="flex items-center gap-1">
                                                                {targetContact?.name && (
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="cursor-pointer text-[9px] py-0 px-1 h-3.5 hover:bg-primary/10 transition-colors"
                                                                        onClick={() => setVariableMappings(prev => ({ ...prev, [v]: targetContact.name }))}
                                                                        title="Insert Contact Name"
                                                                    >
                                                                        + Name
                                                                    </Badge>
                                                                )}
                                                                {targetContact?.phone && (
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="cursor-pointer text-[9px] py-0 px-1 h-3.5 hover:bg-primary/10 transition-colors"
                                                                        onClick={() => setVariableMappings(prev => ({ ...prev, [v]: targetContact.phone }))}
                                                                        title="Insert Phone"
                                                                    >
                                                                        + Phone
                                                                    </Badge>
                                                                )}
                                                                {targetContact?.category && (
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="cursor-pointer text-[9px] py-0 px-1 h-3.5 hover:bg-primary/10 transition-colors"
                                                                        onClick={() => setVariableMappings(prev => ({ ...prev, [v]: targetContact.category }))}
                                                                        title="Insert Category"
                                                                    >
                                                                        + Category
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <Input
                                                            placeholder={`Value for {{${v}}}...`}
                                                            value={variableMappings[v] || ''}
                                                            onChange={(e) => setVariableMappings(prev => ({ ...prev, [v]: e.target.value }))}
                                                            className="h-8 text-xs bg-muted/20"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Right Column: Live WhatsApp Bubble Preview */}
                            <div className="md:col-span-5 flex flex-col">
                                <label className="text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                                    <span>Live WhatsApp Preview</span>
                                </label>

                                <div className="flex-1 rounded-xl bg-[#0b141a] p-3 flex flex-col justify-start border border-border/40 min-h-[300px] shadow-inner relative overflow-hidden">
                                    {/* WhatsApp Chat Background Subtle Grid */}
                                    <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

                                    {selectedTemplate ? (
                                        <div className="relative z-10 w-full max-w-[280px] bg-[#202c33] text-[#e9edef] rounded-lg rounded-tl-none p-3 shadow-md border border-white/5 space-y-2">
                                            {/* Corner tail */}
                                            <div className="absolute -left-1.5 top-0 w-0 h-0 border-t-8 border-t-[#202c33] border-l-8 border-l-transparent" />

                                            {/* Header Preview */}
                                            {isMediaTemplate && (
                                                <div className="w-full h-28 bg-[#111b21] rounded-md flex items-center justify-center border border-white/10 overflow-hidden relative">
                                                    {mediaUrl ? (
                                                        templateType === 'IMAGE' ? (
                                                            <img src={mediaUrl} alt="Header" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                                                        ) : (
                                                            <div className="flex flex-col items-center gap-1 text-[#8696a0] text-[10px]">
                                                                <Video className="w-6 h-6 text-emerald-400" />
                                                                <span>Video Attached</span>
                                                            </div>
                                                        )
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-1 text-[#8696a0] text-[10px]">
                                                            {templateType === 'IMAGE' ? <ImageIcon className="w-6 h-6 opacity-40" /> : templateType === 'VIDEO' ? <Video className="w-6 h-6 opacity-40" /> : <FileText className="w-6 h-6 opacity-40" />}
                                                            <span>{templateType} Header</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {liveHeaderPreview && !isMediaTemplate && (
                                                <h4 className="text-xs font-bold text-[#e9edef] leading-snug">
                                                    {liveHeaderPreview}
                                                </h4>
                                            )}

                                            {/* Body Text */}
                                            <p className="text-xs leading-relaxed whitespace-pre-wrap text-[#e9edef]/95 break-words">
                                                {liveBodyPreview || selectedTemplate.body}
                                            </p>

                                            {/* Footer Text */}
                                            {selectedTemplate.footer && (
                                                <p className="text-[10px] text-[#8696a0] pt-1">
                                                    {selectedTemplate.footer}
                                                </p>
                                            )}

                                            {/* Interactive Buttons */}
                                            {selectedTemplate.buttons && Array.isArray(selectedTemplate.buttons) && selectedTemplate.buttons.length > 0 && (
                                                <div className="pt-2 border-t border-white/10 space-y-1.5">
                                                    {selectedTemplate.buttons.map((btn, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded bg-[#111b21]/70 text-[#00a884] text-[11px] font-bold border border-white/5"
                                                        >
                                                            {btn.type === 'PHONE_NUMBER' ? <Phone className="w-3 h-3" /> : btn.type === 'URL' ? <ExternalLink className="w-3 h-3" /> : <Workflow className="w-3 h-3" />}
                                                            <span>{btn.text || 'Action Button'}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center flex-1 text-center text-[#8696a0] p-4 text-xs">
                                            <Sparkles className="w-8 h-8 opacity-30 mb-2" />
                                            <p>Select a template to view live preview</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Custom Text Message Mode */
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-foreground">
                                    Direct WhatsApp Message
                                </label>
                                <span className="text-[11px] text-muted-foreground">
                                    {messageText.length} characters
                                </span>
                            </div>

                            <Textarea
                                placeholder={`Hi ${targetContact.name || 'there'}, type your message here...`}
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                className="min-h-[160px] bg-muted/20 border-border/60 text-xs focus:bg-background transition-all leading-relaxed p-3"
                            />

                            {/* Quick Insertion Tokens */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[11px] text-muted-foreground">Insert:</span>
                                {targetContact?.name && (
                                    <Badge
                                        variant="outline"
                                        className="cursor-pointer text-[10px] py-0.5 px-2 hover:bg-primary/10 transition-colors"
                                        onClick={() => insertCustomToken(targetContact.name)}
                                    >
                                        {targetContact.name}
                                    </Badge>
                                )}
                                {targetContact?.phone && (
                                    <Badge
                                        variant="outline"
                                        className="cursor-pointer text-[10px] py-0.5 px-2 hover:bg-primary/10 transition-colors font-mono"
                                        onClick={() => insertCustomToken(targetContact.phone)}
                                    >
                                        {targetContact.phone}
                                    </Badge>
                                )}
                                {targetContact?.category && (
                                    <Badge
                                        variant="outline"
                                        className="cursor-pointer text-[10px] py-0.5 px-2 hover:bg-primary/10 transition-colors"
                                        onClick={() => insertCustomToken(targetContact.category)}
                                    >
                                        {targetContact.category}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <DialogFooter className="p-4 border-t border-border/50 bg-muted/20 flex items-center justify-between sm:justify-between">
                    <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} disabled={isSending}>
                        Cancel
                    </Button>

                    <Button
                        onClick={mode === 'template' ? handleSendTemplate : handleSendCustom}
                        disabled={isSending || (mode === 'template' ? !selectedTemplate : !messageText.trim())}
                        className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md font-bold text-xs h-9 px-4"
                    >
                        {isSending ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Sending via WhatsApp...</span>
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                <span>{mode === 'template' ? 'Send Template Message' : 'Send Direct Message'}</span>
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
