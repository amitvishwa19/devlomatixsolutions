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
    Info
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
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                category: initialData.category || 'Utility',
                header: initialData.header || '',
                content: initialData.body || '',
                footer: initialData.footer || '',
            });
            setSelectedType(initialData.type || 'TEXT');
        } else {
            setFormData({
                name: '',
                category: 'Utility',
                header: '',
                content: '',
                footer: '',
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
        onSave({ ...formData, type: selectedType });
    };

    const insertVariable = (variable) => {
        setFormData(prev => ({
            ...prev,
            content: prev.content + ` {{${variable}}}`
        }));
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
                            <div className="p-8 space-y-10 pb-10">
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
                                                    ? 'border-primary bg-primary/5 shadow-md shadow-primary/5'
                                                    : 'bg-card border-border/40 hover:border-primary/30 hover:bg-muted/30 opacity-70 hover:opacity-100'
                                                    }`}
                                            >
                                                <div className={`p-2 rounded-xl transition-all ${selectedType === type.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-muted group-hover:bg-primary/10 group-hover:text-primary'}`}>
                                                    <type.icon className="w-4 h-4" />
                                                </div>
                                                <div className="mt-3">
                                                    <p className={`text-[11px] leading-tight ${selectedType === type.id ? 'text-primary' : 'text-foreground'}`}>{type.label}</p>
                                                    <p className="text-[9px] text-muted-foreground/60 mt-1 line-clamp-1">{type.description}</p>
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

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                                {/* Header & Body Editor */}
                                <div className="space-y-6">
                                    <div className="space-y-2.5">
                                        <Label className="text-muted-foreground/70">Message Header (Optional)</Label>
                                        <Input
                                            placeholder="Enter header text or media URL..."
                                            value={formData.header}
                                            onChange={e => setFormData({ ...formData, header: e.target.value })}
                                            className="bg-muted/10 border focus-visible:ring-primary/20 transition-all"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-muted-foreground/70">Message Body</Label>
                                            <div className="flex gap-2">
                                                {['name', 'date', 'location'].map(v => (
                                                    <Button
                                                        key={v}
                                                        variant="outline"
                                                        size="sm"
                                                        className=" text-xs px-2 gap-1 border-border/40 hover:bg-primary/5 hover:text-primary hover:border-primary/20 rounded-lg"
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
                                                className=" p-5 text-sm bg-muted/5 border focus:border-primary/20  transition-all  leading-relaxed font-medium rounded-lg"
                                            />
                                            <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity">
                                                <Info className="w-3.5 h-3.5" />
                                                <span className="text-[9px]  tracking-tighter">Markdown Enabled</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2.5">
                                        <Label className="text-muted-foreground/70">Message Footer (Optional)</Label>
                                        <Input
                                            placeholder="Enter footer text (e.g. Reply STOP to unsubscribe)"
                                            value={formData.footer}
                                            onChange={e => setFormData({ ...formData, footer: e.target.value })}
                                            className="bg-muted/10 border focus-visible:ring-primary/20 transition-all text-xs"
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
