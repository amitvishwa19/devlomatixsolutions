'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import {
    Trash2, UserPlus, Users, Pencil, X, Search,
    Download, Upload, RefreshCw, Tag, FileText,
    Filter, LayoutGrid, List, MoreVertical, Layers, ChevronRight, Plus
} from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { useAction } from '@/hooks/use-action';
import { getContacts } from '../_actions/get-contacts';
import { getCategories } from '../_actions/get-categories';
import { bulkDeleteContacts } from '../_actions/bulk-delete-contacts';
import { importContacts } from '../_actions/import-contacts';

// Local Components
import ContactSheet from '../_components/ContactSheet';
import ReviewImportDialog from '../_components/ReviewImportDialog';
import BulkDeleteDialog from '../_components/BulkDeleteDialog';
import ContactCard from '../_components/ContactCard';

export default function ContactsPage() {
    const params = useParams();
    const workspaceId = params.workspaceId;
    const { data: session } = useSession();
    const userId = session?.user?.userId || session?.user?.id || '';

    // Core Data State
    const [contacts, setContacts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // UI/Selection State
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [viewMode, setViewMode] = useState('list'); // list, grid
    const [activeSegment, setActiveSegment] = useState('all'); // all, category:[id]

    // Modals & Sheets
    const [isAddContactOpen, setIsAddContactOpen] = useState(false);
    const [isEditContactOpen, setIsEditContactOpen] = useState(false);
    const [activeContact, setActiveContact] = useState(null);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importReviewData, setImportReviewData] = useState([]);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);

    // --- Server Actions ---
    const { execute: executeGetContacts } = useAction(getContacts, {
        onSuccess: (data) => setContacts(data || []),
        onError: (err) => toast.error(err),
        onComplete: () => setLoading(false)
    });

    const { execute: executeGetCategories } = useAction(getCategories, {
        onSuccess: (data) => setCategories(data || [])
    });

    const { execute: executeBulkDelete } = useAction(bulkDeleteContacts, {
        onSuccess: () => {
            toast.success("Contacts deleted", { id: 'bulk-ops' });
            setSelectedContacts([]);
            fetchInitialData(true);
        },
        onError: (err) => toast.error(err),
        onComplete: () => setIsBulkProcessing(false)
    });

    const { execute: executeImport } = useAction(importContacts, {
        onSuccess: (data) => {
            toast.success(data.message || "Import completed", { id: 'import-contacts' });
            setIsReviewOpen(false);
            setIsImporting(false);
            setImportReviewData([]);
            fetchInitialData();
        },
        onError: (err) => {
            toast.error(err, { id: 'import-contacts' });
            setIsImporting(false);
        }
    });

    // --- Loading Logic ---
    const fetchInitialData = useCallback((silent = false) => {
        if (!silent) setLoading(true);
        if (workspaceId) {
            executeGetContacts({ workspaceId });
            executeGetCategories({ workspaceId, type: 'CONTACT' });
        }
    }, [workspaceId, executeGetContacts, executeGetCategories]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    // Computed: Filtered Contacts
    const filteredContacts = useMemo(() => {
        return contacts.filter(contact => {
            const matchesSearch =
                contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                contact.phone.includes(searchQuery) ||
                contact.email?.toLowerCase().includes(searchQuery.toLowerCase());

            let matchesSegment = true;
            if (activeSegment.startsWith('category:')) {
                const catId = activeSegment.split(':')[1];
                matchesSegment = contact.categoryId === catId;
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

    // --- Actions (Handlers) ---
    const handleBulkDelete = () => {
        setIsBulkProcessing(true);
        executeBulkDelete({ ids: selectedContacts, workspaceId });
        setIsDeleteConfirmOpen(false);
    };

    const handleImportFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const csvData = event.target.result;
            const lines = csvData.split(/\r?\n/).filter(line => line.trim() !== '');
            if (lines.length < 2) {
                toast.error("CSV file is empty.");
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
            }).filter(c => c.phone);

            setImportReviewData(parsed);
            setIsReviewOpen(true);
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const runImport = () => {
        setIsImporting(true);
        executeImport({ contacts: importReviewData, workspaceId, userId });
    };

    const handleExport = () => {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `business-contacts-export-${timestamp}.json`;
        const blob = new Blob([JSON.stringify(contacts, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`Exporting ${contacts.length} contacts.`);
    };

    const getCategoryColor = (catId) => {
        const cat = categories.find(c => c.id === catId);
        return cat?.color || '#3b82f6';
    };

    return (
        <div className="flex flex-col h-[calc(100vh-70px)] overflow-hidden bg-background">


            {/* Upper Action Bar */}
            <div className="flex items-center justify-between py-2 px-4 border-b bg-card/30">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold tracking-tight">CRM Audience</h1>
                </div>

                <div className="flex items-center gap-2">
                    <input type="file" id="contacts-import" className="hidden" accept=".csv" onChange={handleImportFile} />
                    <Button variant="outline" size="sm" onClick={handleExport} className="gap-2 border-border/40">
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Export</span>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => document.getElementById('contacts-import').click()} disabled={isImporting} className="gap-2 border-border/40">
                        {isImporting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline">Import</span>
                    </Button>
                    <Separator orientation="vertical" className="h-4 mx-1" />
                    <Button size="sm" onClick={() => setIsAddContactOpen(true)} className="gap-2 shadow-sm">
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
                                </div>
                                <div className="space-y-1">
                                    {categories.map(cat => (
                                        <div
                                            key={cat.id}
                                            className={`w-full flex items-center justify-between transition-all cursor-pointer p-2 border border-transparent rounded-md ${activeSegment === `category:${cat.id}` ? 'bg-card' : 'hover:bg-card'}`}
                                            onClick={() => setActiveSegment(`category:${cat.id}`)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                                                <span className="text-xs truncate">{cat.name}</span>
                                            </div>
                                            <Badge variant="ghost" className="text-[10px] opacity-60">
                                                {contacts.filter(c => c.categoryId === cat.id).length}
                                            </Badge>
                                        </div>
                                    ))}
                                    {categories.length === 0 && <p className="text-[10px] text-muted-foreground italic px-2">No categories defined.</p>}
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                    <div className="p-4 border-t bg-muted/10 text-center">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Library Mirror Active</p>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col bg-muted/10">
                    {/* Search Bar */}
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

                            <div className="flex items-center border rounded-md overflow-hidden h-10">
                                <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" className="rounded-none w-10" onClick={() => setViewMode('list')}><List className="w-4 h-4" /></Button>
                                <Separator orientation="vertical" className="h-6" />
                                <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" className="rounded-none w-10" onClick={() => setViewMode('grid')}><LayoutGrid className="w-4 h-4" /></Button>
                            </div>
                        </div>
                    </div>

                    {selectedContacts.length > 0 && (
                        <div className="flex items-center justify-between px-6 py-2 bg-primary/10 border-b border-primary/20 animate-in slide-in-from-top duration-300">
                            <span className="text-sm font-bold text-primary">{selectedContacts.length} Selected</span>
                            <div className="flex items-center gap-3">
                                <Button variant="ghost" size="sm" onClick={() => setIsDeleteConfirmOpen(true)} className="h-8 gap-2 text-destructive hover:bg-destructive/5">
                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedContacts([])}>Cancel</Button>
                            </div>
                        </div>
                    )}

                    <div className="flex-1 overflow-hidden">
                        {loading ? (
                            <div className="h-full flex flex-col items-center justify-center gap-4">
                                <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                                <p className="text-sm text-muted-foreground">Syncing library...</p>
                            </div>
                        ) : filteredContacts.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center">
                                <Users className="w-16 h-16 mb-4" />
                                <p className="text-lg">No contacts found</p>
                            </div>
                        ) : (
                            <ScrollArea className="h-full p-2">
                                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4' : 'space-y-2'}>
                                    {filteredContacts.map(contact => (
                                        <ContactCard
                                            key={contact.id}
                                            contact={contact}
                                            isSelected={selectedContacts.includes(contact.id)}
                                            onSelectChange={(checked) => {
                                                if (checked) setSelectedContacts([...selectedContacts, contact.id]);
                                                else setSelectedContacts(selectedContacts.filter(id => id !== contact.id));
                                            }}
                                            categories={categories}
                                            getCategoryColor={getCategoryColor}
                                            onEdit={(c) => { setActiveContact(c); setIsEditContactOpen(true); }}
                                            onDelete={() => { setSelectedContacts([contact.id]); setIsDeleteConfirmOpen(true); }}
                                            onMessage={(c) => window.location.href = `/workspace/${workspaceId}/wa-business-api/chats?jid=${c.phone}@s.whatsapp.net`}
                                        />
                                    ))}
                                </div>
                            </ScrollArea>
                        )}
                    </div>
                </div>
            </div>

            <ContactSheet
                isOpen={isAddContactOpen || isEditContactOpen}
                onOpenChange={(open) => {
                    if (!open) { setIsAddContactOpen(false); setIsEditContactOpen(false); setActiveContact(null); }
                }}
                activeContact={activeContact}
                categories={categories}
                userId={userId}
                workspaceId={workspaceId}
                onSave={fetchInitialData}
            />

            <ReviewImportDialog isOpen={isReviewOpen} onOpenChange={setIsReviewOpen} data={importReviewData} setData={setImportReviewData} onImport={runImport} isImporting={isImporting} />
            <BulkDeleteDialog isOpen={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen} count={selectedContacts.length} onDelete={handleBulkDelete} isDeleting={isBulkProcessing} />
        </div>
    );
}
