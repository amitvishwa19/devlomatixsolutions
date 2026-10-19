"use client";

import React, { useState, useEffect } from 'react';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle,
    DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
    Trash2, 
    Plus, 
    Image as ImageIcon, 
    Check, 
    Layers, 
    Tag, 
    DollarSign,
    DownloadCloud,
    Loader2,
    Store,
    CheckCircle2
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function ScrapedProductDetailModal({
    open,
    onClose,
    product,
    index,
    stores = [],
    selectedStore,
    onSaveProduct,
    onImportSingle,
    isImportingSingle
}) {
    const [formData, setFormData] = useState(null);
    const [targetStore, setTargetStore] = useState(selectedStore || "");
    const [importStatus, setImportStatus] = useState("active");

    useEffect(() => {
        if (product) {
            setFormData({
                ...product,
                imageUrls: Array.isArray(product.imageUrls) ? [...product.imageUrls] : [],
                variants: Array.isArray(product.variants) ? [...product.variants] : []
            });
        }
        if (selectedStore) {
            setTargetStore(selectedStore);
        }
    }, [product, selectedStore]);

    if (!formData) return null;

    const handleRemoveImage = (imgIdx) => {
        setFormData(prev => ({
            ...prev,
            imageUrls: prev.imageUrls.filter((_, idx) => idx !== imgIdx)
        }));
    };

    const handleSaveOnly = () => {
        onSaveProduct(formData, index);
        onClose();
    };

    const handleSingleImport = () => {
        if (onImportSingle) {
            onImportSingle(formData, index, targetStore, importStatus);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-card border-border/80">
                <DialogHeader className="pb-3 border-b border-border/40">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-base font-bold flex items-center gap-2">
                            <span>Inspect & Customize Product</span>
                            <Badge variant="outline" className="text-[10px] text-cyan-400 border-cyan-500/30">
                                Pre-Import Editor
                            </Badge>
                        </DialogTitle>
                        {formData.isImported && (
                            <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Already Imported
                            </Badge>
                        )}
                    </div>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Basic Info */}
                    <div className="space-y-1.5">
                        <Label className="text-xs">Product Title</Label>
                        <Input 
                            value={formData.title} 
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="text-xs font-semibold"
                        />
                    </div>

                    {/* Price, Discount & SKU */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs">Price ({formData.currency || 'INR'})</Label>
                            <Input 
                                type="number" 
                                value={formData.price} 
                                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                className="text-xs font-mono"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Discount Amount</Label>
                            <Input 
                                type="number" 
                                value={formData.discount} 
                                onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                                className="text-xs font-mono"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">SKU</Label>
                            <Input 
                                value={formData.sku || ''} 
                                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                className="text-xs font-mono"
                            />
                        </div>
                    </div>

                    {/* Category & Target Store Assignment */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs">Category</Label>
                            <Input 
                                value={formData.category || ''} 
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="text-xs"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Target Store for Single Import</Label>
                            <Select value={targetStore} onValueChange={setTargetStore}>
                                <SelectTrigger className="h-9 text-xs">
                                    <div className="flex items-center gap-1.5 truncate">
                                        <Store className="w-3.5 h-3.5 text-primary shrink-0" />
                                        <SelectValue placeholder="Select Store" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    {stores.map((s) => (
                                        <SelectItem key={s.id} value={s.id} className="text-xs">
                                            {s.name} ({s.platform})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs">Description</Label>
                        <Textarea 
                            rows={4}
                            value={formData.description || ''} 
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="text-xs leading-relaxed"
                        />
                    </div>

                    {/* Image Gallery */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs">Extracted Images ({formData.imageUrls?.length || 0})</Label>
                            <span className="text-[10px] text-muted-foreground">Click trash to remove image</span>
                        </div>
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                            {formData.imageUrls?.map((url, imgIdx) => (
                                <div key={imgIdx} className="group relative rounded-lg border border-border/80 overflow-hidden h-20 bg-muted/30">
                                    <img src={url} alt={`img-${imgIdx}`} className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveImage(imgIdx)}
                                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-rose-400"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Variants */}
                    {formData.variants && formData.variants.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-border/40">
                            <Label className="text-xs">Variants ({formData.variants.length})</Label>
                            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                                {formData.variants.map((v, vIdx) => (
                                    <div key={vIdx} className="p-2 rounded-lg bg-background/60 border border-border/60 flex items-center justify-between text-xs">
                                        <span className="font-medium text-foreground">{v.name}</span>
                                        <div className="flex items-center gap-3 font-mono text-[11px] text-muted-foreground">
                                            <span>₹{v.price}</span>
                                            <span>•</span>
                                            <span>Stock: {v.inventoryCount}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="pt-3 border-t border-border/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                    {/* Status Toggle on Left */}
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground">Status:</span>
                        <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-border/60">
                            <button
                                type="button"
                                onClick={() => setImportStatus("active")}
                                className={`text-[10px] px-2 py-0.5 rounded font-semibold transition-colors ${
                                    importStatus === "active" ? "bg-emerald-500 text-white" : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                Active
                            </button>
                            <button
                                type="button"
                                onClick={() => setImportStatus("draft")}
                                className={`text-[10px] px-2 py-0.5 rounded font-semibold transition-colors ${
                                    importStatus === "draft" ? "bg-amber-500 text-white" : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                Draft
                            </button>
                        </div>
                    </div>

                    {/* Action Buttons on Right */}
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                        <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
                            Cancel
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleSaveOnly} className="text-xs gap-1 border-border/80">
                            <Check className="w-3.5 h-3.5" />
                            Save Edits
                        </Button>
                        <Button 
                            size="sm" 
                            disabled={isImportingSingle}
                            onClick={handleSingleImport} 
                            className="text-xs font-semibold gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md shadow-emerald-500/20"
                        >
                            {isImportingSingle ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Importing...</span>
                                </>
                            ) : (
                                <>
                                    <DownloadCloud className="w-3.5 h-3.5" />
                                    <span>Add to Products</span>
                                </>
                            )}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
