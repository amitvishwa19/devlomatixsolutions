import React, { useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { format, isSameDay, isToday } from 'date-fns';
import { APPOINTMENT_STATUSES } from '@/carewell/appointment/types';

const statusStyles = {
  scheduled: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-emerald-100 text-emerald-700',
  'in-progress': 'bg-primary/10 text-primary',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-destructive/10 text-destructive',
  'no-show': 'bg-amber-100 text-amber-700',
  waitlisted: 'bg-purple-100 text-purple-700',
};

export function CalendarSidebar({ currentDate, appointments, onDateSelect }) {
  const appointmentDates = useMemo(() => {
    return [...new Set(appointments.map((apt) => format(new Date(apt.date), 'yyyy-MM-dd')))];
  }, [appointments]);

  const upcomingAppointments = useMemo(() => {
    const today = new Date();
    return appointments
      .filter((apt) => new Date(apt.date) >= today && apt.status !== 'cancelled')
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);
  }, [appointments]);

  const statusCounts = useMemo(() => {
    const counts = {};
    appointments.forEach((apt) => {
      counts[apt.status] = (counts[apt.status] || 0) + 1;
    });
    return counts;
  }, [appointments]);

  return (
    <div className="w-72 border-r border-border bg-card flex flex-col h-full">
      {/* Mini Calendar */}
      <div className="p-4 border-b border-border">
        <Calendar
          mode="single"
          selected={currentDate}
          onSelect={onDateSelect}
          className="w-full"
          modifiers={{
            hasAppointment: (date) =>
              appointmentDates.includes(format(date, 'yyyy-MM-dd')),
          }}
          modifiersStyles={{
            hasAppointment: {
              fontWeight: 'bold',
              backgroundColor: 'hsl(var(--primary) / 0.1)',
              borderRadius: '50%',
            },
          }}
        />
      </div>

      {/* Status Summary */}
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground mb-3">Status Overview</h3>
        <div className="flex flex-wrap gap-2">
          {APPOINTMENT_STATUSES.filter((s) => statusCounts[s.id]).map((status) => (
            <Badge key={status.id} variant="outline" className={statusStyles[status.id]}>
              {status.label}: {statusCounts[status.id]}
            </Badge>
          ))}
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="flex-1 p-4 overflow-hidden">
        <h3 className="text-sm font-semibold text-foreground mb-3">Upcoming</h3>
        <ScrollArea className="h-[calc(100%-2rem)]">
          <div className="space-y-2 pr-2">
            {upcomingAppointments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming appointments</p>
            ) : (
              upcomingAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
                  onClick={() => onDateSelect?.(new Date(apt.date))}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{apt.patientName}</span>
                    <span className="text-xs text-muted-foreground">{apt.time}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {isToday(new Date(apt.date))
                      ? 'Today'
                      : format(new Date(apt.date), 'MMM d')}
                    {' • '}{apt.doctorName?.replace('Dr. ', '')}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
