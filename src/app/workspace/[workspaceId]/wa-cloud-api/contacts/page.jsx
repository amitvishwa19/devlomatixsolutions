'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import {
    Trash2, UserPlus, Users, Pencil, X, Search,
    ArrowUpDown, Download, Upload, RefreshCw, Tag, FileText,
    Filter, LayoutGrid, List, MoreVertical,
    Plus, Check, Star, ShieldCheck, Zap, Globe, MessageSquare,
    ChevronRight, Bookmark, Settings2, ExternalLink, Layers
} from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
import { Loader2 } from "lucide-react";

import { useAction } from '@/hooks/use-action';
import { getContacts } from './_actions/get-contacts';
import { getGroups } from './_actions/get-groups';
import { getCategories } from './_actions/get-categories';
import { deleteCategory } from './_actions/delete-category';
import { saveContact } from './_actions/save-contact';
import { deleteGroup } from './_actions/delete-group';
import { bulkDeleteContacts } from './_actions/bulk-delete-contacts';
import { bulkTagContacts } from './_actions/bulk-tag-contacts';
import { bulkCategoryContacts } from './_actions/bulk-category-contacts';
import { bulkGroupContacts } from './_actions/bulk-group-contacts';
import { bulkFormatContacts } from './_actions/bulk-format';
import { importContacts } from './_actions/import-contacts';
import { sendMessage } from './_actions/send-message';

// Modular Components
import ManageCategoriesDialog from './_components/ManageCategoriesDialog';
import ManageTagsDialog from './_components/ManageTagsDialog';
import ManageGroupsDialog from './_components/ManageGroupsDialog';
import ContactDialog from './_components/ContactDialog';
import ReviewImportDialog from './_components/ReviewImportDialog';
import BulkDeleteDialog from './_components/BulkDeleteDialog';
import BulkTagDialog from './_components/BulkTagDialog';
import BulkCategoryDialog from './_components/BulkCategoryDialog';
import BulkGroupDialog from './_components/BulkGroupDialog';
import MessageDialog from './_components/MessageDialog';
import ContactCard from './_components/ContactCard';

export default function ContactsPage() {
    const params = useParams();
    const workspaceId = params.workspaceId;
    const { data: session } = useSession();
    const userId = session?.user?.userId || '';
    const { toast: shadToast } = useToast();

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

    // Modals & Sheets
    const [isAddContactOpen, setIsAddContactOpen] = useState(false);
    const [isEditContactOpen, setIsEditContactOpen] = useState(false);
    const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
    const [isManageTagsOpen, setIsManageTagsOpen] = useState(false);
    const [isManageGroupsOpen, setIsManageGroupsOpen] = useState(false);
    const [isBulkTagOpen, setIsBulkTagOpen] = useState(false);
    const [isBulkCategoryOpen, setIsBulkCategoryOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isDeleteCategoryOpen, setIsDeleteCategoryOpen] = useState(false);
    const [isDeleteGroupOpen, setIsDeleteGroupOpen] = useState(false);
    const [isMessageOpen, setIsMessageOpen] = useState(false);

    // Active Entity State (for editing/messing)
    const [activeContact, setActiveContact] = useState(null);
    const [pendingDeleteEntity, setPendingDeleteEntity] = useState(null);
    const [historyMessages, setHistoryMessages] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);
    const [importReviewData, setImportReviewData] = useState([]);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [isBulkGroupOpen, setIsBulkGroupOpen] = useState(false);

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
                const catName = activeSegment.split(':')[1];
                matchesSegment = contact.category === catName;
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

    const availableCategories = useMemo(() => {
        const contactCatNames = Array.from(new Set(contacts.map(c => c.category).filter(Boolean)));
        return contactCatNames.map(name => {
            const existing = categories.find(c => c.name === name);
            return existing || { id: name, name, color: '#94a3b8' };
        });
    }, [contacts, categories]);

    // --- Server Actions ---
    const { execute: executeGetContacts } = useAction(getContacts, {
        onSuccess: (data) => setContacts(data || []),
        onError: (err) => shadToast({ title: "Error", description: err, variant: "destructive" }),
        onComplete: () => setLoading(false)
    });

    const { execute: executeGetGroups } = useAction(getGroups, {
        onSuccess: (data) => setGroups(data || [])
    });

    const { execute: executeGetCategories } = useAction(getCategories, {
        onSuccess: (data) => setCategories(data || [])
    });

    const { execute: executeGetTags } = useAction(getCategories, {
        onSuccess: (data) => setTagDefinitions(data || [])
    });

    const { execute: executeSaveContact } = useAction(saveContact, {
        onSuccess: () => {
            shadToast({ title: "Success", description: "Contact saved successfully" });
            fetchInitialData(true);
        },
        onError: (err, previousContacts) => {
            if (previousContacts) setContacts(previousContacts);
            shadToast({ title: "Error", description: err, variant: "destructive" });
        },
        onComplete: () => setIsBulkProcessing(false)
    });

    const { execute: executeBulkDelete } = useAction(bulkDeleteContacts, {
        onSuccess: () => {
            shadToast({ title: "Success", description: "Contacts deleted" });
            setSelectedContacts([]);
            fetchInitialData(true);
        },
        onError: (err, previousContacts) => {
            if (previousContacts) setContacts(previousContacts);
            shadToast({ title: "Error", description: err, variant: "destructive" });
        },
        onComplete: () => setIsBulkProcessing(false)
    });

    const { execute: executeBulkTag } = useAction(bulkTagContacts, {
        onSuccess: () => {
            shadToast({ title: "Success", description: "Contacts tagged" });
            setSelectedContacts([]);
            fetchInitialData(true);
        },
        onError: (err, previousContacts) => {
            if (previousContacts) setContacts(previousContacts);
            shadToast({ title: "Error", description: err, variant: "destructive" });
        },
        onComplete: () => setIsBulkProcessing(false)
    });

    const { execute: executeBulkCategory } = useAction(bulkCategoryContacts, {
        onSuccess: () => {
            toast.success("Category updated", { id: 'bulk-ops' });
            setSelectedContacts([]);
            fetchInitialData(true);
        },
        onError: (err, previousContacts) => {
            if (previousContacts) setContacts(previousContacts);
            const errorMsg = typeof err === 'string' ? err : (err?.message || "Category update failed");
            toast.error(errorMsg, { id: 'bulk-ops' });
            setIsBulkProcessing(false);
        }
    });

    const { execute: executeDeleteCategory, isLoading: isDeletingCategory } = useAction(deleteCategory, {
        onSuccess: () => {
            toast.success("Category removed from library", { id: 'segment-ops' });
            setPendingDeleteEntity(null);
            fetchInitialData(true);
        },
        onError: (err, previousCategories) => {
            if (previousCategories) setCategories(previousCategories);
            toast.error(typeof err === 'string' ? err : (err?.message || "Failed to remove category"), { id: 'segment-ops' });
        }
    });

    const { execute: executeBulkGroup } = useAction(bulkGroupContacts, {
        onSuccess: (res) => {
            shadToast({ title: "Success", description: `Added ${res.count} contacts to broadcast list.` });
            setSelectedContacts([]);
            setIsBulkGroupOpen(false);
            fetchInitialData();
        },
        onError: (err) => shadToast({ title: "Error", description: err, variant: "destructive" }),
        onComplete: () => setIsBulkProcessing(false)
    });

    const { execute: executeDeleteGroup, isLoading: isDeletingGroup } = useAction(deleteGroup, {
        onSuccess: () => {
            toast.success("Broadcast group removed", { id: 'segment-ops' });
            setPendingDeleteEntity(null);
            fetchInitialData(true);
        },
        onError: (err, previousGroups) => {
            if (previousGroups) setGroups(previousGroups);
            toast.error(typeof err === 'string' ? err : (err?.message || "Failed to remove group"), { id: 'segment-ops' });
        }
    });


    const { execute: executeImport } = useAction(importContacts, {
        onSuccess: (data) => {
            toast.success(data.message, { id: 'import-contacts' });
            setIsReviewOpen(false);
            setIsImporting(false);
            setImportReviewData([]);
            fetchInitialData();
        },
        onError: (err) => {
            const errorMsg = typeof err === 'string' ? err : (err?.message || "Import failed");
            toast.error(errorMsg, { id: 'import-contacts' });
            setIsImporting(false);
        }
    });

    const [isSendingMessage, setIsSendingMessage] = useState(false);
    const { execute: executeSendMessage } = useAction(sendMessage, {
        onSuccess: () => {
            toast.success("Message delivery initiated", { id: 'send-message' });
            setIsSendingMessage(false);
            setIsMessageOpen(false);
            setMessageText('');
        },
        onError: (err) => {
            const errorMsg = typeof err === 'string' ? err : (err?.message || "Failed to send message");
            toast.error(errorMsg, { id: 'send-message' });
            setIsSendingMessage(false);
        }
    });


    const [isFormatting, setIsFormatting] = useState(false);
    const { execute: executeBulkFormat } = useAction(bulkFormatContacts, {
        onSuccess: (data) => {
            toast.success(data.message, { id: 'bulk-format' });
            setIsFormatting(false);
            fetchInitialData();
            setSelectedContacts([]);
        },
        onError: (err) => {
            const errorMsg = typeof err === 'string' ? err : (err?.message || "Format failed");
            toast.error(errorMsg, { id: 'bulk-format' });
            setIsFormatting(false);
        }
    });

    // --- Loading Logic ---
    useEffect(() => {
        if (userId && workspaceId) {
            fetchInitialData();
        }

        const handleAccountSwitch = () => {
            fetchInitialData(true);
        };

        window.addEventListener('wa-account-switched', handleAccountSwitch);
        return () => window.removeEventListener('wa-account-switched', handleAccountSwitch);
    }, [userId, workspaceId]);

    const fetchInitialData = async (silent = false) => {
        if (!silent) setLoading(true);
        executeGetContacts({ userId, workspaceId });
        executeGetGroups({ userId, workspaceId });
        executeGetCategories({ workspaceId, type: 'CONTACT' });
        executeGetTags({ workspaceId, type: 'TAG' });
    };


    // --- Actions (Handlers) ---
    const handleSaveContact = async (data) => {
        setIsBulkProcessing(true);
        setIsAddContactOpen(false);
        setIsEditContactOpen(false);
        const previousSnapshot = [...contacts];

        // Optimistic Update
        if (data.id) {
            // Update
            setContacts(curr => curr.map(c => c.id === data.id ? { ...c, ...data } : c));
        } else {
            // Add
            const newOptimisticContact = {
                ...data,
                id: 'temp-' + Date.now(),
                createdAt: new Date().toISOString(),
                groups: [],
                tags: []
            };
            setContacts(curr => [newOptimisticContact, ...curr]);
        }

        executeSaveContact({
            ...data,
            userId,
            workspaceId
        }, previousSnapshot);
    };

    const handleBulkDelete = () => {
        setIsBulkProcessing(true);
        setIsDeleteConfirmOpen(false);
        const previousSnapshot = [...contacts];

        // Optimistic Delete
        setContacts(curr => curr.filter(c => !selectedContacts.includes(c.id)));

        executeBulkDelete({ ids: selectedContacts, workspaceId }, previousSnapshot);
    };

    const handleBulkTag = (tag) => {
        setIsBulkProcessing(true);
        setIsBulkTagOpen(false);
        const previousSnapshot = [...contacts];

        // Optimistic Tag Update
        setContacts(curr => curr.map(c =>
            selectedContacts.includes(c.id)
                ? { ...c, tags: [...new Set([...(c.tags || []), tag])] }
                : c
        ));

        executeBulkTag({ ids: selectedContacts, tag, workspaceId }, previousSnapshot);
    };

    const handleBulkCategory = (category) => {
        setIsBulkProcessing(true);
        setIsBulkCategoryOpen(false);
        const previousSnapshot = [...contacts];

        // Optimistic Category Update
        setContacts(curr => curr.map(c =>
            selectedContacts.includes(c.id)
                ? { ...c, category }
                : c
        ));

        executeBulkCategory({ contactIds: selectedContacts, category, workspaceId }, previousSnapshot);
    };

    const handleBulkGroup = (groupId) => {
        setIsBulkProcessing(true);
        setIsBulkGroupOpen(false);
        executeBulkGroup({ contactIds: selectedContacts, groupId, workspaceId });
    };


    const runImport = () => {
        setIsImporting(true);
        executeImport({ contactsData: importReviewData, workspaceId, userId });
    };

    const handleExport = () => {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `contacts-export-${timestamp}.json`;
        const blob = new Blob([JSON.stringify(contacts, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({ title: "Export Started", description: `Exporting ${contacts.length} contacts.` });
    };

    const handleSendMessage = () => {
        if (!activeContact || !messageText) return;
        setIsSendingMessage(true);
        toast.loading("Sending message...", { id: 'send-message' });
        executeSendMessage({ workspaceId, phone: activeContact.phone, message: messageText });
    };

    const handleBulkFormat = () => {
        if (selectedContacts.length === 0) return;
        setIsFormatting(true);
        toast.loading("Formatting numbers...", { id: 'bulk-format' });
        executeBulkFormat({ ids: selectedContacts, workspaceId });
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

                            <div id="categories" className="space-y-2">
                                <div className="flex items-center justify-between px-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Categories</span>
                                </div>
                                <div className="space-y-1">
                                    {Array.from(new Set(contacts.map(c => c.category).filter(Boolean))).sort().map(catName => (
                                        <div key={catName} className="relative group flex items-center pr-2">
                                            <div
                                                className={`w-full flex items-center justify-between transition-all cursor-pointer p-2 border border-transparent rounded-md ${activeSegment === `category:${catName}` ? 'bg-card border-primary/20' : 'hover:bg-card'}`}
                                                onClick={() => setActiveSegment(`category:${catName}`)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-primary/40" />
                                                    <span className="flex items-center truncate max-w-[120px] text-xs gap-2">
                                                        {catName}
                                                        <span className="text-[10px] opacity-40 font-mono">
                                                            {contacts.filter(c => c.category === catName).length}
                                                        </span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {contacts.filter(c => c.category).length === 0 && (
                                        <p className="text-[10px] text-muted-foreground italic px-2">No categories found.</p>
                                    )}
                                </div>
                            </div>

                            <div id="groups" className="space-y-2">
                                <div className="flex items-center justify-between px-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Broadcast Groups</span>
                                    <Button variant="ghost" size="icon" className="h-5 w-5 opacity-40 hover:opacity-100" onClick={() => setIsManageGroupsOpen(true)}>
                                        <Plus className="w-3 h-3" />
                                    </Button>
                                </div>
                                <div className="space-y-1">
                                    {groups.map(group => (
                                        <div key={group.id} className="relative group flex items-center pr-2">
                                            <div
                                                variant={activeSegment === `group:${group.id}` ? 'secondary' : 'ghost'}
                                                className={`w-full flex items-center justify-between transition-all cursor-pointer p-2 border border-transparent rounded-md ${activeSegment === `group:${group.id}` ? 'bg-card' : 'hover:bg-card'}`}
                                                onClick={() => setActiveSegment(`group:${group.id}`)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Layers className="w-3.5 h-3.5 opacity-40" />
                                                    <span className="flex items-center truncate max-w-[120px] text-xs gap-2">
                                                        {group.name}
                                                        <span className="text-xs opacity-60">
                                                            ({group._count?.contacts || 0})
                                                        </span>
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {isDeletingGroup && pendingDeleteEntity?.id === group.id ? (
                                                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />
                                                    ) : (
                                                        <>
                                                            <Pencil className="w-3.5 h-3.5 text-muted-foreground hover:text-primary transition-opacity"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setPendingDeleteEntity({ id: group.id, name: group.name });
                                                                    setIsManageGroupsOpen(true);
                                                                }}
                                                            />
                                                            <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive transition-opacity"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setPendingDeleteEntity({ id: group.id, name: group.name });
                                                                    setIsDeleteGroupOpen(true);
                                                                }}
                                                            />
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </ScrollArea>


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
                                <Button variant="ghost" size="sm" onClick={() => setIsBulkGroupOpen(true)} className="h-8 gap-2 text-primary hover:bg-primary/5">
                                    <Layers className="w-3.5 h-3.5" /> Broadcast List
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => setIsDeleteConfirmOpen(true)} className="h-8 gap-2 text-destructive hover:bg-destructive/5">
                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                </Button>
                                <Separator orientation="vertical" className="h-4 mx-2" />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleBulkFormat}
                                    className="h-8 gap-2 text-primary hover:bg-primary/5"
                                    disabled={isFormatting}
                                >
                                    <RefreshCw className={`w-3.5 h-3.5 ${isFormatting ? 'animate-spin' : ''}`} /> Clean
                                </Button>
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
                                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4' : 'space-y-2'}>
                                    {filteredContacts.map((contact) => (
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
                                            getTagColor={getTagColor}
                                            onEdit={(c) => {
                                                setActiveContact(c);
                                                setIsEditContactOpen(true);
                                            }}
                                            onMessage={(c) => {
                                                setActiveContact(c);
                                                setIsMessageOpen(true);
                                            }}
                                            onHistory={(c) => {
                                                setActiveContact(c);
                                                setIsHistoryOpen(true);
                                            }}
                                            onDelete={() => {
                                                setSelectedContacts([contact.id]);
                                                setIsDeleteConfirmOpen(true);
                                            }}
                                        />
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
                    onUpdate={() => { fetchInitialData(); setIsManageCategoriesOpen(false); }}
                />

                <ManageGroupsDialog
                    isOpen={isManageGroupsOpen}
                    onOpenChange={setIsManageGroupsOpen}
                    workspaceId={workspaceId}
                    groups={groups}
                    onUpdate={() => { fetchInitialData(); setIsManageGroupsOpen(false); }}
                />

                <ManageTagsDialog
                    isOpen={isManageTagsOpen}
                    onOpenChange={setIsManageTagsOpen}
                    workspaceId={workspaceId}
                    categories={tagDefinitions}
                    onUpdate={() => { fetchInitialData(); setIsManageTagsOpen(false); }}
                />

                {/* Individual Deletion Confirmations */}
                <AlertDialog open={isDeleteCategoryOpen} onOpenChange={setIsDeleteCategoryOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete the category <strong>"{pendingDeleteEntity?.name}"</strong>? This will remove the category from all associated contacts.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isDeletingCategory}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={(e) => {
                                    e.preventDefault();
                                    const previousSnapshot = [...categories];
                                    setCategories(curr => curr.filter(cat => cat.id !== pendingDeleteEntity?.id));
                                    setIsDeleteCategoryOpen(false);
                                    executeDeleteCategory({ id: pendingDeleteEntity?.id }, previousSnapshot);
                                }}
                                disabled={isDeletingCategory}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
                            >
                                {isDeletingCategory ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                {isDeletingCategory ? 'Deleting...' : 'Delete Category'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <AlertDialog open={isDeleteGroupOpen} onOpenChange={setIsDeleteGroupOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Broadcast Group?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete <strong>"{pendingDeleteEntity?.name}"</strong>? This action will permanently remove the group.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isDeletingGroup}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={(e) => {
                                    e.preventDefault();
                                    const previousSnapshot = [...groups];
                                    setGroups(curr => curr.filter(g => g.id !== pendingDeleteEntity?.id));
                                    setIsDeleteGroupOpen(false);
                                    executeDeleteGroup({ id: pendingDeleteEntity?.id, userId }, previousSnapshot);
                                }}
                                disabled={isDeletingGroup}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
                            >
                                {isDeletingGroup ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                {isDeletingGroup ? 'Deleting...' : 'Delete Group'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <ContactDialog
                    isOpen={isAddContactOpen || isEditContactOpen}
                    onOpenChange={(open) => {
                        if (!open) { setIsAddContactOpen(false); setIsEditContactOpen(false); setActiveContact(null); }
                    }}
                    activeContact={activeContact}
                    categories={availableCategories}
                    groups={groups}
                    userId={userId}
                    workspaceId={workspaceId}
                    onSave={fetchInitialData}
                />

                <MessageDialog
                    isOpen={isMessageOpen}
                    onOpenChange={setIsMessageOpen}
                    onSend={handleSendMessage}
                    contactName={activeContact?.name}
                    isSending={isSendingMessage}
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
                    isProcessing={isBulkProcessing}
                />

                <BulkGroupDialog
                    isOpen={isBulkGroupOpen}
                    onOpenChange={setIsBulkGroupOpen}
                    count={selectedContacts.length}
                    groups={groups}
                    onConfirm={handleBulkGroup}
                    isProcessing={isBulkProcessing}
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