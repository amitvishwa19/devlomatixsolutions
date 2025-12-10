import React from 'react'
import { Phone, Mail, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const patients = [
    {
        id: "1",
        name: "Robert Martinez",
        initials: "RM",
        email: "robert.m@email.com",
        phone: "+1 (555) 123-4567",
        lastVisit: "2 days ago",
        condition: "Hypertension",
    },
    {
        id: "2",
        name: "Amanda Foster",
        initials: "AF",
        email: "amanda.f@email.com",
        phone: "+1 (555) 234-5678",
        lastVisit: "1 week ago",
        condition: "Diabetes Type 2",
    },
    {
        id: "3",
        name: "David Kim",
        initials: "DK",
        email: "david.k@email.com",
        phone: "+1 (555) 345-6789",
        lastVisit: "3 days ago",
        condition: "Routine Checkup",
    },
    {
        id: "4",
        name: "Patricia Brown",
        initials: "PB",
        email: "patricia.b@email.com",
        phone: "+1 (555) 456-7890",
        lastVisit: "5 days ago",
        condition: "Allergies",
    },
];


export default function RecentPatients() {
    return (
        <div className="rounded-xl border border-border/50 bg-card dark:bg-darkSecondaryBackground shadow-card animate-slide-up" style={{ animationDelay: "300ms" }}>
            <div className="flex items-center justify-between border-b border-border/50 p-5">
                <div>
                    <h3 className="text-lg font-semibold text-foreground">Recent Patients</h3>
                    <p className="text-sm text-muted-foreground">Quick access to patient records</p>
                </div>
                <Button variant="outline" size="sm">
                    View All
                </Button>
            </div>

            <div className="divide-y divide-border/50">
                {patients.map((patient) => (
                    <div
                        key={patient.id}
                        className="group flex items-center justify-between p-4 transition-colors hover:bg-accent/30 cursor-pointer"
                    >
                        <div className="flex items-center gap-4">
                            <Avatar className="h-11 w-11 border-2 border-border/50">
                                <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                                    {patient.initials}
                                </AvatarFallback>
                            </Avatar>

                            <div className="space-y-1">
                                <p className="font-medium text-foreground">{patient.name}</p>
                                <p className="text-sm text-muted-foreground">{patient.condition}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="hidden md:flex flex-col items-end gap-1">
                                <span className="text-xs text-muted-foreground">Last visit</span>
                                <span className="text-sm font-medium text-foreground">{patient.lastVisit}</span>
                            </div>

                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </div>

                            <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
