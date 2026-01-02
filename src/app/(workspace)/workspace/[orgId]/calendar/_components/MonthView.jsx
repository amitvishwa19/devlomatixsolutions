import { useMemo } from 'react';
import {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday,
    format
} from 'date-fns';
import { AppointmentCard } from './AppointmentCard';
import { cn } from '@/lib/utils';



const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function MonthView({ currentDate, appointments, onAppointmentClick, onDayClick }) {
    const calendarDays = useMemo(() => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        const calendarStart = startOfWeek(monthStart);
        const calendarEnd = endOfWeek(monthEnd);

        return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    }, [currentDate]);

    const getAppointmentsForDay = (day) => {
        return appointments.filter(apt => isSameDay(apt.date, day));
    };

    return (
        <div className="bg-card rounded-md shadow-card overflow-hidden border border-b-0">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 border-b border-border">
                {WEEKDAYS.map((day) => (
                    <div
                        key={day}
                        className="py-3 text-center text-sm font-medium text-muted-foreground bg-secondary/50"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7">
                {calendarDays.map((day, index) => {
                    const dayAppointments = getAppointmentsForDay(day);
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isCurrentDay = isToday(day);

                    return (
                        <div
                            key={day.toISOString()}
                            className={cn(
                                'min-h-[120px] p-2 border-b border-r border-border cursor-pointer transition-colors hover:bg-secondary/30',
                                !isCurrentMonth && 'bg-muted/30',
                                index % 7 === 6 && 'border-r-0'
                            )}
                            onClick={() => onDayClick(day)}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span
                                    className={cn(
                                        'text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full',
                                        isCurrentDay && 'bg-primary text-primary-foreground',
                                        !isCurrentMonth && 'text-muted-foreground'
                                    )}
                                >
                                    {format(day, 'd')}
                                </span>
                                {dayAppointments.length > 0 && (
                                    <span className="text-xs text-muted-foreground">
                                        {dayAppointments.length} apt{dayAppointments.length > 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>

                            <div className="space-y-1">
                                {dayAppointments.slice(0, 3).map((apt) => (
                                    <div
                                        key={apt.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onAppointmentClick(apt);
                                        }}
                                    >
                                        <AppointmentCard
                                            appointment={apt}
                                            compact
                                            onClick={() => { }}
                                        />
                                    </div>
                                ))}
                                {dayAppointments.length > 3 && (
                                    <p className="text-xs text-muted-foreground text-center py-1">
                                        +{dayAppointments.length - 3} more
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
