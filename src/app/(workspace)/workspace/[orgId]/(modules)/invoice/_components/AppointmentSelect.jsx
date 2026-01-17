import React, { useMemo, useState } from 'react'
import { Check, ChevronsUpDown, Search, User, Stethoscope, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import moment from 'moment';
import { CustomBadge } from '../../../(misc)/_components/CustomBadge';


const searchAppointment = (appointment, searchTerm) => {
    const term = searchTerm.toLowerCase();

    // Search in appointment fields
    if (appointment.id.toLowerCase().includes(term)) return true;
    if (appointment.date.toLowerCase().includes(term)) return true;
    if (appointment.time.toLowerCase().includes(term)) return true;
    if (appointment.status.toLowerCase().includes(term)) return true;
    if (appointment.visitType.toLowerCase().includes(term)) return true;

    // Search in patient fields
    if (appointment.patient?.displayName.toLowerCase().includes(term)) return true;
    if (appointment.patient?.email.toLowerCase().includes(term)) return true;
    //if (appointment.patient?.phone ? appointment.patient?.phone.toLowerCase().includes(term) : term) return true;

    // Search in doctor fields
    if (appointment.doctor?.displayName.toLowerCase().includes(term)) return true;
    //if (appointment.doctor?.specialization.toLowerCase().includes(term)) return true;
    //if (appointment.doctor?.department.toLowerCase().includes(term)) return true;

    return false;
};

const getStatusColor = (status) => {
    switch (status) {
        case 'scheduled':
            return 'bg-medical-scheduled text-medical-scheduled-foreground';
        case 'completed':
            return 'bg-medical-completed text-medical-completed-foreground';
        case 'cancelled':
            return 'bg-medical-cancelled text-medical-cancelled-foreground';
        case 'in-progress':
            return 'bg-medical-inprogress text-medical-inprogress-foreground';
        default:
            return 'bg-muted text-muted-foreground';
    }
};

export default function AppointmentSelect({ appointments, value, onSelect, onValueChange, placeholder = "Select appointment..." }) {



    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const selectedAppointment = appointments.find((apt) => apt.id === value);

    const filteredAppointments = useMemo(() => {
        if (!searchTerm) return appointments;
        return appointments.filter((apt) => searchAppointment(apt, searchTerm));
    }, [appointments, searchTerm]);


    return (
        <Popover open={open} onOpenChange={setOpen} className='bg-red-200'>

            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between h-auto min-h-[3rem] px-4 py-3 bg-card border-border hover:bg-accent/50 transition-all duration-200 bg-red-100"
                >
                    {selectedAppointment ? (
                        <div className="flex items-center gap-3 text-left">
                            <div className="flex flex-col">
                                <span className="font-medium text-foreground">
                                    {selectedAppointment?.patient?.displayName}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    Dr. {selectedAppointment?.doctor?.name} • {moment(selectedAppointment.date).format("MMM Do YY")} at {selectedAppointment.time}
                                </span>
                            </div>
                            <CustomBadge className={cn("ml-auto", getStatusColor(selectedAppointment.status))} status={selectedAppointment.status}>
                                {selectedAppointment.status}
                            </CustomBadge>
                        </div>
                    ) : (
                        <span className="text-muted-foreground">{placeholder}</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>

            <PopoverContent className="flex w-[555px] p-0 bg-card border-border shadow-lg " align="start">
                <Command shouldFilter={false} className="bg-transparent ">

                    <div className="flex items-center border-b border-border px-3 ">
                        <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                        <input
                            placeholder="Search by patient, doctor, date, status..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>

                    <CommandList className="max-h-[300px]">
                        <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                            No appointments found.
                        </CommandEmpty>
                        <CommandGroup>
                            {filteredAppointments.map((appointment) => (
                                <CommandItem
                                    key={appointment.id}
                                    value={appointment.id}
                                    onSelect={() => {
                                        //onSelect(appointment.id === value ? undefined : appointment);
                                        setOpen(false);
                                        setSearchTerm("");
                                        onValueChange(appointment.id === value ? undefined : appointment)
                                    }}
                                    className="cursor-pointer px-4 py-3 aria-selected:bg-accent/50"
                                >
                                    <div className="flex items-start gap-3 w-full">
                                        <div className={cn(
                                            "flex h-5 w-5 items-center justify-center rounded-sm border border-primary mt-0.5",
                                            value === appointment.id
                                                ? "bg-primary text-primary-foreground"
                                                : "opacity-50 [&_svg]:invisible"
                                        )}>
                                            <Check className="h-3 w-3" />
                                        </div>

                                        <div className="flex-1 grid gap-2">
                                            {/* Patient Info */}
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-medical-patient text-sky-500" />
                                                <span className="font-medium text-foreground">
                                                    {appointment?.patient?.displayName}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {appointment?.patient?.phone}
                                                </span>
                                            </div>

                                            {/* Doctor Info */}
                                            <div className="flex items-center gap-2">
                                                <Stethoscope className="h-4 w-4 text-medical-doctor text-green-500" />
                                                <span className="text-sm text-foreground">
                                                    Dr. {appointment?.doctor?.displayName}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {appointment?.doctor?.specialization || 'Cardiology'}
                                                </span>
                                            </div>


                                            {/* Appointment Details */}
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground text-orange-500" />
                                                <span className="text-xs text-muted-foreground">
                                                    {moment(appointment.date).format("MMM Do YY")} at {appointment.time}
                                                </span>
                                                <span className="text-xs text-muted-foreground">•</span>
                                                <span className="text-xs text-muted-foreground italic">
                                                    {appointment.visitType}
                                                </span>
                                            </div>
                                        </div>

                                        <Badge className={cn("shrink-0", getStatusColor(appointment.status))}>
                                            {appointment.status}
                                        </Badge>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
