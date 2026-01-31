import { useState, useMemo } from 'react';
import { useLocalStorage } from '@/carewell/hooks/useLocalStorage';
import { mockAppointments } from './mockAppointments';
import { calculateAppointmentStats, filterAppointments } from './utils';
import { DOCTOR_SCHEDULES } from './types';
import { AppointmentStatsCards } from './AppointmentStatsCards';
import { AppointmentFilters } from './AppointmentFilters';
import { AppointmentList } from './AppointmentList';
import { AppointmentTableView } from './AppointmentTableView';
import { AppointmentCalendarView } from './AppointmentCalendarView';
import { DraggableCalendarView } from './DraggableCalendarView';
import { AppointmentAnalytics } from './AppointmentAnalytics';
import { NewAppointmentDialog } from './NewAppointmentDialog';
import { AppointmentDetailSheet } from './AppointmentDetailSheet';
import { DoctorAvailabilitySheet } from './DoctorAvailabilitySheet';
import { WaitlistSheet } from './WaitlistSheet';

export default function AppointmentDashboard() {
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
        <div className="h-full bg-background flex flex-col overflow-hidden">
            <div className="p-6 space-y-6 flex flex-col flex-1 overflow-hidden">
                {/* Header */}
                <div className="flex items-start justify-between shrink-0">
                    <div>
                        <h1 className="text-xl font-bold text-foreground">
                            Appointment Management
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Schedule, manage, and track all patient appointments efficiently
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
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
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="shrink-0">
                    <AppointmentStatsCards stats={stats} />
                </div>

                {/* Filters */}
                <div className="shrink-0">
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
                <div className="flex-1 overflow-y-auto pb-4">
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
            </div>
        </div>
    );
}
