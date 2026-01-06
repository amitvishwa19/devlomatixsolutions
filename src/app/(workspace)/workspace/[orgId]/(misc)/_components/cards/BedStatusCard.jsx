import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bed, User, Calendar, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export function BedStatusCard({
    bedNumber,
    ward,
    floor,
    status,
    patientName,
    admissionDate,
    condition,
}) {

    const statusColors = {
        Occupied: "bg-red-500/10 text-red-500 border-red-500/20",
        Available: "bg-green-500/10 text-green-500 border-green-500/20",
        Maintenance: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
        Reserved: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    };
    return (

        <Card className='dark:bg-[#151D24] shadow-sm border rounded-lg'>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Bed className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Bed {bedNumber}</CardTitle>
                            <p className="text-sm text-muted-foreground">{ward} - Floor {floor}</p>
                        </div>
                    </div>
                    <Badge className={cn("border", statusColors[status])}>{status}</Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {status === "Occupied" && patientName && (
                    <>
                        <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{patientName}</span>
                        </div>
                        {admissionDate && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>Admitted: {admissionDate}</span>
                            </div>
                        )}
                        {condition && (
                            <div className="flex items-center gap-2 text-sm">
                                <Activity className="h-4 w-4 text-muted-foreground" />
                                <Badge variant={condition === "Critical" ? "destructive" : "secondary"}>
                                    {condition}
                                </Badge>
                            </div>
                        )}
                        <div className="flex gap-2 pt-2">
                            <Button size="sm" className="flex-1">Patient Details</Button>
                            <Button size="sm" variant="outline" className="flex-1">Update</Button>
                        </div>
                    </>
                )}
                {status === "Available" && (
                    <Button size="sm" className="w-full">Assign Patient</Button>
                )}
                {status === "Maintenance" && (
                    <p className="text-sm text-muted-foreground">Under maintenance</p>
                )}
                {status === "Reserved" && (
                    <div>
                        <p className="text-sm text-muted-foreground mb-2">Reserved for incoming patient</p>
                        <Button size="sm" variant="outline" className="w-full">View Details</Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
