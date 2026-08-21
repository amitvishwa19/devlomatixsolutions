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
import { Settings2, ShoppingCart, Eye, Globe, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function CommerceSettingsModal({
    isOpen,
    onClose,
    onSave,
    settings = null,
    metaCatalogs = [],
    isLoading = false
}) {
    const [catalogId, setCatalogId] = useState('');
    const [isCatalogVisible, setIsCatalogVisible] = useState(true);
    const [isCartEnabled, setIsCartEnabled] = useState(true);

    useEffect(() => {
        if (settings) {
            setCatalogId(settings.catalog_id || (metaCatalogs[0]?.id || ''));
            setIsCatalogVisible(settings.is_catalog_visible !== false);
            setIsCartEnabled(settings.is_cart_enabled !== false);
        }
    }, [settings, metaCatalogs, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            catalog_id: catalogId.trim() || undefined,
            is_catalog_visible: isCatalogVisible,
            is_cart_enabled: isCartEnabled
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                            <Settings2 className="w-5 h-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-bold">
                                WhatsApp Commerce Settings
                            </DialogTitle>
                            <DialogDescription className="text-xs">
                                Configure catalog visibility and cart checkout for your phone number
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Meta Catalog ID</Label>
                        {metaCatalogs.length > 0 ? (
                            <div className="space-y-2">
                                <select
                                    value={catalogId}
                                    onChange={(e) => setCatalogId(e.target.value)}
                                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                >
                                    <option value="">-- Select Assigned Meta Catalog --</option>
                                    {metaCatalogs.map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name || 'Catalog'} (ID: {cat.id})
                                        </option>
                                    ))}
                                </select>
                                <Input
                                    placeholder="Or paste Meta Catalog ID"
                                    value={catalogId}
                                    onChange={(e) => setCatalogId(e.target.value)}
                                    className="h-8 text-xs font-mono"
                                />
                            </div>
                        ) : (
                            <Input
                                placeholder="e.g. 123456789012345"
                                value={catalogId}
                                onChange={(e) => setCatalogId(e.target.value)}
                                className="h-9 text-xs font-mono"
                            />
                        )}
                        <p className="text-[10px] text-muted-foreground">
                            Found in Meta Commerce Manager under Assets & Catalogs.
                        </p>
                    </div>

                    <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between p-3 bg-muted/20 border border-border/40 rounded-xl">
                            <div className="space-y-0.5">
                                <div className="text-xs font-semibold flex items-center gap-1.5">
                                    <Eye className="w-3.5 h-3.5 text-primary" />
                                    Show Catalog on Profile
                                </div>
                                <div className="text-[10px] text-muted-foreground">
                                    Customers see a catalog storefront icon in your WhatsApp Business profile
                                </div>
                            </div>
                            <Switch checked={isCatalogVisible} onCheckedChange={setIsCatalogVisible} />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-muted/20 border border-border/40 rounded-xl">
                            <div className="space-y-0.5">
                                <div className="text-xs font-semibold flex items-center gap-1.5">
                                    <ShoppingCart className="w-3.5 h-3.5 text-emerald-500" />
                                    Enable WhatsApp Cart
                                </div>
                                <div className="text-[10px] text-muted-foreground">
                                    Allows customers to add multiple items and send orders directly in chat
                                </div>
                            </div>
                            <Switch checked={isCartEnabled} onCheckedChange={setIsCartEnabled} />
                        </div>
                    </div>

                    <DialogFooter className="pt-2">
                        <Button variant="outline" type="button" onClick={onClose} disabled={isLoading} className="h-9 text-xs">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="h-9 text-xs gap-1.5">
                            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            Save Settings
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
