"use client";

import React, { use, useState, useEffect, useCallback } from 'react';
import { ShoppingCart, Search, Filter, ArrowLeft, Package, Sparkles, AlertTriangle, MoreVertical, Plus, Edit2, Trash2, Loader2, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';
import { AddProductModal } from './_components/AddProductModal';
import { deleteProduct } from './_actions/deleteProduct'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function EcommerceProductsPage({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const workspaceId = params.workspaceId;
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [viewMode, setViewMode] = useState('list');

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/workspace/${workspaceId}/ecommerce/products`);
            const data = await res.json();
            if (data.success) setProducts(data.products);
        } catch (err) {
            console.error("Failed to fetch products:", err);
            toast.error("Failed to load products");
        } finally {
            setLoading(false);
        }
    }, [workspaceId]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleAdd = () => {
        setSelectedProduct(null);
        setModalOpen(true);
    };

    const handleEdit = (product) => {
        setSelectedProduct(product);
        setModalOpen(true);
    };

    const handleDeleteClick = (product) => {
        setProductToDelete(product);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!productToDelete) return;
        
        setDeleteLoading(productToDelete.id);
        try {
            const result = await deleteProduct(productToDelete.id);
            if (result.success) {
                toast.success('Product deleted');
                fetchProducts();
            } else {
                toast.error(result.message || 'Failed to delete');
            }
        } catch (error) {
            console.error('[DELETE_ERROR]', error);
            toast.error('Failed to delete product');
        } finally {
            setDeleteLoading(null);
            setDeleteDialogOpen(false);
            setProductToDelete(null);
        }
    };

    const handleModalClose = () => {
        setModalOpen(false);
        setSelectedProduct(null);
    };

    const handleSuccess = () => {
        fetchProducts();
    };

    return (
        <div className="space-y-4 animate-in fade-in duration-700 pb-10 p-4">
            <AddProductModal 
                open={modalOpen} 
                onClose={handleModalClose} 
                product={selectedProduct} 
                onSuccess={handleSuccess}
                workspaceId={workspaceId}
            />

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="bg-card border-border">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-foreground">Delete Product</AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                            Are you sure you want to delete "{productToDelete?.title}"? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-border hover:bg-accent">Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleDeleteConfirm}
                            disabled={deleteLoading}
                            className="bg-rose-500 hover:bg-rose-600 text-white"
                        >
                            {deleteLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href={`/workspace/${workspaceId}/ecommerce`}>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-white flex items-center gap-2">
                            Product Catalog
                        </h1>
                        <p className="text-xs text-muted-foreground  font-semibold ">
                            Manage items and optimize with AI
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center border border-white/10 rounded-md overflow-hidden">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className={`rounded-none h-8 w-8 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-white'}`}
                            onClick={() => setViewMode('list')}
                        >
                            <List className="w-4 h-4" />
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className={`rounded-none h-8 w-8 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-white'}`}
                            onClick={() => setViewMode('grid')}
                        >
                            <Grid className="w-4 h-4" />
                        </Button>
                    </div>
                    <Button onClick={handleAdd} className="gap-2 shadow-lg shadow-primary/20">
                        <Plus className="w-4 h-4" /> Add Product
                    </Button>
                </div>
            </div>

            {/* AI Optimization Banner */}
            <Card className="bg-primary/5 border-primary/20 shadow-lg shadow-primary/5 border-dashed overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Sparkles className="w-24 h-24 text-primary" />
                </div>
                <CardContent className="p-6 relative">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div className="space-y-1 text-center md:text-left">
                            <h3 className="text-lg font-bold text-white">AI Catalog Optimizer</h3>
                            <p className="text-sm text-muted-foreground">Automatically scan and improve SEO tags, descriptions, and categories for your entire catalog.</p>
                        </div>
                        <Button className="md:ml-auto gap-2 bg-primary hover:bg-primary/80 transition-all font-bold tracking-tighter uppercase text-xs">
                            Start Bulk Optimization
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Product Grid/List */}
            <div className={viewMode === 'grid' ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" : "space-y-3"}>
                {loading ? (
                    viewMode === 'grid' ? (
                        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                            <Card key={i} className="bg-card border-white/5 h-[280px] animate-pulse" />
                        ))
                    ) : (
                        [1, 2, 3, 4, 5].map(i => (
                            <Card key={i} className="bg-card border-white/5 h-24 animate-pulse" />
                        ))
                    )
                ) : products.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-muted-foreground border-2 border-dashed border-white/5 rounded-xl">
                        No products found. Connect a store to sync your catalog.
                    </div>
                ) : (
                    products.map((product) => (
                        viewMode === 'grid' ? (
                            <Card key={product.id} className="bg-card border-white/5 hover:border-primary/30 transition-all overflow-hidden group shadow-lg hover:shadow-primary/5">
                                <div className="aspect-square bg-white/3 relative overflow-hidden flex items-center justify-center p-3 grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500">
                                    {product.imageUrl ? (
                                        <img src={product.imageUrl} alt={product.title} className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-700" />
                                    ) : (
                                        <Package className="w-8 h-8 text-muted-foreground/30" />
                                    )}
                                    <div className="absolute top-1 right-1 flex flex-col gap-1">
                                        {product.status === 'active' && (
                                            <Badge className="bg-emerald-500/80 text-[8px] px-1">Active</Badge>
                                        )}
                                        {product.inventoryCount < 10 && (
                                            <Badge variant="destructive" className="text-[8px] px-1 py-0">
                                                <AlertTriangle className="w-2 h-2" /> Low
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <CardHeader className="p-2 space-y-1">
                                    <CardTitle className="text-xs font-bold text-white line-clamp-1 leading-tight">{product.title}</CardTitle>
                                    <CardDescription className="text-[9px] text-muted-foreground line-clamp-1">
                                        {product.description || product.metadata?.category || 'No description'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-2 pt-0 space-y-1 border-t border-white/5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-black text-white">₹{product.price.toLocaleString()}</p>
                                            {product.discount > 0 && (
                                                <p className="text-[9px] text-emerald-400 font-medium">-{product.discount}% OFF</p>
                                            )}
                                        </div>
                                        <Badge variant="outline" className={`text-[8px] ${product.inventoryCount < 10 ? 'text-amber-400 border-amber-400/30' : 'text-muted-foreground'}`}>
                                            {product.inventoryCount} in stock
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[8px] text-muted-foreground font-mono">{product.sku || 'N/A'}</span>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="w-6 h-6 rounded-md text-muted-foreground hover:text-white hover:bg-white/10 transition-all shrink-0">
                                                    <MoreVertical className="w-3 h-3" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-32 bg-black/80 backdrop-blur-xl border-white/10">
                                                <DropdownMenuItem 
                                                    onClick={() => handleEdit(product)}
                                                    className="gap-2 text-xs cursor-pointer focus:bg-white/10"
                                                >
                                                    <Edit2 className="w-3 h-3" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    onClick={() => handleDeleteClick(product)}
                                                    disabled={deleteLoading === product.id}
                                                    className="gap-2 text-xs cursor-pointer text-rose-400 hover:bg-rose-500/20 transition-colors"
                                                >
                                                    <Trash2 className="w-3 h-3" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card key={product.id} className="bg-card border-white/5 hover:border-primary/30 transition-all overflow-hidden group">
                                <div className="flex items-center gap-4 p-3">
                                    <div className="w-20 h-20 rounded-md bg-white/3 relative overflow-hidden flex items-center justify-center shrink-0 grayscale-[0.3] group-hover:grayscale-0 transition-all">
                                        {product.imageUrl ? (
                                            <img src={product.imageUrl} alt={product.title} className="object-cover w-full h-full" />
                                        ) : (
                                            <Package className="w-8 h-8 text-muted-foreground/30" />
                                        )}
                                        {product.status === 'active' && (
                                            <Badge className="absolute top-1 left-1 bg-emerald-500/80 text-[8px] px-1">Active</Badge>
                                        )}
                                        {product.inventoryCount < 10 && (
                                            <Badge variant="destructive" className="absolute -top-1 -right-1 text-[8px] px-1">
                                                <AlertTriangle className="w-2 h-2" />
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-4 gap-2">
                                        <div className="md:col-span-2">
                                            <CardTitle className="text-sm font-bold text-white line-clamp-1">{product.title}</CardTitle>
                                            <CardDescription className="text-[10px] text-muted-foreground line-clamp-1">
                                                {product.description || product.metadata?.category || 'No description'}
                                            </CardDescription>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="outline" className="text-[9px]">{product.metadata?.category || 'Uncategorized'}</Badge>
                                                <span className="text-[9px] text-muted-foreground font-mono">{product.sku || 'No SKU'}</span>
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] text-muted-foreground">Price</p>
                                            <p className="text-sm font-black text-white">₹{product.price?.toLocaleString()}</p>
                                            {product.discount > 0 && (
                                                <p className="text-[9px] text-emerald-400">-{product.discount}% OFF</p>
                                            )}
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] text-muted-foreground">Stock</p>
                                            <p className={`text-sm font-bold ${product.inventoryCount < 10 ? 'text-amber-400' : 'text-white'}`}>{product.inventoryCount || 0}</p>
                                            <p className="text-[9px] text-muted-foreground">Qty</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-md text-muted-foreground hover:text-white hover:bg-white/10 transition-all">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40 bg-black/80 backdrop-blur-xl border-white/10">
                                                <DropdownMenuItem 
                                                    onClick={() => handleEdit(product)}
                                                    className="gap-2 text-xs cursor-pointer focus:bg-white/10"
                                                >
                                                    <Edit2 className="w-3 h-3" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-white/10" />
                                                <DropdownMenuItem 
                                                    onClick={() => handleDeleteClick(product)}
                                                    disabled={deleteLoading === product.id}
                                                    className="gap-2 text-xs cursor-pointer text-rose-400 hover:bg-rose-500/20 transition-colors"
                                                >
                                                    <Trash2 className="w-3 h-3" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </Card>
                        )
                    ))
                )}
            </div>
        </div>
    );
}
