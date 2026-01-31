import { AppointmentCard } from './AppointmentCard';
import { groupAppointmentsByDate, sortAppointmentsByTime, formatAppointmentDate } from './utils';
import { format, parseISO } from 'date-fns';
import { Calendar } from 'lucide-react';

export function AppointmentList({ appointments, onAppointmentClick, onStatusChange }) {
  const sortedAppointments = sortAppointmentsByTime(appointments);
  const groupedAppointments = groupAppointmentsByDate(sortedAppointments);
  const sortedDates = Object.keys(groupedAppointments).sort((a, b) => new Date(b) - new Date(a));

  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-1">No appointments found</h3>
        <p className="text-sm text-muted-foreground">Try adjusting your filters or create a new appointment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedDates.map((dateKey) => {
        const dateAppointments = sortAppointmentsByTime(groupedAppointments[dateKey]);
        const date = new Date(dateKey);

        return (
          <div key={dateKey}>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                {formatAppointmentDate(date)}
              </h3>
              <span className="text-xs text-muted-foreground">
                ({dateAppointments.length} appointment{dateAppointments.length !== 1 ? 's' : ''})
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dateAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onClick={onAppointmentClick}
                  onStatusChange={onStatusChange}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
