'use client'
import React, { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Clock, User } from 'lucide-react';
import { useOrg } from '@/providers/OrgProvider';



const mockAppointments = {
    "2025-11-23": [
        { id: "1", patientName: "John Doe", time: "9:00 AM", specialty: "Cardiology", status: "confirmed" },
        { id: "2", patientName: "Jane Smith", time: "11:00 AM", specialty: "Pediatrics", status: "confirmed" },
        { id: "3", patientName: "Robert Chen", time: "2:00 PM", specialty: "Neurology", status: "confirmed" },
    ],
    "2025-12-10": [
        { id: "4", patientName: "Maria Garcia", time: "10:00 AM", specialty: "Dermatology", status: "pending" },
        { id: "5", patientName: "David Lee", time: "1:00 PM", specialty: "Ophthalmology", status: "confirmed" },
    ],
    "2025-11-25": [
        { id: "6", patientName: "Sarah Williams", time: "8:00 AM", specialty: "Orthopedics", status: "confirmed" },
        { id: "7", patientName: "Tom Brown", time: "10:00 AM", specialty: "General Practice", status: "confirmed" },
        { id: "8", patientName: "Emily Davis", time: "3:00 PM", specialty: "Cardiology", status: "completed" },
    ],
    "2025-12-10": [
        { id: "9", patientName: "Michael Jordan", time: "9:00 AM", specialty: "Sports Medicine", status: "confirmed" },
        { id: "10", patientName: "Lisa Anderson", time: "11:00 AM", specialty: "Pediatrics", status: "confirmed" },
        { id: "11", patientName: "James Wilson", time: "4:00 PM", specialty: "Cardiology", status: "pending" },
    ],
    "2025-12-10": [
        { id: "12", patientName: "Mike Johnson", time: "2:00 PM", specialty: "Dermatology", status: "pending" },
        { id: "121", patientName: "Mike Johnson", time: "2:15 PM", specialty: "Dermatology", status: "pending" },
        { id: "1211", patientName: "Mike Johnson", time: "4:00 PM", specialty: "Dermatology", status: "pending" },
        { id: "13", patientName: "Anna Martinez", time: "5:00 PM", specialty: "Psychiatry", status: "confirmed" },
    ],
    "2025-11-28": [
        { id: "14", patientName: "Patricia White", time: "10:00 AM", specialty: "Endocrinology", status: "completed" },
        { id: "15", patientName: "Kevin Brown", time: "1:00 PM", specialty: "Gastroenterology", status: "confirmed" },
        { id: "16", patientName: "Rachel Green", time: "3:00 PM", specialty: "Rheumatology", status: "confirmed" },
    ],
    "2025-11-29": [
        { id: "17", patientName: "Chris Evans", time: "9:00 AM", specialty: "Urology", status: "confirmed" },
        { id: "18", patientName: "Monica Geller", time: "11:00 AM", specialty: "Obstetrics", status: "confirmed" },
    ],
};


export default function AppointmentCalenderPage() {
    const { server } = useOrg()
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [viewType, setViewType] = useState("day");

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const [rawAppointments, setrawAppointments] = useState([])


    //const rawappointments = groupAppointmentsByDate(server?.appointments)

    useEffect(() => {
        setrawAppointments(groupAppointmentsByDate(server?.appointments))
    }, [server])


    const getWeekDays = () => {
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
        return Array.from({ length: 7 }, (_, i) => {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            return day;
        });
    };

    const previousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const formatDateKey = (day) => {
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, "0");
        const dayStr = String(day).padStart(2, "0");
        return `${year}-${month}-${dayStr}`;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "confirmed":
                return "bg-primary/10 text-primary border-primary/20";
            case "pending":
                return "bg-secondary/10 text-secondary border-secondary/20";
            case "completed":
                return "bg-muted text-muted-foreground border-border";
            default:
                return "bg-accent text-accent-foreground border-border";
        }
    };

    const renderMonthView = () => {
        const days = [];
        const totalCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;

        for (let i = 0; i < totalCells; i++) {
            const day = i - firstDayOfMonth + 1;
            const isValidDay = day > 0 && day <= daysInMonth;
            const dateKey = isValidDay ? formatDateKey(day) : "";
            const appointments = isValidDay ? rawAppointments[dateKey] || [] : [];
            const isToday = isValidDay &&
                day === new Date().getDate() &&
                currentDate.getMonth() === new Date().getMonth() &&
                currentDate.getFullYear() === new Date().getFullYear();

            days.push(
                <div key={i}
                    className={cn(
                        "min-h-20 transition-all duration-200 rounded-md items-center justify-center m-[1px] p-2 border",
                        isValidDay ? "dark:bg-darkFocusColor hover:bg-accent/50 cursor-pointer" : "bg-muted/30 dark:bg-darkSecondaryBackground",
                        isToday && "ring-1 ring-primary"
                    )}
                    onClick={() => isValidDay && setSelectedDate(dateKey)}
                >
                    {isValidDay && (
                        <>
                            <div className={cn(
                                "text-sm font-medium mb-2",
                                isToday && "text-primary"
                            )}>
                                {day}
                            </div>
                            <div className="space-y-1">
                                {appointments.slice(0, 3).map((apt) => (
                                    <div
                                        key={apt.id}
                                        className="text-xs p-1 rounded bg-primary/10 text-primary truncate"
                                        onClick={() => { console.log('@monthview-appointment click', apt) }}
                                    >
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            <span>{apt.time}</span>
                                        </div>
                                    </div>
                                ))}
                                {appointments.length > 3 && (
                                    <div className="text-xs text-muted-foreground">
                                        +{appointments.length - 3} more
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            );
        }

        return days;
    };

    const renderWeekView = () => {
        const weekDays = getWeekDays();
        return (
            <div className="grid grid-cols-7 gap-2 h-full w-full p-2">
                {weekDays.map((day, idx) => {
                    const dateKey = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
                    const appointments = rawAppointments[dateKey] || [];
                    const isToday = day.toDateString() === new Date().toDateString();

                    return (
                        <Card key={idx} className={cn("p-3  dark:bg-darkFocusColor rounded-md border ring-[0.4px] px-0", isToday && "ring-[1px] ")}>
                            <ScrollArea className=' h-[86vh] p-1'>
                                <div className="text-center mb-2">
                                    <div className="text-xs text-muted-foreground">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][idx]}</div>
                                    <div className={cn("text-2xl font-bold", isToday && "text-primary")}>{day.getDate()}</div>
                                </div>
                                <div className="space-y-2">
                                    {appointments.map((apt) => (
                                        <Card key={apt.id} className="p-2 bg-primary/10 border  ring-[0.4px] m-1">
                                            <div className="text-xs font-medium text-foreground">{apt.patientName}</div>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                                <Clock className="h-3 w-3" />
                                                <span>{apt.time}</span>
                                            </div>
                                            <Badge variant="outline" className={cn("mt-1 text-xs", getStatusColor(apt.status))}>
                                                {apt.status}
                                            </Badge>
                                        </Card>
                                    ))}
                                </div>
                            </ScrollArea>
                        </Card>
                    );
                })}
            </div>
        );
    };

    const renderDayView = () => {
        const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;
        const appointments = rawAppointments[dateKey] || [];
        const hours = Array.from({ length: 24 }, (_, i) => i);

        return (
            <ScrollArea className="overflow-auto h-full w-full p-2">
                <div className="min-w-[600px]">
                    {hours.map((hour) => {
                        const timeSlot = `${hour === 0 ? 12 : hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? "PM" : "AM"}`;
                        const appointmentsInHour = appointments.filter(apt => {
                            const aptHour = parseInt(apt.time.split(":")[0]);
                            const aptPeriod = apt.time.includes("PM") ? 12 : 0;
                            const aptHour24 = (aptHour === 12 ? 0 : aptHour) + aptPeriod;
                            return aptHour24 === hour;
                        });

                        return (
                            <div key={hour} className="flex border-b border-border min-h-[80px]">
                                <div className="w-24 p-3 text-sm text-muted-foreground border-r border-border">
                                    {timeSlot}
                                </div>
                                <div className="flex-1 p-2 space-y-2">
                                    {appointmentsInHour.map((apt) => (
                                        <Card key={apt.id} className="p-3 bg-primary/10 border-primary/20">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium text-foreground">{apt.patientName}</span>
                                                </div>
                                                <Badge variant="outline" className={getStatusColor(apt.status)}>
                                                    {apt.status}
                                                </Badge>
                                            </div>
                                            <div className="text-sm text-muted-foreground">{apt.specialty}</div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </ScrollArea>
        );
    };

    const getViewTitle = () => {
        if (viewType === "month") {
            return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
        } else if (viewType === "week") {
            const weekDays = getWeekDays();
            const start = weekDays[0];
            const end = weekDays[6];
            return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
        } else {
            return currentDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
        }
    };

    const selectedAppointments = selectedDate ? mockAppointments[selectedDate] || [] : [];

    function groupAppointmentsByDate(rawAppointments) {

        console.log('rawAppointments', rawAppointments)
        return rawAppointments?.reduce((acc, appt, index) => {
            const dateKey = appt.date.split('T')[0]        // "2025-12-09T..." -> "2025-12-09"

            const item = {
                id: appt.id ?? String(index + 1),
                patientName: appt.patient?.displayName ?? 'Unknown',
                time: appt.time,                             // "08:00 PM"
                specialty: appt.visitType ?? 'Consultation', // or appt.type?.type
                status: appt.status,                         // "completed", "scheduled", etc.
            }

            if (!acc[dateKey]) acc[dateKey] = []
            acc[dateKey].push(item)

            return acc
        }, {})
    }



    return (
        <div className='absolute inset-0 flex flex-col gap-2 p-2'>

            <div className='w-full dark:bg-[#151D24] p-4 rounded-md border flex flex-row items-center justify-between'>
                <div>
                    <h2 className='text-xl'>Schedule Calendar</h2>
                    <h2 className='text-xs text-white/50'>Manage all your appointments</h2>
                </div>

                {viewType === 'month' && (
                    <div className="">
                        <div className="container mx-auto flex items-center justify-between">

                            <div className="flex items-center gap-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={previousMonth}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <div className="text-lg font-semibold min-w-[200px] text-center text-foreground">
                                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={nextMonth}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                <div className='flex flex-row gap-2'>
                    <Button variant={'outline'}
                        size={'sm'}
                        className={`w-32 ${viewType === 'day' && 'bg-primary/10 dark:bg-darkFocusColor'}`}
                        onClick={() => setViewType("day")}
                    >
                        Day
                    </Button>
                    <Button variant={'outline'}
                        size={'sm'}
                        className={`w-32 ${viewType === 'week' && 'bg-primary/10 dark:bg-darkFocusColor'}`}
                        onClick={() => setViewType("week")}
                    >
                        Week
                    </Button>
                    <Button variant={'outline'}
                        size={'sm'}
                        className={`w-32 ${viewType === 'month' && 'bg-primary/10 dark:bg-darkFocusColor border'}`}
                        onClick={() => setViewType("month")}
                    >
                        Month
                    </Button>


                </div>
            </div>

            <div className=' flex flex-1 dark:bg-darkSecondaryBackground h-full rounded-md'>

                {viewType === 'month' && (
                    <div className="flex flex-col w-full p-2">
                        <div className="grid grid-cols-7 gap-0 mb-2">
                            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                                <div key={day} className="text-center font-semibold text-sm p-2 text-muted-foreground dark:bg-darkFocusColor rounded-md border m-[2px]"                                        >
                                    {day}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 grid-rows-6 gap-1 h-full  rounded-md">
                            {renderMonthView()}
                        </div>
                    </div>)}
                {viewType === "week" && renderWeekView()}
                {viewType === "day" && renderDayView()}




                {/* Sidebar for selected date appointments */}
                {/* <div className="w-80   p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-foreground">
                                    {new Date(selectedDate).toLocaleDateString("en-US", {
                                        month: "long",
                                        day: "numeric",
                                        year: "numeric"
                                    })}
                                </h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedDate(null)}
                                >
                                    Close
                                </Button>
                            </div>

                            {selectedAppointments.length === 0 ? (
                                <p className="text-muted-foreground text-sm">No appointments for this date</p>
                            ) : (
                                <div className="space-y-3">
                                    {selectedAppointments.map((apt) => (
                                        <Card key={apt.id} className="p-3 hover:shadow-md transition-shadow">
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4 text-muted-foreground" />
                                                        <span className="font-medium text-foreground">{apt.patientName}</span>
                                                    </div>
                                                    <Badge variant="outline" className={getStatusColor(apt.status)}>
                                                        {apt.status}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    <span>{apt.time}</span>
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {apt.specialty}
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div> */}


            </div>


        </div >
    )
}
