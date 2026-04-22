'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MultiSelect } from "@/components/ui/multi-select";
import {
    Megaphone,
    Users,
    LayoutTemplate,
    Activity,
    Clock,
    Save,
    X,
    MessageCircle,
    CheckCircle2,
    Calendar,
    Send,
    Eye,
    Tag,
    Layers
} from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function CampaignModal({
    isOpen,
    onOpenChange,
    activeCampaign,
    templates = [],
    groups = [],
    tags = [],
    categories = [],
    onSave,
    isLoading
}) {
    const [formData, setFormData] = useState({
        name: '',
        templateId: '',
        recipients: '',
        groupIds: [],
        categoryIds: [],
        tags: [],
        status: 'PAUSED',
        template: '',
        messageTemplate: null
    });

    useEffect(() => {
        if (activeCampaign) {
            const meta = activeCampaign.messageTemplate?.metadata || {};
            setFormData({
                name: activeCampaign.name || '',
                templateId: activeCampaign.templateId || '',
                recipients: String(meta.recipientsRaw || ''),
                groupIds: meta.groupIds || [],
                categoryIds: meta.categoryIds || [],
                tags: meta.tags || [],
                status: activeCampaign.status || 'PAUSED',
                template: activeCampaign.templateBody || '',
                messageTemplate: activeCampaign.messageTemplate || null
            });
        } else {
            setFormData({
                name: '',
                templateId: '',
                recipients: '',
                groupIds: [],
                categoryIds: [],
                tags: [],
                status: 'PAUSED',
                template: '',
                messageTemplate: null
            });
        }
    }, [activeCampaign, isOpen]);

    const handleTemplateChange = (val) => {
        const t = templates.find(temp => temp.id === val);
        setFormData({
            ...formData,
            templateId: val,
            template: t?.body || t?.text || '',
            messageTemplate: t || null
        });
    };

    const handleSave = () => {
        onSave(formData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="min-w-[50%] p-0 overflow-hidden border bg-background/95 backdrop-blur-xl shadow-2xl rounded-3xl h-[92vh] max-h-[880px] flex flex-col">
                <div className="flex h-full min-h-0 overflow-hidden">


                    {/* Left Side: Form */}
                    <div className="flex flex-col min-w-0 border-r border-border/40 bg-background/50">
                        <DialogHeader className="p-6 pb-2">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-primary/10 rounded-xl">
                                    <Megaphone className="w-5 h-5 text-primary" />
                                </div>
                                <div className="space-y-0.5">
                                    <DialogTitle className="text-xl Template">
                                        {activeCampaign ? 'Update Campaign' : 'Initialize Campaign'}
                                    </DialogTitle>
                                    <DialogDescription className="text-xs font-medium text-muted-foreground">
                                        Configure your broadcast settings and audience parameters.
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <ScrollArea className="flex-1 px-2 mx-2">
                            <div className="space-y-6 py-2 pb-10 mx-1">
                                {/* Section 1: Identity */}
                                <div className="space-y-4">

                                    <div className="space-y-2">
                                        <label className="text-[11px] Template text-muted-foreground ml-1">Campaign Name</label>
                                        <Input
                                            placeholder="e.g. Summer Outreach Alpha"
                                            className="border rounded-md bg-muted/30 focus-visible:ring-primary/20 font-medium"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Section 2: Template Selection */}
                                <div className="space-y-4">

                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold Template text-muted-foreground ml-1">Template</label>
                                        <Select value={formData.templateId} onValueChange={handleTemplateChange}>
                                            <SelectTrigger className="rounded-md bg-muted/30 border Template focus:ring-primary/20 transition-all hover:bg-muted/50">
                                                <div className="flex items-center gap-2">
                                                    <LayoutTemplate className="w-4 h-4 text-muted-foreground" />
                                                    <SelectValue placeholder="Select Deployment Protocol" />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent className="rounded-md border">
                                                {templates.map(t => (
                                                    <SelectItem key={t.id} value={t.id} className="text-xs Template py-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `hsl(${Math.random() * 360}, 70%, 50%)` }} />
                                                            {t.name}
                                                            <Badge variant="secondary" className="text-[9px] ml-2 opacity-60 font-medium">{t.type}</Badge>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Section 3: Audience */}
                                <div className="space-y-4">

                                    <Tabs defaultValue="selection" className="w-full">
                                        <TabsList className="grid w-full grid-cols-2 rounded-md bg-muted/50 p-1 h-9">
                                            <TabsTrigger value="selection" className="text-xs Template">Core Targets</TabsTrigger>
                                            <TabsTrigger value="manual" className="text-xs Template">Adhoc List</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="selection" className="space-y-4 pt-4 mt-0 border-none bg-transparent">
                                            <div className="space-y-4 border rounded-xl p-4 bg-muted/20 border-border/40 transition-all">

                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold Template text-muted-foreground/60 uppercase flex items-center gap-2">
                                                        <Layers className="w-3 h-3" /> Audience Categories
                                                    </label>
                                                    <MultiSelect
                                                        options={categories.map(c => ({ id: c, name: c, value: c }))}
                                                        selected={formData.categoryIds.map(c => ({ id: c, name: c }))}
                                                        onChange={(selected) => setFormData({ ...formData, categoryIds: selected.map(s => s.id) })}
                                                        placeholder="Select categories..."
                                                        className="rounded-md bg-muted/30 border Template focus:ring-primary/20 transition-all hover:bg-muted/50"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold Template text-muted-foreground/60 uppercase flex items-center gap-2">
                                                        <Tag className="w-3 h-3" /> Unique Tags
                                                    </label>
                                                    <MultiSelect
                                                        options={tags.map(t => ({ id: t, name: t, value: t }))}
                                                        selected={formData.tags.map(t => ({ id: t, name: t }))}
                                                        onChange={(selected) => setFormData({ ...formData, tags: selected.map(s => s.id) })}
                                                        placeholder="Target specific tags..."
                                                        className="rounded-md bg-muted/30 border Template focus:ring-primary/20 transition-all hover:bg-muted/50"
                                                    />
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="manual" className="pt-4 mt-0 border-none bg-transparent">
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between mb-1">
                                                    <label className="text-[11px] Template text-muted-foreground ml-1">Recipients (CSV List)</label>
                                                    <span className="text-[9px] Template text-muted-foreground/40 italic uppercase">Phone, Name, Variable1...</span>
                                                </div>
                                                <Textarea
                                                    rows={8}
                                                    placeholder="+123456789, John Doe, 20% Off&#10;+987654321, Jane Smith, Exclusive Access"
                                                    className="min-h-[160px] rounded-md bg-muted/30 border-border/40 p-4 font-mono text-xs leading-relaxed focus-visible:ring-primary/20 resize-none transition-all focus:bg-muted/10 shrink-0"
                                                    value={formData.recipients}
                                                    onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
                                                />
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </div>

                                {/* Section 4: Schedule & Status */}
                                <div className="space-y-4 pb-4 mx-1">

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs Template text-muted-foreground ml-1">Operational State</label>
                                            <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                                                <SelectTrigger className="rounded-md bg-muted/30 border Template focus:ring-primary/20 transition-all hover:bg-muted/50">
                                                    <div className="flex items-center gap-2">
                                                        <Activity className="w-4 h-4 text-muted-foreground" />
                                                        <SelectValue />
                                                    </div>
                                                </SelectTrigger>
                                                <SelectContent className="rounded-md border">
                                                    <SelectItem value="PAUSED" className="text-xs Template py-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                            PAUSED
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="RUNNING" className="text-xs Template py-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                            READY / SHIP
                                                        </div>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs Template text-muted-foreground ml-1">Auto-Launch Schedule</label>
                                            <div className="relative">
                                                <Input type="datetime-local" className="rounded-md bg-muted/30 border Template text-xs" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>

                        <div className="p-6 bg-muted/10 border-t border-border/40">
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    size={'md'}
                                    className="flex-1  Template text-xs  hover:bg-background"
                                    onClick={() => onOpenChange(false)}
                                >
                                    CANCEL
                                </Button>
                                <Button
                                    size={'md'}
                                    className="  shadow-primary/20 "
                                    onClick={handleSave}
                                    disabled={isLoading || !formData.name}
                                >
                                    {isLoading ? (
                                        <CheckCircle2 className="w-4 h-4 animate-spin mr-2" />
                                    ) : (
                                        <Save className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                                    )}
                                    {activeCampaign ? 'Update Campaign' : 'Save Campaign'}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Preview */}
                    <div className=" bg-muted/30 flex flex-col overflow-hidden relative">
                        <div className="absolute inset-0 bg-grid-white/5 opacity-20 pointer-events-none" />

                        <div className="p-8 pb-4 flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-2">
                                <Eye className="w-4 h-4 text-primary" />
                                <span className="text-[10px] Template uppercase tracking-[0.2em] text-muted-foreground">Live Simulation</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[8px] Template text-emerald-600 uppercase">Connected</span>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
                            {/* WhatsApp Style Chat Preview */}
                            <div className="w-full max-w-[280px] bg-background rounded-2xl shadow-2xl overflow-hidden border border-border/20">
                                <div className="bg-[#075e54] p-3 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#128c7e] flex items-center justify-center text-white text-[10px] Template border border-white/20">
                                        DV
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] Template text-white truncate">Devlomatix Swarm</p>
                                        <p className="text-[8px] text-white/60 font-medium">Business Channel Official</p>
                                    </div>
                                    <CheckCircle2 className="w-3.5 h-3.5 text-white bg-[#34b7f1] rounded-full p-0.5" />
                                </div>
                                <div className="p-3 bg-[#e5ddd5] min-h-[220px] background-chat flex flex-col gap-2">
                                    <div className="self-end bg-white rounded-lg rounded-tr-none p-3 shadow-md border-b-2 border-emerald-500/10 max-w-[90%]">
                                        <div className="text-[11px] text-zinc-800 leading-relaxed font-medium whitespace-pre-wrap">
                                            {formData.template || "Configure your message to see a simulation here..."}
                                        </div>
                                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-zinc-100">
                                            <span className="text-[8px] text-zinc-400 Template">10:42 PM</span>
                                            <div className="flex items-center -space-x-1">
                                                <CheckCircle2 className="w-2.5 h-2.5 text-sky-400" />
                                                <CheckCircle2 className="w-2.5 h-2.5 text-sky-400" />
                                            </div>
                                        </div>
                                    </div>

                                    {formData.templateId && (() => {
                                        const selectedTemplate = templates.find(t => t.id === formData.templateId);
                                        if (!selectedTemplate?.buttons?.length) return null;

                                        return (
                                            <div className="self-center w-full mt-1 space-y-1">
                                                {selectedTemplate.buttons.map((btn, i) => (
                                                    <div key={i} className="bg-white/90 backdrop-blur-sm rounded-lg p-2 text-center shadow-sm border border-white/40">
                                                        <span className="text-[9px] Template text-sky-600 uppercase">
                                                            {typeof btn === 'object' ? (btn.text || btn.label || JSON.stringify(btn)) : btn}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>

                            <div className="mt-8 px-6 text-center">
                                <p className="text-[10px] Template text-muted-foreground/60 uppercase tracking-widest leading-loose">
                                    Broadcast Integrity Check:<br />
                                    <span className="text-primary font-black">Ready for Deployment</span>
                                </p>
                            </div>
                        </div>

                        <div className="p-6 pt-0 relative z-10">
                            <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 space-y-3">
                                <div className="flex items-center gap-2">
                                    <Activity className="w-3.5 h-3.5 text-primary" />
                                    <span className="text-[10px] Template text-primary uppercase">Fleet Intelligence</span>
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between text-[9px] Template text-muted-foreground/80">
                                        <span>Target Context</span>
                                        <span>
                                            {formData.categoryIds.length}C / {formData.tags.length}T
                                            {formData.recipients && ` + ${formData.recipients.split('\n').filter(Boolean).length}L`}
                                        </span>
                                    </div>
                                    <div className="w-full bg-primary/10 rounded-full h-1">
                                        <div className="bg-primary h-full w-[65%] rounded-full shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
