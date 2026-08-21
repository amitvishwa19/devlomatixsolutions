"use client";

import { useState, useEffect } from "react";
import { useAction } from "@/hooks/use-action";
import { getStats } from "../_actions/get-stats";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    Send, MessageSquare, Users, Zap, TrendingUp, CheckCircle2, 
    ArrowUpRight, Clock, AlertTriangle, ShieldCheck 
} from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardStats({ workspaceId }) {
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const { execute } = useAction(getStats, {
        onSuccess: (data) => {
            if (data.stats) {
                setStats(data.stats);
            }
            setIsLoading(false);
        },
        onError: (error) => {
            console.error("Failed to fetch dashboard stats:", error);
            setIsLoading(false);
        }
    });

    useEffect(() => {
        if (workspaceId && workspaceId !== "[workspaceId]") {
            execute({ workspaceId });
        }

        const handleAccountSwitch = () => {
            execute({ workspaceId });
        };

        window.addEventListener("wa-account-switched", handleAccountSwitch);
        return () => window.removeEventListener("wa-account-switched", handleAccountSwitch);
    }, [workspaceId, execute]);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="bg-card border border-border/60 shadow-xs">
                        <CardContent className="p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1.5 flex-1">
                                    <div className="h-3 w-20 bg-muted/60 animate-pulse rounded" />
                                    <div className="h-7 w-28 bg-muted/60 animate-pulse rounded" />
                                </div>
                                <div className="w-10 h-10 bg-muted/60 animate-pulse rounded-xl shrink-0" />
                            </div>
                            <div className="h-2 w-full bg-muted/40 animate-pulse rounded" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    const messagesSent = stats?.messages?.sent || 0;
    const readRate = parseFloat(stats?.messages?.readRate || "0.0");
    const successRate = parseFloat(stats?.messages?.successRate || "100.0");
    const activeCampaigns = stats?.campaigns?.active || 0;
    const totalCampaigns = stats?.campaigns?.total || 0;
    const approvedTemplates = stats?.templates?.approved || 0;
    const pendingTemplates = stats?.templates?.pending || 0;
    const totalContacts = stats?.contacts?.total || 0;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Messages Dispatched */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.02 }}>
                <Card className="bg-card border-border/70 hover:border-blue-500/40 hover:shadow-md transition-all duration-200 group shadow-xs">
                    <CardContent className="p-4 space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                            <div className="space-y-1">
                                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Messages Sent</p>
                                <h3 className="text-2xl font-black text-foreground tracking-tight">
                                    {messagesSent.toLocaleString()}
                                </h3>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 group-hover:scale-105 transition-transform shrink-0">
                                <Send className="w-5 h-5" />
                            </div>
                        </div>

                        {/* Progress Bar for Read Rate */}
                        <div className="space-y-1 pt-1 border-t border-border/40">
                            <div className="flex items-center justify-between text-[10px]">
                                <span className="text-muted-foreground">Read Engagement</span>
                                <span className="font-bold text-blue-400">{readRate}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.max(5, readRate))}%` }} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Broadcast Campaigns */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.04 }}>
                <Card className="bg-card border-border/70 hover:border-emerald-500/40 hover:shadow-md transition-all duration-200 group shadow-xs">
                    <CardContent className="p-4 space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                            <div className="space-y-1">
                                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Broadcast Campaigns</p>
                                <h3 className="text-2xl font-black text-foreground tracking-tight">
                                    {totalCampaigns.toLocaleString()}
                                </h3>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 group-hover:scale-105 transition-transform shrink-0">
                                <Zap className="w-5 h-5" />
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px]">
                            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span>{activeCampaigns} Active Now</span>
                            </div>
                            <Badge variant="secondary" className="text-[9px] font-mono bg-secondary/80">
                                {totalCampaigns - activeCampaigns} Completed
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Audience & Contacts */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.06 }}>
                <Card className="bg-card border-border/70 hover:border-teal-500/40 hover:shadow-md transition-all duration-200 group shadow-xs">
                    <CardContent className="p-4 space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                            <div className="space-y-1">
                                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Active Contacts</p>
                                <h3 className="text-2xl font-black text-foreground tracking-tight">
                                    {totalContacts.toLocaleString()}
                                </h3>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-500 group-hover:scale-105 transition-transform shrink-0">
                                <Users className="w-5 h-5" />
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px]">
                            <span className="text-muted-foreground">Direct WhatsApp Reach</span>
                            <span className="font-semibold text-teal-400 flex items-center gap-0.5">
                                Verified <CheckCircle2 className="w-3 h-3 text-teal-400" />
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Meta Approved Templates */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.08 }}>
                <Card className="bg-card border-border/70 hover:border-amber-500/40 hover:shadow-md transition-all duration-200 group shadow-xs">
                    <CardContent className="p-4 space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                            <div className="space-y-1">
                                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Meta Templates</p>
                                <h3 className="text-2xl font-black text-foreground tracking-tight">
                                    {approvedTemplates}
                                </h3>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 group-hover:scale-105 transition-transform shrink-0">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px]">
                            <span className="text-amber-400 font-medium">
                                {pendingTemplates > 0 ? `${pendingTemplates} in Review` : "All Synced"}
                            </span>
                            <Badge variant="outline" className="text-[9px] font-mono text-muted-foreground border-border/60">
                                Meta Graph API
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}