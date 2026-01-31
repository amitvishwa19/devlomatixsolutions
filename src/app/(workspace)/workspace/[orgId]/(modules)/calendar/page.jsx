'use client'
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useOrg } from '@/providers/OrgProvider';
import { ContentTopbar } from '../../(misc)/_components/ContentTopbar';
import { useState } from 'react';
import { mockAppointments } from '../appointment/misc/mockAppointments';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { CalendarHeader } from './components/CalendarHeader';
import { CalendarSidebar } from './components/CalendarSidebar';
import { MonthView } from './components/MonthView';
import { WeekView } from './components/WeekView';
import { DayView } from './components/DayView';





export default function AppointmentCalenderPage() {
    const { server } = useOrg()
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState('month');
    const [appointments, setAppointments] = useLocalStorage('hms_appointments', mockAppointments);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [detailSheetOpen, setDetailSheetOpen] = useState(false);

    const handleNavigate = (direction) => {
        switch (view) {
            case 'month':
                setCurrentDate((prev) =>
                    direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1)
                );
                break;
            case 'week':
                setCurrentDate((prev) =>
                    direction === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1)
                );
                break;
            case 'day':
                setCurrentDate((prev) =>
                    direction === 'next' ? addDays(prev, 1) : subDays(prev, 1)
                );
                break;
        }
    };

    const handleTodayClick = () => {
        setCurrentDate(new Date());
    };

    const handleDateSelect = (date) => {
        if (date) {
            setCurrentDate(date);
            if (view === 'month') {
                setView('day');
            }
        }
    };

    const handleViewDetails = (appointment) => {
        setSelectedAppointment(appointment);
        setDetailSheetOpen(true);
    };

    const handleStatusChange = (appointmentId, newStatus) => {
        console.log('Updating appointment status from calendar:', { appointmentId, newStatus });
        setAppointments((prev) =>
            prev.map((apt) =>
                apt.id === appointmentId ? { ...apt, status: newStatus } : apt
            )
        );
    };

    const renderView = () => {
        switch (view) {
            case 'month':
                return (
                    <MonthView
                        currentDate={currentDate}
                        appointments={appointments}
                        onViewDetails={handleViewDetails}
                    />
                );
            case 'week':
                return (
                    <WeekView
                        currentDate={currentDate}
                        appointments={appointments}
                        onViewDetails={handleViewDetails}
                    />
                );
            case 'day':
                return (
                    <DayView
                        currentDate={currentDate}
                        appointments={appointments}
                        onViewDetails={handleViewDetails}
                    />
                );
            default:
                return null;
        }
    };


    return (
        <div className='absolute inset-0 flex flex-col gap-2'>

            <ContentTopbar
                title='Appointment Calender'
                description='Appointment Calendar for Optimal Patient Flow, Real-Time Updates, and Effortless Time Management'
                icon='calendar-days'
                actionComp={<CalendarHeader
                    currentDate={currentDate}
                    view={view}
                    onViewChange={setView}
                    onNavigate={handleNavigate}
                    onTodayClick={handleTodayClick}
                />}
            />








            <ScrollArea className='h-[85vh] flex flex-grow  rounded-md'>
                <div className="flex flex-row w-full">
                    <CalendarSidebar
                        currentDate={currentDate}
                        appointments={appointments}
                        onDateSelect={handleDateSelect}
                    />

                    <div className="flex flex-1">
                        {renderView()}
                    </div>
                </div>
            </ScrollArea>


        </div >
    )
}
