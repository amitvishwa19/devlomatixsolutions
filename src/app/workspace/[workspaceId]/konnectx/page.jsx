"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { 
    MessageSquare, Send, Zap, Users, ShieldCheck, RefreshCw, 
    Plus, Sparkles, AlertCircle, Bot, Workflow, BarChart3, Settings2,
    CheckCircle2, Radio
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAction } from "@/hooks/use-action";
import { toast } from "sonner";
import { motion } from "framer-motion";

import DashboardStats from "./_components/DashboardStats";
import DashboardAnalyticsVisualizer from "./_components/DashboardAnalyticsVisualizer";
import KonnectxSuiteLaunchpad from "./_components/KonnectxSuiteLaunchpad";
import CampaignList from "./_components/CampaignList";
import RecentActivity from "./_components/RecentActivity";
import QuickTestMessageModal from "./_components/QuickTestMessageModal";
import AccountSwitcher from "./_components/AccountSwitcher";
import CreateCampaignDialog from "./_components/CreateCampaignDialog";
import WhatsAppSettingModal from "./_components/WhatsAppSettingModal";
import DeleteCampaignDialog from "./campaigns/_cpmponents/DeleteCampaignDialog";

import { getActivities } from "./_actions/get-activities";
import { getCampaigns } from "./campaigns/_actions/get-campaigns";
import { saveCampaign } from "./campaigns/_actions/save-campaign";
import { deleteCampaign as deleteCampaignAction } from "./campaigns/_actions/delete-campaign";
import { toggleCampaignStatus as toggleCampaignStatusAction } from "./campaigns/_actions/toggle-campaign-status";
import { syncTemplates } from "./template/_actions/sync-templates";

const mapApiCampaignToUI = (campaign) => ({
    id: campaign.id,
    name: campaign.name,
    status: campaign.status?.toLowerCase ? campaign.status.toLowerCase() : campaign.status,
    template: typeof campaign.template === "string" ? campaign.template : JSON.stringify(campaign.template || ""),
    total: campaign.total,
    sent: campaign.sent,
    successRate: campaign.successRate,
    createdAt: campaign.createdAt
});

export default function DashboardPage() {
    const params = useParams();
    const router = useRouter();
    const workspaceId = params.workspaceId;

    const [campaigns, setCampaigns] = useState([]);
    const [activities, setActivities] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editCampaign, setEditCampaign] = useState(null);
    const [loadingCampaigns, setLoadingCampaigns] = useState(false);
    const [activityPage, setActivityPage] = useState(1);
    const [activityPagination, setActivityPagination] = useState({
        totalPages: 1,
        currentPage: 1,
        totalOnPage: 0,
        hasMore: false
    });
    const [campaignError, setCampaignError] = useState(null);

    const [isTestModalOpen, setIsTestModalOpen] = useState(false);
    const [isWhatsappSettingOpen, setIsWhatsappSettingOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [campaignToDelete, setCampaignToDelete] = useState(null);
    const [isSyncingTemplates, setIsSyncingTemplates] = useState(false);

    // 1. Fetch Campaigns
    const { execute: executeGetCampaigns } = useAction(getCampaigns, {
        onSuccess: (data) => {
            const incoming = (data.campaigns || []).map(mapApiCampaignToUI);
            setCampaigns(incoming);
            setLoadingCampaigns(false);
        },
        onError: (error) => {
            setCampaignError(error);
            setLoadingCampaigns(false);
        }
    });

    const fetchCampaigns = useCallback(() => {
        if (!workspaceId || workspaceId === "[workspaceId]" || workspaceId === "undefined") return;
        setLoadingCampaigns(true);
        setCampaignError(null);
        executeGetCampaigns({ workspaceId });
    }, [workspaceId, executeGetCampaigns]);

    // 2. Fetch Recent Activities
    const { execute: executeGetActivities, isLoading: activitiesLoading } = useAction(getActivities, {
        onSuccess: (data) => {
            if (data.activities) {
                const mapped = data.activities.map((act) => ({
                    id: act.id,
                    type: act.type,
                    title: act.title,
                    time: act.time ? new Date(act.time).toLocaleString() : "Just now",
                    description: act.description,
                }));
                setActivities(mapped);
                if (data.pagination) {
                    setActivityPagination(data.pagination);
                }
            }
        },
        onError: (error) => {
            console.error("Failed to fetch WA activities:", error);
        }
    });

    const fetchActivities = useCallback((page = 1) => {
        if (!workspaceId || workspaceId === "[workspaceId]" || workspaceId === "undefined") return;
        executeGetActivities({ workspaceId, page, pageSize: 6 });
    }, [workspaceId, executeGetActivities]);

    useEffect(() => {
        if (workspaceId && workspaceId !== "[workspaceId]") {
            fetchCampaigns();
            fetchActivities(activityPage);
        }

        const handleAccountSwitch = () => {
            fetchCampaigns();
            fetchActivities(activityPage);
        };

        window.addEventListener("wa-account-switched", handleAccountSwitch);
        return () => window.removeEventListener("wa-account-switched", handleAccountSwitch);
    }, [workspaceId, activityPage, fetchCampaigns, fetchActivities]);

    // 3. Sync Templates from Meta
    const { execute: executeSyncTemplates } = useAction(syncTemplates, {
        onSuccess: (res) => {
            setIsSyncingTemplates(false);
            toast.success("Meta templates synchronized successfully!", {
                description: "All approved and pending templates are updated."
            });
            fetchCampaigns();
            fetchActivities(1);
        },
        onError: (err) => {
            setIsSyncingTemplates(false);
            toast.error(err || "Failed to sync templates from Meta Graph API");
        }
    });

    const handleSyncTemplates = () => {
        setIsSyncingTemplates(true);
        executeSyncTemplates({ workspaceId });
    };

    // 4. Toggle Campaign Status
    const { execute: executeToggleStatus } = useAction(toggleCampaignStatusAction, {
        onSuccess: () => {
            fetchCampaigns();
            toast.success("Campaign status updated");
        }
    });

    const toggleCampaignStatus = (campaign) => {
        const nextStatus = campaign.status === "active" ? "paused" : "active";
        executeToggleStatus({
            workspaceId,
            id: campaign.id,
            status: nextStatus
        });
    };

    // 5. Delete Campaign
    const { execute: executeDeleteCampaign } = useAction(deleteCampaignAction, {
        onSuccess: () => {
            fetchCampaigns();
            setDeleteDialogOpen(false);
            setCampaignToDelete(null);
            setIsDeleting(false);
            toast.success("Campaign deleted");
        },
        onError: (error) => {
            setCampaignError(error);
            setDeleteDialogOpen(false);
            setCampaignToDelete(null);
            setIsDeleting(false);
            toast.error(error || "Failed to delete campaign");
        }
    });

    const handleDeleteClick = (id) => {
        const campaign = campaigns.find((c) => c.id === id);
        if (campaign) {
            setCampaignToDelete(campaign);
            setDeleteDialogOpen(true);
        }
    };

    const confirmDelete = () => {
        if (!campaignToDelete) return;
        setIsDeleting(true);
        executeDeleteCampaign({ workspaceId, id: campaignToDelete.id });
    };

    // 6. Save Campaign
    const { execute: executeSaveCampaign } = useAction(saveCampaign, {
        onSuccess: () => {
            setDialogOpen(false);
            setEditCampaign(null);
            fetchCampaigns();
            toast.success("Campaign saved successfully");
        },
        onError: (err) => {
            toast.error(err || "Failed to save campaign");
        }
    });

    const handleSaveCampaign = (data) => {
        executeSaveCampaign({
            workspaceId,
            id: editCampaign?.id,
            name: data.name,
            messageTemplate: data.template,
            status: data.status,
            description: ""
        });
    };

    return (
        <div className="space-y-5 p-4 md:p-6 pb-12 animate-in fade-in duration-300">
            {/* 1. Hero Command Center Banner */}
            <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="relative p-5 rounded-2xl overflow-hidden bg-gradient-to-br from-card via-card to-secondary/30 border border-border/70 shadow-xs"
            >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Branding & Status */}
                    <div className="space-y-1.5 max-w-2xl">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold tracking-wider uppercase border border-emerald-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Meta Cloud API v21.0
                            </span>
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono bg-secondary/60 px-2 py-0.5 rounded-md border border-border/50">
                                <Radio className="w-3 h-3 text-emerald-500" /> Webhook Live
                            </span>
                        </div>

                        <h1 className="text-xl md:text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
                            KonnectX Command Hub
                        </h1>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Control your WhatsApp Business broadcasts, 2-way AI customer chats, Meta interactive form flows, and audience deliverability from one unified console.
                        </p>
                    </div>

                    {/* Right: Account Switcher & Direct Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                        <AccountSwitcher />

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setIsTestModalOpen(true)}
                            className="h-8 text-xs font-semibold gap-1.5 border-border/70 hover:bg-secondary shadow-2xs"
                        >
                            <Send className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Quick Test</span>
                        </Button>

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleSyncTemplates}
                            disabled={isSyncingTemplates}
                            className="h-8 text-xs font-semibold gap-1.5 border-border/70 hover:bg-secondary shadow-2xs"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 text-blue-500 ${isSyncingTemplates ? "animate-spin" : ""}`} />
                            <span>{isSyncingTemplates ? "Syncing..." : "Sync Meta"}</span>
                        </Button>

                        <Button
                            size="sm"
                            onClick={() => router.push(`/workspace/${workspaceId}/konnectx/campaigns`)}
                            className="h-8 text-xs font-semibold gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>New Broadcast</span>
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* 2. Executive KPI & Telemetry Cards */}
            <DashboardStats workspaceId={workspaceId} />

            {/* 3. Interactive Deliverability & Telemetry Visualizer */}
            <DashboardAnalyticsVisualizer workspaceId={workspaceId} />

            {/* 4. KonnectX Suite Tools Launchpad */}
            <KonnectxSuiteLaunchpad workspaceId={workspaceId} />

            {/* 5. Broadcast Campaigns & Real-time Live Activity Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Left Column (2 Cols): Campaign Management Table */}
                <div className="lg:col-span-2 space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                <Zap className="w-4 h-4 text-emerald-500" /> Broadcast Campaigns
                            </h3>
                            <p className="text-[11px] text-muted-foreground">Manage and track your active WhatsApp broadcasts</p>
                        </div>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDialogOpen(true)}
                            className="h-7 text-xs font-semibold gap-1.5 border-border/70 hover:bg-secondary"
                        >
                            <Plus className="w-3 h-3 text-emerald-500" />
                            <span>Quick Campaign</span>
                        </Button>
                    </div>

                    {campaignError ? (
                        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{campaignError}</span>
                        </div>
                    ) : (
                        <CampaignList
                            campaigns={campaigns}
                            workspaceId={workspaceId}
                            onToggleStatus={(id) => {
                                const c = campaigns.find((item) => item.id === id);
                                if (c) toggleCampaignStatus(c);
                            }}
                            onEdit={(c) => {
                                setEditCampaign(c);
                                setDialogOpen(true);
                            }}
                            onDelete={handleDeleteClick}
                        />
                    )}
                </div>

                {/* Right Column (1 Col): Live Event Activity Stream */}
                <div className="lg:col-span-1 space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-primary" /> Live Activity Feed
                            </h3>
                            <p className="text-[11px] text-muted-foreground">Real-time webhook messages & approvals</p>
                        </div>
                    </div>

                    <RecentActivity
                        activities={activities}
                        loading={activitiesLoading}
                        pagination={activityPagination}
                        onPageChange={setActivityPage}
                    />
                </div>
            </div>

            {/* 6. Modals & Dialogs */}
            {/* Quick Test Message Modal */}
            <QuickTestMessageModal
                open={isTestModalOpen}
                onOpenChange={setIsTestModalOpen}
                workspaceId={workspaceId}
                onSentSuccess={() => {
                    fetchCampaigns();
                    fetchActivities(1);
                }}
            />

            {/* Quick Campaign Dialog */}
            <CreateCampaignDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                editCampaign={editCampaign}
                onSave={handleSaveCampaign}
            />

            {/* WhatsApp Setting Modal */}
            <WhatsAppSettingModal
                open={isWhatsappSettingOpen}
                onClose={() => setIsWhatsappSettingOpen(false)}
            />

            {/* Delete Campaign Confirmation Dialog */}
            <DeleteCampaignDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                campaign={campaignToDelete}
                isDeleting={isDeleting}
                onConfirm={confirmDelete}
            />
        </div>
    );
}
