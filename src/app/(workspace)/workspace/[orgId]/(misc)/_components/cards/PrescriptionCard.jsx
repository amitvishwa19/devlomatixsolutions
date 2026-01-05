import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pill, User, Calendar, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";


export function PrescriptionCard({
    prescriptionId,
    patientName,
    doctorName,
    date,
    medications,
    status,
    refills,
    instructions,
}) {

    const statusColors = {
        Active: "bg-green-500/10 text-green-500 border-green-500/20",
        Completed: "bg-gray-500/10 text-gray-500 border-gray-500/20",
        Cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
    };


    return (
        <Card className='dark:bg-[#151D24] shadow-sm border rounded-lg'>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Pill className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Prescription #{prescriptionId}</CardTitle>
                            <p className="text-sm text-muted-foreground">{patientName}</p>
                        </div>
                    </div>
                    <Badge className={cn("border", statusColors[status])}>{status}</Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Prescribed by: Dr. {doctorName}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{date}</span>
                    </div>
                    <Badge variant="outline">Refills: {refills}</Badge>
                </div>
                <div className="border-t pt-3 space-y-2">
                    <p className="text-sm font-medium">Medications:</p>
                    {medications.map((med, index) => (
                        <div key={index} className="bg-muted/50 rounded-lg p-2 text-sm">
                            <p className="font-medium">{med.name}</p>
                            <p className="text-muted-foreground">
                                {med.dosage} • {med.frequency} • {med.duration}
                            </p>
                        </div>
                    ))}
                </div>
                {instructions && (
                    <div className="flex gap-2 text-sm text-muted-foreground bg-muted/30 p-2 rounded-lg">
                        <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <span>{instructions}</span>
                    </div>
                )}
                <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1">Print</Button>
                    <Button size="sm" variant="outline" className="flex-1">Send to Pharmacy</Button>
                </div>
            </CardContent>
        </Card>
    )
}
