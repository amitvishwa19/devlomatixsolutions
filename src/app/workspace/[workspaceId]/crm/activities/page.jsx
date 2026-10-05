'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Activity,
    MessageCircle,
    Phone,
    Calendar,
    FileText,
    TrendingUp,
    Users,
    Building2,
    Search,
    Filter,
    Plus,
    Trash2,
    RefreshCw,
    Loader2,
    Sparkles,
    Briefcase,
    Clock,
    User
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

import { getActivitiesAction, createActivityAction, deleteActivityAction } from '../_actions/activity-actions';
import { getCrmContactsAction } from '../_actions/contact-actions';
import { getAccountsAction } from '../_actions/account-actions';

export default function UniversalActivitiesPage() {
    const params = useParams();
    const router = useRouter();
    const workspaceId = params?.workspaceId;

    const [activities, setActivities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');

    // Quick Activity Logger
    const [activityType, setActivityType] = useState('NOTE');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedContactId, setSelectedContactId] = useState('');
    const [selectedAccountId, setSelectedAccountId] = useState('');
    const [isLogging, setIsLogging] = useState(false);

    // Dropdown Data
    const [contacts, setContacts] = useState([]);
    const [accounts, setAccounts] = useState([]);

    const loadActivities = async (showToast = false) => {
        if (!workspaceId) return;
        try {
            if (showToast) setIsRefreshing(true);
            else setIsLoading(true);

            const res = await getActivitiesAction(workspaceId, {
                type: typeFilter === 'ALL' ? undefined : typeFilter,
                limit: 100
            });

            if (res.success) {
                setActivities(res.data);
            } else {
                toast.error(res.error || "Failed to load activities");
            }

            if (showToast) toast.success("Timeline refreshed");
        } catch (error) {
            console.error("Load activities error:", error);
            toast.error("Error loading activities");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadActivities();
    }, [workspaceId, typeFilter]);

    useEffect(() => {
        async function fetchDropdowns() {
            if (!workspaceId) return;
            try {
                const [cRes, aRes] = await Promise.all([
                    getCrmContactsAction(workspaceId),
                    getAccountsAction(workspaceId)
                ]);
                if (cRes.success) setContacts(cRes.data);
                if (aRes.success) setAccounts(aRes.data);
            } catch (e) {
                console.error("Failed to load contacts/accounts for activity logger:", e);
            }
        }
        fetchDropdowns();
    }, [workspaceId]);

    const filteredActivities = useMemo(() => {
        if (!searchQuery.trim()) return activities;
        const q = searchQuery.toLowerCase();
        return activities.filter(act =>
            act.title.toLowerCase().includes(q) ||
            act.description?.toLowerCase().includes(q) ||
            act.contact?.name?.toLowerCase().includes(q) ||
            act.account?.name?.toLowerCase().includes(q) ||
            act.deal?.title?.toLowerCase().includes(q)
        );
    }, [activities, searchQuery]);

    // Metrics computation
    const metrics = useMemo(() => {
        const total = activities.length;
        const notes = activities.filter(a => a.type === 'NOTE').length;
        const calls = activities.filter(a => a.type === 'CALL').length;
        const meetings = activities.filter(a => a.type === 'MEETING').length;
        const whatsapp = activities.filter(a => a.type === 'WHATSAPP_MSG').length;

        return { total, notes, calls, meetings, whatsapp };
    }, [activities]);

    const handleCreateActivity = async (e) => {
        e.preventDefault();
        if (!title.trim()) {
            toast.error("Please enter an activity title");
            return;
        }

        setIsLogging(true);
        try {
            const res = await createActivityAction(workspaceId, {
                type: activityType,
                title: title.trim(),
                description: description.trim() || undefined,
                contactId: selectedContactId && selectedContactId !== 'NONE' ? selectedContactId : undefined,
                accountId: selectedAccountId && selectedAccountId !== 'NONE' ? selectedAccountId : undefined
            });

            if (res.success) {
                toast.success("Activity logged to CRM timeline");
                setTitle('');
                setDescription('');
                setSelectedContactId('');
                setSelectedAccountId('');
                loadActivities(true);
            } else {
                toast.error(res.error || "Failed to log activity");
            }
        } catch (error) {
            toast.error("Error logging activity");
        } finally {
            setIsLogging(false);
        }
    };

    const handleDeleteActivity = async (activityId) => {
        if (!confirm("Are you sure you want to remove this activity entry?")) return;

        try {
            const res = await deleteActivityAction(workspaceId, activityId);
            if (res.success) {
                toast.success("Activity removed");
                loadActivities();
            } else {
                toast.error(res.error || "Failed to delete activity");
            }
        } catch (error) {
            toast.error("Error deleting activity");
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-background p-4 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        <Activity className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl lg:text-2xl font-black tracking-tight text-foreground">
                            Universal Activity Stream
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            Multi-channel timeline tracking WhatsApp outreach, client calls, notes, and deal progressions.
                        </p>
                    </div>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-1.5 text-xs font-semibold"
                    onClick={() => loadActivities(true)}
                    disabled={isRefreshing}
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span>Refresh Timeline</span>
                </Button>
            </div>

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-sm space-y-1">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Events</p>
                    <p className="text-2xl font-black text-foreground">{metrics.total}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Logged interactions</p>
                </div>
                <div className="p-4 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-sm space-y-1">
                    <p className="text-[11px] font-semibold text-emerald-500 uppercase tracking-wider">WhatsApp Sent</p>
                    <p className="text-2xl font-black text-foreground">{metrics.whatsapp}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Outreach via KonnectX</p>
                </div>
                <div className="p-4 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-sm space-y-1">
                    <p className="text-[11px] font-semibold text-blue-500 uppercase tracking-wider">Calls & Meetings</p>
                    <p className="text-2xl font-black text-foreground">{metrics.calls + metrics.meetings}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Client touchpoints</p>
                </div>
                <div className="p-4 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-sm space-y-1">
                    <p className="text-[11px] font-semibold text-purple-500 uppercase tracking-wider">Internal Notes</p>
                    <p className="text-2xl font-black text-foreground">{metrics.notes}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Strategy & briefing notes</p>
                </div>
            </div>

            {/* Quick Activity Logger Card */}
            <div className="p-5 rounded-3xl bg-card border border-border/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Plus className="w-4 h-4 text-primary" />
                        <span>Log New Activity or Touchpoint</span>
                    </h3>
                    <div className="flex items-center gap-1">
                        {['NOTE', 'CALL', 'MEETING'].map(t => (
                            <Button
                                key={t}
                                type="button"
                                size="sm"
                                variant={activityType === t ? 'default' : 'ghost'}
                                className="h-6 text-[10px] px-2 font-bold"
                                onClick={() => setActivityType(t)}
                            >
                                {t}
                            </Button>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleCreateActivity} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Input
                            placeholder="Activity title or meeting subject..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="h-9 text-xs bg-background"
                            required
                        />

                        {/* Contact selector */}
                        <Select value={selectedContactId} onValueChange={setSelectedContactId}>
                            <SelectTrigger className="h-9 text-xs bg-background">
                                <SelectValue placeholder="Link Contact (Optional)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="NONE">— No Contact —</SelectItem>
                                {contacts.map(c => (
                                    <SelectItem key={c.id} value={c.id}>
                                        {c.name} ({c.phone})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Account selector */}
                        <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                            <SelectTrigger className="h-9 text-xs bg-background">
                                <SelectValue placeholder="Link Organization (Optional)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="NONE">— No Organization —</SelectItem>
                                {accounts.map(a => (
                                    <SelectItem key={a.id} value={a.id}>
                                        {a.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Textarea
                        placeholder="Detailed notes, discussion topics, next steps..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={2}
                        className="text-xs bg-background resize-none"
                    />

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            size="sm"
                            disabled={isLogging || !title.trim()}
                            className="h-8 text-xs font-semibold gap-1.5"
                        >
                            {isLogging ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                            Log to CRM
                        </Button>
                    </div>
                </form>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-card border border-border/70">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search timeline notes, contacts, companies..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-9 text-xs bg-background border-border/80"
                    />
                </div>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="h-9 w-[160px] text-xs bg-background border-border/80">
                        <SelectValue placeholder="Filter Activity" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Event Types</SelectItem>
                        <SelectItem value="NOTE">Internal Notes</SelectItem>
                        <SelectItem value="CALL">Phone Calls</SelectItem>
                        <SelectItem value="MEETING">Meetings</SelectItem>
                        <SelectItem value="WHATSAPP_MSG">WhatsApp Outreach</SelectItem>
                        <SelectItem value="DEAL_STAGE_CHANGE">Stage Changes</SelectItem>
                        <SelectItem value="ATS_INTERVIEW">ATS Candidate Events</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Timeline Stream */}
            <div className="space-y-3">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-xs font-semibold text-muted-foreground">Loading activity stream...</p>
                    </div>
                ) : filteredActivities.length === 0 ? (
                    <div className="p-16 text-center text-xs text-muted-foreground border border-dashed border-border rounded-3xl">
                        No activities logged matching the criteria.
                    </div>
                ) : (
                    filteredActivities.map((act) => (
                        <div
                            key={act.id}
                            className="p-4 rounded-2xl bg-card border border-border/70 hover:border-border transition-colors flex items-start justify-between gap-4 text-xs group"
                        >
                            <div className="flex items-start gap-3 min-w-0">
                                <div className="p-2.5 rounded-xl bg-muted text-muted-foreground shrink-0 mt-0.5">
                                    {act.type === 'WHATSAPP_MSG' ? <MessageCircle className="w-4 h-4 text-emerald-500" /> :
                                     act.type === 'CALL' ? <Phone className="w-4 h-4 text-blue-500" /> :
                                     act.type === 'MEETING' ? <Calendar className="w-4 h-4 text-purple-500" /> :
                                     act.type === 'DEAL_STAGE_CHANGE' ? <TrendingUp className="w-4 h-4 text-amber-500" /> :
                                     act.type === 'ATS_INTERVIEW' ? <Briefcase className="w-4 h-4 text-indigo-500" /> :
                                     <FileText className="w-4 h-4 text-primary" />}
                                </div>

                                <div className="space-y-1.5 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-bold text-foreground text-sm">{act.title}</span>
                                        <Badge variant="outline" className="text-[10px] font-semibold">
                                            {act.type}
                                        </Badge>
                                    </div>

                                    {act.description && (
                                        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                            {act.description}
                                        </p>
                                    )}

                                    {/* Linkage Badges */}
                                    <div className="flex items-center gap-2 pt-1 flex-wrap text-[11px]">
                                        {act.contact && (
                                            <Link
                                                href={`/workspace/${workspaceId}/crm/contacts/${act.contact.id}`}
                                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary text-primary hover:underline font-semibold"
                                            >
                                                <User className="w-3 h-3" />
                                                {act.contact.name || act.contact.phone}
                                            </Link>
                                        )}
                                        {act.account && (
                                            <Link
                                                href={`/workspace/${workspaceId}/crm/accounts/${act.account.id}`}
                                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary text-foreground hover:underline font-semibold"
                                            >
                                                <Building2 className="w-3 h-3" />
                                                {act.account.name}
                                            </Link>
                                        )}
                                        {act.deal && (
                                            <Link
                                                href={`/workspace/${workspaceId}/crm/pipeline`}
                                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary text-foreground hover:underline font-semibold"
                                            >
                                                <TrendingUp className="w-3 h-3" />
                                                {act.deal.title}
                                            </Link>
                                        )}
                                        {act.user && (
                                            <span className="text-muted-foreground/70">
                                                Logged by {act.user.displayName || 'CRM User'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                    {new Date(act.createdAt).toLocaleString()}
                                </span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => handleDeleteActivity(act.id)}
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
