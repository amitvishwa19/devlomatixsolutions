'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Users,
    Search,
    UserPlus,
    RefreshCw,
    Download,
    Upload,
    MessageSquare,
    Trash2,
    Edit,
    Smartphone,
    Tag,
    Check,
    Loader2,
    Filter,
    Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
    getKonnectContactsAction,
    saveKonnectContactAction,
    deleteKonnectContactAction,
    syncWhatsAppContactsAction,
    importKonnectContactsAction
} from '../_actions/contacts-actions';

export default function KonnectContactsPage() {
    const params = useParams();
    const router = useRouter();
    const workspaceId = params.workspaceId;

    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedTag, setSelectedTag] = useState('ALL');

    // Modals
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [importing, setImporting] = useState(false);

    // Form state
    const [editContact, setEditContact] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        tags: '',
        info: ''
    });

    const [importText, setImportText] = useState('');

    const loadContacts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getKonnectContactsAction(workspaceId, { search });
            if (res.success) {
                setContacts(res.contacts);
            } else {
                toast.error(res.error || "Failed to load contacts");
            }
        } catch (e) {
            toast.error("Network error loading contacts");
        } finally {
            setLoading(false);
        }
    }, [workspaceId, search]);

    useEffect(() => {
        loadContacts();
    }, [loadContacts]);

    const handleOpenAdd = (contact = null) => {
        if (contact) {
            setEditContact(contact);
            setFormData({
                name: contact.name || '',
                phone: contact.phone || '',
                email: contact.email || '',
                tags: Array.isArray(contact.tags) ? contact.tags.join(', ') : '',
                info: contact.info || ''
            });
        } else {
            setEditContact(null);
            setFormData({
                name: '',
                phone: '',
                email: '',
                tags: 'Customer',
                info: ''
            });
        }
        setIsAddOpen(true);
    };

    const handleSaveContact = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                id: editContact?.id,
                name: formData.name,
                phone: formData.phone,
                email: formData.email,
                tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
                info: formData.info
            };

            const res = await saveKonnectContactAction(workspaceId, payload);
            if (res.success) {
                toast.success(editContact ? "Contact updated" : "Contact added");
                setIsAddOpen(false);
                loadContacts();
            } else {
                toast.error(res.error || "Failed to save contact");
            }
        } catch (err) {
            toast.error("Error saving contact");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (contactId) => {
        if (!confirm("Are you sure you want to delete this contact?")) return;
        try {
            const res = await deleteKonnectContactAction(workspaceId, contactId);
            if (res.success) {
                toast.success("Contact deleted");
                setContacts(prev => prev.filter(c => c.id !== contactId));
            } else {
                toast.error(res.error || "Failed to delete");
            }
        } catch (e) {
            toast.error("Delete failed");
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            const res = await syncWhatsAppContactsAction(workspaceId);
            if (res.success) {
                toast.success(`Synced ${res.syncedCount} contacts from WhatsApp phone chats!`);
                loadContacts();
            } else {
                toast.error(res.error || "WhatsApp sync failed");
            }
        } catch (e) {
            toast.error("Sync error");
        } finally {
            setSyncing(false);
        }
    };

    const handleImportCsv = async () => {
        if (!importText.trim()) {
            toast.error("Please paste CSV data or phone numbers");
            return;
        }
        setImporting(true);
        try {
            const lines = importText.split('\n').map(l => l.trim()).filter(Boolean);
            const parsed = lines.map(line => {
                const parts = line.split(',');
                return {
                    phone: parts[0]?.trim(),
                    name: parts[1]?.trim() || '',
                    email: parts[2]?.trim() || '',
                    tags: parts[3]?.trim() ? [parts[3].trim()] : ['Imported']
                };
            });

            const res = await importKonnectContactsAction(workspaceId, parsed);
            if (res.success) {
                toast.success(`Imported ${res.createdCount} contacts (skipped ${res.skippedCount})`);
                setIsImportOpen(false);
                setImportText('');
                loadContacts();
            } else {
                toast.error(res.error || "Import failed");
            }
        } catch (e) {
            toast.error("Error parsing import data");
        } finally {
            setImporting(false);
        }
    };

    const filteredContacts = contacts.filter(c => {
        if (selectedTag === 'ALL') return true;
        return Array.isArray(c.tags) && c.tags.includes(selectedTag);
    });

    // Unique tags
    const allTags = Array.from(new Set(contacts.flatMap(c => Array.isArray(c.tags) ? c.tags : [])));

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <Users className="h-5 w-5 text-emerald-500" />
                        Contacts Phonebook
                    </h1>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Manage your broadcast audience, tags, and phone-synced WhatsApp conversations.
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSync}
                        disabled={syncing}
                        className="h-8 text-xs gap-1.5 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />
                        <span>Sync Phone Chats</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsImportOpen(true)}
                        className="h-8 text-xs gap-1.5"
                    >
                        <Upload className="h-3.5 w-3.5" />
                        <span>Import CSV</span>
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => handleOpenAdd()}
                        className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                        <UserPlus className="h-3.5 w-3.5" />
                        <span>Add Contact</span>
                    </Button>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card className="bg-card/40 border-border/40 backdrop-blur-sm">
                    <CardContent className="p-3.5">
                        <p className="text-[11px] font-medium text-muted-foreground">Total Contacts</p>
                        <p className="text-lg font-bold text-foreground mt-1">{contacts.length}</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/40 border-border/40 backdrop-blur-sm">
                    <CardContent className="p-3.5">
                        <p className="text-[11px] font-medium text-muted-foreground">WhatsApp Synced</p>
                        <p className="text-lg font-bold text-emerald-500 mt-1">
                            {contacts.filter(c => c.tags?.includes('WhatsApp Sync')).length}
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-card/40 border-border/40 backdrop-blur-sm">
                    <CardContent className="p-3.5">
                        <p className="text-[11px] font-medium text-muted-foreground">Active Tags</p>
                        <p className="text-lg font-bold text-blue-500 mt-1">{allTags.length}</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/40 border-border/40 backdrop-blur-sm">
                    <CardContent className="p-3.5">
                        <p className="text-[11px] font-medium text-muted-foreground">Messaging Ready</p>
                        <p className="text-lg font-bold text-indigo-500 mt-1">100%</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, phone number, or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8 h-8 text-xs bg-card/40 border-border/40"
                    />
                </div>
                {allTags.length > 0 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none py-1">
                        <Button
                            size="sm"
                            variant={selectedTag === 'ALL' ? 'default' : 'outline'}
                            onClick={() => setSelectedTag('ALL')}
                            className="h-7 text-[11px] px-2.5"
                        >
                            All
                        </Button>
                        {allTags.map(tag => (
                            <Button
                                key={tag}
                                size="sm"
                                variant={selectedTag === tag ? 'default' : 'outline'}
                                onClick={() => setSelectedTag(tag)}
                                className="h-7 text-[11px] px-2.5"
                            >
                                {tag}
                            </Button>
                        ))}
                    </div>
                )}
            </div>

            {/* Contacts Table */}
            <Card className="bg-card/40 border-border/40 backdrop-blur-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                        <thead className="bg-muted/40 text-muted-foreground border-b border-border/40 font-medium">
                            <tr>
                                <th className="px-3 py-2.5">Contact Name</th>
                                <th className="px-3 py-2.5">Phone Number</th>
                                <th className="px-3 py-2.5">Email</th>
                                <th className="px-3 py-2.5">Tags</th>
                                <th className="px-3 py-2.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                                        <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-emerald-500" />
                                        Loading contacts...
                                    </td>
                                </tr>
                            ) : filteredContacts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                                        No contacts found. Click "Add Contact" or "Sync Phone Chats" to populate your phonebook.
                                    </td>
                                </tr>
                            ) : (
                                filteredContacts.map((contact) => (
                                    <tr key={contact.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-3 py-2.5 font-medium text-foreground flex items-center gap-2">
                                            <div className="h-7 w-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-xs">
                                                {contact.name?.charAt(0)?.toUpperCase() || 'W'}
                                            </div>
                                            <div>
                                                <span>{contact.name || `+${contact.phone}`}</span>
                                                {contact.whatsappName && (
                                                    <span className="block text-[10px] text-muted-foreground">
                                                        WA: ~{contact.whatsappName}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-3 py-2.5 font-mono text-[11px]">
                                            +{contact.phone}
                                        </td>
                                        <td className="px-3 py-2.5 text-muted-foreground">
                                            {contact.email || '—'}
                                        </td>
                                        <td className="px-3 py-2.5">
                                            <div className="flex items-center gap-1 flex-wrap">
                                                {Array.isArray(contact.tags) && contact.tags.map((t, idx) => (
                                                    <Badge
                                                        key={idx}
                                                        variant="secondary"
                                                        className="text-[10px] px-1.5 py-0 border-border/40 font-normal"
                                                    >
                                                        {t}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-3 py-2.5 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => router.push(`/workspace/${workspaceId}/konnectx-legacy/chats?jid=${contact.phone}@s.whatsapp.net`)}
                                                    className="h-7 w-7 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                                                    title="Chat on WhatsApp"
                                                >
                                                    <MessageSquare className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => handleOpenAdd(contact)}
                                                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                                    title="Edit Contact"
                                                >
                                                    <Edit className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => handleDelete(contact.id)}
                                                    className="h-7 w-7 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Add / Edit Contact Modal */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-sm font-semibold">
                            {editContact ? "Edit Contact" : "Add New WhatsApp Contact"}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSaveContact} className="space-y-3 py-2">
                        <div className="space-y-1">
                            <Label className="text-xs">Full Name</Label>
                            <Input
                                placeholder="e.g. John Doe"
                                value={formData.name}
                                onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                                className="h-8 text-xs"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Phone Number (with Country Code)</Label>
                            <Input
                                placeholder="e.g. 15551234567 or 919876543210"
                                value={formData.phone}
                                onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                                required
                                className="h-8 text-xs font-mono"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Email (Optional)</Label>
                            <Input
                                type="email"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                                className="h-8 text-xs"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Tags (comma separated)</Label>
                            <Input
                                placeholder="Customer, VIP, Lead"
                                value={formData.tags}
                                onChange={(e) => setFormData(p => ({ ...p, tags: e.target.value }))}
                                className="h-8 text-xs"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Notes / Info</Label>
                            <Input
                                placeholder="Additional details..."
                                value={formData.info}
                                onChange={(e) => setFormData(p => ({ ...p, info: e.target.value }))}
                                className="h-8 text-xs"
                            />
                        </div>
                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setIsAddOpen(false)}
                                className="h-8 text-xs"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={saving}
                                className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                                Save Contact
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* CSV Import Modal */}
            <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-sm font-semibold flex items-center gap-2">
                            <Upload className="h-4 w-4 text-emerald-500" />
                            Bulk Import Contacts
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        <p className="text-xs text-muted-foreground">
                            Paste comma-separated rows in format: <code className="bg-muted px-1 py-0.5 rounded text-[11px]">phone, name, email, tag</code> (one contact per line).
                        </p>
                        <Textarea
                            placeholder={"919876543210, Alice Smith, alice@example.com, VIP\n15559876543, Bob Jones, bob@example.com, Lead"}
                            rows={7}
                            value={importText}
                            onChange={(e) => setImportText(e.target.value)}
                            className="text-xs font-mono"
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setIsImportOpen(false)}
                            className="h-8 text-xs"
                        >
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleImportCsv}
                            disabled={importing}
                            className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            {importing ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                            Import Contacts
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
