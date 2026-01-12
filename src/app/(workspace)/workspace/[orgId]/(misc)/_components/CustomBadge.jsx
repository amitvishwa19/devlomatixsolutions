import React from 'react'
import { Badge } from "@/components/ui/badge"
import { cn } from '@/lib/utils';



export function CustomBadge({ status, children }) {

    const statusColors = {
        info: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        success: "bg-green-500/10 text-green-500 border-green-500/20",
        error: "bg-red-500/10 text-red-500 border-red-500/20",
        na: "bg-orange-500/10 text-orange-500 border-orange-500/20",


        progress: "bg-blue-500/10 text-blue-500 border-blue-500/20",

        scheduled: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        inprogress: "bg-teal-500/10 text-teal-500 border-teal-500/20",
        completed: "bg-green-500/10 text-green-500 border-green-500/20",
        confirmed: "bg-violet-500/10 text-violet-500 border-violet-500/20",
        noshow: "bg-orange-500/10 text-orange-500 border-orange-500/20",
        cancelled: "bg-red-500/10 text-red-500 border-red-500/20",



        low: "bg-green-500/10 text-green-500 border-green-500/20",
        medium: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        high: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
        expired: "bg-red-500/10 text-red-500 border-red-500/20",
        blank: "bg-muted-foreground -muted-foreground  border--muted-foreground ",
        fully_covered: 'bg-green-500/10 text-green-500 border-green-500/20',
        covered: 'bg-green-500/10 text-green-500 border-green-500/20',
        partially_covered: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        not_covered: 'bg-red-500/10 text-red-500 border-red-500/20',
        DRAFT: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        PAID: "bg-green-500/10 text-green-500 border-green-500/20",
        OVERDUE: "bg-red-500/10 text-red-500 border-red-500/20",
        PENDING: "C",

        dispensed: "bg-green-500/10 text-green-500 border-green-500/20",
        draft: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        pending: "bg-orange-500/10 text-orange-500 border-orange-500/20",
        cancelled: "bg-red-500/10 text-red-500 border-red-500/20",


    };

    return (
        <Badge className={cn("border  hover:bg-transparent text-xs", statusColors[status])}>
            {children}
        </Badge>
    )
}
