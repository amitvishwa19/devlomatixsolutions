// @ts-nocheck
import { Card, CardContent } from "@/components/ui/card";
import { Send, MessageSquare, Users, TrendingUp } from "lucide-react";

export default function DashboardStats() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Campaigns */}
            <Card className="bg-card border hover:border-emerald-500/50 transition-colors group">
                <CardContent className="py-3 px-4">
                    <div className="flex items-center justify-between gap-2">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-bold text-white leading-none">24</h3>
                            <p className="text-[#A0AEC0] text-xs">Total Campaigns</p>
                        </div>
                        <div className="w-10 h-10 bg-emerald-500 rounded-md flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                            <Send className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <p className="text-emerald-400 text-xs font-medium pt-2">+3 this week</p>
                </CardContent>
            </Card>

            {/* Messages Sent */}
            <Card className="bg-card border hover:border-[#2D3748] transition-colors">
                <CardContent className="py-3 px-4">
                    <div className="flex items-center justify-between gap-2">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-bold text-white leading-none">12,847</h3>
                            <p className="text-[#A0AEC0] text-xs">Messages Sent</p>
                        </div>
                        <div className="w-10 h-10 bg-[#1C2025] rounded-md flex items-center justify-center border border-[#2D3748] shrink-0">
                            <MessageSquare className="w-5 h-5 text-emerald-400" />
                        </div>
                    </div>
                    <p className="text-emerald-400 text-xs font-medium pt-2">+1,234 today</p>
                </CardContent>
            </Card>

            {/* Active Contacts */}
            <Card className="bg-card border hover:border-[#2D3748] transition-colors">
                <CardContent className="py-3 px-4">
                    <div className="flex items-center justify-between gap-2">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-bold text-white leading-none">3,291</h3>
                            <p className="text-[#A0AEC0] text-xs">Active Contacts</p>
                        </div>
                        <div className="w-10 h-10 bg-[#1C2025] rounded-md flex items-center justify-center border border-[#2D3748] shrink-0">
                            <Users className="w-5 h-5 text-emerald-400" />
                        </div>
                    </div>
                    <p className="text-emerald-400 text-xs font-medium pt-2">+89 new</p>
                </CardContent>
            </Card>

            {/* Reply Rate */}
            <Card className="bg-card border hover:border-[#2D3748] transition-colors">
                <CardContent className="py-3 px-4">
                    <div className="flex items-center justify-between gap-2">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-bold text-white leading-none">68%</h3>
                            <p className="text-[#A0AEC0] text-xs">Reply Rate</p>
                        </div>
                        <div className="w-10 h-10 bg-[#1C2025] rounded-md flex items-center justify-center border border-[#2D3748] shrink-0">
                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                        </div>
                    </div>
                    <p className="text-emerald-400 text-xs font-medium pt-2">+5% vs last week</p>
                </CardContent>
            </Card>
        </div>);

}