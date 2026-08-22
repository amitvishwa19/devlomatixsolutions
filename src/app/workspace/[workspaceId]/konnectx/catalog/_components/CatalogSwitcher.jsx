'use client';

import React, { useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ShoppingBag,
    ChevronDown,
    Check,
    Plus,
    Settings2,
    Store,
    Loader2,
    Eye,
    ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { useAction } from '@/hooks/use-action';
import { updateCommerceSettingsAction } from '../_actions/update-commerce-settings';
import { unlinkProfileCatalogAction } from '../_actions/unlink-profile-catalog';
import { EyeOff } from 'lucide-react';

export default function CatalogSwitcher({
    activeCatalogId,
    metaCatalogs = [],
    workspaceId,
    isCatalogVisible = true,
    isCartEnabled = true,
    onCatalogSwitched,
    onOpenSettings
}) {
    const [isSwitching, setIsSwitching] = useState(false);

    const { execute: executeUpdateSettings } = useAction(updateCommerceSettingsAction, {
        onSuccess: (res) => {
            setIsSwitching(false);
            toast.success("Active Catalog updated & synced with Meta");
            if (onCatalogSwitched) onCatalogSwitched();
        },
        onError: (err) => {
            setIsSwitching(false);
            toast.error(err || "Failed to switch catalog");
        }
    });

    const { execute: executeUnlink } = useAction(unlinkProfileCatalogAction, {
        onSuccess: () => {
            setIsSwitching(false);
            toast.success("Catalog storefront removed from WhatsApp Profile");
            if (onCatalogSwitched) onCatalogSwitched();
        },
        onError: (err) => {
            setIsSwitching(false);
            toast.error(err || "Failed to remove catalog from profile");
        }
    });

    const handleSelectCatalog = (catalogId) => {
        if (catalogId === activeCatalogId) return;
        setIsSwitching(true);
        executeUpdateSettings({
            workspaceId,
            catalog_id: catalogId,
            is_catalog_visible: isCatalogVisible,
            is_cart_enabled: isCartEnabled
        });
    };

    const handleUnlink = () => {
        setIsSwitching(true);
        executeUnlink({ workspaceId });
    };

    // Find active catalog details
    const activeMetaCat = metaCatalogs.find(c => c.id === activeCatalogId);
    const displayName = activeMetaCat?.name || (activeCatalogId ? `Catalog: ${activeCatalogId}` : 'No Catalog Selected');

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 rounded-lg text-xs font-semibold gap-2 border-border/60 hover:bg-muted/50 bg-background/50 shadow-xs max-w-[240px]"
                    disabled={isSwitching}
                >
                    {isSwitching ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-primary shrink-0" />
                    ) : (
                        <div className={`w-2 h-2 rounded-full ${activeCatalogId && isCatalogVisible ? 'bg-emerald-500' : 'bg-amber-500'} shrink-0`} />
                    )}
                    <ShoppingBag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="truncate font-medium">{displayName}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0 opacity-60 ml-auto" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-72 p-1.5 shadow-xl">
                <DropdownMenuLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1 flex items-center justify-between">
                    <span>Meta Product Catalogs</span>
                    {metaCatalogs.length > 0 && (
                        <Badge variant="secondary" className="text-[9px] h-4 px-1">
                            {metaCatalogs.length} Found
                        </Badge>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {metaCatalogs.length > 0 ? (
                    metaCatalogs.map((cat) => {
                        const isSelected = cat.id === activeCatalogId;
                        return (
                            <DropdownMenuItem
                                key={cat.id}
                                onClick={() => handleSelectCatalog(cat.id)}
                                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs ${isSelected ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold' : 'hover:bg-muted'}`}
                            >
                                <div className="min-w-0 flex-1 pr-2">
                                    <div className="flex items-center gap-1.5">
                                        <Store className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                        <span className="truncate">{cat.name || 'Catalog'}</span>
                                    </div>
                                    <span className="text-[10px] font-mono text-muted-foreground block truncate mt-0.5">
                                        ID: {cat.id}
                                    </span>
                                </div>
                                {isSelected && (
                                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                )}
                            </DropdownMenuItem>
                        );
                    })
                ) : activeCatalogId ? (
                    <DropdownMenuItem
                        className="flex items-center justify-between p-2 rounded-lg text-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold"
                    >
                        <div className="min-w-0 flex-1 pr-2">
                            <div className="flex items-center gap-1.5">
                                <Store className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span className="truncate">Active Custom Catalog</span>
                            </div>
                            <span className="text-[10px] font-mono text-muted-foreground block truncate mt-0.5">
                                ID: {activeCatalogId}
                            </span>
                        </div>
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    </DropdownMenuItem>
                ) : (
                    <div className="p-3 text-center text-xs text-muted-foreground">
                        No Meta Catalogs linked yet.
                    </div>
                )}

                <DropdownMenuSeparator />

                {activeCatalogId && isCatalogVisible && (
                    <>
                        <DropdownMenuItem
                            onClick={handleUnlink}
                            className="flex items-center gap-2 p-2 rounded-lg cursor-pointer text-xs text-destructive hover:bg-destructive/10"
                        >
                            <EyeOff className="w-3.5 h-3.5 text-destructive" />
                            <span>Remove from WhatsApp Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                    </>
                )}

                <DropdownMenuItem
                    onClick={onOpenSettings}
                    className="flex items-center gap-2 p-2 rounded-lg cursor-pointer text-xs text-primary font-medium hover:bg-primary/5"
                >
                    <Settings2 className="w-3.5 h-3.5 text-primary" />
                    <span>Configure / Link Catalog ID</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
