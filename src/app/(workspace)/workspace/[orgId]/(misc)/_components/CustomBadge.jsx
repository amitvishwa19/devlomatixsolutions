import React from 'react'
import { Badge } from "@/components/ui/badge"
import { cn } from '@/lib/utils';



export function CustomBadge({ status, children }) {

    const statusColors = {
        info: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
        success: "bg-green-500/10 text-green-500 border-green-500/20",
        error: "bg-red-500/10 text-red-500 border-red-500/20",
        progress: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    };

    return (
        <Badge className={cn("border capitalize", statusColors[status])}>
            {children}
        </Badge>
    )
}
