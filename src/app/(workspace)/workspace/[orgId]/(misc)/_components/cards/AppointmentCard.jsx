import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, Stethoscope, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppointmentCard({
    patientName,
    doctorName,
    date,
    time,
    type,
    status,
    department,
    notes,
}) {

    const statusColors = {
        Scheduled: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        Completed: "bg-green-500/10 text-green-500 border-green-500/20",
        Cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
        "In Progress": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    };



    return (
        <Card className='dark:bg-darkSecondaryBackground'>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{patientName}</CardTitle>
                    <Badge className={cn("border", statusColors[status])}>{status}</Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                    <Stethoscope className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Dr. {doctorName}</span>
                    <Badge variant="outline" className="ml-auto">{department}</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{type}</span>
                </div>
                {notes && (
                    <p className="text-sm text-muted-foreground pt-2 border-t">{notes}</p>
                )}
                <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1">View Details</Button>
                    {status === "Scheduled" && (
                        <Button size="sm" variant="outline" className="flex-1">Reschedule</Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
