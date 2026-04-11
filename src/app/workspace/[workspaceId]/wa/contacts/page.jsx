'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useSession } from 'next-auth/react';
import {
    Trash2, UserPlus, Users, Phone, Mail, Pencil, X, Search,
    ArrowUpDown, Download, Upload, RefreshCw, Tag, FileText,
    Send, History, Filter, LayoutGrid, List, MoreVertical,
    Plus, Check, Star, ShieldCheck, Zap, Globe, MessageSquare,
    ChevronRight, Layers, Bookmark, Settings2, ExternalLink
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function ContactsPage() {
    const params = useParams();
    const workspaceId = params.workspaceId;
    const { data: session } = useSession();
    const userId = session?.user?.userId || '';
    const { toast } = useToast();

    // Core Data State
    const [contacts, setContacts] = useState([]);
    const [groups, setGroups] = useState([]);
    const [categories, setCategories] = useState([]);
    const [tagDefinitions, setTagDefinitions] = useState([]);
    const [loading, setLoading] = useState(true);

    // UI/Selection State
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [viewMode, setViewMode] = useState('list'); // list, grid

    // Sidebar/Filter State
    const [activeSegment, setActiveSegment] = useState('all'); // all, group:[id], category:[id], tag:[name]
    const [waStatus, setWaStatus] = useState('loading');

    // Modals & Sheets
    const [isAddContactOpen, setIsAddContactOpen] = useState(false);
    const [isEditContactOpen, setIsEditContactOpen] = useState(false);
    const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
    const [isManageTagsOpen, setIsManageTagsOpen] = useState(false);
    const [isBulkTagOpen, setIsBulkTagOpen] = useState(false);
    const [isBulkCategoryOpen, setIsBulkCategoryOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isMessageOpen, setIsMessageOpen] = useState(false);

    // Active Entity State (for editing/messing)
    const [activeContact, setActiveContact] = useState(null);
    const [historyMessages, setHistoryMessages] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [messageText, setMessageText] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [categoryInput, setCategoryInput] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);

    // Form State for Adding/Editing
    const [contactForm, setContactForm] = useState({
        name: '',
        phone: '',
        email: '',
        categoryId: '',
        tags: [],
        info: ''
    });

    // Computed: Filtered Contacts
    const filteredContacts = useMemo(() => {
        return contacts.filter(contact => {
            const matchesSearch =
                contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                contact.phone.includes(searchQuery) ||
                contact.email?.toLowerCase().includes(searchQuery.toLowerCase());

            let matchesSegment = true;
            if (activeSegment.startsWith('group:')) {
                const groupId = activeSegment.split(':')[1];
                matchesSegment = contact.groups?.some(g => g.id === groupId);
            } else if (activeSegment.startsWith('category:')) {
                const catId = activeSegment.split(':')[1];
                matchesSegment = contact.categoryId === catId;
            } else if (activeSegment.startsWith('tag:')) {
                const tagName = activeSegment.split(':')[1];
                matchesSegment = contact.tags?.includes(tagName);
            }

            return matchesSearch && matchesSegment;
        }).sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
            if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
            if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
            if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
            return 0;
        });
    }, [contacts, searchQuery, activeSegment, sortBy]);

    // Computed: All Unique Tags (for ad-hoc usage)
    const allTags = useMemo(() => {
        const tags = new Set(contacts.flatMap(c => c.tags || []));
        return Array.from(tags).sort();
    }, [contacts]);

    // Initial Load
    useEffect(() => {
        if (userId && workspaceId) {
            fetchInitialData();
            checkWAStatus();
            const interval = setInterval(checkWAStatus, 30000);
            return () => clearInterval(interval);
        }
    }, [userId, workspaceId]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchContacts(),
                fetchGroups(),
                fetchCategories(),
                fetchTagLibrary()
            ]);
        } finally {
            setLoading(false);
        }
    };

    // --- API Handlers ---

    const fetchContacts = async () => {
        const res = await fetch(`/api/wa/contacts?userId=${userId}&workspaceId=${workspaceId}`);
        if (res.ok) setContacts(await res.json());
    };

    const fetchGroups = async () => {
        const res = await fetch(`/api/wa/groups?userId=${userId}&workspaceId=${workspaceId}`);
        if (res.ok) setGroups(await res.json());
    };

    const fetchCategories = async () => {
        const res = await fetch(`/api/wa/categories?workspaceId=${workspaceId}&type=CONTACT`);
        if (res.ok) setCategories(await res.json());
    };

    const fetchTagLibrary = async () => {
        const res = await fetch(`/api/wa/categories?workspaceId=${workspaceId}&type=TAG`);
        if (res.ok) setTagDefinitions(await res.json());
    };

    const checkWAStatus = async () => {
        const res = await fetch('/api/wa/auth');
        if (res.ok) {
            const data = await res.json();
            setWaStatus(data.status);
        }
    };

    const handleSaveContact = async (e) => {
        e.preventDefault();
        const method = activeContact ? 'PATCH' : 'POST';
        const url = activeContact ? `/api/wa/contacts/${activeContact.id}` : '/api/wa/contacts';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...contactForm, userId, workspaceId })
            });

            if (res.ok) {
                toast({ title: activeContact ? "Updated" : "Created", description: "Contact saved successfully." });
                fetchContacts();
                setIsAddContactOpen(false);
                setIsEditContactOpen(false);
                setActiveContact(null);
                setContactForm({ name: '', phone: '', email: '', categoryId: '', tags: [], info: '' });
            }
        } catch (error) {
            toast({ title: "Error", description: "Operation failed.", variant: "destructive" });
        }
    };

    const handleBulkDelete = async () => {
        setIsBulkProcessing(true);
        try {
            const res = await fetch('/api/wa/contacts/bulk-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedContacts })
            });
            if (res.ok) {
                toast({ title: "Deleted", description: "Selected contacts removed." });
                fetchContacts();
                setSelectedContacts([]);
                setIsDeleteConfirmOpen(false);
            }
        } catch (error) {
            toast({ title: "Error", description: "Bulk delete failed.", variant: "destructive" });
        } finally {
            setIsBulkProcessing(false);
        }
    };

    const handleBulkTag = async () => {
        if (!tagInput) return;
        setIsBulkProcessing(true);
        try {
            const res = await fetch('/api/wa/contacts/bulk-tag', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedContacts, tag: tagInput })
            });
            if (res.ok) {
                toast({ title: "Tagged", description: `Added tag to ${selectedContacts.length} contacts.` });
                fetchContacts();
                setIsBulkTagOpen(false);
                setTagInput('');
                setSelectedContacts([]);
            }
        } catch (error) {
            toast({ title: "Error", description: "Bulk tagging failed.", variant: "destructive" });
        } finally {
            setIsBulkProcessing(false);
        }
    };

    const handleBulkCategory = async (categoryId) => {
        setIsBulkProcessing(true);
        try {
            const res = await fetch('/api/wa/contacts/bulk-category', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedContacts, categoryId })
            });
            if (res.ok) {
                toast({ title: "Updated", description: `Moved ${selectedContacts.length} contacts to new category.` });
                fetchContacts();
                setIsBulkCategoryOpen(false);
                setSelectedContacts([]);
            }
        } catch (error) {
            toast({ title: "Error", description: "Bulk move failed.", variant: "destructive" });
        } finally {
            setIsBulkProcessing(false);
        }
    };

    const handleSendMessage = async () => {
        if (!activeContact || !messageText) return;
        try {
            const res = await fetch('/api/wa/send-browser', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ to: activeContact.phone, text: messageText })
            });
            if (res.ok) {
                toast({ title: "Sent", description: "Message delivery initiated." });
                setIsMessageOpen(false);
                setMessageText('');
            }
        } catch (error) {
            toast({ title: "Error", description: "Delivery failed.", variant: "destructive" });
        }
    };

    const handleSync = async () => {
        toast({ title: "Sync Started", description: "Pulling contacts from WhatsApp..." });
        try {
            const res = await fetch('/api/wa/contacts/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, workspaceId })
            });
            if (res.ok) {
                toast({ title: "Sync Complete", description: "Audience updated." });
                fetchContacts();
            }
        } catch (error) {
            toast({ title: "Sync Failed", description: "Connectivity issue.", variant: "destructive" });
        }
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const res = await fetch(`/api/wa/contacts/export?workspaceId=${workspaceId}`);
            if (!res.ok) throw new Error('Export failed');

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `contacts-${workspaceId}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast({ title: "Export Success", description: "CSV file downloaded." });
        } catch (error) {
            toast({ title: "Export Failed", description: "Could not generate CSV.", variant: "destructive" });
        } finally {
            setIsExporting(false);
        }
    };

    const handleImportFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const csvData = event.target.result;
            await runImport(csvData);
        };
        reader.readAsText(file);
        // Reset input
        e.target.value = '';
    };

    const runImport = async (csvData) => {
        setIsImporting(true);
        toast({ title: "Importing...", description: "Processing CSV data." });
        try {
            const res = await fetch('/api/wa/contacts/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ csvData, workspaceId, userId })
            });

            if (res.ok) {
                const data = await res.json();
                toast({
                    title: "Import Complete",
                    description: `Successfully added ${data.stats.success} contacts.`
                });
                fetchContacts();
            } else {
                throw new Error('Import failed');
            }
        } catch (error) {
            toast({ title: "Import Failed", description: "Check CSV format.", variant: "destructive" });
        } finally {
            setIsImporting(false);
        }
    };

    const handleDownloadTemplate = () => {
        const headers = 'name,phone,email,category,tags';
        const sampleRow = 'John Doe,919876543210,john@example.com,VIP,tag1|tag2';
        const csvContent = `${headers}\n${sampleRow}`;

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'contacts_template.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({ title: "Template Saved", description: "CSV template downloaded." });
    };

    // --- Helpers ---

    const getCategoryColor = (catId) => {
        const cat = categories.find(c => c.id === catId);
        return cat?.color || '#3b82f6';
    };

    const getTagName = (tagName) => {
        const def = tagDefinitions.find(t => t.name === tagName);
        return def?.name || tagName;
    };

    const getTagColor = (tagName) => {
        const def = tagDefinitions.find(t => t.name === tagName);
        return def?.color || 'hsl(var(--muted))';
    };

    // --- Render ---

    return (
        <div className="flex flex-col h-[calc(100vh-70px)] overflow-hidden bg-background">

            {/* Upper Action Bar */}
            <div className="flex items-center justify-between py-2 px-4 border-b bg-card/30">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold tracking-tight">CRM Audience</h1>
                    <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-primary/5 border border-primary/10">
                        <div className={`w-1.5 h-1.5 rounded-full ${waStatus === 'open' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-red-500'}`} />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            WA: {waStatus === 'open' ? 'Connected' : 'Disconnected'}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="file"
                        id="contacts-import"
                        className="hidden"
                        accept=".csv"
                        onChange={handleImportFile}
                    />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExport}
                        disabled={isExporting}
                        className="h-9 gap-2 border-border/40"
                    >
                        {isExporting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline">Export</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('contacts-import').click()}
                        disabled={isImporting}
                        className="h-9 gap-2 border-border/40"
                    >
                        {isImporting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline">Import</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadTemplate}
                        className="h-9 px-2"
                        title="Download CSV Template"
                    >
                        <FileText className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Template</span>
                    </Button>
                    <Separator orientation="vertical" className="h-4 mx-1" />
                    <Button variant="outline" size="sm" onClick={handleSync} className="h-9 gap-2">
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Sync WA</span>
                    </Button>
                    <Separator orientation="vertical" className="h-4 mx-1" />
                    <Button size="sm" onClick={() => setIsAddContactOpen(true)} className="h-9 gap-2 shadow-sm">
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Add Contact</span>
                    </Button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">

                {/* CRM Sidebar */}
                <div className="w-64 border-r bg-card/20 flex flex-col">
                    <ScrollArea className="flex-1">
                        <div className="p-4 space-y-6">
                            {/* Segments */}
                            <div className="space-y-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 px-2">Core Segments</span>
                                <Button
                                    variant={activeSegment === 'all' ? 'secondary' : 'ghost'}
                                    className="w-full justify-start h-9 text-sm gap-3 px-3"
                                    onClick={() => setActiveSegment('all')}
                                >
                                    <Users className="w-4 h-4" />
                                    All Contacts
                                    <Badge variant="ghost" className="ml-auto text-[10px] opacity-60">{contacts.length}</Badge>
                                </Button>
                            </div>

                            {/* Categories */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between px-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Categories</span>
                                    <Button variant="ghost" size="icon" className="h-5 w-5 opacity-40 hover:opacity-100" onClick={() => setIsManageCategoriesOpen(true)}>
                                        <Plus className="w-3 h-3" />
                                    </Button>
                                </div>
                                <div className="space-y-1">
                                    {categories.map(cat => (
                                        <Button
                                            key={cat.id}
                                            variant={activeSegment === `category:${cat.id}` ? 'secondary' : 'ghost'}
                                            className="w-full justify-start h-8 text-xs gap-3 px-3"
                                            onClick={() => setActiveSegment(`category:${cat.id}`)}
                                        >
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                                            {cat.name}
                                            <Badge variant="ghost" className="ml-auto text-[10px] opacity-60 font-mono">{contacts.filter(c => c.categoryId === cat.id).length}</Badge>
                                        </Button>
                                    ))}
                                    {categories.length === 0 && <p className="text-[10px] text-muted-foreground italic px-2">No categories defined.</p>}
                                </div>
                            </div>

                            {/* Groups */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between px-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Broadcast Groups</span>
                                </div>
                                <div className="space-y-1">
                                    {groups.map(group => (
                                        <Button
                                            key={group.id}
                                            variant={activeSegment === `group:${group.id}` ? 'secondary' : 'ghost'}
                                            className="w-full justify-start h-8 text-xs gap-3 px-3"
                                            onClick={() => setActiveSegment(`group:${group.id}`)}
                                        >
                                            <Layers className="w-3.5 h-3.5 opacity-40" />
                                            {group.name}
                                            <Badge variant="ghost" className="ml-auto text-[10px] opacity-60 font-mono">{group._count?.contacts || 0}</Badge>
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </ScrollArea>

                    <div className="p-4 border-t bg-muted/10">
                        <Button variant="ghost" className="w-full justify-between h-9 text-[10px] px-2 font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors" onClick={() => setIsManageTagsOpen(true)}>
                            Manage Tag Library
                            <ChevronRight className="w-3 h-3" />
                        </Button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col bg-muted/10">

                    {/* Search & Sort Bar */}
                    <div className="flex items-center gap-4 py-2 px-4 border-b bg-card/40">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                            <Input
                                placeholder="Search by name, phone or email..."
                                className="pl-9 bg-background h-10 border-border/40"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-10 gap-2 border-border/40">
                                        <Filter className="w-3.5 h-3.5" />
                                        <span className="text-xs">Sort: {sortBy.replace('-', ' ')}</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setSortBy('newest')}>Newest First</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSortBy('oldest')}>Oldest First</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSortBy('name-asc')}>Name A-Z</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSortBy('name-desc')}>Name Z-A</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Separator orientation="vertical" className="h-6 mx-1" />

                            <div className="flex items-center border rounded-md overflow-hidden h-10">
                                <Button
                                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                                    size="icon"
                                    className="rounded-none w-10 border-none"
                                    onClick={() => setViewMode('list')}
                                >
                                    <List className="w-4 h-4" />
                                </Button>
                                <Separator orientation="vertical" className="h-6" />
                                <Button
                                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                                    size="icon"
                                    className="rounded-none w-10 border-none"
                                    onClick={() => setViewMode('grid')}
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Multi-Selection Toolbar (Sticks to top if items selected) */}
                    {selectedContacts.length > 0 && (
                        <div className="flex items-center justify-between px-6 py-2 bg-primary/10 border-b border-primary/20 animate-in slide-in-from-top duration-300">
                            <div className="flex items-center gap-4">
                                <Checkbox
                                    checked={selectedContacts.length === filteredContacts.length}
                                    onCheckedChange={() => {
                                        if (selectedContacts.length === filteredContacts.length) setSelectedContacts([]);
                                        else setSelectedContacts(filteredContacts.map(c => c.id));
                                    }}
                                />
                                <span className="text-sm font-bold text-primary">{selectedContacts.length} Selected</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" onClick={() => setIsBulkTagOpen(true)} className="h-8 gap-2 text-primary hover:bg-primary/5">
                                    <Tag className="w-3.5 h-3.5" /> Tag
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => setIsBulkCategoryOpen(true)} className="h-8 gap-2 text-primary hover:bg-primary/5">
                                    <Layers className="w-3.5 h-3.5" /> Category
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => setIsDeleteConfirmOpen(true)} className="h-8 gap-2 text-destructive hover:bg-destructive/5">
                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                </Button>
                                <Separator orientation="vertical" className="h-4 mx-2" />
                                <Button variant="ghost" size="sm" className="h-8" onClick={() => setSelectedContacts([])}>Cancel</Button>
                            </div>
                        </div>
                    )}

                    {/* Audience List Container */}
                    <div className="flex-1 overflow-hidden">
                        {loading ? (
                            <div className="h-full flex flex-col items-center justify-center gap-4">
                                <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                                <p className="text-sm text-muted-foreground font-medium animate-pulse">Syncing audience library...</p>
                            </div>
                        ) : filteredContacts.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-40">
                                <div className="p-8 bg-muted rounded-full">
                                    <Users className="w-16 h-16" />
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-bold">No contacts found</p>
                                    <p className="text-sm">Try adjusting your filters or segments.</p>
                                </div>
                            </div>
                        ) : (
                            <ScrollArea className="h-full p-2">
                                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4' : 'space-y-1'}>
                                    {filteredContacts.map((contact) => (
                                        <Card
                                            key={contact.id}
                                            className={`group p-0 transition-all hover:border-primary/40 shadow-none bg-card/60 ${selectedContacts.includes(contact.id) ? 'border-border bg-primary/5' : 'border-border/0'}`}
                                        >
                                            <CardContent className="py-0.5 px-4 flex items-center gap-4 border border-border/90 rounded-md">
                                                <div className="shrink-0 flex items-center gap-3">
                                                    <Checkbox
                                                        checked={selectedContacts.includes(contact.id)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) setSelectedContacts([...selectedContacts, contact.id]);
                                                            else setSelectedContacts(selectedContacts.filter(id => id !== contact.id));
                                                        }}
                                                    />
                                                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold border">
                                                        {contact.name[0].toUpperCase()}
                                                    </div>
                                                </div>

                                                <div className="flex-1 min-w-0 space-y-0.5 flex flex-row items-center justify-between">

                                                    <div className=''>
                                                        <div className="flex items-center justify-between ">
                                                            <div className="flex items-center gap-2 overflow-hidden">
                                                                <h3 className="text-sm font-bold truncate tracking-tight">{contact.name}</h3>
                                                                {contact.categoryId && (
                                                                    <Badge variant="outline" className="h-4 text-[9px] font-bold px-1.5 border-none" style={{ backgroundColor: `${getCategoryColor(contact.categoryId)}20`, color: getCategoryColor(contact.categoryId) }}>
                                                                        {categories.find(c => c.id === contact.categoryId)?.name || 'Cat'}
                                                                    </Badge>
                                                                )}
                                                            </div>


                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-[11px] text-muted-foreground">
                                                            <div className="flex items-center gap-1 font-mono">
                                                                <Phone className="w-3 h-3 opacity-40 shrink-0" />
                                                                {contact.phone}
                                                            </div>
                                                            {contact.email && (
                                                                <div className="flex items-center gap-1">
                                                                    <Mail className="w-3 h-3 opacity-40 shrink-0" />
                                                                    {contact.email}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex flex-wrap gap-1 pt-0.5">
                                                            {contact.tags?.map(tag => (
                                                                <Badge key={tag} variant="secondary" className="text-[9px] h-4 px-1 opacity-70 border-none" style={{ backgroundColor: `${getTagColor(tag)}30`, color: getTagColor(tag) }}>
                                                                    {tag}
                                                                </Badge>
                                                            ))}
                                                            {contact.groups?.map(group => (
                                                                <Badge key={group.id} variant="outline" className="text-[9px] h-4 px-1 opacity-50 border-blue-500/20 text-blue-400">
                                                                    <Layers className="w-2 h-2 mr-1" />
                                                                    {group.name}
                                                                </Badge>
                                                            ))}
                                                        </div>

                                                    </div>

                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8  group-hover:opacity-0 transition-opacity">
                                                                <MoreVertical className="w-6 h-6" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className='mt-4'>
                                                            <DropdownMenuItem onClick={() => {
                                                                setActiveContact(contact);
                                                                setContactForm({
                                                                    name: contact.name,
                                                                    phone: contact.phone,
                                                                    email: contact.email || '',
                                                                    categoryId: contact.categoryId || '',
                                                                    tags: contact.tags || [],
                                                                    info: contact.info || ''
                                                                });
                                                                setIsEditContactOpen(true);
                                                            }}>
                                                                <Pencil className="w-3.5 h-3.5 mr-2" /> Edit Details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => {
                                                                setActiveContact(contact);
                                                                setIsMessageOpen(true);
                                                            }}>
                                                                <Send className="w-3.5 h-3.5 mr-2 text-green-500" /> Send Message
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => {
                                                                setActiveContact(contact);
                                                                setIsHistoryOpen(true);
                                                            }}>
                                                                <History className="w-3.5 h-3.5 mr-2 text-blue-500" /> Interaction History
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="text-destructive" onClick={() => {
                                                                setSelectedContacts([contact.id]);
                                                                setIsDeleteConfirmOpen(true);
                                                            }}>
                                                                <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete Contact
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </ScrollArea>
                        )}
                    </div>
                </div>
            </div>

            {/* --- Modals & Overlays --- */}

            {/* Manage Categories Modal */}
            <Dialog open={isManageCategoriesOpen} onOpenChange={setIsManageCategoriesOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Audience Categories</DialogTitle>
                        <DialogDescription>Define high-level segments for your contacts (e.g. VIP, Leads).</DialogDescription>
                    </DialogHeader>
                    <CategoriesManager
                        workspaceId={workspaceId}
                        categories={categories}
                        onUpdate={fetchCategories}
                        type="CONTACT"
                    />
                </DialogContent>
            </Dialog>

            {/* Manage Tag Library Modal */}
            <Dialog open={isManageTagsOpen} onOpenChange={setIsManageTagsOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Tag Library</DialogTitle>
                        <DialogDescription>Define structured tags with colors to organize your audience.</DialogDescription>
                    </DialogHeader>
                    <CategoriesManager
                        workspaceId={workspaceId}
                        categories={tagDefinitions}
                        onUpdate={fetchTagLibrary}
                        type="TAG"
                    />
                </DialogContent>
            </Dialog>

            {/* Add/Edit Contact Sheet */}
            <Sheet open={isAddContactOpen || isEditContactOpen} onOpenChange={(open) => {
                if (!open) { setContactForm({ name: '', phone: '', email: '', categoryId: '', tags: [], info: '' }); setActiveContact(null); }
                setIsAddContactOpen(open ? isAddContactOpen : false);
                setIsEditContactOpen(open ? isEditContactOpen : false);
            }}>
                <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-6">
                    <SheetHeader className="pb-8">
                        <SheetTitle className="text-2xl font-bold tracking-tight">{activeContact ? 'Edit Identity' : 'Secure Entry'}</SheetTitle>
                        <SheetDescription>Configure primary contact details and metadata.</SheetDescription>
                    </SheetHeader>

                    <form onSubmit={handleSaveContact} className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 px-1">Identity</Label>
                                <Input
                                    placeholder="Full Name / Brand"
                                    value={contactForm.name}
                                    onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                                    required
                                    className="bg-muted/10 h-11"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 px-1">Mobile JID</Label>
                                    <Input
                                        placeholder="+123456789"
                                        value={contactForm.phone}
                                        onChange={e => setContactForm({ ...contactForm, phone: e.target.value })}
                                        required
                                        className="bg-muted/10 h-11 font-mono text-xs"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 px-1">Email</Label>
                                    <Input
                                        placeholder="user@cloud.com"
                                        value={contactForm.email}
                                        onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                                        className="bg-muted/10 h-11"
                                    />
                                </div>
                            </div>
                        </div>

                        <Separator className="opacity-40" />

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 px-1">Logical Category</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {categories.map(cat => (
                                        <div
                                            key={cat.id}
                                            onClick={() => setContactForm({ ...contactForm, categoryId: contactForm.categoryId === cat.id ? '' : cat.id })}
                                            className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${contactForm.categoryId === cat.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/30 border-border/40 opacity-60'}`}
                                        >
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                                            <span className="text-[11px] font-bold truncate">{cat.name}</span>
                                            {contactForm.categoryId === cat.id && <Check className="w-3 h-3 ml-auto text-primary" />}
                                        </div>
                                    ))}
                                    <div
                                        onClick={() => setIsManageCategoriesOpen(true)}
                                        className="flex items-center gap-2 p-3 rounded-lg border border-dashed border-border/40 opacity-40 hover:opacity-100 cursor-pointer"
                                    >
                                        <Plus className="w-3 h-3" />
                                        <span className="text-[11px]">New Category</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 px-1">Attribute Tags</Label>
                                <div className="flex flex-wrap gap-2">
                                    {tagDefinitions.map(def => (
                                        <Badge
                                            key={def.id}
                                            variant="secondary"
                                            onClick={() => {
                                                const tags = contactForm.tags.includes(def.name)
                                                    ? contactForm.tags.filter(t => t !== def.name)
                                                    : [...contactForm.tags, def.name];
                                                setContactForm({ ...contactForm, tags });
                                            }}
                                            className={`h-6 px-2 cursor-pointer transition-all border-none ${contactForm.tags.includes(def.name) ? 'opacity-100 shadow-md ring-1 ring-primary' : 'opacity-40'}`}
                                            style={{ backgroundColor: `${def.color}20`, color: def.color }}
                                        >
                                            {def.name}
                                        </Badge>
                                    ))}
                                    <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] opacity-40 hover:opacity-100" onClick={() => setIsManageTagsOpen(true)}>
                                        <Settings2 className="w-3 h-3 mr-1" /> Edit Library
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1" />

                        <DialogFooter className="pt-6 border-t mt-auto">
                            <Button variant="ghost" type="button" onClick={() => { setIsAddContactOpen(false); setIsEditContactOpen(false); }}>Cancel</Button>
                            <Button type="submit" className="px-8 shadow-lg shadow-primary/20">{activeContact ? 'Save Changes' : 'Initialize Contact'}</Button>
                        </DialogFooter>
                    </form>
                </SheetContent>
            </Sheet>

            {/* Quick Message Dialog */}
            <Dialog open={isMessageOpen} onOpenChange={setIsMessageOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Send className="w-5 h-5 text-green-500" /> Secure Message
                        </DialogTitle>
                        <DialogDescription>Sent to: {activeContact?.name} ({activeContact?.phone})</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Textarea
                            placeholder="Type your message here..."
                            className="min-h-[150px] bg-muted/10"
                            value={messageText}
                            onChange={e => setMessageText(e.target.value)}
                        />
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground italic">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            End-to-end delivery via WhatsApp Browser Sync Engine
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsMessageOpen(false)}>Cancel</Button>
                        <Button onClick={handleSendMessage} disabled={!messageText} className="gap-2">
                            <Send className="w-4 h-4" /> Ship Now
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bulk Delete Confirm */}
            <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete {selectedContacts.length} selected contacts. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isBulkProcessing}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleBulkDelete} disabled={isBulkProcessing} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 min-w-[120px]">
                            {isBulkProcessing ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
                            {isBulkProcessing ? 'Deleting...' : 'Delete Contacts'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk Tag Dialog */}
            <Dialog open={isBulkTagOpen} onOpenChange={setIsBulkTagOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Tag className="w-5 h-5" /> Bulk Tagging
                        </DialogTitle>
                        <DialogDescription>Applying tag to {selectedContacts.length} selected contacts.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Select Tag from Library</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {tagDefinitions.map(def => (
                                    <Badge
                                        key={def.id}
                                        variant="outline"
                                        onClick={() => setTagInput(def.name)}
                                        className={`h-9 px-3 cursor-pointer justify-start gap-2 border-border/40 transition-all ${tagInput === def.name ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/30'}`}
                                        style={{ color: def.color }}
                                    >
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: def.color }} />
                                        {def.name}
                                    </Badge>
                                ))}
                                {tagDefinitions.length === 0 && <p className="col-span-2 text-xs italic text-muted-foreground p-4 text-center">No tags defined in library.</p>}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Or Type New Tag</Label>
                            <Input 
                                placeholder="Enter custom tag..." 
                                value={tagInput}
                                onChange={e => setTagInput(e.target.value)}
                                className="bg-muted/10 h-11"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" disabled={isBulkProcessing} onClick={() => { setIsBulkTagOpen(false); setTagInput(''); }}>Cancel</Button>
                        <Button onClick={handleBulkTag} disabled={!tagInput || isBulkProcessing} className="px-8 shadow-lg shadow-primary/20 min-w-[140px]">
                            {isBulkProcessing ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
                            {isBulkProcessing ? 'Applying...' : 'Apply Tag'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bulk Category Dialog */}
            <Dialog open={isBulkCategoryOpen} onOpenChange={setIsBulkCategoryOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Layers className="w-5 h-5" /> Bulk Categories
                        </DialogTitle>
                        <DialogDescription>Move {selectedContacts.length} contacts to a new logical segment.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 grid grid-cols-2 gap-2 relative">
                        {isBulkProcessing && (
                            <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-xl">
                                <div className="flex flex-col items-center gap-2">
                                    <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                                    <span className="text-xs font-medium text-primary">Moving Contacts...</span>
                                </div>
                            </div>
                        )}
                        {categories.map(cat => (
                            <div
                                key={cat.id}
                                onClick={() => !isBulkProcessing && handleBulkCategory(cat.id)}
                                className={`flex items-center gap-3 p-4 rounded-xl border border-border/40 transition-all group ${isBulkProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/40 hover:bg-primary/5 cursor-pointer'}`}
                            >
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                                <span className="text-sm font-bold truncate">{cat.name}</span>
                                <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        ))}
                        <div
                            onClick={() => !isBulkProcessing && handleBulkCategory(null)}
                            className={`flex items-center gap-3 p-4 rounded-xl border border-dashed border-border/60 transition-all group ${isBulkProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:border-destructive/40 hover:bg-destructive/5 cursor-pointer'}`}
                        >
                            <div className="w-3 h-3 rounded-full bg-muted-foreground/20" />
                            <span className="text-sm font-bold truncate">Remove Category</span>
                            <X className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>
                    <DialogFooter className="bg-muted/5 p-4 rounded-b-lg border-t -mx-6 -mb-6">
                        <Button variant="ghost" className="w-full" disabled={isBulkProcessing} onClick={() => setIsBulkCategoryOpen(false)}>Cancel Bulk Operation</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}

// Internal Component: Categories Manager
function CategoriesManager({ workspaceId, categories, onUpdate, type }) {
    const [name, setName] = useState('');
    const [color, setColor] = useState('#3b82f6');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleAdd = async () => {
        if (!name) return;
        setLoading(true);
        try {
            const res = await fetch('/api/wa/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, color, workspaceId, type })
            });
            if (res.ok) {
                toast({ title: "Category Added" });
                setName('');
                onUpdate();
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const res = await fetch(`/api/wa/categories/${id}`, { method: 'DELETE' });
        if (res.ok) {
            toast({ title: "Removed" });
            onUpdate();
        }
    };

    return (
        <div className="space-y-4 mt-4">
            <div className="flex gap-2">
                <Input
                    placeholder="Category Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="flex-1"
                />
                <div className="relative w-10 h-10 border rounded-md overflow-hidden shrink-0">
                    <input
                        type="color"
                        value={color}
                        onChange={e => setColor(e.target.value)}
                        className="absolute inset-0 w-full h-full scale-150 cursor-pointer"
                    />
                </div>
                <Button onClick={handleAdd} disabled={loading || !name} size="icon">
                    <Plus className="w-4 h-4" />
                </Button>
            </div>

            <ScrollArea className="h-[300px] border rounded-md p-2 bg-muted/5">
                <div className="space-y-1">
                    {categories.map(cat => (
                        <div key={cat.id} className="flex items-center justify-between p-2 hover:bg-muted/30 rounded-md transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                                <span className="text-sm font-medium">{cat.name}</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100"
                                onClick={() => handleDelete(cat.id)}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                    {categories.length === 0 && <p className="text-center text-xs text-muted-foreground py-8">No structured {type.toLowerCase()}s found.</p>}
                </div>
            </ScrollArea>
        </div>
    );
}