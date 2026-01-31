import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { isSameDay, format } from 'date-fns';
import { Clock, User, Stethoscope } from 'lucide-react';
import { APPOINTMENT_STATUSES } from '../misc/types';
import { sortAppointmentsByTime, getInitials } from '../misc/utils';

const statusStyles = {
  scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
  confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'in-progress': 'bg-primary/10 text-primary border-primary/20',
  completed: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
  'no-show': 'bg-amber-100 text-amber-700 border-amber-200',
};

export function AppointmentCalendarView({ appointments, onAppointmentClick, onStatusChange }) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const appointmentsOnSelectedDate = sortAppointmentsByTime(
    appointments.filter((apt) => isSameDay(apt.date, selectedDate))
  );

  // Get dates that have appointments for calendar highlighting
  const appointmentDates = [...new Set(appointments.map((apt) => format(apt.date, 'yyyy-MM-dd')))];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <div className="lg:col-span-1">
        <div className="bg-card border border-border rounded-xl p-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
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
      </div>

      {/* Appointments for selected date */}
      <div className="lg:col-span-2">
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Appointments for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </h3>

          {appointmentsOnSelectedDate.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No appointments scheduled for this date.</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {appointmentsOnSelectedDate.map((apt) => {
                  const status = APPOINTMENT_STATUSES.find((s) => s.id === apt.status);
                  return (
                    <div
                      key={apt.id}
                      className="flex items-center gap-4 p-3 bg-secondary/50 rounded-lg border border-border hover:shadow-sm transition-shadow cursor-pointer"
                      onClick={() => onAppointmentClick(apt)}
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium text-sm shrink-0">
                        {getInitials(apt.patientName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm truncate">{apt.patientName}</h4>
                          <Badge variant="outline" className={`text-xs ${statusStyles[apt.status]}`}>
                            {status?.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {apt.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <Stethoscope className="w-3 h-3" />
                            {apt.doctorName}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  );
}
