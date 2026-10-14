'use client';

import React, { useState, useEffect } from 'react';
import {
    X,
    Plus,
    Trash2,
    Sparkles,
    Smartphone,
    Layers,
    Save,
    Loader2,
    ExternalLink,
    Phone,
    CornerDownLeft,
    Tag,
    FolderPlus
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription
} from "@/components/ui/sheet";
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import TemplatePreview from './TemplatePreview';
import { saveTemplateAction } from '../../_actions/template-actions';

const DEFAULT_FORM_DATA = {
    name: '',
    category: 'MARKETING',
    language: 'en_US',
    headerType: 'NONE',
    headerText: '',
    headerMedia: '',
    body: '',
    footer: '',
    buttons: [],
    sampleValues: {},
    groupId: ''
};

export default function TemplateBuilder({
    isOpen,
    onClose,
    initialData,
    workspaceId,
    groups = [],
    onTemplateSaved,
    onOpenManageGroups
}) {
    const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('editor'); // editor | preview on small screens

    useEffect(() => {
        if (initialData) {
            setFormData({
                id: initialData.id,
                name: initialData.name || '',
                category: initialData.category || 'MARKETING',
                language: initialData.language || 'en_US',
                headerType: initialData.headerType || 'NONE',
                headerText: initialData.headerText || '',
                headerMedia: initialData.headerMedia || '',
                body: initialData.body || '',
                footer: initialData.footer || '',
                buttons: Array.isArray(initialData.buttons) ? initialData.buttons : [],
                sampleValues: initialData.sampleValues || {},
                groupId: initialData.groupId || ''
            });
        } else {
            setFormData(DEFAULT_FORM_DATA);
        }
    }, [initialData, isOpen]);

    // Extract variables from body & header
    const detectedVariables = Array.from(
        new Set(
            (`${formData.headerText || ''} ${formData.body || ''}`.match(/\{\{([^}]+)\}\}/g) || [])
                .map(v => v.replace(/[{}]/g, '').trim())
        )
    );

    // Insert variable tag into body at cursor
    const handleInsertVariable = (varName) => {
        const tag = `{{${varName}}}`;
        setFormData(prev => ({
            ...prev,
            body: prev.body + (prev.body.endsWith(' ') || prev.body === '' ? '' : ' ') + tag + ' '
        }));
    };

    // Add button
    const handleAddButton = () => {
        if (formData.buttons.length >= 3) {
            toast.error("Maximum 3 interactive buttons allowed per template");
            return;
        }
        setFormData(prev => ({
            ...prev,
            buttons: [
                ...prev.buttons,
                { type: 'QUICK_REPLY', text: `Option ${prev.buttons.length + 1}`, value: '' }
            ]
        }));
    };

    // Remove button
    const handleRemoveButton = (index) => {
        setFormData(prev => ({
            ...prev,
            buttons: prev.buttons.filter((_, idx) => idx !== index)
        }));
    };

    // Update button field
    const handleUpdateButton = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            buttons: prev.buttons.map((b, idx) => idx === index ? { ...b, [field]: value } : b)
        }));
    };

    // Save Template
    const handleSave = async (e) => {
        e?.preventDefault();
        if (!formData.name?.trim()) {
            toast.error("Please enter a template name");
            return;
        }
        if (!formData.body?.trim()) {
            toast.error("Please write the message body");
            return;
        }

        setIsSaving(true);
        try {
            const res = await saveTemplateAction(workspaceId, formData);
            if (!res.success) throw new Error(res.error);

            toast.success(formData.id ? "Template updated successfully!" : "Template created and ready to use!");
            if (onTemplateSaved) onTemplateSaved(res.template);
            onClose();
        } catch (err) {
            toast.error(err.message || "Failed to save template");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="right" className="w-full sm:max-w-4xl p-0 bg-background border-border/40 text-foreground flex flex-col h-full overflow-hidden">
                {/* Header */}
                <SheetHeader className="p-4 border-b border-border/30 bg-card/40 flex flex-row items-center justify-between shrink-0">
                    <div>
                        <div className="flex items-center gap-2">
                            <SheetTitle className="text-base font-bold text-foreground">
                                {formData.id ? "Edit Message Template" : "Create New Message Template"}
                            </SheetTitle>
                            <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                                Instant Ready
                            </Badge>
                        </div>
                        <SheetDescription className="text-xs text-muted-foreground mt-0.5">
                            Craft customized WhatsApp messages with variables, media headers, and quick reply buttons.
                        </SheetDescription>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="h-8 text-xs text-muted-foreground"
                        >
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={isSaving}
                            className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-1.5 rounded-xl shadow-md"
                        >
                            {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                            <span>Save Template</span>
                        </Button>
                    </div>
                </SheetHeader>

                {/* Main Content: Split Editor & Live Phone Preview */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Left Pane: Builder Controls */}
                    <ScrollArea className="flex-1 border-r border-border/30 p-5 space-y-5">
                        <form onSubmit={handleSave} className="space-y-5 max-w-xl">
                            {/* Template Name & Category */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-foreground">
                                        Template Name *
                                    </Label>
                                    <Input
                                        placeholder="e.g. order_confirmed, welcome_offer"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="h-9 text-xs bg-card/50 border-border/50 rounded-xl font-mono"
                                        required
                                    />
                                    <p className="text-[10px] text-muted-foreground">Unique identifier (auto-formatted).</p>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-foreground">
                                        Category
                                    </Label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={(val) => setFormData({ ...formData, category: val })}
                                    >
                                        <SelectTrigger className="h-9 text-xs bg-card/50 border-border/50 rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MARKETING">Marketing (Offers, Announcements)</SelectItem>
                                            <SelectItem value="UTILITY">Utility (Order, Account, Invoices)</SelectItem>
                                            <SelectItem value="AUTHENTICATION">Authentication (OTP, Verification)</SelectItem>
                                            <SelectItem value="GREETING">Greeting & Welcome</SelectItem>
                                            <SelectItem value="REMINDER">Appointment & Due Date Reminder</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Group Assignment & Language */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs font-semibold text-foreground">
                                            Folder / Group
                                        </Label>
                                        {onOpenManageGroups && (
                                            <button
                                                type="button"
                                                onClick={onOpenManageGroups}
                                                className="text-[10px] text-emerald-500 hover:underline flex items-center gap-1"
                                            >
                                                <FolderPlus size={10} />
                                                Manage Groups
                                            </button>
                                        )}
                                    </div>
                                    <Select
                                        value={formData.groupId || 'none'}
                                        onValueChange={(val) => setFormData({ ...formData, groupId: val === 'none' ? null : val })}
                                    >
                                        <SelectTrigger className="h-9 text-xs bg-card/50 border-border/50 rounded-xl">
                                            <SelectValue placeholder="Ungrouped" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Ungrouped (General)</SelectItem>
                                            {groups.map(g => (
                                                <SelectItem key={g.id} value={g.id}>
                                                    {g.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-foreground">
                                        Language
                                    </Label>
                                    <Select
                                        value={formData.language}
                                        onValueChange={(val) => setFormData({ ...formData, language: val })}
                                    >
                                        <SelectTrigger className="h-9 text-xs bg-card/50 border-border/50 rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="en_US">English (en_US)</SelectItem>
                                            <SelectItem value="hi_IN">Hindi (hi_IN)</SelectItem>
                                            <SelectItem value="es_ES">Spanish (es_ES)</SelectItem>
                                            <SelectItem value="pt_BR">Portuguese (pt_BR)</SelectItem>
                                            <SelectItem value="ar_SA">Arabic (ar_SA)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Header Options */}
                            <div className="space-y-2 p-3.5 rounded-2xl bg-card/30 border border-border/40">
                                <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                    <span>Header Format</span>
                                    <span className="text-[10px] text-muted-foreground font-normal">(Optional)</span>
                                </Label>
                                <Select
                                    value={formData.headerType}
                                    onValueChange={(val) => setFormData({ ...formData, headerType: val })}
                                >
                                    <SelectTrigger className="h-8 text-xs bg-background/50 border-border/50 rounded-lg">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="NONE">None (No Header)</SelectItem>
                                        <SelectItem value="TEXT">Text Title</SelectItem>
                                        <SelectItem value="IMAGE">Image Header (URL)</SelectItem>
                                        <SelectItem value="VIDEO">Video Header (URL)</SelectItem>
                                        <SelectItem value="DOCUMENT">Document PDF</SelectItem>
                                    </SelectContent>
                                </Select>

                                {formData.headerType === 'TEXT' && (
                                    <Input
                                        placeholder="Header bold text title..."
                                        value={formData.headerText}
                                        onChange={(e) => setFormData({ ...formData, headerText: e.target.value })}
                                        className="h-8 text-xs bg-background/50 border-border/50 rounded-lg mt-2 font-bold"
                                    />
                                )}

                                {['IMAGE', 'VIDEO', 'DOCUMENT'].includes(formData.headerType) && (
                                    <Input
                                        placeholder={`Enter direct ${formData.headerType.toLowerCase()} media URL...`}
                                        value={formData.headerMedia}
                                        onChange={(e) => setFormData({ ...formData, headerMedia: e.target.value })}
                                        className="h-8 text-xs bg-background/50 border-border/50 rounded-lg mt-2 font-mono"
                                    />
                                )}
                            </div>

                            {/* Body Textarea with Variable Inserters */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-semibold text-foreground">
                                        Message Body *
                                    </Label>
                                    <span className="text-[10px] text-muted-foreground font-mono">
                                        {formData.body.length} chars
                                    </span>
                                </div>

                                <Textarea
                                    placeholder="Type your message body here. Use {{1}}, {{2}} or {{name}}, {{amount}} for dynamic fields..."
                                    value={formData.body}
                                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                                    rows={5}
                                    className="text-xs bg-card/50 border-border/50 rounded-xl leading-relaxed resize-y font-sans"
                                    required
                                />

                                {/* Variable insertion helper pills */}
                                <div className="flex items-center flex-wrap gap-1.5 pt-1">
                                    <span className="text-[10px] text-muted-foreground font-medium mr-1">Insert variable:</span>
                                    {['1', '2', 'name', 'company', 'date', 'amount'].map(v => (
                                        <button
                                            key={v}
                                            type="button"
                                            onClick={() => handleInsertVariable(v)}
                                            className="px-2 py-0.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 text-[10px] font-mono transition-colors"
                                        >
                                            + {`{{${v}}}`}
                                        </button>
                                    ))}
                                </div>

                                {/* Detected Variables List */}
                                {detectedVariables.length > 0 && (
                                    <div className="p-2.5 rounded-xl bg-card/20 border border-border/30 flex items-center gap-2 flex-wrap text-xs">
                                        <span className="text-[10px] text-muted-foreground">Detected tags:</span>
                                        {detectedVariables.map(v => (
                                            <Badge key={v} variant="secondary" className="text-[9px] font-mono bg-primary/10 text-primary">
                                                {`{{${v}}}`}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Footer Text */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                                    <span>Footer Note</span>
                                    <span className="text-[10px] text-muted-foreground font-normal">(Optional)</span>
                                </Label>
                                <Input
                                    placeholder="e.g. Reply STOP to unsubscribe or Visit devlomatix.com"
                                    value={formData.footer}
                                    onChange={(e) => setFormData({ ...formData, footer: e.target.value })}
                                    className="h-8 text-xs bg-card/50 border-border/50 rounded-xl"
                                />
                            </div>

                            {/* Interactive Buttons */}
                            <div className="space-y-3 pt-1">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                        <span>Interactive Buttons</span>
                                        <Badge variant="outline" className="text-[9px] px-1 py-0 border-border/50">
                                            {formData.buttons.length}/3
                                        </Badge>
                                    </Label>
                                    {formData.buttons.length < 3 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleAddButton}
                                            className="h-7 text-xs border-dashed border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10 gap-1 rounded-lg"
                                        >
                                            <Plus size={12} />
                                            <span>Add Button</span>
                                        </Button>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    {formData.buttons.map((btn, idx) => (
                                        <div
                                            key={idx}
                                            className="p-3 rounded-xl bg-card/30 border border-border/40 space-y-2"
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2 flex-1">
                                                    <Select
                                                        value={btn.type || 'QUICK_REPLY'}
                                                        onValueChange={(val) => handleUpdateButton(idx, 'type', val)}
                                                    >
                                                        <SelectTrigger className="h-7 text-xs w-36 bg-background/50 border-border/50 rounded-lg">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="QUICK_REPLY">Quick Reply</SelectItem>
                                                            <SelectItem value="URL">Visit Website</SelectItem>
                                                            <SelectItem value="PHONE_NUMBER">Call Phone</SelectItem>
                                                        </SelectContent>
                                                    </Select>

                                                    <Input
                                                        placeholder="Button text label..."
                                                        value={btn.text || ''}
                                                        onChange={(e) => handleUpdateButton(idx, 'text', e.target.value)}
                                                        className="h-7 text-xs bg-background/50 border-border/50 rounded-lg flex-1"
                                                    />
                                                </div>

                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleRemoveButton(idx)}
                                                    className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                                >
                                                    <Trash2 size={13} />
                                                </Button>
                                            </div>

                                            {btn.type === 'URL' && (
                                                <Input
                                                    placeholder="https://yourwebsite.com/offer"
                                                    value={btn.value || ''}
                                                    onChange={(e) => handleUpdateButton(idx, 'value', e.target.value)}
                                                    className="h-7 text-xs bg-background/50 border-border/50 rounded-lg font-mono"
                                                />
                                            )}

                                            {btn.type === 'PHONE_NUMBER' && (
                                                <Input
                                                    placeholder="+919712340450"
                                                    value={btn.value || ''}
                                                    onChange={(e) => handleUpdateButton(idx, 'value', e.target.value)}
                                                    className="h-7 text-xs bg-background/50 border-border/50 rounded-lg font-mono"
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </form>
                    </ScrollArea>

                    {/* Right Pane: Live WhatsApp Phone Simulator */}
                    <div className="w-80 md:w-96 bg-muted/10 p-5 flex flex-col items-center justify-center shrink-0 border-l border-border/20 overflow-y-auto">
                        <div className="mb-2 text-center">
                            <span className="text-[11px] font-bold text-foreground">Live WhatsApp Simulation</span>
                            <p className="text-[10px] text-muted-foreground">Renders exactly as seen on customer phones</p>
                        </div>
                        <TemplatePreview template={formData} showDeviceFrame={true} />
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
