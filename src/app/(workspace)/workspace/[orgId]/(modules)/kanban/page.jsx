'use client'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ContentTopbar } from '../../(misc)/_components/ContentTopbar'

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Users, Stethoscope, CalendarDays, BedDouble, Search, Phone, Mail, Clock, User, Building, Activity, ClipboardList } from 'lucide-react';
import { format } from 'date-fns';
import { mockAppointments, mockDoctors, mockPatients, mockRooms, mockWards } from './_data/mockData';
import { KanbanBoard } from './_components/KanbanBoard';
//import { mockPatients, mockDoctors, mockWards, mockRooms, mockAppointments } from '../data/mockData.js';

export default function KanbanPage() {

    const [patientSearch, setPatientSearch] = useState('');
    const [doctorSearch, setDoctorSearch] = useState('');
    const [appointments, setAppointments] = useState(mockAppointments);

    // Calculate stats
    const totalPatients = mockPatients?.length;
    const activeDoctors = mockDoctors?.filter(d => d.is_active).length;
    const todayAppointments = mockAppointments.filter(
        a => a.appointment_date === format(new Date(), 'yyyy-MM-dd')
    ).length;
    const availableBeds = mockRooms?.reduce((sum, r) => sum + r.available_beds, 0);

    const statCards = [
        { title: 'Total Patients', value: totalPatients, icon: Users, color: 'text-primary' },
        { title: 'Active Doctors', value: activeDoctors, icon: Stethoscope, color: 'text-emerald-500' },
        { title: "Today's Appointments", value: todayAppointments, icon: CalendarDays, color: 'text-amber-500' },
        { title: 'Available Beds', value: availableBeds, icon: BedDouble, color: 'text-sky-500' },
    ];

    // Filter functions
    const filteredPatients = mockPatients.filter((p) =>
        p.full_name.toLowerCase().includes(patientSearch.toLowerCase()) ||
        p.phone?.includes(patientSearch) ||
        p.email?.toLowerCase().includes(patientSearch.toLowerCase())
    );

    const filteredDoctors = mockDoctors.filter((d) =>
        d.full_name.toLowerCase().includes(doctorSearch.toLowerCase()) ||
        d.specialty.toLowerCase().includes(doctorSearch.toLowerCase())
    );

    const getPatientName = (patientId) => {
        return mockPatients.find(p => p.id === patientId)?.full_name || 'Unknown';
    };

    const getDoctor = (doctorId) => {
        return mockDoctors.find(d => d.id === doctorId);
    };

    const updateAppointmentStatus = (id, status) => {
        setAppointments(prev =>
            prev.map(apt => apt.id === id ? { ...apt, status } : apt)
        );
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'scheduled': return 'bg-sky-500/10 text-sky-600 border-sky-500/20';
            case 'confirmed': return 'bg-primary/10 text-primary border-primary/20';
            case 'in-progress': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
            case 'completed': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
            case 'cancelled': return 'bg-destructive/10 text-destructive border-destructive/20';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    const getWardRooms = (wardId) => mockRooms.filter((r) => r.ward_id === wardId);


    return (
        <div className='absolute inset-0 flex flex-col gap-2 p-2'>

            <ContentTopbar
                title='Kanban'
                description='Coordinate departments, reduce delays, and elevate patient outcomes'
                icon='kanban'


            />

            <ScrollArea className='h-[85vh] flex flex-grow rounded-md'>
                <div>

                    <main className="container py-6 space-y-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {statCards.map((stat) => {
                                const Icon = stat.icon;
                                return (
                                    <Card key={stat.title}>
                                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                                {stat.title}
                                            </CardTitle>
                                            <Icon className={`w-5 h-5 ${stat.color}`} />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-3xl font-bold">{stat.value}</div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>

                        {/* Main Content Tabs */}
                        <Tabs defaultValue="tasks" className="space-y-4">
                            <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
                                <TabsTrigger value="tasks" className="gap-2">
                                    <ClipboardList className="w-4 h-4 hidden sm:inline" />
                                    Tasks
                                </TabsTrigger>
                                <TabsTrigger value="patients" className="gap-2">
                                    <Users className="w-4 h-4 hidden sm:inline" />
                                    Patients
                                </TabsTrigger>
                                <TabsTrigger value="doctors" className="gap-2">
                                    <Stethoscope className="w-4 h-4 hidden sm:inline" />
                                    Doctors
                                </TabsTrigger>
                                <TabsTrigger value="appointments" className="gap-2">
                                    <CalendarDays className="w-4 h-4 hidden sm:inline" />
                                    Appointments
                                </TabsTrigger>
                                <TabsTrigger value="wards" className="gap-2">
                                    <BedDouble className="w-4 h-4 hidden sm:inline" />
                                    Wards
                                </TabsTrigger>
                            </TabsList>

                            {/* Tasks Tab - Kanban Board */}
                            <TabsContent value="tasks">
                                <KanbanBoard />
                            </TabsContent>

                            {/* Patients Tab */}
                            <TabsContent value="patients">
                                <Card>
                                    <CardHeader>
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <CardTitle>Patient Records</CardTitle>
                                            <div className="flex items-center gap-2 max-w-sm">
                                                <Search className="w-4 h-4 text-muted-foreground" />
                                                <Input
                                                    value={patientSearch}
                                                    onChange={(e) => setPatientSearch(e.target.value)}
                                                    placeholder="Search patients..."
                                                    className="h-9"
                                                />
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Name</TableHead>
                                                        <TableHead>Age/Gender</TableHead>
                                                        <TableHead>Phone</TableHead>
                                                        <TableHead>Blood Group</TableHead>
                                                        <TableHead>Email</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {filteredPatients.map((patient) => (
                                                        <TableRow key={patient.id}>
                                                            <TableCell className="font-medium">{patient.full_name}</TableCell>
                                                            <TableCell>
                                                                {patient.age ? `${patient.age} yrs` : '-'}
                                                                {patient.gender ? ` • ${patient.gender}` : ''}
                                                            </TableCell>
                                                            <TableCell>{patient.phone || '-'}</TableCell>
                                                            <TableCell>
                                                                {patient.blood_group && (
                                                                    <Badge variant="outline">{patient.blood_group}</Badge>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-muted-foreground">{patient.email || '-'}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Doctors Tab */}
                            <TabsContent value="doctors">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 max-w-sm">
                                        <Search className="w-4 h-4 text-muted-foreground" />
                                        <Input
                                            value={doctorSearch}
                                            onChange={(e) => setDoctorSearch(e.target.value)}
                                            placeholder="Search doctors by name or specialty..."
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {filteredDoctors.map((doctor) => (
                                            <Card key={doctor.id}>
                                                <CardHeader className="pb-3">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                                                <Stethoscope className="w-6 h-6 text-primary" />
                                                            </div>
                                                            <div>
                                                                <h3 className="font-semibold">Dr. {doctor.full_name}</h3>
                                                                <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                                                            </div>
                                                        </div>
                                                        <Badge variant={doctor.is_active ? 'default' : 'secondary'}>
                                                            {doctor.is_active ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="space-y-2 text-sm">
                                                    {doctor.qualification && (
                                                        <p className="text-muted-foreground">{doctor.qualification}</p>
                                                    )}
                                                    {doctor.experience_years && (
                                                        <p>{doctor.experience_years} years experience</p>
                                                    )}
                                                    {doctor.phone && (
                                                        <div className="flex items-center gap-2 text-muted-foreground">
                                                            <Phone className="w-4 h-4" />
                                                            {doctor.phone}
                                                        </div>
                                                    )}
                                                    {doctor.email && (
                                                        <div className="flex items-center gap-2 text-muted-foreground">
                                                            <Mail className="w-4 h-4" />
                                                            {doctor.email}
                                                        </div>
                                                    )}
                                                    {doctor.consultation_fee && (
                                                        <p className="font-medium text-primary">₹{doctor.consultation_fee} / consultation</p>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Appointments Tab */}
                            <TabsContent value="appointments">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {appointments.map((apt) => {
                                        const doctor = getDoctor(apt.doctor_id);
                                        return (
                                            <Card key={apt.id}>
                                                <CardHeader className="pb-3">
                                                    <div className="flex items-center justify-between">
                                                        <CardTitle className="text-base">
                                                            {format(new Date(apt.appointment_date), 'MMM dd, yyyy')}
                                                        </CardTitle>
                                                        <Badge className={getStatusColor(apt.status)}>
                                                            {apt.status}
                                                        </Badge>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="space-y-3">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Clock className="w-4 h-4 text-muted-foreground" />
                                                        {apt.appointment_time}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <User className="w-4 h-4 text-muted-foreground" />
                                                        {getPatientName(apt.patient_id)}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Stethoscope className="w-4 h-4 text-muted-foreground" />
                                                        Dr. {doctor?.full_name || 'Unknown'} - {doctor?.specialty}
                                                    </div>
                                                    {apt.notes && (
                                                        <p className="text-sm text-muted-foreground">{apt.notes}</p>
                                                    )}
                                                    <div className="flex flex-wrap gap-2 pt-2">
                                                        {['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled'].map((status) => (
                                                            <Button
                                                                key={status}
                                                                variant={apt.status === status ? 'default' : 'outline'}
                                                                size="sm"
                                                                className="text-xs h-7"
                                                                onClick={() => updateAppointmentStatus(apt.id, status)}
                                                            >
                                                                {status}
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </TabsContent>

                            {/* Wards Tab */}
                            <TabsContent value="wards">
                                <div className="space-y-6">
                                    {mockWards?.map((ward) => {
                                        const wardRooms = getWardRooms(ward.id);
                                        const occupancy = ward.total_beds > 0
                                            ? ((ward.total_beds - ward.available_beds) / ward.total_beds) * 100
                                            : 0;

                                        return (
                                            <Card key={ward.id}>
                                                <CardHeader>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                                <Building className="w-5 h-5 text-primary" />
                                                            </div>
                                                            <div>
                                                                <CardTitle className="text-lg">{ward.name}</CardTitle>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {ward.ward_type} {ward.floor ? `• Floor ${ward.floor}` : ''}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-2xl font-bold">{ward.available_beds}</p>
                                                            <p className="text-xs text-muted-foreground">of {ward.total_beds} beds available</p>
                                                        </div>
                                                    </div>
                                                    <Progress value={occupancy} className="h-2 mt-3" />
                                                </CardHeader>
                                                {wardRooms.length > 0 && (
                                                    <CardContent>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                                            {wardRooms.map((room) => (
                                                                <div
                                                                    key={room.id}
                                                                    className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                                                >
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <span className="font-medium text-sm">Room {room.room_number}</span>
                                                                        <BedDouble className={`w-4 h-4 ${room.available_beds > 0 ? 'text-emerald-500' : 'text-destructive'}`} />
                                                                    </div>
                                                                    <Badge variant="outline" className="text-xs mb-1">
                                                                        {room.room_type}
                                                                    </Badge>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {room.available_beds}/{room.total_beds} beds
                                                                    </p>
                                                                    {room.daily_rate && (
                                                                        <p className="text-xs font-medium text-primary mt-1">₹{room.daily_rate}/day</p>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </CardContent>
                                                )}
                                            </Card>
                                        );
                                    })}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </main>
                </div>
            </ScrollArea>

        </div >
    )
}
