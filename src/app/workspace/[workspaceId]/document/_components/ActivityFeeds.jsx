'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { FileText, Users, HardDrive, TrendingUp, Upload, Clock, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import axios from '@/utils/axios';
import { formatDistanceToNow } from 'date-fns';

export default function ActivityFeeds({ workspaceId, userId }) {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchActivities = useCallback(async () => {
        if (!workspaceId) return;
        try {
            setLoading(true);
            const response = await axios.get(`/api/workspace/${workspaceId}/document?limit=5`);
            setActivities(response.data.map(doc => ({
                icon: doc.isFolder ? CheckCircle2 : Upload,
                text: `${doc.user?.name || "Member"} ${doc.isFolder ? 'created folder' : 'uploaded'} ${doc.name}`,
                time: formatDistanceToNow(new Date(doc.createdAt)) + " ago"
            })));
        } catch (error) {
            console.error("Error fetching activity feed:", error);
        } finally {
            setLoading(false);
        }
    }, [workspaceId]);

    useEffect(() => {
        fetchActivities();
    }, [fetchActivities]);

    return (
        <div>
            <Card className="shadow-sm animate-fade-up border border-border/100 bg-card/100 backdrop-blur-sm" style={{ animationDelay: "450ms" }}>
                <CardHeader className="pb-4 border-b border-border/10 bg-muted/5">
                    <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    {loading && activities.length === 0 ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="h-6 w-6 text-primary/20 animate-spin" />
                        </div>
                    ) : activities.length === 0 ? (
                        <div className="py-10 text-center opacity-40">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">No recent activity</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {activities.map((activity, i) => (
                                <div key={i} className="flex gap-4 group cursor-default">
                                    <div className="shrink-0 mt-0.5 p-2 rounded-xl bg-muted/30 group-hover:bg-primary/10 transition-colors">
                                        <activity.icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                    <div className="flex-1 border-b border-border/5 pb-4 group-last:border-none">
                                        <p className="text-sm font-bold text-foreground/80 leading-snug group-hover:text-foreground transition-colors">{activity.text}</p>
                                        <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest mt-1.5 flex items-center gap-2 italic">
                                            <Clock className="w-2.5 h-2.5" />
                                            {activity.time}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
