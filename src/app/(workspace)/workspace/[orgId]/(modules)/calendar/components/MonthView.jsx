import React, { useMemo } from 'react';
import {
    startOfMonth, endOfMonth, startOfWeek, endOfWeek,
    eachDayOfInterval, isSameMonth, isSameDay, isToday, format
} from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AppointmentEvent } from './AppointmentEvent';
import { DAYS_OF_WEEK } from '../utils/types';

export function MonthView({ currentDate, appointments, onViewDetails }) {
    const calendarDays = useMemo(() => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        const calendarStart = startOfWeek(monthStart);
        const calendarEnd = endOfWeek(monthEnd);

        return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    }, [currentDate]);

    const getAppointmentsForDay = (day) => {
        return appointments.filter((apt) => isSameDay(new Date(apt.date), day));
    };

    return (
        <div className="flex flex-col h-full w-full">
            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b border-border bg-secondary/30">
                {DAYS_OF_WEEK.map((day) => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 grid grid-cols-7 auto-rows-fr">
                {calendarDays.map((day, index) => {
                    const dayAppointments = getAppointmentsForDay(day);
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isDayToday = isToday(day);

                    return (
                        <div
                            key={index}
                            className={`border-b border-r border-border p-1 min-h-[100px] ${!isCurrentMonth ? 'bg-muted/30' : 'bg-card'
                                } ${isDayToday ? 'bg-primary/5' : ''}`}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span
                                    className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isDayToday
                                        ? 'bg-primary text-primary-foreground'
                                        : !isCurrentMonth
                                            ? 'text-muted-foreground'
                                            : 'text-foreground'
                                        }`}
                                >
                                    {format(day, 'd')}
                                </span>
                                {dayAppointments.length > 0 && (
                                    <span className="text-[10px] text-muted-foreground">
                                        {dayAppointments.length} appt{dayAppointments.length > 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>

                            <ScrollArea className="h-[80px]">
                                <div className="space-y-0.5 pr-2">
                                    {dayAppointments.slice(0, 3).map((apt) => (
                                        <AppointmentEvent
                                            key={apt.id}
                                            appointment={apt}
                                            compact
                                            onViewDetails={onViewDetails}
                                        />
                                    ))}
                                    {dayAppointments.length > 3 && (
                                        <div className="text-[10px] text-muted-foreground text-center py-0.5">
                                            +{dayAppointments.length - 3} more
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
