import React from 'react'
import { Clock, User, MoreVertical, CloudAlert } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import AppAvatar from '../AppAvatar';
import { CustomBadge } from '../CustomBadge';
import { useOrg } from '@/providers/OrgProvider';
import { useRouter } from 'next/navigation';

const mockAppointments = [
    {
        id: "1",
        patientName: "Sarah Johnson",
        patientInitials: "SJ",
        time: "09:00 AM",
        type: "General Checkup",
        status: "confirmed",
    },
    {
        id: "2",
        patientName: "Michael Chen",
        patientInitials: "MC",
        time: "10:30 AM",
        type: "Dental Cleaning",
        status: "pending",
    },
    {
        id: "3",
        patientName: "Emily Davis",
        patientInitials: "ED",
        time: "11:45 AM",
        type: "Follow-up",
        status: "confirmed",
    },
    {
        id: "4",
        patientName: "James Wilson",
        patientInitials: "JW",
        time: "02:00 PM",
        type: "Consultation",
        status: "pending",
    },
    {
        id: "5",
        patientName: "Lisa Anderson",
        patientInitials: "LA",
        time: "03:30 PM",
        type: "X-Ray Review",
        status: "confirmed",
    },
    {
        id: "6",
        patientName: "Lisa Anderson",
        patientInitials: "LA",
        time: "03:30 PM",
        type: "X-Ray Review",
        status: "confirmed",
    },
];

const statusStyles = {
    completed: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    confirmed: "bg-green-500/10 text-green-500 border-green-500/20",
    error: "bg-red-500/10 text-red-500 border-red-500/20",
    scheduled: "bg-blue-500/10 text-blue-500 border-blue-500/20",
};



export default function AppointmentsList({ appointments, count }) {
    const { orgId } = useOrg()
    const router = useRouter()
    return (
        <div className="rounded-xl border border-border/50 bg-card dark:bg-darkSecondaryBackground shadow-card animate-slide-up" style={{ animationDelay: "200ms" }}>

            <div className="flex items-center justify-between border-b border-border/50 p-5">
                <div>
                    <h3 className="text-lg font-semibold text-foreground">Today's Appointments</h3>
                    <p className="text-sm text-muted-foreground">{appointments?.length} appointments scheduled</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => { router.push(`/workspace/${orgId}/appointment`) }}>
                    View All
                </Button>
            </div>
            {/* 
            <div className="divide-y divide-border/50">
                {mockAppointments.map((appointment, index) => (
                    <div
                        key={appointment.id}
                        className="flex items-center justify-between p-4 transition-colors hover:bg-accent/30"
                    >
                        <div className="flex items-center gap-4">
                            <Avatar className="h-10 w-10 border-2 border-border/50">
                                <AvatarFallback className="bg-accent text-accent-foreground text-sm font-medium">
                                    {appointment.patientInitials}
                                </AvatarFallback>
                            </Avatar>

                            <div>
                                <p className="font-medium text-foreground">{appointment.patientName}</p>
                                <p className="text-sm text-muted-foreground">{appointment.type}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                {appointment.time}
                            </div>

                            <Badge
                                variant="outline"
                                className={cn("capitalize", statusStyles[appointment.status])}
                            >
                                {appointment.status}
                            </Badge>

                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div> */}

            <div className="divide-y divide-border/50">
                {appointments?.filter(a => a.status !== 'completed')?.slice(0, count).length > 0 ? (
                    appointments?.filter(a => a.status !== 'completed')?.slice(0, count)?.map((appointment) => (
                        <div
                            key={appointment.id}
                            className="flex items-center justify-between p-2 transition-colors hover:bg-accent/30"
                        >
                            <div className="flex items-center gap-4">
                                <AppAvatar
                                    name={appointment?.patient?.displayName}
                                    avatar={appointment?.patient?.avatar}
                                    size={40}

                                />
                                <div >
                                    <p className="font-medium text-foreground">{appointment?.patient?.displayName}</p>
                                    <p className="text-sm text-muted-foreground">{appointment?.visitType}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    {appointment.time}
                                </div>

                                <Badge
                                    variant="outline"
                                    className={cn("capitalize", statusStyles[appointment.status])}
                                >
                                    {appointment.status}
                                </Badge>




                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className='p-4 flex w-full items-center justify-center gap-2'>
                        <CloudAlert size={20} />
                        <p>No Appointment found</p>
                    </div>
                )}

            </div>


        </div>
    )
}
