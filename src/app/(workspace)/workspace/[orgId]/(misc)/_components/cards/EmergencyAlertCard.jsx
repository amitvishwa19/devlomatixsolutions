import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, MapPin, Clock, User, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmergencyAlertCard({
    alertId,
    type,
    location,
    time,
    status,
    priority,
    responders,
    patientInfo,
    description,
}) {

    const statusColors = {
        Active: "bg-red-500/10 text-red-500 border-red-500/20",
        Responding: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
        Resolved: "bg-green-500/10 text-green-500 border-green-500/20",
    };

    const priorityColors = {
        Critical: "bg-red-500 text-white",
        High: "bg-orange-500 text-white",
        Medium: "bg-yellow-500 text-white",
    };

    const typeColors = {
        "Code Blue": "bg-blue-500/10 text-blue-500",
        "Code Red": "bg-red-500/10 text-red-500",
        "Code Yellow": "bg-yellow-500/10 text-yellow-500",
        "Trauma Alert": "bg-purple-500/10 text-purple-500",
        Accident: "bg-orange-500/10 text-orange-500",
    };


    return (
        <Card className="border dark:bg-darkSecondaryBackground">
            <CardHeader className=''>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-destructive/10 animate-pulse">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">{type}</CardTitle>
                            <p className="text-sm text-muted-foreground">Alert ID: {alertId}</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                        <Badge className={priorityColors[priority]}>{priority}</Badge>
                        <Badge className={cn("border", statusColors[status])}>{status}</Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3 ">
                <Badge className={typeColors[type]} variant="outline">
                    {type}
                </Badge>
                <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{time}</span>
                </div>
                {patientInfo && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>{patientInfo}</span>
                    </div>
                )}
                {description && (
                    <p className="text-sm text-muted-foreground border-t pt-2">{description}</p>
                )}
                {responders && responders.length > 0 && (
                    <div className="border-t pt-2">
                        <p className="text-sm font-medium mb-1">Responders:</p>
                        <div className="flex flex-wrap gap-1">
                            {responders.map((responder, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                    {responder}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
                <div className="flex gap-2 pt-2">
                    {status === "Active" && (
                        <>
                            <Button size="sm" variant="destructive" className="flex-1">
                                Respond
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1">
                                <Phone className="h-4 w-4" />
                            </Button>
                        </>
                    )}
                    {status === "Responding" && (
                        <Button size="sm" className="w-full">Update Status</Button>
                    )}
                    {status === "Resolved" && (
                        <Button size="sm" variant="outline" className="w-full">View Report</Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
