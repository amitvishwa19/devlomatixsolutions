import React, { useState, useMemo } from 'react';
import { addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from 'date-fns';
import { useLocalStorage } from '@/carewell/hooks/useLocalStorage';
import { mockAppointments } from '@/carewell/appointment/mockAppointments';
import { CalendarHeader } from './CalendarHeader';
import { CalendarSidebar } from './CalendarSidebar';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { DayView } from './DayView';
import { AppointmentDetailSheet } from '@/carewell/appointment/AppointmentDetailSheet';

export default function CalendarDashboard() {
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
    <div className="h-full flex flex-col bg-background">
      <CalendarHeader
        currentDate={currentDate}
        view={view}
        onViewChange={setView}
        onNavigate={handleNavigate}
        onTodayClick={handleTodayClick}
      />

      <div className="flex-1 flex overflow-hidden">
        <CalendarSidebar
          currentDate={currentDate}
          appointments={appointments}
          onDateSelect={handleDateSelect}
        />

        <div className="flex-1 overflow-hidden">
          {renderView()}
        </div>
      </div>

      <AppointmentDetailSheet
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
        appointment={selectedAppointment}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
