"use client";

import React, { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    Play, Pause, Edit, Trash2, Search, MessageSquare, 
    Send, CheckCircle2, Clock, AlertCircle, Filter
} from "lucide-react";
import { format } from "date-fns";

export default function CampaignList({
    campaigns = [],
    onToggleStatus,
    onEdit,
    onDelete,
    workspaceId
}) {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const filteredCampaigns = useMemo(() => {
        return campaigns.filter((campaign) => {
            const matchesSearch = 
                (campaign.name && campaign.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (campaign.template && campaign.template.toLowerCase().includes(searchQuery.toLowerCase()));
            
            const normalizedStatus = (campaign.status || "").toLowerCase();
            const matchesStatus = 
                statusFilter === "all" ||
                (statusFilter === "active" && (normalizedStatus === "active" || normalizedStatus === "running")) ||
                (statusFilter === "paused" && normalizedStatus === "paused") ||
                (statusFilter === "completed" && normalizedStatus === "completed") ||
                (statusFilter === "draft" && (normalizedStatus === "draft" || normalizedStatus === "created"));

            return matchesSearch && matchesStatus;
        });
    }, [campaigns, searchQuery, statusFilter]);

    const getStatusBadge = (status) => {
        const s = (status || "").toLowerCase();
        if (s === "active" || s === "running") {
            return (
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/25 gap-1 font-mono text-[10px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Running
                </Badge>
            );
        }
        if (s === "paused") {
            return (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/25 gap-1 font-mono text-[10px]">
                    <Pause className="w-2.5 h-2.5" />
                    Paused
                </Badge>
            );
        }
        if (s === "completed") {
            return (
                <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/25 gap-1 font-mono text-[10px]">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Completed
                </Badge>
            );
        }
        return (
            <Badge variant="outline" className="bg-secondary text-muted-foreground border-border/60 font-mono text-[10px]">
                {status || "Draft"}
            </Badge>
        );
    };

    return (
        <div className="bg-card border border-border/70 rounded-xl overflow-hidden shadow-xs space-y-0">
            {/* Table Filter Header */}
            <div className="p-3.5 border-b border-border/60 bg-secondary/20 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search broadcasts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-8 pl-8 text-xs bg-background border-border/60"
                    />
                </div>

                {/* Status Filter Tabs */}
                <div className="flex items-center gap-1 bg-secondary/50 p-0.5 rounded-lg border border-border/50 self-end sm:self-auto text-xs">
                    {[
                        { id: "all", label: `All (${campaigns.length})` },
                        { id: "active", label: "Active" },
                        { id: "paused", label: "Paused" },
                        { id: "completed", label: "Done" },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setStatusFilter(tab.id)}
                            className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${
                                statusFilter === tab.id
                                    ? "bg-background text-foreground shadow-2xs font-semibold"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Campaign Table / Empty State */}
            {filteredCampaigns.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                    <MessageSquare className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                    <p className="text-xs font-semibold text-foreground">No campaigns match your filter</p>
                    <p className="text-[11px] text-muted-foreground">
                        {searchQuery ? "Try clearing your search query." : "Launch your first WhatsApp broadcast to start reaching customers."}
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border/50 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider bg-secondary/10">
                                <th className="px-4 py-3">Campaign</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Progress</th>
                                <th className="px-4 py-3">Success Rate</th>
                                <th className="px-4 py-3">Created</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40 text-xs">
                            {filteredCampaigns.map((campaign) => {
                                const total = campaign.total || 0;
                                const sent = campaign.sent || 0;
                                const progressPct = total > 0 ? Math.min(100, Math.round((sent / total) * 100)) : 0;
                                const successRate = campaign.successRate != null ? campaign.successRate : progressPct;

                                let formattedDate = "-";
                                if (campaign.createdAt) {
                                    try {
                                        formattedDate = format(new Date(campaign.createdAt), "MMM d, yyyy");
                                    } catch (e) {
                                        formattedDate = String(campaign.createdAt).substring(0, 10);
                                    }
                                }

                                return (
                                    <tr key={campaign.id} className="hover:bg-secondary/30 transition-colors group">
                                        {/* Campaign Info */}
                                        <td className="px-4 py-3 max-w-[200px]">
                                            <div className="font-bold text-foreground truncate group-hover:text-primary transition-colors">
                                                {campaign.name}
                                            </div>
                                            {campaign.template && (
                                                <p className="text-[10px] text-muted-foreground font-mono truncate">
                                                    Template: {campaign.template}
                                                </p>
                                            )}
                                        </td>

                                        {/* Status */}
                                        <td className="px-4 py-3">
                                            {getStatusBadge(campaign.status)}
                                        </td>

                                        {/* Progress Bar & Recipients */}
                                        <td className="px-4 py-3 min-w-[130px]">
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                                    <span>{sent.toLocaleString()} / {total.toLocaleString()}</span>
                                                    <span className="font-mono">{progressPct}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary rounded-full transition-all duration-300"
                                                        style={{ width: `${progressPct}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>

                                        {/* Success Rate */}
                                        <td className="px-4 py-3">
                                            <span className={`font-mono font-semibold ${successRate >= 90 ? "text-emerald-400" : successRate >= 70 ? "text-amber-400" : "text-muted-foreground"}`}>
                                                {successRate}%
                                            </span>
                                        </td>

                                        {/* Date */}
                                        <td className="px-4 py-3 text-[11px] text-muted-foreground">
                                            {formattedDate}
                                        </td>

                                        {/* Action Buttons */}
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1 text-muted-foreground">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 hover:text-foreground hover:bg-secondary/70"
                                                    title={campaign.status === "active" ? "Pause Campaign" : "Resume Campaign"}
                                                    onClick={() => onToggleStatus(campaign.id)}
                                                >
                                                    {campaign.status === "active" ? (
                                                        <Pause className="w-3.5 h-3.5 text-amber-400" />
                                                    ) : (
                                                        <Play className="w-3.5 h-3.5 text-emerald-400" />
                                                    )}
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 hover:text-foreground hover:bg-secondary/70"
                                                    title="Edit Campaign"
                                                    onClick={() => onEdit(campaign)}
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 hover:text-rose-400 hover:bg-rose-500/10"
                                                    title="Delete Campaign"
                                                    onClick={() => onDelete?.(campaign.id)}
                                                    disabled={!onDelete}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}