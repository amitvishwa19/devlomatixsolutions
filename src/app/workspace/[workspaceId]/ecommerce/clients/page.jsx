"use client";

import React, { use, useState, useEffect } from 'react';
import { Users, Search, Plus, ArrowLeft, MoreVertical, Edit2, Trash2, Mail, Phone, MapPin, ShoppingBag, UserPlus } from "lucide-react";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';

export default function EcommerceClientsPage({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const workspaceId = params.workspaceId;

    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState('list');
    const [selectedClient, setSelectedClient] = useState(null);

    useEffect(() => {
        fetchClients();
    }, [workspaceId]);

    const fetchClients = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/workspace/${workspaceId}/ecommerce/clients`);
            const data = await res.json();
            if (data.success) setClients(data.clients);
        } catch (err) {
            console.error("Failed to fetch clients:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddClient = () => {
        setSelectedClient(null);
        setModalOpen(true);
    };

    const handleEditClient = (client) => {
        setSelectedClient(client);
        setModalOpen(true);
    };

    const getClientTypeColor = (type) => {
        switch (type?.toUpperCase()) {
            case 'VIP': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            case 'WHOLESALE': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case 'RETAIL': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
        }
    };

    const filteredClients = clients.filter(client =>
        client.name?.toLowerCase().includes(search.toLowerCase()) ||
        client.email?.toLowerCase().includes(search.toLowerCase()) ||
        client.phone?.includes(search)
    );

    return (
        <div className="space-y-4 animate-in fade-in duration-700 pb-10 p-4">
            <AddClientModal 
                open={modalOpen} 
                onClose={() => { setModalOpen(false); setSelectedClient(null); }}
                client={selectedClient}
                workspaceId={workspaceId}
                onSuccess={fetchClients}
            />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href={`/workspace/${workspaceId}/ecommerce`}>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-white flex items-center gap-2">
                            <Users className="w-5 h-5 text-primary" />
                            Clients
                        </h1>
                        <p className="text-xs text-muted-foreground font-semibold">
                            Manage and register customers
                        </p>
                    </div>
                </div>
                <Button onClick={handleAddClient} className="gap-2 shadow-lg shadow-primary/20">
                    <UserPlus className="w-4 h-4" /> Add Client
                </Button>
            </div>

            <Card className="bg-card border-white/5">
                <CardHeader className="pb-3 border-b border-white/5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <CardTitle className="text-base">All Clients ({clients.length})</CardTitle>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Search clients..." 
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9 w-64 bg-black/20 border-white/5"
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-8 text-center text-muted-foreground">Loading...</div>
                    ) : filteredClients.length === 0 ? (
                        <div className="p-12 text-center">
                            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground mb-4">No clients found</p>
                            <Button onClick={handleAddClient} className="gap-2">
                                <UserPlus className="w-4 h-4" /> Add Your First Client
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-white/2 border-b border-white/5">
                                    <tr>
                                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Client</th>
                                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Contact</th>
                                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Type</th>
                                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Orders</th>
                                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Total Spent</th>
                                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Joined</th>
                                        <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredClients.map((client) => (
                                        <tr key={client.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                                                        <span className="text-xs font-medium text-primary">
                                                            {client.name?.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-white">{client.name}</p>
                                                        <p className="text-xs text-muted-foreground">{client.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="space-y-1">
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Phone className="w-3 h-3" /> {client.phone}
                                                    </p>
                                                    {client.address && (
                                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <MapPin className="w-3 h-3" /> {client.address}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge className={`text-[10px] font-bold uppercase ${getClientTypeColor(client.type)} border`}>
                                                    {client.type || 'RETAIL'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm text-white">{client._count?.orders || 0}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm text-white font-medium">
                                                    ₹{(client.totalSpent || 0).toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-xs text-muted-foreground">
                                                    {client.createdAt ? new Date(client.createdAt).toLocaleDateString() : '-'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="w-6 h-6 text-muted-foreground hover:text-white">
                                                            <MoreVertical className="w-3 h-3" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-40 bg-black/80 backdrop-blur-xl border-white/10">
                                                        <DropdownMenuItem onClick={() => handleEditClient(client)} className="gap-2 text-xs">
                                                            <Edit2 className="w-3 h-3" /> Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="gap-2 text-xs">
                                                            <ShoppingBag className="w-3 h-3" /> View Orders
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="bg-white/10" />
                                                        <DropdownMenuItem className="gap-2 text-xs text-rose-400">
                                                            <Trash2 className="w-3 h-3" /> Delete
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
        </div>
    );
}

function AddClientModal({ open, onClose, client, workspaceId, onSuccess }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        type: 'RETAIL',
        address: '',
        city: '',
        state: '',
        pincode: '',
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (client) {
            setFormData({
                name: client.name || '',
                email: client.email || '',
                phone: client.phone || '',
                type: client.type || 'RETAIL',
                address: client.address || '',
                city: client.city || '',
                state: client.state || '',
                pincode: client.pincode || '',
            });
        } else {
            setFormData({
                name: '',
                email: '',
                phone: '',
                type: 'RETAIL',
                address: '',
                city: '',
                state: '',
                pincode: '',
            });
        }
    }, [client]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const url = client 
                ? `/api/workspace/${workspaceId}/ecommerce/clients/${client.id}`
                : `/api/workspace/${workspaceId}/ecommerce/clients`;
            
            const method = client ? 'PATCH' : 'POST';
            
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            const data = await res.json();
            if (data.success) {
                toast.success(client ? 'Client updated' : 'Client added');
                onSuccess();
                onClose();
            } else {
                toast.error(data.error || 'Failed to save client');
            }
        } catch (err) {
            toast.error('Failed to save client');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="bg-card border-white/10 text-white max-w-md">
                <DialogHeader>
                    <DialogTitle>{client ? 'Edit Client' : 'Add New Client'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <Label className="text-xs text-muted-foreground">Full Name *</Label>
                                <Input 
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="bg-black/20 border-white/10 mt-1"
                                    required
                                />
                            </div>
                            <div className="col-span-2">
                                <Label className="text-xs text-muted-foreground">Email</Label>
                                <Input 
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="bg-black/20 border-white/10 mt-1"
                                />
                            </div>
                            <div className="col-span-2">
                                <Label className="text-xs text-muted-foreground">Phone *</Label>
                                <Input 
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    className="bg-black/20 border-white/10 mt-1"
                                    required
                                />
                            </div>
                            <div className="col-span-2">
                                <Label className="text-xs text-muted-foreground">Client Type</Label>
                                <select 
                                    value={formData.type}
                                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 mt-1 text-sm"
                                >
                                    <option value="RETAIL">Retail</option>
                                    <option value="WHOLESALE">Wholesale</option>
                                    <option value="VIP">VIP</option>
                                </select>
                            </div>
                            <div className="col-span-2">
                                <Label className="text-xs text-muted-foreground">Address</Label>
                                <Input 
                                    value={formData.address}
                                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                                    className="bg-black/20 border-white/10 mt-1"
                                />
                            </div>
                            <div>
                                <Label className="text-xs text-muted-foreground">City</Label>
                                <Input 
                                    value={formData.city}
                                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                                    className="bg-black/20 border-white/10 mt-1"
                                />
                            </div>
                            <div>
                                <Label className="text-xs text-muted-foreground">State</Label>
                                <Input 
                                    value={formData.state}
                                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                                    className="bg-black/20 border-white/10 mt-1"
                                />
                            </div>
                            <div className="col-span-2">
                                <Label className="text-xs text-muted-foreground">Pincode</Label>
                                <Input 
                                    value={formData.pincode}
                                    onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                                    className="bg-black/20 border-white/10 mt-1"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} className="border-white/10">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={saving} className="bg-primary">
                            {saving ? 'Saving...' : client ? 'Update' : 'Add Client'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}