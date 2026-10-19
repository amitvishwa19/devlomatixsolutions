"use client";

import React, { use, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
    Sparkles, 
    Globe, 
    ArrowRight, 
    Layers, 
    CheckCircle2, 
    ShoppingBag, 
    Store,
    ExternalLink,
    AlertCircle
} from "lucide-react";
import { toast } from 'sonner';
import ScraperHeader from "./_components/ScraperHeader";
import ScraperInputBar from "./_components/ScraperInputBar";
import ScraperProgressTerminal from "./_components/ScraperProgressTerminal";
import ScrapedProductCard from "./_components/ScrapedProductCard";
import ScrapedProductDetailModal from "./_components/ScrapedProductDetailModal";
import ScraperBatchActions from "./_components/ScraperBatchActions";
import { Button } from "@/components/ui/button";

export default function EcommerceScraperPage({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const workspaceId = params.workspaceId;

    const [stores, setStores] = useState([]);
    const [selectedStore, setSelectedStore] = useState("");
    const [url, setUrl] = useState("");
    const [limit, setLimit] = useState(10);
    const [isExtracting, setIsExtracting] = useState(false);
    const [platform, setPlatform] = useState(null);
    const [extractedProducts, setExtractedProducts] = useState([]);
    const [selectedIndices, setSelectedIndices] = useState(new Set());
    const [isImporting, setIsImporting] = useState(false);
    const [singleImportingIdx, setSingleImportingIdx] = useState(null);
    const [inspectingProduct, setInspectingProduct] = useState(null);
    const [inspectingIndex, setInspectingIndex] = useState(null);
    const [importStatus, setImportStatus] = useState("active");

    // Fetch Connected Stores
    const fetchStores = useCallback(async () => {
        try {
            const res = await fetch(`/api/workspace/${workspaceId}/ecommerce/stores`);
            const data = await res.json();
            if (data.success && data.stores?.length > 0) {
                setStores(data.stores);
                const defaultStore = data.stores.find(s => s.isDefault) || data.stores[0];
                setSelectedStore(defaultStore.id);
            }
        } catch (err) {
            console.error("Failed to load stores for scraper:", err);
        }
    }, [workspaceId]);

    useEffect(() => {
        if (workspaceId) {
            fetchStores();
        }
    }, [workspaceId, fetchStores]);

    // Handle Scrape & Extraction
    const handleExtract = async () => {
        if (!url) {
            toast.error("Please enter a website or product URL");
            return;
        }

        setIsExtracting(true);
        setPlatform(null);
        try {
            const res = await fetch(`/api/workspace/${workspaceId}/ecommerce/scraper/extract`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url, limit, mode: limit === 1 ? "single" : "auto" })
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message || "Failed to extract catalog items");
            }

            setPlatform(data.platform);
            const prods = data.products || [];
            setExtractedProducts(prods);

            // Select all by default
            const allIdxs = new Set(prods.map((_, i) => i));
            setSelectedIndices(allIdxs);

            toast.success(`Successfully extracted ${prods.length} products using AI!`);
        } catch (err) {
            console.error("[SCRAPE_ACTION_ERROR]", err);
            toast.error(err.message || "Failed to extract products. Check URL or website availability.");
        } finally {
            setIsExtracting(false);
        }
    };

    // Toggle Product Selection
    const handleToggleSelect = (index) => {
        setSelectedIndices(prev => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
    };

    const handleSelectAll = () => {
        setSelectedIndices(new Set(extractedProducts.map((_, i) => i)));
    };

    const handleDeselectAll = () => {
        setSelectedIndices(new Set());
    };

    // Open Inspect Modal
    const handleInspect = (product, index) => {
        setInspectingProduct(product);
        setInspectingIndex(index);
    };

    // Apply Changes from Detail Modal
    const handleSaveInspected = (updatedProduct, index) => {
        const targetIdx = index !== undefined ? index : inspectingIndex;
        if (targetIdx !== null && targetIdx !== undefined) {
            setExtractedProducts(prev => {
                const next = [...prev];
                next[targetIdx] = updatedProduct;
                return next;
            });
            toast.success("Product changes updated in memory");
        }
    };

    // Single Product Import Handler (can be called from Card or Detail Modal)
    const handleImportSingle = async (product, index, customStoreId, customStatus) => {
        const storeToUse = customStoreId || selectedStore;
        const statusToUse = customStatus || importStatus;

        if (!storeToUse) {
            toast.error("Please select a target store from the dropdown");
            return;
        }

        setSingleImportingIdx(index);
        try {
            const res = await fetch(`/api/workspace/${workspaceId}/ecommerce/scraper/import`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    storeId: storeToUse,
                    products: [product],
                    status: statusToUse
                })
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message || "Failed to import product");
            }

            // Mark as imported
            setExtractedProducts(prev => {
                const next = [...prev];
                if (next[index]) {
                    next[index] = { ...next[index], isImported: true };
                }
                return next;
            });

            toast.success(`"${product.title}" added to "${data.storeName}"!`, {
                action: {
                    label: "View in Catalog",
                    onClick: () => window.location.href = `/workspace/${workspaceId}/ecommerce/products`
                }
            });

            // Close modal if open
            setInspectingProduct(null);
            setInspectingIndex(null);
        } catch (err) {
            console.error("[SINGLE_IMPORT_ERROR]", err);
            toast.error(err.message || "Failed to import product");
        } finally {
            setSingleImportingIdx(null);
        }
    };

    // Batch Import Selected Products
    const handleImport = async () => {
        if (selectedIndices.size === 0) {
            toast.error("Please select at least one product to import");
            return;
        }
        if (!selectedStore) {
            toast.error("Please select a target store from the dropdown");
            return;
        }

        const selectedProducts = extractedProducts.filter((_, idx) => selectedIndices.has(idx));

        setIsImporting(true);
        try {
            const res = await fetch(`/api/workspace/${workspaceId}/ecommerce/scraper/import`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    storeId: selectedStore,
                    products: selectedProducts,
                    status: importStatus
                })
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message || "Failed to import products to catalog");
            }

            toast.success(`Bulk imported ${data.importedCount} products into "${data.storeName}"!`, {
                action: {
                    label: "View Catalog",
                    onClick: () => window.location.href = `/workspace/${workspaceId}/ecommerce/products`
                }
            });

            // Mark all selected as imported
            setExtractedProducts(prev => {
                return prev.map((p, idx) => {
                    if (selectedIndices.has(idx)) {
                        return { ...p, isImported: true };
                    }
                    return p;
                });
            });
            setSelectedIndices(new Set());
        } catch (err) {
            console.error("[IMPORT_ACTION_ERROR]", err);
            toast.error(err.message || "Failed to import selected products");
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <div className="space-y-5 animate-in fade-in duration-500 pb-16 p-4 max-w-[1700px] mx-auto w-full">
            {/* Header */}
            <ScraperHeader workspaceId={workspaceId} />

            {/* Input & Control Bar */}
            <ScraperInputBar
                url={url}
                setUrl={setUrl}
                stores={stores}
                selectedStore={selectedStore}
                setSelectedStore={setSelectedStore}
                limit={limit}
                setLimit={setLimit}
                onExtract={handleExtract}
                isExtracting={isExtracting}
            />

            {/* Live Visual Stepper / Progress Terminal */}
            <ScraperProgressTerminal
                isExtracting={isExtracting}
                platform={platform}
                productCount={extractedProducts.length}
            />

            {/* Batch Action Bar (Bulk Import Option) */}
            {extractedProducts.length > 0 && (
                <ScraperBatchActions
                    totalCount={extractedProducts.length}
                    selectedCount={selectedIndices.size}
                    onSelectAll={handleSelectAll}
                    onDeselectAll={handleDeselectAll}
                    importStatus={importStatus}
                    setImportStatus={setImportStatus}
                    onImport={handleImport}
                    isImporting={isImporting}
                />
            )}

            {/* Products Grid or Empty State Hero */}
            {extractedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                    {extractedProducts.map((product, idx) => (
                        <ScrapedProductCard
                            key={idx}
                            product={product}
                            index={idx}
                            isSelected={selectedIndices.has(idx)}
                            onToggleSelect={handleToggleSelect}
                            onInspect={handleInspect}
                            onImportSingle={handleImportSingle}
                            isImportingSingle={singleImportingIdx === idx}
                        />
                    ))}
                </div>
            ) : !isExtracting ? (
                <div className="py-16 text-center border border-dashed border-border/80 rounded-2xl bg-card/40 backdrop-blur-sm p-8 space-y-4 max-w-2xl mx-auto">
                    <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto text-cyan-400 shadow-lg shadow-cyan-500/10">
                        <Sparkles className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-base font-bold text-foreground">
                            Ready to Scrape & Import Products
                        </h3>
                        <p className="text-xs text-muted-foreground max-w-md mx-auto">
                            Enter any store, collection or product URL above. Gemini 1.5 Flash will automatically parse title, price, variants, high-resolution imagery, and catalog specs.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                        <span className="text-[11px] text-muted-foreground mr-1">Examples:</span>
                        <button
                            type="button"
                            onClick={() => setUrl("https://cottonworld.net/collections/men-shirts")}
                            className="text-[10px] font-mono px-2 py-1 rounded bg-muted/60 hover:bg-muted text-foreground border border-border/60 transition-colors"
                        >
                            cottonworld.net/collections/men-shirts
                        </button>
                        <button
                            type="button"
                            onClick={() => setUrl("https://bombayshirts.com/collections/shirts")}
                            className="text-[10px] font-mono px-2 py-1 rounded bg-muted/60 hover:bg-muted text-foreground border border-border/60 transition-colors"
                        >
                            bombayshirts.com/collections/shirts
                        </button>
                    </div>
                </div>
            ) : null}

            {/* Inspect & Single Import Modal */}
            {inspectingProduct && (
                <ScrapedProductDetailModal
                    open={!!inspectingProduct}
                    onClose={() => {
                        setInspectingProduct(null);
                        setInspectingIndex(null);
                    }}
                    product={inspectingProduct}
                    index={inspectingIndex}
                    stores={stores}
                    selectedStore={selectedStore}
                    onSaveProduct={handleSaveInspected}
                    onImportSingle={handleImportSingle}
                    isImportingSingle={singleImportingIdx === inspectingIndex}
                />
            )}
        </div>
    );
}
