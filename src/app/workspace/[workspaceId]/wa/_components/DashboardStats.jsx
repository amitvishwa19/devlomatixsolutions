// @ts-nocheck
import { Card, CardContent } from "@/components/ui/card";
import { Send, MessageSquare, Users, TrendingUp } from "lucide-react";

export default function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Campaigns */}
            <Card className="bg-card  border   hover:border-emerald-500/50 transition-colors group">
                <CardContent className="p-6">
                    <div className="w-12 h-12 bg-emerald-500 rounded-md flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Send className="w-6 h-6 text-white" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-3xl font-bold text-white">24</h3>
                        <p className="text-[#A0AEC0] text-sm">Total Campaigns</p>
                        <p className="text-emerald-400 text-xs font-medium pt-1">+3 this week</p>
                    </div>
                </CardContent>
            </Card>

            {/* Messages Sent */}
            <Card className="bg-card  border   hover:border-[#2D3748] transition-colors">
                <CardContent className="p-6">
                    <div className="w-12 h-12 bg-[#1C2025] rounded-md flex items-center justify-center mb-6 border border-[#2D3748]">
                        <MessageSquare className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-3xl font-bold text-white">12,847</h3>
                        <p className="text-[#A0AEC0] text-sm">Messages Sent</p>
                        <p className="text-emerald-400 text-xs font-medium pt-1">+1,234 today</p>
                    </div>
                </CardContent>
            </Card>

            {/* Active Contacts */}
            <Card className="bg-card  border   hover:border-[#2D3748] transition-colors">
                <CardContent className="p-6">
                    <div className="w-12 h-12 bg-[#1C2025] rounded-md flex items-center justify-center mb-6 border border-[#2D3748]">
                        <Users className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-3xl font-bold text-white">3,291</h3>
                        <p className="text-[#A0AEC0] text-sm">Active Contacts</p>
                        <p className="text-emerald-400 text-xs font-medium pt-1">+89 new</p>
                    </div>
                </CardContent>
            </Card>

            {/* Reply Rate */}
            <Card className="bg-card  border   hover:border-[#2D3748] transition-colors">
                <CardContent className="p-6">
                    <div className="w-12 h-12 bg-[#1C2025] rounded-md flex items-center justify-center mb-6 border border-[#2D3748]">
                        <TrendingUp className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-3xl font-bold text-white">68%</h3>
                        <p className="text-[#A0AEC0] text-sm">Reply Rate</p>
                        <p className="text-emerald-400 text-xs font-medium pt-1">+5% vs last week</p>
                    </div>
                </CardContent>
            </Card>
        </div>);

}