'use client';

import React, { useState } from 'react';
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
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useAction } from '@/hooks/use-action';
import { getTemplateAiSuggestion } from '../_actions/get-template-ai-suggestion';
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

export default function TemplateBuilder({
    isOpen,
    onClose,
    formData,
    setFormData,
    onSave,
    editingId,
    isSaving,
    isSubmittingId,
    workspaceId
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

    const handleButtonChange = (index, value) => {
        const newButtons = [...formData.buttons];
        newButtons[index] = value;
        setFormData({ ...formData, buttons: newButtons });
    };

    const addButton = () => {
        if (formData.buttons.length < 3) {
            setFormData({ ...formData, buttons: [...formData.buttons, ''] });
        }
    };

    const removeButton = (index) => {
        const newButtons = formData.buttons.filter((_, i) => i !== index);
        setFormData({ ...formData, buttons: newButtons });
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="w-[620px] sm:max-w-[620px] p-2 flex flex-col gap-0 border-0 border-border bg-transparent">
                <div className='flex flex-col h-full border bg-card rounded-md'>


                    {/* Panel Header */}
                    <SheetHeader className="px-6 py-4 border-b border-border bg-muted/30 text-left">
                        <SheetTitle className="text-lg font-semibold text-foreground">
                            {editingId ? 'Edit Template' : 'Create Template'}
                        </SheetTitle>
                        <SheetDescription className="text-xs text-muted-foreground">
                            Configure your WhatsApp message template content and interactive elements.
                        </SheetDescription>
                    </SheetHeader>

                    <ScrollArea className='h-[85%]'>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">


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
                                                if (!editingId) {
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
                                                    setFormData({ ...formData, templateName: value });
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
                                                className="h-5 px-1 text-[9px] text-primary hover:bg-primary/5 uppercase font-bold"
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
                            {['image', 'video', 'audio', 'document'].includes(normalizedType) && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-semibold text-foreground capitalize">{normalizedType} URL</label>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 text-[10px] text-primary hover:bg-primary/5 uppercase font-bold"
                                            onClick={() => onOpen('mediaLibrary', {
                                                workspaceId,
                                                onSelect: (url) => setFormData({
                                                    ...formData,
                                                    metadata: { ...(formData.metadata || {}), mediaUrl: url }
                                                })
                                            })}
                                        >
                                            Choose from Hub
                                        </Button>
                                    </div>
                                    <div className="relative group/input">
                                        <Input
                                            placeholder="https://..."
                                            value={formData.metadata?.mediaUrl || ''}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                metadata: { ...(formData.metadata || {}), mediaUrl: e.target.value }
                                            })}
                                            className="pr-10"
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
                                            onClick={() => onOpen('mediaLibrary', {
                                                workspaceId,
                                                onSelect: (url) => setFormData({
                                                    ...formData,
                                                    metadata: { ...(formData.metadata || {}), mediaUrl: url }
                                                })
                                            })}
                                        >
                                            <ImageIcon className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {normalizedType === 'location' && (
                                <div className="space-y-4 bg-muted/20 p-4 rounded-xl border border-border">
                                    <div className="flex items-center gap-2 mb-2 text-primary">
                                        <Smartphone className="w-4 h-4" />
                                        <h4 className="text-xs font-bold uppercase tracking-wider">Location Metadata</h4>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">Latitude</label>
                                            <Input
                                                placeholder="e.g. 28.6139"
                                                value={formData.metadata?.latitude || ''}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    metadata: { ...(formData.metadata || {}), latitude: e.target.value }
                                                })}
                                                className="h-9 bg-background"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">Longitude</label>
                                            <Input
                                                placeholder="e.g. 77.2090"
                                                value={formData.metadata?.longitude || ''}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    metadata: { ...(formData.metadata || {}), longitude: e.target.value }
                                                })}
                                                className="h-9 bg-background"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">Location Name</label>
                                        <Input
                                            placeholder="e.g. Devlomatix Solutions"
                                            value={formData.metadata?.locationName || ''}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                metadata: { ...(formData.metadata || {}), locationName: e.target.value }
                                            })}
                                            className="h-9 bg-background"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">Address</label>
                                        <Input
                                            placeholder="Full address..."
                                            value={formData.metadata?.address || ''}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                metadata: { ...(formData.metadata || {}), address: e.target.value }
                                            })}
                                            className="h-9 bg-background"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block text-primary">Google Places ID (Optional)</label>
                                        <Input
                                            placeholder="ChIJa5S5..."
                                            value={formData.metadata?.googlePlaceId || ''}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                metadata: { ...(formData.metadata || {}), googlePlaceId: e.target.value }
                                            })}
                                            className="h-9 bg-background border-primary/20 focus-visible:ring-primary/30"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Header Text Section */}
                            {(['text', 'interactive-button', 'interactive-group', 'carousel'].includes(normalizedType) || !normalizedType) && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-semibold text-foreground mb-1.5 block">Header Text (Optional)</label>
                                        <Input
                                            placeholder="Add a bold title..."
                                            value={formData.metadata?.headerText || ''}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                metadata: { ...(formData.metadata || {}), headerText: e.target.value }
                                            })}
                                            className="bg-background border-border font-bold" />
                                    </div>
                                </div>
                            )}

                            {/* Interactive Group / List Section */}
                            {normalizedType === 'interactive-group' && (
                                <div className="space-y-4 bg-primary/5 p-4 rounded-xl border border-primary/10">
                                    <div className="flex items-center gap-2 mb-2 text-primary">
                                        <List className="w-4 h-4" />
                                        <h4 className="text-xs font-bold uppercase tracking-wider">List Configuration</h4>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">Menu Button Text</label>
                                        <Input
                                            placeholder="e.g. Select Option"
                                            value={formData.metadata?.listButton || 'Select Option'}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                metadata: { ...(formData.metadata || {}), listButton: e.target.value }
                                            })}
                                            className="h-9 bg-background"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] font-bold text-muted-foreground uppercase">Sections & Rows</label>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 text-[10px] text-primary"
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
                                            <div key={sIdx} className="space-y-2 p-3 bg-background rounded-lg border border-border">
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        placeholder="Section Title"
                                                        value={section.title}
                                                        onChange={(e) => {
                                                            const sections = [...formData.metadata.listSections];
                                                            sections[sIdx].title = e.target.value;
                                                            setFormData({ ...formData, metadata: { ...formData.metadata, listSections: sections } });
                                                        }}
                                                        className="h-8 text-xs font-bold"
                                                    />
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => {
                                                        const sections = formData.metadata.listSections.filter((_, i) => i !== sIdx);
                                                        setFormData({ ...formData, metadata: { ...formData.metadata, listSections: sections } });
                                                    }}><Trash2 className="w-3 h-3" /></Button>
                                                </div>

                                                <div className="pl-4 space-y-2 border-l-2 border-primary/20">
                                                    {section.rows.map((row, rIdx) => (
                                                        <div key={rIdx} className="flex gap-2 items-start">
                                                            <div className="flex-1 space-y-1">
                                                                <Input
                                                                    placeholder="Row Title"
                                                                    value={row.title}
                                                                    onChange={(e) => {
                                                                        const sections = [...formData.metadata.listSections];
                                                                        sections[sIdx].rows[rIdx].title = e.target.value;
                                                                        setFormData({ ...formData, metadata: { ...formData.metadata, listSections: sections } });
                                                                    }}
                                                                    className="h-8 text-xs"
                                                                />
                                                                <Input
                                                                    placeholder="Description (Optional)"
                                                                    value={row.description}
                                                                    onChange={(e) => {
                                                                        const sections = [...formData.metadata.listSections];
                                                                        sections[sIdx].rows[rIdx].description = e.target.value;
                                                                        setFormData({ ...formData, metadata: { ...formData.metadata, listSections: sections } });
                                                                    }}
                                                                    className="h-7 text-[10px]"
                                                                />
                                                            </div>
                                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => {
                                                                const sections = [...formData.metadata.listSections];
                                                                sections[sIdx].rows = sections[sIdx].rows.filter((_, i) => i !== rIdx);
                                                                setFormData({ ...formData, metadata: { ...formData.metadata, listSections: sections } });
                                                            }}><X className="w-3 h-3" /></Button>
                                                        </div>
                                                    ))}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 text-[9px] text-primary"
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
                                <div className="space-y-4 bg-primary/5 p-4 rounded-xl border border-primary/10">
                                    <div className="flex items-center gap-2 mb-2 text-primary">
                                        <Smartphone className="w-4 h-4" />
                                        <h4 className="text-xs font-bold uppercase tracking-wider">Carousel Cards</h4>
                                    </div>
                                    <div className="space-y-4">
                                        {(formData.metadata?.cards || []).map((card, cIdx) => (
                                            <div key={cIdx} className="space-y-3 p-3 bg-background rounded-lg border border-border">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Card {cIdx + 1}</span>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => {
                                                        const cards = formData.metadata.cards.filter((_, i) => i !== cIdx);
                                                        setFormData({ ...formData, metadata: { ...formData.metadata, cards } });
                                                    }}><Trash2 className="w-3 h-3" /></Button>
                                                </div>
                                                <div className="relative group/input">
                                                    <Input
                                                        placeholder="Card image URL (https://...)"
                                                        value={card.mediaUrl || ''}
                                                        onChange={(e) => {
                                                            const cards = [...formData.metadata.cards];
                                                            cards[cIdx].mediaUrl = e.target.value;
                                                            setFormData({ ...formData, metadata: { ...formData.metadata, cards } });
                                                        }}
                                                        className="h-8 text-xs pr-8"
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-primary hover:bg-primary/5"
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
                                                    </Button>
                                                </div>
                                                <Textarea
                                                    placeholder="Card body text..."
                                                    value={card.body}
                                                    onChange={(e) => {
                                                        const cards = [...formData.metadata.cards];
                                                        cards[cIdx].body = e.target.value;
                                                        setFormData({ ...formData, metadata: { ...formData.metadata, cards } });
                                                    }}
                                                    className="h-20 text-xs resize-none"
                                                />
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
                            <div className="space-y-4">
                                {normalizedType !== 'carousel' && (
                                    <div>
                                        <label className="text-sm font-semibold text-foreground mb-1.5 flex justify-between">
                                            Message Body
                                            <span className="text-xs text-muted-foreground font-normal">Use {"{{1}}"} for variables</span>
                                        </label>
                                        <Textarea
                                            rows='8'
                                            value={formData.body || ''}
                                            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                                            className="bg-background border-border resize-none" />
                                    </div>
                                )}

                                <div>
                                    <label className="text-sm font-semibold text-foreground mb-1.5 block">Footer (Optional)</label>
                                    <Input
                                        placeholder="Max 60 characters..."
                                        value={formData.footer || ''}
                                        onChange={(e) => setFormData({ ...formData, footer: e.target.value })}
                                        className="bg-background border-border" />
                                </div>

                                {/* Buttons Section */}
                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                            Quick Reply Buttons
                                            <span className="text-[10px] text-muted-foreground uppercase font-medium">Max 3</span>
                                        </label>
                                        {formData.buttons?.length < 3 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={addButton}
                                                className="h-7 text-[11px] text-primary hover:bg-primary/5 font-bold"
                                            >
                                                <Plus className="w-3 h-3 mr-1" /> Add Button
                                            </Button>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        {(formData.buttons || []).map((btn, idx) => {
                                            const label = typeof btn === 'object' ? (btn.text || '') : (btn || '');
                                            return (
                                                <div key={idx} className="flex gap-2">
                                                    <Input
                                                        placeholder={`Button ${idx + 1} Label (e.g. Yes, please)`}
                                                        value={label}
                                                        onChange={(e) => handleButtonChange(idx, e.target.value)}
                                                        className="h-9 bg-background border-border text-sm"
                                                        maxLength={20}
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-9 w-9 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                                                        onClick={() => removeButton(idx)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
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
