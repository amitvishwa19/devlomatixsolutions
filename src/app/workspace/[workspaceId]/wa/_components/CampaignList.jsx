// @ts-nocheck
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Pause, Edit, Trash } from "lucide-react";












export default function CampaignList({
 campaigns,
 onToggleStatus,
 onEdit,
 onDelete





}) {
 return (
 <div className="bg-[#111315] border border-[#1F2328] rounded-xl overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead>
 <tr className="border-b border-[#1F2328] text-left text-xs font-medium text-[#A0AEC0] tracking-wider">
 <th className="px-6 py-4">Campaign Name</th>
 <th className="px-6 py-4">Status</th>
 <th className="px-6 py-4">Recipients</th>
 <th className="px-6 py-4">Sent</th>
 <th className="px-6 py-4">Success</th>
 <th className="px-6 py-4">Date</th>
 <th className="px-6 py-4 text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-[#1F2328]">
 {campaigns.map((campaign) =>
 <tr key={campaign.id} className="hover:bg-[#1A1D21] transition-colors">
 <td className="px-6 py-4">
 <div className="font-medium text-white">{campaign.name}</div>
 <div className="text-xs text-[#A0AEC0] mt-1 max-w-[200px] truncate">
 {campaign.template}
 </div>
 </td>
 <td className="px-6 py-4">
 <Badge
 variant="outline"
 className={
 campaign.status === "active" || campaign.status === "running" ?
 "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
 campaign.status === "paused" ?
 "bg-amber-500/10 text-amber-400 border-amber-500/20" :
 campaign.status === "completed" ?
 "bg-blue-500/10 text-blue-400 border-blue-500/20" :
 campaign.status === "draft" || campaign.status === "DRAFT" ?
 "bg-slate-700 text-slate-200 border-slate-600" :
 "bg-[#2D3748] text-[#A0AEC0] border-[#4A5568]"
 }>
 
 {campaign.status}
 </Badge>
 </td>
 <td className="px-6 py-4 text-white">
 {campaign.total != null ? campaign.total.toLocaleString() : "-"}
 </td>
 <td className="px-6 py-4 text-white">
 {campaign.sent != null ? campaign.sent.toLocaleString() : "-"}
 </td>
 <td className="px-6 py-4 text-[#A0AEC0]">
 {campaign.successRate != null ? `${campaign.successRate}%` : "-"}
 </td>
 <td className="px-6 py-4 text-sm text-[#A0AEC0]">
 {campaign.createdAt ?? "-"}
 </td>
 <td className="px-6 py-4 text-right">
 <div className="flex items-center justify-end gap-2">
 <Button
 variant="ghost"
 size="icon"
 className="h-8 w-8 text-[#A0AEC0] hover:text-white"
 onClick={() => onToggleStatus(campaign.id)}>
 
 {campaign.status === "active" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
 </Button>
 <Button
 variant="ghost"
 size="icon"
 className="h-8 w-8 text-[#A0AEC0] hover:text-white"
 onClick={() => onEdit(campaign)}>
 
 <Edit className="w-4 h-4" />
 </Button>
 <Button
 variant="ghost"
 size="icon"
 className="h-8 w-8 text-[#A0AEC0] hover:text-red-400"
 onClick={() => onDelete?.(campaign.id)}
 disabled={!onDelete}>
 
 <Trash className="w-4 h-4" />
 </Button>
 </div>
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>);

}