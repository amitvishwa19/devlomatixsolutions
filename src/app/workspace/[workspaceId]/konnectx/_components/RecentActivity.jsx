"use client";

import React, { useState } from "react";
import { 
    CheckCircle2, MessageSquare, AlertCircle, ChevronLeft, ChevronRight, 
    Send, Bell, Activity, Sparkles, Filter 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function RecentActivity({ 
    activities = [], 
    loading = false,
    pagination = { currentPage: 1, hasMore: false },
    onPageChange 
}) {
    const [filter, setFilter] = useState("all");

    const currentPage = pagination?.currentPage || 1;
    const hasMore = pagination?.hasMore || false;

    const filteredActivities = activities.filter((act) => {
        if (filter === "messages") return act.type === "message";
        if (filter === "templates") return act.type === "success" || act.id?.startsWith("tmpl");
        if (filter === "alerts") return act.type === "alert";
        return true;
    });

    return (
        <div className="bg-card border border-border/70 rounded-xl overflow-hidden shadow-xs flex flex-col h-full justify-between">
            {/* Filter Sub-header */}
            <div className="p-3 border-b border-border/50 bg-secondary/20 flex items-center justify-between gap-1 text-[11px]">
                <div className="flex items-center gap-1 bg-secondary/50 p-0.5 rounded-lg border border-border/50">
                    {[
                        { id: "all", label: "All" },
                        { id: "messages", label: "Replies" },
                        { id: "templates", label: "Templates" },
                        { id: "alerts", label: "Alerts" },
                    ].map((f) => (
                        <button
                            key={f.id}
                            type="button"
                            onClick={() => setFilter(f.id)}
                            className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                                filter === f.id
                                    ? "bg-background text-foreground shadow-2xs font-semibold"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">
                    {filteredActivities.length} items
                </span>
            </div>

            {/* Activities List */}
            <div className="divide-y divide-border/40 flex-1 overflow-y-auto max-h-[380px]">
                {loading ? (
                    [1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-3 p-3.5">
                            <div className="h-8 w-8 rounded-lg bg-muted/60 animate-pulse shrink-0" />
                            <div className="min-w-0 flex-1 space-y-1.5">
                                <div className="h-3.5 w-3/4 bg-muted/60 animate-pulse rounded" />
                                <div className="h-2.5 w-1/3 bg-muted/40 animate-pulse rounded" />
                            </div>
                        </div>
                    ))
                ) : filteredActivities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                        <Activity className="w-8 h-8 text-muted-foreground/30 mb-2" />
                        <p className="text-xs font-semibold text-foreground">No recent events</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                            Live incoming customer replies and template approvals will appear here.
                        </p>
                    </div>
                ) : (
                    filteredActivities.map((activity) => {
                        const Icon =
                            activity.type === "success"
                                ? CheckCircle2
                                : activity.type === "message"
                                ? MessageSquare
                                : AlertCircle;

                        const iconColor =
                            activity.type === "success"
                                ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                                : activity.type === "message"
                                ? "text-blue-400 bg-blue-500/10 border-blue-500/20"
                                : "text-rose-400 bg-rose-500/10 border-rose-500/20";

                        return (
                            <div
                                key={activity.id}
                                className="flex items-start gap-3 p-3 hover:bg-secondary/30 transition-colors group"
                            >
                                <div
                                    className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 border mt-0.5 ${iconColor} group-hover:scale-105 transition-transform`}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                </div>
                                <div className="min-w-0 flex-1 space-y-0.5">
                                    <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                        {activity.title}
                                    </p>
                                    {activity.description && (
                                        <p className="text-[11px] text-muted-foreground line-clamp-1">
                                            {activity.description}
                                        </p>
                                    )}
                                    <p className="text-[10px] text-muted-foreground/70 font-mono">
                                        {activity.time}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Pagination Controls */}
            {(currentPage > 1 || hasMore) && (
                <div className="p-2.5 border-t border-border/50 bg-secondary/10 flex items-center justify-between text-xs">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`h-7 px-2.5 text-[11px] gap-1 ${currentPage === 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-secondary"}`}
                        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="w-3 h-3" />
                        Prev
                    </Button>

                    <span className="text-[10px] font-mono text-muted-foreground">
                        Page {currentPage}
                    </span>

                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`h-7 px-2.5 text-[11px] gap-1 ${!hasMore ? "opacity-30 cursor-not-allowed" : "hover:bg-secondary"}`}
                        onClick={() => hasMore && onPageChange(currentPage + 1)}
                        disabled={!hasMore}
                    >
                        Next
                        <ChevronRight className="w-3 h-3" />
                    </Button>
                </div>
            )}
        </div>
    );
}