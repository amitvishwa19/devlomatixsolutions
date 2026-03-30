// @ts-nocheck
import { CheckCircle2, MessageSquare, AlertCircle } from"lucide-react";

export default function RecentActivity() {
 const activities = [
 {
 id: 1,
 type:"success",
 title:"Summer Sale Promo completed",
 time:"2 hours ago",
 icon: CheckCircle2,
 color:"text-emerald-400",
 bg:"bg-emerald-400/10"
 },
 {
 id: 2,
 type:"message",
 title:"New reply from +1 (555) 0123",
 time:"4 hours ago",
 icon: MessageSquare,
 color:"text-blue-400",
 bg:"bg-blue-400/10"
 },
 {
 id: 3,
 type:"alert",
 title:"API rate limit warning",
 time:"5 hours ago",
 icon: AlertCircle,
 color:"text-amber-400",
 bg:"bg-amber-400/10"
 }];


 return (
 <div className="bg-[#111315] border border-[#1F2328] rounded-md p-6">
 <h3 className="text-lg font-semibold text-white mb-6">Recent Activity</h3>
 <div className="space-y-6">
 {activities.map((activity) => {
 const Icon = activity.icon;
 return (
 <div key={activity.id} className="flex gap-4">
 <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${activity.bg}`}>
 <Icon className={`w-4 h-4 ${activity.color}`} />
 </div>
 <div className="space-y-1 relative before:absolute before:left-[-1.5rem] before:top-8 before:bottom-[-1.5rem] before:w-px before:bg-[#1F2328] last:before:hidden">
 <p className="text-sm font-medium text-white">{activity.title}</p>
 <p className="text-xs text-[#A0AEC0]">{activity.time}</p>
 </div>
 </div>);

 })}
 </div>
 </div>);

}