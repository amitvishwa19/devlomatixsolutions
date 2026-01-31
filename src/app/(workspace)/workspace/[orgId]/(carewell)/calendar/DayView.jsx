import { isSameDay, format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AppointmentEvent } from './AppointmentEvent';
import { HOURS } from './types';

export function DayView({ currentDate, appointments, onViewDetails }) {
  const dayAppointments = appointments.filter((apt) =>
    isSameDay(new Date(apt.date), currentDate)
  );

  const getAppointmentsForHour = (hour) => {
    return dayAppointments.filter((apt) => {
      const aptHour = apt.time.split(':')[0];
      const hourNum = parseInt(hour.split(':')[0]);
      const aptHourNum = parseInt(aptHour);
      const isPM = apt.time.includes('PM') && !apt.time.includes('12:');
      const adjustedAptHour = isPM ? aptHourNum + 12 : aptHourNum;
      const isHourPM = hour.includes('PM') && !hour.includes('12:');
      const adjustedHour = isHourPM ? hourNum + 12 : hourNum;
      return adjustedAptHour === adjustedHour;
    });
  };

  return (
    <div className="flex h-full">
      {/* Time Slots */}
      <ScrollArea className="flex-1">
        <div className="min-h-[600px] p-4">
          {HOURS.map((hour) => {
            const hourAppointments = getAppointmentsForHour(hour);
            
            return (
              <div key={hour} className="flex border-b border-border min-h-[80px]">
                <div className="w-20 py-2 text-sm text-muted-foreground shrink-0">
                  {hour}
                </div>
                <div className="flex-1 py-2 px-2 space-y-1">
                  {hourAppointments.map((apt) => (
                    <AppointmentEvent 
                      key={apt.id} 
                      appointment={apt}
                      onViewDetails={onViewDetails}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Sidebar Summary */}
      <div className="w-80 border-l border-border bg-secondary/30 p-4">
        <h3 className="font-semibold text-foreground mb-4">
          {format(currentDate, 'EEEE')}
        </h3>
        <div className="text-sm text-muted-foreground mb-4">
          {dayAppointments.length} appointment{dayAppointments.length !== 1 ? 's' : ''} scheduled
        </div>

        <div className="space-y-3">
          {dayAppointments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No appointments for this day</p>
            </div>
          ) : (
            dayAppointments
              .sort((a, b) => a.time.localeCompare(b.time))
              .map((apt) => (
                <div
                  key={apt.id}
                  className="p-3 bg-card rounded-lg border border-border cursor-pointer hover:shadow-sm transition-shadow"
                  onClick={() => onViewDetails?.(apt)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{apt.patientName}</span>
                    <span className="text-xs text-muted-foreground">{apt.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{apt.doctorName}</p>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
