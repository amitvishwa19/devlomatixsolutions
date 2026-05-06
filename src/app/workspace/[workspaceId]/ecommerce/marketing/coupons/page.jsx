'use client'

import React, { use, useState, useEffect, useCallback } from 'react';
import { Ticket, Plus, Search, Filter, MoreVertical, Edit2, Trash2, Loader2, Calendar, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { AddCouponModal } from './_components/AddCouponModal';
import { getCoupons, deleteCoupon } from './_actions/couponActions';
import { getStores } from '../../settings/_actions/getStores';
import { useAction } from '@/hooks/use-action';
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

export default function CouponsPage({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const workspaceId = params.workspaceId;
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [couponToDelete, setCouponToDelete] = useState(null);
    const [selectedStore, setSelectedStore] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const { execute: fetchStores, data: storesData } = useAction(getStores);

    useEffect(() => {
        if (workspaceId) {
            fetchStores({ workspaceId });
        }
    }, [workspaceId, fetchStores]);

    const stores = storesData?.stores || [];

    const fetchCouponsList = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getCoupons(workspaceId);
            if (res.success) setCoupons(res.data);
            else toast.error(res.error);
        } catch (err) {
            toast.error("Failed to load coupons");
        } finally {
            setLoading(false);
        }
    }, [workspaceId]);

    useEffect(() => {
        fetchCouponsList();
    }, [fetchCouponsList]);

    const handleAdd = () => {
        setSelectedCoupon(null);
        setModalOpen(true);
    };

    const handleEdit = (coupon) => {
        setSelectedCoupon(coupon);
        setModalOpen(true);
    };

    const handleDeleteClick = (coupon) => {
        setCouponToDelete(coupon);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!couponToDelete) return;
        try {
            const res = await deleteCoupon(couponToDelete.id);
            if (res.success) {
                toast.success("Coupon deleted");
                fetchCouponsList();
            } else {
                toast.error(res.error);
            }
        } catch (error) {
            toast.error("Failed to delete");
        } finally {
            setDeleteDialogOpen(false);
        }
    };

    const filteredCoupons = coupons.filter(c => {
        const matchesStore = selectedStore === 'all' || c.storeId === selectedStore;
        const matchesSearch = c.code.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStore && matchesSearch;
    });

    return (
        <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                        <Ticket className="w-8 h-8 text-primary" />
                        Discount Coupons
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage promotional codes and special offers for your stores.
                    </p>
                </div>
                <Button onClick={handleAdd} className="gap-2 shadow-lg shadow-primary/20">
                    <Plus className="w-4 h-4" />
                    New Coupon
                </Button>
            </div>

            <Card className="bg-card/50 border-white/5 backdrop-blur-sm">
                <CardHeader className="pb-3">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search coupon code..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-background border-white/10"
                            />
                        </div>
                        <Select value={selectedStore} onValueChange={setSelectedStore}>
                            <SelectTrigger className="w-full md:w-[200px] bg-background border-white/10">
                                <SelectValue placeholder="All Stores" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Stores</SelectItem>
                                {stores.map(s => (
                                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            <p className="text-sm text-muted-foreground">Loading coupons...</p>
                        </div>
                    ) : filteredCoupons.length === 0 ? (
                        <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-xl">
                            <Ticket className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-white">No coupons found</h3>
                            <p className="text-sm text-muted-foreground mt-1">Create your first discount code to get started.</p>
                            <Button onClick={handleAdd} variant="outline" className="mt-6 border-white/10">
                                Create Coupon
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/5 text-xs text-muted-foreground uppercase tracking-wider">
                                        <th className="px-4 py-3 font-medium">Code</th>
                                        <th className="px-4 py-3 font-medium">Store</th>
                                        <th className="px-4 py-3 font-medium">Value</th>
                                        <th className="px-4 py-3 font-medium">Usage</th>
                                        <th className="px-4 py-3 font-medium">Status</th>
                                        <th className="px-4 py-3 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredCoupons.map((coupon) => (
                                        <tr key={coupon.id} className="group hover:bg-white/5 transition-colors">
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                                        <Tag className="w-4 h-4 text-primary" />
                                                    </div>
                                                    <span className="font-bold text-white uppercase tracking-tight">{coupon.code}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-muted-foreground">
                                                {coupon.store?.name}
                                            </td>
                                            <td className="px-4 py-4">
                                                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold">
                                                    {coupon.type === 'PERCENTAGE' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-4 text-sm">
                                                <span className="text-white font-medium">{coupon.usedCount}</span>
                                                <span className="text-muted-foreground"> / {coupon.usageLimit || '∞'}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                {coupon.isActive ? (
                                                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/20">Active</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-muted-foreground">Paused</Badge>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-card border-white/5">
                                                        <DropdownMenuItem onClick={() => handleEdit(coupon)} className="gap-2">
                                                            <Edit2 className="w-4 h-4" /> Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="bg-white/5" />
                                                        <DropdownMenuItem onClick={() => handleDeleteClick(coupon)} className="gap-2 text-destructive">
                                                            <Trash2 className="w-4 h-4" /> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <AddCouponModal 
                open={modalOpen} 
                onClose={() => setModalOpen(false)} 
                coupon={selectedCoupon}
                onSuccess={fetchCouponsList}
                workspaceId={workspaceId}
            />

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="bg-card border-white/5">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Coupon?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete the coupon "{couponToDelete?.code}"? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
