'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Users,
    User,
    Building2,
    Phone,
    Mail,
    MapPin,
    Calendar,
    MessageCircle,
    Briefcase,
    TrendingUp,
    Clock,
    Plus,
    Send,
    Edit3,
    Trash2,
    ArrowLeft,
    CheckCircle2,
    DollarSign,
    FileText,
    Sparkles,
    ExternalLink,
    Loader2,
    Layers,
    Tag,
    Share2,
    Award
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

import { get360ContactDossierAction } from '../../_actions/crm-dossier-actions';
import { createActivityAction } from '../../_actions/activity-actions';
import { sendWhatsAppFromCrmAction, convertCandidateToLeadAction } from '../../_actions/crm-bridge-actions';
import { deleteCrmContactAction } from '../../_actions/contact-actions';

import QuickWhatsAppModal from '../_components/QuickWhatsAppModal';
import EditContactModal from '../_components/EditContactModal';
import CreateDealModal from '../../pipeline/_components/CreateDealModal';
import { getPipelinesAction } from '../../_actions/pipeline-actions';

export default function ContactDossierPage() {
    const params = useParams();
    const router = useRouter();
    const { workspaceId, contactId } = params;

    const [dossier, setDossier] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Active tab
    const [activeTab, setActiveTab] = useState('activity');

    // Quick Note / Activity logger
    const [activityType, setActivityType] = useState('NOTE');
    const [activityTitle, setActivityTitle] = useState('');
    const [activityDesc, setActivityDesc] = useState('');
    const [isLoggingActivity, setIsLoggingActivity] = useState(false);

    // Live WhatsApp reply box
    const [inlineWaText, setInlineWaText] = useState('');
    const [isSendingInlineWa, setIsSendingInlineWa] = useState(false);

    // Modals
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isWaModalOpen, setIsWaModalOpen] = useState(false);
    const [isCreateDealModalOpen, setIsCreateDealModalOpen] = useState(false);
    const [pipelines, setPipelines] = useState([]);

    const loadDossier = async () => {
        if (!workspaceId || !contactId) return;
        try {
            setIsLoading(true);
            const res = await get360ContactDossierAction(workspaceId, contactId);
            if (res.success) {
                setDossier(res.data);
            } else {
                toast.error(res.error || "Failed to load contact dossier");
            }

            // Fetch pipelines for deal creation
            const pipeRes = await getPipelinesAction(workspaceId);
            if (pipeRes.success) setPipelines(pipeRes.data);
        } catch (error) {
            console.error("Dossier load error:", error);
            toast.error("Error loading dossier data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadDossier();
    }, [workspaceId, contactId]);

    const handleLogActivity = async (e) => {
        e.preventDefault();
        if (!activityTitle.trim()) {
            toast.error("Please enter a note/subject title");
            return;
        }

        setIsLoggingActivity(true);
        try {
            const res = await createActivityAction(workspaceId, {
                contactId,
                accountId: dossier?.contact?.accountId || undefined,
                type: activityType,
                title: activityTitle.trim(),
                description: activityDesc.trim() || undefined
            });

            if (res.success) {
                toast.success("Activity logged to timeline");
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

    const handleSendInlineWhatsApp = async () => {
        if (!inlineWaText.trim()) return;
        if (!dossier?.contact?.phone) {
            toast.error("Contact does not have a phone number");
            return;
        }

        setIsSendingInlineWa(true);
        try {
            const res = await sendWhatsAppFromCrmAction(workspaceId, {
                contactId,
                phone: dossier.contact.phone,
                message: inlineWaText.trim()
            });

            if (res.success) {
                toast.success("WhatsApp message dispatched!");
                setInlineWaText('');
                loadDossier();
            } else {
                toast.error(res.error || "Failed to send WhatsApp message");
            }
        } catch (error) {
            toast.error("Error sending WhatsApp message");
        } finally {
            setIsSendingInlineWa(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${dossier?.contact?.name}?`)) return;

        try {
            const res = await deleteCrmContactAction(workspaceId, contactId);
            if (res.success) {
                toast.success("Contact deleted");
                router.push(`/workspace/${workspaceId}/crm/contacts`);
            } else {
                toast.error(res.error || "Failed to delete contact");
            }
        } catch (error) {
            toast.error("Error deleting contact");
        }
    };

    const formatCurrency = (val) => {
        return `₹ ${Number(val || 0).toLocaleString('en-IN')}`;
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-xs font-semibold text-muted-foreground">Compiling 360° Contact Dossier...</p>
            </div>
        );
    }

    if (!dossier?.contact) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-lg font-bold">Contact Not Found</h2>
                <Button className="mt-4" onClick={() => router.push(`/workspace/${workspaceId}/crm/contacts`)}>
                    Back to Contacts Directory
                </Button>
            </div>
        );
    }

    const { contact, whatsappMessages = [], candidateProfile, analytics } = dossier;

    return (
        <div className="flex flex-col min-h-screen bg-background p-4 lg:p-8 space-y-6">
            {/* Top Navigation & Breadcrumb */}
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground hover:text-foreground -ml-2"
                    onClick={() => router.push(`/workspace/${workspaceId}/crm/contacts`)}
                >
                    <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                    Back to Contacts
                </Button>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs font-semibold gap-1.5"
                        onClick={() => setIsEditModalOpen(true)}
                    >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit Profile
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-destructive hover:bg-destructive/10"
                        onClick={handleDelete}
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </div>

            {/* Hero Profile Card */}
            <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-xs relative overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Identity & Metadata */}
                    <div className="flex items-start sm:items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-primary/60 text-primary-foreground font-black text-2xl flex items-center justify-center shrink-0 shadow-md">
                            {contact.name.charAt(0).toUpperCase()}
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-xl lg:text-2xl font-black text-foreground">
                                    {contact.name}
                                </h1>
                                <Badge
                                    variant="secondary"
                                    className={`text-[10px] uppercase font-bold ${
                                        contact.type === 'LEAD' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                        contact.type === 'CLIENT' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                        'bg-muted text-muted-foreground'
                                    }`}
                                >
                                    {contact.type || 'CONTACT'}
                                </Badge>
                                {candidateProfile && (
                                    <Badge className="bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 text-[10px] font-bold gap-1">
                                        <Briefcase className="w-3 h-3" />
                                        ATS Candidate
                                    </Badge>
                                )}
                            </div>

                            <p className="text-xs text-muted-foreground font-medium flex items-center gap-2 flex-wrap">
                                <span>{contact.title || 'Independent Contact'}</span>
                                {contact.account && (
                                    <>
                                        <span>•</span>
                                        <Link
                                            href={`/workspace/${workspaceId}/crm/accounts/${contact.account.id}`}
                                            className="text-primary hover:underline font-bold inline-flex items-center gap-1"
                                        >
                                            <Building2 className="w-3.5 h-3.5" />
                                            {contact.account.name}
                                        </Link>
                                    </>
                                )}
                            </p>

                            {/* Contact Badges */}
                            <div className="flex items-center gap-3 pt-2 text-xs text-muted-foreground flex-wrap">
                                <span className="inline-flex items-center gap-1.5 font-mono text-foreground font-semibold">
                                    <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                                    {contact.phone}
                                </span>
                                {contact.email && (
                                    <span className="inline-flex items-center gap-1.5">
                                        <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                                        {contact.email}
                                    </span>
                                )}
                                {contact.address && (
                                    <span className="inline-flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                                        {contact.address}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Call to Actions */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                        <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5 text-xs shadow-sm"
                            onClick={() => setIsWaModalOpen(true)}
                        >
                            <MessageCircle className="w-4 h-4" />
                            <span>WhatsApp Outreach</span>
                        </Button>
                        <Button
                            size="sm"
                            variant="secondary"
                            className="font-semibold gap-1.5 text-xs"
                            onClick={() => setIsCreateDealModalOpen(true)}
                        >
                            <Plus className="w-4 h-4" />
                            <span>Create Deal</span>
                        </Button>
                    </div>
                </div>

                {/* Telemetry Metrics Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-border/70">
                    <div>
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase">Lifetime Won Value</p>
                        <p className="text-lg font-black text-emerald-500 mt-0.5">{formatCurrency(analytics?.totalWonValue)}</p>
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase">Active Deals</p>
                        <p className="text-lg font-black text-foreground mt-0.5">{analytics?.activeDealsCount || 0}</p>
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase">WhatsApp Activity</p>
                        <p className="text-lg font-black text-foreground mt-0.5">{whatsappMessages.length} Messages</p>
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase">Last Interaction</p>
                        <p className="text-xs font-bold text-foreground mt-1.5">
                            {contact.lastInteraction ? new Date(contact.lastInteraction).toLocaleDateString() : 'None logged'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Dossier Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="bg-muted/70 p-1 rounded-xl">
                    <TabsTrigger value="activity" className="text-xs font-semibold gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Timeline & Notes ({contact.crmActivities?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="whatsapp" className="text-xs font-semibold gap-1.5">
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                        KonnectX WhatsApp ({whatsappMessages.length})
                    </TabsTrigger>
                    <TabsTrigger value="deals" className="text-xs font-semibold gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5" />
                        Deals ({contact.deals?.length || 0})
                    </TabsTrigger>
                    {candidateProfile && (
                        <TabsTrigger value="ats" className="text-xs font-semibold gap-1.5 text-indigo-500">
                            <Briefcase className="w-3.5 h-3.5" />
                            ATS Candidate Profile
                        </TabsTrigger>
                    )}
                </TabsList>

                {/* Tab 1: Activity & Notes */}
                <TabsContent value="activity" className="space-y-4">
                    {/* Log Note / Call Box */}
                    <div className="p-4 rounded-2xl bg-card border border-border/70 space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-foreground">Log New Activity or Call Notes</h3>
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
                                placeholder="Activity subject (e.g., Follow up call on pricing proposal)..."
                                value={activityTitle}
                                onChange={(e) => setActivityTitle(e.target.value)}
                                className="h-8 text-xs bg-background"
                            />
                            <Textarea
                                placeholder="Add key discussion points, next steps..."
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

                    {/* Timeline */}
                    <div className="space-y-3">
                        {contact.crmActivities?.length === 0 ? (
                            <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-2xl">
                                No logged activities yet for this contact.
                            </div>
                        ) : (
                            contact.crmActivities.map((act) => (
                                <div
                                    key={act.id}
                                    className="p-3.5 rounded-2xl bg-card border border-border/70 flex items-start gap-3 text-xs"
                                >
                                    <div className="p-2 rounded-xl bg-muted text-muted-foreground shrink-0 mt-0.5">
                                        {act.type === 'WHATSAPP_MSG' ? <MessageCircle className="w-4 h-4 text-emerald-500" /> :
                                         act.type === 'CALL' ? <Phone className="w-4 h-4 text-blue-500" /> :
                                         act.type === 'MEETING' ? <Calendar className="w-4 h-4 text-purple-500" /> :
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

                {/* Tab 2: Live KonnectX WhatsApp Thread */}
                <TabsContent value="whatsapp" className="space-y-4">
                    <div className="p-4 rounded-3xl bg-card border border-border/80 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-border/60">
                            <div>
                                <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                    <MessageCircle className="w-4 h-4 text-emerald-500" />
                                    <span>KonnectX Live WhatsApp Synchronized Thread</span>
                                </h3>
                                <p className="text-[11px] text-muted-foreground">
                                    Synced in real-time with WhatsApp Cloud API ({contact.phone})
                                </p>
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                                onClick={() => setIsWaModalOpen(true)}
                            >
                                <Sparkles className="w-3.5 h-3.5 mr-1" />
                                Template Outreach
                            </Button>
                        </div>

                        {/* Messages Stream */}
                        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                            {whatsappMessages.length === 0 ? (
                                <div className="py-12 text-center text-xs text-muted-foreground">
                                    No WhatsApp conversations found for {contact.phone}. Send a message below to initiate chat.
                                </div>
                            ) : (
                                [...whatsappMessages].reverse().map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex flex-col ${msg.fromMe ? 'items-end' : 'items-start'}`}
                                    >
                                        <div
                                            className={`max-w-[75%] p-3 rounded-2xl text-xs ${
                                                msg.fromMe
                                                    ? 'bg-emerald-600 text-white rounded-br-xs shadow-xs'
                                                    : 'bg-muted text-foreground rounded-bl-xs'
                                            }`}
                                        >
                                            <p className="whitespace-pre-wrap">{msg.text}</p>
                                            <p className={`text-[9px] mt-1 text-right ${msg.fromMe ? 'text-emerald-200' : 'text-muted-foreground'}`}>
                                                {msg.timestamp ? new Date(Number(msg.timestamp)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Inline Quick Reply Input */}
                        <div className="flex items-center gap-2 pt-2 border-t border-border/60">
                            <Input
                                placeholder="Type WhatsApp reply to contact..."
                                value={inlineWaText}
                                onChange={(e) => setInlineWaText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendInlineWhatsApp();
                                    }
                                }}
                                className="text-xs bg-background"
                            />
                            <Button
                                size="sm"
                                onClick={handleSendInlineWhatsApp}
                                disabled={isSendingInlineWa || !inlineWaText.trim()}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9 shrink-0 gap-1.5"
                            >
                                {isSendingInlineWa ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                                Send
                            </Button>
                        </div>
                    </div>
                </TabsContent>

                {/* Tab 3: Deals */}
                <TabsContent value="deals" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-foreground">Pipeline Deals Associated with {contact.name}</h3>
                        <Button
                            size="sm"
                            className="h-8 text-xs font-semibold"
                            onClick={() => setIsCreateDealModalOpen(true)}
                        >
                            <Plus className="w-3.5 h-3.5 mr-1" />
                            Add Deal
                        </Button>
                    </div>

                    {contact.deals?.length === 0 ? (
                        <div className="p-12 text-center text-xs text-muted-foreground border border-dashed border-border rounded-2xl">
                            No deals currently associated with this contact.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {contact.deals.map((deal) => (
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

                {/* Tab 4: Hireflow ATS Recruitment Bridge */}
                {candidateProfile && (
                    <TabsContent value="ats" className="space-y-4">
                        <div className="p-5 rounded-3xl bg-card border border-border/80 space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-border/60">
                                <div>
                                    <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                        <Briefcase className="w-4 h-4 text-indigo-500" />
                                        <span>Hireflow ATS Candidate Profile</span>
                                    </h3>
                                    <p className="text-[11px] text-muted-foreground">
                                        Synchronized recruitment application telemetry
                                    </p>
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                                    onClick={() => router.push(`/workspace/${workspaceId}/hireflow/candidates`)}
                                >
                                    Open in Hireflow ATS
                                    <ExternalLink className="w-3 h-3 ml-1" />
                                </Button>
                            </div>

                            {/* Skills & Details */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                <div>
                                    <p className="font-semibold text-muted-foreground mb-1">Candidate Skills</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {(candidateProfile.skills || []).map(skill => (
                                            <span key={skill} className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 font-medium text-[11px]">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="font-semibold text-muted-foreground mb-1">Applications & Jobs</p>
                                    <div className="space-y-1.5">
                                        {(candidateProfile.applications || []).map(app => (
                                            <div key={app.id} className="p-2 rounded-xl bg-muted/40 text-[11px] flex items-center justify-between">
                                                <span className="font-bold">{app.job?.title || 'General Application'}</span>
                                                <Badge variant="secondary" className="text-[10px] uppercase font-semibold">
                                                    {app.status}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                )}
            </Tabs>

            {/* Edit Contact Modal */}
            <EditContactModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                contact={contact}
                workspaceId={workspaceId}
                onContactUpdated={loadDossier}
            />

            {/* Quick WhatsApp Outreach Modal */}
            <QuickWhatsAppModal
                isOpen={isWaModalOpen}
                onClose={() => setIsWaModalOpen(false)}
                contact={contact}
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
