"use client";

import React, { use, useState, useEffect, useCallback } from 'react';
import { Settings, ArrowLeft, RefreshCw, Plus, Trash2, ExternalLink, ShieldCheck, Database, ShoppingCart, List, Grid, MoreVertical, Edit2, Key, Copy, Check, Webhook } from "lucide-react";

const getWebhookUrl = () => {
    const baseUrl = (process.env.NEXT_PUBLIC_URL || 'https://dev.devlomatix.com').replace(/\/$/, '');
    return `${baseUrl}/api/workspace/ecommerce/stores`;
};
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';
import { AddStoreModal } from './_components/AddStoreModal';
import { ApiKeyModal } from './_components/ApiKeyModal';
import { DeleteStoreModal } from './_components/DeleteStoreModal';
import { getStores, deleteStore, regenerateApiKey, toggleStoreStatus } from './_actions';
import { useAction } from "@/hooks/use-action";

export default function EcommerceSettingsPage({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const workspaceId = params.workspaceId;

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedStore, setSelectedStore] = useState(null);
    const [viewMode, setViewMode] = useState('list');
    const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
    const [apiKeyStore, setApiKeyStore] = useState(null);
    const [copiedSlug, setCopiedSlug] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [storeToDelete, setStoreToDelete] = useState(null);

    const handleCopySlug = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedSlug(id);
        toast.success('Copied to clipboard!');
        setTimeout(() => setCopiedSlug(null), 2000);
    };

    const { execute: fetchStores, data: storesData, isLoading: loadingStores } = useAction(getStores, {
        onSuccess: (data) => { },
        onError: (error) => {
            toast.error("Failed to load stores");
        }
    });

    const { execute: removeStore, isLoading: deletingStore } = useAction(deleteStore, {
        onSuccess: (data) => {
            toast.success("Store deleted");
            setDeleteModalOpen(false);
            setStoreToDelete(null);
            fetchStores({ workspaceId });
        },
        onError: (error) => {
            toast.error(error || "Failed to delete store");
            setDeleteModalOpen(false);
            setStoreToDelete(null);
        }
    });

    const { execute: updateStatus, isLoading: updatingStatus } = useAction(toggleStoreStatus, {
        onSuccess: (data) => {
            toast.success(`Store marked as ${data.store.status}`);
            fetchStores({ workspaceId });
        },
        onError: (error) => {
            toast.error(error || "Failed to update store status");
        }
    });

    const handleToggleStatus = (store) => {
        const newStatus = store.status === 'connected' ? 'disconnected' : 'connected';
        updateStatus({ workspaceId, storeId: store.id, newStatus });
    };

    const { execute: regenApiKey, isLoading: regeneratingKey } = useAction(regenerateApiKey, {
        onSuccess: (data) => {
            toast.success('New API key generated!');
            navigator.clipboard.writeText(data.apiKey);
            fetchStores({ workspaceId });
            toast.info('New API key copied to clipboard');
        },
        onError: (error) => {
            toast.error(error || "Failed to regenerate API key");
        }
    });

    useEffect(() => {
        fetchStores({ workspaceId });
    }, [workspaceId, fetchStores]);

    const stores = storesData?.stores || [];

    const handleAdd = () => {
        setSelectedStore(null);
        setModalOpen(true);
    };

    const handleEdit = (store) => {
        setSelectedStore(store);
        setModalOpen(true);
    };

    const handleDelete = (store) => {
        setStoreToDelete(store);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (storeToDelete) {
            removeStore({ workspaceId, storeId: storeToDelete.id });
        }
    };

    const handleSuccess = () => {
        fetchStores({ workspaceId });
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'connected': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'disconnected': return 'bg-destructive/10 text-destructive border-destructive/20';
            case 'sync_error': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        }
    };

    return (
        <div className="space-y-4 animate-in fade-in duration-700 pb-10 p-4">
            <AddStoreModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                store={selectedStore}
                onSuccess={handleSuccess}
                workspaceId={workspaceId}
            />

            <ApiKeyModal
                open={apiKeyModalOpen}
                onClose={() => { setApiKeyModalOpen(false); setApiKeyStore(null); }}
                store={apiKeyStore}
                workspaceId={workspaceId}
            />

            <DeleteStoreModal
                open={deleteModalOpen}
                onClose={() => { setDeleteModalOpen(false); setStoreToDelete(null); }}
                store={storeToDelete}
                onConfirm={confirmDelete}
                isDeleting={deletingStore}
            />

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
                            eCommerce Settings
                        </h1>
                        <p className="text-xs text-muted-foreground font-semibold ">
                            Manage store connections and sync preferences
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
                        <Plus className="w-4 h-4" /> Add New Store
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Store Connections */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 px-2">
                        <Database className="w-5 h-5 text-primary" />
                        Connected Stores ({stores.length})
                    </h3>

                    {loadingStores ? (
                        <div className="space-y-4">
                            {[1, 2].map(i => (
                                <Card key={i} className="bg-card border-white/5 h-32 animate-pulse" />
                            ))}
                        </div>
                    ) : stores.length === 0 ? (
                        <Card className="bg-card border-white/5 p-12 text-center">
                            <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No stores connected yet.</p>
                            <Button onClick={handleAdd} className="mt-4 gap-2">
                                <Plus className="w-4 h-4" /> Add Your First Store
                            </Button>
                        </Card>
                    ) : (
                        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-4"}>
                            {stores.map((store) => (
                                viewMode === 'grid' ? (
                                    <Card key={store.id} className="bg-card border-white/5 hover:border-white/10 transition-all overflow-hidden group p-0">
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${store.platform === 'shopify' ? 'bg-[#95BF47]/10 border border-[#95BF47]/20 text-[#95BF47]' : store.platform === 'woocommerce' ? 'bg-[#7F54B3]/10 border border-[#7F54B3]/20 text-[#7F54B3]' : 'bg-primary/10 border border-primary/20 text-primary'}`}>
                                                    <ShoppingCart className="w-5 h-5" />
                                                </div>

                                            </div>
                                            <h4 className="text-sm font-bold text-white line-clamp-1">{store.name}</h4>
                                            <div className="space-y-1 mt-1">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[10px] text-muted-foreground">Store Name:</span>
                                                    <code className="text-[10px] font-mono text-primary">{store.name}</code>
                                                    <button
                                                        onClick={() => handleCopySlug(store.slug, `slug-${store.id}`)}
                                                        className="text-muted-foreground hover:text-primary"
                                                    >
                                                        {copiedSlug === `slug-${store.id}` ? (
                                                            <Check className="w-3 h-3 text-green-500" />
                                                        ) : (
                                                            <Copy className="w-3 h-3" />
                                                        )}
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[10px] text-muted-foreground">Store ID:</span>
                                                    <code className="text-[10px] font-mono text-primary">{store.id}</code>
                                                    <button
                                                        onClick={() => handleCopySlug(store.id, `id-${store.id}`)}
                                                        className="text-muted-foreground hover:text-primary"
                                                    >
                                                        {copiedSlug === `id-${store.id}` ? (
                                                            <Check className="w-3 h-3 text-green-500" />
                                                        ) : (
                                                            <Copy className="w-3 h-3" />
                                                        )}
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[10px] text-muted-foreground">API Key:</span>
                                                    <code className="text-[10px] font-mono text-amber-500 break-all">{store.apiKey}</code>
                                                    <button
                                                        onClick={() => handleCopySlug(store.apiKey, `apikey-${store.id}`)}
                                                        className="text-muted-foreground hover:text-amber-500"
                                                    >
                                                        {copiedSlug === `apikey-${store.id}` ? (
                                                            <Check className="w-3 h-3 text-green-500" />
                                                        ) : (
                                                            <Copy className="w-3 h-3" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 mt-1">
                                                <ExternalLink className="w-3 h-3 text-muted-foreground" />
                                                <p className="text-[10px] text-muted-foreground truncate">{store.storeUrl}</p>
                                            </div>
                                            <div className="flex items-center gap-1 mt-1">
                                                <Webhook className="w-3 h-3 text-muted-foreground" />
                                                <code className="text-[10px] font-mono text-muted-foreground truncate">{getWebhookUrl()}</code>
                                                <button
                                                    onClick={() => handleCopySlug(getWebhookUrl(), `api-${store.id}`)}
                                                    className="text-muted-foreground hover:text-primary"
                                                >
                                                    {copiedSlug === `api-${store.id}` ? (
                                                        <Check className="w-3 h-3 text-green-500" />
                                                    ) : (
                                                        <Copy className="w-3 h-3" />
                                                    )}
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between mt-3">
                                                <div className="flex items-center gap-2">
                                                    <Switch
                                                        checked={store.status === 'connected'}
                                                        onCheckedChange={() => handleToggleStatus(store)}
                                                        disabled={updatingStatus}
                                                        className="data-[state=checked]:bg-emerald-500"
                                                    />
                                                    <Badge className={`text-[9px] font-bold uppercase ${getStatusColor(store.status)} border`}>
                                                        {store.status}
                                                    </Badge>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="w-6 h-6 text-muted-foreground hover:text-white">
                                                            <MoreVertical className="w-3 h-3" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-40 bg-black/80 backdrop-blur-xl border-white/10">
                                                        <DropdownMenuItem onClick={() => handleEdit(store)} className="gap-2 text-xs">
                                                            <Edit2 className="w-3 h-3" /> Edit Store
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="bg-white/10" />
                                                        <DropdownMenuItem onClick={() => handleDelete(store)} className="gap-2 text-xs text-rose-400">
                                                            <Trash2 className="w-3 h-3" /> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <Card key={store.id} className="bg-card border-white/5 hover:border-white/10 transition-all overflow-hidden group p-0">
                                        <CardContent className="p-0">
                                            <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="flex items-center gap-4">

                                                    <div>
                                                        <div className="flex items-center justify-between gap-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w-8 h-8 rounded-md flex items-center justify-center shadow-inner ${store.platform === 'shopify' ? 'bg-[#95BF47]/10 border border-[#95BF47]/20 text-[#95BF47]' : store.platform === 'woocommerce' ? 'bg-[#7F54B3]/10 border border-[#7F54B3]/20 text-[#7F54B3]' : 'bg-primary/10 border border-primary/20 text-primary'}`}>
                                                                    <ShoppingCart className="w-6 h-6" />
                                                                </div>
                                                                <h4 className="text-base font-bold text-white">{store.name}</h4>
                                                                <Switch
                                                                    checked={store.status === 'connected'}
                                                                    onCheckedChange={() => handleToggleStatus(store)}
                                                                    disabled={updatingStatus}
                                                                    className="data-[state=checked]:bg-emerald-500"
                                                                />
                                                                <Badge className={`text-[10px] font-bold uppercase ${getStatusColor(store.status)} border`}>
                                                                    {store.status}
                                                                </Badge>
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                <Button variant="ghost" size="sm" className="gap-2 border-white/5 hover:bg-white/5">
                                                                    <RefreshCw className="w-3.5 h-3.5" /> Sync
                                                                </Button>
                                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(store)} className="text-muted-foreground hover:text-white transition-colors">
                                                                    <Settings className="w-4 h-4" />
                                                                </Button>
                                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(store)} className="text-destructive/50 hover:text-destructive transition-colors">
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </div>

                                                        </div>



                                                        
                                                        <div className="flex flex-col items-start gap-3 mt-2">
                                                            
                                                            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2 py-1 rounded-md">
                                                                <span className="text-[10px] text-muted-foreground whitespace-nowrap uppercase tracking-wider">Store Name:</span>
                                                                <code className="text-xs font-mono text-primary">{store.name}</code>
                                                                <button
                                                                    onClick={() => handleCopySlug(store.name, `name-${store.id}`)}
                                                                    className="text-muted-foreground hover:text-primary ml-1"
                                                                >
                                                                    {copiedSlug === `name-${store.id}` ? (
                                                                        <Check className="w-3 h-3 text-green-500" />
                                                                    ) : (
                                                                        <Copy className="w-3 h-3" />
                                                                    )}
                                                                </button>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2 py-1 rounded-md">
                                                                <span className="text-[10px] text-muted-foreground whitespace-nowrap uppercase tracking-wider">Store ID:</span>
                                                                <code className="text-xs font-mono text-primary">{store.id}</code>
                                                                <button
                                                                    onClick={() => handleCopySlug(store.id, `id-${store.id}`)}
                                                                    className="text-muted-foreground hover:text-primary ml-1"
                                                                >
                                                                    {copiedSlug === `id-${store.id}` ? (
                                                                        <Check className="w-3 h-3 text-green-500" />
                                                                    ) : (
                                                                        <Copy className="w-3 h-3" />
                                                                    )}
                                                                </button>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2 py-1 rounded-md">
                                                                <span className="text-[10px] text-muted-foreground whitespace-nowrap uppercase tracking-wider">Webhook:</span>
                                                                <code className="text-xs font-mono text-muted-foreground">{getWebhookUrl()}</code>
                                                                <button
                                                                    onClick={() => handleCopySlug(getWebhookUrl(), `webhook-${store.id}`)}
                                                                    className="text-muted-foreground hover:text-primary ml-1"
                                                                >
                                                                    {copiedSlug === `webhook-${store.id}` ? (
                                                                        <Check className="w-3 h-3 text-green-500" />
                                                                    ) : (
                                                                        <Copy className="w-3 h-3" />
                                                                    )}
                                                                </button>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2 py-1 rounded-md">
                                                                <span className="text-[10px] text-muted-foreground whitespace-nowrap uppercase tracking-wider">API Key:</span>
                                                                <code className="text-xs font-mono text-amber-500 break-all">{store.apiKey}</code>
                                                                <button
                                                                    onClick={() => handleCopySlug(store.apiKey, `apikey-${store.id}`)}
                                                                    className="text-muted-foreground hover:text-amber-500 ml-1"
                                                                >
                                                                    {copiedSlug === `apikey-${store.id}` ? (
                                                                        <Check className="w-3 h-3 text-green-500" />
                                                                    ) : (
                                                                        <Copy className="w-3 h-3" />
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>
                                                        {store.description && (
                                                            <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">{store.description}</p>
                                                        )}
                                                    </div>
                                                </div>

                                            </div>
                                            <div className="bg-white/2 p-2 px-4 border-t border-white/5 flex items-center justify-between">
                                                <p className="text-[10px] text-muted-foreground">
                                                    Last sync: <span className="text-white">{store.lastSyncAt ? new Date(store.lastSyncAt).toLocaleString() : 'Never'}</span>
                                                </p>
                                                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                    <ShieldCheck className="w-3 h-3 text-emerald-500" /> Secure
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            ))}
                        </div>
                    )}
                </div>

                {/* Integration Options */}
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-white px-2">Preferences</h3>

                    <Card className="bg-card border-white/5">
                        <CardHeader className="pb-3 ">
                            <CardTitle className="text-sm">Auto-Syncing</CardTitle>
                            <CardDescription className="text-[10px]">How often we pull data from your stores.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5">
                                <span className="text-sm text-white">Refresh Rate</span>
                                <Badge variant="outline" className="border-primary/50 text-primary">30 Minutes</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5">
                                <span className="text-sm text-white">Webhooks</span>
                                <Badge variant="outline" className="text-emerald-500 border-emerald-500/30">Enabled</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-white/5">
                        <CardHeader className="pb-3 ">
                            <CardTitle className="text-sm">Advanced Automation</CardTitle>
                            <CardDescription className="text-[10px]">Smart features for growth.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm text-white">AI Optimization</p>
                                    <p className="text-[10px] text-muted-foreground leading-tight">Automatically improve product tags using Gemini AI.</p>
                                </div>
                                <div className="w-10 h-5 bg-primary/20 rounded-full border border-primary/30 relative cursor-not-allowed">
                                    <div className="absolute top-0.5 left-0.5 w-3.5 h-3.5 bg-primary rounded-full shadow-lg" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}