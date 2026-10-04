'use client';

import React, { useState, useEffect } from 'react';
import {
    Plus,
    X,
    Trash2,
    Sparkles,
    Smartphone,
    ImageIcon,
    Video,
    List,
    MapPin,
    Loader2,
    Globe,
    Phone,
    MessageSquare,
    Workflow
} from 'lucide-react';
import { toast } from 'sonner';
import { useAction } from '@/hooks/use-action';
import { getTemplateAiSuggestion } from '../_actions/get-template-ai-suggestion';
import { getFlows } from '../../flows/_actions/get-flows';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
    SheetDescription,
    SheetHeader,
    SheetTitle
} from "@/components/ui/sheet";
import { ScrollArea } from '@/components/ui/scroll-area';
import { useModal } from '@/hooks/useModal';
import TemplatePreview from './TemplatePreview';

function extractFlowScreens(flow) {
    if (!flow) return [{ id: "WELCOME", title: "Welcome Screen" }];
    let list = [];

    // 1. Definition screens (exact uploaded Meta JSON)
    if (flow.definition) {
        const def = typeof flow.definition === 'string' ? (() => { try { return JSON.parse(flow.definition); } catch (e) { return null; } })() : flow.definition;
        if (Array.isArray(def?.screens) && def.screens.length > 0) {
            list = def.screens.map((s, idx) => {
                if (typeof s === 'string') return { id: s.trim(), title: s.trim() };
                const sid = String(s.id || s.name || `SCREEN_${idx + 1}`).trim();
                return { id: sid, title: s.title || sid };
            }).filter(Boolean);
            if (list.length > 0) return list;
        }
    }

    // 2. Local builder screens
    let rawScreens = [];
    if (Array.isArray(flow.screens)) {
        rawScreens = flow.screens;
    } else if (typeof flow.screens === 'string') {
        try { rawScreens = JSON.parse(flow.screens); } catch (e) {}
    }

    if (Array.isArray(rawScreens) && rawScreens.length > 0) {
        list = rawScreens.map((s, idx) => {
            if (typeof s === 'string') return { id: s.trim(), title: s.trim() };
            const rawId = String(s.id || s.sanitizedId || s.name || `SCREEN_${idx + 1}`).trim();
            return { id: rawId, title: s.title || rawId || `Screen ${idx + 1}` };
        }).filter(Boolean);
    }

    if (list.length === 0) {
        list = [{ id: "WELCOME", title: "Welcome Screen" }];
    }

    return list;
}

export default function TemplateBuilder({
    isOpen,
    onClose,
    formData,
    setFormData,
    onSave,
    editingId,
    isSaving,
    isSubmittingId,
    workspaceId,
    groups = [],
    onOpenManageGroups
}) {
    const { onOpen } = useModal();
    const [aiPrompt, setAiPrompt] = useState('');
    const normalizedType = (formData.type || 'text').toLowerCase();

    const { execute: executeGetAiSuggestion, isLoading: isAiGenerating } = useAction(getTemplateAiSuggestion, {
        onSuccess: (data, context) => {
            if (context.type === 'translate' && data.success) {
                setFormData({ ...formData, body: data.translatedText });
                toast.success(`Translated to ${formData.language}!`);
            } else if (data.success && data.suggestion) {
                const { suggestion } = data;
                setFormData({
                    ...formData,
                    name: suggestion.displayName || formData.name,
                    templateName: suggestion.name || formData.templateName,
                    category: suggestion.category || formData.category,
                    body: suggestion.body || formData.body,
                    footer: suggestion.footer || formData.footer,
                    buttons: suggestion.buttons || formData.buttons
                });
                toast.success("AI generated a template for you!");
            }
        },
        onError: (err) => toast.error(err || "AI Assistance failed")
    });

    const [flows, setFlows] = useState([]);
    const [isLoadingFlows, setIsLoadingFlows] = useState(false);

    const { execute: executeGetFlows } = useAction(getFlows, {
        onSuccess: (data) => {
            const fetchedFlows = data.flows || [];
            setFlows(fetchedFlows);
            setIsLoadingFlows(false);

            // Auto-heal existing FLOW buttons that might be missing or have mismatched navigate_screen
            setFormData(prev => {
                if (!prev.buttons || !Array.isArray(prev.buttons)) return prev;
                let hasChanges = false;
                const updatedButtons = prev.buttons.map(b => {
                    if (b && b.type === 'FLOW') {
                        const match = fetchedFlows.find(f => (f.flowId && f.flowId === b.flow_id) || (f.id && f.id === b.selected_flow_id));
                        if (match) {
                            const screens = extractFlowScreens(match);
                            const matchedScreen = screens.find(s => s.id === b.navigate_screen) || 
                                                  screens.find(s => s.id.toLowerCase() === (b.navigate_screen || '').toLowerCase());
                            const correctScreen = matchedScreen ? matchedScreen.id : (screens[0]?.id || 'WELCOME');
                            
                            if (b.navigate_screen !== correctScreen || !b.selected_flow_id || b.flow_cta) {
                                hasChanges = true;
                                const updated = { 
                                    ...b, 
                                    selected_flow_id: match.id, 
                                    flow_id: match.flowId || b.flow_id, 
                                    navigate_screen: correctScreen, 
                                    flow_action: 'navigate' 
                                };
                                delete updated.flow_cta;
                                return updated;
                            }
                        }
                    }
                    return b;
                });
                return hasChanges ? { ...prev, buttons: updatedButtons } : prev;
            });
        },
        onError: () => {
            setIsLoadingFlows(false);
        }
    });

    useEffect(() => {
        if (isOpen && workspaceId) {
            setIsLoadingFlows(true);
            executeGetFlows({ workspaceId });
        }
    }, [isOpen, workspaceId]);

    const buttonTypes = [
        { value: 'QUICK_REPLY', label: 'Custom', icon: MessageSquare },
        { value: 'URL', label: 'Visit Website', icon: Globe },
        { value: 'PHONE_NUMBER', label: 'Call Phone Number', icon: Phone },
        { value: 'FLOW', label: 'Complete Flow', icon: Workflow },
    ];

    const handleButtonChange = (index, field, value) => {
        const newButtons = [...formData.buttons];
        const btn = typeof newButtons[index] === 'object' ? { ...newButtons[index] } : { type: 'QUICK_REPLY', text: newButtons[index] || '' };
        btn[field] = value;
        newButtons[index] = btn;
        setFormData({ ...formData, buttons: newButtons });
    };

    const addButton = () => {
        if (formData.buttons.length < 3) {
            setFormData({ ...formData, buttons: [...formData.buttons, { type: 'QUICK_REPLY', text: '' }] });
        }
    };

    const removeButton = (index) => {
        const newButtons = formData.buttons.filter((_, i) => i !== index);
        if (newButtons.length === 0) newButtons.push({ type: 'QUICK_REPLY', text: '' });
        setFormData({ ...formData, buttons: newButtons });
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="w-full sm:max-w-[700px] p-2 flex flex-col gap-0 border-0 border-border bg-transparent overflow-hidden">
                <div className='flex flex-col h-full border bg-card rounded-md overflow-hidden min-w-0 w-full'>


                    {/* Panel Header */}
                    <SheetHeader className="px-6 py-4 border-b border-border bg-muted/30 text-left shrink-0">
                        <SheetTitle className="text-lg font-semibold text-foreground">
                            {editingId ? 'Edit Template' : 'Create Template'}
                        </SheetTitle>
                        <SheetDescription className="text-xs text-muted-foreground">
                            Configure your WhatsApp message template content and interactive elements.
                        </SheetDescription>
                    </SheetHeader>

                    <ScrollArea className="flex-1 min-h-0 overflow-hidden">
                        <div className="p-5 space-y-4 min-w-0 w-full">


                            {/* AI Assistant Section */}
                            {/* <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3 relative overflow-hidden group">
                                <div className="flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-primary/10 p-1.5 rounded-lg">
                                            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-foreground">AI Ghostwriter</h4>
                                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Powered by Gemini 1.5</p>
                                        </div>
                                    </div>
                                    {isAiGenerating ? (
                                        <Loader2 className="w-4 h-4 text-primary animate-spin" />
                                    ) : (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-7 text-[11px] font-bold text-primary hover:bg-primary/10"
                                            onClick={() => {
                                                if (!aiPrompt) return;
                                                executeGetAiSuggestion({ workspaceId, prompt: aiPrompt, type: 'generate' });
                                            }}
                                        >
                                            Generate
                                        </Button>
                                    )}
                                </div>
                                <div className="relative z-10">
                                    <Input
                                        placeholder="Describe your template (e.g. 'Flash sale for weekend')..."
                                        className="h-9 bg-background/50 border-primary/10 text-xs focus-visible:ring-primary/20"
                                        value={aiPrompt}
                                        onChange={(e) => setAiPrompt(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                                    />
                                </div>
                                
                                <div className="absolute -right-4 -top-4 w-12 h-12 bg-primary/20 blur-2xl rounded-full group-hover:bg-primary/30 transition-all duration-700" />
                            </div> */}

                            {/* Basic Info */}
                            <div className="space-y-4">
                                <div className={`grid grid-cols-1 ${!editingId ? 'md:grid-cols-2' : ''} gap-4`}>
                                    <div>
                                        <label className="text-sm font-semibold text-foreground mb-1.5 block">Display Name</label>
                                        <Input
                                            placeholder="e.g. Welcome Message"
                                            value={formData.name || ''}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                const updates = { name: value };
                                                if (!editingId && !formData._customApiName) {
                                                    updates.templateName = value.toLowerCase().replace(/[^a-z0-9_]/g, '_');
                                                }
                                                setFormData({ ...formData, ...updates });
                                            }}
                                            className="bg-background border-border" />
                                    </div>

                                    {!editingId && (
                                        <div>
                                            <label className="text-sm font-semibold text-foreground mb-1.5 block">API Name (Meta)</label>
                                            <Input
                                                placeholder="welcome_message"
                                                value={formData.templateName || ''}
                                                onChange={(e) => {
                                                    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_');
                                                    setFormData({ ...formData, templateName: value, _customApiName: true });
                                                }}
                                                className="bg-background border-border font-mono text-xs" />
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {!editingId && (
                                        <div>
                                            <label className="text-xs font-semibold text-foreground mb-1.5 block">Category</label>
                                            <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                                                <SelectTrigger className="bg-background border-border">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="UTILITY">Utility</SelectItem>
                                                    <SelectItem value="MARKETING">Marketing</SelectItem>
                                                    <SelectItem value="AUTHENTICATION">Authentication</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <label className="text-sm font-semibold text-foreground mb-1.5 flex items-center justify-between">
                                            Language
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-5 px-1.5 text-[9px] text-primary hover:text-primary hover:bg-primary/10 uppercase font-bold"
                                                onClick={() => {
                                                    if (!formData.body) return;
                                                    executeGetAiSuggestion({
                                                        workspaceId,
                                                        type: 'translate',
                                                        text: formData.body,
                                                        targetLanguage: formData.language
                                                    }, { type: 'translate' });
                                                }}
                                            >
                                                <Sparkles className="w-2.5 h-2.5 mr-1" /> Translate Content
                                            </Button>
                                        </label>
                                        <Select value={formData.language} onValueChange={(v) => setFormData({ ...formData, language: v })}>
                                            <SelectTrigger className="bg-background border-border">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="en_US">English (US)</SelectItem>
                                                <SelectItem value="en_GB">English (UK)</SelectItem>
                                                <SelectItem value="es">Spanish</SelectItem>
                                                <SelectItem value="fr">French</SelectItem>
                                                <SelectItem value="hi">Hindi</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-foreground mb-1.5 flex items-center justify-between">
                                        <span>Template Group (Folder)</span>
                                        {onOpenManageGroups && (
                                            <button
                                                type="button"
                                                onClick={onOpenManageGroups}
                                                className="text-[11px] text-primary hover:underline font-semibold"
                                            >
                                                + Manage Groups
                                            </button>
                                        )}
                                    </label>
                                    <Select
                                        value={formData.metadata?.groupId || 'NONE'}
                                        onValueChange={(val) => {
                                            const currentMeta = { ...(formData.metadata || {}) };
                                            if (val === 'NONE') {
                                                delete currentMeta.groupId;
                                                delete currentMeta.groupName;
                                                delete currentMeta.groupColor;
                                            } else {
                                                const foundGrp = groups.find(g => g.id === val);
                                                if (foundGrp) {
                                                    currentMeta.groupId = foundGrp.id;
                                                    currentMeta.groupName = foundGrp.name;
                                                    currentMeta.groupColor = foundGrp.color || '#3b82f6';
                                                }
                                            }
                                            setFormData({ ...formData, metadata: currentMeta });
                                        }}
                                    >
                                        <SelectTrigger className="bg-background border-border">
                                            <SelectValue placeholder="Select group (optional)" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card border-border">
                                            <SelectItem value="NONE">
                                                <span className="flex items-center gap-2 text-muted-foreground">
                                                    <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                                                    No Group (Ungrouped)
                                                </span>
                                            </SelectItem>
                                            {groups.map((grp) => (
                                                <SelectItem key={grp.id} value={grp.id}>
                                                    <span className="flex items-center gap-2">
                                                        <span
                                                            className="w-2.5 h-2.5 rounded-full shrink-0"
                                                            style={{ backgroundColor: grp.color || '#3b82f6' }}
                                                        />
                                                        {grp.name}
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {!editingId && (
                                    <div>
                                        <label className="text-sm font-semibold text-foreground mb-1.5 block">Message Type</label>
                                        <Select
                                            value={normalizedType}
                                            onValueChange={(v) => {
                                                let newMetadata = { ...formData.metadata };
                                                if (v === 'interactive-group' && (!newMetadata.listSections || newMetadata.listSections.length === 0)) {
                                                    newMetadata.listSections = [{ title: 'Options', rows: [{ title: '', description: '' }] }];
                                                    newMetadata.listButton = 'Select Option';
                                                }
                                                if (v === 'carousel' && (!newMetadata.cards || newMetadata.cards.length === 0)) {
                                                    newMetadata.cards = [{ body: '', buttons: [''] }];
                                                }
                                                setFormData({ ...formData, type: v, metadata: newMetadata });
                                            }}>
                                            <SelectTrigger className="bg-background border-border">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="text">Standard Text</SelectItem>
                                                <SelectItem value="image">Image</SelectItem>
                                                <SelectItem value="video">Video</SelectItem>
                                                <SelectItem value="audio">Audio</SelectItem>
                                                <SelectItem value="document">Document / PDF</SelectItem>
                                                <SelectItem value="location">Location</SelectItem>
                                                <SelectItem value="interactive-button">Interactive (Buttons)</SelectItem>
                                                <SelectItem value="interactive-group">Interactive (Group)</SelectItem>
                                                <SelectItem value="carousel">Template / Carousel (Advanced)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>

                            <hr className="border-border" />

                            {/* Media/Location Sections (extracted for brevity in this example but would be present fully) */}
                            {/* Media/Location Sections */}
                            {['image', 'video', 'audio', 'document'].includes(normalizedType) && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-semibold text-foreground capitalize">{normalizedType} Header URL</label>
                                        <div className="flex items-center gap-1.5">
                                            {formData.metadata?.mediaUrl && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 text-[10px] text-muted-foreground hover:text-destructive uppercase font-bold"
                                                    onClick={() => setFormData({
                                                        ...formData,
                                                        metadata: { ...(formData.metadata || {}), mediaUrl: '' }
                                                    })}
                                                >
                                                    Clear
                                                </Button>
                                            )}
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 text-[10px] text-primary hover:text-primary hover:bg-primary/10 uppercase font-bold flex items-center gap-1 px-2"
                                                onClick={() => onOpen('mediaLibrary', {
                                                    workspaceId,
                                                    onSelect: (url) => setFormData({
                                                        ...formData,
                                                        metadata: { ...(formData.metadata || {}), mediaUrl: url }
                                                    })
                                                })}
                                            >
                                                <ImageIcon className="w-3 h-3" />
                                                <span>Choose from Hub</span>
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 items-start">
                                        {formData.metadata?.mediaUrl ? (
                                            <div className="w-12 h-12 rounded-md border border-border overflow-hidden bg-muted shrink-0 relative">
                                                {normalizedType === 'image' ? (
                                                    <img
                                                        src={formData.metadata.mediaUrl}
                                                        alt="Header Media"
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                        <ImageIcon className="w-5 h-5" />
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div
                                                onClick={() => onOpen('mediaLibrary', {
                                                    workspaceId,
                                                    onSelect: (url) => setFormData({
                                                        ...formData,
                                                        metadata: { ...(formData.metadata || {}), mediaUrl: url }
                                                    })
                                                })}
                                                className="w-12 h-12 rounded-md border border-dashed border-border/80 hover:border-primary hover:bg-primary/5 flex flex-col items-center justify-center cursor-pointer transition-colors shrink-0 text-muted-foreground hover:text-primary"
                                                title="Choose from Media Hub"
                                            >
                                                <ImageIcon className="w-4 h-4" />
                                                <span className="text-[8px] mt-0.5 font-medium">Hub</span>
                                            </div>
                                        )}
                                        <Textarea
                                            placeholder={`https://... (paste ${normalizedType} URL or choose from Hub)`}
                                            value={formData.metadata?.mediaUrl || ''}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                metadata: { ...(formData.metadata || {}), mediaUrl: e.target.value }
                                            })}
                                            rows={2}
                                            className="h-12 min-h-[48px] text-[11px] font-mono leading-tight resize-none py-1.5 px-2 bg-background border-border break-all whitespace-pre-wrap flex-1 min-w-0"
                                        />
                                    </div>
                                </div>
                            )}

                            {normalizedType === 'location' && (
                                <div className="space-y-4 bg-muted/20 p-4 rounded-xl border border-border min-w-0 w-full overflow-hidden">
                                    <div className="flex items-center gap-2 mb-2 text-primary">
                                        <Smartphone className="w-4 h-4" />
                                        <h4 className="text-xs font-bold uppercase tracking-wider">Location Metadata</h4>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="min-w-0">
                                            <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">Latitude</label>
                                            <Input
                                                placeholder="e.g. 28.6139"
                                                value={formData.metadata?.latitude || ''}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    metadata: { ...(formData.metadata || {}), latitude: e.target.value }
                                                })}
                                                className="h-9 bg-background min-w-0 w-full"
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">Longitude</label>
                                            <Input
                                                placeholder="e.g. 77.2090"
                                                value={formData.metadata?.longitude || ''}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    metadata: { ...(formData.metadata || {}), longitude: e.target.value }
                                                })}
                                                className="h-9 bg-background min-w-0 w-full"
                                            />
                                        </div>
                                    </div>
                                    <div className="min-w-0">
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">Location Name</label>
                                        <Input
                                            placeholder="e.g. Devlomatix Solutions"
                                            value={formData.metadata?.locationName || ''}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                metadata: { ...(formData.metadata || {}), locationName: e.target.value }
                                            })}
                                            className="h-9 bg-background min-w-0 w-full"
                                        />
                                    </div>
                                    <div className="min-w-0">
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">Address</label>
                                        <Input
                                            placeholder="Full address..."
                                            value={formData.metadata?.address || ''}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                metadata: { ...(formData.metadata || {}), address: e.target.value }
                                            })}
                                            className="h-9 bg-background min-w-0 w-full"
                                        />
                                    </div>
                                    <div className="min-w-0">
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block text-primary">Google Places ID (Optional)</label>
                                        <Input
                                            placeholder="ChIJa5S5..."
                                            value={formData.metadata?.googlePlaceId || ''}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                metadata: { ...(formData.metadata || {}), googlePlaceId: e.target.value }
                                            })}
                                            className="h-9 bg-background border-primary/20 focus-visible:ring-primary/30 min-w-0 w-full"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Header Text Section */}
                            {(['text', 'interactive-button', 'interactive-group', 'carousel'].includes(normalizedType) || !normalizedType) && (
                                <div className="space-y-1.5 min-w-0 w-full">
                                    <label className="text-sm font-semibold text-foreground flex items-center justify-between">
                                        <span>Header Text (Optional)</span>
                                        <span className="text-xs text-muted-foreground font-normal">Max 60 chars</span>
                                    </label>
                                    <Textarea
                                        rows={2}
                                        placeholder="Add a bold title..."
                                        value={formData.metadata?.headerText || ''}
                                        maxLength={60}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            metadata: { ...(formData.metadata || {}), headerText: e.target.value }
                                        })}
                                        className="bg-background border-border font-bold text-xs resize-none min-w-0 w-full break-all whitespace-pre-wrap leading-normal py-2"
                                    />
                                </div>
                            )}

                            {/* Interactive Group / List Section */}
                            {normalizedType === 'interactive-group' && (
                                <div className="space-y-4 bg-primary/5 p-4 rounded-xl border border-primary/10 min-w-0 w-full overflow-hidden">
                                    <div className="flex items-center gap-2 mb-2 text-primary">
                                        <List className="w-4 h-4" />
                                        <h4 className="text-xs font-bold uppercase tracking-wider">List Configuration</h4>
                                    </div>
                                    <div className="min-w-0 w-full">
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">Menu Button Text</label>
                                        <Input
                                            placeholder="e.g. Select Option"
                                            value={formData.metadata?.listButton || 'Select Option'}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                metadata: { ...(formData.metadata || {}), listButton: e.target.value }
                                            })}
                                            className="h-9 bg-background min-w-0 w-full"
                                        />
                                    </div>

                                    <div className="space-y-3 min-w-0 w-full">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] font-bold text-muted-foreground uppercase">Sections & Rows</label>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 text-[10px] text-primary hover:text-primary hover:bg-primary/10 font-semibold"
                                                onClick={() => {
                                                    const sections = [...(formData.metadata?.listSections || [])];
                                                    sections.push({ title: 'New Section', rows: [{ title: 'New Row', description: '' }] });
                                                    setFormData({ ...formData, metadata: { ...formData.metadata, listSections: sections } });
                                                }}
                                            >
                                                Add Section
                                            </Button>
                                        </div>

                                        {(formData.metadata?.listSections || []).map((section, sIdx) => (
                                            <div key={sIdx} className="space-y-2 p-3 bg-background rounded-lg border border-border min-w-0 w-full overflow-hidden">
                                                <div className="flex items-center gap-2 min-w-0 w-full">
                                                    <Input
                                                        placeholder="Section Title"
                                                        value={section.title}
                                                        onChange={(e) => {
                                                            const sections = [...formData.metadata.listSections];
                                                            sections[sIdx].title = e.target.value;
                                                            setFormData({ ...formData, metadata: { ...formData.metadata, listSections: sections } });
                                                        }}
                                                        className="h-8 text-xs font-bold min-w-0 flex-1"
                                                    />
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0" onClick={() => {
                                                        const sections = formData.metadata.listSections.filter((_, i) => i !== sIdx);
                                                        setFormData({ ...formData, metadata: { ...formData.metadata, listSections: sections } });
                                                    }}><Trash2 className="w-3 h-3" /></Button>
                                                </div>

                                                <div className="pl-4 space-y-2 border-l-2 border-primary/20 min-w-0 w-full">
                                                    {section.rows.map((row, rIdx) => (
                                                        <div key={rIdx} className="flex gap-2 items-start min-w-0 w-full">
                                                            <div className="flex-1 space-y-1 min-w-0">
                                                                <Input
                                                                    placeholder="Row Title"
                                                                    value={row.title}
                                                                    onChange={(e) => {
                                                                        const sections = [...formData.metadata.listSections];
                                                                        sections[sIdx].rows[rIdx].title = e.target.value;
                                                                        setFormData({ ...formData, metadata: { ...formData.metadata, listSections: sections } });
                                                                    }}
                                                                    className="h-8 text-xs min-w-0 w-full"
                                                                />
                                                                <Input
                                                                    placeholder="Description (Optional)"
                                                                    value={row.description}
                                                                    onChange={(e) => {
                                                                        const sections = [...formData.metadata.listSections];
                                                                        sections[sIdx].rows[rIdx].description = e.target.value;
                                                                        setFormData({ ...formData, metadata: { ...formData.metadata, listSections: sections } });
                                                                    }}
                                                                    className="h-7 text-[10px] min-w-0 w-full"
                                                                />
                                                            </div>
                                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0" onClick={() => {
                                                                const sections = [...formData.metadata.listSections];
                                                                sections[sIdx].rows = sections[sIdx].rows.filter((_, i) => i !== rIdx);
                                                                setFormData({ ...formData, metadata: { ...formData.metadata, listSections: sections } });
                                                            }}><X className="w-3 h-3" /></Button>
                                                        </div>
                                                    ))}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 text-[9px] text-primary hover:text-primary hover:bg-primary/10 font-semibold"
                                                        onClick={() => {
                                                            const sections = [...formData.metadata.listSections];
                                                            sections[sIdx].rows.push({ title: 'New Item', description: '' });
                                                            setFormData({ ...formData, metadata: { ...formData.metadata, listSections: sections } });
                                                        }}
                                                    >
                                                        + Add Row
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Carousel Section */}
                            {normalizedType === 'carousel' && (
                                <div className="space-y-4 bg-primary/5 p-4 rounded-xl border border-primary/10 min-w-0 w-full overflow-hidden">
                                    <div className="flex items-center gap-2 mb-2 text-primary">
                                        <Smartphone className="w-4 h-4" />
                                        <h4 className="text-xs font-bold uppercase tracking-wider">Carousel Cards</h4>
                                    </div>
                                    <div className="space-y-4 min-w-0 w-full">
                                        {(formData.metadata?.cards || []).map((card, cIdx) => (
                                            <div key={cIdx} className="space-y-3 p-3 bg-background rounded-lg border border-border min-w-0 w-full overflow-hidden">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-bold text-muted-foreground uppercase bg-muted/60 px-2 py-0.5 rounded">
                                                            Card {cIdx + 1}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-6 text-[10px] text-primary hover:text-primary hover:bg-primary/10 uppercase font-bold flex items-center gap-1 px-2"
                                                            onClick={() => onOpen('mediaLibrary', {
                                                                workspaceId,
                                                                onSelect: (url) => {
                                                                    const cards = [...formData.metadata.cards];
                                                                    cards[cIdx].mediaUrl = url;
                                                                    setFormData({ ...formData, metadata: { ...formData.metadata, cards } });
                                                                }
                                                            })}
                                                        >
                                                            <ImageIcon className="w-3 h-3" />
                                                            <span>Choose Image</span>
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            onClick={() => {
                                                                const cards = formData.metadata.cards.filter((_, i) => i !== cIdx);
                                                                setFormData({ ...formData, metadata: { ...formData.metadata, cards } });
                                                            }}
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                {/* Image input with preview and wrap */}
                                                <div className="space-y-1.5 min-w-0 w-full">
                                                    <div className="flex items-center justify-between text-[11px]">
                                                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Card Image (JPEG / PNG)</label>
                                                        {card.mediaUrl && (
                                                            <button
                                                                type="button"
                                                                className="text-[10px] text-muted-foreground hover:text-destructive transition-colors font-medium"
                                                                onClick={() => {
                                                                    const cards = [...formData.metadata.cards];
                                                                    cards[cIdx].mediaUrl = '';
                                                                    setFormData({ ...formData, metadata: { ...formData.metadata, cards } });
                                                                }}
                                                            >
                                                                Remove Image
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2 items-start min-w-0 w-full">
                                                        {card.mediaUrl ? (
                                                            <div className="w-12 h-12 rounded-md border border-border overflow-hidden bg-muted shrink-0 relative group/thumb">
                                                                <img
                                                                    src={card.mediaUrl}
                                                                    alt={`Card ${cIdx + 1}`}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        e.currentTarget.style.display = 'none';
                                                                    }}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div
                                                                onClick={() => onOpen('mediaLibrary', {
                                                                    workspaceId,
                                                                    onSelect: (url) => {
                                                                        const cards = [...formData.metadata.cards];
                                                                        cards[cIdx].mediaUrl = url;
                                                                        setFormData({ ...formData, metadata: { ...formData.metadata, cards } });
                                                                    }
                                                                })}
                                                                className="w-12 h-12 rounded-md border border-dashed border-border/80 hover:border-primary hover:bg-primary/5 flex flex-col items-center justify-center cursor-pointer transition-colors shrink-0 text-muted-foreground hover:text-primary"
                                                                title="Choose image from Media Hub"
                                                            >
                                                                <ImageIcon className="w-4 h-4" />
                                                                <span className="text-[8px] mt-0.5 font-medium">Hub</span>
                                                            </div>
                                                        )}
                                                        <Textarea
                                                            placeholder="Card image URL (https://...)"
                                                            value={card.mediaUrl || ''}
                                                            onChange={(e) => {
                                                                const cards = [...formData.metadata.cards];
                                                                cards[cIdx].mediaUrl = e.target.value;
                                                                setFormData({ ...formData, metadata: { ...formData.metadata, cards } });
                                                            }}
                                                            rows={2}
                                                            className="h-12 min-h-[48px] text-[11px] font-mono leading-tight resize-none py-1.5 px-2 bg-background border-border break-all whitespace-pre-wrap flex-1 min-w-0"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-1 min-w-0 w-full">
                                                    <label className="text-[10px] font-bold text-muted-foreground uppercase block">Card Body Text</label>
                                                    <Textarea
                                                        placeholder="Card body text..."
                                                        value={card.body || ''}
                                                        onChange={(e) => {
                                                            const cards = [...formData.metadata.cards];
                                                            cards[cIdx].body = e.target.value;
                                                            setFormData({ ...formData, metadata: { ...formData.metadata, cards } });
                                                        }}
                                                        className="h-18 text-xs resize-none min-w-0 w-full break-words"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full h-8 text-[10px] border-dashed"
                                            onClick={() => {
                                                const cards = [...(formData.metadata?.cards || [])];
                                                cards.push({ body: '', buttons: [''] });
                                                setFormData({ ...formData, metadata: { ...formData.metadata, cards } });
                                            }}
                                        >
                                            + Add Carousel Card
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Body & Footer */}
                            <div className="space-y-4 min-w-0 w-full">
                                {normalizedType !== 'carousel' && (
                                    <div className="min-w-0 w-full">
                                        <label className="text-sm font-semibold text-foreground mb-1.5 flex justify-between">
                                            <span>Message Body</span>
                                            <span className="text-xs text-muted-foreground font-normal">Use {"{{1}}"} for variables</span>
                                        </label>
                                        <Textarea
                                            rows='6'
                                            value={formData.body || ''}
                                            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                                            className="bg-background border-border resize-none min-w-0 w-full break-words" />
                                    </div>
                                )}

                                <div className="min-w-0 w-full">
                                    <label className="text-sm font-semibold text-foreground mb-1.5 block">Footer (Optional)</label>
                                    <Input
                                        placeholder="Max 60 characters..."
                                        value={formData.footer || ''}
                                        onChange={(e) => setFormData({ ...formData, footer: e.target.value })}
                                        className="bg-background border-border min-w-0 w-full" />
                                </div>

                                {/* Buttons Section */}
                                <div className="space-y-3 pt-2 min-w-0 w-full">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                            Buttons
                                            <span className="text-[10px] text-muted-foreground uppercase font-medium">Max 3</span>
                                        </label>
                                        {formData.buttons?.length < 3 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={addButton}
                                                className="h-7 text-[11px] text-primary hover:text-primary hover:bg-primary/10 font-bold"
                                            >
                                                <Plus className="w-3 h-3 mr-1" /> Add Button
                                            </Button>
                                        )}
                                    </div>

                                    <div className="space-y-3 min-w-0 w-full">
                                        {(formData.buttons || []).map((btn, idx) => {
                                            const b = typeof btn === 'object' ? btn : { type: 'QUICK_REPLY', text: btn || '' };
                                            const TypeIcon = buttonTypes.find(t => t.value === b.type)?.icon || MessageSquare;
                                            return (
                                                <div key={idx} className="p-3 border rounded-lg bg-background space-y-2 min-w-0 w-full overflow-hidden">
                                                    <div className="flex items-center gap-2">
                                                        <TypeIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                                                        <Select
                                                            value={b.type || 'QUICK_REPLY'}
                                                            onValueChange={(v) => handleButtonChange(idx, 'type', v)}
                                                        >
                                                            <SelectTrigger className="h-7 text-[11px] w-[160px] bg-muted/30 border-border">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {buttonTypes.map(t => (
                                                                    <SelectItem key={t.value} value={t.value}>
                                                                        <div className="flex items-center gap-2">
                                                                            <t.icon className="w-3.5 h-3.5" />
                                                                            {t.label}
                                                                        </div>
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 ml-auto text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                                                            onClick={() => removeButton(idx)}
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-2 min-w-0 w-full">
                                                        <Input
                                                            placeholder="Button Label (max 20 chars)"
                                                            value={b.text || ''}
                                                            onChange={(e) => handleButtonChange(idx, 'text', e.target.value)}
                                                            className="h-8 text-xs min-w-0 w-full"
                                                            maxLength={20}
                                                        />
                                                        {b.type === 'URL' && (
                                                            <Input
                                                                placeholder="Website URL (https://...)"
                                                                value={b.url || ''}
                                                                onChange={(e) => handleButtonChange(idx, 'url', e.target.value)}
                                                                className="h-8 text-xs font-mono min-w-0 w-full"
                                                            />
                                                        )}
                                                        {b.type === 'PHONE_NUMBER' && (
                                                            <Input
                                                                placeholder="Phone Number (+1234567890)"
                                                                value={b.phone_number || ''}
                                                                onChange={(e) => handleButtonChange(idx, 'phone_number', e.target.value)}
                                                                className="h-8 text-xs font-mono min-w-0 w-full"
                                                            />
                                                        )}
                                                        {b.type === 'FLOW' && (() => {
                                                            const matchingFlow = flows.find(f => (f.flowId && f.flowId === b.flow_id) || (f.id && f.id === b.selected_flow_id));
                                                            const isCustom = b.selected_flow_id === '__custom__' || (!matchingFlow && !!b.flow_id);
                                                            const selectValue = isCustom ? '__custom__' : (matchingFlow?.id || '');
                                                            const availableScreens = matchingFlow ? extractFlowScreens(matchingFlow) : [];
                                                            const hasScreenOptions = availableScreens.length > 0;

                                                            return (
                                                                <div className="space-y-2.5 pt-2 border-t border-border/50">
                                                                    {/* Flow Selection Dropdown */}
                                                                    <div className="space-y-1">
                                                                        <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
                                                                            <span className="flex items-center gap-1.5">
                                                                                <Workflow className="w-3 h-3 text-primary" />
                                                                                Select Flow <span className="text-destructive">*</span>
                                                                            </span>
                                                                            {isLoadingFlows && (
                                                                                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                                                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                                                                    Loading flows...
                                                                                </span>
                                                                            )}
                                                                        </div>

                                                                        <Select
                                                                            value={selectValue}
                                                                            onValueChange={(val) => {
                                                                                const newButtons = [...formData.buttons];
                                                                                const btn = typeof newButtons[idx] === 'object' ? { ...newButtons[idx] } : { type: 'FLOW', text: '' };
                                                                                if (val === '__custom__') {
                                                                                    btn.selected_flow_id = '__custom__';
                                                                                } else {
                                                                                    const selected = flows.find(f => f.id === val);
                                                                                    if (selected) {
                                                                                        btn.selected_flow_id = selected.id;
                                                                                        btn.flow_id = selected.flowId || '';
                                                                                        if (!btn.text) btn.text = selected.name.slice(0, 20);
                                                                                        const screens = extractFlowScreens(selected);
                                                                                        btn.navigate_screen = screens[0]?.id || 'WELCOME';
                                                                                        btn.flow_action = 'navigate';
                                                                                    }
                                                                                }
                                                                                delete btn.flow_cta;
                                                                                newButtons[idx] = btn;
                                                                                setFormData({ ...formData, buttons: newButtons });
                                                                            }}
                                                                        >
                                                                            <SelectTrigger className="h-8 text-xs bg-muted/20 border-border">
                                                                                <SelectValue placeholder={flows.length === 0 ? (isLoadingFlows ? "Loading flows..." : "No flows found (Enter ID)") : "Choose a Flow..."} />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                {flows.map((flow) => (
                                                                                    <SelectItem key={flow.id} value={flow.id} className="text-xs">
                                                                                        <div className="flex items-center justify-between gap-3 w-full">
                                                                                            <span className="font-medium truncate max-w-[200px]">{flow.name}</span>
                                                                                            <div className="flex items-center gap-1.5 shrink-0">
                                                                                                {flow.flowId ? (
                                                                                                    <span className="text-[10px] font-mono text-muted-foreground bg-muted/40 px-1 py-0.5 rounded">
                                                                                                        ID: {flow.flowId.slice(0, 8)}...
                                                                                                    </span>
                                                                                                ) : (
                                                                                                    <span className="text-[9px] text-amber-500 bg-amber-500/10 px-1 py-0.5 rounded font-medium">
                                                                                                        Draft (No ID)
                                                                                                    </span>
                                                                                                )}
                                                                                                <span className={`text-[9px] px-1 py-0.5 rounded uppercase font-semibold ${
                                                                                                    flow.status === 'PUBLISHED' 
                                                                                                        ? 'bg-emerald-500/10 text-emerald-500' 
                                                                                                        : 'bg-zinc-500/10 text-zinc-400'
                                                                                                }`}>
                                                                                                    {flow.status || 'DRAFT'}
                                                                                                </span>
                                                                                            </div>
                                                                                        </div>
                                                                                    </SelectItem>
                                                                                ))}
                                                                                <SelectItem value="__custom__" className="text-xs text-primary font-medium border-t border-border mt-1">
                                                                                    ✏️ Enter Flow ID manually...
                                                                                </SelectItem>
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>

                                                                    {/* If selected flow has no Meta flowId yet */}
                                                                    {matchingFlow && !matchingFlow.flowId && !isCustom && (
                                                                        <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-600 dark:text-amber-400 flex items-start gap-1.5 leading-tight">
                                                                            <span className="shrink-0 text-xs">⚠️</span>
                                                                            <span>
                                                                                <strong>{matchingFlow.name}</strong> is a local draft and hasn't been pushed to Meta yet. Push or publish it in the <em>Flows</em> tab to get a Meta Flow ID, or enter one manually.
                                                                            </span>
                                                                        </div>
                                                                    )}

                                                                    {/* Linked Flow ID display or manual input */}
                                                                    {(isCustom || (matchingFlow && !matchingFlow.flowId)) ? (
                                                                        <div className="space-y-1">
                                                                            <label className="text-[11px] text-muted-foreground font-medium">
                                                                                Meta Flow ID <span className="text-destructive">*</span>
                                                                            </label>
                                                                            <Input
                                                                                placeholder="e.g. 103948572839481"
                                                                                value={b.flow_id || ''}
                                                                                onChange={(e) => handleButtonChange(idx, 'flow_id', e.target.value)}
                                                                                className="h-8 text-xs font-mono"
                                                                            />
                                                                        </div>
                                                                    ) : matchingFlow?.flowId ? (
                                                                        <div className="flex items-center justify-between p-2 rounded bg-muted/30 border border-border text-[11px]">
                                                                            <div className="flex items-center gap-1.5 min-w-0">
                                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                                                                <span className="text-muted-foreground">Linked Flow ID:</span>
                                                                                <code className="font-mono text-foreground font-medium truncate">{matchingFlow.flowId}</code>
                                                                            </div>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleButtonChange(idx, 'selected_flow_id', '__custom__')}
                                                                                className="text-[10px] text-primary hover:underline shrink-0 ml-2"
                                                                            >
                                                                                Edit ID
                                                                            </button>
                                                                        </div>
                                                                    ) : null}

                                                                    {/* Navigate Screen (Initial Screen) - Required by Meta */}
                                                                    <div className="space-y-1">
                                                                        <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
                                                                            <span>
                                                                                Navigate Screen (First Screen) <span className="text-destructive">*</span>
                                                                            </span>
                                                                            <span className="text-[10px] text-muted-foreground italic">
                                                                                Initial screen on tap
                                                                            </span>
                                                                        </div>

                                                                        {hasScreenOptions && !b.is_custom_screen ? (
                                                                            <div className="space-y-1">
                                                                                <Select
                                                                                    value={b.navigate_screen || availableScreens[0]?.id || ''}
                                                                                    onValueChange={(val) => {
                                                                                        if (val === '__custom_screen__') {
                                                                                            const newButtons = [...formData.buttons];
                                                                                            newButtons[idx] = { ...newButtons[idx], is_custom_screen: true, navigate_screen: '' };
                                                                                            setFormData({ ...formData, buttons: newButtons });
                                                                                        } else {
                                                                                            handleButtonChange(idx, 'navigate_screen', val);
                                                                                        }
                                                                                    }}
                                                                                >
                                                                                    <SelectTrigger className="h-8 text-xs bg-muted/20 border-border font-mono">
                                                                                        <SelectValue placeholder="Choose initial screen..." />
                                                                                    </SelectTrigger>
                                                                                    <SelectContent>
                                                                                        {availableScreens.map(screen => (
                                                                                            <SelectItem key={screen.id} value={screen.id} className="text-xs">
                                                                                                <div className="flex items-center justify-between gap-3 w-full">
                                                                                                    <span className="font-medium">{screen.title}</span>
                                                                                                    <code className="text-[10px] font-mono text-primary bg-primary/10 px-1 py-0.5 rounded">
                                                                                                        {screen.id}
                                                                                                    </code>
                                                                                                </div>
                                                                                            </SelectItem>
                                                                                        ))}
                                                                                        <SelectItem value="__custom_screen__" className="text-xs text-primary font-medium border-t border-border mt-1">
                                                                                            ✏️ Enter screen name manually...
                                                                                        </SelectItem>
                                                                                    </SelectContent>
                                                                                </Select>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="space-y-1">
                                                                                <div className="flex items-center gap-1.5">
                                                                                    <Input
                                                                                        placeholder="e.g. WELCOME, APPOINTMENT_FORM, START"
                                                                                        value={b.navigate_screen || ''}
                                                                                        onChange={(e) => handleButtonChange(idx, 'navigate_screen', e.target.value)}
                                                                                        className="h-8 text-xs font-mono flex-1"
                                                                                        required
                                                                                    />
                                                                                    {hasScreenOptions && (
                                                                                        <Button
                                                                                            type="button"
                                                                                            variant="outline"
                                                                                            size="sm"
                                                                                            onClick={() => {
                                                                                                const newButtons = [...formData.buttons];
                                                                                                newButtons[idx] = { ...newButtons[idx], is_custom_screen: false, navigate_screen: availableScreens[0]?.id || 'WELCOME' };
                                                                                                setFormData({ ...formData, buttons: newButtons });
                                                                                            }}
                                                                                            className="h-8 px-2 text-[10px] shrink-0"
                                                                                        >
                                                                                            Pick Screen
                                                                                        </Button>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                        <p className="text-[10px] text-muted-foreground leading-tight">
                                                                            Must match the exact <code className="text-primary font-mono font-semibold">id</code> of the starting screen in your Flow JSON.
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {(!formData.buttons || formData.buttons.length === 0) && (
                                            <div className="text-[10px] text-muted-foreground italic bg-muted/20 p-3 rounded-lg border border-dashed border-border text-center">
                                                No buttons added. Click "Add Button" to include interactive elements.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Live Preview Integration */}
                            <div className="mt-4 pt-4 border-t border-border">
                                <TemplatePreview template={formData} />
                            </div>
                        </div>
                    </ScrollArea>

                    {/* Panel Footer */}
                    <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-between gap-3">
                        <Button variant="ghost" onClick={onClose} disabled={isSaving}>Cancel</Button>
                        <div className='flex gap-2'>
                            <Button
                                onClick={() => onSave(false)}
                                disabled={isSaving}
                                variant="outline"
                                className="font-bold shadow-sm"
                            >
                                {isSaving ? "Saving..." : "Save as Draft"}
                            </Button>
                            <Button
                                onClick={() => onSave(true)}
                                disabled={isSaving || !formData.name?.trim() || (normalizedType !== 'carousel' && !formData.body?.trim()) || (normalizedType === 'carousel' && (!formData.metadata?.cards || formData.metadata.cards.length === 0))}

                                title={!formData.name?.trim() ? "Name is required" : (normalizedType !== 'carousel' && !formData.body?.trim()) ? "Message body is required" : (normalizedType === 'carousel' && (!formData.metadata?.cards || formData.metadata.cards.length === 0)) ? "At least one card is required" : ""}
                            >
                                {isSaving ? "Submitting..." : "Submit for Approval"}
                            </Button>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
