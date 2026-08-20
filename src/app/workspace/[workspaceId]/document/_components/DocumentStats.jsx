'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { FileText, Users, HardDrive, Star, Sparkles, Loader2, Layers } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import axios from "@/utils/axios";

export default function DocumentStats({ workspaceId, userId }) {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStatsData = async () => {
            if (!workspaceId) return;
            try {
                setLoading(true);
                const response = await axios.get(`/api/workspace/${workspaceId}/document`);
                setDocuments(response.data || []);
            } catch (error) {
                console.error("Error fetching stats data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStatsData();
    }, [workspaceId]);

    const stats = useMemo(() => {
        const totalDocs = documents.length;
        const totalSize = documents.reduce((acc, doc) => acc + (doc.fileSize || 0), 0);
        const starredCount = documents.filter(d => d.isStarred).length;

        // Unique collaborators set
        const collaboratorSet = new Set();
        documents.forEach(d => {
            if (d.userId) collaboratorSet.add(d.userId);
            d.sharedWith?.forEach(s => {
                if (s.userId) collaboratorSet.add(s.userId);
            });
        });
        const activeCollaborators = Math.max(collaboratorSet.size, 1);

        const sizeInMb = (totalSize / (1024 * 1024)).toFixed(1);
        const formattedSize = totalSize > 1024 * 1024 * 1024
            ? `${(totalSize / (1024 * 1024 * 1024)).toFixed(2)} GB`
            : `${sizeInMb} MB`;

        return [
            {
                label: "Total Assets",
                value: totalDocs.toLocaleString(),
                subText: `${documents.filter(d => d.isFolder).length} folders • ${documents.filter(d => !d.isFolder).length} files`,
                icon: Layers,
                color: "text-primary",
                bgColor: "bg-primary/10 border-primary/20",
            },
            {
                label: "Storage Space",
                value: formattedSize,
                subText: "Cloud Storage Quota",
                icon: HardDrive,
                color: "text-blue-500",
                bgColor: "bg-blue-500/10 border-blue-500/20",
            },
            {
                label: "Team Collaborators",
                value: activeCollaborators.toLocaleString(),
                subText: "Active Members with Access",
                icon: Users,
                color: "text-emerald-500",
                bgColor: "bg-emerald-500/10 border-emerald-500/20",
            },
            {
                label: "Starred Items",
                value: starredCount.toLocaleString(),
                subText: "Fast Access Bookmarks",
                icon: Star,
                color: "text-amber-500",
                bgColor: "bg-amber-500/10 border-amber-500/20",
            },
        ];
    }, [documents]);

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            {stats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                    <Card
                        key={stat.label}
                        className="p-3 border border-border/50 bg-card/60 backdrop-blur-xs shadow-xs hover:border-primary/30 transition-all rounded-xl"
                    >
                        <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                                    {stat.label}
                                </span>
                                <div className="text-lg font-black tracking-tight text-foreground mt-0.5">
                                    {loading ? "--" : stat.value}
                                </div>
                                <span className="text-[10px] text-muted-foreground/70 truncate block mt-0.5">
                                    {stat.subText}
                                </span>
                            </div>

                            <div className={`p-2 rounded-lg border shrink-0 ${stat.bgColor} ${stat.color}`}>
                                <Icon className="w-4 h-4" />
                            </div>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}