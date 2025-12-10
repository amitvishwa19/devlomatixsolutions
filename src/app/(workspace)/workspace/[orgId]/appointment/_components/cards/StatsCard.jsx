import React from 'react'
import { LucideIcon, Lock } from "lucide-react";
import { DynamicIcon } from 'lucide-react/dynamic';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";




export function StatsCard({
    title,
    value,
    change,
    changeType = "neutral",
    icon,
    iconColor,
    iconClassName,
}) {
    return (
        <Card className='group dark:bg-darkSecondaryBackground shadow-sm border rounded-md flex-1 p-2'>
            <CardContent className="p-2">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <p className="text-2xl font-bold text-foreground">{value}</p>
                        {change && (
                            <p
                                className={cn(
                                    "text-xs font-medium",
                                    changeType === "positive" && "text-green-600",
                                    changeType === "negative" && "text-red-600",
                                    changeType === "neutral" && "text-muted-foreground"
                                )}
                            >
                                {change}
                            </p>
                        )}
                    </div>
                    <div className={cn("flex h-12 w-12 items-center justify-center rounded-lg dark:bg-[#172E3A] bg-[#E7F5FA] transition-transform duration-300 group-hover:scale-110")} >
                        {/* <Icon name='Lock' className="h-6 w-6" color='red' /> */}
                        <DynamicIcon name={icon} color={iconColor} size={26} />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
