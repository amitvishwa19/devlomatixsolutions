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
    CheckCircle2,
    UploadCloud,
    Share2,
    ShieldCheck
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

import CreateContactModal from './_components/CreateContactModal';
import CrmWhatsAppOutreachSheet from '../_components/CrmWhatsAppOutreachSheet';
import BulkImportModal from '../_components/BulkImportModal';
import CrmShareContactModal from './_components/CrmShareContactModal';
import { getCrmContactsAction, deleteCrmContactAction } from '../_actions/contact-actions';
import CrmHierarchyFilter from '../_components/CrmHierarchyFilter';

export default function ContactsDirectoryPage() {
    const params = useParams();
    const router = useRouter();
    const workspaceId = params?.workspaceId;

    const [contacts, setContacts] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [atsFilter, setAtsFilter] = useState('ALL');
    const [moduleFilter, setModuleFilter] = useState('ALL'); // 'ALL' | 'crm' | 'ats' | 'konnectx'
    const [scopeFilter, setScopeFilter] = useState('ALL'); // 'ALL' | 'OWNED' | 'SHARED'
    const [targetUserId, setTargetUserId] = useState('ALL');

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
    const [waContact, setWaContact] = useState(null);
    const [isWaModalOpen, setIsWaModalOpen] = useState(false);
    const [shareModalContact, setShareModalContact] = useState(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    const loadContacts = async (showToast = false) => {
        if (!workspaceId) return;
        try {
            if (showToast) setIsRefreshing(true);
            else setIsLoading(true);

            const res = await getCrmContactsAction(workspaceId, {
                type: typeFilter,
                hasAtsCandidate: atsFilter === 'ATS' ? true : undefined,
                search: searchQuery || undefined,
                scope: scopeFilter,
                moduleFilter: moduleFilter !== 'ALL' ? moduleFilter : undefined,
                targetUserId: targetUserId !== 'ALL' ? targetUserId : undefined
            });

            if (res.success) {
                setContacts(res.data);
                if (res.currentUserId) setCurrentUserId(res.currentUserId);
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
    }, [workspaceId, typeFilter, atsFilter, scopeFilter, moduleFilter, targetUserId]);

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
        const myContacts = contacts.filter(c => c.userId === currentUserId).length;
        const sharedWithMe = contacts.filter(c => c.userId !== currentUserId).length;
        const leads = contacts.filter(c => c.type === 'LEAD').length;
        const clients = contacts.filter(c => c.type === 'CLIENT').length;
        const atsSynced = contacts.filter(c => !!c.candidateId).length;
        const totalDeals = contacts.reduce((sum, c) => sum + (c.deals?.length || 0), 0);

        return { total, myContacts, sharedWithMe, leads, clients, atsSynced, totalDeals };
    }, [contacts, currentUserId]);

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

    const handleOpenShare = (e, contact) => {
        e.stopPropagation();
        setShareModalContact(contact);
        setIsShareModalOpen(true);
    };

    const formatCurrency = (val) => {
        return `₹ ${Number(val || 0).toLocaleString('en-IN')}`;
    };

    return (
        <div className="flex flex-col bg-background space-y-2 p-4">
            {/* Header Strip */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl lg:text-xl font-bold  text-foreground">
                                360° Contacts Directory
                            </h1>
                            <p className="text-xs text-muted-foreground">
                                CRM contacts owned by you and records securely shared across your sales team.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <CrmHierarchyFilter
                        workspaceId={workspaceId}
                        selectedUserId={targetUserId}
                        onUserChange={setTargetUserId}
                    />
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 gap-1.5 text-xs font-semibold"
                        onClick={() => setIsBulkImportOpen(true)}
                    >
                        <UploadCloud className="w-3.5 h-3.5 text-primary" />
                        <span>Bulk Import & Sync</span>
                    </Button>
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
                <div className="p-4 rounded-xl border border-border/70 bg-card/60 backdrop-blur-sm space-y-1">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Accessible</p>
                    <p className="text-2xl font-black text-foreground">{metrics.total}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">CRM contacts for your profile</p>
                </div>
                <div className="p-4 rounded-xl border border-border/70 bg-card/60 backdrop-blur-sm space-y-1">
                    <p className="text-[11px] font-semibold text-blue-500 uppercase tracking-wider">My Contacts</p>
                    <p className="text-2xl font-black text-foreground">{metrics.myContacts}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Created / owned by you</p>
                </div>
                <div className="p-4 rounded-xl border border-border/70 bg-card/60 backdrop-blur-sm space-y-1">
                    <p className="text-[11px] font-semibold text-violet-500 uppercase tracking-wider">Shared with Me</p>
                    <p className="text-2xl font-black text-foreground">{metrics.sharedWithMe}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Granted access by team</p>
                </div>
                <div className="p-4 rounded-xl border border-border/70 bg-card/60 backdrop-blur-sm space-y-1">
                    <p className="text-[11px] font-semibold text-amber-500 uppercase tracking-wider">Active Leads</p>
                    <p className="text-2xl font-black text-foreground">{metrics.leads}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Inbound & outbound prospects</p>
                </div>
            </div>

            {/* Filters, Scope Tabs, and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/70">
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, phone, email, company..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-9 text-xs bg-background border-border/80"
                        />
                    </div>

                    {/* Scope Switcher Tabs */}
                    <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/60 border border-border/60 w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={() => setScopeFilter('ALL')}
                            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${scopeFilter === 'ALL'
                                ? 'bg-card text-foreground shadow-xs'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            All ({metrics.total})
                        </button>
                        <button
                            type="button"
                            onClick={() => setScopeFilter('OWNED')}
                            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${scopeFilter === 'OWNED'
                                ? 'bg-card text-foreground shadow-xs'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            My Contacts ({metrics.myContacts})
                        </button>
                        <button
                            type="button"
                            onClick={() => setScopeFilter('SHARED')}
                            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${scopeFilter === 'SHARED'
                                ? 'bg-card text-foreground shadow-xs'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            Shared with Me ({metrics.sharedWithMe})
                        </button>
                    </div>
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
                        <SelectTrigger className="h-9 w-[130px] text-xs bg-background border-border/80">
                            <SelectValue placeholder="ATS Link" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Sources</SelectItem>
                            <SelectItem value="ATS">ATS Linked</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={moduleFilter} onValueChange={setModuleFilter}>
                        <SelectTrigger className="h-9 w-[135px] text-xs bg-background border-border/80">
                            <SelectValue placeholder="Module" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Modules</SelectItem>
                            <SelectItem value="crm">CRM (DevX)</SelectItem>
                            <SelectItem value="ats">HireFlow ATS</SelectItem>
                            <SelectItem value="konnectx">KonnectX WA</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Contacts Table */}
            <div className="border border-border/70 rounded-xl bg-card overflow-hidden shadow-xs">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-xs font-semibold text-muted-foreground">Loading contacts directory...</p>
                    </div>
                ) : filteredContacts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                        <div className="p-3 rounded-xl bg-muted text-muted-foreground mb-3">
                            <Users className="w-8 h-8" />
                        </div>
                        <h3 className="text-sm font-bold text-foreground">No contacts found</h3>
                        <p className="text-xs text-muted-foreground max-w-sm mt-1">
                            {searchQuery ? "No contacts match your filter criteria." : "Create your first CRM contact or have team members share contacts with you."}
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
                                    <th className="py-3 px-4">Type & Access</th>
                                    <th className="py-3 px-4">Open Deals</th>
                                    <th className="py-3 px-4">Last Activity</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-border/60">
                                {filteredContacts.map((contact) => {
                                    const totalDealValue = (contact.deals || []).reduce((sum, d) => sum + (d.value || 0), 0);
                                    const isOwner = contact.userId === currentUserId;
                                    const sharedCount = contact.sharedWith?.length || contact._count?.sharedWith || 0;

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
                                            {/* Type, ATS & Sharing Badges */}
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <Badge
                                                        variant="secondary"
                                                        className={`text-[10px] font-bold uppercase ${contact.type === 'LEAD' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                                            contact.type === 'CLIENT' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                                                'bg-muted text-muted-foreground'
                                                            }`}
                                                    >
                                                        {contact.type || 'CONTACT'}
                                                    </Badge>
                                                    {(contact.candidateId || (contact.moduleAccess?.modules || []).includes('ats')) && (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-[10px] font-bold bg-indigo-500/10 text-indigo-500 border-indigo-500/20 gap-1"
                                                            title="Linked to HireFlow ATS"
                                                        >
                                                            <Briefcase className="w-2.5 h-2.5" />
                                                            ATS
                                                        </Badge>
                                                    )}
                                                    {(contact.moduleAccess?.modules || []).includes('konnectx') && (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1"
                                                            title="Linked to KonnectX WhatsApp"
                                                        >
                                                            <MessageCircle className="w-2.5 h-2.5" />
                                                            KonnectX
                                                        </Badge>
                                                    )}
                                                    {!isOwner ? (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-[10px] font-semibold bg-violet-500/10 text-violet-600 border-violet-500/20 gap-1"
                                                            title={`Shared with you by ${contact.user?.displayName || contact.user?.email || 'Team member'}`}
                                                        >
                                                            <Share2 className="w-2.5 h-2.5" />
                                                            Shared with you
                                                        </Badge>
                                                    ) : sharedCount > 0 ? (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-[10px] font-semibold bg-blue-500/10 text-blue-600 border-blue-500/20 gap-1 cursor-pointer hover:bg-blue-500/20"
                                                            onClick={(e) => handleOpenShare(e, contact)}
                                                            title="Click to manage shared access"
                                                        >
                                                            <Users className="w-2.5 h-2.5" />
                                                            Shared ({sharedCount})
                                                        </Badge>
                                                    ) : null}
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
                                                    {contact.phone && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 text-[#25D366] hover:bg-[#25D366]/10"
                                                            title={`Send WhatsApp message to ${contact.name}`}
                                                            onClick={(e) => handleOpenWhatsApp(e, contact)}
                                                        >
                                                            <MessageCircle className="w-3.5 h-3.5" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                                        title={isOwner ? `Share ${contact.name}` : `View shared team members`}
                                                        onClick={(e) => handleOpenShare(e, contact)}
                                                    >
                                                        <Share2 className="w-3.5 h-3.5" />
                                                    </Button>
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
                                                    {isOwner && (
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
                                                    )}
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

            {/* Share Contact Access Modal */}
            <CrmShareContactModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                contact={shareModalContact}
                workspaceId={workspaceId}
                currentUserId={currentUserId}
                onShareUpdated={() => loadContacts()}
            />

            {/* KonnectX WhatsApp Outreach Sheet */}
            <CrmWhatsAppOutreachSheet
                isOpen={isWaModalOpen}
                onClose={() => setIsWaModalOpen(false)}
                recipient={waContact ? {
                    name: waContact.name,
                    phone: waContact.phone,
                    email: waContact.email,
                    company: waContact.account?.name,
                    contactId: waContact.id
                } : null}
                workspaceId={workspaceId}
                onSuccess={() => loadContacts()}
            />

            {/* Bulk Lead Importer & WhatsApp Chat Sync Modal */}
            <BulkImportModal
                isOpen={isBulkImportOpen}
                onClose={() => setIsBulkImportOpen(false)}
                workspaceId={workspaceId}
                onImportComplete={() => loadContacts(true)}
            />
        </div>
    );
}
