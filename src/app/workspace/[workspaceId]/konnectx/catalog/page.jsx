'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
    ShoppingBag,
    Package,
    Plus,
    Search,
    RefreshCw,
    Send,
    Settings2,
    ShoppingCart,
    Tag,
    DollarSign,
    ExternalLink,
    Pencil,
    Trash2,
    CheckCircle2,
    AlertCircle,
    Copy,
    LayoutGrid,
    List,
    Globe,
    Layers,
    Loader2,
    Eye,
    TrendingUp,
    ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useAction } from "@/hooks/use-action";
import AccountSwitcher from "../_components/AccountSwitcher";

// Server Actions
import { getCatalogData } from "./_actions/get-catalog-data";
import { saveProduct } from "./_actions/save-product";
import { deleteProduct } from "./_actions/delete-product";
import { syncMetaCatalog } from "./_actions/sync-meta-catalog";
import { updateCommerceSettingsAction } from "./_actions/update-commerce-settings";
import { sendCatalogMessage } from "./_actions/send-catalog-message";

// Components
import ProductModal from "./_components/ProductModal";
import SendProductModal from "./_components/SendProductModal";
import CommerceSettingsModal from "./_components/CommerceSettingsModal";
import CatalogSwitcher from "./_components/CatalogSwitcher";

export default function CatalogPage() {
    const params = useParams();
    const workspaceId = params.workspaceId;

    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL'); // ALL | IN_STOCK | OUT_OF_STOCK | SYNCED
    const [viewMode, setViewMode] = useState('grid'); // grid | table

    const [catalogData, setCatalogData] = useState({
        hasCredentials: false,
        activePhoneId: '',
        activeWabaId: '',
        profile: '',
        commerceSettings: { is_catalog_visible: false, is_cart_enabled: false, catalog_id: null },
        metaCatalogs: [],
        products: [],
        stats: { totalProducts: 0, inStockCount: 0, totalOrders: 0, activeCatalogId: null }
    });

    // Modals
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const [isSendModalOpen, setIsSendModalOpen] = useState(false);
    const [sendingProduct, setSendingProduct] = useState(null);

    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

    // --- Actions ---
    const { execute: executeGetData } = useAction(getCatalogData, {
        onSuccess: (data) => {
            setCatalogData(data);
            setIsLoading(false);
        },
        onError: (err) => {
            toast.error(err || "Failed to load catalog data");
            setIsLoading(false);
        }
    });

    const { execute: executeSaveProduct, isLoading: isSavingProduct } = useAction(saveProduct, {
        onSuccess: (res) => {
            toast.success(editingProduct ? "Product updated" : "Product created");
            if (res.metaSynced) toast.success("Synced to Meta Catalog");
            setIsProductModalOpen(false);
            setEditingProduct(null);
            executeGetData({ workspaceId });
        },
        onError: (err) => toast.error(err || "Failed to save product")
    });

    const { execute: executeDeleteProduct } = useAction(deleteProduct, {
        onSuccess: () => {
            toast.success("Product removed");
            executeGetData({ workspaceId });
        },
        onError: (err) => toast.error(err || "Failed to delete product")
    });

    const { execute: executeSync, isLoading: isSyncing } = useAction(syncMetaCatalog, {
        onSuccess: (res) => {
            toast.success(`Synced ${res.count} products from Meta`);
            executeGetData({ workspaceId });
        },
        onError: (err) => toast.error(err || "Failed to sync Meta catalog")
    });

    const { execute: executeUpdateSettings, isLoading: isSavingSettings } = useAction(updateCommerceSettingsAction, {
        onSuccess: () => {
            toast.success("Commerce settings updated");
            setIsSettingsModalOpen(false);
            executeGetData({ workspaceId });
        },
        onError: (err) => toast.error(err || "Failed to update commerce settings")
    });

    const { execute: executeSendMessage, isLoading: isSendingMessage } = useAction(sendCatalogMessage, {
        onSuccess: () => {
            toast.success("WhatsApp catalog message sent successfully");
            setIsSendModalOpen(false);
            setSendingProduct(null);
        },
        onError: (err) => toast.error(err || "Failed to send message")
    });

    // --- Effects ---
    const refreshData = () => {
        if (workspaceId && workspaceId !== '[workspaceId]') {
            setIsLoading(true);
            executeGetData({ workspaceId });
        }
    };

    useEffect(() => {
        refreshData();

        const handleAccountSwitch = () => {
            refreshData();
        };

        window.addEventListener('wa-account-switched', handleAccountSwitch);
        return () => window.removeEventListener('wa-account-switched', handleAccountSwitch);
    }, [workspaceId]);

    const activeCatalogId = catalogData.commerceSettings?.catalog_id || catalogData.stats?.activeCatalogId;

    // Filter products
    const filteredProducts = (catalogData.products || []).filter(product => {
        const matchesSearch = (product.title || product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.sku || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.description || '').toLowerCase().includes(searchTerm.toLowerCase());

        let matchesStatus = true;
        const isInStock = product.status === 'ACTIVE' || product.status === 'in stock';

        if (statusFilter === 'IN_STOCK') matchesStatus = isInStock;
        if (statusFilter === 'OUT_OF_STOCK') matchesStatus = !isInStock;
        if (statusFilter === 'SYNCED') matchesStatus = Boolean(product.externalProductId);

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500 overflow-hidden">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between p-6 border-b border-border/40 bg-background/50 backdrop-blur-md sticky top-0 z-20 gap-4">
                <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                        <ShoppingBag className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-xl font-bold tracking-tight text-foreground">WhatsApp Catalog</h1>
                            <Badge variant="outline" className={`h-5 px-2 text-[9px] font-bold uppercase tracking-widest ${activeCatalogId ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/5' : 'border-amber-500/30 text-amber-500 bg-amber-500/5'}`}>
                                {activeCatalogId ? 'Meta Catalog Linked' : 'Catalog Not Linked'}
                            </Badge>
                            {activeCatalogId && catalogData.commerceSettings?.is_catalog_visible !== false && (
                                <Badge variant="outline" className="h-5 px-2 text-[9px] font-bold uppercase tracking-widest border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 flex items-center gap-1">
                                    <ShoppingBag className="w-3 h-3" /> Visible on Profile
                                </Badge>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground font-medium mt-0.5">
                            Manage inventory, interactive Single/Multi-Product messages & shopping carts.
                        </p>
                    </div>
                </div>

                <div className="flex flex-row items-center justify-between  gap-2.5">
                    <AccountSwitcher />

                    <CatalogSwitcher
                        activeCatalogId={activeCatalogId}
                        metaCatalogs={catalogData.metaCatalogs || []}
                        workspaceId={workspaceId}
                        isCatalogVisible={catalogData.commerceSettings?.is_catalog_visible !== false}
                        isCartEnabled={catalogData.commerceSettings?.is_cart_enabled !== false}
                        onCatalogSwitched={() => executeGetData({ workspaceId })}
                        onOpenSettings={() => setIsSettingsModalOpen(true)}
                    />

                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 px-3 rounded-lg text-xs font-semibold gap-1.5"
                        onClick={() => setIsSettingsModalOpen(true)}
                        title="Commerce Settings"
                    >
                        <Settings2 className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>Settings</span>
                    </Button>

                    {activeCatalogId && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 px-3 rounded-lg text-xs font-semibold gap-1.5"
                            onClick={() => executeSync({ workspaceId, catalogId: activeCatalogId })}
                            disabled={isSyncing}
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                            <span>Sync Meta</span>
                        </Button>
                    )}

                    {/* <Button
                        variant="outline"
                        size="sm"
                        className="h-9 px-3 rounded-lg text-xs font-semibold gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                        onClick={() => {
                            setSendingProduct(null);
                            setIsSendModalOpen(true);
                        }}
                    >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send to WhatsApp</span>
                    </Button> */}

                    <Button
                        size="sm"
                        className="h-9 px-3.5 rounded-lg text-xs font-semibold gap-1.5 bg-primary text-white shadow-lg shadow-primary/20"
                        onClick={() => {
                            setEditingProduct(null);
                            setIsProductModalOpen(true);
                        }}
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Product</span>
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex flex-col p-6 space-y-6 overflow-hidden">
                {/* Telemetry KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-card/40 border-border/50 p-4 rounded-xl flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Total Products</span>
                            <div className="text-2xl font-bold text-foreground">{catalogData.stats?.totalProducts || 0}</div>
                        </div>
                        <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20">
                            <Package className="w-5 h-5" />
                        </div>
                    </Card>

                    <Card className="bg-card/40 border-border/50 p-4 rounded-xl flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">In Stock Items</span>
                            <div className="text-2xl font-bold text-emerald-500">{catalogData.stats?.inStockCount || 0}</div>
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    </Card>

                    <Card className="bg-card/40 border-border/50 p-4 rounded-xl flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">WhatsApp Cart Status</span>
                            <div className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${catalogData.commerceSettings?.is_cart_enabled ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground'}`} />
                                <span className="text-sm font-bold text-foreground">
                                    {catalogData.commerceSettings?.is_cart_enabled ? 'Cart Enabled' : 'Cart Disabled'}
                                </span>
                            </div>
                        </div>
                        <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                            <ShoppingCart className="w-5 h-5" />
                        </div>
                    </Card>

                    <Card className="bg-card/40 border-border/50 p-4 rounded-xl flex items-center justify-between">
                        <div className="space-y-1 min-w-0 flex-1 pr-2">
                            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Active Catalog ID</span>
                            <div className="text-xs font-mono font-bold text-foreground truncate" title={activeCatalogId || 'None'}>
                                {activeCatalogId || 'Not Configured'}
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-muted-foreground"
                            onClick={() => {
                                if (activeCatalogId) {
                                    navigator.clipboard.writeText(activeCatalogId);
                                    toast.success("Catalog ID copied");
                                } else {
                                    setIsSettingsModalOpen(true);
                                }
                            }}
                        >
                            <Copy className="w-4 h-4" />
                        </Button>
                    </Card>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                        <Input
                            placeholder="Search by title, SKU, or keyword..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-10 bg-card shadow-sm border-muted-foreground/10 rounded-lg text-xs"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                            <TabsList className="bg-muted/30 p-1 h-9 rounded-lg border">
                                <TabsTrigger value="ALL" className="rounded-md text-xs font-semibold px-3 h-7">
                                    All ({catalogData.products?.length || 0})
                                </TabsTrigger>
                                <TabsTrigger value="IN_STOCK" className="rounded-md text-xs font-semibold px-3 h-7">
                                    In Stock
                                </TabsTrigger>
                                <TabsTrigger value="OUT_OF_STOCK" className="rounded-md text-xs font-semibold px-3 h-7">
                                    Out of Stock
                                </TabsTrigger>
                                <TabsTrigger value="SYNCED" className="rounded-md text-xs font-semibold px-3 h-7">
                                    Meta Synced
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>

                        <div className="flex items-center border rounded-lg p-0.5 bg-muted/20">
                            <Button
                                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                                size="icon"
                                className="h-7 w-7 rounded"
                                onClick={() => setViewMode('grid')}
                            >
                                <LayoutGrid className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                                variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                                size="icon"
                                className="h-7 w-7 rounded"
                                onClick={() => setViewMode('table')}
                            >
                                <List className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Product Catalog Explorer */}
                <ScrollArea className="flex-1">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <p className="text-xs font-medium">Loading catalog products...</p>
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-10">
                                {filteredProducts.map((product) => {
                                    const img = Array.isArray(product.imageUrls) ? product.imageUrls[0] : (product.imageUrl || product.image_url);
                                    const isInStock = product.status === 'ACTIVE' || product.status === 'in stock';

                                    return (
                                        <Card
                                            key={product.id}
                                            className="group border border-border/50 hover:border-primary/30 shadow-sm hover:shadow-md transition-all duration-200 bg-card/60 backdrop-blur-sm relative rounded-xl overflow-hidden flex flex-col justify-between"
                                        >
                                            <div className="p-3 space-y-2.5">
                                                {/* Image & Stock Badge */}
                                                <div className="relative aspect-video w-full rounded-lg bg-muted/40 overflow-hidden border border-border/40">
                                                    {img ? (
                                                        <img
                                                            src={img}
                                                            alt={product.title}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
                                                            <Package className="w-8 h-8" />
                                                        </div>
                                                    )}
                                                    <div className="absolute top-2 right-2">
                                                        <Badge
                                                            className={`text-[9px] px-1.5 py-0 h-4 font-bold shadow-sm ${isInStock ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}
                                                        >
                                                            {isInStock ? 'In Stock' : 'Out of Stock'}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                {/* Details */}
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between gap-1">
                                                        <span className="text-[10px] font-mono uppercase text-muted-foreground/80 font-bold truncate">
                                                            {product.sku || 'NO-SKU'}
                                                        </span>
                                                        {product.externalProductId && (
                                                            <Badge variant="outline" className="text-[8px] px-1 py-0 h-3.5 border-emerald-500/30 text-emerald-600 bg-emerald-500/5">
                                                                Meta Synced
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    <h3
                                                        className="text-sm font-semibold text-foreground break-words whitespace-normal leading-snug group-hover:text-primary transition-colors cursor-pointer"
                                                        title={product.title}
                                                        onClick={() => {
                                                            setEditingProduct(product);
                                                            setIsProductModalOpen(true);
                                                        }}
                                                    >
                                                        {product.title}
                                                    </h3>

                                                    {product.description && (
                                                        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                                                            {product.description}
                                                        </p>
                                                    )}

                                                    <div className="pt-1 flex items-baseline gap-1">
                                                        <span className="text-xs font-semibold text-muted-foreground">{product.currency || 'INR'}</span>
                                                        <span className="text-base font-bold text-foreground">
                                                            {Number(product.price).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Footer */}
                                            <div className="px-3 py-2 bg-muted/10 border-t border-border/40 flex items-center justify-between gap-1.5">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 px-2.5 text-xs font-medium gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 rounded-md flex-1 truncate"
                                                    onClick={() => {
                                                        setSendingProduct(product);
                                                        setIsSendModalOpen(true);
                                                    }}
                                                >
                                                    <Send className="w-3 h-3 shrink-0" />
                                                    <span className="truncate">Send to WhatsApp</span>
                                                </Button>

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground shrink-0"
                                                        >
                                                            <Pencil className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-36">
                                                        <DropdownMenuItem
                                                            className="text-xs gap-2 cursor-pointer"
                                                            onClick={() => {
                                                                setEditingProduct(product);
                                                                setIsProductModalOpen(true);
                                                            }}
                                                        >
                                                            <Pencil className="w-3.5 h-3.5" />
                                                            Edit Product
                                                        </DropdownMenuItem>
                                                        {product.url && (
                                                            <DropdownMenuItem
                                                                className="text-xs gap-2 cursor-pointer"
                                                                onClick={() => window.open(product.url, '_blank')}
                                                            >
                                                                <ExternalLink className="w-3.5 h-3.5" />
                                                                View Link
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-xs gap-2 text-destructive focus:text-destructive cursor-pointer"
                                                            onClick={() => executeDeleteProduct({ workspaceId, id: product.id })}
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="border border-border/50 rounded-xl overflow-hidden bg-card/40">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-muted/30 border-b border-border/40 text-muted-foreground">
                                        <tr>
                                            <th className="p-3 font-semibold">Product</th>
                                            <th className="p-3 font-semibold">SKU</th>
                                            <th className="p-3 font-semibold">Price</th>
                                            <th className="p-3 font-semibold">Status</th>
                                            <th className="p-3 font-semibold">Meta Sync</th>
                                            <th className="p-3 font-semibold text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/40">
                                        {filteredProducts.map((product) => {
                                            const img = Array.isArray(product.imageUrls) ? product.imageUrls[0] : (product.imageUrl || product.image_url);
                                            const isInStock = product.status === 'ACTIVE' || product.status === 'in stock';

                                            return (
                                                <tr key={product.id} className="hover:bg-muted/10 transition-colors">
                                                    <td className="p-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-lg bg-muted/40 overflow-hidden shrink-0 border">
                                                                {img ? (
                                                                    <img src={img} alt={product.title} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground"><Package className="w-4 h-4" /></div>
                                                                )}
                                                            </div>
                                                            <span className="font-semibold text-foreground break-words max-w-[240px]">{product.title}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-3 font-mono text-muted-foreground">{product.sku || 'N/A'}</td>
                                                    <td className="p-3 font-bold">{product.currency || 'INR'} {Number(product.price).toLocaleString()}</td>
                                                    <td className="p-3">
                                                        <Badge className={`text-[10px] ${isInStock ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border-rose-500/20'}`}>
                                                            {isInStock ? 'In Stock' : 'Out of Stock'}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-3">
                                                        {product.externalProductId ? (
                                                            <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30">Synced</Badge>
                                                        ) : (
                                                            <span className="text-muted-foreground/60 text-[11px]">Local Only</span>
                                                        )}
                                                    </td>
                                                    <td className="p-3 text-right">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-7 px-2 text-xs text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/10"
                                                                onClick={() => {
                                                                    setSendingProduct(product);
                                                                    setIsSendModalOpen(true);
                                                                }}
                                                            >
                                                                <Send className="w-3 h-3 mr-1" />
                                                                Send
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                                                onClick={() => {
                                                                    setEditingProduct(product);
                                                                    setIsProductModalOpen(true);
                                                                }}
                                                            >
                                                                <Pencil className="w-3 h-3" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                                                onClick={() => executeDeleteProduct({ workspaceId, id: product.id })}
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border/60 rounded-2xl gap-3 text-center bg-card/20">
                            <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                <ShoppingBag className="w-8 h-8" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-base font-bold text-foreground">No Products Found</h3>
                                <p className="text-xs text-muted-foreground max-w-sm">
                                    {searchTerm
                                        ? "No products match your search query."
                                        : "Start building your WhatsApp Catalog by adding products or syncing from Meta."}
                                </p>
                            </div>
                            <Button
                                size="sm"
                                className="mt-2 text-xs font-semibold gap-1.5"
                                onClick={() => {
                                    setEditingProduct(null);
                                    setIsProductModalOpen(true);
                                }}
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Add First Product
                            </Button>
                        </div>
                    )}
                </ScrollArea>
            </div>

            {/* Modals */}
            <ProductModal
                isOpen={isProductModalOpen}
                onClose={() => {
                    setIsProductModalOpen(false);
                    setEditingProduct(null);
                }}
                onSave={(data) => executeSaveProduct({ ...data, workspaceId })}
                product={editingProduct}
                catalogId={activeCatalogId}
                workspaceId={workspaceId}
                isLoading={isSavingProduct}
            />

            <SendProductModal
                isOpen={isSendModalOpen}
                onClose={() => {
                    setIsSendModalOpen(false);
                    setSendingProduct(null);
                }}
                onSend={(data) => executeSendMessage({ ...data, workspaceId })}
                selectedProduct={sendingProduct}
                products={catalogData.products || []}
                catalogId={activeCatalogId}
                workspaceId={workspaceId}
                isLoading={isSendingMessage}
            />

            <CommerceSettingsModal
                isOpen={isSettingsModalOpen}
                onClose={() => {
                    setIsSettingsModalOpen(false);
                    executeGetData({ workspaceId });
                }}
                onSave={(data) => executeUpdateSettings({ ...data, workspaceId })}
                settings={catalogData.commerceSettings}
                metaCatalogs={catalogData.metaCatalogs || []}
                workspaceId={workspaceId}
                activePhoneId={catalogData.activePhoneId}
                isLoading={isSavingSettings}
            />
        </div>
    );
}
