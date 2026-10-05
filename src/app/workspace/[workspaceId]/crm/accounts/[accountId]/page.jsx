'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Building2,
    Globe,
    Phone,
    Mail,
    MapPin,
    DollarSign,
    Users,
    TrendingUp,
    Clock,
    Plus,
    Edit3,
    Trash2,
    ArrowLeft,
    CheckCircle2,
    ExternalLink,
    Loader2,
    MessageCircle,
    UserPlus,
    Briefcase,
    FileText
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

import { get360AccountDossierAction } from '../../_actions/crm-dossier-actions';
import { createActivityAction } from '../../_actions/activity-actions';
import { deleteAccountAction } from '../../_actions/account-actions';
import { getPipelinesAction } from '../../_actions/pipeline-actions';

import EditAccountModal from '../_components/EditAccountModal';
import CreateContactModal from '../../contacts/_components/CreateContactModal';
import QuickWhatsAppModal from '../../contacts/_components/QuickWhatsAppModal';
import CreateDealModal from '../../pipeline/_components/CreateDealModal';

export default function AccountDossierPage() {
    const params = useParams();
    const router = useRouter();
    const { workspaceId, accountId } = params;

    const [dossier, setDossier] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Active tab
    const [activeTab, setActiveTab] = useState('contacts');

    // Quick Activity Note logger
    const [activityType, setActivityType] = useState('NOTE');
    const [activityTitle, setActivityTitle] = useState('');
    const [activityDesc, setActivityDesc] = useState('');
    const [isLoggingActivity, setIsLoggingActivity] = useState(false);

    // Modals
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
    const [isCreateDealModalOpen, setIsCreateDealModalOpen] = useState(false);
    const [waContact, setWaContact] = useState(null);
    const [isWaModalOpen, setIsWaModalOpen] = useState(false);
    const [pipelines, setPipelines] = useState([]);

    const loadDossier = async () => {
        if (!workspaceId || !accountId) return;
        try {
            setIsLoading(true);
            const res = await get360AccountDossierAction(workspaceId, accountId);
            if (res.success) {
                setDossier(res.data);
            } else {
                toast.error(res.error || "Failed to load account dossier");
            }

            const pipeRes = await getPipelinesAction(workspaceId);
            if (pipeRes.success) setPipelines(pipeRes.data);
        } catch (error) {
            console.error("Dossier load error:", error);
            toast.error("Error loading account dossier");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadDossier();
    }, [workspaceId, accountId]);

    const handleLogActivity = async (e) => {
        e.preventDefault();
        if (!activityTitle.trim()) {
            toast.error("Please enter a note/subject title");
            return;
        }

        setIsLoggingActivity(true);
        try {
            const res = await createActivityAction(workspaceId, {
                accountId,
                type: activityType,
                title: activityTitle.trim(),
                description: activityDesc.trim() || undefined
            });

            if (res.success) {
                toast.success("Activity logged to company timeline");
                setActivityTitle('');
                setActivityDesc('');
                loadDossier();
            } else {
                toast.error(res.error || "Failed to log activity");
            }
        } catch (error) {
            toast.error("Error logging activity");
        } finally {
            setIsLoggingActivity(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!confirm(`Are you sure you want to delete ${dossier?.account?.name}?`)) return;

        try {
            const res = await deleteAccountAction(workspaceId, accountId);
            if (res.success) {
                toast.success("Organization deleted");
                router.push(`/workspace/${workspaceId}/crm/accounts`);
            } else {
                toast.error(res.error || "Failed to delete company");
            }
        } catch (error) {
            toast.error("Error deleting company");
        }
    };

    const formatCurrency = (val) => {
        return `₹ ${Number(val || 0).toLocaleString('en-IN')}`;
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-xs font-semibold text-muted-foreground">Compiling 360° Company Dossier...</p>
            </div>
        );
    }

    if (!dossier?.account) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-lg font-bold">Company Not Found</h2>
                <Button className="mt-4" onClick={() => router.push(`/workspace/${workspaceId}/crm/accounts`)}>
                    Back to Organizations Directory
                </Button>
            </div>
        );
    }

    const { account, analytics } = dossier;

    return (
        <div className="flex flex-col min-h-screen bg-background p-4 lg:p-8 space-y-6">
            {/* Navigation Bar */}
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground hover:text-foreground -ml-2"
                    onClick={() => router.push(`/workspace/${workspaceId}/crm/accounts`)}
                >
                    <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                    Back to Companies
                </Button>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs font-semibold gap-1.5"
                        onClick={() => setIsEditModalOpen(true)}
                    >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit Organization
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-destructive hover:bg-destructive/10"
                        onClick={handleDeleteAccount}
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </div>

            {/* Hero Company Profile Card */}
            <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-xs relative overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Identity & Metadata */}
                    <div className="flex items-start sm:items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-primary/60 text-primary-foreground font-black text-2xl flex items-center justify-center shrink-0 shadow-md">
                            {account.name.charAt(0).toUpperCase()}
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-xl lg:text-2xl font-black text-foreground">
                                    {account.name}
                                </h1>
                                <Badge
                                    variant="secondary"
                                    className={`text-[10px] uppercase font-bold ${
                                        account.rating === 'HOT' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                        account.rating === 'WARM' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                        'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                                    }`}
                                >
                                    {account.rating === 'HOT' ? '🔥 Hot Tier' : account.rating === 'WARM' ? '⚡ Warm Tier' : '❄️ Cold Tier'}
                                </Badge>
                                {account.industry && (
                                    <Badge variant="outline" className="text-[10px] font-semibold">
                                        {account.industry}
                                    </Badge>
                                )}
                            </div>

                            <div className="flex items-center gap-3 pt-1 text-xs text-muted-foreground flex-wrap">
                                {account.domain && (
                                    <a
                                        href={account.website || `https://${account.domain}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-primary hover:underline font-mono"
                                    >
                                        <Globe className="w-3.5 h-3.5" />
                                        {account.domain}
                                        <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                )}
                                {account.phone && (
                                    <span className="inline-flex items-center gap-1.5 font-mono">
                                        <Phone className="w-3.5 h-3.5" />
                                        {account.phone}
                                    </span>
                                )}
                                {account.city && (
                                    <span className="inline-flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {account.city}{account.country ? `, ${account.country}` : ''}
                                    </span>
                                )}
                                <span className="inline-flex items-center gap-1.5">
                                    <Users className="w-3.5 h-3.5" />
                                    {account.size || '11-50'} employees
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Call to Actions */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                        <Button
                            size="sm"
                            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1.5 text-xs shadow-sm"
                            onClick={() => setIsCreateDealModalOpen(true)}
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Deal</span>
                        </Button>
                        <Button
                            size="sm"
                            variant="secondary"
                            className="font-semibold gap-1.5 text-xs"
                            onClick={() => setIsAddContactModalOpen(true)}
                        >
                            <UserPlus className="w-4 h-4" />
                            <span>Add Contact</span>
                        </Button>
                    </div>
                </div>

                {/* Telemetry Metrics Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-border/70">
                    <div>
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase">Lifetime Won Revenue</p>
                        <p className="text-lg font-black text-emerald-500 mt-0.5">{formatCurrency(analytics?.totalWonValue)}</p>
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase">Open Pipeline Value</p>
                        <p className="text-lg font-black text-primary mt-0.5">{formatCurrency(analytics?.openPipelineValue)}</p>
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase">Mapped Decision Makers</p>
                        <p className="text-lg font-black text-foreground mt-0.5">{analytics?.totalContacts || 0} Contacts</p>
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase">Deals Count</p>
                        <p className="text-lg font-black text-foreground mt-0.5">{analytics?.totalDeals || 0} Deals</p>
                    </div>
                </div>
            </div>

            {/* Account Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="bg-muted/70 p-1 rounded-xl">
                    <TabsTrigger value="contacts" className="text-xs font-semibold gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        Contacts & Stakeholders ({account.contacts?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="deals" className="text-xs font-semibold gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5" />
                        Deals ({account.deals?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="timeline" className="text-xs font-semibold gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Activities & Notes ({account.activities?.length || 0})
                    </TabsTrigger>
                </TabsList>

                {/* Tab 1: Contacts */}
                <TabsContent value="contacts" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-foreground">Stakeholders at {account.name}</h3>
                        <Button
                            size="sm"
                            className="h-8 text-xs font-semibold"
                            onClick={() => setIsAddContactModalOpen(true)}
                        >
                            <UserPlus className="w-3.5 h-3.5 mr-1" />
                            Add Contact
                        </Button>
                    </div>

                    {account.contacts?.length === 0 ? (
                        <div className="p-12 text-center text-xs text-muted-foreground border border-dashed border-border rounded-2xl">
                            No contacts currently linked to this company. Add a key stakeholder or decision maker.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {account.contacts.map((c) => (
                                <div
                                    key={c.id}
                                    className="p-4 rounded-2xl bg-card border border-border/70 hover:border-primary/50 transition-colors space-y-3 cursor-pointer group"
                                    onClick={() => router.push(`/workspace/${workspaceId}/crm/contacts/${c.id}`)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-black flex items-center justify-center text-xs shrink-0">
                                                {c.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">
                                                    {c.name}
                                                </h4>
                                                <p className="text-[11px] text-muted-foreground">{c.title || 'Team Member'}</p>
                                            </div>
                                        </div>
                                        <Badge
                                            variant="secondary"
                                            className={`text-[9px] uppercase font-bold ${
                                                c.type === 'LEAD' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'
                                            }`}
                                        >
                                            {c.type}
                                        </Badge>
                                    </div>

                                    <div className="space-y-1 text-xs text-muted-foreground border-t border-border/60 pt-2">
                                        <div className="flex items-center justify-between">
                                            <span className="font-mono">{c.phone}</span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-emerald-500 hover:bg-emerald-500/10"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setWaContact(c);
                                                    setIsWaModalOpen(true);
                                                }}
                                            >
                                                <MessageCircle className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                        {c.email && <div className="truncate">{c.email}</div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Tab 2: Deals */}
                <TabsContent value="deals" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-foreground">Pipeline Deals for {account.name}</h3>
                        <Button
                            size="sm"
                            className="h-8 text-xs font-semibold"
                            onClick={() => setIsCreateDealModalOpen(true)}
                        >
                            <Plus className="w-3.5 h-3.5 mr-1" />
                            Add Deal
                        </Button>
                    </div>

                    {account.deals?.length === 0 ? (
                        <div className="p-12 text-center text-xs text-muted-foreground border border-dashed border-border rounded-2xl">
                            No deals currently associated with this company.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {account.deals.map((deal) => (
                                <div
                                    key={deal.id}
                                    className="p-4 rounded-2xl bg-card border border-border/70 hover:border-primary/50 transition-colors space-y-2 cursor-pointer"
                                    onClick={() => router.push(`/workspace/${workspaceId}/crm/pipeline`)}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <h4 className="font-bold text-xs text-foreground truncate">{deal.title}</h4>
                                        <Badge
                                            variant="outline"
                                            className="text-[10px]"
                                            style={{
                                                borderColor: deal.stage?.color ? `${deal.stage.color}60` : undefined,
                                                backgroundColor: deal.stage?.color ? `${deal.stage.color}15` : undefined
                                            }}
                                        >
                                            {deal.stage?.name || 'Stage'}
                                        </Badge>
                                    </div>
                                    <p className="text-sm font-black text-foreground">{formatCurrency(deal.value)}</p>
                                    <div className="text-[10px] text-muted-foreground flex items-center justify-between pt-1">
                                        <span>Pipeline: {deal.pipeline?.name || 'Sales'}</span>
                                        <span className="text-primary font-semibold flex items-center gap-0.5">
                                            Inspect <ExternalLink className="w-2.5 h-2.5" />
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Tab 3: Timeline & Activities */}
                <TabsContent value="timeline" className="space-y-4">
                    {/* Log Note / Activity Box */}
                    <div className="p-4 rounded-2xl bg-card border border-border/70 space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-foreground">Log Organization Meeting or Note</h3>
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

                        <form onSubmit={handleLogActivity} className="space-y-2.5">
                            <Input
                                placeholder="Activity subject (e.g., Executive alignment meeting)..."
                                value={activityTitle}
                                onChange={(e) => setActivityTitle(e.target.value)}
                                className="h-8 text-xs bg-background"
                            />
                            <Textarea
                                placeholder="Key takeaways, account requirements, next steps..."
                                value={activityDesc}
                                onChange={(e) => setActivityDesc(e.target.value)}
                                rows={2}
                                className="text-xs bg-background resize-none"
                            />
                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    size="sm"
                                    className="h-7 text-xs font-semibold"
                                    disabled={isLoggingActivity || !activityTitle.trim()}
                                >
                                    {isLoggingActivity ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Plus className="w-3.5 h-3.5 mr-1" />}
                                    Log Activity
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* Timeline Stream */}
                    <div className="space-y-3">
                        {account.activities?.length === 0 ? (
                            <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-2xl">
                                No logged activities yet for this company.
                            </div>
                        ) : (
                            account.activities.map((act) => (
                                <div
                                    key={act.id}
                                    className="p-3.5 rounded-2xl bg-card border border-border/70 flex items-start gap-3 text-xs"
                                >
                                    <div className="p-2 rounded-xl bg-muted text-muted-foreground shrink-0 mt-0.5">
                                        {act.type === 'CALL' ? <Phone className="w-4 h-4 text-blue-500" /> :
                                         act.type === 'MEETING' ? <Building2 className="w-4 h-4 text-purple-500" /> :
                                         <FileText className="w-4 h-4 text-primary" />}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-bold text-foreground">{act.title}</span>
                                            <span className="text-[10px] text-muted-foreground">
                                                {new Date(act.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                        {act.description && (
                                            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                                {act.description}
                                            </p>
                                        )}
                                        {act.user && (
                                            <p className="text-[10px] text-muted-foreground/80">
                                                Logged by {act.user.displayName || 'CRM User'}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Edit Account Modal */}
            <EditAccountModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                account={account}
                workspaceId={workspaceId}
                onAccountUpdated={loadDossier}
            />

            {/* Create Contact Modal */}
            <CreateContactModal
                isOpen={isAddContactModalOpen}
                onClose={() => setIsAddContactModalOpen(false)}
                workspaceId={workspaceId}
                onContactCreated={loadDossier}
            />

            {/* Quick WhatsApp Outreach Modal */}
            <QuickWhatsAppModal
                isOpen={isWaModalOpen}
                onClose={() => setIsWaModalOpen(false)}
                contact={waContact}
                workspaceId={workspaceId}
                onMessageSent={loadDossier}
            />

            {/* Create Deal Modal */}
            <CreateDealModal
                isOpen={isCreateDealModalOpen}
                onClose={() => setIsCreateDealModalOpen(false)}
                workspaceId={workspaceId}
                pipelines={pipelines}
                onDealCreated={loadDossier}
            />
        </div>
    );
}
