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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Modular Components
import ManageCategoriesDialog from './_components/ManageCategoriesDialog';
import ManageTagsDialog from './_components/ManageTagsDialog';
import ContactSheet from './_components/ContactSheet';
import ReviewImportDialog from './_components/ReviewImportDialog';
import BulkDeleteDialog from './_components/BulkDeleteDialog';
import BulkTagDialog from './_components/BulkTagDialog';
import BulkCategoryDialog from './_components/BulkCategoryDialog';
import MessageDialog from './_components/MessageDialog';

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
    const [isImporting, setIsImporting] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);
    const [importReviewData, setImportReviewData] = useState([]);
    const [isReviewOpen, setIsReviewOpen] = useState(false);

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
        reader.onload = (event) => {
            const csvData = event.target.result;

            // Simple Client-side CSV Parser
            const lines = csvData.split(/\r?\n/).filter(line => line.trim() !== '');
            if (lines.length < 2) {
                toast({ title: "Import Error", description: "CSV file is empty.", variant: "destructive" });
                return;
            }

            const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
            const dataRows = lines.slice(1);

            const parsed = dataRows.map(row => {
                const values = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
                const cleanValues = values.map(v => v.replace(/^"|"$/g, '').trim());
                const record = {};
                headers.forEach((header, index) => {
                    record[header] = cleanValues[index] || '';
                });
                return {
                    name: record.name || '',
                    phone: (record.phone || record.number || '').replace(/[^\d+]/g, ''),
                    email: record.email || '',
                    category: record.category || record.group || '',
                    tags: record.tags || ''
                };
            }).filter(c => c.phone); // Require phone

            setImportReviewData(parsed);
            setIsReviewOpen(true);
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const runImport = async (finalData) => {
        setIsImporting(true);
        toast({ title: "Importing...", description: "Finalizing audience data." });
        try {
            const res = await fetch('/api/wa/contacts/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contactsData: finalData,
                    workspaceId,
                    userId
                })
            });

            if (res.ok) {
                const data = await res.json();
                toast({
                    title: "Import Complete",
                    description: `Successfully added ${data.stats.success} contacts.`
                });
                setIsReviewOpen(false);
                fetchContacts();
            } else {
                throw new Error('Import failed');
            }
        } catch (error) {
            toast({ title: "Import Failed", description: "Submission failed.", variant: "destructive" });
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
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                                            {cat.name}
                                            <Badge variant="ghost" className="ml-auto text-[10px] opacity-60 font-mono">{contacts.filter(c => c.categoryId === cat.id).length}</Badge>
                                        </Button>
                                    ))}
                                    {categories.length === 0 && <p className="text-[10px] text-muted-foreground italic px-2">No categories defined.</p>}
                                </div>
                            </div>

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
                                                    <div>
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

            {/* --- Modals & Sheets (Relocated to _components) --- */}
            
            <ManageCategoriesDialog 
                isOpen={isManageCategoriesOpen} 
                onOpenChange={setIsManageCategoriesOpen} 
                workspaceId={workspaceId} 
                categories={categories} 
                onUpdate={fetchCategories} 
            />

            <ManageTagsDialog 
                isOpen={isManageTagsOpen} 
                onOpenChange={setIsManageTagsOpen} 
                workspaceId={workspaceId} 
                categories={tagDefinitions} 
                onUpdate={fetchTagLibrary} 
            />

            <ContactSheet 
                isOpen={isAddContactOpen || isEditContactOpen}
                onOpenChange={(open) => {
                    if (!open) { setIsAddContactOpen(false); setIsEditContactOpen(false); setActiveContact(null); }
                }}
                activeContact={activeContact}
                categories={categories}
                userId={userId}
                workspaceId={workspaceId}
                onSave={fetchContacts}
            />

            <MessageDialog 
                isOpen={isMessageOpen} 
                onOpenChange={setIsMessageOpen} 
                onSend={handleSendMessage} 
                contactName={activeContact?.name} 
            />

            <BulkDeleteDialog 
                isOpen={isDeleteConfirmOpen} 
                onOpenChange={setIsDeleteConfirmOpen} 
                count={selectedContacts.length} 
                onConfirm={handleBulkDelete} 
                isProcessing={isBulkProcessing} 
            />

            <BulkTagDialog 
                isOpen={isBulkTagOpen} 
                onOpenChange={setIsBulkTagOpen} 
                onConfirm={handleBulkTag} 
                isProcessing={isBulkProcessing} 
            />

            <BulkCategoryDialog 
                isOpen={isBulkCategoryOpen} 
                onOpenChange={setIsBulkCategoryOpen} 
                categories={categories} 
                onConfirm={handleBulkCategory} 
            />

            <ReviewImportDialog 
                isOpen={isReviewOpen} 
                onOpenChange={setIsReviewOpen} 
                data={importReviewData} 
                setData={setImportReviewData} 
                onImport={runImport} 
                isImporting={isImporting} 
            />
        </div>
    </div>
    );
}