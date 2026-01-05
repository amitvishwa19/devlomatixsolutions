import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, User, Pill, Activity } from "lucide-react";

export function MedicalRecordCard({
    patientName,
    date,
    diagnosis,
    prescription,
    doctorName,
    symptoms,
    vitals,
}) {
    return (
        <Card className='dark:bg-[#151D24] shadow-sm border rounded-lg'>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-lg">{patientName}</CardTitle>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{date}</span>
                        </div>
                    </div>
                    <Badge variant="outline">
                        <FileText className="h-3 w-3 mr-1" />
                        Record
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Doctor</span>
                    </div>
                    <p className="text-sm text-muted-foreground ml-6">Dr. {doctorName}</p>
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Diagnosis</span>
                    </div>
                    <p className="text-sm text-muted-foreground ml-6">{diagnosis}</p>
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Symptoms</span>
                    </div>
                    <div className="flex flex-wrap gap-1 ml-6">
                        {symptoms.map((symptom, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                                {symptom}
                            </Badge>
                        ))}
                    </div>
                </div>

                {vitals && (
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Activity className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Vitals</span>
                        </div>
                        <div className="ml-6 space-y-1 text-sm text-muted-foreground">
                            <p>BP: {vitals.bloodPressure}</p>
                            <p>Temp: {vitals.temperature}</p>
                            <p>HR: {vitals.heartRate}</p>
                        </div>
                    </div>
                )}

                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Pill className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Prescription</span>
                    </div>
                    <div className="ml-6 space-y-1">
                        {prescription.map((med, idx) => (
                            <p key={idx} className="text-sm text-muted-foreground">
                                • {med}
                            </p>
                        ))}
                    </div>
                </div>

                <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1">View Full Report</Button>
                    <Button size="sm" variant="outline" className="flex-1">Download</Button>
                </div>
            </CardContent>
        </Card>
    )
}
