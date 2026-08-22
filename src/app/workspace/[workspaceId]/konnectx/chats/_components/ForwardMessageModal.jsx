'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Forward,
    Search,
    User,
    Users,
    MessageSquare,
    Smartphone,
    Plus,
    X,
    Check,
    CheckCircle2,
    Loader2,
    ImageIcon,
    FileText,
    Video,
    Music,
    MapPin,
    Layout
} from 'lucide-react';
import { toast } from 'sonner';

export default function ForwardMessageModal({
    isOpen,
    onClose,
    message = null,
    contacts = [],
    conversations = [],
    workspaceId,
    onForward,
    isLoading = false
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRecipients, setSelectedRecipients] = useState([]); // array of { id, name, phone }
    const [manualPhone, setManualPhone] = useState('');
    const [activeTab, setActiveTab] = useState('contacts'); // 'contacts' | 'chats' | 'manual'

    useEffect(() => {
        if (isOpen) {
            setSelectedRecipients([]);
            setSearchTerm('');
            setManualPhone('');
        }
    }, [isOpen]);

    if (!message) return null;

    // Extract Message Type & Content
    const metadata = message.metadata || {};
    const rawType = metadata.type?.toLowerCase() || 'text';
    const isTemplate = rawType === 'template' || Boolean(metadata.templateName) || (typeof message.text === 'string' && message.text.startsWith('[Template:'));
    const msgType = isTemplate ? 'template' : rawType;
    const mediaUrl = metadata.mediaUrl || metadata.originalPayload?.[rawType]?.url || metadata.originalPayload?.[rawType]?.link;
    const caption = metadata.caption || metadata.originalPayload?.[rawType]?.caption || '';
    const textContent = message.text || '';

    // Filter contacts with valid phone numbers
    const validContacts = contacts.filter(c => c.phone || c.phoneNumber || c.mobile);
    const filteredContacts = validContacts.filter(c => {
        const name = `${c.name || ''} ${c.firstName || ''} ${c.lastName || ''} ${c.displayName || ''}`.toLowerCase();
        const phone = (c.phone || c.phoneNumber || c.mobile || '').toLowerCase();
        return name.includes(searchTerm.toLowerCase()) || phone.includes(searchTerm.toLowerCase());
    });

    // Filter active conversations
    const filteredConversations = conversations.filter(chat => {
        const name = (chat.name || chat.jid.split('@')[0]).toLowerCase();
        const phone = chat.jid.split('@')[0].toLowerCase();
        return name.includes(searchTerm.toLowerCase()) || phone.includes(searchTerm.toLowerCase());
    });

    const isSelected = (phone) => {
        const clean = phone.replace(/[^\d+]/g, '');
        return selectedRecipients.some(r => r.phone.replace(/[^\d+]/g, '') === clean);
    };

    const toggleRecipient = (name, phone) => {
        const cleanPhone = phone.replace(/[^\d+]/g, '');
        if (!cleanPhone) return;

        if (isSelected(cleanPhone)) {
            setSelectedRecipients(prev => prev.filter(r => r.phone.replace(/[^\d+]/g, '') !== cleanPhone));
        } else {
            setSelectedRecipients(prev => [...prev, { name: name || cleanPhone, phone: cleanPhone }]);
        }
    };

    const handleAddManualPhone = (e) => {
        e?.preventDefault();
        const clean = manualPhone.replace(/[^\d+]/g, '');
        if (!clean || clean.length < 7) {
            toast.error("Please enter a valid international phone number (e.g. +919876543210)");
            return;
        }
        if (isSelected(clean)) {
            toast.info("Number already in recipient list");
            return;
        }
        setSelectedRecipients(prev => [...prev, { name: `Direct: ${clean}`, phone: clean }]);
        setManualPhone('');
    };

    const handleConfirmForward = () => {
        if (selectedRecipients.length === 0) {
            toast.error("Please select at least one recipient to forward to");
            return;
        }

        const phoneList = selectedRecipients.map(r => r.phone);

        const payload = {
            type: msgType,
            text: textContent,
            body: textContent,
            mediaUrl,
            caption,
            location: metadata.location || metadata.originalPayload?.location,
            template: metadata.template || metadata.originalPayload?.template
        };

        onForward(phoneList, payload);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-lg max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="px-6 pt-6 pb-3 border-b border-border/40">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
                            <Forward className="w-5 h-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                                Forward Message
                                {selectedRecipients.length > 0 && (
                                    <Badge variant="secondary" className="text-xs px-2 py-0 h-5 font-bold">
                                        {selectedRecipients.length} selected
                                    </Badge>
                                )}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                Share this message to your contacts, recent chats, or any phone number
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 flex flex-col overflow-hidden">
                    <ScrollArea className="flex-1 px-6 py-4 max-h-[calc(90vh-140px)]">
                        <div className="space-y-4 pb-2">
                            {/* Message Preview Box */}
                            <div className="p-3 bg-muted/20 border border-border/50 rounded-xl space-y-1.5">
                                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                    <Forward className="w-3 h-3 text-primary" />
                                    Forwarded Message Content
                                </div>
                                <div className="bg-card/70 border border-border/40 p-2.5 rounded-lg text-xs">
                                    {msgType === 'text' && (
                                        <p className="whitespace-pre-wrap break-words text-foreground leading-relaxed line-clamp-3">
                                            {textContent}
                                        </p>
                                    )}
                                    {msgType === 'image' && (
                                        <div className="flex items-center gap-2.5">
                                            {mediaUrl && (
                                                <img
                                                    src={mediaUrl}
                                                    alt="Media preview"
                                                    className="w-12 h-12 object-cover rounded-md border"
                                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                />
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-1 text-primary font-semibold text-xs">
                                                    <ImageIcon className="w-3.5 h-3.5" /> Image
                                                </div>
                                                {caption && <p className="text-[11px] text-muted-foreground truncate">{caption}</p>}
                                            </div>
                                        </div>
                                    )}
                                    {msgType === 'video' && (
                                        <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                                            <Video className="w-4 h-4" /> Video Message {caption ? `— ${caption}` : ''}
                                        </div>
                                    )}
                                    {msgType === 'audio' && (
                                        <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                                            <Music className="w-4 h-4" /> Audio Voice Note
                                        </div>
                                    )}
                                    {msgType === 'document' && (
                                        <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                                            <FileText className="w-4 h-4" /> Document File {caption ? `— ${caption}` : ''}
                                        </div>
                                    )}
                                    {msgType === 'template' && (
                                        <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400">
                                            <Layout className="w-4 h-4" /> Template: {metadata.templateName || 'Verified Meta Template'}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Selected Recipients Pills */}
                            {selectedRecipients.length > 0 && (
                                <div className="space-y-1.5">
                                    <div className="text-[11px] font-semibold text-muted-foreground">
                                        Selected Recipients ({selectedRecipients.length}):
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 bg-muted/10 border border-border/30 rounded-lg">
                                        {selectedRecipients.map((rec, idx) => (
                                            <Badge
                                                key={idx}
                                                variant="secondary"
                                                className="gap-1.5 text-xs py-0.5 px-2 bg-primary/10 text-primary border border-primary/20 rounded-md"
                                            >
                                                <span>{rec.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleRecipient(rec.name, rec.phone)}
                                                    className="hover:text-destructive transition-colors ml-0.5"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Recipient Source Tabs */}
                            <div className="space-y-2">
                                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                    <TabsList className="grid grid-cols-3 h-8 p-0.5 bg-muted/30 border">
                                        <TabsTrigger value="contacts" className="text-[11px] font-semibold gap-1 px-2 h-7">
                                            <Users className="w-3 h-3" />
                                            Contacts ({validContacts.length})
                                        </TabsTrigger>
                                        <TabsTrigger value="chats" className="text-[11px] font-semibold gap-1 px-2 h-7">
                                            <MessageSquare className="w-3 h-3" />
                                            Recent Chats
                                        </TabsTrigger>
                                        <TabsTrigger value="manual" className="text-[11px] font-semibold gap-1 px-2 h-7">
                                            <Smartphone className="w-3 h-3" />
                                            Direct Phone
                                        </TabsTrigger>
                                    </TabsList>

                                    {/* Search Bar for Contacts & Chats */}
                                    {activeTab !== 'manual' && (
                                        <div className="relative pt-2">
                                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                            <Input
                                                placeholder={activeTab === 'contacts' ? "Search contacts by name or number..." : "Search recent chat threads..."}
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="h-9 text-xs pl-8"
                                            />
                                        </div>
                                    )}

                                    {/* Contacts Tab Content */}
                                    <TabsContent value="contacts" className="pt-2">
                                        {filteredContacts.length > 0 ? (
                                            <ScrollArea className="h-48 border border-border/40 rounded-lg p-1 bg-background/50">
                                                <div className="space-y-1">
                                                    {filteredContacts.map((c) => {
                                                        const cName = c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.displayName || 'Contact';
                                                        const cPhone = c.phone || c.phoneNumber || c.mobile || '';
                                                        const selected = isSelected(cPhone);

                                                        return (
                                                            <div
                                                                key={c.id}
                                                                onClick={() => toggleRecipient(cName, cPhone)}
                                                                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors text-xs border ${selected ? 'bg-primary/10 border-primary/40' : 'border-transparent hover:bg-muted/40'}`}
                                                            >
                                                                <div className="flex items-center gap-2.5 min-w-0">
                                                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${selected ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>
                                                                        {selected ? <Check className="w-3.5 h-3.5" /> : cName[0]?.toUpperCase()}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <div className="font-semibold text-foreground truncate">{cName}</div>
                                                                        <div className="text-[10px] text-muted-foreground font-mono">{cPhone}</div>
                                                                    </div>
                                                                </div>
                                                                {c.category && (
                                                                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-emerald-500/30 text-emerald-600 shrink-0">
                                                                        {c.category}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </ScrollArea>
                                        ) : (
                                            <div className="text-center py-6 text-xs text-muted-foreground border border-dashed rounded-lg">
                                                No matching contacts found.
                                            </div>
                                        )}
                                    </TabsContent>

                                    {/* Recent Chats Tab Content */}
                                    <TabsContent value="chats" className="pt-2">
                                        {filteredConversations.length > 0 ? (
                                            <ScrollArea className="h-48 border border-border/40 rounded-lg p-1 bg-background/50">
                                                <div className="space-y-1">
                                                    {filteredConversations.map((chat) => {
                                                        const chatName = chat.name || chat.jid.split('@')[0];
                                                        const chatPhone = chat.jid.split('@')[0];
                                                        const selected = isSelected(chatPhone);

                                                        return (
                                                            <div
                                                                key={chat.jid}
                                                                onClick={() => toggleRecipient(chatName, chatPhone)}
                                                                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors text-xs border ${selected ? 'bg-primary/10 border-primary/40' : 'border-transparent hover:bg-muted/40'}`}
                                                            >
                                                                <div className="flex items-center gap-2.5 min-w-0">
                                                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${selected ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>
                                                                        {selected ? <Check className="w-3.5 h-3.5" /> : chatName[0]?.toUpperCase()}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <div className="font-semibold text-foreground truncate">{chatName}</div>
                                                                        <div className="text-[10px] text-muted-foreground font-mono">{chatPhone}</div>
                                                                    </div>
                                                                </div>
                                                                <span className="text-[10px] text-muted-foreground shrink-0">Recent Thread</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </ScrollArea>
                                        ) : (
                                            <div className="text-center py-6 text-xs text-muted-foreground border border-dashed rounded-lg">
                                                No active conversations found.
                                            </div>
                                        )}
                                    </TabsContent>

                                    {/* Direct Phone Tab Content */}
                                    <TabsContent value="manual" className="pt-2 space-y-2">
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <Smartphone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                                <Input
                                                    placeholder="+91 98765 43210"
                                                    value={manualPhone}
                                                    onChange={(e) => setManualPhone(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleAddManualPhone(e)}
                                                    className="h-9 text-xs pl-8 font-mono"
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={handleAddManualPhone}
                                                className="h-9 text-xs gap-1"
                                            >
                                                <Plus className="w-3.5 h-3.5" /> Add
                                            </Button>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground">
                                            Include international country code prefix (e.g. +91 for India, +1 for US/Canada).
                                        </p>
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </div>
                    </ScrollArea>

                    <DialogFooter className="px-6 py-3 border-t border-border/40 bg-muted/10 gap-2">
                        <Button variant="outline" type="button" onClick={onClose} disabled={isLoading} className="h-9 text-xs">
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleConfirmForward}
                            disabled={isLoading || selectedRecipients.length === 0}
                            className="h-9 text-xs gap-1.5 bg-primary text-white"
                        >
                            {isLoading ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <Forward className="w-3.5 h-3.5" />
                            )}
                            Forward {selectedRecipients.length > 0 ? `(${selectedRecipients.length})` : ''}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
