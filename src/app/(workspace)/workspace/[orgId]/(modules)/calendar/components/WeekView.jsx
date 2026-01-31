import React, { useMemo } from 'react';
import { startOfWeek, addDays, isSameDay, isToday, format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AppointmentEvent } from './AppointmentEvent';
import { HOURS } from '../utils/types';

export function WeekView({ currentDate, appointments, onViewDetails }) {
  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [currentDate]);

  const getAppointmentsForDayAndHour = (day, hour) => {
    return appointments.filter((apt) => {
      if (!isSameDay(new Date(apt.date), day)) return false;
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
    <div className="flex flex-col h-full">
      {/* Day Headers */}
      <div className="grid grid-cols-8 border-b border-border bg-secondary/30">
        <div className="p-2 text-sm font-medium text-muted-foreground border-r border-border">
          Time
        </div>
        {weekDays.map((day) => {
          const isDayToday = isToday(day);
          return (
            <div
              key={format(day, 'yyyy-MM-dd')}
              className={`p-2 text-center border-r border-border last:border-r-0 ${isDayToday ? 'bg-primary/5' : ''
                }`}
            >
              <div className="text-xs text-muted-foreground">{format(day, 'EEE')}</div>
              <div
                className={`text-lg font-medium ${isDayToday ? 'text-primary' : 'text-foreground'
                  }`}
              >
                {format(day, 'd')}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time Grid */}
      <ScrollArea className="flex-1">
        <div className="min-h-[600px]">
          {HOURS.map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-b border-border">
              <div className="p-2 text-xs text-muted-foreground border-r border-border sticky left-0 bg-card">
                {hour}
              </div>
              {weekDays.map((day) => {
                const hourAppointments = getAppointmentsForDayAndHour(day, hour);
                const isDayToday = isToday(day);

                return (
                  <div
                    key={format(day, 'yyyy-MM-dd')}
                    className={`min-h-[60px] p-1 border-r border-border last:border-r-0 ${isDayToday ? 'bg-primary/5' : ''
                      }`}
                  >
                    <div className="space-y-0.5">
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
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
