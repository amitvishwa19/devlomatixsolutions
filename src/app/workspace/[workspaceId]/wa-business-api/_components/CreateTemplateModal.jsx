'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    MessageSquare,
    Image as ImageIcon,
    FileText,
    Users,
    BarChart3,
    MousePointer2,
    List,
    MapPin,
    Video,
    Music,
    Box,
    LayoutTemplate,
    X,
    Plus,
    Sparkles,
    Zap,
    RefreshCw,
    ArrowDownLeft,
    CheckCircle2,
    Info,
    Trash2
} from 'lucide-react';
import { toast } from 'sonner';

const TEMPLATE_TYPES = [
    { id: 'TEXT', label: 'Simple Text', icon: MessageSquare, description: 'Plain text with variables' },
    { id: 'IMAGE', label: 'Media + Image', icon: ImageIcon, description: 'Send image with caption' },
    { id: 'DOCUMENT', label: 'Media + File', icon: FileText, description: 'Attach PDF or document' },
    { id: 'CONTACT', label: 'Contact Card', icon: Users, description: 'Share contact details' },
    { id: 'POLL', label: 'Interactive Poll', icon: BarChart3, description: 'Gather team feedback' },
    { id: 'BUTTONS', label: 'Quick Buttons', icon: MousePointer2, description: 'Action reply buttons' },
    { id: 'LIST', label: 'Menu List', icon: List, description: 'Multi-option selection' },
    { id: 'LOCATION', label: 'Venue Location', icon: MapPin, description: 'Share static location' },
    { id: 'VIDEO', label: 'Media + Video', icon: Video, description: 'Send video interactions' },
    { id: 'AUDIO', label: 'Voice/Audio', icon: Music, description: 'Voice notes or clips' },
    { id: 'MIXED', label: 'Mixed Content', icon: Box, description: 'Complex multi-action' },
    { id: 'CAROUSEL', label: 'Card Carousel', icon: LayoutTemplate, description: 'Scrollable card deck' },
];

export default function CreateTemplateModal({ isOpen, onOpenChange, onSave, initialData, isLoading }) {
    const [selectedType, setSelectedType] = useState('TEXT');
    const [formData, setFormData] = useState({
        name: '',
        category: 'Utility',
        header: '',
        content: '',
        footer: '',
        buttons: [], // Array of { text: string }
        mediaUrl: '',
        latitude: '',
        longitude: '',
        pollOptions: ['', ''],
        listSections: [{ title: '', rows: [{ id: 'row_1', title: '', description: '' }] }],
        carouselCards: [{ mediaUrl: '', body: '', buttons: [] }],
        mixedParts: [{ type: 'TEXT', content: '' }],
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                category: initialData.category || 'Utility',
                header: initialData.header || '',
                content: initialData.body || '',
                footer: initialData.footer || '',
                buttons: initialData.buttons || [],
                mediaUrl: initialData.metadata?.mediaUrl || '',
                latitude: initialData.metadata?.latitude || '',
                longitude: initialData.metadata?.longitude || '',
                pollOptions: initialData.metadata?.pollOptions || ['', ''],
                listSections: initialData.metadata?.listSections || [{ title: '', rows: [{ id: 'row_1', title: '', description: '' }] }],
                carouselCards: initialData.metadata?.carouselCards || [{ mediaUrl: '', body: '', buttons: [] }],
                mixedParts: initialData.metadata?.mixedParts || [{ type: 'TEXT', content: '' }],
            });
            setSelectedType(initialData.type || 'TEXT');
        } else {
            setFormData({
                name: '',
                category: 'Utility',
                header: '',
                content: '',
                footer: '',
                buttons: [],
                mediaUrl: '',
                latitude: '',
                longitude: '',
                pollOptions: ['', ''],
                listSections: [{ title: '', rows: [{ id: 'row_1', title: '', description: '' }] }],
                carouselCards: [{ mediaUrl: '', body: '', buttons: [] }],
                mixedParts: [{ type: 'TEXT', content: '' }],
            });
            setSelectedType('TEXT');
        }
    }, [initialData, isOpen]);

    const handleSave = () => {
        if (!formData.name) {
            toast.error("Please enter a template name");
            return;
        }
        if (!formData.content) {
            toast.error("Please enter message content");
            return;
        }

        const metadata = {
            mediaUrl: formData.mediaUrl,
            latitude: formData.latitude,
            longitude: formData.longitude,
            pollOptions: formData.pollOptions,
            listSections: formData.listSections,
            carouselCards: formData.carouselCards,
            mixedParts: formData.mixedParts
        };

        onSave({ 
            ...formData, 
            type: selectedType,
            metadata: metadata 
        });
    };

    const insertVariable = (variable) => {
        setFormData(prev => ({
            ...prev,
            content: prev.content + ` {{${variable}}}`
        }));
    };

    // --- Dynamic Helpers ---
    const addButton = () => {
        if (formData.buttons.length >= 3) {
            toast.error("WhatsApp Quick Replies are limited to 3 buttons");
            return;
        }
        setFormData(prev => ({
            ...prev,
            buttons: [...prev.buttons, { text: '' }]
        }));
    };

    const removeButton = (index) => {
        setFormData(prev => ({
            ...prev,
            buttons: prev.buttons.filter((_, i) => i !== index)
        }));
    };

    const updateButton = (index, value) => {
        const newButtons = [...formData.buttons];
        newButtons[index].text = value;
        setFormData({ ...formData, buttons: newButtons });
    };

    const addPollOption = () => {
        setFormData(prev => ({
            ...prev,
            pollOptions: [...prev.pollOptions, '']
        }));
    };

    const removePollOption = (index) => {
        if (formData.pollOptions.length <= 2) {
            toast.error("A poll needs at least 2 options");
            return;
        }
        setFormData(prev => ({
            ...prev,
            pollOptions: prev.pollOptions.filter((_, i) => i !== index)
        }));
    };

    const updatePollOption = (index, value) => {
        const newOptions = [...formData.pollOptions];
        newOptions[index] = value;
        setFormData({ ...formData, pollOptions: newOptions });
    };

    // --- List Helpers ---
    const addListSection = () => {
        setFormData(prev => ({
            ...prev,
            listSections: [...prev.listSections, { title: '', rows: [{ id: `row_${Date.now()}`, title: '', description: '' }] }]
        }));
    };

    const updateListSection = (idx, title) => {
        const newSections = [...formData.listSections];
        newSections[idx].title = title;
        setFormData({ ...formData, listSections: newSections });
    };

    const addListRow = (sIdx) => {
        const newSections = [...formData.listSections];
        newSections[sIdx].rows.push({ id: `row_${Date.now()}`, title: '', description: '' });
        setFormData({ ...formData, listSections: newSections });
    };

    const updateListRow = (sIdx, rIdx, field, value) => {
        const newSections = [...formData.listSections];
        newSections[sIdx].rows[rIdx][field] = value;
        setFormData({ ...formData, listSections: newSections });
    };

    const removeListRow = (sIdx, rIdx) => {
        const newSections = [...formData.listSections];
        newSections[sIdx].rows = newSections[sIdx].rows.filter((_, i) => i !== rIdx);
        if (newSections[sIdx].rows.length === 0) {
            setFormData({ ...formData, listSections: newSections.filter((_, i) => i !== sIdx) });
        } else {
            setFormData({ ...formData, listSections: newSections });
        }
    };

    // --- Carousel Helpers ---
    const addCarouselCard = () => {
        if (formData.carouselCards.length >= 10) {
            toast.error("WhatsApp limit is 10 cards per carousel");
            return;
        }
        setFormData(prev => ({
            ...prev,
            carouselCards: [...prev.carouselCards, { mediaUrl: '', body: '', buttons: [] }]
        }));
    };

    const updateCarouselCard = (idx, field, value) => {
        const newCards = [...formData.carouselCards];
        newCards[idx][field] = value;
        setFormData({ ...formData, carouselCards: newCards });
    };

    const updateCarouselButton = (cIdx, bIdx, text) => {
        const newCards = [...formData.carouselCards];
        newCards[cIdx].buttons[bIdx].text = text;
        setFormData({ ...formData, carouselCards: newCards });
    };

    const addCarouselButton = (cIdx) => {
        const newCards = [...formData.carouselCards];
        if (newCards[cIdx].buttons.length >= 3) return;
        newCards[cIdx].buttons.push({ text: '' });
        setFormData({ ...formData, carouselCards: newCards });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>


            <DialogContent className="min-w-[80vw] min-h-[90vh] p-0 border-none shadow-2xl overflow-hidden bg-card">
                <div className="flex flex-col md:flex-row h-full max-h-[90vh] overflow-hidden">
                    {/* Left Info Panel (Mirroring ContactSheet) */}
                    <div className="hidden md:flex flex-col w-[300px] bg-muted/20 border-r border-border/40 relative overflow-hidden shrink-0">
                        <ScrollArea className="h-full">
                            <div className="p-4 space-y-4 h-full flex flex-col justify-between">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none" />

                                <div className="relative z-10 space-y-4">
                                    <div>
                                        <div className="flex items-center justify-center gap-2">
                                            <LayoutTemplate className="w-6 h-6 text-primary" />
                                            <span className="text-xl text-foreground">Template Template</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-3 leading-relaxed opacity-80">
                                            Define reusable message structures with dynamic variables for automated CRM workflows.
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="p-4 bg-background border border-border/50 rounded-2xl shadow-sm">
                                            <div className="flex items-center gap-2 mb-2">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                <span className="text-[11px]  tracking-wider">Dynamic Fields</span>
                                            </div>
                                            <p className=" text-muted-foreground leading-relaxed">Use double curly braces like <code className="text-primary font-bold">{"{{name}}"}</code> to insert personalized data.</p>
                                        </div>

                                        <div className="p-4 bg-background border border-border/50 rounded-2xl shadow-sm">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Zap className="w-4 h-4 text-amber-500" />
                                                <span className="text-[11px]  tracking-wider">Instant Recall</span>
                                            </div>
                                            <p className=" text-muted-foreground leading-relaxed">Templates saved here are instantly accessible across all Template channels.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative z-10 pt-10">
                                    <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,184,129,0.4)]" />
                                        <span className=" text-primary  tracking-widest leading-none">Template Library Sync</span>
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Right Content/Form Panel */}
                    <div className="flex-1 flex flex-col min-h-0 bg-background/50 overflow-hidden">
                        <DialogHeader className="p-4  border-b shrink-0">
                            <DialogTitle className="text-xl tracking-tight text-foreground">
                                {initialData ? 'Refine Template' : 'Initialize Template'}
                            </DialogTitle>
                            <DialogDescription className="text-xs font-medium text-muted-foreground">
                                {initialData ? 'Update the existing template configuration.' : 'Create a new reusable message interaction node.'}
                            </DialogDescription>
                        </DialogHeader>

                        <ScrollArea className="h-[75vh]">
                            <div className="p-8 space-y-4 pb-10">
                                {/* Type Grid */}
                                <div className="space-y-4">
                                    <Label className="   text-muted-foreground/70 flex items-center gap-2">
                                        <Box className="w-3.5 h-3.5" /> Interaction Type
                                    </Label>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                                        {TEMPLATE_TYPES.map((type) => (
                                            <div
                                                key={type.id}
                                                onClick={() => setSelectedType(type.id)}
                                                className={`group flex flex-col items-start p-4 rounded-lg border transition-all cursor-pointer relative overflow-hidden ${selectedType === type.id
                                                    ? 'border-primary/30 bg-primary/5 shadow-md shadow-primary/5'
                                                    : 'bg-card border hover:border-primary/30 hover:bg-muted/30 opacity-70 hover:opacity-100'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className={`p-2 rounded-xl transition-all ${selectedType === type.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-muted group-hover:bg-primary/10 group-hover:text-primary'}`}>
                                                        <type.icon className="w-4 h-4" />
                                                    </div>
                                                    <div className="mt-3">
                                                        <p className={`text-[11px] leading-tight ${selectedType === type.id ? 'text-primary' : 'text-foreground'}`}>{type.label}</p>
                                                        <p className="text-[9px] text-muted-foreground/60 mt-1 line-clamp-1">{type.description}</p>
                                                    </div>
                                                </div>
                                                {selectedType === type.id && (
                                                    <div className="absolute -bottom-2 -right-2 transform rotate-12 opacity-10">
                                                        <type.icon className="w-12 h-12 text-primary" />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2.5">
                                        <Label className="   text-muted-foreground/70">Template Name</Label>
                                        <Input
                                            placeholder="e.g. Welcome_Series_v1"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="bg-muted/10 border focus-visible:ring-primary/20 transition-all font-semibold"
                                        />
                                    </div>

                                    <div className="space-y-2.5">
                                        <Label className="   text-muted-foreground/70">Category</Label>
                                        <Select
                                            value={formData.category}
                                            onValueChange={val => setFormData({ ...formData, category: val })}
                                        >
                                            <SelectTrigger className=" bg-muted/10 border focus:ring-primary/20">
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent className="border-border/50">
                                                {['Utility', 'Marketing', 'Authentication', 'Alert', 'Survey'].map(c => (
                                                    <SelectItem key={c} value={c} className="text-xs font-semibold">{c}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Dynamic Header/Body Section */}
                                <div id="header-body-editor" className="space-y-6 border border-border/50 p-6 rounded-2xl bg-muted/5">
                                    {/* --- Conditional Header --- */}
                                    <div className="space-y-4">
                                        {['IMAGE', 'VIDEO', 'DOCUMENT', 'AUDIO'].includes(selectedType) ? (
                                            <div className="space-y-2.5">
                                                <Label className="text-muted-foreground/70 flex items-center gap-2">
                                                    <LayoutTemplate className="w-3.5 h-3.5" /> Media Source URL
                                                </Label>
                                                <Input
                                                    placeholder={`Enter ${selectedType.toLowerCase()} URL (e.g. https://example.com/media.${selectedType === 'AUDIO' ? 'mp3' : selectedType === 'VIDEO' ? 'mp4' : 'jpg'})`}
                                                    value={formData.mediaUrl}
                                                    onChange={e => setFormData({ ...formData, mediaUrl: e.target.value })}
                                                    className="bg-background border focus-visible:ring-primary/20 transition-all font-medium"
                                                />
                                            </div>
                                        ) : selectedType === 'LOCATION' ? (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2.5">
                                                    <Label className="text-muted-foreground/70">Latitude</Label>
                                                    <Input
                                                        placeholder="0.0000"
                                                        value={formData.latitude}
                                                        onChange={e => setFormData({ ...formData, latitude: e.target.value })}
                                                        className="bg-background border focus-visible:ring-primary/20"
                                                    />
                                                </div>
                                                <div className="space-y-2.5">
                                                    <Label className="text-muted-foreground/70">Longitude</Label>
                                                    <Input
                                                        placeholder="0.0000"
                                                        value={formData.longitude}
                                                        onChange={e => setFormData({ ...formData, longitude: e.target.value })}
                                                        className="bg-background border focus-visible:ring-primary/20"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-2.5">
                                                <Label className="text-muted-foreground/70">Message Header (Optional)</Label>
                                                <Input
                                                    placeholder="Enter header text..."
                                                    value={formData.header}
                                                    onChange={e => setFormData({ ...formData, header: e.target.value })}
                                                    className="bg-background border focus-visible:ring-primary/20 transition-all"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* --- Standard Message Body --- */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-muted-foreground/70">Template Core Body</Label>
                                            <div className="flex gap-2">
                                                {['name', 'date', 'location'].map(v => (
                                                    <Button
                                                        key={v}
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-xs px-2 gap-1 border-border/40 hover:bg-primary/5 hover:text-primary hover:border-primary/20 rounded-lg"
                                                        onClick={() => insertVariable(v)}
                                                    >
                                                        <Plus className="w-2.5 h-2.5" /> {v}
                                                    </Button>
                                                ))}
                                                <Button variant="outline" size="sm" className="text-xs px-2 gap-1 border-border/40 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 rounded-lg" onClick={() => insertVariable('random')}>
                                                    <Zap className="w-2.5 h-2.5" /> Random
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="relative group">
                                            <Textarea
                                                rows={6}
                                                placeholder="Initialize message body here..."
                                                value={formData.content}
                                                onChange={e => setFormData({ ...formData, content: e.target.value })}
                                                className="p-5 text-sm bg-background border focus:border-primary/20 transition-all leading-relaxed font-medium rounded-xl"
                                            />
                                            <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity">
                                                <Info className="w-3.5 h-3.5" />
                                                <span className="text-[9px] tracking-tighter">Markdown Enabled</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* --- Conditional Specialized Inputs --- */}
                                    
                                    {/* Buttons Editor (Max 3) - Available for most types */}
                                    {['TEXT', 'IMAGE', 'VIDEO', 'DOCUMENT', 'BUTTONS', 'MIXED', 'LOCATION', 'AUDIO'].includes(selectedType) && (
                                        <div className="space-y-4 pt-4 border-t border-border/40">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-muted-foreground/70 flex items-center gap-2">
                                                    <MousePointer2 className="w-3.5 h-3.5" /> Interactive Buttons ({formData.buttons.length}/3)
                                                </Label>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    onClick={addButton}
                                                    disabled={formData.buttons.length >= 3}
                                                    className="h-8 text-xs gap-2 rounded-lg border-primary/20 text-primary hover:bg-primary/5"
                                                >
                                                    <Plus className="w-3.5 h-3.5" /> Add Choice
                                                </Button>
                                            </div>
                                            <div className="space-y-3">
                                                {formData.buttons.map((btn, idx) => (
                                                    <div key={idx} className="flex gap-2">
                                                        <Input 
                                                            placeholder={`Button ${idx + 1} Label`}
                                                            value={btn.text}
                                                            onChange={(e) => updateButton(idx, e.target.value)}
                                                            className="h-10 bg-background border focus-visible:ring-primary/20 font-medium"
                                                        />
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            onClick={() => removeButton(idx)}
                                                            className="h-10 w-10 shrink-0 text-muted-foreground hover:text-rose-600 hover:bg-rose-50"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                                {formData.buttons.length === 0 && (
                                                    <div className="p-4 bg-background/40 border border-dashed border-border/60 rounded-xl flex items-center justify-center">
                                                        <span className="text-[10px] text-muted-foreground/60">No buttons added. Add up to 3 interactive choices.</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Mixed Content Parts Editor */}
                                    {selectedType === 'MIXED' && (
                                        <div className="space-y-4 pt-4 border-t border-border/40">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-muted-foreground/70 flex items-center gap-2">
                                                    <Box className="w-3.5 h-3.5" /> Message Parts
                                                </Label>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    onClick={() => setFormData({ ...formData, mixedParts: [...formData.mixedParts, { type: 'TEXT', content: '' }] })}
                                                    className="h-8 text-xs gap-2 rounded-lg border-primary/20 text-primary hover:bg-primary/5"
                                                >
                                                    <Plus className="w-3.5 h-3.5" /> Add Part
                                                </Button>
                                            </div>
                                            <div className="space-y-4">
                                                {formData.mixedParts.map((part, idx) => (
                                                    <div key={idx} className="p-4 bg-background/40 border border-border/60 rounded-xl space-y-3">
                                                        <div className="flex items-center gap-2">
                                                            <Select 
                                                                value={part.type} 
                                                                onValueChange={(val) => {
                                                                    const newParts = [...formData.mixedParts];
                                                                    newParts[idx].type = val;
                                                                    setFormData({ ...formData, mixedParts: newParts });
                                                                }}
                                                            >
                                                                <SelectTrigger className="h-8 w-32 text-[10px]">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="TEXT">Text</SelectItem>
                                                                    <SelectItem value="IMAGE">Image URL</SelectItem>
                                                                    <SelectItem value="VIDEO">Video URL</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                onClick={() => setFormData({ ...formData, mixedParts: formData.mixedParts.filter((_, i) => i !== idx) })}
                                                                className="h-8 w-8 ml-auto text-muted-foreground hover:text-rose-600"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </Button>
                                                        </div>
                                                        <Input 
                                                            placeholder={part.type === 'TEXT' ? "Part content..." : "Media URL..."}
                                                            value={part.content}
                                                            onChange={(e) => {
                                                                const newParts = [...formData.mixedParts];
                                                                newParts[idx].content = e.target.value;
                                                                setFormData({ ...formData, mixedParts: newParts });
                                                            }}
                                                            className="h-9 text-xs"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Menu List Editor (`LIST`) */}
                                    {selectedType === 'LIST' && (
                                        <div className="space-y-6 pt-4 border-t border-border/40">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-muted-foreground/70 flex items-center gap-2">
                                                    <List className="w-3.5 h-3.5" /> Menu Sections
                                                </Label>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    onClick={addListSection}
                                                    className="h-8 text-xs gap-2 rounded-lg border-primary/20 text-primary hover:bg-primary/5"
                                                >
                                                    <Plus className="w-3.5 h-3.5" /> Add Section
                                                </Button>
                                            </div>
                                            <div className="space-y-6">
                                                {formData.listSections.map((section, sIdx) => (
                                                    <div key={sIdx} className="space-y-3 p-4 bg-background/40 border border-border/60 rounded-xl">
                                                        <Input 
                                                            placeholder={`Section ${sIdx + 1} Title (Optional)`}
                                                            value={section.title}
                                                            onChange={(e) => updateListSection(sIdx, e.target.value)}
                                                            className="h-9 bg-background border-dashed border-border/60 focus-visible:ring-primary/20 font-bold"
                                                        />
                                                        <div className="space-y-2 pl-4 border-l-2 border-primary/10">
                                                            {section.rows.map((row, rIdx) => (
                                                                <div key={rIdx} className="flex gap-2">
                                                                    <div className="flex-1 space-y-2">
                                                                        <Input 
                                                                            placeholder="Row Title (Required)"
                                                                            value={row.title}
                                                                            onChange={(e) => updateListRow(sIdx, rIdx, 'title', e.target.value)}
                                                                            className="h-10 bg-background text-sm font-medium"
                                                                        />
                                                                        <Input 
                                                                            placeholder="Row Description (Optional)"
                                                                            value={row.description}
                                                                            onChange={(e) => updateListRow(sIdx, rIdx, 'description', e.target.value)}
                                                                            className="h-8 bg-background text-[10px] text-muted-foreground"
                                                                        />
                                                                    </div>
                                                                    <Button 
                                                                        variant="ghost" 
                                                                        size="icon" 
                                                                        onClick={() => removeListRow(sIdx, rIdx)}
                                                                        className="h-10 w-10 shrink-0 text-muted-foreground hover:text-rose-600 hover:bg-rose-50"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                            <Button 
                                                                variant="ghost" 
                                                                size="sm" 
                                                                onClick={() => addListRow(sIdx)}
                                                                className="h-7 text-[10px] w-full border border-dashed border-border/40 hover:bg-primary/5 hover:text-primary"
                                                            >
                                                                <Plus className="w-3 h-3 mr-1" /> Add Option to {section.title || `Section ${sIdx + 1}`}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Carousel Builder (`CAROUSEL`) */}
                                    {selectedType === 'CAROUSEL' && (
                                        <div className="space-y-6 pt-4 border-t border-border/40">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-muted-foreground/70 flex items-center gap-2">
                                                    <LayoutTemplate className="w-3.5 h-3.5" /> Carousel Cards ({formData.carouselCards.length}/10)
                                                </Label>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    onClick={addCarouselCard}
                                                    disabled={formData.carouselCards.length >= 10}
                                                    className="h-8 text-xs gap-2 rounded-lg border-primary/20 text-primary hover:bg-primary/5"
                                                >
                                                    <Plus className="w-3.5 h-3.5" /> Add Card
                                                </Button>
                                            </div>
                                            <div className="space-y-6">
                                                {formData.carouselCards.map((card, cIdx) => (
                                                    <div key={cIdx} className="space-y-4 p-5 bg-background border border-border/60 rounded-2xl shadow-sm relative group/card">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Card #{cIdx + 1}</span>
                                                            {formData.carouselCards.length > 1 && (
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="icon" 
                                                                    onClick={() => setFormData({ ...formData, carouselCards: formData.carouselCards.filter((_, i) => i !== cIdx) })}
                                                                    className="h-8 w-8 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover/card:opacity-100 transition-opacity"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                        <div className="space-y-3">
                                                            <div className="space-y-1.5">
                                                                <Label className="text-[10px] text-muted-foreground underline decoration-primary/20 underline-offset-2">Card Image/Video URL</Label>
                                                                <Input 
                                                                    placeholder="https://..."
                                                                    value={card.mediaUrl}
                                                                    onChange={(e) => updateCarouselCard(cIdx, 'mediaUrl', e.target.value)}
                                                                    className="h-9 bg-muted/5 text-xs font-medium"
                                                                />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <Label className="text-[10px] text-muted-foreground underline decoration-primary/20 underline-offset-2">Card Body Content</Label>
                                                                <Textarea 
                                                                    placeholder="Card description..."
                                                                    value={card.body}
                                                                    onChange={(e) => updateCarouselCard(cIdx, 'body', e.target.value)}
                                                                    className="min-h-[80px] p-3 text-xs bg-muted/5 border-dashed"
                                                                />
                                                            </div>
                                                            <div className="space-y-2 pt-2 border-t border-border/20">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-[9px] font-medium text-muted-foreground">Action Buttons ({card.buttons.length}/3)</span>
                                                                    <Button 
                                                                        variant="ghost" 
                                                                        size="sm" 
                                                                        disabled={card.buttons.length >= 3}
                                                                        onClick={() => addCarouselButton(cIdx)}
                                                                        className="h-6 text-[9px] px-2 hover:bg-primary/5 hover:text-primary"
                                                                    >
                                                                        <Plus className="w-2.5 h-2.5 mr-1" /> Add Action
                                                                    </Button>
                                                                </div>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {card.buttons.map((btn, bIdx) => (
                                                                        <div key={bIdx} className="flex-1 min-w-[120px] flex gap-1">
                                                                            <Input 
                                                                                placeholder="Label..."
                                                                                value={btn.text}
                                                                                onChange={(e) => updateCarouselButton(cIdx, bIdx, e.target.value)}
                                                                                className="h-8 text-[10px] font-bold bg-primary/5 border-primary/20"
                                                                            />
                                                                            <Button 
                                                                                variant="ghost" 
                                                                                size="icon" 
                                                                                onClick={() => {
                                                                                    const newCards = [...formData.carouselCards];
                                                                                    newCards[cIdx].buttons = newCards[cIdx].buttons.filter((_, i) => i !== bIdx);
                                                                                    setFormData({ ...formData, carouselCards: newCards });
                                                                                }}
                                                                                className="h-8 w-8 text-rose-400 hover:text-rose-600"
                                                                            >
                                                                                <X className="w-3 h-3" />
                                                                            </Button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Poll Editor */}
                                    {selectedType === 'POLL' && (
                                        <div className="space-y-4 pt-4 border-t border-border/40">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-muted-foreground/70 flex items-center gap-2">
                                                    <BarChart3 className="w-3.5 h-3.5" /> Poll Choices
                                                </Label>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    onClick={addPollOption}
                                                    className="h-8 text-xs gap-2 rounded-lg border-primary/20 text-primary hover:bg-primary/5"
                                                >
                                                    <Plus className="w-3.5 h-3.5" /> Add Choice
                                                </Button>
                                            </div>
                                            <div className="space-y-3">
                                                {formData.pollOptions.map((opt, idx) => (
                                                    <div key={idx} className="flex gap-2">
                                                        <Input 
                                                            placeholder={`Option ${idx + 1}...`}
                                                            value={opt}
                                                            onChange={(e) => updatePollOption(idx, e.target.value)}
                                                            className="h-10 bg-background border focus-visible:ring-primary/20"
                                                        />
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            onClick={() => removePollOption(idx)}
                                                            disabled={formData.pollOptions.length <= 2}
                                                            className="h-10 w-10 shrink-0 text-muted-foreground hover:text-rose-600 hover:bg-rose-50"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Standard Footer */}
                                    <div className="space-y-2.5 border-t border-border/40 pt-4">
                                        <Label className="text-muted-foreground/70">Message Footer (Optional)</Label>
                                        <Input
                                            placeholder="Enter footer text (e.g. Reply STOP to unsubscribe)"
                                            value={formData.footer}
                                            onChange={e => setFormData({ ...formData, footer: e.target.value })}
                                            className="bg-background border focus-visible:ring-primary/20 transition-all text-xs"
                                        />
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>

                        <div className="p-4 border-t backdrop-blur-md flex items-center justify-end gap-4">
                            <Button variant="outline" className="text-muted-foreground hover:text-foreground text-xs" onClick={() => onOpenChange(false)} disabled={isLoading}>
                                <X className="w-4 h-4 mr-2" /> Discard Template
                            </Button>
                            <Button

                                className="shadow-sm shadow-primary/20 hover:shadow-primary/30 transition-all gap-3 bg-primary rounded-md"
                                onClick={handleSave}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Sparkles className="w-4 h-4" />
                                )}
                                {initialData ? 'Update Template' : 'Save Template'}
                            </Button>
                        </div>

                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
