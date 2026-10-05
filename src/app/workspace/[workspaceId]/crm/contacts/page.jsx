'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Users,
    UserPlus,
    Search,
    Filter,
    Building2,
    Phone,
    Mail,
    MessageCircle,
    ArrowUpRight,
    TrendingUp,
    Briefcase,
    Tag,
    Trash2,
    Calendar,
    ChevronRight,
    Loader2,
    RefreshCw,
    Sparkles,
    CheckCircle2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

import CreateContactModal from './_components/CreateContactModal';
import QuickWhatsAppModal from './_components/QuickWhatsAppModal';
import { getCrmContactsAction, deleteCrmContactAction } from '../_actions/contact-actions';

export default function ContactsDirectoryPage() {
    const params = useParams();
    const router = useRouter();
    const workspaceId = params?.workspaceId;

    const [contacts, setContacts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [atsFilter, setAtsFilter] = useState('ALL');

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [waContact, setWaContact] = useState(null);
    const [isWaModalOpen, setIsWaModalOpen] = useState(false);

    const loadContacts = async (showToast = false) => {
        if (!workspaceId) return;
        try {
            if (showToast) setIsRefreshing(true);
            else setIsLoading(true);

            const res = await getCrmContactsAction(workspaceId, {
                type: typeFilter,
                hasAtsCandidate: atsFilter === 'ATS' ? true : undefined,
                search: searchQuery || undefined
            });

            if (res.success) {
                setContacts(res.data);
            } else {
                toast.error(res.error || "Failed to load contacts");
            }
            if (showToast) toast.success("Contacts refreshed");
        } catch (error) {
            console.error("Load contacts error:", error);
            toast.error("Error loading contacts");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadContacts();
    }, [workspaceId, typeFilter, atsFilter]);

    // Filtered Contacts for instant search filtering
    const filteredContacts = useMemo(() => {
        if (!searchQuery.trim()) return contacts;
        const q = searchQuery.toLowerCase();
        return contacts.filter(c =>
            c.name.toLowerCase().includes(q) ||
            c.phone.includes(q) ||
            c.email?.toLowerCase().includes(q) ||
            c.account?.name?.toLowerCase().includes(q) ||
            c.title?.toLowerCase().includes(q)
        );
    }, [contacts, searchQuery]);

    // Metrics summary
    const metrics = useMemo(() => {
        const total = contacts.length;
        const leads = contacts.filter(c => c.type === 'LEAD').length;
        const clients = contacts.filter(c => c.type === 'CLIENT').length;
        const atsSynced = contacts.filter(c => !!c.candidateId).length;
        const totalDeals = contacts.reduce((sum, c) => sum + (c.deals?.length || 0), 0);

        return { total, leads, clients, atsSynced, totalDeals };
    }, [contacts]);

    const handleDeleteContact = async (e, contactId, contactName) => {
        e.stopPropagation();
        if (!confirm(`Are you sure you want to delete contact "${contactName}"?`)) return;

        try {
            const res = await deleteCrmContactAction(workspaceId, contactId);
            if (res.success) {
                toast.success("Contact deleted");
                loadContacts();
            } else {
                toast.error(res.error || "Failed to delete contact");
            }
        } catch (error) {
            toast.error("Error deleting contact");
        }
    };

    const handleOpenWhatsApp = (e, contact) => {
        e.stopPropagation();
        setWaContact(contact);
        setIsWaModalOpen(true);
    };

    const formatCurrency = (val) => {
        return `₹ ${Number(val || 0).toLocaleString('en-IN')}`;
    };

    return (
        <div className="flex flex-col min-h-screen bg-background p-4 lg:p-8 space-y-6">
            {/* Header Strip */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl lg:text-2xl font-black tracking-tight text-foreground">
                                360° Contacts Directory
                            </h1>
                            <p className="text-xs text-muted-foreground">
                                Unified address book bridging CRM Leads, KonnectX WhatsApp contacts, and Hireflow Candidates.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 gap-1.5 text-xs font-semibold"
                        onClick={() => loadContacts(true)}
                        disabled={isRefreshing}
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </Button>
                    <Button
                        size="sm"
                        className="h-9 gap-1.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        <UserPlus className="w-4 h-4" />
                        <span>New Contact</span>
                    </Button>
                </div>
            </div>

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-sm space-y-1">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Contacts</p>
                    <p className="text-2xl font-black text-foreground">{metrics.total}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">All synchronized records</p>
                </div>
                <div className="p-4 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-sm space-y-1">
                    <p className="text-[11px] font-semibold text-amber-500 uppercase tracking-wider">Active Leads</p>
                    <p className="text-2xl font-black text-foreground">{metrics.leads}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Inbound & outbound prospects</p>
                </div>
                <div className="p-4 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-sm space-y-1">
                    <p className="text-[11px] font-semibold text-emerald-500 uppercase tracking-wider">Converted Clients</p>
                    <p className="text-2xl font-black text-foreground">{metrics.clients}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Active paying customers</p>
                </div>
                <div className="p-4 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-sm space-y-1">
                    <p className="text-[11px] font-semibold text-indigo-500 uppercase tracking-wider">Hireflow ATS Synced</p>
                    <p className="text-2xl font-black text-foreground">{metrics.atsSynced}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Candidates linked to CRM</p>
                </div>
            </div>

            {/* Filters and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-card border border-border/70">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, phone, email, company..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-9 text-xs bg-background border-border/80"
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="h-9 w-[130px] text-xs bg-background border-border/80">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Types</SelectItem>
                            <SelectItem value="LEAD">Leads Only</SelectItem>
                            <SelectItem value="CLIENT">Clients Only</SelectItem>
                            <SelectItem value="CONTACT">Contacts</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={atsFilter} onValueChange={setAtsFilter}>
                        <SelectTrigger className="h-9 w-[150px] text-xs bg-background border-border/80">
                            <SelectValue placeholder="ATS Link" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Sources</SelectItem>
                            <SelectItem value="ATS">ATS Candidates</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Contacts Table */}
            <div className="border border-border/70 rounded-2xl bg-card overflow-hidden shadow-xs">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-xs font-semibold text-muted-foreground">Loading contacts directory...</p>
                    </div>
                ) : filteredContacts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                        <div className="p-3 rounded-2xl bg-muted text-muted-foreground mb-3">
                            <Users className="w-8 h-8" />
                        </div>
                        <h3 className="text-sm font-bold text-foreground">No contacts found</h3>
                        <p className="text-xs text-muted-foreground max-w-sm mt-1">
                            {searchQuery ? "No contacts match your filter criteria." : "Start by creating your first CRM contact or syncing WhatsApp conversations."}
                        </p>
                        <Button
                            size="sm"
                            className="mt-4 text-xs font-semibold"
                            onClick={() => setIsCreateModalOpen(true)}
                        >
                            <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                            Add Contact
                        </Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                                <tr>
                                    <th className="py-3 px-4">Contact</th>
                                    <th className="py-3 px-4">Phone / WhatsApp</th>
                                    <th className="py-3 px-4">Associated Company</th>
                                    <th className="py-3 px-4">Type & Bridges</th>
                                    <th className="py-3 px-4">Open Deals</th>
                                    <th className="py-3 px-4">Last Activity</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {filteredContacts.map((contact) => {
                                    const totalDealValue = (contact.deals || []).reduce((sum, d) => sum + (d.value || 0), 0);
                                    return (
                                        <tr
                                            key={contact.id}
                                            className="hover:bg-muted/40 transition-colors cursor-pointer group"
                                            onClick={() => router.push(`/workspace/${workspaceId}/crm/contacts/${contact.id}`)}
                                        >
                                            {/* Name & Title */}
                                            <td className="py-3.5 px-4 font-bold text-foreground">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-black flex items-center justify-center text-xs shrink-0">
                                                        {contact.name?.charAt(0)?.toUpperCase() || 'U'}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-1.5 font-bold">
                                                            <span>{contact.name}</span>
                                                        </div>
                                                        <div className="text-[11px] text-muted-foreground font-normal">
                                                            {contact.title || contact.email || 'No title'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Phone & WhatsApp outreach */}
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-muted-foreground">{contact.phone}</span>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 rounded-full text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-600"
                                                        title="Quick WhatsApp message"
                                                        onClick={(e) => handleOpenWhatsApp(e, contact)}
                                                    >
                                                        <MessageCircle className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </td>

                                            {/* Account / Company */}
                                            <td className="py-3.5 px-4 text-muted-foreground">
                                                {contact.account ? (
                                                    <div className="flex items-center gap-1.5 font-medium text-foreground">
                                                        <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                                                        <span>{contact.account.name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground/50 italic">Independent</span>
                                                )}
                                            </td>

                                            {/* Type & ATS Badges */}
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <Badge
                                                        variant="secondary"
                                                        className={`text-[10px] font-bold uppercase ${
                                                            contact.type === 'LEAD' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                                            contact.type === 'CLIENT' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                                            'bg-muted text-muted-foreground'
                                                        }`}
                                                    >
                                                        {contact.type || 'CONTACT'}
                                                    </Badge>
                                                    {contact.candidateId && (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-[10px] font-bold bg-indigo-500/10 text-indigo-500 border-indigo-500/20 gap-1"
                                                        >
                                                            <Briefcase className="w-2.5 h-2.5" />
                                                            ATS
                                                        </Badge>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Deals */}
                                            <td className="py-3.5 px-4">
                                                {contact.deals && contact.deals.length > 0 ? (
                                                    <div>
                                                        <div className="font-bold text-foreground">
                                                            {formatCurrency(totalDealValue)}
                                                        </div>
                                                        <div className="text-[10px] text-muted-foreground">
                                                            {contact.deals.length} {contact.deals.length === 1 ? 'deal' : 'deals'}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground/60">—</span>
                                                )}
                                            </td>

                                            {/* Last Activity */}
                                            <td className="py-3.5 px-4 text-muted-foreground text-[11px]">
                                                {contact.lastInteraction ? (
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        <span>{new Date(contact.lastInteraction).toLocaleDateString()}</span>
                                                    </div>
                                                ) : (
                                                    <span>{new Date(contact.updatedAt).toLocaleDateString()}</span>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 text-xs font-semibold text-primary hover:text-primary gap-1"
                                                        onClick={() => router.push(`/workspace/${workspaceId}/crm/contacts/${contact.id}`)}
                                                    >
                                                        360° Dossier
                                                        <ChevronRight className="w-3.5 h-3.5" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                        title="Delete Contact"
                                                        onClick={(e) => handleDeleteContact(e, contact.id, contact.name)}
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create Contact Modal */}
            <CreateContactModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                workspaceId={workspaceId}
                onContactCreated={() => loadContacts(true)}
            />

            {/* Quick WhatsApp Outreach Modal */}
            <QuickWhatsAppModal
                isOpen={isWaModalOpen}
                onClose={() => setIsWaModalOpen(false)}
                contact={waContact}
                workspaceId={workspaceId}
                onMessageSent={() => loadContacts()}
            />
        </div>
    );
}
