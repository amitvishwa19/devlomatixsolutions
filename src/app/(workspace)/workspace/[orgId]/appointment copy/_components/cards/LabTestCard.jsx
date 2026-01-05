import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FlaskConical, User, Calendar, Clock, FileText } from "lucide-react";
import { cn } from "@/lib/utils";


export function LabTestCard({
    testId,
    testName,
    patientName,
    requestedBy,
    requestDate,
    status,
    priority,
    sampleType,
    expectedTime,
}) {
    const statusColors = {
        Pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
        "In Progress": "bg-blue-500/10 text-blue-500 border-blue-500/20",
        Completed: "bg-green-500/10 text-green-500 border-green-500/20",
        Cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
    };

    const priorityColors = {
        Routine: "bg-muted text-muted-foreground",
        Urgent: "bg-orange-500/10 text-orange-500",
        STAT: "bg-red-500/10 text-red-500",
    };


    return (
        <Card className='dark:bg-darkSecondaryBackground'>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <FlaskConical className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">{testName}</CardTitle>
                            <p className="text-sm text-muted-foreground">ID: {testId}</p>
                        </div>
                    </div>
                    <Badge className={cn("border", statusColors[status])}>{status}</Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{patientName}</span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{requestDate}</span>
                    </div>
                    <Badge className={priorityColors[priority]}>{priority}</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>Sample: {sampleType}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Requested by: Dr. {requestedBy}</span>
                </div>
                {expectedTime && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Expected: {expectedTime}</span>
                    </div>
                )}
                <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1">
                        {status === "Completed" ? "View Results" : "Track Status"}
                    </Button>
                    {status === "Pending" && (
                        <Button size="sm" variant="outline" className="flex-1">Cancel</Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
