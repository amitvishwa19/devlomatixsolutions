"use client";

import React from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Users, MessageSquare, FileText, Image, Video, List } from 'lucide-react';

export default function NewCampaignSheet({ open, onOpenChange, campaign, editForm, setEditForm, templates, onSave, isSaving, onOpenContactSelector }) {
    const selectedTemplate = editForm.templateId
        ? templates.find((t) => t.id === editForm.templateId)
        : null;

    const typeIcons = {
        TEXT: <MessageSquare className="w-3 h-3" />,
        IMAGE: <Image className="w-3 h-3" />,
        VIDEO: <Video className="w-3 h-3" />,
        DOCUMENT: <FileText className="w-3 h-3" />,
        INTERACTIVE: <List className="w-3 h-3" />,
        LIST: <List className="w-3 h-3" />,
        CAROUSEL: <List className="w-3 h-3" />,
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="min-w-[620px] bg-transparent border-0 p-2 overflow-hidden">
                <div className="bg-card border rounded-md h-full p-2 overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>{campaign ? 'Edit Campaign' : 'New Campaign'}</SheetTitle>
                    </SheetHeader>
                    <ScrollArea className='h-[80vh]'>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Campaign Name</label>
                                    <Input
                                        placeholder="e.g., Summer Sale Blast"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                                        className="bg-background" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Select Template</label>
                                    <Select
                                        value={editForm.templateId}
                                        onValueChange={(val) => {
                                            const selected = templates.find((t) => t.id === val);
                                            if (selected) {
                                                setEditForm((prev) => ({
                                                    ...prev,
                                                    templateId: selected.id,
                                                    messageType: (() => { if (selected.type === 'INTERACTIVE') return 'interactive-button'; if (selected.type === 'LIST') return 'interactive-group'; return selected.type.toLowerCase(); })(),
                                                    template: selected.body,
                                                    intBody: selected.body,
                                                    intFooter: selected.footer || '',
                                                    intButton: selected.type === 'LIST' ? selected.metadata?.listButton || 'Select' : selected.buttons?.[0] || 'Options',
                                                    intSections: selected.type === 'LIST' ?
                                                        JSON.stringify(selected.metadata?.listSections || [], null, 2) :
                                                        JSON.stringify([{ title: 'Options', rows: (selected.buttons || []).map((b) => ({ title: b, id: b })) }], null, 2),
                                                    mediaUrl: selected.metadata?.mediaUrl || selected.metadata?.cards?.[0]?.mediaUrl || ''
                                                }));
                                            }
                                        }}>
                                        <SelectTrigger className="bg-background">
                                            <SelectValue placeholder="Select a template" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {templates.map((t) =>
                                                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {selectedTemplate ? (
                                <div className="border rounded-md overflow-hidden bg-muted/20">
                                    <div className="flex items-center justify-between p-4 pb-3">
                                        <span className="font-semibold text-sm">{selectedTemplate.name}</span>
                                        <Badge variant="outline" className="text-[10px] gap-1">
                                            {typeIcons[selectedTemplate.type] || <MessageSquare className="w-3 h-3" />}
                                            {selectedTemplate.type}
                                        </Badge>
                                    </div>

                                    <div className="px-4 pb-4 space-y-3">
                                        {(selectedTemplate.type === 'IMAGE' || selectedTemplate.type === 'VIDEO') && (
                                            <div className="rounded-md overflow-hidden bg-background border">
                                                {selectedTemplate.metadata?.mediaUrl ? (
                                                    selectedTemplate.type === 'VIDEO' ? (
                                                        <video src={selectedTemplate.metadata.mediaUrl} className="w-full h-[180px] object-cover" controls />
                                                    ) : (
                                                        <img src={selectedTemplate.metadata.mediaUrl} className="w-full h-[180px] object-cover" alt="" />
                                                    )
                                                ) : (
                                                    <div className="h-[180px] flex items-center justify-center">
                                                        {selectedTemplate.type === 'VIDEO' ? <Video className="w-10 h-10 text-muted-foreground/30" /> : <Image className="w-10 h-10 text-muted-foreground/30" />}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {selectedTemplate.header && selectedTemplate.type !== 'IMAGE' && selectedTemplate.type !== 'VIDEO' && (
                                            <div className="text-xs text-muted-foreground bg-muted/50 rounded px-3 py-2 border">
                                                <span className="font-medium text-foreground/70">Header:</span> {selectedTemplate.header}
                                            </div>
                                        )}

                                        <div className="text-sm whitespace-pre-wrap bg-background rounded-md p-3 border leading-relaxed">
                                            {selectedTemplate.body}
                                        </div>

                                        {selectedTemplate.footer && (
                                            <p className="text-xs text-muted-foreground italic border-t pt-2">{selectedTemplate.footer}</p>
                                        )}

                                        {selectedTemplate.buttons && Array.isArray(selectedTemplate.buttons) && selectedTemplate.buttons.length > 0 && selectedTemplate.type !== 'CAROUSEL' && (
                                            <div className="flex flex-wrap gap-1.5 pt-2 border-t">
                                                {selectedTemplate.buttons.map((b, i) => (
                                                    <span key={i} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                                                        {typeof b === 'string' ? b : b.text || b.title || b}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {selectedTemplate.type === 'CAROUSEL' && selectedTemplate.metadata?.cards && selectedTemplate.metadata.cards.length > 0 && (
                                        <div className="px-4 pb-4">
                                            <ScrollArea className="w-full">
                                                <div className="flex gap-3 pb-2">
                                                    {selectedTemplate.metadata.cards.map((card, idx) => (
                                                        <div key={idx} className="min-w-[200px] max-w-[220px] rounded-lg overflow-hidden border bg-background shrink-0">
                                                            {card.mediaUrl ? (
                                                                <img src={card.mediaUrl} className="w-full h-[130px] object-cover" alt="" />
                                                            ) : (
                                                                <div className="h-[130px] bg-muted flex items-center justify-center">
                                                                    <Image className="w-6 h-6 text-muted-foreground/30" />
                                                                </div>
                                                            )}
                                                            <div className="p-2.5 space-y-1.5">
                                                                <p className="text-xs whitespace-pre-wrap line-clamp-3">{card.body || 'No content'}</p>
                                                                {card.buttons && card.buttons.filter(Boolean).length > 0 && (
                                                                    <div className="pt-1.5 border-t space-y-0.5">
                                                                        {card.buttons.filter(Boolean).map((b, bi) => (
                                                                            <p key={bi} className="text-[10px] font-semibold text-primary text-center py-1">{typeof b === 'string' ? b : b.text || 'Button'}</p>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <ScrollBar orientation="horizontal" />
                                            </ScrollArea>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="border border-dashed rounded-md p-10 text-center text-muted-foreground">
                                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                    <p className="text-xs">Select a template to preview the message</p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-medium text-muted-foreground">Mobile Numbers</label>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-6 text-[10px] px-2"
                                            onClick={onOpenContactSelector}>
                                            <Users className="w-3 h-3 mr-1" />
                                            Select from Contacts
                                        </Button>
                                        <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">One per line. Format: Phone, Var1, Var2</span>
                                    </div>
                                </div>
                                <div className="relative">
                                    <textarea
                                        value={editForm.phone}
                                        rows={4}
                                        onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
                                        placeholder="+1234567890, John, New York&#10;+19876543210, Sarah, London"
                                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono min-h-[100px] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                                </div>
                                <p className="text-[10px] text-muted-foreground italic">Use {"{{v1}}"}, {"{{v2}}"} in template to inject variables.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                                    <Select
                                        value={editForm.status}
                                        onValueChange={(val) => setEditForm((prev) => ({ ...prev, status: val }))}>
                                        <SelectTrigger className="w-full bg-background">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="RUNNING">RUNNING</SelectItem>
                                            <SelectItem value="DRAFT">DRAFT</SelectItem>
                                            <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                                            <SelectItem value="SCHEDULED">SCHEDULED</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Schedule Time (Optional)</label>
                                    <Input
                                        type="datetime-local"
                                        value={editForm.scheduledAt}
                                        onChange={(e) => setEditForm((prev) => ({ ...prev, scheduledAt: e.target.value }))}
                                        className="bg-background" />
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                    <SheetFooter>
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button onClick={onSave} disabled={isSaving} className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[80px]">
                            {isSaving ? <span className="flex items-center gap-2"><span className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" /> Saving...</span> : "Save"}
                        </Button>
                    </SheetFooter>
                </div>
            </SheetContent>
        </Sheet>
    );
}
