'use client'
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useOrg } from '@/providers/OrgProvider';
import { CalendarDays } from 'lucide-react';
import { ContentTopbar } from '../(misc)/_components/ContentTopbar';
import { useAppointments } from './_hooks/useAppointments';
import { AppointmentFilters, AppointmentStats, CalendarGrid, CalendarHeader, CreateAppointmentSheet, EditAppointmentSheet, TodayAppointments, UpcomingAppointments, ViewAppointmentSheet } from './_components';




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
    const {
        // Data
        appointments,
        calendarDays,
        selectedDate,
        calendarView,
        filters,
        doctors,
        patients,
        todayAppointments,
        upcomingAppointments,
        selectedAppointment,

        // Setters
        setCalendarView,
        setFilters,

        // Dialog states
        createDialogOpen,
        setCreateDialogOpen,
        editDialogOpen,
        setEditDialogOpen,
        viewDialogOpen,
        setViewDialogOpen,

        // Navigation
        navigatePrevious,
        navigateNext,
        navigateToday,

        // CRUD operations
        createAppointment,
        updateAppointment,
        deleteAppointment,
        cancelAppointment,
        confirmAppointment,

        // Handlers
        getAppointmentsForDay,
        handleViewAppointment,
        handleEditAppointment,
        handleDayClick,
    } = useAppointments();


    return (
        <div className='absolute inset-0 flex flex-col gap-2'>



            <ContentTopbar
                title='Appointment Calender'
                description='Appointment Calendar for Optimal Patient Flow, Real-Time Updates, and Effortless Time Management'
                icon='calendar-days'
                actionComp={<CalendarHeader
                    selectedDate={selectedDate}
                    calendarView={calendarView}
                    onViewChange={setCalendarView}
                    onPrevious={navigatePrevious}
                    onNext={navigateNext}
                    onToday={navigateToday}
                    onCreateAppointment={() => setCreateDialogOpen(true)}
                />}
            />

            <ScrollArea className='h-[85vh] flex flex-grow  rounded-md'>
                <div className="p-2 space-y-6 animate-fade-in">
                    {/* Header */}


                    {/* Stats */}
                    <AppointmentStats appointments={appointments} />

                    {/* Filters */}
                    <AppointmentFilters
                        filters={filters}
                        onFiltersChange={setFilters}
                        doctors={doctors}
                    />

                    {/* Main Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Calendar Grid */}
                        <div className="lg:col-span-3">
                            <CalendarGrid
                                days={calendarDays}
                                selectedDate={selectedDate}
                                calendarView={calendarView}
                                getAppointmentsForDay={getAppointmentsForDay}
                                onDayClick={handleDayClick}
                                onAppointmentClick={handleViewAppointment}
                            />
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <TodayAppointments
                                appointments={todayAppointments}
                                onAppointmentClick={handleViewAppointment}
                            />
                            <UpcomingAppointments
                                appointments={upcomingAppointments}
                                onAppointmentClick={handleViewAppointment}
                            />
                        </div>
                    </div>

                    {/* Create Appointment Sheet */}
                    <CreateAppointmentSheet
                        open={createDialogOpen}
                        onOpenChange={setCreateDialogOpen}
                        doctors={doctors}
                        patients={patients}
                        onSubmit={createAppointment}
                        selectedDate={selectedDate}
                    />

                    {/* View Appointment Sheet */}
                    <ViewAppointmentSheet
                        open={viewDialogOpen}
                        onOpenChange={setViewDialogOpen}
                        appointment={selectedAppointment}
                        onEdit={handleEditAppointment}
                        onDelete={deleteAppointment}
                        onConfirm={confirmAppointment}
                        onCancel={cancelAppointment}
                    />

                    {/* Edit Appointment Sheet */}
                    <EditAppointmentSheet
                        open={editDialogOpen}
                        onOpenChange={setEditDialogOpen}
                        appointment={selectedAppointment}
                        doctors={doctors}
                        patients={patients}
                        onSubmit={updateAppointment}
                    />
                </div>
            </ScrollArea>


        </div >
    )
}
