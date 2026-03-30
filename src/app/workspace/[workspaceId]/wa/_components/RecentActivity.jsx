// @ts-nocheck
import { CheckCircle2, MessageSquare, AlertCircle } from "lucide-react";

export default function RecentActivity({ activities = [] }) {
    return (
        <div className="border rounded-lg border-dashed border-border bg-card/50 overflow-hidden h-full">
            <div className="divide-y divide-[#1F2328]">
                {activities.map((activity) => {
                    const Icon = activity.icon || (activity.type === 'success' ? CheckCircle2 : activity.type === 'message' ? MessageSquare : AlertCircle);
                    return (
                        <div key={activity.id} className="flex items-center gap-4 px-6 py-4 hover:bg-[#1A1D21] transition-colors">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${activity.bg}`}>
                                <Icon className={`w-4 h-4 ${activity.color}`} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-white truncate">{activity.title}</p>
                                <p className="text-xs text-[#A0AEC0] mt-0.5">{activity.time}</p>
                            </div>
                        </div>);
                })}
            </div>
        </div>);
}