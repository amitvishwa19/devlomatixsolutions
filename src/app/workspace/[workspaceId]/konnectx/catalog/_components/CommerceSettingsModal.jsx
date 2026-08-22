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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Settings2,
    ShoppingCart,
    Eye,
    Globe,
    Loader2,
    Check,
    ShoppingBag,
    Sparkles,
    ShieldCheck,
    Smartphone,
    Info,
    ExternalLink,
    Store,
    Plus,
    CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { useAction } from '@/hooks/use-action';
import { linkProfileCatalogAction } from '../_actions/link-profile-catalog';
import { unlinkProfileCatalogAction } from '../_actions/unlink-profile-catalog';
import { Trash2, EyeOff, Unlink } from 'lucide-react';

export default function CommerceSettingsModal({
    isOpen,
    onClose,
    onSave,
    settings = null,
    metaCatalogs = [],
    workspaceId,
    activePhoneId,
    isLoading = false
}) {
    const [catalogId, setCatalogId] = useState('');
    const [isCatalogVisible, setIsCatalogVisible] = useState(true);
    const [isCartEnabled, setIsCartEnabled] = useState(true);
    const [businessDescription, setBusinessDescription] = useState('Explore our verified product catalog and order directly on WhatsApp.');
    const [businessWebsite, setBusinessWebsite] = useState('');
    const [showManualInput, setShowManualInput] = useState(false);

    const { execute: executeLinkProfile, isLoading: isLinkingProfile } = useAction(linkProfileCatalogAction, {
        onSuccess: (res) => {
            toast.success("Catalog successfully linked and activated on WhatsApp Business Profile!");
            if (onSave) {
                onSave({
                    catalog_id: catalogId.trim(),
                    is_catalog_visible: isCatalogVisible,
                    is_cart_enabled: isCartEnabled
                });
            }
            onClose();
        },
        onError: (err) => {
            toast.error(err || "Failed to link catalog to WhatsApp profile");
        }
    });

    const { execute: executeUnlinkProfile, isLoading: isUnlinkingProfile } = useAction(unlinkProfileCatalogAction, {
        onSuccess: (res) => {
            toast.success("Catalog storefront (🛍️) successfully removed from WhatsApp Profile!");
            setIsCatalogVisible(false);
            if (onSave) {
                onSave({
                    catalog_id: undefined,
                    is_catalog_visible: false,
                    is_cart_enabled: false
                });
            }
            onClose();
        },
        onError: (err) => {
            toast.error(err || "Failed to remove catalog from WhatsApp profile");
        }
    });

    useEffect(() => {
        if (settings) {
            const initialId = settings.catalog_id || (metaCatalogs[0]?.id || '');
            setCatalogId(initialId);
            setIsCatalogVisible(settings.is_catalog_visible !== false);
            setIsCartEnabled(settings.is_cart_enabled !== false);
            if (metaCatalogs.length === 0 && initialId) {
                setShowManualInput(true);
            }
        }
    }, [settings, metaCatalogs, isOpen]);

    const handleUnlinkProfile = () => {
        executeUnlinkProfile({ workspaceId });
    };

    const handleSaveGeneral = (e) => {
        e.preventDefault();
        if (!catalogId.trim()) {
            toast.error("Please select or enter a Meta Catalog");
            return;
        }
        onSave({
            catalog_id: catalogId.trim() || undefined,
            is_catalog_visible: isCatalogVisible,
            is_cart_enabled: isCartEnabled
        });
    };

    const handleOneClickProfileLink = () => {
        if (!catalogId.trim()) {
            toast.error("Please select a catalog from the list below");
            return;
        }
        executeLinkProfile({
            workspaceId,
            catalogId: catalogId.trim(),
            isCatalogVisible,
            isCartEnabled,
            businessDescription,
            businessWebsite: businessWebsite.trim() || undefined
        });
    };

    const selectedCatalogObj = metaCatalogs.find(c => c.id === catalogId);
    const selectedCatalogName = selectedCatalogObj?.name || (catalogId ? `Catalog (${catalogId})` : 'No Catalog Selected');

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-xl max-h-[92vh] flex flex-col p-0 overflow-hidden w-full border">
                <DialogHeader className="px-6 pt-6 pb-3 border-b border-border/40 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-sm shrink-0">
                            <Store className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <DialogTitle className="text-lg font-bold text-foreground">
                                Set Catalog to WhatsApp Profile
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                Select a created catalog to display as the storefront shopping bag (🛍️) on your WhatsApp profile
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSaveGeneral} className="flex-1 flex flex-col overflow-hidden min-w-0 w-full">
                    <ScrollArea className="h-[calc(85vh-140px)] w-full px-6 py-4">
                        <div className="space-y-4 pb-4 w-full min-w-0 pr-1">
                            {/* Created Catalogs Selection */}
                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                        <ShoppingBag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                        <span>Select Created Catalog</span>
                                    </Label>
                                    <Badge variant="outline" className="text-[10px] h-5 px-2 border-emerald-500/30 text-emerald-600 bg-emerald-500/5">
                                        {metaCatalogs.length} Available
                                    </Badge>
                                </div>

                                {metaCatalogs.length > 0 ? (
                                    <ScrollArea className="max-h-60 w-full pr-1.5">
                                        <div className="grid grid-cols-1 gap-2 pb-1">
                                            {metaCatalogs.map((cat) => {
                                                const isSelected = catalogId === cat.id;
                                                return (
                                                    <div
                                                        key={cat.id}
                                                        onClick={() => setCatalogId(cat.id)}
                                                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${isSelected ? 'border-emerald-500 bg-emerald-500/10 dark:bg-emerald-950/30 shadow-xs ring-1 ring-emerald-500/30' : 'border-border/60 bg-card hover:border-border hover:bg-muted/30'}`}
                                                    >
                                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                                            <div className={`p-2 rounded-lg ${isSelected ? 'bg-emerald-600 text-white' : 'bg-muted text-muted-foreground'} shrink-0`}>
                                                                <Store className="w-4 h-4" />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-bold text-xs text-foreground truncate">
                                                                        {cat.name || 'Catalog'}
                                                                    </span>
                                                                    {cat.product_count !== undefined && (
                                                                        <Badge variant="secondary" className="text-[9px] h-4 px-1.5 shrink-0">
                                                                            {cat.product_count} items
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <div className="text-[10px] font-mono text-muted-foreground truncate mt-0.5">
                                                                    ID: {cat.id}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="shrink-0 ml-3">
                                                            {isSelected ? (
                                                                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                                                                    <Check className="w-3 h-3 stroke-[3]" />
                                                                </div>
                                                            ) : (
                                                                <div className="w-5 h-5 rounded-full border border-border/80" />
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </ScrollArea>
                                ) : (
                                    <div className="p-4 rounded-xl border border-dashed border-border/70 text-center space-y-2 bg-muted/10">
                                        <div className="p-2.5 rounded-full bg-muted/60 text-muted-foreground w-9 h-9 mx-auto flex items-center justify-center">
                                            <ShoppingBag className="w-4 h-4" />
                                        </div>
                                        <div className="text-xs font-semibold text-foreground">No Catalogs Auto-Detected</div>
                                        <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                                            Enter your Meta Commerce Catalog ID below to link it directly.
                                        </p>
                                    </div>
                                )}

                                {/* Manual Catalog ID Option */}
                                <div className="pt-1">
                                    {!showManualInput && metaCatalogs.length > 0 ? (
                                        <button
                                            type="button"
                                            onClick={() => setShowManualInput(true)}
                                            className="text-[11px] text-primary hover:underline font-medium flex items-center gap-1"
                                        >
                                            <Plus className="w-3 h-3" />
                                            Or enter a custom / different Meta Catalog ID
                                        </button>
                                    ) : (
                                        <div className="space-y-1.5 p-3 bg-muted/20 border border-border/50 rounded-xl animate-in fade-in">
                                            <Label className="text-xs font-semibold">Custom Meta Catalog ID</Label>
                                            <Input
                                                placeholder="e.g. 123456789012345 (From Meta Commerce Manager)"
                                                value={catalogId}
                                                onChange={(e) => setCatalogId(e.target.value)}
                                                className="h-9 text-xs font-mono"
                                            />
                                            <p className="text-[10px] text-muted-foreground">
                                                Found in Meta Commerce Manager under <strong>Assets &gt; Catalogs</strong>.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Visibility & Cart Toggles */}
                            <div className="space-y-2.5 pt-1">
                                <div className="flex items-center justify-between p-3 bg-muted/20 border border-border/40 rounded-xl">
                                    <div className="space-y-0.5 pr-2">
                                        <div className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                                            <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                            Show Catalog on WhatsApp Profile
                                        </div>
                                        <div className="text-[10px] text-muted-foreground">
                                            Enables the green <strong>"View Catalog" (🛍️)</strong> button on your WhatsApp profile and chat header.
                                        </div>
                                    </div>
                                    <Switch checked={isCatalogVisible} onCheckedChange={setIsCatalogVisible} />
                                </div>

                                <div className="flex items-center justify-between p-3 bg-muted/20 border border-border/40 rounded-xl">
                                    <div className="space-y-0.5 pr-2">
                                        <div className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                                            <ShoppingCart className="w-3.5 h-3.5 text-primary" />
                                            Enable WhatsApp In-Chat Cart
                                        </div>
                                        <div className="text-[10px] text-muted-foreground">
                                            Allows customers to add multiple items, review carts, and place orders directly in conversation.
                                        </div>
                                    </div>
                                    <Switch checked={isCartEnabled} onCheckedChange={setIsCartEnabled} />
                                </div>
                            </div>

                            {/* Live WhatsApp Profile Preview Mockup */}
                            <div className="p-3.5 bg-gradient-to-b from-emerald-500/5 to-muted/20 border border-emerald-500/20 rounded-2xl space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                        <Smartphone className="w-3 h-3" />
                                        Live WhatsApp Business Profile Preview
                                    </span>
                                    <Badge variant="outline" className="text-[9px] border-emerald-500/30 text-emerald-600 bg-emerald-500/5">
                                        {isCatalogVisible ? '🛍️ Catalog Visible' : 'Catalog Hidden'}
                                    </Badge>
                                </div>

                                <div className="bg-card border border-border/60 rounded-xl p-3 shadow-xs space-y-2.5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                                            <Store className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-1">
                                                <h4 className="font-bold text-xs text-foreground truncate">Devlomatix Store</h4>
                                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                            </div>
                                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                                                Retail &amp; Shopping &bull; {selectedCatalogName}
                                            </p>
                                        </div>
                                    </div>

                                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                                        {businessDescription}
                                    </p>

                                    {/* Action Storefront Button */}
                                    {isCatalogVisible && catalogId ? (
                                        <div className="w-full py-2 px-3 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all animate-in fade-in">
                                            <ShoppingBag className="w-3.5 h-3.5" />
                                            <span>View Catalog</span>
                                        </div>
                                    ) : (
                                        <div className="w-full py-1.5 px-3 rounded-lg bg-muted/40 text-muted-foreground font-medium text-xs text-center border border-dashed border-border/60 italic">
                                            {catalogId ? 'Catalog storefront button hidden from profile' : 'Select a catalog above to preview'}
                                        </div>
                                    )}

                                    {isCartEnabled && (
                                        <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-600 font-semibold pt-1">
                                            <Check className="w-3 h-3" /> In-chat Multi-Product Cart Enabled
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </ScrollArea>

                    <DialogFooter className="px-6 py-3 border-t border-border/40 bg-muted/10 flex items-center justify-between gap-2 shrink-0">
                        <div className="flex items-center gap-2">
                            <Button variant="outline" type="button" onClick={onClose} disabled={isLoading || isLinkingProfile || isUnlinkingProfile} className="h-9 text-xs">
                                Cancel
                            </Button>

                            {(settings?.catalog_id || settings?.is_catalog_visible) && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={handleUnlinkProfile}
                                    disabled={isLoading || isLinkingProfile || isUnlinkingProfile}
                                    className="h-9 text-xs gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                    title="Hide & remove storefront catalog from WhatsApp Profile"
                                >
                                    {isUnlinkingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <EyeOff className="w-3.5 h-3.5" />}
                                    <span>Remove from Profile</span>
                                </Button>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="default"
                                onClick={handleOneClickProfileLink}
                                disabled={isLoading || isLinkingProfile || isUnlinkingProfile || !catalogId}
                                className="h-9 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                            >
                                {isLinkingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                                Set Selected Catalog to Profile
                            </Button>

                            <Button
                                type="submit"
                                variant="outline"
                                disabled={isLoading || isLinkingProfile || isUnlinkingProfile || !catalogId}
                                className="h-9 text-xs gap-1.5"
                            >
                                {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                Save Settings
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
