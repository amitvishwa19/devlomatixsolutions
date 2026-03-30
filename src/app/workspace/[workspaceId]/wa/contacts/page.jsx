'use client';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useSession } from 'next-auth/react';
import { Trash2, UserPlus, Users, Phone, Mail, Pencil, X, Search, ArrowUpDown, Download, Upload, RefreshCw, Tag, FileText, Send, History } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,

    DropdownMenuSeparator,
    DropdownMenuTrigger
} from
    "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from
    "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from
    "@/components/ui/dialog";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle
} from
    "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from
    "@/components/ui/tabs";



export default function ContactsPage() {
    const [contacts, setContacts] = useState([]);
    const [newContact, setNewContact] = useState({
        name: '',
        phone: '',
        email: '',
        info: ''
    });
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const userId = session?.user?.userId || '';

    // Editing State
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingContact, setEditingContact] = useState({
        id: '',
        name: '',
        phone: '',
        email: '',
        info: ''
    });

    // Send Message State
    const [sendMessageModalOpen, setSendMessageModalOpen] = useState(false);
    const [selectedContactForMessage, setSelectedContactForMessage] = useState(null);
    const [testMessageText, setTestMessageText] = useState('Hello! This is a test message from Devlomatix.');
    const [sendingMessage, setSendingMessage] = useState(false);

    // Selection State
    const [selectedContacts, setSelectedContacts] = useState([]);

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest'); // newest, oldest, name-asc, name-desc
    const [filterTag, setFilterTag] = useState('all');

    // Deletion Modal State
    const [contactToDelete, setContactToDelete] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    // Tagging Modal State
    const [tagModalOpen, setTagModalOpen] = useState(false);
    const [tagInput, setTagInput] = useState('');

    // WA Connection Status
    const [waStatus, setWaStatus] = useState('welcome'); // welcome, connecting, qr, open, close

    // History Drawer State
    const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
    const [selectedContactForHistory, setSelectedContactForHistory] = useState(null);
    const [historyMessages, setHistoryMessages] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    // Groups State
    const [groups, setGroups] = useState([]);
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [isAddingToGroupModalOpen, setIsAddingToGroupModalOpen] = useState(false);
    const [newGroup, setNewGroup] = useState({ name: '', description: '' });
    const [selectedGroupId, setSelectedGroupId] = useState('all');
    const [activeTab, setActiveTab] = useState('contacts');

    // Member Selector for Group View
    const [isMemberSelectorOpen, setIsMemberSelectorOpen] = useState(false);
    const [activeGroupId, setActiveGroupId] = useState(null);
    const [memberSearchQuery, setMemberSearchQuery] = useState('');
    const [selectedMemberIds, setSelectedMemberIds] = useState([]);
    const [editingGroupId, setEditingGroupId] = useState(null);
    const [groupEditName, setGroupEditName] = useState('');

    // Filtered and Sorted Contacts
    const filteredContacts = contacts.
        filter((contact) => {
            const matchesSearch =
                contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                contact.phone.includes(searchQuery) ||
                contact.email && contact.email.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesTag = filterTag === 'all' || contact.tags && contact.tags.includes(filterTag);

            const matchesGroup = selectedGroupId === 'all' || contact.groups && contact.groups.some((g) => g.id === selectedGroupId);

            return matchesSearch && matchesTag && matchesGroup;
        }).
        sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
            if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
            if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
            if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
            return 0;
        });

    // All available tags
    const allTags = Array.from(new Set(contacts.flatMap((c) => c.tags || [])));

    // Selection Handlers
    const toggleSelectAll = () => {
        if (selectedContacts.length === filteredContacts.length) {
            setSelectedContacts([]);
        } else {
            setSelectedContacts(filteredContacts.map((c) => c.id));
        }
    };

    const toggleSelectContact = (id) => {
        setSelectedContacts((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    // Fetch contacts and check WA status
    useEffect(() => {
        if (userId) {
            fetchContacts();
            fetchGroups();
            checkWAStatus();

            // Poll WA status every 10 seconds
            const interval = setInterval(checkWAStatus, 10000);
            return () => clearInterval(interval);
        }
    }, [userId]);

    const fetchGroups = async () => {
        try {
            const res = await fetch(`/api/wa/groups?userId=${userId}`);
            if (res.ok) {
                const data = await res.json();
                setGroups(data);
            }
        } catch (error) {
            console.error('Error fetching groups:', error);
        }
    };

    const checkWAStatus = async () => {
        try {
            const response = await fetch('/api/wa/auth');
            if (response.ok) {
                const data = await response.json();
                setWaStatus(data.status);
            }
        } catch (error) {
            console.error('Error checking WA status:', error);
        }
    };

    const fetchHistory = async (jid) => {
        if (!userId || !jid) return;
        setHistoryLoading(true);
        try {
            const res = await fetch(`/api/wa/messages?userId=${userId}&jid=${jid}&limit=50`);
            if (res.ok) {
                const data = await res.json();
                setHistoryMessages(data);
            }
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setHistoryLoading(false);
        }
    };

    const openHistory = (contact) => {
        setSelectedContactForHistory(contact);
        setHistoryDrawerOpen(true);
        fetchHistory(contact.phone.includes('@') ? contact.phone : `${contact.phone.replace(/\D/g, '')}@s.whatsapp.net`);
    };

    const fetchContacts = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/wa/contacts?userId=${userId}`);
            if (!response.ok) throw new Error('Failed to fetch contacts');
            const data = await response.json();
            // Ensure groups array exists
            const enrichedContacts = data.map((c) => ({
                ...c,
                groups: c.groups || []
            }));
            setContacts(enrichedContacts);
        } catch (error) {
            console.error('Error fetching contacts:', error);
            toast({
                title: "Error",
                description: "Failed to fetch contacts",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewContact((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userId) {
            toast({
                title: "Error",
                description: "User not authenticated",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/wa/contacts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...newContact,
                    userId
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create contact');
            }

            const savedContact = await response.json();
            setContacts((prev) => [savedContact, ...prev]);
            setNewContact({ name: '', phone: '', email: '', info: '' });

            toast({
                title: "Success",
                description: 'Contact added successfully'
            });
        } catch (error) {
            console.error('Error creating contact:', error);
            const message = error instanceof Error ? error.message : "Failed to create contact";
            toast({
                title: "Error",
                description: message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const startEditing = (contact) => {
        setEditingContact({
            id: contact.id,
            name: contact.name,
            phone: contact.phone,
            email: contact.email || '',
            info: contact.info?.notes || contact.info || ''
        });
        setEditModalOpen(true);
    };

    const handleSendMessage = async () => {
        if (!selectedContactForMessage || !testMessageText.trim()) return;

        setSendingMessage(true);
        try {
            const response = await fetch('/api/wa/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: selectedContactForMessage.phone,
                    text: testMessageText
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to send message');
            }

            toast({
                title: "Message Sent",
                description: `Successfully sent test message to ${selectedContactForMessage.name}`
            });
            setSendMessageModalOpen(false);
            setTestMessageText('Hello! This is a test message from Devlomatix.');
        } catch (error) {
            console.error('Send error:', error);
            toast({
                title: "Send Error",
                description: error instanceof Error ? error.message : "Failed to send message",
                variant: "destructive"
            });
        } finally {
            setSendingMessage(false);
        }
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditingContact((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`/api/wa/contacts/${editingContact.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: editingContact.name,
                    phone: editingContact.phone,
                    email: editingContact.email,
                    info: editingContact.info
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update contact');
            }

            const updated = await response.json();
            setContacts((prev) => prev.map((c) => c.id === editingContact.id ? updated : c));
            setEditModalOpen(false);

            toast({
                title: "Updated",
                description: "Contact updated successfully"
            });
        } catch (error) {
            console.error('Error updating contact:', error);
            toast({
                title: "Error",
                description: "Failed to update contact",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const deleteContact = async () => {
        const id = contactToDelete?.id;
        if (!id) return;

        try {
            const response = await fetch(`/api/wa/contacts/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to delete contact');

            setContacts((prev) => prev.filter((c) => c.id !== id));
            setSelectedContacts((prev) => prev.filter((i) => i !== id));
            toast({
                title: "Deleted",
                description: "Contact removed successfully"
            });
        } catch (error) {
            console.error('Error deleting contact:', error);
            toast({
                title: "Error",
                description: "Failed to delete contact",
                variant: "destructive"
            });
        } finally {
            setDeleteModalOpen(false);
            setContactToDelete(null);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedContacts.length === 0) return;

        setLoading(true);
        try {
            const response = await fetch('/api/wa/contacts/bulk-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedContacts })
            });

            if (!response.ok) throw new Error('Failed to delete contacts');

            const { count } = await response.json();
            setContacts((prev) => prev.filter((c) => !selectedContacts.includes(c.id)));
            setSelectedContacts([]);

            toast({
                title: "Bulk Delete",
                description: `Successfully deleted ${count} contacts`
            });
        } catch (error) {
            console.error('Bulk delete error:', error);
            toast({
                title: "Error",
                description: "Failed to perform bulk delete",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        if (waStatus !== 'open') {
            toast({
                title: "Not Connected",
                description: "Please connect your WhatsApp before syncing contacts.",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/wa/contacts/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to sync with WhatsApp');
            }

            const { count, message } = await response.json();

            // Refresh contacts after sync
            const contactsResponse = await fetch(`/api/wa/contacts?userId=${userId}`);
            const updatedContacts = await contactsResponse.json();
            setContacts(updatedContacts);

            toast({
                title: "WhatsApp Sync",
                description: message
            });
        } catch (error) {
            console.error('Sync error:', error);
            toast({
                title: "Sync Error",
                description: error instanceof Error ? error.message : "Failed to sync with WhatsApp. Make sure your WhatsApp is connected.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target.result;
            const lines = text.split('\n');
            const data = [];

            // Simple CSV parsing: name,phone,email
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;

                const [name, phone, email] = line.split(',');
                if (name && phone) {
                    data.push({ name: name.trim(), phone: phone.trim(), email: email?.trim() });
                }
            }

            if (data.length === 0) {
                toast({ title: "Import Error", description: "No valid contact data found in CSV", variant: "destructive" });
                return;
            }

            setLoading(true);
            try {
                const response = await fetch('/api/wa/contacts/bulk', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, contacts: data })
                });

                if (!response.ok) throw new Error('Failed to import contacts');

                const { count } = await response.json();

                // Refresh list
                const contactsResponse = await fetch(`/api/wa/contacts?userId=${userId}`);
                const updatedContacts = await contactsResponse.json();
                setContacts(updatedContacts);

                toast({
                    title: "Import Success",
                    description: `Successfully imported ${count} contacts`
                });
            } catch (error) {
                console.error('Import error:', error);
                toast({ title: "Error", description: "Failed to import contacts", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };
        reader.readAsText(file);
    };

    const handleBulkTag = async () => {
        if (selectedContacts.length === 0 || !tagInput) return;

        setLoading(true);
        try {
            const response = await fetch('/api/wa/contacts/bulk-tag', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedContacts, tag: tagInput })
            });

            if (!response.ok) throw new Error('Failed to tag contacts');

            const { count } = await response.json();

            // Refresh list
            const contactsResponse = await fetch(`/api/wa/contacts?userId=${userId}`);
            const updatedContacts = await contactsResponse.json();
            setContacts(updatedContacts);

            setTagModalOpen(false);
            setTagInput('');
            setSelectedContacts([]);

            toast({
                title: "Bulk Tag",
                description: `Successfully added tag"${tagInput}"to ${count} contacts`
            });
        } catch (error) {
            console.error('Bulk tag error:', error);
            toast({ title: "Error", description: "Failed to perform bulk tagging", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateGroup = async () => {
        if (!newGroup.name) return;
        setLoading(true);
        try {
            const res = await fetch('/api/wa/groups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newGroup, userId })
            });
            if (res.ok) {
                const data = await res.json();
                setGroups((prev) => [...prev, data]);
                setNewGroup({ name: '', description: '' });
                setIsGroupModalOpen(false);
                toast({ title: "Group Created", description: `Group"${data.name}"has been created.` });
            }
        } catch (error) {
            console.error('Error creating group:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateGroup = async (groupId) => {
        if (!groupEditName.trim()) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/wa/groups/${groupId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: groupEditName, userId })
            });
            if (res.ok) {
                const data = await res.json();
                setGroups((prev) => prev.map((g) => g.id === groupId ? { ...g, name: data.name } : g));
                setEditingGroupId(null);
                setGroupEditName('');
                toast({ title: "Group Updated", description: "The group name has been successfully updated." });
                fetchContacts(); // Refresh to see updated group name in contacts
            }
        } catch (error) {
            console.error('Error updating group:', error);
            toast({ title: "Update Error", description: "Failed to update group name.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFromGroup = async (contactId, groupId) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/wa/groups/${groupId}/contacts`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contactIds: [contactId] })
            });
            if (res.ok) {
                // Refresh local state
                setContacts((prev) => prev.map((c) => {
                    if (c.id === contactId) {
                        return {
                            ...c,
                            groups: c.groups.filter((g) => g.id !== groupId)
                        };
                    }
                    return c;
                }));
                // Also update groups count
                setGroups((prev) => prev.map((g) => {
                    if (g.id === groupId) {
                        return {
                            ...g,
                            _count: { ...g._count, contacts: (g._count?.contacts || 1) - 1 }
                        };
                    }
                    return g;
                }));
                toast({ title: "Removed from Group", description: "Contact was successfully removed from the group." });
            }
        } catch (error) {
            console.error('Error removing from group:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToGroup = async (groupId) => {
        if (selectedContacts.length === 0) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/wa/groups/${groupId}/contacts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contactIds: selectedContacts })
            });
            if (res.ok) {
                // Refresh contacts and groups
                await fetchContacts();
                await fetchGroups();
                setIsAddingToGroupModalOpen(false);
                setSelectedContacts([]);
                toast({ title: "Contacts Added", description: `Successfully added ${selectedContacts.length} contacts to the group.` });
            }
        } catch (error) {
            console.error('Error adding to group:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteGroup = async (groupId) => {
        try {
            const res = await fetch(`/api/wa/groups/${groupId}`, { method: 'DELETE' });
            if (res.ok) {
                setGroups((prev) => prev.filter((g) => g.id !== groupId));
                if (selectedGroupId === groupId) setSelectedGroupId('all');
                toast({ title: "Group Deleted" });
            }
        } catch (error) {
            console.error('Error deleting group:', error);
        }
    };

    const downloadTemplate = () => {
        const csv = "Name,Phone,Email\nJohn Doe,+1234567890,john@example.com\nJane Smith,+9876543210,jane@example.com";
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', 'whatsapp_contacts_template.csv');
        a.click();
    };

    return (
        <>
            <div className="animate-in fade-in duration-500">
                <div>
                    <h1 className="text-xl font-bold text-white mb-2">Contacts</h1>
                    <p className="text-muted-foreground text-xs">Manage your WhatsApp audience and contact lists</p>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6'>

                    {/* Add Contact Form */}
                    <div className="lg:col-span-5 bg-background/50 rounded-md border border-border p-6 h-fit">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold">Add New Contact</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-xs font-medium mb-1">Name</label>
                                    <Input
                                        type="text"
                                        name="name"
                                        value={newContact.name}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Enter contact name" />

                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Phone Number</label>
                                    <Input
                                        type="tel"
                                        name="phone"
                                        value={newContact.phone}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Enter phone number" />

                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Email (Optional)</label>
                                    <Input
                                        type="email"
                                        name="email"
                                        value={newContact.email}
                                        onChange={handleInputChange}
                                        placeholder="Enter email address" />

                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Additional Info (Optional)</label>
                                    <Input
                                        type="text"
                                        name="info"
                                        value={newContact.info}
                                        onChange={handleInputChange}
                                        placeholder="Enter notes or additional info" />

                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-2">

                                {loading ? 'Adding...' : 'Add Contact'}
                            </Button>
                        </form>
                    </div>

                    {/* Contacts List */}
                    <div className="lg:col-span-7 bg-background/50 rounded-md border border-border p-6 h-full flex flex-col min-h-[600px]">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
                            <TabsList className="mb-4 w-full justify-start h-11 bg-muted/20 p-1 border border-border/50">
                                <TabsTrigger value="contacts" className="gap-2 px-4 data-[state=active]:bg-background">
                                    <Users className="w-4 h-4" />
                                    Contacts
                                </TabsTrigger>
                                <TabsTrigger value="groups" className="gap-2 px-4 data-[state=active]:bg-background">
                                    <Users className="w-4 h-4" />
                                    Groups
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="contacts" className="flex-1 flex flex-col m-0 p-0 border-0 outline-none">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                                    <div className="flex flex-col gap-1">
                                        <h2 className="text-xl font-semibold">Your Audience ({filteredContacts.length})</h2>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${waStatus === 'open' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`} />
                                            <span className="text-[10px] font-bold tracking-wider text-muted-foreground">
                                                WA Status: {waStatus === 'open' ? 'Connected' : 'Disconnected'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant={waStatus === 'open' ? "outline" : "default"}
                                            size="sm"
                                            className={`gap-2 h-9 ${waStatus !== 'open' ? 'bg-primary/20 hover:bg-primary/30 text-primary border-primary/50' : ''}`}
                                            onClick={handleSync}
                                            disabled={loading}>
                                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                            <span className="hidden md:inline">{waStatus === 'open' ? 'Sync WA' : 'Connect to Sync'}</span>
                                        </Button>

                                        <div className="flex items-center">
                                            <label className="cursor-pointer">
                                                <Button variant="outline" size="sm" className="gap-2 rounded-r-none border-r-0" asChild disabled={loading}>
                                                    <span>
                                                        <Upload className="w-4 h-4" />
                                                        <span className="hidden md:inline">Import</span>
                                                    </span>
                                                </Button>
                                                <input type="file" accept=".csv" className="hidden" onChange={handleImport} />
                                            </label>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-9 w-9 p-0 rounded-l-none border-l-[1px] border-l-border/30"
                                                onClick={downloadTemplate}
                                                title="Download CSV Template">
                                                <FileText className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Search, Sort and Group Filter Bar */}
                                <div className="flex flex-col md:flex-row gap-3 mb-6">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search contacts..."
                                            className="pl-9"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)} />

                                    </div>

                                    <div className="flex gap-2">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" className="gap-2">
                                                    <Users className="w-4 h-4" />
                                                    <span className="hidden sm:inline">Group: {selectedGroupId === 'all' ? 'All' : groups.find((g) => g.id === selectedGroupId)?.name}</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => setSelectedGroupId('all')}>All Contacts</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                {groups.map((group) =>
                                                    <DropdownMenuItem key={group.id} onClick={() => setSelectedGroupId(group.id)}>
                                                        {group.name} ({group._count?.contacts})
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" className="gap-2">
                                                    <ArrowUpDown className="w-4 h-4" />
                                                    <span className="hidden sm:inline">Sort: {sortBy}</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => setSortBy('newest')}>Newest First</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setSortBy('oldest')}>Oldest First</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setSortBy('name-asc')}>Name (A-Z)</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setSortBy('name-desc')}>Name (Z-A)</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>

                                        {allTags.length > 0 &&
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="outline" className="gap-2">
                                                        <Tag className="w-4 h-4" />
                                                        <span className="hidden sm:inline">Tag: {filterTag}</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => setFilterTag('all')}>All Tags</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    {allTags.map((tag) =>
                                                        <DropdownMenuItem key={tag} onClick={() => setFilterTag(tag)}>
                                                            {tag}
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        }
                                    </div>
                                </div>

                                {/* Bulk Selection Bar */}
                                <div className="flex items-center justify-between py-2 px-3 mb-4 bg-muted/30 rounded-md border border-border/50">
                                    <div className="flex items-center gap-3">
                                        <Checkbox
                                            checked={filteredContacts.length > 0 && selectedContacts.length === filteredContacts.length}
                                            onCheckedChange={toggleSelectAll} />

                                        <span className="text-sm font-medium">
                                            {selectedContacts.length > 0 ? `${selectedContacts.length} selected` : 'Select All'}
                                        </span>
                                    </div>

                                    {selectedContacts.length > 0 &&
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10 gap-1"
                                                onClick={handleBulkDelete}
                                                disabled={loading}>

                                                <Trash2 className="w-3.5 h-3.5" />
                                                Delete
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 gap-1"
                                                onClick={() => setTagModalOpen(true)}
                                                disabled={loading}>

                                                <Tag className="w-3.5 h-3.5" />
                                                Tag
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 gap-1"
                                                onClick={() => setIsAddingToGroupModalOpen(true)}
                                                disabled={loading}>

                                                <Users className="w-3.5 h-3.5" />
                                                Add to Group
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 gap-1"
                                                onClick={() => {
                                                    const csv = "Name,Phone,Email\n" + contacts.
                                                        filter((c) => selectedContacts.includes(c.id)).
                                                        map((c) => `${c.name},${c.phone},${c.email || ''}`).
                                                        join('\n');
                                                    const blob = new Blob([csv], { type: 'text/csv' });
                                                    const url = window.URL.createObjectURL(blob);
                                                    const a = document.createElement('a');
                                                    a.setAttribute('href', url);
                                                    a.setAttribute('download', `whatsapp_contacts_export_${new Date().toISOString().split('T')[0]}.csv`);
                                                    a.click();
                                                }}>

                                                <Download className="w-3.5 h-3.5" />
                                                Export
                                            </Button>
                                        </div>
                                    }
                                </div>

                                <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                                    {loading && contacts.length === 0 ?
                                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                                            <RefreshCw className="w-8 h-8 animate-spin" />
                                            <p>Loading contacts...</p>
                                        </div> :
                                        filteredContacts.length === 0 ?
                                            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                                                <Users className="w-12 h-12 opacity-20" />
                                                <p>{searchQuery ? 'No contacts match your search' : 'No contacts found'}</p>
                                                {searchQuery &&
                                                    <Button variant="link" onClick={() => setSearchQuery('')}>Clear Search</Button>
                                                }
                                            </div> :

                                            filteredContacts.map((contact, index) =>
                                                <div
                                                    key={`${contact.id}-${index}`}
                                                    className={`group relative flex items-center gap-4 p-4 rounded-md border transition-all duration-200 hover:shadow-md ${selectedContacts.includes(contact.id) ? 'border-primary/50 bg-primary/5 shadow-sm' : 'border-border/50 bg-card hover:border-border'}`}>

                                                    <div className="flex items-center gap-3">
                                                        <Checkbox
                                                            checked={selectedContacts.includes(contact.id)}
                                                            onCheckedChange={() => toggleSelectContact(contact.id)} />

                                                        <div className="w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                            {contact.name[0].toUpperCase()}
                                                        </div>
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="font-semibold text-foreground truncate">{contact.name}</h3>
                                                        </div>
                                                        <div className="flex flex-wrap gap-1 mt-2">
                                                            {contact.tags && contact.tags.map((tag) =>
                                                                <Badge key={tag} variant="secondary" className="text-[10px] py-0 px-1.5 h-4 bg-primary/10 text-primary border-primary/20">
                                                                    {tag}
                                                                </Badge>
                                                            )}
                                                            {contact.groups && contact.groups.map((group) =>
                                                                <Badge key={group.id} variant="outline" className="text-[10px] py-0 px-1.5 h-4 bg-blue-500/10 text-blue-400 border-blue-500/20">
                                                                    {group.name}
                                                                </Badge>
                                                            )}
                                                        </div>

                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                <Phone className="w-3 h-3" />
                                                                <span>{contact.phone}</span>
                                                            </div>
                                                            {contact.email &&
                                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                    <Mail className="w-3 h-3" />
                                                                    <span className="truncate">{contact.email}</span>
                                                                </div>
                                                            }
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col items-end gap-2">
                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="w-8 h-8 text-muted-foreground hover:text-emerald-500"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedContactForMessage(contact);
                                                                    setSendMessageModalOpen(true);
                                                                }}
                                                                disabled={waStatus !== 'open'}
                                                                title={waStatus === 'open' ? "Send Test Message" : "WhatsApp Disconnected"}>

                                                                <Send className="w-3.5 h-3.5" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="w-8 h-8 text-muted-foreground hover:text-blue-500"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    openHistory(contact);
                                                                }}
                                                                title="View Message History">

                                                                <History className="w-3.5 h-3.5" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="w-8 h-8 text-muted-foreground hover:text-primary"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    startEditing(contact);
                                                                }}>

                                                                <Pencil className="w-3.5 h-3.5" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="w-8 h-8 text-muted-foreground hover:text-destructive"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setContactToDelete(contact);
                                                                    setDeleteModalOpen(true);
                                                                }}>

                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </Button>
                                                            {selectedGroupId !== 'all' &&
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="w-8 h-8 text-muted-foreground hover:text-orange-500"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleRemoveFromGroup(contact.id, selectedGroupId);
                                                                    }}
                                                                    title="Remove from this Group">

                                                                    <X className="w-3.5 h-3.5" />
                                                                </Button>
                                                            }
                                                        </div>
                                                        <p className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                            {new Date(contact.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            )
                                    }
                                </div>
                            </TabsContent>

                            <TabsContent value="groups" className="flex-1 flex flex-col m-0 p-0 border-0 outline-none">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold">Contact Groups ({groups.length})</h2>
                                    <Button size="sm" onClick={() => setIsGroupModalOpen(true)} className="gap-2">
                                        <Users className="w-4 h-4" />
                                        <span>Manage Groups</span>
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 gap-4 overflow-y-auto pr-2">
                                    {groups.length === 0 ?
                                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                                            <Users className="w-12 h-12 opacity-20" />
                                            <p>No groups found. Create one to organize your contacts.</p>
                                        </div> :

                                        groups.map((group) =>
                                            <div
                                                key={group.id}
                                                className="group p-4 rounded-md border border-border/50 bg-card hover:border-primary/30 transition-all hover:shadow-md cursor-pointer"
                                                onClick={() => {
                                                    setSelectedGroupId(group.id);
                                                    setActiveTab('contacts');
                                                }}>

                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-blue-500/10 rounded-md">
                                                            <Users className="w-5 h-5 text-blue-400" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{group.name}</h3>
                                                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{group.description || 'No description'}</p>
                                                        </div>
                                                    </div>
                                                    <Badge variant="outline" className="bg-blue-500/5 text-blue-400 border-blue-500/20">
                                                        {group._count?.contacts || 0} contacts
                                                    </Badge>
                                                </div>

                                                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 text-xs gap-1.5"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedGroupId(group.id);
                                                            setActiveTab('contacts');
                                                        }}>

                                                        <Search className="w-3.5 h-3.5" />
                                                        View Contacts
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 text-xs text-blue-500 hover:bg-blue-500/10 gap-1.5"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveGroupId(group.id);
                                                            setIsMemberSelectorOpen(true);
                                                        }}>

                                                        <UserPlus className="w-3.5 h-3.5" />
                                                        Add Members
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 text-xs text-destructive hover:bg-destructive/10 gap-1.5"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteGroup(group.id);
                                                        }}>

                                                        <Trash2 className="w-3.5 h-3.5" />
                                                        Delete
                                                    </Button>
                                                </div>
                                            </div>
                                        )
                                    }
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>

                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the contact <strong>{contactToDelete?.name}</strong>.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={deleteContact}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90">

                            Delete Contact
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Edit Contact Modal */}
            <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Contact</DialogTitle>
                        <DialogDescription>
                            Update information for <strong>{editingContact.phone}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdate} className="space-y-4 py-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-xs font-medium mb-1">Name</label>
                                <Input
                                    type="text"
                                    name="name"
                                    value={editingContact.name}
                                    onChange={handleEditChange}
                                    required
                                    placeholder="Enter contact name" />

                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Phone Number</label>
                                <Input
                                    type="tel"
                                    name="phone"
                                    value={editingContact.phone}
                                    onChange={handleEditChange}
                                    required
                                    placeholder="Enter phone number" />

                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Email (Optional)</label>
                                <Input
                                    type="email"
                                    name="email"
                                    value={editingContact.email}
                                    onChange={handleEditChange}
                                    placeholder="Enter email address" />

                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Additional Info (Optional)</label>
                                <Input
                                    type="text"
                                    name="info"
                                    value={editingContact.info}
                                    onChange={handleEditChange}
                                    placeholder="Enter notes or additional info" />

                            </div>
                        </div>
                        <DialogFooter className="mt-6">
                            <Button variant="outline" type="button" onClick={() => setEditModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Updating...' : 'Update Contact'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Bulk Tag Modal */}
            <Dialog open={tagModalOpen} onOpenChange={setTagModalOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Add Tag</DialogTitle>
                        <DialogDescription>
                            Enter a tag to add to {selectedContacts.length} selected contacts.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            placeholder="Customer, Lead, VIP..."
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleBulkTag()} />

                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setTagModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleBulkTag} disabled={loading || !tagInput}>
                            Add Tag
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Send Test Message Modal */}
            <Dialog open={sendMessageModalOpen} onOpenChange={setSendMessageModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Send className="w-5 h-5 text-emerald-500" />
                            Send Test Message
                        </DialogTitle>
                        <DialogDescription>
                            Send a direct WhatsApp message to <strong>{selectedContactForMessage?.name}</strong> ({selectedContactForMessage?.phone}).
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Message Content</label>
                            <Textarea
                                value={testMessageText}
                                onChange={(e) => setTestMessageText(e.target.value)}
                                placeholder="Type your message here..."
                                className="min-h-[120px] bg-background" />

                            <p className="text-[10px] text-muted-foreground">
                                This message will be sent immediately via your connected WhatsApp account.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSendMessageModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSendMessage}
                            disabled={sendingMessage || !testMessageText.trim()}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2">

                            {sendingMessage ?
                                <RefreshCw className="w-4 h-4 animate-spin" /> :

                                <Send className="w-4 h-4" />
                            }
                            {sendingMessage ? 'Sending...' : 'Send Message'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* History Drawer */}
            <Sheet open={historyDrawerOpen} onOpenChange={setHistoryDrawerOpen}>
                <SheetContent side="right" className="w-full sm:max-w-md bg-background border-l border-border p-0 flex flex-col">
                    <SheetHeader className="p-6 border-b border-border bg-card/50">
                        <SheetTitle className="flex items-center gap-2">
                            <History className="w-5 h-5 text-primary" />
                            Message History
                        </SheetTitle>
                        <SheetDescription>
                            Recent WhatsApp interactions with {selectedContactForHistory?.name || 'Contact'}
                        </SheetDescription>
                    </SheetHeader>

                    <ScrollArea className="flex-1">
                        <div className="p-6 h-full">
                            {historyLoading ?
                                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                                    <RefreshCw className="w-8 h-8 animate-spin" />
                                    <p>Loading history...</p>
                                </div> :
                                historyMessages.length === 0 ?
                                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                                        <History className="w-12 h-12 opacity-20" />
                                        <p>No messages found in history</p>
                                    </div> :

                                    <div className="space-y-4">
                                        {historyMessages.map((msg) =>
                                            <div
                                                key={msg.id}
                                                className={`flex flex-col ${msg.fromMe ? 'items-end' : 'items-start'}`}>

                                                <div className={`max-w-[85%] px-4 py-2 rounded-md text-xs ${msg.fromMe ?
                                                    'bg-primary text-primary-foreground rounded-tr-none' :
                                                    'bg-secondary text-secondary-foreground rounded-tl-none'}`
                                                }>
                                                    {msg.text}
                                                </div>
                                                <span className="text-[10px] text-muted-foreground mt-1 px-1">
                                                    {new Date(msg.timestamp).toLocaleString()}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                            }
                        </div>
                    </ScrollArea>
                    <div className="p-4 border-t border-border bg-card/30">
                        <Button
                            className="w-full gap-2"
                            variant="secondary"
                            onClick={() => {
                                setHistoryDrawerOpen(false);
                                setSelectedContactForMessage(selectedContactForHistory);
                                setSendMessageModalOpen(true);
                            }}
                            disabled={waStatus !== 'open'}>

                            <Send className="w-4 h-4" />
                            Send Message
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Manage Groups Dialog */}
            <Dialog open={isGroupModalOpen} onOpenChange={setIsGroupModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Manage Contact Groups</DialogTitle>
                        <DialogDescription>
                            Create and manage groups to organize your audience.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Create New Group</label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Group Name"
                                    value={newGroup.name}
                                    onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })} />

                                <Button onClick={handleCreateGroup} disabled={!newGroup.name || loading}>
                                    Create
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground text-[10px] tracking-wider">Existing Groups</label>
                            {groups.length === 0 ?
                                <p className="text-xs text-muted-foreground italic">No groups created yet.</p> :

                                <ScrollArea className="h-[200px] rounded-md border border-border p-2">
                                    {groups.map((group) =>
                                        <div key={group.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md group">
                                            <div className="flex-1">
                                                {editingGroupId === group.id ? (
                                                    <div className="flex items-center gap-2 pr-2">
                                                        <Input
                                                            value={groupEditName}
                                                            onChange={(e) => setGroupEditName(e.target.value)}
                                                            className="h-7 text-xs py-0"
                                                            autoFocus
                                                            onKeyDown={(e) => e.key === 'Enter' && handleUpdateGroup(group.id)}
                                                        />
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 text-green-500 hover:text-green-600 hover:bg-green-50"
                                                            onClick={() => handleUpdateGroup(group.id)}
                                                            disabled={loading}
                                                        >
                                                            <Check className="w-3.5 h-3.5" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 text-muted-foreground"
                                                            onClick={() => {
                                                                setEditingGroupId(null);
                                                                setGroupEditName('');
                                                            }}
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <p className="text-xs font-medium">{group.name}</p>
                                                        <p className="text-[10px] text-muted-foreground">{group._count?.contacts} contacts</p>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-0.5">
                                                {editingGroupId !== group.id && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => {
                                                            setEditingGroupId(group.id);
                                                            setGroupEditName(group.name);
                                                        }}>
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => handleDeleteGroup(group.id)}>
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </ScrollArea>
                            }
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Add to Group Dialog */}
            <Dialog open={isAddingToGroupModalOpen} onOpenChange={setIsAddingToGroupModalOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Add to Group</DialogTitle>
                        <DialogDescription>
                            Select a group to add {selectedContacts.length} selected contacts.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        {groups.length === 0 ?
                            <div className="text-center py-4">
                                <p className="text-xs text-muted-foreground mb-4">You haven't created any groups yet.</p>
                                <Button variant="outline" onClick={() => {
                                    setIsAddingToGroupModalOpen(false);
                                    setIsGroupModalOpen(true);
                                }}>
                                    Create a Group First
                                </Button>
                            </div> :

                            <ScrollArea className="h-[250px] pr-4">
                                <div className="space-y-2">
                                    {groups.map((group) =>
                                        <Button
                                            key={group.id}
                                            variant="outline"
                                            className="w-full justify-start h-12 text-left px-4 hover:border-blue-500/50 hover:bg-blue-500/5"
                                            onClick={() => handleAddToGroup(group.id)}
                                            disabled={loading}>

                                            <div className="flex items-center gap-3 w-full">
                                                <div className="bg-blue-500/10 p-2 rounded">
                                                    <Users className="w-4 h-4 text-blue-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-sm font-medium">{group.name}</div>
                                                    <div className="text-[10px] text-muted-foreground">{group._count?.contacts} contacts</div>
                                                </div>
                                            </div>
                                        </Button>
                                    )}
                                </div>
                            </ScrollArea>
                        }
                    </div>
                </DialogContent>
            </Dialog>
            {/* Add Members (to Group) Dialog */}
            <Dialog open={isMemberSelectorOpen} onOpenChange={setIsMemberSelectorOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Members to Group</DialogTitle>
                        <DialogDescription>
                            Select contacts to add to <strong>{groups.find((g) => g.id === activeGroupId)?.name}</strong>.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search contacts..."
                                className="pl-9"
                                value={memberSearchQuery}
                                onChange={(e) => setMemberSearchQuery(e.target.value)} />

                        </div>

                        <ScrollArea className="h-[300px] pr-4 border rounded-md p-2">
                            <div className="space-y-2">
                                {contacts.
                                    filter((c) =>
                                        !(c.groups || []).some((g) => g.id === activeGroupId) && (
                                            c.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) || c.phone.includes(memberSearchQuery))
                                    ).
                                    map((contact) =>
                                        <div key={contact.id} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-md">
                                            <Checkbox
                                                checked={selectedMemberIds.includes(contact.id)}
                                                onCheckedChange={() => {
                                                    setSelectedMemberIds((prev) =>
                                                        prev.includes(contact.id) ? prev.filter((id) => id !== contact.id) : [...prev, contact.id]
                                                    );
                                                }} />

                                            <div className="flex-1">
                                                <p className="text-xs font-medium">{contact.name}</p>
                                                <p className="text-xs text-muted-foreground">{contact.phone}</p>
                                            </div>
                                        </div>
                                    )}
                            </div>
                        </ScrollArea>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setIsMemberSelectorOpen(false);
                            setSelectedMemberIds([]);
                        }}>
                            Cancel
                        </Button>
                        <Button
                            onClick={async () => {
                                if (selectedMemberIds.length === 0) return;
                                setLoading(true);
                                try {
                                    const res = await fetch(`/api/wa/groups/${activeGroupId}/contacts`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ contactIds: selectedMemberIds })
                                    });
                                    if (res.ok) {
                                        await fetchContacts();
                                        await fetchGroups();
                                        setIsMemberSelectorOpen(false);
                                        setSelectedMemberIds([]);
                                        toast({ title: "Members Added", description: `Successfully added ${selectedMemberIds.length} contacts to the group.` });
                                    }
                                } catch (error) {
                                    console.error('Error adding members:', error);
                                } finally {
                                    setLoading(false);
                                }
                            }}
                            disabled={loading || selectedMemberIds.length === 0}>

                            {loading ? 'Adding...' : `Add ${selectedMemberIds.length} Contacts`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>);

}