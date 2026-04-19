import { useState, useEffect } from "react";
import { useAction } from "@/hooks/use-action";
import { getStats } from "../_actions/get-stats";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Send, MessageSquare, Users, TrendingUp } from "lucide-react";



export default function DashboardStats() {
    const params = useParams();
    const workspaceId = params.workspaceId;
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
        if (workspaceId) {
            execute({ workspaceId });
        }
    }, [workspaceId, execute]);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <Card key={i} className="bg-card/50 border border-border/50 h-24 animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Campaigns */}
            <Card className="bg-card border hover:border-emerald-500/50 transition-colors group">
                <CardContent className="py-3 px-4">
                    <div className="flex items-center justify-between gap-2">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-bold text-white leading-none">{stats?.campaigns?.total || 0}</h3>
                            <p className="text-[#A0AEC0] text-xs">Total Campaigns</p>
                        </div>
                        <div className="w-10 h-10 bg-emerald-500 rounded-md flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                            <Send className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <p className="text-emerald-400 text-xs font-medium pt-2">
                        {stats?.campaigns?.active || 0} currently active
                    </p>
                </CardContent>
            </Card>

            {/* Messages Sent */}
            <Card className="bg-card border hover:border-[#2D3748] transition-colors group">
                <CardContent className="py-3 px-4">
                    <div className="flex items-center justify-between gap-2">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-bold text-white leading-none">{(stats?.messages?.sent || 0).toLocaleString()}</h3>
                            <p className="text-[#A0AEC0] text-xs">Messages Sent</p>
                        </div>
                        <div className="w-10 h-10 bg-primary/20 rounded-md flex items-center justify-center border border-primary/30 group-hover:bg-primary/30 transition-colors shrink-0">
                            <MessageSquare className="w-5 h-5 text-primary" />
                        </div>
                    </div>
                    <p className="text-blue-400 text-xs font-medium pt-2">{stats?.messages?.readRate || 0}% read rate</p>
                </CardContent>
            </Card>

            {/* Active Contacts */}
            <Card className="bg-card border hover:border-[#2D3748] transition-colors group">
                <CardContent className="py-3 px-4">
                    <div className="flex items-center justify-between gap-2">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-bold text-white leading-none">{(stats?.contacts?.total || 0).toLocaleString()}</h3>
                            <p className="text-[#A0AEC0] text-xs">Active Contacts</p>
                        </div>
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-md flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors shrink-0">
                            <Users className="w-5 h-5 text-emerald-400" />
                        </div>
                    </div>
                    <p className="text-emerald-400 text-xs font-medium pt-2">Reach your audience</p>
                </CardContent>
            </Card>

            {/* Template Success */}
            <Card className="bg-card border hover:border-[#2D3748] transition-colors group">
                <CardContent className="py-3 px-4">
                    <div className="flex items-center justify-between gap-2">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-bold text-white leading-none">{stats?.templates?.approved || 0}</h3>
                            <p className="text-[#A0AEC0] text-xs">Approved Templates</p>
                        </div>
                        <div className="w-10 h-10 bg-amber-500/10 rounded-md flex items-center justify-center border border-amber-500/20 group-hover:bg-amber-500/20 transition-colors shrink-0">
                            <TrendingUp className="w-5 h-5 text-amber-400" />
                        </div>
                    </div>
                    <p className="text-amber-400 text-xs font-medium pt-2">{stats?.templates?.pending || 0} pending review</p>
                </CardContent>
            </Card>
        </div>);
}