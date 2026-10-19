"use client";

import React, { useState } from 'react';
import { 
    Package, 
    Check, 
    ChevronLeft, 
    ChevronRight, 
    Layers, 
    Tag, 
    Eye, 
    DollarSign,
    Sparkles,
    Plus,
    Loader2,
    CheckCircle2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export default function ScrapedProductCard({
    product,
    index,
    isSelected,
    onToggleSelect,
    onInspect,
    onImportSingle,
    isImportingSingle
}) {
    const images = Array.isArray(product.imageUrls) && product.imageUrls.length > 0 
        ? product.imageUrls 
        : [];
    const [activeImageIdx, setActiveImageIdx] = useState(0);

    const prevImage = (e) => {
        e.stopPropagation();
        setActiveImageIdx((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    };

    const nextImage = (e) => {
        e.stopPropagation();
        setActiveImageIdx((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    };

    const currentImg = images[activeImageIdx] || null;
    const variantsCount = product.variants?.length || 1;
    const currency = product.currency === "USD" ? "$" : product.currency === "EUR" ? "€" : "₹";

    return (
        <Card className={`group relative bg-card/70 backdrop-blur-md border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
            isSelected ? "border-cyan-500/60 ring-1 ring-cyan-500/30 bg-card/90" : "border-border/80 hover:border-border"
        }`}>
            {/* Top Selection Ribbon */}
            <div className="absolute top-2.5 left-2.5 z-20">
                <div 
                    onClick={() => onToggleSelect(index)}
                    className="cursor-pointer bg-background/80 backdrop-blur-md p-1.5 rounded-lg border border-border/80 hover:bg-background transition-colors flex items-center justify-center shadow-md"
                >
                    <Checkbox 
                        checked={isSelected} 
                        onCheckedChange={() => onToggleSelect(index)}
                        className="data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500" 
                    />
                </div>
            </div>

            {/* Inspect Eye Action Button */}
            <div className="absolute top-2.5 right-2.5 z-20">
                <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => onInspect(product, index)}
                    className="w-8 h-8 rounded-lg bg-background/80 backdrop-blur-md border border-border/80 hover:bg-background shadow-md opacity-90 group-hover:opacity-100 transition-opacity"
                    title="Inspect & Edit Details"
                >
                    <Eye className="w-3.5 h-3.5 text-foreground" />
                </Button>
            </div>

            {/* Thumbnail Preview Area with Carousel */}
            <div>
                <div className="relative h-48 w-full bg-muted/40 border-b border-border/50 flex items-center justify-center overflow-hidden">
                    {currentImg ? (
                        <img 
                            src={currentImg} 
                            alt={product.title} 
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-muted-foreground gap-1">
                            <Package className="w-10 h-10 opacity-30" />
                            <span className="text-[10px]">No image found</span>
                        </div>
                    )}

                    {/* Carousel Controls */}
                    {images.length > 1 && (
                        <>
                            <button
                                type="button"
                                onClick={prevImage}
                                className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-background/80 backdrop-blur-sm text-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={nextImage}
                                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-background/80 backdrop-blur-sm text-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                            >
                                <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                            <div className="absolute bottom-1.5 right-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[9px] text-white font-mono">
                                {activeImageIdx + 1}/{images.length}
                            </div>
                        </>
                    )}

                    {/* Category Badge */}
                    {product.category && (
                        <div className="absolute bottom-1.5 left-2">
                            <Badge variant="outline" className="text-[9px] bg-background/80 backdrop-blur-md border-border/80 font-medium truncate max-w-[140px]">
                                {product.category}
                            </Badge>
                        </div>
                    )}
                </div>

                {/* Product Meta Body */}
                <CardContent className="p-3.5 space-y-2.5">
                    {/* Title */}
                    <h4 
                        onClick={() => onInspect(product, index)}
                        className="text-xs font-bold text-foreground line-clamp-2 leading-snug cursor-pointer hover:text-cyan-400 transition-colors"
                        title={product.title}
                    >
                        {product.title}
                    </h4>

                    {/* Price & Discount */}
                    <div className="flex items-baseline justify-between">
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-base font-bold font-mono text-emerald-500">
                                {currency}{Number(product.price || 0).toLocaleString()}
                            </span>
                            {product.discount > 0 && (
                                <span className="text-[10px] text-muted-foreground line-through font-mono">
                                    {currency}{Number(product.price + product.discount).toLocaleString()}
                                </span>
                            )}
                        </div>
                        {product.discount > 0 && (
                            <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-semibold">
                                SAVE {currency}{product.discount}
                            </Badge>
                        )}
                    </div>

                    {/* SKU & Variants breakdown */}
                    <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[10px] text-muted-foreground">
                        <span className="font-mono truncate max-w-[130px]">
                            SKU: {product.sku || 'Auto-generated'}
                        </span>
                        <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                            {variantsCount} {variantsCount === 1 ? 'Variant' : 'Variants'}
                        </Badge>
                    </div>
                </CardContent>
            </div>

            {/* Bottom Actions: Single Add to Catalog vs View Details */}
            <div className="p-3 pt-0 border-t border-border/40 mt-1">
                {product.isImported ? (
                    <Badge variant="outline" className="w-full justify-center text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30 py-1 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Added to Catalog
                    </Badge>
                ) : (
                    <div className="flex items-center gap-1.5">
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={isImportingSingle}
                            onClick={(e) => {
                                e.stopPropagation();
                                onImportSingle(product, index);
                            }}
                            className="flex-1 h-7 text-[11px] gap-1 font-semibold hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30"
                        >
                            {isImportingSingle ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                                <Plus className="w-3 h-3 text-emerald-400" />
                            )}
                            <span>Add Single</span>
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onInspect(product, index)}
                            className="h-7 text-[11px] px-2 text-muted-foreground hover:text-foreground"
                            title="Inspect & Edit Details"
                        >
                            Edit
                        </Button>
                    </div>
                )}
            </div>
        </Card>
    );
}
