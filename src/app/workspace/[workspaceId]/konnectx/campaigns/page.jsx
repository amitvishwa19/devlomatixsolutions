"use client";

import React, { useState, useRef } from 'react';
import {
    Megaphone,
    Plus,
    Play,
    Pause,
    Search,
    Calendar,
    Users,
    CheckCircle2,
    Clock,

    Edit,
    Trash,
    BarChart3,
    Copy,
    FolderOpen,
    Tags,
    RotateCcw
} from
    'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from
    "@/components/ui/select";
import { useSession } from "next-auth/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

import { useAction } from "@/hooks/use-action";
import { getCampaigns } from "./_actions/get-campaigns";
import { getCampaignDetails } from "./_actions/get-campaign-details";
import { saveCampaign } from "./_actions/save-campaign";
import { deleteCampaign } from "./_actions/delete-campaign";
import { triggerCampaign } from "./_actions/trigger-campaign";
import { resetCampaign } from "./_actions/reset-campaign";
import { getTemplates } from "../template/_actions/get-templates";
import { getContacts } from "../contacts/_actions/get-contacts";
import { getGroups } from "../contacts/_actions/get-groups";
import { getCategories } from "../contacts/_actions/get-categories";
import { useParams } from "next/navigation";
import NewCampaignSheet from "./_cpmponents/NewCampaignSheet";
import DeleteCampaignDialog from "./_cpmponents/DeleteCampaignDialog";
import AccountSwitcher from '../_components/AccountSwitcher';

export default function CampaignsPage() {
    const params = useParams();
    const workspaceId = params.workspaceId;
    const { data: session } = useSession();
    const userId = session?.user?.userId || session?.user?.id;
    const [campaigns, setCampaigns] = useState([]);
    const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [templates, setTemplates] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [groups, setGroups] = useState([]);
    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);
    const [selectedGroupIds, setSelectedGroupIds] = useState([]);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
    const [selectedTagIds, setSelectedTagIds] = useState([]);
    const [selectedContactCatNames, setSelectedContactCatNames] = useState([]);
    const [selectedContactTagNames, setSelectedContactTagNames] = useState([]);
    const contactCategoryNames = [...new Set(contacts.map(c => c.category).filter(Boolean))].sort();
    const contactTagNames = [...new Set(contacts.flatMap(c => c.tags || []).filter(Boolean))].sort();
    const [recipientType, setRecipientType] = useState('contacts'); //'contacts'or'groups'
    const [statusFilter, setStatusFilter] = useState('All Statuses');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Server Action Hooks
    const { execute: executeGetCampaigns } = useAction(getCampaigns, {
        onSuccess: (data) => {
            setCampaigns(data.campaigns || []);
            setLoading(false);
        },
        onError: (err) => {
            setError(err || "Failed to load campaigns");
            setLoading(false);
        }
    });

    const { execute: executeGetTemplates } = useAction(getTemplates, {
        onSuccess: (data) => {
            console.log('[CAMPAIGNS] Templates loaded:', data?.templates?.length);
            setTemplates(data.templates || []);
        },
        onError: (err) => console.error('[CAMPAIGNS] Failed to load templates:', err)
    });

    const { execute: executeGetContacts } = useAction(getContacts, {
        onSuccess: (data) => setContacts(data || []),
        onError: (err) => console.error('[CAMPAIGNS] Failed to load contacts:', err)
    });

    const { execute: executeGetGroups } = useAction(getGroups, {
        onSuccess: (data) => setGroups(data || []),
    });

    const { execute: executeGetCategories } = useAction(getCategories, {
        onSuccess: (data) => setCategories(data || []),
    });

    const { execute: executeGetTags } = useAction(getCategories, {
        onSuccess: (data) => setTags(data || []),
    });

    const { execute: executeGetDetails } = useAction(getCampaignDetails, {
        onSuccess: (data) => {
            const phonesData = (data.campaign.recipients || []).map((r) => {
                if (r.variables && Object.keys(r.variables).length > 0) {
                    return `${r.phone}, ${Object.values(r.variables).join(',')}`;
                }
                return r.phone;
            }).filter(Boolean).join('\n');

            setEditForm((prev) => ({ ...prev, phone: phonesData }));
        }
    });

    const { execute: executeSaveCampaign } = useAction(saveCampaign, {
        onSuccess: async () => {
            if (savingToastRef.current) { toast.dismiss(savingToastRef.current); savingToastRef.current = null; }
            await fetchCampaigns();
            setEditDialogOpen(false);
            setActiveCampaign(null);
            setSelectedGroupIds([]);
            setSelectedCategoryIds([]);
            setSelectedTagIds([]);
            setSelectedContactCatNames([]);
            setSelectedContactTagNames([]);
            setIsSaving(false);
            toast.success(activeCampaign ? 'Campaign updated successfully' : 'Campaign created successfully');
        },
        onError: (err) => {
            if (savingToastRef.current) { toast.dismiss(savingToastRef.current); savingToastRef.current = null; }
            setIsSaving(false);
            toast.error(err || "Failed to save campaign");
        }
    });

    const { execute: executeTriggerCampaign } = useAction(triggerCampaign, {
        onSuccess: async (data) => {
            toast.success(data.message || "Campaign triggered");
            await fetchCampaigns();
        },
        onError: (err) => toast.error(err || "Failed to trigger campaign")
    });

    const { execute: executeResetCampaign } = useAction(resetCampaign, {
        onSuccess: async (data) => {
            toast.success(data.message || "Campaign reset to DRAFT");
            await fetchCampaigns();
        },
        onError: (err) => toast.error(err || "Failed to reset campaign")
    });

    const { execute: executeDeleteCampaign } = useAction(deleteCampaign, {
        onSuccess: async () => {
            console.log('[CAMPAIGNS] Delete success');
            await fetchCampaigns();
            setDeleteDialogOpen(false);
            setActiveCampaign(null);
            setIsDeleting(false);
            toast.success("Campaign deleted");
        },
        onError: (err) => {
            console.error('[CAMPAIGNS] Delete error:', err);
            setDeleteDialogOpen(false);
            setActiveCampaign(null);
            setIsDeleting(false);
            toast.error(err || "Failed to delete campaign");
        }
    });

    const fetchCampaigns = () => { setLoading(true); executeGetCampaigns({ workspaceId }); };
    const fetchTemplates = () => executeGetTemplates({ workspaceId });
    const fetchContacts = () => executeGetContacts({ workspaceId });
    const fetchGroups = () => executeGetGroups({ workspaceId });
    const fetchCategories = () => executeGetCategories({ workspaceId, type: 'CONTACT' });
    const fetchTags = () => executeGetTags({ workspaceId, type: 'TAG' });

    React.useEffect(() => {
        fetchCampaigns();
        fetchTemplates();
        fetchContacts();
        fetchGroups();
        fetchCategories();
        fetchTags();
    }, [workspaceId]);

    const hasActiveCampaigns = campaigns.some(c => c.status === 'RUNNING' || c.status === 'QUEUED');

    React.useEffect(() => {
        if (!hasActiveCampaigns) return;
        const interval = setInterval(fetchCampaigns, 5000);
        return () => clearInterval(interval);
    }, [hasActiveCampaigns]);

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [activeCampaign, setActiveCampaign] = useState(null);
    const [editForm, setEditForm] = useState({
        name: '',
        status: 'DRAFT',
        templateId: '',
        template: '',
        phone: '',
        messageType: 'text',
        scheduledAt: '',
        mediaUrl: '',
        intBody: '',
        intFooter: '',
        intButton: 'Choose Option',
        intSections: JSON.stringify([{ title: 'Options', rows: [{ title: 'Option 1', id: 'opt1' }, { title: 'Option 2', id: 'opt2' }] }], null, 2)
    });
    const [isStarting, setIsStarting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const savingToastRef = useRef(null);
    const [contactSelectorOpen, setContactSelectorOpen] = useState(false);
    const [selectedContactIds, setSelectedContactIds] = useState([]);

    const openEditDialog = async (campaign) => {
        setActiveCampaign(campaign);
        setEditDialogOpen(true);

        // Initialize with the basic campaign data quickly, then fetch full details (including recipients)
        const mt = campaign.messageTemplate;
        setEditForm({
            name: campaign.name,
            status: campaign.status,
            templateId: campaign.templateId || '',
            template: mt?.text || mt?.interactive?.body || (typeof mt === 'string' ? mt : ''),
            phone: '',
            messageType: campaign.messageType || 'text',
            scheduledAt: campaign.scheduledAt ? new Date(campaign.scheduledAt).toISOString().slice(0, 16) : '',
            mediaUrl: mt?.image?.url || mt?.document?.url || '',
            intBody: mt?.interactive?.body || mt?.text || '',
            intFooter: mt?.interactive?.footer || '',
            intButton: mt?.interactive?.buttonText || 'Choose Option',
            intSections: JSON.stringify(mt?.interactive?.sections || [{ title: 'Options', rows: [{ title: 'Option 1', id: 'opt1' }] }], null, 2)
        });

        executeGetDetails({ workspaceId, id: campaign.id });
    };

    const saveEdit = () => {
        if (!editForm.name.trim()) { toast.error('Campaign name is required'); return; }
        if (!editForm.templateId) { toast.error('Please select a template'); return; }

        setIsSaving(true);
        savingToastRef.current = toast.loading(activeCampaign ? 'Updating campaign...' : 'Creating campaign...');

        const recipients = editForm.phone ? editForm.phone.split('\n').map((line) => {
            const parts = line.split(',').map((p) => p.trim()).filter(Boolean);
            if (parts.length === 0) return null;
            return { phone: parts[0], variables: parts.reduce((acc, p, i) => i === 0 ? acc : ({ ...acc, [`v${i}`]: p }), {}) };
        }).filter(Boolean) : [];

        if (!editForm.templateId) { toast.error('Please select a template'); return; }

        const buildTemplate = () => {
            if (editForm.messageType === 'interactive') {
                let sections; try { sections = JSON.parse(editForm.intSections); } catch { sections = []; }
                return { text: editForm.intBody, interactive: { body: editForm.intBody, footer: editForm.intFooter, buttonText: editForm.intButton, sections } };
            }
            const t = { text: editForm.template };
            if (editForm.mediaUrl) {
                if (editForm.messageType === 'image' || editForm.messageType === 'carousel') t.image = { url: editForm.mediaUrl };
                else if (editForm.messageType === 'video') t.video = { url: editForm.mediaUrl };
                else if (editForm.messageType === 'document') t.document = { url: editForm.mediaUrl };
            }
            return t;
        };

        executeSaveCampaign({
            workspaceId,
            id: activeCampaign?.id,
            name: editForm.name,
            status: editForm.status,
            messageTemplate: buildTemplate(),
            templateId: editForm.templateId || null,
            recipients,
            groupIds: selectedGroupIds,
            categoryIds: selectedCategoryIds,
            tagIds: selectedTagIds,
            contactCategoryNames: selectedContactCatNames,
            contactTagNames: selectedContactTagNames
        });
    };

    const handleToggleCampaign = (campaign) => {
        if (campaign.total === 0) { toast.error('Cannot run campaign with no recipients'); return; }
        const isRunning = campaign.status === 'RUNNING' || campaign.status === 'QUEUED';
        executeTriggerCampaign({ workspaceId, id: campaign.id, action: isRunning ? 'stop' : 'start' });
    };

    const openDeleteDialog = (campaign) => {
        setActiveCampaign(campaign);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!activeCampaign) return;
        setIsDeleting(true);
        executeDeleteCampaign({ workspaceId, id: activeCampaign.id });
        setTimeout(() => setIsDeleting(false), 5000);
    };

    const getStatusBadge = (status) => {
        const displayStatus = status === 'QUEUED' ? 'RUNNING' : status;
        const label = status === 'QUEUED' ? 'Running' : displayStatus;
        const styles = {
            RUNNING: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
            DRAFT: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20',
            COMPLETED: 'bg-green-500/10 text-green-500 border-green-500/20',
            SCHEDULED: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
            PAUSED: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
            ERROR: 'bg-red-500/10 text-red-500 border-red-500/20'
        };

        const icons = {
            RUNNING: <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse mr-2" />,
            DRAFT: <Clock className="w-3 h-3 mr-1" />,
            COMPLETED: <CheckCircle2 className="w-3 h-3 mr-1" />,
            SCHEDULED: <Calendar className="w-3 h-3 mr-1" />,
            PAUSED: <Pause className="w-3 h-3 mr-1" />,
            ERROR: <Clock className="w-3 h-3 mr-1" />
        };

        return (
            <span className={`flex items-center text-xs font-medium px-2 py-1 rounded-full border ${styles[displayStatus] || ''}`}>
                {icons[displayStatus]}
                {label}
            </span>);

    };

    const handleCloneCampaign = (campaign) => {
        const clonedName = `${campaign.name} (Copy)`;
        setActiveCampaign(null); // Create as new
        setEditDialogOpen(true);

        // Setup form with campaign data
        const mt = campaign.messageTemplate;
        setEditForm({
            name: clonedName,
            status: 'DRAFT',
            templateId: campaign.templateId || '',
            template: mt?.text || mt?.interactive?.body || (typeof mt === 'string' ? mt : ''),
            phone: '', // Don't copy recipients directly for safety
            messageType: campaign.messageType || 'text',
            scheduledAt: '',
            mediaUrl: mt?.image?.url || mt?.document?.url || '',
            intBody: mt?.interactive?.body || mt?.text || '',
            intFooter: mt?.interactive?.footer || '',
            intButton: mt?.interactive?.buttonText || 'Choose Option',
            intSections: JSON.stringify(mt?.interactive?.sections || [{ title: 'Options', rows: [{ title: 'Option 1', id: 'opt1' }] }], null, 2)
        });

        // Fetch original recipients to pre-fill if desired
        executeGetDetails({ workspaceId, id: campaign.id });
    };

    const filteredCampaigns = campaigns.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
        const filterStatus = statusFilter === 'All Statuses' ? null : statusFilter.toUpperCase();
        const matchesStatus = !filterStatus || c.status === filterStatus || (filterStatus === 'RUNNING' && c.status === 'QUEUED');
        return matchesSearch && matchesStatus;
    });

    return (
        <TooltipProvider delayDuration={150}>
            <div className="flex flex-col h-full animate-in fade-in duration-500">
                {/* Header Area */}
                <header className="flex-none p-4 pb-4 border-b border-border/40">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold  from-foreground to-foreground/60 bg-clip-text text-transparent flex items-center gap-3">
                                <Megaphone className="w-8 h-8 text-primary" />
                                Campaign Manager
                            </h1>
                            <p className="text-muted-foreground text-xs mt-2">Create, schedule, and track bulk WhatsApp broadcasts.</p>
                            {error &&
                                <p className="text-xs text-destructive mt-2">Error loading campaigns: {error}</p>
                            }
                        </div>

                        <div className='flex flex-row gap-2'>
                            <AccountSwitcher />
                            <Button
                                variant={'outline'}
                                onClick={() => {
                                    setActiveCampaign(null);
                                    setEditForm({ name: '', status: 'DRAFT', template: '', templateId: '', phone: '', messageType: 'text', scheduledAt: '', mediaUrl: '', intBody: '', intFooter: '', intButton: 'Choose Option', intSections: JSON.stringify([{ title: 'Options', rows: [{ title: 'Option 1', id: 'opt1' }] }], null, 2) });
                                    setEditDialogOpen(true);
                                }}>


                                <Plus className="w-5 h-5" />
                                New Campaign
                            </Button>
                        </div>
                    </div>

                    {/* KPI Bar */}
                    <div className="grid grid-cols-4 gap-4 mt-8 text-xs">
                        <div className="bg-card border rounded-md p-5 shadow-sm">
                            <div className="flex items-center gap-3 text-muted-foreground mb-3">
                                <Megaphone className="w-5 h-5 text-purple-500" />
                                <span className="font-medium">Total Campaigns</span>
                            </div>
                            <p className=" font-bold text-foreground text-xl">{campaigns.length}</p>
                        </div>
                        <div className="bg-card border rounded-md p-5 shadow-sm">
                            <div className="flex items-center gap-3 text-muted-foreground mb-3">
                                <Users className="w-5 h-5 text-blue-500" />
                                <span className="font-medium">Audience Reached</span>
                            </div>
                            <p className=" font-bold text-foreground text-xl">{campaigns.reduce((sum, c) => sum + (c.total || 0), 0)}</p>
                        </div>
                        <div className="bg-card border rounded-md p-5 shadow-sm">
                            <div className="flex items-center gap-3 text-muted-foreground mb-3">
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                <span className="font-medium text-sm">Avg. Success Rate</span>
                            </div>
                            <p className=" font-bold text-foreground text-xl">
                                {filteredCampaigns.length > 0 ?
                                    `${Math.round(
                                        filteredCampaigns.reduce((sum, c) => sum + (c.successRate || 0), 0) / filteredCampaigns.length
                                    )}%` :
                                    'N/A'}
                            </p>
                        </div>
                        <div className="bg-card border rounded-md p-5 shadow-sm">
                            <div className="flex items-center gap-3 text-muted-foreground mb-3">
                                <BarChart3 className="w-5 h-5 text-orange-500" />
                                <span className="font-medium">Active Now</span>
                            </div>
                            <p className="text-xl font-bold text-foreground">
                                {campaigns.filter((c) => c.status === 'RUNNING' || c.status === 'QUEUED').length}
                            </p>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 p-4 overflow-y-auto">
                    {/* Tools Bar */}
                    <div className="flex justify-between items-center mb-6">
                        <div className="relative w-96">
                            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
                            <Input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search campaigns..."
                                className="w-full bg-muted/50 border-border text-foreground rounded-md pl-10" />
                        </div>

                        <div className="flex gap-2">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="bg-muted/50 border-border text-foreground rounded-md w-[140px]">
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All Statuses">All Statuses</SelectItem>
                                    <SelectItem value="Running">Running</SelectItem>
                                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                                    <SelectItem value="Draft">Draft</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="Paused">Paused</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* {loading &&
                    <div className="flex h-[200px] items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                } */}

                    {/* Campaign Data Table */}
                    <div className="bg-card border rounded-md overflow-hidden shadow-sm">
                        <table className="w-full text-xs text-left">
                            <thead className="text-xs text-muted-foreground bg-muted/30 border-b border-border/50">
                                <tr>
                                    <th scope="col" className="px-6 py-4 font-semibold">Campaign Name</th>
                                    <th scope="col" className="px-6 py-4 font-semibold">Status</th>
                                    <th scope="col" className="px-6 py-4 font-semibold">Progress</th>
                                    <th scope="col" className="px-6 py-4 font-semibold">Scheduled</th>
                                    <th scope="col" className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {filteredCampaigns.map((c) => {
                                    const isActive = c.status === 'RUNNING' || c.status === 'QUEUED';
                                    return (
                                        <tr key={c.id} className={`hover:bg-muted/20 transition-colors group ${isActive ? 'bg-blue-500/[0.02] border-l-2 border-l-blue-500/40' : ''}`}>
                                            <td className="px-6 py-4 font-medium text-foreground">
                                                <div className="flex items-center gap-2">
                                                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shrink-0" />}
                                                    <div>
                                                        <div>{c.name}</div>
                                                        <div className="text-[10px] text-muted-foreground font-normal">{c.templateName}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(c.status)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1.5 min-w-[140px]">
                                                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                                        <span>{c.sent} of {c.total} sent</span>
                                                        <span className="font-bold">{c.successRate}%</span>
                                                    </div>
                                                    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                                                        <div
                                                            className={`h-full transition-all duration-500 ${isActive ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}
                                                            style={{ width: `${c.sent / c.total * 100 || 0}%` }} />

                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground text-xs whitespace-nowrap">
                                                {c.scheduledAt ? new Date(c.scheduledAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Not Scheduled'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <div>
                                                        {c.status === 'COMPLETED' ? (
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <button
                                                                        onClick={() => executeResetCampaign({ workspaceId, id: c.id })}
                                                                        disabled={c.status === 'RUNNING' || c.status === 'QUEUED'}
                                                                        className="cursor-pointer p-2 text-muted-foreground hover:text-blue-500 hover:bg-muted rounded-md transition-colors disabled:opacity-40"
                                                                    >
                                                                        <RotateCcw className="w-4 h-4" />
                                                                    </button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Reset Campaign</TooltipContent>
                                                            </Tooltip>
                                                        ) : (
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <button
                                                                        onClick={() => handleToggleCampaign(c)}
                                                                        disabled={c.status === 'COMPLETED'}
                                                                        className={`cursor-pointer p-2 rounded-md transition-colors disabled:opacity-40 ${isActive ? 'text-amber-500 hover:bg-amber-500/10' : 'text-emerald-500 hover:bg-emerald-500/10'}`}>
                                                                        {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                                                    </button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>{isActive ? "Pause Campaign" : "Start Campaign"}</TooltipContent>
                                                            </Tooltip>
                                                        )}
                                                    </div>

                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <button
                                                                onClick={() => handleCloneCampaign(c)}
                                                                className="cursor-pointer p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
                                                            >
                                                                <Copy className="w-4 h-4" />
                                                            </button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Clone Campaign</TooltipContent>
                                                    </Tooltip>

                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <button
                                                                onClick={() => openEditDialog(c)}
                                                                className="cursor-pointer p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                                                                aria-label="Edit campaign">
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Edit Campaign</TooltipContent>
                                                    </Tooltip>

                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <button
                                                                onClick={() => openDeleteDialog(c)}
                                                                className="cursor-pointer p-2 text-muted-foreground hover:text-red-400 hover:bg-muted rounded-md transition-colors"
                                                                aria-label="Delete campaign">
                                                                <Trash className="w-4 h-4" />
                                                            </button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Delete Campaign</TooltipContent>
                                                    </Tooltip>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {/* Empty State Fallback (Hidden in Mockup) */}
                        {campaigns.length === 0 &&
                            <div className="p-12 text-center flex flex-col items-center justify-center">
                                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                    <Megaphone className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-medium text-foreground mb-1">No Campaigns Yet</h3>
                                <p className="text-xs text-muted-foreground max-w-sm">
                                    You haven&apos;t created any broadcast campaigns. Create your first campaign to start reaching your audience.
                                </p>
                            </div>
                        }
                    </div>

                    <NewCampaignSheet
                        open={editDialogOpen}
                        onOpenChange={setEditDialogOpen}
                        campaign={activeCampaign}
                        editForm={editForm}
                        setEditForm={setEditForm}
                        templates={templates}
                        onSave={saveEdit}
                        isSaving={isSaving}
                        onOpenContactSelector={() => setContactSelectorOpen(true)}
                    />

                    <DeleteCampaignDialog
                        open={deleteDialogOpen}
                        onOpenChange={setDeleteDialogOpen}
                        campaign={activeCampaign}
                        isDeleting={isDeleting}
                        onConfirm={confirmDelete}
                    />
                </main>

                {/* Contact Selector Dialog */}
                <Dialog open={contactSelectorOpen} onOpenChange={setContactSelectorOpen}>
                    <DialogContent className="max-w-xl bg-card border border-border/50 rounded-md p-0 overflow-hidden shadow-2xl">
                        <DialogHeader className="p-4 border-b border-border bg-muted/10">
                            <DialogTitle className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-primary" />
                                Select Campaign Recipients
                            </DialogTitle>
                        </DialogHeader>

                        <Tabs value={recipientType} onValueChange={setRecipientType} className="w-full">
                            <div className="px-6 pt-4">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="contacts">Individual Contacts</TabsTrigger>
                                    <TabsTrigger value="groups">Contact Group/Category/Tags</TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent value="contacts">
                                <div className="px-6 py-2">
                                    <div className="relative mb-4">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search contacts..."
                                            className="pl-9 bg-background"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)} />

                                    </div>
                                    <ScrollArea className="h-[300px]">
                                        <div className="space-y-2">
                                            {contacts.filter((c) =>
                                                c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                c.phone.includes(searchTerm)
                                            ).length === 0 ?
                                                <div className="p-12 text-center text-muted-foreground">
                                                    <Users className="w-12 h-12 mx-auto opacity-20 mb-4" />
                                                    <p>No contacts found.</p>
                                                </div> :

                                                contacts.filter((c) =>
                                                    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                    c.phone.includes(searchTerm)
                                                ).map((contact) =>
                                                    <div
                                                        key={contact.id}
                                                        className={`flex items-center gap-3 p-3 rounded-md border transition-all cursor-pointer ${selectedContactIds.includes(contact.id) ?
                                                            'border-primary bg-primary/5' :
                                                            'border-border/50 hover:bg-muted/50'}`
                                                        }
                                                        onClick={() => {
                                                            setSelectedContactIds((prev) =>
                                                                prev.includes(contact.id) ?
                                                                    prev.filter((id) => id !== contact.id) :
                                                                    [...prev, contact.id]
                                                            );
                                                        }}>

                                                        <Checkbox checked={selectedContactIds.includes(contact.id)} />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-xs truncate">{contact.name}</p>
                                                            <p className="text-xs text-muted-foreground">{contact.phone}</p>
                                                        </div>
                                                    </div>
                                                )
                                            }
                                        </div>
                                    </ScrollArea>
                                </div>
                            </TabsContent>

                            <TabsContent value="groups">
                                <div className="px-6 py-2">
                                    <ScrollArea className="h-[340px]">
                                        <div className="space-y-4">
                                            {groups.length > 0 && <>
                                                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Users className="w-3 h-3" /> Contact Groups</p>
                                                {groups.map((group) =>
                                                    <div
                                                        key={group.id}
                                                        className={`flex items-center gap-3 p-3 rounded-md border transition-all cursor-pointer ${selectedGroupIds.includes(group.id) ?
                                                            'border-primary bg-primary/5' :
                                                            'border-border/50 hover:bg-muted/50'}`
                                                        }
                                                        onClick={() => {
                                                            setSelectedGroupIds((prev) =>
                                                                prev.includes(group.id) ?
                                                                    prev.filter((id) => id !== group.id) :
                                                                    [...prev, group.id]
                                                            );
                                                        }}>

                                                        <Checkbox checked={selectedGroupIds.includes(group.id)} />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between">
                                                                <p className="font-semibold text-xs truncate">{group.name}</p>
                                                                <Badge variant="secondary" className="text-[10px]">
                                                                    {group._count?.contacts || 0} contacts
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </>}

                                            {categories.length > 0 && <>
                                                <div className="border-t border-border/40 pt-3" />
                                                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1"><FolderOpen className="w-3 h-3" /> Categories</p>
                                                {categories.map((cat) =>
                                                    <div
                                                        key={cat.id}
                                                        className={`flex items-center gap-3 p-3 rounded-md border transition-all cursor-pointer ${selectedCategoryIds.includes(cat.id) ?
                                                            'border-primary bg-primary/5' :
                                                            'border-border/50 hover:bg-muted/50'}`
                                                        }
                                                        onClick={() => {
                                                            setSelectedCategoryIds((prev) =>
                                                                prev.includes(cat.id) ?
                                                                    prev.filter((id) => id !== cat.id) :
                                                                    [...prev, cat.id]
                                                            );
                                                        }}>

                                                        <Checkbox checked={selectedCategoryIds.includes(cat.id)} />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-semibold text-xs truncate">{cat.name}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </>}

                                            {tags.length > 0 && <>
                                                <div className="border-t border-border/40 pt-3" />
                                                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Tags className="w-3 h-3" /> Tags</p>
                                                {tags.map((tag) =>
                                                    <div
                                                        key={tag.id}
                                                        className={`flex items-center gap-3 p-3 rounded-md border transition-all cursor-pointer ${selectedTagIds.includes(tag.id) ?
                                                            'border-primary bg-primary/5' :
                                                            'border-border/50 hover:bg-muted/50'}`
                                                        }
                                                        onClick={() => {
                                                            setSelectedTagIds((prev) =>
                                                                prev.includes(tag.id) ?
                                                                    prev.filter((id) => id !== tag.id) :
                                                                    [...prev, tag.id]
                                                            );
                                                        }}>

                                                        <Checkbox checked={selectedTagIds.includes(tag.id)} />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-semibold text-xs truncate">{tag.name}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </>}

                                            {contactCategoryNames.length > 0 && <>
                                                <div className="border-t border-border/40 pt-3" />
                                                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1"><FolderOpen className="w-3 h-3" /> Contact Categories (from contacts)</p>
                                                {contactCategoryNames.map((catName) =>
                                                    <div
                                                        key={catName}
                                                        className={`flex items-center gap-3 p-3 rounded-md border transition-all cursor-pointer ${selectedContactCatNames.includes(catName) ?
                                                            'border-primary bg-primary/5' :
                                                            'border-border/50 hover:bg-muted/50'}`
                                                        }
                                                        onClick={() => {
                                                            setSelectedContactCatNames((prev) =>
                                                                prev.includes(catName) ?
                                                                    prev.filter((n) => n !== catName) :
                                                                    [...prev, catName]
                                                            );
                                                        }}>

                                                        <Checkbox checked={selectedContactCatNames.includes(catName)} />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-semibold text-xs truncate">{catName}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </>}

                                            {contactTagNames.length > 0 && <>
                                                <div className="border-t border-border/40 pt-3" />
                                                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Tags className="w-3 h-3" /> Contact Tags (from contacts)</p>
                                                {contactTagNames.map((tagName) =>
                                                    <div
                                                        key={tagName}
                                                        className={`flex items-center gap-3 p-3 rounded-md border transition-all cursor-pointer ${selectedContactTagNames.includes(tagName) ?
                                                            'border-primary bg-primary/5' :
                                                            'border-border/50 hover:bg-muted/50'}`
                                                        }
                                                        onClick={() => {
                                                            setSelectedContactTagNames((prev) =>
                                                                prev.includes(tagName) ?
                                                                    prev.filter((n) => n !== tagName) :
                                                                    [...prev, tagName]
                                                            );
                                                        }}>

                                                        <Checkbox checked={selectedContactTagNames.includes(tagName)} />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-semibold text-xs truncate">{tagName}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </>}

                                            {groups.length === 0 && categories.length === 0 && tags.length === 0 && contactCategoryNames.length === 0 && contactTagNames.length === 0 &&
                                                <div className="p-12 text-center text-muted-foreground">
                                                    <Users className="w-12 h-12 mx-auto opacity-20 mb-4" />
                                                    <p>No groups, categories, or tags found.</p>
                                                </div>
                                            }
                                        </div>
                                    </ScrollArea>
                                </div>
                            </TabsContent>
                        </Tabs>

                        <DialogFooter className="p-6 border-t border-border bg-muted/10">
                            <Button variant="outline" onClick={() => {
                                setContactSelectorOpen(false);
                                setSelectedContactIds([]);
                                setSelectedGroupIds([]);
                                setSelectedCategoryIds([]);
                                setSelectedTagIds([]);
                                setSelectedContactCatNames([]);
                                setSelectedContactTagNames([]);
                            }}>
                                Cancel
                            </Button>
                            <Button
                                onClick={() => {
                                    if (recipientType === 'contacts') {
                                        const selected = contacts.filter((c) => selectedContactIds.includes(c.id));
                                        const phoneString = selected.map((c) => c.phone).join('\n');
                                        setEditForm((prev) => ({
                                            ...prev,
                                            phone: prev.phone ? `${prev.phone}\n${phoneString}` : phoneString
                                        }));
                                        setSelectedContactIds([]);
                                    }
                                    // If groups/categories/tags, we just keep selected IDs in state and use them on Save
                                    setContactSelectorOpen(false);
                                }}
                                className="bg-primary hover:bg-primary/90 min-w-[120px]">

                                {recipientType === 'contacts' ?
                                    `Add ${selectedContactIds.length} Contacts` :
                                    `Target ${selectedGroupIds.length} Groups, ${selectedCategoryIds.length + selectedContactCatNames.length} Categories, ${selectedTagIds.length + selectedContactTagNames.length} Tags`
                                }
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </TooltipProvider>
    );
}