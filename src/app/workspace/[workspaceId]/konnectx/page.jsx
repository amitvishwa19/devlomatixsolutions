"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { CheckCircle2, MessageCircleDashed, Users, MessageSquare, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAction } from "@/hooks/use-action";
import CampaignList from "./_components/CampaignList";
import DashboardStats from "./_components/DashboardStats";
import RecentActivity from "./_components/RecentActivity";
import { getActivities } from "./_actions/get-activities";
import { getCampaigns } from "./campaigns/_actions/get-campaigns";
import { saveCampaign } from "./campaigns/_actions/save-campaign";
import { deleteCampaign as deleteCampaignAction } from "./campaigns/_actions/delete-campaign";
import { toggleCampaignStatus as toggleCampaignStatusAction } from "./campaigns/_actions/toggle-campaign-status";
import WhatsAppSettingModal from "./_components/WhatsAppSettingModal";
import AccountSwitcher from "./_components/AccountSwitcher";



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

// Removed hardcoded activities constant

export default function DashboardPage() {
    const params = useParams();
    const workspaceId = params.workspaceId;
    const [campaigns, setCampaigns] = useState([]);
    const [activities, setActivities] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editCampaign, setEditCampaign] = useState(null);
    const [waConnectionOpen, setWaConnectionOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activityPage, setActivityPage] = useState(1);
    const [activityPagination, setActivityPagination] = useState({
        totalPages: 1,
        currentPage: 1,
        totalOnPage: 0,
        hasMore: false
    });
    const [error, setError] = useState(null);
    const [isWhatsappSettingOpen, setIsWhatsappSettingOpen] = useState(false);
    const handleWhatsappSettingClose = () => setIsWhatsappSettingOpen(false);

    const { execute: executeGetCampaigns } = useAction(getCampaigns, {
        onSuccess: (data) => {
            const incoming = (data.campaigns || []).map(mapApiCampaignToUI);
            setCampaigns(incoming);
            setLoading(false);
        },
        onError: (error) => {
            setError(error);
            setLoading(false);
        }
    });

    const fetchCampaigns = useCallback(() => {
        if (!workspaceId || workspaceId === '[workspaceId]' || workspaceId === 'undefined') return;

        setLoading(true);
        setError(null);
        executeGetCampaigns({ workspaceId });
    }, [workspaceId, executeGetCampaigns]);


    const { execute: executeGetActivities, isLoading: activitiesLoading } = useAction(getActivities, {
        onSuccess: (data) => {
            if (data.activities) {
                // Map API activities to UI format
                const mapped = data.activities.map(act => ({
                    id: act.id,
                    type: act.type,
                    title: act.title,
                    time: act.time ? new Date(act.time).toLocaleString() : 'Just now',
                    description: act.description,
                    color: act.type === 'success' ? 'text-emerald-400' : act.type === 'message' ? 'text-blue-400' : 'text-amber-400',
                    bg: act.type === 'success' ? 'bg-emerald-400/10' : act.type === 'message' ? 'bg-blue-400/10' : 'bg-amber-400/10'
                }));
                setActivities(mapped);
                if (data.pagination) {
                    setActivityPagination(data.pagination);
                }
            }
        },
        onError: (error) => {
            console.error('Failed to fetch WA activities:', error);
        }
    });

    const fetchActivities = useCallback((page = 1) => {
        if (!workspaceId || workspaceId === '[workspaceId]' || workspaceId === 'undefined') return;
        executeGetActivities({ workspaceId, page, pageSize: 5 });
    }, [workspaceId, executeGetActivities]);

    useEffect(() => {
        if (workspaceId && workspaceId !== '[workspaceId]') {
            fetchCampaigns();
            fetchActivities(activityPage);
        }

        const handleAccountSwitch = () => {
            fetchCampaigns();
            fetchActivities(activityPage);
        };

        window.addEventListener('wa-account-switched', handleAccountSwitch);
        return () => window.removeEventListener('wa-account-switched', handleAccountSwitch);
    }, [workspaceId, activityPage, fetchCampaigns, fetchActivities]);

    const refresh = () => fetchCampaigns();

    const { execute: executeToggleStatus } = useAction(toggleCampaignStatusAction, {
        onSuccess: () => refresh()
    });

    const toggleCampaignStatus = (campaign) => {
        const nextStatus = campaign.status === "active" ? "paused" : "active";
        executeToggleStatus({
            workspaceId,
            id: campaign.id,
            status: nextStatus
        });
    };

    const { execute: executeDeleteCampaign } = useAction(deleteCampaignAction, {
        onSuccess: () => refresh(),
        onError: (error) => setError(error)
    });

    const deleteCampaign = (id) => {
        executeDeleteCampaign({ workspaceId, id });
    };

    const { execute: executeSaveCampaign } = useAction(saveCampaign, {
        onSuccess: () => {
            setDialogOpen(false);
            setEditCampaign(null);
            refresh();
        }
    });

    const handleSaveCampaign = (data) => {
        executeSaveCampaign({
            workspaceId,
            id: editCampaign?.id,
            name: data.name,
            messageTemplate: data.template,
            status: data.status,
            description: "" // Add description if needed
        });
    };

    return (
        <div className="space-y-4 animate-in fade-in duration-500 p-4">


            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
                    <p className="text-xs text-muted-foreground mt-1">Overview of your WhatsApp campaigns</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        className="gap-2"
                        asChild>

                        <a href={`/workspace/${workspaceId}/wa-cloud-api/contacts`}>
                            <Users className="w-4 h-4" />
                            <span className="hidden sm:inline">Contacts</span>
                        </a>
                    </Button>

                    {/* WhatsApp Connection Status Badge */}
                    <Button
                        variant=""
                        className="gap-2 cursor-pointer border"
                        onClick={() => setIsWhatsappSettingOpen(true)}
                    >
                        <MessageCircleDashed className="w-4 h-4" />
                        <span className="hidden sm:inline">Connect WA</span>
                    </Button>

                    <AccountSwitcher />
                </div>
            </div>

            <DashboardStats workspaceId={workspaceId} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold text-foreground">
                            Campaigns <span className="text-sm text-muted-foreground">({campaigns.length})</span>
                        </h3>
                    </div>

                    {loading ?
                        <div className="bg-card border border-border rounded-md overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border text-left">
                                            {[1, 2, 3, 4, 5, 6, 7].map(i => (
                                                <th key={i} className="px-6 py-4">
                                                    <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {[1, 2, 3].map(i => (
                                            <tr key={i}>
                                                {[1, 2, 3, 4, 5, 6, 7].map(j => (
                                                    <td key={j} className="px-6 py-4">
                                                        <div className="h-4 w-full bg-muted animate-pulse rounded" />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div> :
                        error ?
                            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                                {error}
                            </div> :

                            campaigns.length === 0 ?
                                <div className="flex flex-col items-center justify-center py-12 px-4 text-center border rounded-lg border-dashed border-border bg-card/50">
                                    <MessageCircleDashed className="w-12 h-12 text-muted-foreground/50 mb-4" />
                                    <h3 className="text-lg font-medium text-foreground">No campaigns found</h3>
                                    <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                                        You haven't created any WhatsApp campaigns yet. Head to the Bulk Sender to start your first broadcast.
                                    </p>
                                    <Button variant="outline" className="mt-6" asChild>
                                        <a href={`/workspace/${workspaceId}/wa-cloud-api/bulk-sender`}>Go to Bulk Sender</a>
                                    </Button>
                                </div> :
                                <CampaignList
                                    campaigns={campaigns}
                                    onToggleStatus={(id) => {
                                        const c = campaigns.find((c) => c.id === id);
                                        if (c) toggleCampaignStatus(c);
                                    }}
                                    onEdit={(c) => {
                                        setEditCampaign(c);
                                        setDialogOpen(true);
                                    }}
                                    onDelete={(id) => {
                                        if (window.confirm("Delete this campaign? This cannot be undone.")) {
                                            deleteCampaign(id);
                                        }
                                    }} />

                    }
                </div>

                <div className="lg:col-span-1 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold text-foreground">
                            Recent Activity <span className="text-sm text-muted-foreground">({activities.length})</span>
                        </h3>
                    </div>
                    <RecentActivity
                        activities={activities}
                        loading={activitiesLoading}
                        pagination={activityPagination}
                        onPageChange={setActivityPage}
                    />
                </div>
            </div>


            <WhatsAppSettingModal
                open={isWhatsappSettingOpen}
                onClose={handleWhatsappSettingClose}
            />


        </div>);

}

