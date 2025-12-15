import React from 'react'
import AppAvatar from '../../../(misc)/_components/AppAvatar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge';
import { Activity, Calendar, ChevronRight, Clock, FileText, Mail, Phone } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function AppointmentDetails({ appointment }) {

    const statusConfig = {
        scheduled: { label: "Scheduled", className: "bg-primary/10 text-primary border-primary/20" },
        "in-progress": { label: "In Progress", className: "bg-warning/10 text-warning border-warning/20" },
        completed: { label: "Completed", className: "bg-success/10 text-success border-success/20" },
        cancelled: { label: "Cancelled", className: "bg-destructive/10 text-destructive border-destructive/20" },
    };


    return (
        <div>

            <Card className="w-full">
                {/* Header with gradient accent */}


                <CardHeader className="">
                    <div className="flex flex-row items-start gap-4">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16 border-2 border-primary/20 shadow-md">
                                <AvatarImage src={appointment?.patientDetails?.avatar} alt={appointment?.patientDetails?.displayName} />
                                <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                                    {'Amit Vishwa'.split(" ").map(n => n[0]).join("")}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="text-xl font-semibold text-card-foreground">{appointment?.patientDetails?.displayName}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-sm text-muted-foreground">
                                        {'45'} years • {'Male'}
                                    </span>
                                    <span className="text-muted-foreground">•</span>
                                    <span className="text-sm font-medium text-primary">{'O+'}</span>
                                </div>
                                <Badge variant="outline" className={`${'scheduled'} font-medium`}>
                                    {'scheduled'}
                                </Badge>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 mr-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                    <Calendar className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Appointment Date</p>
                                    <p className="font-semibold text-card-foreground">{appointment.date}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                    <Clock className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Time</p>
                                    <p className="font-semibold text-card-foreground">{appointment.time}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-5">
                    {/* Appointment Details */}
                    <div className="rounded-xl bg-secondary/50 p-4">

                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <FileText className="h-4 w-4 text-primary" />
                                <h4 className="text-sm font-semibold text-card-foreground">Reason for Visit</h4>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed pl-6">
                                {appointment.reason}
                            </p>
                        </div>
                    </div>

                    {/* Reason for Visit */}


                </CardContent>

            </Card>
        </div>
    )
}
