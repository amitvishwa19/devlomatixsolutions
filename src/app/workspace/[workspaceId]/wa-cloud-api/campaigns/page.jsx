"use client";

import React, { useState } from'react';
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
 Trash2,
 BarChart3 } from
'lucide-react';
import {
 Sheet,
 SheetContent,
 SheetHeader,
 SheetTitle,
 SheetFooter } from

"@/components/ui/sheet";
import { Button } from"@/components/ui/button";
import {
 AlertDialog,
 AlertDialogAction,
 AlertDialogCancel,
 AlertDialogContent,
 AlertDialogDescription,
 AlertDialogFooter,
 AlertDialogHeader,
 AlertDialogTitle } from
"@/components/ui/alert-dialog";
import { Input } from"@/components/ui/input";
import { Textarea } from"@/components/ui/textarea";
import { toast } from"sonner";
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue } from
"@/components/ui/select";
import { useSession } from"next-auth/react";
import { ScrollArea } from"@/components/ui/scroll-area";
import { Checkbox } from"@/components/ui/checkbox";
import { Badge } from"@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from"@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from"@/components/ui/dialog";

import { useAction } from "@/hooks/use-action";
import { getCampaigns } from "./_actions/get-campaigns";
import { getCampaignDetails } from "./_actions/get-campaign-details";
import { saveCampaign } from "./_actions/save-campaign";
import { deleteCampaign } from "./_actions/delete-campaign";
import { triggerCampaign } from "./_actions/trigger-campaign";
import { getTemplates } from "../template/_actions/get-templates";
import { getContacts } from "../contacts/_actions/get-contacts";
import { getGroups } from "../contacts/_actions/get-groups";
import { useParams } from "next/navigation";

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
 const [selectedGroupIds, setSelectedGroupIds] = useState([]);
 const [recipientType, setRecipientType] = useState('contacts'); //'contacts'or'groups'
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
        onSuccess: (data) => setTemplates(data.templates || []),
    });

    const { execute: executeGetContacts } = useAction(getContacts, {
        onSuccess: (data) => setContacts(data.contacts || []),
    });

    const { execute: executeGetGroups } = useAction(getGroups, {
        onSuccess: (data) => setGroups(data.groups || []),
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
            await fetchCampaigns();
            setEditDialogOpen(false);
            setActiveCampaign(null);
            setSelectedGroupIds([]);
            toast.success(activeCampaign ? 'Campaign updated successfully' : 'Campaign created successfully');
        },
        onError: (err) => toast.error(err || "Failed to save campaign")
    });

    const { execute: executeTriggerCampaign } = useAction(triggerCampaign, {
        onSuccess: async (data) => {
            toast.success(data.message || "Campaign triggered");
            await fetchCampaigns();
        },
        onError: (err) => toast.error(err || "Failed to trigger campaign")
    });

    const { execute: executeDeleteCampaign } = useAction(deleteCampaign, {
        onSuccess: async () => {
            await fetchCampaigns();
            setDeleteDialogOpen(false);
            setActiveCampaign(null);
            toast.success("Campaign deleted");
        },
        onError: (err) => toast.error(err || "Failed to delete campaign"),
        onSettled: () => setIsDeleting(false)
    });

    const fetchCampaigns = () => { setLoading(true); executeGetCampaigns({ workspaceId }); };
    const fetchTemplates = () => executeGetTemplates({ workspaceId });
    const fetchContacts = () => executeGetContacts({ workspaceId });
    const fetchGroups = () => executeGetGroups({ workspaceId });

    React.useEffect(() => {
        fetchCampaigns();
        fetchTemplates();
        fetchContacts();
        fetchGroups();
    }, [workspaceId]);

 const [editDialogOpen, setEditDialogOpen] = useState(false);
 const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
 const [isDeleting, setIsDeleting] = useState(false);
 const [activeCampaign, setActiveCampaign] = useState(null);
 const [editForm, setEditForm] = useState({
 name:'',
 status:'DRAFT',
 templateId:'',
 template:'',
 phone:'',
 messageType:'text',
 scheduledAt:'',
 mediaUrl:'',
 intBody:'',
 intFooter:'',
 intButton:'Choose Option',
 intSections: JSON.stringify([{ title:'Options', rows: [{ title:'Option 1', id:'opt1'}, { title:'Option 2', id:'opt2'}] }], null, 2)
 });
 const [isStarting, setIsStarting] = useState(false);
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
 templateId: campaign.templateId ||'',
 template: mt?.text || mt?.interactive?.body || (typeof mt ==='string'? mt :''),
 phone:'',
 messageType: campaign.messageType ||'text',
 scheduledAt: campaign.scheduledAt ? new Date(campaign.scheduledAt).toISOString().slice(0, 16) :'',
 mediaUrl: mt?.image?.url || mt?.document?.url ||'',
 intBody: mt?.interactive?.body || mt?.text ||'',
 intFooter: mt?.interactive?.footer ||'',
 intButton: mt?.interactive?.buttonText ||'Choose Option',
 intSections: JSON.stringify(mt?.interactive?.sections || [{ title:'Options', rows: [{ title:'Option 1', id:'opt1'}] }], null, 2)
 });

        executeGetDetails({ workspaceId, id: campaign.id });
 };

    const saveEdit = () => {
        if (!editForm.name.trim()) { toast.error('Campaign name is required'); return; }
        
        const recipients = editForm.phone ? editForm.phone.split('\n').map((line) => {
            const parts = line.split(',').map((p) => p.trim()).filter(Boolean);
            if (parts.length === 0) return null;
            return { phone: parts[0], variables: parts.reduce((acc, p, i) => i === 0 ? acc : ({ ...acc, [`v${i}`]: p }), {}) };
        }).filter(Boolean) : [];

        const buildTemplate = () => {
            if (editForm.messageType === 'interactive') {
                let sections; try { sections = JSON.parse(editForm.intSections); } catch { sections = []; }
                return { text: editForm.intBody, interactive: { body: editForm.intBody, footer: editForm.intFooter, buttonText: editForm.intButton, sections } };
            }
            const t = { text: editForm.template };
            if (editForm.messageType === 'image') t.image = { url: editForm.mediaUrl };
            if (editForm.messageType === 'document') t.document = { url: editForm.mediaUrl };
            return t;
        };

        executeSaveCampaign({
            workspaceId,
            id: activeCampaign?.id,
            name: editForm.name,
            status: editForm.status,
            messageTemplate: buildTemplate(),
            templateId: editForm.templateId === 'custom' ? null : editForm.templateId || null,
            recipients,
            groupIds: selectedGroupIds
        });
    };

    const handleToggleCampaign = (campaign) => {
        if (campaign.total === 0) { toast.error('Cannot run campaign with no recipients'); return; }
        const isRunning = campaign.status === 'RUNNING';
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
    };

 const getStatusBadge = (status) => {
 const styles = {
 RUNNING:'bg-blue-500/10 text-blue-500 border-blue-500/20',
 DRAFT:'bg-zinc-500/10 text-zinc-500 border-zinc-500/20',
 COMPLETED:'bg-green-500/10 text-green-500 border-green-500/20',
 SCHEDULED:'bg-purple-500/10 text-purple-500 border-purple-500/20',
 PAUSED:'bg-amber-500/10 text-amber-500 border-amber-500/20',
 ERROR:'bg-red-500/10 text-red-500 border-red-500/20'
 };

 const icons = {
 RUNNING: <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse mr-2"/>,
 DRAFT: <Clock className="w-3 h-3 mr-1"/>,
 COMPLETED: <CheckCircle2 className="w-3 h-3 mr-1"/>,
 SCHEDULED: <Calendar className="w-3 h-3 mr-1"/>,
 PAUSED: <Pause className="w-3 h-3 mr-1"/>,
 ERROR: <Clock className="w-3 h-3 mr-1"/>
 };

 return (
 <span className={`flex items-center text-xs font-medium px-2 py-1 rounded-full border ${styles[status]}`}>
 {icons[status]}
 {status}
 </span>);

 };

 return (
 <div className="flex flex-col h-full animate-in fade-in duration-500">
 {/* Header Area */}
 <header className="flex-none p-6 pb-4 border-b border-border/40">
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent flex items-center gap-3">
 <Megaphone className="w-8 h-8 text-primary"/>
 Campaign Manager
 </h1>
 <p className="text-muted-foreground text-xs mt-2">Create, schedule, and track bulk WhatsApp broadcasts.</p>
 {error &&
 <p className="text-xs text-destructive mt-2">Error loading campaigns: {error}</p>
 }
 </div>
 <Button
 variant={'outline'}
 onClick={() => {
 setActiveCampaign(null);
 setEditForm({ name:'', status:'DRAFT', template:'', phone:'', messageType:'text', scheduledAt:'', mediaUrl:'', intBody:'', intFooter:'', intButton:'Choose Option', intSections: JSON.stringify([{ title:'Options', rows: [{ title:'Option 1', id:'opt1'}] }], null, 2) });
 setEditDialogOpen(true);
 }}>

 
 <Plus className="w-5 h-5"/>
 New Campaign
 </Button>
 </div>

 {/* KPI Bar */}
 <div className="grid grid-cols-4 gap-4 mt-8">
 <div className="bg-card border rounded-md p-5 shadow-sm">
 <div className="flex items-center gap-3 text-muted-foreground mb-3">
 <Megaphone className="w-5 h-5 text-purple-500"/>
 <span className="font-medium">Total Campaigns</span>
 </div>
 <p className="text-xl font-bold text-foreground">{campaigns.length}</p>
 </div>
 <div className="bg-card border rounded-md p-5 shadow-sm">
 <div className="flex items-center gap-3 text-muted-foreground mb-3">
 <Users className="w-5 h-5 text-blue-500"/>
 <span className="font-medium">Audience Reached</span>
 </div>
 <p className="text-3xl font-bold text-foreground">{campaigns.reduce((sum, c) => sum + (c.total || 0), 0)}</p>
 </div>
 <div className="bg-card border rounded-md p-5 shadow-sm">
 <div className="flex items-center gap-3 text-muted-foreground mb-3">
 <CheckCircle2 className="w-5 h-5 text-green-500"/>
 <span className="font-medium">Avg. Success Rate</span>
 </div>
 <p className="text-3xl font-bold text-foreground">
 {campaigns.length > 0 ?
 `${Math.round(
 campaigns.reduce((sum, c) => sum + (c.successRate || 0), 0) / campaigns.length
 )}%` :
'N/A'}
 </p>
 </div>
 <div className="bg-card border rounded-md p-5 shadow-sm">
 <div className="flex items-center gap-3 text-muted-foreground mb-3">
 <BarChart3 className="w-5 h-5 text-orange-500"/>
 <span className="font-medium">Active Now</span>
 </div>
 <p className="text-3xl font-bold text-foreground">
 {campaigns.filter((c) => c.status ==='RUNNING').length}
 </p>
 </div>
 </div>
 </header>

 {/* Main Content Area */}
 <main className="flex-1 p-6 overflow-y-auto">
 {/* Tools Bar */}
 <div className="flex justify-between items-center mb-6">
 <div className="relative w-96">
 <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10"/>
 <Input
 type="text"
 placeholder="Search campaigns..."
 className="w-full bg-muted/50 border-border text-foreground rounded-md pl-10"/>
 
 </div>

 <div className="flex gap-2">
 <Select defaultValue="All Statuses">
 <SelectTrigger className="bg-muted/50 border-border text-foreground rounded-md w-[140px]">
 <SelectValue placeholder="All Statuses"/>
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="All Statuses">All Statuses</SelectItem>
 <SelectItem value="Running">Running</SelectItem>
 <SelectItem value="Scheduled">Scheduled</SelectItem>
 <SelectItem value="Draft">Draft</SelectItem>
 </SelectContent>
 </Select>
 </div>
 </div>

 {loading &&
 <div className="flex h-[200px] items-center justify-center">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
 </div>
 }

 {/* Campaign Data Table */}
 <div className="bg-card border rounded-md overflow-hidden shadow-sm">
 <table className="w-full text-xs text-left">
 <thead className="text-xs text-muted-foreground bg-muted/30 border-b border-border/50">
 <tr>
 <th scope="col"className="px-6 py-4 font-semibold">Campaign Name</th>
 <th scope="col"className="px-6 py-4 font-semibold">Status</th>
 <th scope="col"className="px-6 py-4 font-semibold">Progress</th>
 <th scope="col"className="px-6 py-4 font-semibold">Scheduled</th>
 <th scope="col"className="px-6 py-4 font-semibold text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border/50">
 {campaigns.map((c) =>
 <tr key={c.id} className="hover:bg-muted/20 transition-colors group">
 <td className="px-6 py-4 font-medium text-foreground">
 {c.name}
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
 className={`h-full transition-all duration-500 ${c.status ==='RUNNING'?'bg-blue-500 animate-pulse':'bg-green-500'}`}
 style={{ width: `${c.sent / c.total * 100 || 0}%` }} />
 
 </div>
 </div>
 </td>
 <td className="px-6 py-4 text-muted-foreground text-xs whitespace-nowrap">
 {c.scheduledAt ? new Date(c.scheduledAt).toLocaleString([], { dateStyle:'medium', timeStyle:'short'}) :'Not Scheduled'}
 </td>
 <td className="px-6 py-4">
 <div className="flex justify-end gap-2">
 <button
 onClick={() => handleToggleCampaign(c)}
 disabled={c.status ==='COMPLETED'}
 title={c.status ==='RUNNING'?"Pause Campaign":"Start Campaign"}
 className={`p-2 rounded-md transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-40 ${c.status ==='RUNNING'?'text-amber-500 hover:bg-amber-500/10':'text-emerald-500 hover:bg-emerald-500/10'}`}>
 
 {c.status ==='RUNNING'? <Pause className="w-4 h-4"/> : <Play className="w-4 h-4"/>}
 </button>
 <button
 onClick={() => openEditDialog(c)}
 className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors opacity-0 group-hover:opacity-100"
 aria-label="Edit campaign">
 
 <Edit className="w-4 h-4"/>
 </button>
 <button
 onClick={() => openDeleteDialog(c)}
 className="p-2 text-muted-foreground hover:text-red-400 hover:bg-muted rounded-md transition-colors opacity-0 group-hover:opacity-100"
 aria-label="Delete campaign">
 
 <Trash className="w-4 h-4"/>
 </button>
 </div>
 </td>
 </tr>
 )}
 </tbody>
 </table>

 {/* Empty State Fallback (Hidden in Mockup) */}
 {campaigns.length === 0 &&
 <div className="p-12 text-center flex flex-col items-center justify-center">
 <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
 <Megaphone className="w-8 h-8 text-muted-foreground"/>
 </div>
 <h3 className="text-lg font-medium text-foreground mb-1">No Campaigns Yet</h3>
 <p className="text-xs text-muted-foreground max-w-sm">
 You haven't created any broadcast campaigns. Create your first campaign to start reaching your audience.
 </p>
 </div>
 }
 </div>

 {/* Edit / Create Campaign Sheet */}
 <Sheet open={editDialogOpen} onOpenChange={setEditDialogOpen}>
 <SheetContent side="right"className="min-w-[620px] bg-transparent border-0 p-2 overflow-hidden">

 <div className="bg-card border rounded-md h-full p-2 overflow-y-auto">
 <SheetHeader>
 <SheetTitle>{activeCampaign ?'Edit Campaign':'New Campaign'}</SheetTitle>
 </SheetHeader>
 <ScrollArea className='h-[80vh]'>
 <div className="space-y-4 py-4">
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-2">
 <label className="text-sm font-medium text-muted-foreground">Campaign Name</label>
 <Input
 placeholder="e.g., Summer Sale Blast"
 value={editForm.name}
 onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
 className="bg-background"/>
 
 </div>
 <div className="space-y-2">
 <label className="text-sm font-medium text-muted-foreground">Select Template</label>
 <Select
 value={editForm.templateId}
 onValueChange={(val) => {
 const selected = templates.find((t) => t.id === val);
 if (selected) {
 setEditForm((prev) => ({
 ...prev,
 templateId: selected.id,
 messageType: (() => {if (selected.type ==='INTERACTIVE') return'interactive-button';if (selected.type ==='LIST') return'interactive-group';return selected.type.toLowerCase();})(),
 template: selected.body,
 intBody: selected.body,
 intFooter: selected.footer ||'',
 intButton: selected.type ==='LIST'? selected.metadata?.listButton ||'Select': selected.buttons?.[0] ||'Options',
 intSections: selected.type ==='LIST'?
 JSON.stringify(selected.metadata?.listSections || [], null, 2) :
 JSON.stringify([{ title:'Options', rows: (selected.buttons || []).map((b) => ({ title: b, id: b })) }], null, 2),
 mediaUrl: selected.metadata?.mediaUrl ||''
 }));
 }
 }}>
 
 <SelectTrigger className="bg-background">
 <SelectValue placeholder="Custom Message"/>
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="custom">Custom (No Template)</SelectItem>
 {templates.map((t) =>
 <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
 )}
 </SelectContent>
 </Select>
 </div>
 </div>
 <div className="space-y-2">
 <div className="flex justify-between items-center">
 <label className="text-sm font-medium text-muted-foreground">Mobile Numbers</label>
 <div className="flex gap-2">
 <Button
 variant="outline"
 size="sm"
 className="h-6 text-[10px] px-2"
 onClick={() => setContactSelectorOpen(true)}>
 
 <Users className="w-3 h-3 mr-1"/>
 Select from Contacts
 </Button>
 <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">One per line. Format: Phone, Var1, Var2</span>
 </div>
 </div>
 <Textarea
 value={editForm.phone}
 rows={4}
 onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
 placeholder="+1234567890, John, New York&#10;+19876543210, Sarah, London"
 className="bg-background min-h-[100px] font-mono text-xs"/>
 
 <p className="text-[10px] text-muted-foreground italic">Use {"{{v1}}"}, {"{{v2}}"} in template to inject variables.</p>
 </div>
 <div className="space-y-2">
 <label className="text-xs font-medium text-muted-foreground">Message Type</label>
 <Select
 value={editForm.messageType}
 onValueChange={(val) => setEditForm((prev) => ({ ...prev, messageType: val }))}>
 
 <SelectTrigger className="w-full bg-background">
 <SelectValue placeholder="Select type"/>
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="text">Text</SelectItem>
 <SelectItem value="image">Image</SelectItem>
 <SelectItem value="document">Document</SelectItem>
 <SelectItem value="interactive">Interactive</SelectItem>
 </SelectContent>
 </Select>
 </div>

 {(editForm.messageType ==='image'|| editForm.messageType ==='document') &&
 <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
 <label className="text-sm font-medium text-muted-foreground">{editForm.messageType ==='image'?'Image URL':'Document URL'}</label>
 <Input
 value={editForm.mediaUrl}
 onChange={(e) => setEditForm((prev) => ({ ...prev, mediaUrl: e.target.value }))}
 placeholder="https://example.com/file.jpg"
 className="bg-background"/>
 
 </div>
 }

 {editForm.messageType ==='interactive'?
 <div className="space-y-4 animate-in fade-in duration-300 border border-border rounded-md p-4">
 <p className="text-xs font-semibold text-muted-foreground tracking-wider">Interactive Message Builder</p>
 <div className="space-y-2">
 <label className="text-xs font-medium text-muted-foreground">Main Body Text</label>
 <Textarea
 value={editForm.intBody}
 onChange={(e) => setEditForm((prev) => ({ ...prev, intBody: e.target.value }))}
 placeholder="Hello {{v1}}! Welcome to our service..."
 className="bg-background min-h-[100px] resize-none text-sm leading-relaxed"/>
 
 </div>
 <div className="grid grid-cols-2 gap-3">
 <div className="space-y-2">
 <label className="text-sm font-medium text-muted-foreground">Footer Text (Optional)</label>
 <Input
 value={editForm.intFooter}
 onChange={(e) => setEditForm((prev) => ({ ...prev, intFooter: e.target.value }))}
 placeholder="Powered by your brand"
 className="bg-background"/>
 
 </div>
 <div className="space-y-2">
 <label className="text-sm font-medium text-muted-foreground">Menu Button Text</label>
 <Input
 value={editForm.intButton}
 onChange={(e) => setEditForm((prev) => ({ ...prev, intButton: e.target.value }))}
 placeholder="Choose Option"
 className="bg-background"/>
 
 </div>
 </div>
 <div className="space-y-2">
 <label className="text-sm font-medium text-muted-foreground">List Sections (JSON Array)</label>
 <Textarea
 value={editForm.intSections}
 rows={4}
 onChange={(e) => setEditForm((prev) => ({ ...prev, intSections: e.target.value }))}
 className="bg-background min-h-[120px] font-mono text-xs resize-none"
 placeholder='[{"title":"Options","rows": [{"title":"Option 1","id":"opt1"}]}]'/>
 
 </div>
 </div> :

 <div className="space-y-2">
 <label className="text-sm font-medium text-muted-foreground">Message Template</label>
 <Textarea
 value={editForm.template}
 rows={10}
 onChange={(e) => setEditForm((prev) => ({ ...prev, template: e.target.value }))}
 placeholder="Hello {{v1}}, your message here..."
 className="bg-background min-h-[100px]"/>
 
 </div>
 }
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-2">
 <label className="text-sm font-medium text-muted-foreground">Status</label>
 <Select
 value={editForm.status}
 onValueChange={(val) => setEditForm((prev) => ({ ...prev, status: val }))}>
 
 <SelectTrigger className="w-full bg-background">
 <SelectValue placeholder="Select status"/>
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="RUNNING">RUNNING</SelectItem>
 <SelectItem value="DRAFT">DRAFT</SelectItem>
 <SelectItem value="COMPLETED">COMPLETED</SelectItem>
 <SelectItem value="SCHEDULED">SCHEDULED</SelectItem>
 </SelectContent>
 </Select>
 </div>
 <div className="space-y-2">
 <label className="text-sm font-medium text-muted-foreground">Schedule Time (Optional)</label>
 <Input
 type="datetime-local"
 value={editForm.scheduledAt}
 onChange={(e) => setEditForm((prev) => ({ ...prev, scheduledAt: e.target.value }))}
 className="bg-background"/>
 
 </div>
 </div>
 </div>
 </ScrollArea>
 <SheetFooter>
 <Button variant="outline"onClick={() => setEditDialogOpen(false)}>
 Cancel
 </Button>
 <Button onClick={saveEdit} className="bg-primary hover:bg-primary/90 text-primary-foreground">
 Save
 </Button>
 </SheetFooter>
 </div>
 </SheetContent>
 </Sheet>

 {/* Delete Confirmation Alert Dialog */}
 <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
 <AlertDialogContent>
 <AlertDialogHeader>
 <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
 <AlertDialogDescription>
 Are you sure you want to delete <span className="font-semibold text-foreground">{activeCampaign?.name}</span>? This action cannot be undone.
 </AlertDialogDescription>
 </AlertDialogHeader>
 <AlertDialogFooter>
 <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>Cancel</AlertDialogCancel>
 <AlertDialogAction onClick={confirmDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/80 min-w-[80px]">
 {isDeleting ? <Trash2 className="w-4 h-4 animate-spin"/> :"Delete"}
 </AlertDialogAction>
 </AlertDialogFooter>
 </AlertDialogContent>
 </AlertDialog>
 </main>

 {/* Contact Selector Dialog */}
 <Dialog open={contactSelectorOpen} onOpenChange={setContactSelectorOpen}>
 <DialogContent className="max-w-xl bg-card border border-border/50 rounded-md p-0 overflow-hidden shadow-2xl">
 <DialogHeader className="p-6 border-b border-border bg-muted/10">
 <DialogTitle className="flex items-center gap-2">
 <Users className="w-5 h-5 text-primary"/>
 Select Campaign Recipients
 </DialogTitle>
 </DialogHeader>

 <Tabs value={recipientType} onValueChange={setRecipientType} className="w-full">
 <div className="px-6 pt-4">
 <TabsList className="grid w-full grid-cols-2">
 <TabsTrigger value="contacts">Individual Contacts</TabsTrigger>
 <TabsTrigger value="groups">Contact Groups</TabsTrigger>
 </TabsList>
 </div>

 <TabsContent value="contacts">
 <div className="px-6 py-2">
 <div className="relative mb-4">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
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
 <Users className="w-12 h-12 mx-auto opacity-20 mb-4"/>
 <p>No contacts found.</p>
 </div> :

 contacts.filter((c) =>
 c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
 c.phone.includes(searchTerm)
 ).map((contact) =>
 <div
 key={contact.id}
 className={`flex items-center gap-3 p-3 rounded-md border transition-all cursor-pointer ${selectedContactIds.includes(contact.id) ?
'border-primary bg-primary/5':
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
 <div className="space-y-2">
 {groups.length === 0 ?
 <div className="p-12 text-center text-muted-foreground">
 <Users className="w-12 h-12 mx-auto opacity-20 mb-4"/>
 <p>No groups found. Create groups in the Contacts page.</p>
 </div> :

 groups.map((group) =>
 <div
 key={group.id}
 className={`flex items-center gap-3 p-4 rounded-md border transition-all cursor-pointer ${selectedGroupIds.includes(group.id) ?
'border-primary bg-primary/5':
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
 <Badge variant="secondary"className="text-[10px]">
 {group._count?.contacts || 0} contacts
 </Badge>
 </div>
 {group.description &&
 <p className="text-xs text-muted-foreground truncate">{group.description}</p>
 }
 </div>
 </div>
 )
 }
 </div>
 </ScrollArea>
 </div>
 </TabsContent>
 </Tabs>

 <DialogFooter className="p-6 border-t border-border bg-muted/10">
 <Button variant="outline"onClick={() => {
 setContactSelectorOpen(false);
 setSelectedContactIds([]);
 setSelectedGroupIds([]);
 }}>
 Cancel
 </Button>
 <Button
 onClick={() => {
 if (recipientType ==='contacts') {
 const selected = contacts.filter((c) => selectedContactIds.includes(c.id));
 const phoneString = selected.map((c) => c.phone).join('\n');
 setEditForm((prev) => ({
 ...prev,
 phone: prev.phone ? `${prev.phone}\n${phoneString}` : phoneString
 }));
 setSelectedContactIds([]);
 }
 // If groups, we just keep selectedGroupIds in state and use them on Save
 setContactSelectorOpen(false);
 }}
 className="bg-primary hover:bg-primary/90 min-w-[120px]">
 
 {recipientType ==='contacts'?
 `Add ${selectedContactIds.length} Contacts` :
 `Target ${selectedGroupIds.length} Groups`
 }
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>
 </div>);

}