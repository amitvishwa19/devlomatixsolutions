'use client';

import { useState, useEffect } from 'react';
import { useModal } from '@/hooks/useModal';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import { Loader2, Package, Tag, IndianRupee, Hash, Layers, ImageIcon } from 'lucide-react';
import axios from '@/utils/axios';
import { FileUpload } from '@/components/global/FileUpload';

export const AddProductModal = () => {
    const { isOpen, onClose, type, data } = useModal();
    const isModalOpen = isOpen && type === 'addProduct';
    const { workspaceId, onApply } = data;

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        sku: '',
        price: '',
        discount: '',
        quantity: '',
        status: 'active',
        category: '',
        imageUrl: ''
    });

    useEffect(() => {
        if (data?.product) {
            setFormData({
                title: data.product.title || '',
                description: data.product.description || '',
                sku: data.product.sku || '',
                price: data.product.price || '',
                discount: data.product.discount || '',
                quantity: data.product.inventoryCount || '',
                status: data.product.status || 'active',
                category: data.product.category || '',
                imageUrl: data.product.imageUrl || ''
            });
        } else {
            setFormData({
                title: '',
                description: '',
                sku: '',
                price: '',
                discount: '',
                quantity: '',
                status: 'active',
                category: '',
                imageUrl: ''
            });
        }
    }, [data]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (data?.product) {
                await axios.patch(`/api/workspace/${workspaceId}/ecommerce/products/${data.product.id}`, formData);
            } else {
                await axios.post(`/api/workspace/${workspaceId}/ecommerce/products`, formData);
            }

            toast.success(data?.product ? "Product updated successfully" : "Product added successfully");
            onApply?.();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isModalOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-card/95 backdrop-blur-xl border-border/40 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <Package className="w-5 h-5 text-primary" />
                        {data?.product ? 'Edit Product' : 'Add New Product'}
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Configure your product details, pricing, and inventory.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="grid grid-cols-2 gap-6">
                        {/* Image Upload */}
                        <div className="col-span-2 space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider opacity-70">Product Artifact Image</Label>
                            <div className="flex items-center justify-center border-2 border-dashed border-border/40 rounded-xl p-4 bg-background/30 hover:bg-background/50 transition-all">
                                <FileUpload
                                    endpoint="serverImage"
                                    value={formData.imageUrl}
                                    onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                                />
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="col-span-2 space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider opacity-70">Product Title</Label>
                                <div className="relative group">
                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                                    <Input
                                        required
                                        placeholder="e.g. Amethyst Crystal Bracelet"
                                        className="pl-10 bg-background/50 border-border/40"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider opacity-70">Description</Label>
                                <Textarea
                                    rows='10'
                                    placeholder="Describe the product's mystical properties and features..."
                                    className="min-h-[100px] bg-background/50 border-border/40"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Inventory & SKU */}
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider opacity-70">SKU (Unique Identifier)</Label>
                            <div className="relative group">
                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                                <Input
                                    placeholder="SKU-001"
                                    className="pl-10 bg-background/50 border-border/40"
                                    value={formData.sku}
                                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider opacity-70">Stock Quantity</Label>
                            <div className="relative group">
                                <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                                <Input
                                    type="number"
                                    placeholder="0"
                                    className="pl-10 bg-background/50 border-border/40"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Pricing */}
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider opacity-70">Price (INR)</Label>
                            <div className="relative group">
                                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                                <Input
                                    required
                                    type="number"
                                    placeholder="0.00"
                                    className="pl-10 bg-background/50 border-border/40"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider opacity-70">Discount (%)</Label>
                            <div className="relative group">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 font-bold group-focus-within:text-primary transition-colors">%</span>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    className="pl-10 bg-background/50 border-border/40"
                                    value={formData.discount}
                                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Status & Category */}
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider opacity-70">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(val) => setFormData({ ...formData, status: val })}
                            >
                                <SelectTrigger className="bg-background/50 border-border/40">
                                    <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border/40">
                                    <SelectItem value="active">Active (Visible)</SelectItem>
                                    <SelectItem value="draft">Draft (Hidden)</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider opacity-70">Category</Label>
                            <Input
                                placeholder="e.g. Healing Crystals"
                                className="bg-background/50 border-border/40"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-6">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="hover:bg-white/5"
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={loading}
                            type="submit"
                            className="bg-primary hover:bg-primary/90 px-8 shadow-lg shadow-primary/20"
                        >
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {data?.product ? 'Save Changes' : 'Create Product'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
