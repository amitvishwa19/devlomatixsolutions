'use client'
import React, { useEffect, useEffectEvent, useMemo, useState } from 'react'
import { ContentTopbar } from '../../(misc)/_components/ContentTopbar'
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { DOCTOR_SCHEDULES } from './misc/types';
import { calculateAppointmentStats, filterAppointments } from './misc/utils';
import { mockAppointments } from './misc/mockAppointments';
import { DoctorAvailabilitySheet } from './components/DoctorAvailabilitySheet';
import { WaitlistSheet } from './components/WaitlistSheet';
import { NewAppointmentDialog } from './components/NewAppointmentDialog';
import { AppointmentStatsCards } from './components/AppointmentStatsCards';
import { AppointmentFilters } from './components/AppointmentFilters';
import { AppointmentList } from './components/AppointmentList';
import { AppointmentTableView } from './components/AppointmentTableView';
import { AppointmentCalendarView } from './components/AppointmentCalendarView';
import { DraggableCalendarView } from './components/DraggableCalendarView';
import { AppointmentAnalytics } from './components/AppointmentAnalytics';
import { AppointmentDetailSheet } from './components/AppointmentDetailSheet';





export default function Appointments() {
    const [appointments, setAppointments] = useLocalStorage('hms_appointments', mockAppointments);
    const [waitlist, setWaitlist] = useLocalStorage('hms_waitlist', []);
    const [doctorSchedules, setDoctorSchedules] = useLocalStorage('hms_doctor_schedules', DOCTOR_SCHEDULES);

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [doctorFilter, setDoctorFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState(null);
    const [viewMode, setViewMode] = useState('list');
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [detailSheetOpen, setDetailSheetOpen] = useState(false);
    const [prefillData, setPrefillData] = useState(null);

    const stats = useMemo(() => calculateAppointmentStats(appointments), [appointments]);

    const filteredAppointments = useMemo(() => {
        return filterAppointments(appointments, {
            search: searchQuery,
            status: statusFilter,
            department: departmentFilter,
            doctor: doctorFilter,
            date: dateFilter,
        });
    }, [appointments, searchQuery, statusFilter, departmentFilter, doctorFilter, dateFilter]);

    const handleAppointmentClick = (appointment) => {
        setSelectedAppointment(appointment);
        setDetailSheetOpen(true);
    };

    const handleStatusChange = (appointmentId, newStatus) => {
        console.log('Updating appointment status:', { appointmentId, newStatus });
        setAppointments((prev) =>
            prev.map((apt) =>
                apt.id === appointmentId ? { ...apt, status: newStatus } : apt
            )
        );
    };

    const handleAddAppointment = (newAppointment) => {
        console.log('Adding appointment:', newAppointment);
        setAppointments((prev) => [newAppointment, ...prev]);
    };

    const handleReschedule = (appointmentId, newDate, newTime) => {
        console.log('Rescheduling appointment:', { appointmentId, newDate, newTime });
        setAppointments((prev) =>
            prev.map((apt) =>
                apt.id === appointmentId ? { ...apt, date: newDate, time: newTime } : apt
            )
        );
    };

    const handleDeleteAppointment = (appointmentId) => {
        console.log('Deleting appointment:', appointmentId);
        setAppointments((prev) => prev.filter((apt) => apt.id !== appointmentId));
        setSelectedAppointment(null);
        setDetailSheetOpen(false);
    };

    const handleScheduleFromWaitlist = (entry) => {
        setPrefillData({
            patientId: entry.patientId,
            doctorId: entry.doctorId,
        });
    };

    return (
        <div className='absolute inset-0 flex flex-col gap-2'>

            <ContentTopbar
                title='Appointments'
                description='Schedule, manage, and track all patient appointments efficiently'
                icon='workflow'
                actionComp={<div className="flex items-center gap-3">
                    <DoctorAvailabilitySheet
                        doctorSchedules={doctorSchedules}
                        onUpdateSchedules={setDoctorSchedules}
                    />
                    <WaitlistSheet
                        waitlist={waitlist}
                        onUpdateWaitlist={setWaitlist}
                        onScheduleFromWaitlist={handleScheduleFromWaitlist}
                    />
                    <NewAppointmentDialog onAddAppointment={handleAddAppointment} prefillData={prefillData} />
                </div>}
            />

            {/* Header */}
            <div className="flex items-start justify-between w-full px-2">
                <AppointmentStatsCards stats={stats} />
            </div>


            {/* Filters */}
            <div className="px-2">
                <AppointmentFilters
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    statusFilter={statusFilter}
                    onStatusFilterChange={setStatusFilter}
                    departmentFilter={departmentFilter}
                    onDepartmentFilterChange={setDepartmentFilter}
                    doctorFilter={doctorFilter}
                    onDoctorFilterChange={setDoctorFilter}
                    dateFilter={dateFilter}
                    onDateFilterChange={setDateFilter}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                />
            </div>

            {/* Appointments View */}
            <div className="flex-1 overflow-y-auto p-2">
                {viewMode === 'list' && (
                    <AppointmentList
                        appointments={filteredAppointments}
                        onAppointmentClick={handleAppointmentClick}
                        onStatusChange={handleStatusChange}
                    />
                )}
                {viewMode === 'table' && (
                    <AppointmentTableView
                        appointments={filteredAppointments}
                        onAppointmentClick={handleAppointmentClick}
                        onStatusChange={handleStatusChange}
                    />
                )}
                {viewMode === 'calendar' && (
                    <AppointmentCalendarView
                        appointments={filteredAppointments}
                        onAppointmentClick={handleAppointmentClick}
                        onStatusChange={handleStatusChange}
                    />
                )}
                {viewMode === 'scheduler' && (
                    <DraggableCalendarView
                        appointments={filteredAppointments}
                        onAppointmentClick={handleAppointmentClick}
                        onReschedule={handleReschedule}
                    />
                )}
                {viewMode === 'analytics' && (
                    <AppointmentAnalytics appointments={appointments} />
                )}
            </div>

            {/* Appointment Detail Sheet */}
            <AppointmentDetailSheet
                appointment={selectedAppointment}
                open={detailSheetOpen}
                onOpenChange={setDetailSheetOpen}
                onStatusChange={handleStatusChange}
                onDelete={handleDeleteAppointment}
            />

        </div >
    )
}





