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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Send,
    ShoppingBag,
    Smartphone,
    Check,
    Loader2,
    Package,
    Users,
    UserCheck,
    Search,
    X,
    Sparkles,
    Info,
    CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { useAction } from '@/hooks/use-action';
import { getContacts } from '../../contacts/_actions/get-contacts';

export default function SendProductModal({
    isOpen,
    onClose,
    onSend,
    selectedProduct = null,
    products = [],
    catalogId = null,
    workspaceId,
    isLoading = false
}) {
    const [recipient, setRecipient] = useState('');
    const [selectedContact, setSelectedContact] = useState(null);
    const [recipientMode, setRecipientMode] = useState('contact'); // 'contact' | 'manual'
    const [contactSearch, setContactSearch] = useState('');
    const [contacts, setContacts] = useState([]);
    const [isLoadingContacts, setIsLoadingContacts] = useState(false);

    const [messageType, setMessageType] = useState(selectedProduct ? 'product' : 'catalog_message');
    const [chosenProductId, setChosenProductId] = useState(selectedProduct?.id || products[0]?.id || '');
    const [bodyText, setBodyText] = useState('Check out this featured product from our store:');
    const [footerText, setFooterText] = useState('Devlomatix Store');
    const [customCatalogId, setCustomCatalogId] = useState(catalogId || '');

    const { execute: executeGetContacts } = useAction(getContacts, {
        onSuccess: (data) => {
            const list = Array.isArray(data) ? data : (data?.data || []);
            setContacts(list);
            setIsLoadingContacts(false);
        },
        onError: () => {
            setIsLoadingContacts(false);
        }
    });

    useEffect(() => {
        if (isOpen && workspaceId) {
            setIsLoadingContacts(true);
            executeGetContacts({ workspaceId });
        }
    }, [isOpen, workspaceId]);

    useEffect(() => {
        if (catalogId) {
            setCustomCatalogId(catalogId);
        }
    }, [catalogId, isOpen]);

    useEffect(() => {
        if (selectedProduct) {
            setChosenProductId(selectedProduct.id);
            setMessageType('product');
            setBodyText(`Check out our ${selectedProduct.title || selectedProduct.name}:`);
        } else if (products.length > 0) {
            setChosenProductId(products[0].id);
        }
    }, [selectedProduct, products, isOpen]);

    const activeItem = products.find(p => p.id === chosenProductId) || selectedProduct;

    // Filter contacts with phone numbers
    const validContacts = contacts.filter(c => c.phone || c.phoneNumber || c.mobile);
    const filteredContacts = validContacts.filter(c => {
        const name = `${c.name || ''} ${c.firstName || ''} ${c.lastName || ''} ${c.displayName || ''}`.toLowerCase();
        const phone = (c.phone || c.phoneNumber || c.mobile || '').toLowerCase();
        return name.includes(contactSearch.toLowerCase()) || phone.includes(contactSearch.toLowerCase());
    });

    const handleSelectContact = (contact) => {
        setSelectedContact(contact);
        const rawPhone = contact.phone || contact.phoneNumber || contact.mobile || '';
        setRecipient(rawPhone);
        setContactSearch('');
    };

    const handleClearContact = () => {
        setSelectedContact(null);
        setRecipient('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const cleanPhone = recipient.replace(/[^\d+]/g, '');
        if (!cleanPhone || cleanPhone.length < 7) {
            toast.error("Please enter or select a valid WhatsApp phone number (e.g. +919876543210)");
            return;
        }

        const effectiveCatalogId = customCatalogId?.trim() || catalogId || undefined;

        if (messageType === 'product') {
            if (!activeItem) {
                toast.error("Please select a product to send");
                return;
            }
            onSend({
                to: cleanPhone,
                type: 'product',
                catalogId: effectiveCatalogId,
                productId: activeItem.id,
                retailerId: activeItem.sku || activeItem.retailer_id,
                bodyText: bodyText.trim(),
                footerText: footerText.trim()
            });
        } else {
            onSend({
                to: cleanPhone,
                type: 'catalog_message',
                catalogId: effectiveCatalogId,
                bodyText: bodyText.trim(),
                footerText: footerText.trim()
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-lg max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="px-6 pt-6 pb-3 border-b border-border/40">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-sm">
                            <Send className="w-5 h-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-bold text-foreground">
                                Send to WhatsApp
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                Dispatch product showcases directly to your subscribers or custom contacts
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                    <ScrollArea className="flex-1 px-6 py-4 h-[60vh]">
                        <div className="space-y-4 pb-2">
                            {/* Mode Notification Banner */}
                            <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs ${customCatalogId ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'bg-primary/5 border-primary/20 text-primary'}`}>
                                <div className="flex items-center gap-2 min-w-0">
                                    <Sparkles className="w-4 h-4 shrink-0" />
                                    <div className="min-w-0">
                                        <span className="font-bold">
                                            {customCatalogId ? "Meta Native Catalog Card" : "Rich Product Showcase Card"}
                                        </span>
                                        <p className="text-[10px] opacity-80 truncate">
                                            {customCatalogId ? `Catalog ID: ${customCatalogId}` : "Delivers formatted image, price & checkout link directly to WhatsApp"}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const entered = prompt("Enter Meta Commerce Catalog ID:", customCatalogId);
                                        if (entered !== null) setCustomCatalogId(entered.trim());
                                    }}
                                    className="text-[10px] font-bold underline shrink-0 hover:opacity-80"
                                >
                                    {customCatalogId ? "Edit ID" : "+ Add Catalog ID"}
                                </button>
                            </div>

                            {/* Recipient Contact Selector */}
                            <div className="space-y-2 border border-border/50 rounded-xl p-3.5 bg-muted/10">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-semibold flex items-center gap-1.5">
                                        <Users className="w-3.5 h-3.5 text-primary" />
                                        Recipient Contact / Number *
                                    </Label>
                                    <div className="flex items-center gap-1 bg-muted/30 p-0.5 rounded-lg border">
                                        <button
                                            type="button"
                                            onClick={() => setRecipientMode('contact')}
                                            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${recipientMode === 'contact' ? 'bg-background shadow-xs text-foreground' : 'text-muted-foreground'}`}
                                        >
                                            Saved Contacts
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setRecipientMode('manual');
                                                setSelectedContact(null);
                                            }}
                                            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${recipientMode === 'manual' ? 'bg-background shadow-xs text-foreground' : 'text-muted-foreground'}`}
                                        >
                                            Direct Phone
                                        </button>
                                    </div>
                                </div>

                                {recipientMode === 'contact' ? (
                                    selectedContact ? (
                                        /* Selected Contact Card */
                                        <div className="flex items-center justify-between p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
                                                    {(selectedContact.name || selectedContact.firstName || 'C')[0].toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-xs font-bold text-foreground truncate">
                                                        {selectedContact.name || `${selectedContact.firstName || ''} ${selectedContact.lastName || ''}` || 'Subscriber'}
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground font-mono">
                                                        {recipient}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                                                onClick={handleClearContact}
                                                title="Change contact"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    ) : (
                                        /* Contact Picker Dropdown / Search */
                                        <div className="space-y-2">
                                            <div className="relative">
                                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                                <Input
                                                    placeholder="Search contact by name or phone..."
                                                    value={contactSearch}
                                                    onChange={(e) => setContactSearch(e.target.value)}
                                                    className="h-9 text-xs pl-8"
                                                />
                                            </div>

                                            {isLoadingContacts ? (
                                                <div className="flex items-center justify-center py-4 gap-2 text-xs text-muted-foreground">
                                                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                                    Loading contacts...
                                                </div>
                                            ) : filteredContacts.length > 0 ? (
                                                <ScrollArea className="h-36 border border-border/40 rounded-lg p-1 bg-background/50">
                                                    <div className="space-y-1">
                                                        {filteredContacts.slice(0, 20).map((c) => {
                                                            const cName = c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.displayName || 'Subscriber';
                                                            const cPhone = c.phone || c.phoneNumber || c.mobile || '';
                                                            return (
                                                                <div
                                                                    key={c.id}
                                                                    onClick={() => handleSelectContact(c)}
                                                                    className="flex items-center justify-between p-2 rounded-md hover:bg-muted/40 cursor-pointer transition-colors text-xs"
                                                                >
                                                                    <div className="flex items-center gap-2 min-w-0">
                                                                        <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] shrink-0">
                                                                            {cName[0].toUpperCase()}
                                                                        </div>
                                                                        <span className="font-semibold text-foreground truncate">{cName}</span>
                                                                    </div>
                                                                    <span className="font-mono text-[10px] text-muted-foreground shrink-0">{cPhone}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </ScrollArea>
                                            ) : (
                                                <div className="text-center py-3 text-xs text-muted-foreground border border-dashed rounded-lg">
                                                    {contactSearch ? "No contacts found matching search" : "No saved contacts with phone numbers. Switch to Direct Phone."}
                                                </div>
                                            )}
                                        </div>
                                    )
                                ) : (
                                    /* Manual Phone Input */
                                    <div className="relative">
                                        <Smartphone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                        <Input
                                            placeholder="+91 98765 43210 (Country code included)"
                                            value={recipient}
                                            onChange={(e) => setRecipient(e.target.value)}
                                            className="h-9 text-xs pl-8 font-mono"
                                            required
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Message Type Toggle */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Message Type</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMessageType('product');
                                            setBodyText(activeItem ? `Check out our ${activeItem.title || activeItem.name}:` : 'Check out this product:');
                                        }}
                                        className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${messageType === 'product' ? 'bg-primary/10 border-primary text-primary font-bold' : 'bg-card border-border/50 text-muted-foreground'}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <Package className="w-4 h-4" />
                                            {messageType === 'product' && <Check className="w-3 h-3" />}
                                        </div>
                                        <span className="text-xs">Single Product Card</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMessageType('catalog_message');
                                            setBodyText('Browse our entire collection on WhatsApp!');
                                        }}
                                        className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${messageType === 'catalog_message' ? 'bg-primary/10 border-primary text-primary font-bold' : 'bg-card border-border/50 text-muted-foreground'}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <ShoppingBag className="w-4 h-4" />
                                            {messageType === 'catalog_message' && <Check className="w-3 h-3" />}
                                        </div>
                                        <span className="text-xs">Full Catalog Button</span>
                                    </button>
                                </div>
                            </div>

                            {/* Product Selector */}
                            {messageType === 'product' && (
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Select Product</Label>
                                    {products.length > 0 ? (
                                        <select
                                            value={chosenProductId}
                                            onChange={(e) => {
                                                setChosenProductId(e.target.value);
                                                const p = products.find(prod => prod.id === e.target.value);
                                                if (p) setBodyText(`Check out our ${p.title || p.name}:`);
                                            }}
                                            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        >
                                            {products.map(p => (
                                                <option key={p.id} value={p.id}>
                                                    {p.title || p.name} — {p.currency || 'INR'} {p.price} ({p.sku || p.retailer_id})
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <p className="text-xs text-muted-foreground italic">No products available in catalog.</p>
                                    )}
                                </div>
                            )}

                            {/* Body & Footer */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Message Text</Label>
                                <Input
                                    placeholder="Message content..."
                                    value={bodyText}
                                    onChange={(e) => setBodyText(e.target.value)}
                                    className="h-9 text-xs"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Footer Text (Optional)</Label>
                                <Input
                                    placeholder="e.g. Powered by Devlomatix"
                                    value={footerText}
                                    onChange={(e) => setFooterText(e.target.value)}
                                    className="h-9 text-xs"
                                />
                            </div>

                            {/* WhatsApp Bubble Preview */}
                            <div className="p-3 bg-muted/30 border border-border/50 rounded-xl space-y-2">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                    WhatsApp Interactive Preview
                                </div>
                                <div className="bg-emerald-950/20 dark:bg-emerald-950/40 border border-emerald-500/20 p-2.5 rounded-lg text-xs space-y-1 max-w-[280px]">
                                    {messageType === 'product' && activeItem && (
                                        <div className="space-y-1">
                                            <div className="h-20 bg-muted/40 rounded flex items-center justify-center overflow-hidden">
                                                <img
                                                    src={activeItem.imageUrl || activeItem.imageUrls?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30'}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                />
                                            </div>
                                            <div className="font-bold text-foreground truncate">{activeItem.title || activeItem.name}</div>
                                            <div className="text-[11px] text-emerald-500 font-semibold">{activeItem.currency || 'INR'} {activeItem.price}</div>
                                        </div>
                                    )}
                                    <div className="text-muted-foreground text-[11px]">{bodyText || 'Message content'}</div>
                                    {footerText && <div className="text-[9px] text-muted-foreground/60">{footerText}</div>}
                                    <div className="mt-1 pt-1 border-t border-emerald-500/20 text-center text-primary font-bold text-[11px]">
                                        {customCatalogId ? '🛍️ View item' : '✨ View Product & Order'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>

                    <DialogFooter className="px-6 py-3 border-t border-border/40 bg-muted/10 gap-2">
                        <Button variant="outline" type="button" onClick={onClose} disabled={isLoading} className="h-9 text-xs">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="h-9 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
                            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            Send to WhatsApp
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
