"use client";

import { use } from "react";
import { useEffect, useState } from "react";
import { CheckCircle2, MessageCircleDashed, Users, MessageSquare, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";




import CampaignList from "./_components/CampaignList";

import DashboardStats from "./_components/DashboardStats";
import RecentActivity from "./_components/RecentActivity";
import WhatsAppConnectionModal from "./_components/WhatsAppConnectionModal";
//import WhatsAppConnectionModal from"./_components/WhatsAppConnectionModal";


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

const activities = [
    {
        id: 1,
        type: "success",
        title: "Summer Sale Promo completed",
        time: "2 hours ago",
        icon: CheckCircle2,
        color: "text-emerald-400",
        bg: "bg-emerald-400/10"
    },
    {
        id: 2,
        type: "message",
        title: "New reply from +1 (555) 0123",
        time: "4 hours ago",
        icon: MessageSquare,
        color: "text-blue-400",
        bg: "bg-blue-400/10"
    },
    {
        id: 3,
        type: "alert",
        title: "API rate limit warning",
        time: "5 hours ago",
        icon: AlertCircle,
        color: "text-amber-400",
        bg: "bg-amber-400/10"
    }];

export default function DashboardPage({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const workspaceId = params.workspaceId;
    const [campaigns, setCampaigns] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editCampaign, setEditCampaign] = useState(null);
    const [waConnectionOpen, setWaConnectionOpen] = useState(false);
    const [waStatus, setWaStatus] = useState('welcome');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchCampaigns = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/wa/campaigns", { cache: 'no-store' });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Failed to fetch campaigns");
            }
            const incoming = (data.campaigns || []).map(mapApiCampaignToUI);
            console.debug("Fetched campaigns:", incoming.length, incoming.map((c) => c.id));
            setCampaigns(incoming);
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    };

    const fetchWaStatus = async () => {
        try {
            console.log('fetching whatsapp status');
            const res = await fetch('/api/wa/auth');
            const data = await res.json();
            setWaStatus(data.status || 'welcome');
        } catch (err) {
            console.error('Failed to fetch WA status:', err);
        }
    };

    useEffect(() => {
        fetchCampaigns();
        fetchWaStatus();
    }, []);

    const refresh = () => fetchCampaigns();

    const toggleCampaignStatus = async (campaign) => {
        const nextStatus = campaign.status === "active" ? "paused" : "active";
        try {
            await fetch(`/api/wa/campaigns/${campaign.id}`, {
                method: "PATCH",
                cache: 'no-store',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: nextStatus })
            });
            await refresh();
        } catch (err) {
            console.error("Failed to toggle campaign status", err);
        }
    };

    const deleteCampaign = async (id) => {
        try {
            const res = await fetch(`/api/wa/campaigns/${id}`, { method: "DELETE", cache: 'no-store' });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.error || "Failed to delete campaign");
            }
            await refresh();
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            console.error("Failed to delete campaign", message);
            setError(message);
        }
    };

    const handleSaveCampaign = async (data) => {
        try {
            const body = {
                name: data.name,
                messageTemplate: data.template,
                status: data.status
            };

            if (editCampaign) {
                await fetch(`/api/wa/campaigns/${editCampaign.id}`, {
                    method: "PATCH",
                    cache: 'no-store',
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body)
                });
            } else {
                await fetch("/api/wa/campaigns", {
                    method: "POST",
                    cache: 'no-store',
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...body, recipients: [] })
                });
            }

            await refresh();
        } catch (err) {
            console.error("Failed to save campaign", err);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
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

                        <a href={`/workspace/${workspaceId}/wa/contacts`}>
                            <Users className="w-4 h-4" />
                            <span className="hidden sm:inline">Contacts</span>
                        </a>
                    </Button>

                    {/* WhatsApp Connection Status Badge */}
                    <Button
                        variant=""
                        className={`gap-2 cursor-pointer brder ${waStatus === 'open' ? 'border' : 'border'}`}
                        onClick={() => setWaConnectionOpen(true)}>

                        {waStatus === 'open' ?
                            <>
                                <CheckCircle2 className="w-4 h-4 text-green-850" />
                                <span className="hidden sm:inline text-green-850">Connected</span>
                            </> :

                            <>
                                <MessageCircleDashed className="w-4 h-4" />
                                <span className="hidden sm:inline">Connect WA</span>
                            </>
                        }
                    </Button>


                </div>
            </div>

            <DashboardStats />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold text-foreground">
                            Campaigns <span className="text-sm text-muted-foreground">({campaigns.length})</span>
                        </h3>
                    </div>

                    {loading ?
                        <div className="rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
                            Loading campaigns...
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
                                        <a href={`/workspace/${workspaceId}/wa/bulk-sender`}>Go to Bulk Sender</a>
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
                    <RecentActivity activities={activities} />
                </div>
            </div>


            <WhatsAppConnectionModal open={waConnectionOpen} onOpenChange={setWaConnectionOpen} />
        </div>);

}