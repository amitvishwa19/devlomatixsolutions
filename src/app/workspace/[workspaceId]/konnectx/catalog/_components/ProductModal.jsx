'use client';

import React, { useState, useEffect, useRef } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Package,
    Image as ImageIcon,
    Globe,
    DollarSign,
    Tag,
    Loader2,
    Upload,
    FolderOpen,
    Link as LinkIcon,
    X,
    Check,
    CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAction } from '@/hooks/use-action';
import { getWorkspaceImages } from '../_actions/get-workspace-images';

export default function ProductModal({
    isOpen,
    onClose,
    onSave,
    product = null,
    catalogId = null,
    workspaceId,
    isLoading = false
}) {
    const [title, setTitle] = useState('');
    const [sku, setSku] = useState('');
    const [price, setPrice] = useState('');
    const [currency, setCurrency] = useState('INR');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [url, setUrl] = useState('');
    const [status, setStatus] = useState('ACTIVE');
    const [pushToMeta, setPushToMeta] = useState(true);

    // Image Tab state: 'upload' | 'documents' | 'url'
    const [imageSourceTab, setImageSourceTab] = useState('upload');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [workspaceImages, setWorkspaceImages] = useState([]);
    const [isLoadingImages, setIsLoadingImages] = useState(false);
    const fileInputRef = useRef(null);

    const { execute: executeGetImages } = useAction(getWorkspaceImages, {
        onSuccess: (data) => {
            setWorkspaceImages(data.images || []);
            setIsLoadingImages(false);
        },
        onError: () => {
            setIsLoadingImages(false);
        }
    });

    useEffect(() => {
        if (isOpen && workspaceId) {
            setIsLoadingImages(true);
            executeGetImages({ workspaceId });
        }
    }, [isOpen, workspaceId]);

    useEffect(() => {
        if (product) {
            setTitle(product.title || product.name || '');
            setSku(product.sku || product.retailer_id || '');
            setPrice(product.price ? String(product.price) : '');
            setCurrency(product.currency || 'INR');
            setDescription(product.description || '');
            const img = Array.isArray(product.imageUrls) ? product.imageUrls[0] : (product.imageUrl || product.image_url || '');
            setImageUrl(img || '');
            setUrl(product.url || '');
            setStatus(product.status === 'out of stock' ? 'out of stock' : 'ACTIVE');
        } else {
            setTitle('');
            setSku(`SKU_${Date.now().toString().slice(-6)}`);
            setPrice('');
            setCurrency('INR');
            setDescription('');
            setImageUrl('https://images.unsplash.com/photo-1523275335684-37898b6baf30');
            setUrl('');
            setStatus('ACTIVE');
            setPushToMeta(Boolean(catalogId));
        }
    }, [product, isOpen, catalogId]);

    // Handle Direct File Upload
    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error("Please upload a valid image file (PNG, JPG, WEBP, etc.)");
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            toast.error("Image file size must be less than 10MB");
            return;
        }

        setIsUploading(true);
        setUploadProgress(20);

        try {
            const fileExt = file.name.split('.').pop() || 'jpg';
            const sanitizedBase = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_");
            const storageFileName = `${Date.now()}_${sanitizedBase}.${fileExt}`;
            const filePath = `catalog_images/${workspaceId || 'common'}/${storageFileName}`;

            setUploadProgress(50);

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('devlomatix')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            setUploadProgress(80);

            const { data: { publicUrl } } = supabase.storage
                .from('devlomatix')
                .getPublicUrl(filePath);

            setImageUrl(publicUrl);
            setUploadProgress(100);
            toast.success("Image uploaded and linked to catalog product");

            // Refresh document images
            if (workspaceId) {
                executeGetImages({ workspaceId });
            }
        } catch (err) {
            console.error("Upload error:", err);
            toast.error("Upload failed: " + (err.message || "Unknown error"));
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) {
            toast.error("Product title is required");
            return;
        }
        const numericPrice = parseFloat(price);
        if (isNaN(numericPrice) || numericPrice < 0) {
            toast.error("Valid price is required");
            return;
        }

        onSave({
            id: product?.id,
            title: title.trim(),
            sku: sku.trim() || `SKU_${Date.now()}`,
            price: numericPrice,
            currency: currency.toUpperCase(),
            description: description.trim(),
            imageUrl: imageUrl.trim(),
            url: url.trim(),
            status,
            catalogId: pushToMeta ? catalogId : undefined
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="px-6 pt-6 pb-3 border-b border-border/40">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-sm">
                            <Package className="w-5 h-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-bold text-foreground">
                                {product ? "Edit Product" : "Add Catalog Product"}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                {catalogId
                                    ? `Directly synchronized to Meta Catalog (${catalogId})`
                                    : "Saved to your local WhatsApp product vault"}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                    <ScrollArea className="flex-1 px-6 py-4 max-h-[calc(90vh-140px)]">
                        <div className="space-y-4 pb-4">
                            {/* Product Title */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Product Title *</Label>
                                <Input
                                    placeholder="e.g. Premium Wireless Noise-Cancelling Headphones"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="h-9 text-xs"
                                    required
                                />
                            </div>

                            {/* SKU & Stock */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">SKU / Item ID *</Label>
                                    <div className="relative">
                                        <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                        <Input
                                            placeholder="SKU-1001"
                                            value={sku}
                                            onChange={(e) => setSku(e.target.value)}
                                            className="h-9 text-xs pl-8 font-mono uppercase"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Stock Availability</Label>
                                    <Select value={status} onValueChange={setStatus}>
                                        <SelectTrigger className="h-9 text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ACTIVE">In Stock</SelectItem>
                                            <SelectItem value="out of stock">Out of Stock</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Price & Currency */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Price *</Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="1999.00"
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            className="h-9 text-xs pl-8"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Currency</Label>
                                    <Select value={currency} onValueChange={setCurrency}>
                                        <SelectTrigger className="h-9 text-xs font-mono">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="INR">INR (₹)</SelectItem>
                                            <SelectItem value="USD">USD ($)</SelectItem>
                                            <SelectItem value="EUR">EUR (€)</SelectItem>
                                            <SelectItem value="GBP">GBP (£)</SelectItem>
                                            <SelectItem value="AED">AED (د.إ)</SelectItem>
                                            <SelectItem value="CAD">CAD ($)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Image Selection Section */}
                            <div className="space-y-2 border border-border/50 rounded-xl p-3.5 bg-muted/10">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-semibold flex items-center gap-1.5">
                                        <ImageIcon className="w-3.5 h-3.5 text-primary" />
                                        Product Image
                                    </Label>
                                    {imageUrl && (
                                        <Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-500/5 border-emerald-500/20">
                                            Image Linked
                                        </Badge>
                                    )}
                                </div>

                                <Tabs value={imageSourceTab} onValueChange={setImageSourceTab} className="w-full">
                                    <TabsList className="grid grid-cols-3 h-8 p-0.5 bg-muted/30 border">
                                        <TabsTrigger value="upload" className="text-[11px] font-semibold gap-1 px-2 h-7">
                                            <Upload className="w-3 h-3" />
                                            Upload File
                                        </TabsTrigger>
                                        <TabsTrigger value="documents" className="text-[11px] font-semibold gap-1 px-2 h-7">
                                            <FolderOpen className="w-3 h-3" />
                                            Documents ({workspaceImages.length})
                                        </TabsTrigger>
                                        <TabsTrigger value="url" className="text-[11px] font-semibold gap-1 px-2 h-7">
                                            <LinkIcon className="w-3 h-3" />
                                            Image URL
                                        </TabsTrigger>
                                    </TabsList>

                                    {/* Upload Tab */}
                                    <TabsContent value="upload" className="pt-2 space-y-2">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileUpload}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="border-2 border-dashed border-border/60 hover:border-primary/50 hover:bg-primary/5 rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5"
                                        >
                                            {isUploading ? (
                                                <div className="flex flex-col items-center gap-2 py-2">
                                                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                                    <span className="text-xs text-muted-foreground font-medium">
                                                        Uploading image ({uploadProgress}%)...
                                                    </span>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="p-2.5 rounded-full bg-primary/10 text-primary">
                                                        <Upload className="w-4 h-4" />
                                                    </div>
                                                    <div className="text-xs font-semibold text-foreground">
                                                        Click or drop image here to upload
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground">
                                                        Supports PNG, JPG, WEBP up to 10MB (automatically saved to Document Vault)
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </TabsContent>

                                    {/* Documents Tab */}
                                    <TabsContent value="documents" className="pt-2">
                                        {isLoadingImages ? (
                                            <div className="flex items-center justify-center py-6 gap-2 text-xs text-muted-foreground">
                                                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                                Loading workspace images...
                                            </div>
                                        ) : workspaceImages.length > 0 ? (
                                            <ScrollArea className="h-32 border rounded-lg p-2 bg-background/50">
                                                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                                                    {workspaceImages.map((doc) => {
                                                        const isSelected = imageUrl === doc.fileUrl;
                                                        return (
                                                            <div
                                                                key={doc.id}
                                                                onClick={() => setImageUrl(doc.fileUrl)}
                                                                className={`group relative aspect-square rounded-lg overflow-hidden border cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary border-primary' : 'border-border/50 hover:border-primary/40'}`}
                                                                title={doc.name}
                                                            >
                                                                <img
                                                                    src={doc.fileUrl}
                                                                    alt={doc.name}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                                />
                                                                {isSelected && (
                                                                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                                                        <CheckCircle2 className="w-4 h-4 text-primary bg-background rounded-full shadow" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </ScrollArea>
                                        ) : (
                                            <div className="text-center py-5 text-xs text-muted-foreground border rounded-lg bg-card/20">
                                                No image documents found in this workspace. Upload an image above to get started.
                                            </div>
                                        )}
                                    </TabsContent>

                                    {/* URL Tab */}
                                    <TabsContent value="url" className="pt-2 space-y-1.5">
                                        <div className="relative">
                                            <LinkIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                            <Input
                                                placeholder="https://images.unsplash.com/photo-..."
                                                value={imageUrl}
                                                onChange={(e) => setImageUrl(e.target.value)}
                                                className="h-9 text-xs pl-8 font-mono"
                                            />
                                        </div>
                                    </TabsContent>
                                </Tabs>

                                {/* Live Image Preview Card */}
                                {imageUrl && (
                                    <div className="flex items-center gap-3 p-2 bg-background/80 border border-border/60 rounded-xl mt-2">
                                        <div className="w-12 h-12 rounded-lg bg-muted/40 overflow-hidden border shrink-0">
                                            <img
                                                src={imageUrl}
                                                alt="Selected Preview"
                                                className="w-full h-full object-cover"
                                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1 space-y-0.5">
                                            <div className="text-[11px] font-semibold text-foreground truncate">
                                                Active Image URL
                                            </div>
                                            <div className="text-[10px] text-muted-foreground font-mono truncate" title={imageUrl}>
                                                {imageUrl}
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                                            onClick={() => setImageUrl('')}
                                            title="Remove Image"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Product Description */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Product Description</Label>
                                <Textarea
                                    rows={4}
                                    placeholder="Describe features, specifications, and warranty..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="text-xs min-h-[70px] resize-none"
                                />
                            </div>

                            {/* Store / Checkout URL */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Store / Checkout URL (Optional)</Label>
                                <div className="relative">
                                    <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                    <Input
                                        placeholder="https://yourstore.com/products/item"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        className="h-9 text-xs pl-8 font-mono"
                                    />
                                </div>
                            </div>

                            {/* Meta Sync Toggle */}
                            {catalogId && (
                                <div className="flex items-center justify-between p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                                    <div className="space-y-0.5">
                                        <div className="text-xs font-semibold text-foreground">Sync to Meta Catalog</div>
                                        <div className="text-[10px] text-muted-foreground">Upload to Meta Catalog ({catalogId}) immediately</div>
                                    </div>
                                    <Switch checked={pushToMeta} onCheckedChange={setPushToMeta} />
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    <DialogFooter className="px-6 py-3 border-t border-border/40 bg-muted/10 gap-2">
                        <Button variant="outline" type="button" onClick={onClose} disabled={isLoading} className="h-9 text-xs">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading || isUploading} className="h-9 text-xs gap-1.5 bg-primary text-white">
                            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            {product ? "Save Changes" : "Create Product"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
