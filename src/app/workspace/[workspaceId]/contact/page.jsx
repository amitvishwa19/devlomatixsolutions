'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Users,
    UserPlus,
    Filter,
    MoreVertical,
    Smartphone,
    Mail,
    Tag,
    Download,
    Trash2,
    CheckCircle2,
    X,
    Building2,
    Crown,
    RefreshCw,
    LayoutGrid,
    List,
    ChevronRight,
    Star,
    MessageSquare,
    Globe
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { ContactSheet } from './_components/ContactSheet';
import { DeleteContactDialog } from './_components/DeleteContactDialog';


const CONTACT_TYPES = [
    { value: 'CONTACT', label: 'Contact', color: 'bg-blue-500/10 text-blue-400' },
    { value: 'CLIENT', label: 'Client', color: 'bg-emerald-500/10 text-emerald-400' },
    { value: 'LEAD', label: 'Lead', color: 'bg-amber-500/10 text-amber-400' }
];

export default function ContactManagementPage() {
    const params = useParams();
    const workspaceId = params?.workspaceId;
    const defaultType = "all";

    // --- State ---
    const [contacts, setContacts] = useState([]);
    const [groups, setGroups] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedGroup, setSelectedGroup] = useState("all");
    const [selectedType, setSelectedType] = useState(defaultType);
    const [selectedContacts, setSelectedContacts] = useState([]);

    // Create/Edit Sheet State
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingContact, setEditingContact] = useState(null);

    // Delete Modal State
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [contactToDelete, setContactToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        type: defaultType === 'all' ? 'CONTACT' : defaultType,
        groupIds: [],
        tags: [],
        categoryId: '',
        info: {
            company: '',
            designation: '',
            website: '',
            linkedin: '',
            city: '',
            country: '',
            source: '',
            notes: ''
        }
    });

    // --- Fetch Data ---
    const fetchData = async () => {
        setLoading(true);
        try {
            const [contactsRes, groupsRes, categoriesRes] = await Promise.all([
                fetch(`/api/workspace/${workspaceId}/contacts`),
                fetch(`/api/workspace/${workspaceId}/contacts/groups`),
                fetch(`/api/workspace/${workspaceId}/management/category`)
            ]);

            if (contactsRes.ok) setContacts(await contactsRes.json());
            if (groupsRes.ok) setGroups(await groupsRes.json());
            if (categoriesRes.ok) setCategories(await categoriesRes.json());
        } catch (error) {
            toast.error("Failed to sync with vault");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (workspaceId) fetchData();
    }, [workspaceId]);

    // --- Handlers ---
    const handleSaveContact = async (e) => {
        e.preventDefault();
        const method = editingContact ? 'PATCH' : 'POST';
        const url = editingContact
            ? `/api/workspace/${workspaceId}/contacts/${editingContact.id}`
            : `/api/workspace/${workspaceId}/contacts`;

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success(editingContact ? "Contact updated" : "Contact saved to vault");
                setIsSheetOpen(false);
                setEditingContact(null);
                setFormData({
                    name: '',
                    phone: '',
                    email: '',
                    type: 'CONTACT',
                    groupIds: [],
                    tags: [],
                    categoryId: '',
                    info: {
                        company: '',
                        designation: '',
                        website: '',
                        linkedin: '',
                        city: '',
                        country: '',
                        source: '',
                        notes: ''
                    }
                });
                fetchData();
            } else {
                const err = await res.json();
                toast.error(err.message || "Operation failed");
            }
        } catch (error) {
            toast.error("Vault interaction error");
        }
    };

    const handleInfoChange = (key, value) => {
        setFormData(prev => ({
            ...prev,
            info: {
                ...prev.info,
                [key]: value
            }
        }));
    };

    const handleDeleteContact = async () => {
        if (!contactToDelete) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/workspace/${workspaceId}/contacts/${contactToDelete.id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success("Contact removed from vault");
                fetchData();
                setIsDeleteDialogOpen(false);
                setContactToDelete(null);
            } else {
                const err = await res.json();
                toast.error(err.message || "Operation failed");
            }
        } catch (error) {
            toast.error("Operation failed");
        } finally {
            setIsDeleting(false);
        }
    };

    // --- Filtered Data ---
    const filteredContacts = useMemo(() => {
        return contacts.filter(contact => {
            const matchesSearch =
                contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                contact.phone.includes(searchTerm) ||
                contact.email?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesGroup = selectedGroup === "all" || contact.groups?.some(g => g.id === selectedGroup);
            const matchesType = selectedType === "all" || contact.type === selectedType;

            return matchesSearch && matchesGroup && matchesType;
        });
    }, [contacts, searchTerm, selectedGroup, selectedType]);

    // --- UI Helpers ---
    const getAvatarColor = (name) => {
        const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500', 'bg-rose-500', 'bg-indigo-500'];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    return (
        <div className="flex flex-col h-full overflow-hidden animate-in fade-in duration-700 ">
            {/* --- TOP HUD --- */}
            <div className="p-6 pb-2 border-b border-white/5 backdrop-blur-xl bg-background/20 sticky top-0 z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2 bg-primary/20 rounded-xl border border-primary/20">
                                <Users className="w-5 h-5 text-primary" />
                            </div>
                            <h1 className="text-xl font-bold tracking-tight text-white">Contact Management</h1>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Secure Business Vault & Multi-channel CRM
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className=" hover:bg-zinc-800 transition-all active:scale-95"
                            onClick={() => fetchData()}
                        >
                            <RefreshCw className={`w-3.5 h-3.5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Sync
                        </Button>
                        <ContactSheet
                            open={isSheetOpen}
                            onOpenChange={(v) => {
                                setIsSheetOpen(v);
                                if (!v) {
                                    setEditingContact(null);
                                    setFormData({
                                        name: '',
                                        phone: '',
                                        email: '',
                                        type: 'CONTACT',
                                        groupIds: [],
                                        info: {
                                            company: '',
                                            designation: '',
                                            website: '',
                                            linkedin: '',
                                            city: '',
                                            country: '',
                                            source: '',
                                            notes: ''
                                        }
                                    });
                                }
                            }}
                            formData={formData}
                            setFormData={setFormData}
                            onSave={handleSaveContact}
                            handleInfoChange={handleInfoChange}
                            CONTACT_TYPES={CONTACT_TYPES}
                            editingContact={editingContact}
                            categories={categories}
                        />
                    </div>
                </div>

                {/* HUD STATS */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
                    {[
                        { label: "Total Vault", val: contacts.length, icon: Building2, col: "text-blue-400", bg: "bg-blue-500/10" },
                        { label: "Active Clients", val: contacts.filter(c => c.type === 'CLIENT').length, icon: Star, col: "text-emerald-400", bg: "bg-emerald-500/10" },
                        { label: "New Leads", val: contacts.filter(c => c.type === 'LEAD').length, icon: Crown, col: "text-amber-400", bg: "bg-amber-500/10" },
                        { label: "Tagged Groups", val: groups.length, icon: Tag, col: "text-purple-400", bg: "bg-purple-500/10" },
                    ].map((stat, i) => (
                        <div key={i} className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-all group overflow-hidden relative">
                            <stat.icon className={`w-8 h-8 absolute -right-2 -bottom-2 opacity-5 ${stat.col} group-hover:scale-150 transition-transform blur-sm`} />
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${stat.bg}`}>
                                    <stat.icon className={`w-4 h-4 ${stat.col}`} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">{stat.label}</p>
                                    <h3 className="text-lg font-black text-white">{stat.val}</h3>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- TABS NAVIGATION --- */}
            <div className="px-6 py-2 border-b border-white/5 bg-background/40 backdrop-blur-md">
                <Tabs value={selectedType} onValueChange={setSelectedType} className="w-full">
                    <TabsList className="bg-zinc-900/50 border border-white/5 p-1 h-12">
                        <TabsTrigger
                            value="all"
                            className="flex-1 gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-md transition-all h-full cursor-pointer"
                        >
                            <LayoutGrid className="w-4 h-4" />
                            <span className="font-bold uppercase tracking-widest text-[10px]">All Contacts</span>
                            <Badge variant="secondary" className="ml-2 bg-white/5 text-[9px] h-4 px-1.5">{contacts.length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger
                            value="CONTACT"
                            className="flex-1 gap-2 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 rounded-md transition-all h-full cursor-pointer"
                        >
                            <Users className="w-4 h-4" />
                            <span className="font-bold uppercase tracking-widest text-[10px]">Contacts</span>
                            <Badge variant="secondary" className="ml-2 bg-white/5 text-[9px] h-4 px-1.5">{contacts.filter(c => c.type === 'CONTACT').length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger
                            value="CLIENT"
                            className="flex-1 gap-2 data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400 rounded-md transition-all h-full cursor-pointer"
                        >
                            <Crown className="w-4 h-4" />
                            <span className="font-bold uppercase tracking-widest text-[10px]">Clients</span>
                            <Badge variant="secondary" className="ml-2 bg-white/5 text-[9px] h-4 px-1.5">{contacts.filter(c => c.type === 'CLIENT').length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger
                            value="LEAD"
                            className="flex-1 gap-2 data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 rounded-md transition-all h-full cursor-pointer"
                        >
                            <Tag className="w-4 h-4" />
                            <span className="font-bold uppercase tracking-widest text-[10px]">Leads</span>
                            <Badge variant="secondary" className="ml-2 bg-white/5 text-[9px] h-4 px-1.5">{contacts.filter(c => c.type === 'LEAD').length}</Badge>
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* --- MAIN WORKSPACE --- */}
            <div className="flex flex-1 overflow-hidden">

                {/* DATA TABLE AREA */}
                <div className="flex-1 flex flex-col min-w-0 bg-background/5">
                    {/* TABLE TOOLBAR */}
                    <div className="p-4 border-b border-white/5 flex items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-md group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Search by name, phone or email..."
                                className="bg-zinc-900/50 border-white/10 pl-10 h-10 text-sm focus:ring-1 focus:ring-primary/30 transition-all font-medium"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                                <SelectTrigger className="w-[180px] bg-zinc-900/50 border-white/10 h-10 text-xs font-bold uppercase tracking-widest ring-0 focus:ring-0">
                                    <div className="flex items-center gap-2">
                                        <Tag className="w-3.5 h-3.5 text-primary" />
                                        <SelectValue placeholder="All Groups" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-white/10">
                                    <SelectItem value="all" className="text-[10px] font-bold uppercase tracking-widest py-3">All Groups</SelectItem>
                                    {groups.map(group => (
                                        <SelectItem key={group.id} value={group.id} className="text-[10px] font-bold uppercase tracking-widest py-3">
                                            {group.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Button variant="outline" size="icon" className="h-10 w-10 border-white/5 bg-zinc-900/50 hover:bg-zinc-800"><Download className="w-4 h-4" /></Button>
                        </div>
                    </div>

                    {/* SCROLLABLE DATA */}
                    <ScrollArea className="flex-1">
                        {loading ? (
                            <div className="p-6 space-y-4">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="flex gap-4 items-center animate-pulse">
                                        <Skeleton className="w-10 h-10 rounded-full" />
                                        <div className="space-y-2 flex-1">
                                            <Skeleton className="h-4 w-[250px]" />
                                            <Skeleton className="h-3 w-[200px]" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredContacts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-20 text-center">
                                <div className="p-6 bg-zinc-900/50 rounded-full border border-white/5 mb-6">
                                    <Users className="w-12 h-12 text-muted-foreground/20" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Voice of the Vault</h3>
                                <p className="text-xs text-muted-foreground max-w-[280px]">No contacts match your current filter criteria. Try expanding your search or adding a new member.</p>
                            </div>
                        ) : (
                            <div className="p-0">
                                <table className="w-full text-left border-collapse">
                                    <thead className="sticky top-0 bg-[#0a0a0a]/80 backdrop-blur-md z-[5] border-b border-white/5">
                                        <tr className="uppercase text-[9px] font-black tracking-[0.2em] text-muted-foreground/60">
                                            <th className="px-6 py-4 w-12"><Checkbox className="border-white/20" /></th>
                                            <th className="px-6 py-4 min-w-[200px]">Identification</th>
                                            <th className="px-6 py-4 min-w-[180px]">Corporate</th>
                                            <th className="px-6 py-4 min-w-[180px]">Connectivity</th>
                                            <th className="px-6 py-4 min-w-[150px]">Locality</th>
                                            <th className="px-6 py-4 min-w-[200px]">Metadata</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {filteredContacts.map((contact, idx) => (
                                            <motion.tr
                                                key={contact.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.03 }}
                                                className="group hover:bg-white/[0.03] transition-colors cursor-pointer"
                                            >
                                                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                                    <Checkbox className="border-white/20" />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-xl ${getAvatarColor(contact.name)} border border-white/10 flex items-center justify-center text-white font-black text-sm shadow-inner group-hover:scale-105 transition-transform`}>
                                                            {contact.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">{contact.name}</p>
                                                                {idx === 0 && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />}
                                                            </div>
                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                {contact.groups?.map(g => (
                                                                    <Badge key={g.id} variant="secondary" className="text-[8px] h-3.5 px-1 bg-white/5 border-white/5 font-black uppercase tracking-widest opacity-60">
                                                                        {g.name}
                                                                    </Badge>
                                                                ))}
                                                                {(!contact.groups || contact.groups.length === 0) && (
                                                                    <span className="text-[9px] text-muted-foreground/40 italic">No groups</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-0.5">
                                                        <div className="flex items-center gap-2 text-[11px] font-bold text-white uppercase tracking-tight">
                                                            <Building2 className="w-3 h-3 text-blue-400/50" />
                                                            {contact.info?.company || <span className="text-muted-foreground/20 italic">Independent</span>}
                                                        </div>
                                                        <div className="text-[10px] text-muted-foreground pl-5 truncate max-w-[150px]">
                                                            {contact.info?.designation || 'Specialist'}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground group-hover:text-white transition-colors">
                                                            <Smartphone className="w-3 h-3 text-emerald-500/50" />
                                                            {contact.phone}
                                                        </div>
                                                        {contact.email && (
                                                            <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground group-hover:text-white transition-colors">
                                                                <Mail className="w-3 h-3 text-blue-500/50" />
                                                                {contact.email}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                        <Globe className="w-3 h-3 text-purple-400/50" />
                                                        {contact.info?.city && contact.info?.country 
                                                          ? `${contact.info.city}, ${contact.info.country}`
                                                          : contact.info?.country || contact.info?.city || 'Global'
                                                        }
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-2">
                                                        <div className="flex flex-wrap gap-1.5">
                                                            <Badge
                                                                variant="outline"
                                                                className={`text-[8px] font-black uppercase tracking-widest border-transparent ${CONTACT_TYPES.find(t => t.value === contact.type)?.color || 'bg-zinc-500/10 text-zinc-400'
                                                                    }`}
                                                            >
                                                                {contact.type}
                                                            </Badge>
                                                            {contact.category?.name && (
                                                                <Badge variant="secondary" className="text-[8px] h-4 bg-emerald-500/10 text-emerald-400 border-transparent font-black uppercase tracking-widest">
                                                                    {contact.category.name}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-wrap gap-1 mt-1 empty:hidden">
                                                            {contact.tags?.slice(0, 2).map(tag => (
                                                                <span key={tag} className="text-[8px] px-1.5 py-0.5 bg-white/5 border border-white/5 text-muted-foreground rounded uppercase font-bold tracking-tighter">
                                                                    #{tag}
                                                                </span>
                                                            ))}
                                                            {contact.tags?.length > 2 && (
                                                                <span className="text-[8px] text-muted-foreground/40 font-black">+ {contact.tags.length - 2}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1 opacity-40 group-hover:opacity-100 transition-opacity">

                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10">
                                                                    <MoreVertical className="w-3.5 h-3.5" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent className="bg-zinc-900 border-white/10 text-white">
                                                                <DropdownMenuItem
                                                                    className="flex items-center gap-2 text-xs py-2 cursor-pointer hover:bg-white/5"
                                                                    onClick={() => {
                                                                        const existingInfo = contact.info || {};
                                                                        setEditingContact(contact);
                                                                        setFormData({
                                                                            name: contact.name,
                                                                            phone: contact.phone,
                                                                            email: contact.email || '',
                                                                            type: contact.type || 'CONTACT',
                                                                            groupIds: contact.groups?.map(g => g.id) || [],
                                                                            tags: contact.tags || [],
                                                                            categoryId: contact.categoryId || '',
                                                                            info: {
                                                                                company: existingInfo.company || '',
                                                                                designation: existingInfo.designation || '',
                                                                                website: existingInfo.website || '',
                                                                                linkedin: existingInfo.linkedin || '',
                                                                                city: existingInfo.city || '',
                                                                                country: existingInfo.country || '',
                                                                                source: existingInfo.source || '',
                                                                                notes: existingInfo.notes || ''
                                                                            }
                                                                        });
                                                                        setIsSheetOpen(true);
                                                                    }}
                                                                >
                                                                    <RefreshCw className="w-3 h-3" /> Update Profile
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="flex items-center gap-2 text-xs py-2 cursor-pointer hover:bg-white/5">
                                                                    <Tag className="w-3 h-3" /> Manage Groups
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator className="bg-white/5" />
                                                                <DropdownMenuItem
                                                                    className="flex items-center gap-2 text-xs py-2 cursor-pointer text-destructive hover:bg-destructive/10"
                                                                    onClick={() => {
                                                                        setContactToDelete(contact);
                                                                        setIsDeleteDialogOpen(true);
                                                                    }}
                                                                >
                                                                    <Trash2 className="w-3 h-3" /> Delete Permanently
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </ScrollArea>
                </div>
            </div>

            <DeleteContactDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                contactToDelete={contactToDelete}
                onConfirm={handleDeleteContact}
                loading={isDeleting}
            />
        </div>
    );
}
