'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import {
    UserPlus, Users, Search,
    Download, Upload, RefreshCw, Filter, LayoutGrid, List, Tag, Folder
} from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { useAction } from '@/hooks/use-action';
import { getContacts } from '../_actions/get-contacts';
import { getCategories } from '../_actions/get-categories';
import { importContacts } from '../_actions/import-contacts';

// Local Components
import ContactSheet from '../_components/ContactSheet';
import ReviewImportDialog from '../_components/ReviewImportDialog';
import ContactCard from '../_components/ContactCard';

const getStringColor = (str) => {
    if (!str) return '215, 15%, 45%'; // slate
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    // Multiply by 137 (prime) to spread out short strings better
    const h = Math.abs(hash * 137) % 360;
    return `${h}, 70%, 45%`; 
};

export default function ContactsPage() {
    const params = useParams();
    const workspaceId = params.workspaceId;
    const { data: session } = useSession();
    const userId = session?.user?.userId || session?.user?.id || '';

    // Core Data State
    const [contacts, setContacts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // UI State
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [viewMode, setViewMode] = useState('list');
    const [activeSegment, setActiveSegment] = useState('all');

    // Modals & Sheets
    const [isAddContactOpen, setIsAddContactOpen] = useState(false);
    const [isEditContactOpen, setIsEditContactOpen] = useState(false);
    const [activeContact, setActiveContact] = useState(null);
    const [isImporting, setIsImporting] = useState(false);
    const [importReviewData, setImportReviewData] = useState([]);
    const [isReviewOpen, setIsReviewOpen] = useState(false);

    // --- Server Actions ---
    const { execute: executeGetContacts } = useAction(getContacts, {
        onSuccess: (data) => setContacts(data || []),
        onError: (err) => toast.error(err),
        onComplete: () => setLoading(false)
    });

    const { execute: executeGetCategories } = useAction(getCategories, {
        onSuccess: (data) => setCategories(data || [])
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

    // Computed Aggregations for Sidebar
    const textCategories = useMemo(() => {
        const counts = {};
        contacts.forEach(c => {
            if (c.category && c.category.trim()) {
                const cat = c.category.trim();
                counts[cat] = (counts[cat] || 0) + 1;
            }
        });
        return Object.entries(counts).sort((a, b) => b[1] - a[1]);
    }, [contacts]);

    const allTags = useMemo(() => {
        const counts = {};
        contacts.forEach(c => {
            if (c.tags && Array.isArray(c.tags)) {
                c.tags.forEach(t => {
                    const tag = t.trim();
                    if (tag) counts[tag] = (counts[tag] || 0) + 1;
                });
            }
        });
        return Object.entries(counts).sort((a, b) => b[1] - a[1]);
    }, [contacts]);


    // Computed: Filtered Contacts
    const filteredContacts = useMemo(() => {
        return contacts.filter(contact => {
            const matchesSearch =
                contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                contact.phone.includes(searchQuery) ||
                contact.email?.toLowerCase().includes(searchQuery.toLowerCase());

            let matchesSegment = true;
            if (activeSegment !== 'all') {
                const [type, value] = activeSegment.split('::');
                if (type === 'vcat') {
                    matchesSegment = contact.categoryId === value;
                } else if (type === 'tcat') {
                    matchesSegment = contact.category?.trim() === value;
                } else if (type === 'tag') {
                    matchesSegment = contact.tags && contact.tags.map(t => t.trim()).includes(value);
                }
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
                    <Button size="sm" onClick={() => setIsAddContactOpen(true)} className="gap-2 shadow-sm font-semibold">
                        <UserPlus className="w-4 h-4" />
                        <span>Add Contact Node</span>
                    </Button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* CRM Sidebar */}
                <div className="w-64 border-r bg-card/20 flex flex-col hide-scrollbar">
                    <ScrollArea className="flex-1">
                        <div className="p-4 space-y-8 pb-12">
                            {/* Segment: All */}
                            <div className="space-y-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 px-2">Core Segments</span>
                                <Button
                                    variant={activeSegment === 'all' ? 'secondary' : 'ghost'}
                                    className="w-full justify-start h-9 text-sm gap-3 px-3 shadow-none transition-colors"
                                    onClick={() => setActiveSegment('all')}
                                >
                                    <Users className="w-4 h-4 text-primary" />
                                    <span className="font-semibold">All Contacts</span>
                                    <Badge variant="secondary" className="ml-auto text-[10px] bg-background">{contacts.length}</Badge>
                                </Button>
                            </div>

                            {/* Segment: Text Categories */}
                            {textCategories.length > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between px-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 flex items-center gap-1"><Folder className="w-3 h-3" /> Categories</span>
                                </div>
                                <div className="space-y-0.5">
                                    {textCategories.map(([cat, count]) => (
                                        <div
                                            key={cat}
                                            className={`w-full flex items-center justify-between transition-all cursor-pointer py-1.5 px-3 rounded-md text-sm ${activeSegment === `tcat::${cat}` ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-muted-foreground'}`}
                                            onClick={() => setActiveSegment(`tcat::${cat}`)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: `hsl(${getStringColor(cat)})` }} />
                                                <span className="truncate">{cat}</span>
                                            </div>
                                            <span className="text-[10px] opacity-60 font-mono">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            )}

                            {/* Segment: Tags */}
                            {allTags.length > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between px-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 flex items-center gap-1"><Tag className="w-3 h-3" /> Labels & Tags</span>
                                </div>
                                <div className="space-y-0.5">
                                    {allTags.map(([tag, count]) => {
                                        const c = getStringColor(tag);
                                        return (
                                        <div
                                            key={tag}
                                            className={`w-full flex items-center justify-between transition-all cursor-pointer py-1.5 px-3 rounded-md text-sm ${activeSegment === `tag::${tag}` ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-muted-foreground'}`}
                                            onClick={() => setActiveSegment(`tag::${tag}`)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: `hsl(${c})` }} />
                                                <span className="truncate">{tag}</span>
                                            </div>
                                            <span className="text-[10px] opacity-60 font-mono">{count}</span>
                                        </div>
                                    )})}
                                </div>
                            </div>
                            )}

                            {/* Segment: Visual Categories */}
                            {categories.length > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between px-2 pt-2 border-t border-border/40">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Visual Boards</span>
                                </div>
                                <div className="space-y-0.5">
                                    {categories.map(cat => {
                                        const count = contacts.filter(c => c.categoryId === cat.id).length;
                                        return (
                                            <div
                                                key={cat.id}
                                                className={`w-full flex items-center justify-between transition-all cursor-pointer py-1.5 px-3 rounded-md ${activeSegment === `vcat::${cat.id}` ? 'bg-card shadow-sm border border-border/50' : 'border border-transparent hover:bg-muted/50'}`}
                                                onClick={() => setActiveSegment(`vcat::${cat.id}`)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: cat.color }} />
                                                    <span className="text-xs font-medium truncate text-foreground/80">{cat.name}</span>
                                                </div>
                                                <span className="text-[10px] text-muted-foreground font-mono opacity-60">
                                                    {count}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                            )}

                        </div>
                    </ScrollArea>
                    <div className="p-3 border-t bg-muted/10 text-center flex-shrink-0">
                        <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest flex items-center justify-center gap-1 opacity-50">
                            <RefreshCw className="w-2.5 h-2.5" /> Library Sync Active
                        </p>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col bg-muted/10">
                    {/* Search Bar */}
                    <div className="flex items-center gap-4 py-2 px-4 border-b bg-card/40">
                        <div className="relative flex-1 max-w-md group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Search Audience Logs..."
                                className="pl-9 bg-background h-10 border-border/40 shadow-sm focus-visible:ring-primary/20"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-10 gap-2 border-border/40 shadow-sm">
                                        <Filter className="w-3.5 h-3.5" />
                                        <span className="text-xs font-medium">Sort: {sortBy.replace('-', ' ')}</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setSortBy('newest')}>Newest First</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSortBy('oldest')}>Oldest First</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSortBy('name-asc')}>Name A-Z</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSortBy('name-desc')}>Name Z-A</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <div className="flex items-center border border-border/40 shadow-sm rounded-md overflow-hidden h-10 bg-background">
                                <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" className="rounded-none w-10 text-foreground/70" onClick={() => setViewMode('list')}><List className="w-4 h-4" /></Button>
                                <Separator orientation="vertical" className="h-6" />
                                <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" className="rounded-none w-10 text-foreground/70" onClick={() => setViewMode('grid')}><LayoutGrid className="w-4 h-4" /></Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden">
                        {loading ? (
                            <div className="h-full flex flex-col items-center justify-center gap-4 opacity-70">
                                <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                                <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest text-[10px]">Processing Vault...</p>
                            </div>
                        ) : filteredContacts.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center opacity-50">
                                <Users className="w-12 h-12 mb-4 text-muted-foreground/50" />
                                <p className="text-sm font-semibold tracking-wide">No audience nodes found.</p>
                            </div>
                        ) : (
                            <ScrollArea className="h-full p-4">
                                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3' : 'space-y-2'}>
                                    {filteredContacts.map(contact => (
                                        <ContactCard
                                            key={contact.id}
                                            contact={contact}
                                            categories={categories}
                                            getCategoryColor={getCategoryColor}
                                            getStringColor={getStringColor}
                                            onEdit={(c) => { setActiveContact(c); setIsEditContactOpen(true); }}
                                            onDelete={() => { toast.info("Single delete via API coming soon"); }}
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
        </div>
    );
}
