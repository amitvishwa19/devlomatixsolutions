// @ts-nocheck
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Pause, Edit, Trash, Trash2 } from "lucide-react";


export default function CampaignList({
    campaigns,
    onToggleStatus,
    onEdit,
    onDelete
}) {
    return (
        <div className="bg-card border border-border rounded-md overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border text-left text-xs font-medium  tracking-wider">
                            <th className="px-6 py-4">Campaign Name</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Recipients</th>
                            <th className="px-6 py-4">Sent</th>
                            <th className="px-6 py-4">Success</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {campaigns.map((campaign) =>
                            <tr key={campaign.id} className="text-xs hover:bg-background transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-foreground">{campaign.name}</div>

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
                                    <div className="flex items-center justify-end gap-2 text-muted-foreground">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6  hover:text-white"
                                            onClick={() => onToggleStatus(campaign.id)}>

                                            {campaign.status === "active" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6  hover:text-white"
                                            onClick={() => onEdit(campaign)}>

                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6  hover:text-red-400"
                                            onClick={() => onDelete?.(campaign.id)}
                                            disabled={!onDelete}>

                                            <Trash2 className="w-4 h-4" />
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