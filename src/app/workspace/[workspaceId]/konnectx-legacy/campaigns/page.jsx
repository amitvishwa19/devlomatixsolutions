'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Megaphone,
    Plus,
    Play,
    Pause,
    Search,
    Users,
    CheckCircle2,
    Clock,
    Trash2,
    ShieldAlert,
    Sparkles,
    Loader2,
    Zap,
    Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
    getKonnectCampaignsAction,
    createKonnectCampaignAction,
    triggerKonnectCampaignAction,
    deleteKonnectCampaignAction
} from '../_actions/campaigns-actions';
import { getKonnectContactsAction } from '../_actions/contacts-actions';

export default function KonnectCampaignsPage() {
    const params = useParams();
    const router = useRouter();
    const workspaceId = params.workspaceId;

    const [campaigns, setCampaigns] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    // Create Modal
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [triggeringId, setTriggeringId] = useState(null);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [messageText, setMessageText] = useState('');
    const [customNumbers, setCustomNumbers] = useState('');
    const [selectedTag, setSelectedTag] = useState('');

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [cRes, contRes] = await Promise.all([
                getKonnectCampaignsAction(workspaceId),
                getKonnectContactsAction(workspaceId)
            ]);
            if (cRes.success) setCampaigns(cRes.campaigns);
            if (contRes.success) setContacts(contRes.contacts);
        } catch (e) {
            toast.error("Failed to load campaigns");
        } finally {
            setLoading(false);
        }
    }, [workspaceId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleCreateCampaign = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            // Gather recipients
            let phones = [];
            if (selectedTag) {
                const tagContacts = contacts.filter(c => Array.isArray(c.tags) && c.tags.includes(selectedTag));
                phones.push(...tagContacts.map(c => c.phone));
            }
            if (customNumbers.trim()) {
                const lines = customNumbers.split(/[\n,]+/).map(n => n.trim()).filter(Boolean);
                phones.push(...lines);
            }

            if (phones.length === 0) {
                toast.error("Please select a tag or enter at least one phone number");
                setCreating(false);
                return;
            }

            const res = await createKonnectCampaignAction(workspaceId, {
                name,
                description,
                messageText,
                recipientPhones: phones
            });

            if (res.success) {
                toast.success("Broadcast campaign created!");
                setIsCreateOpen(false);
                setName('');
                setDescription('');
                setMessageText('');
                setCustomNumbers('');
                setSelectedTag('');
                loadData();
            } else {
                toast.error(res.error || "Failed to create campaign");
            }
        } catch (err) {
            toast.error("Error creating campaign");
        } finally {
            setCreating(false);
        }
    };

    const handleStartCampaign = async (campaignId) => {
        setTriggeringId(campaignId);
        try {
            const res = await triggerKonnectCampaignAction(workspaceId, campaignId);
            if (res.success) {
                toast.success("Campaign broadcast initiated!");
                loadData();
            } else {
                toast.error(res.error || "Failed to start campaign");
            }
        } catch (e) {
            toast.error("Error starting campaign");
        } finally {
            setTriggeringId(null);
        }
    };

    const handleDelete = async (campaignId) => {
        if (!confirm("Are you sure you want to delete this broadcast campaign?")) return;
        try {
            const res = await deleteKonnectCampaignAction(workspaceId, campaignId);
            if (res.success) {
                toast.success("Campaign deleted");
                setCampaigns(prev => prev.filter(c => c.id !== campaignId));
            } else {
                toast.error(res.error || "Failed to delete");
            }
        } catch (e) {
            toast.error("Error deleting campaign");
        }
    };

    const filtered = campaigns.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                              c.description?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const allTags = Array.from(new Set(contacts.flatMap(c => Array.isArray(c.tags) ? c.tags : [])));

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <Megaphone className="h-5 w-5 text-emerald-500" />
                        Broadcast Campaigns
                    </h1>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        High-volume WhatsApp marketing broadcasts without Meta approval fees. Built-in smart anti-ban pacing.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        onClick={() => setIsCreateOpen(true)}
                        className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Create Broadcast</span>
                    </Button>
                </div>
            </div>

            {/* Anti-Ban & Protocol Notice */}
            <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 flex items-start gap-3">
                <ShieldAlert className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground leading-relaxed">
                    <span className="font-semibold text-foreground">Legacy Engine Advantage: </span>
                    Messages are delivered directly through your linked WhatsApp multi-device session with <span className="text-emerald-500 font-medium">zero template restrictions</span> and <span className="text-emerald-500 font-medium">zero per-message charges</span>. Messages are spaced with 3-6s anti-ban jitter to ensure phone safety.
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                        placeholder="Search campaigns..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8 h-8 text-xs bg-card/40 border-border/40"
                    />
                </div>
                <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto scrollbar-none py-1">
                    {['ALL', 'DRAFT', 'IN_PROGRESS', 'COMPLETED'].map((st) => (
                        <Button
                            key={st}
                            size="sm"
                            variant={statusFilter === st ? 'default' : 'outline'}
                            onClick={() => setStatusFilter(st)}
                            className="h-7 text-[11px] px-2.5"
                        >
                            {st === 'ALL' ? 'All' : st.replace('_', ' ')}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Campaign Cards List (adhering to list items / campaign card coding style in AGENTS.md) */}
            <div className="space-y-3">
                {loading ? (
                    <div className="py-12 text-center text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-500" />
                        Loading campaigns...
                    </div>
                ) : filtered.length === 0 ? (
                    <Card className="bg-card/40 border-border/40 p-8 text-center text-muted-foreground">
                        <Megaphone className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                        <p className="text-sm font-medium text-foreground">No broadcast campaigns found</p>
                        <p className="text-xs mt-1">Create your first WhatsApp blast to start messaging your audience.</p>
                    </Card>
                ) : (
                    filtered.map((c) => {
                        const isTriggering = triggeringId === c.id;
                        return (
                            <Card
                                key={c.id}
                                className="bg-card/40 border-border/40 backdrop-blur-sm p-3.5 rounded-[16px] hover:border-border transition-all"
                            >
                                <div className="flex flex-row items-center gap-3">
                                    {/* Left content flex-1 */}
                                    <div className="flex-1 space-y-2">
                                        {/* Row 1: campaign title */}
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-sm text-foreground">{c.name}</h3>
                                            <span className="text-[11px] text-muted-foreground font-mono">
                                                {c.stats.sent} / {c.stats.total} sent
                                            </span>
                                        </div>

                                        {/* Row 2 (below): status badge + action (Start for DRAFT/PAUSED) */}
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant="outline"
                                                className={`text-[10px] px-1.5 py-0 font-medium ${
                                                    c.status === 'COMPLETED'
                                                        ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/5'
                                                        : c.status === 'IN_PROGRESS'
                                                        ? 'border-blue-500/30 text-blue-500 bg-blue-500/5'
                                                        : 'border-amber-500/30 text-amber-500 bg-amber-500/5'
                                                }`}
                                            >
                                                {c.status}
                                            </Badge>

                                            {(c.status === 'DRAFT' || c.status === 'PAUSED') && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    disabled={isTriggering}
                                                    onClick={() => handleStartCampaign(c.id)}
                                                    className="h-6 px-2 text-[11px] gap-1 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10"
                                                >
                                                    {isTriggering ? (
                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                    ) : (
                                                        <Play className="h-3 w-3 fill-current" />
                                                    )}
                                                    <span>Start Broadcast</span>
                                                </Button>
                                            )}

                                            {c.description && (
                                                <span className="text-[11px] text-muted-foreground truncate hidden sm:inline">
                                                    — {c.description}
                                                </span>
                                            )}
                                        </div>

                                        {/* Row 3 (below): progress bar */}
                                        <div className="w-full bg-muted/60 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                                                style={{ width: `${c.stats.progress}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Delete icon is standalone on the right edge, not in the bottom action row */}
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleDelete(c.id)}
                                        className="h-8 w-8 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 flex-shrink-0"
                                        title="Delete Campaign"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </Card>
                        );
                    })
                )}
            </div>

            {/* Create Campaign Modal */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-sm font-semibold flex items-center gap-2">
                            <Megaphone className="h-4 w-4 text-emerald-500" />
                            New Broadcast Campaign (Zero Meta Approval)
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateCampaign} className="space-y-3 py-2">
                        <div className="space-y-1">
                            <Label className="text-xs">Campaign Title</Label>
                            <Input
                                placeholder="e.g. October Product Launch Announcement"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="h-8 text-xs"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Description (Optional)</Label>
                            <Input
                                placeholder="Target audience or purpose..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="h-8 text-xs"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">WhatsApp Message Content</Label>
                            <Textarea
                                placeholder="Hi there! 👋 Check out our brand new features at devlomatix.com..."
                                rows={4}
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                required
                                className="text-xs"
                            />
                            <p className="text-[10px] text-muted-foreground">
                                Plain text, emojis, and links are supported without Meta template approval.
                            </p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Target Contact Tag (Optional)</Label>
                            <select
                                value={selectedTag}
                                onChange={(e) => setSelectedTag(e.target.value)}
                                className="w-full h-8 text-xs rounded-md border border-input bg-background px-2"
                            >
                                <option value="">-- None / Select from contacts --</option>
                                {allTags.map(tag => (
                                    <option key={tag} value={tag}>Tag: {tag}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Direct Recipient Numbers (Optional / Paste)</Label>
                            <Textarea
                                placeholder={"919876543210\n15551234567"}
                                rows={2}
                                value={customNumbers}
                                onChange={(e) => setCustomNumbers(e.target.value)}
                                className="text-xs font-mono"
                            />
                        </div>
                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setIsCreateOpen(false)}
                                className="h-8 text-xs"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={creating}
                                className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                                Save Campaign
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
