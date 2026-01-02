import { useMemo } from 'react';
import { startOfWeek, addDays, format, isSameDay, isToday } from 'date-fns';
import { AppointmentCard } from './AppointmentCard';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

const TIME_SLOTS = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 8;
    return `${hour.toString().padStart(2, '0')}:00`;
});

export function WeekView({ currentDate, appointments, onAppointmentClick }) {
    const weekDays = useMemo(() => {
        const weekStart = startOfWeek(currentDate);
        return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    }, [currentDate]);

    const getAppointmentsForDayAndTime = (day, timeSlot) => {
        const slotHour = parseInt(timeSlot.split(':')[0]);
        return appointments.filter(apt => {
            const aptHour = parseInt(apt.startTime.split(':')[0]);
            return isSameDay(apt.date, day) && aptHour === slotHour;
        });
    };

    return (
        <div className="bg-card rounded-md border overflow-hidden h-full">
            {/* Header with days */}
            <div className="grid grid-cols-8 border-b border-border">
                <div className="py-3 px-2 text-center text-sm font-medium text-muted-foreground bg-secondary/50">
                    Time
                </div>
                {weekDays.map((day) => (
                    <div
                        key={day.toISOString()}
                        className={cn(
                            'py-3 text-center bg-secondary/50',
                            isToday(day) && 'bg-primary/10'
                        )}
                    >
                        <p className="text-sm font-medium text-muted-foreground">
                            {format(day, 'EEE')}
                        </p>
                        <p
                            className={cn(
                                'text-lg font-semibold',
                                isToday(day) ? 'text-primary' : 'text-foreground'
                            )}
                        >
                            {format(day, 'd')}
                        </p>
                    </div>
                ))}
            </div>

            {/* Time grid */}
            <ScrollArea className="h-full">
                {TIME_SLOTS.map((timeSlot) => (
                    <div key={timeSlot} className="grid grid-cols-8 border-b border-border last:border-b-0">
                        <div className="py-4 px-2 text-sm text-muted-foreground text-right pr-4 bg-secondary/30">
                            {timeSlot}
                        </div>
                        {weekDays.map((day) => {
                            const slotAppointments = getAppointmentsForDayAndTime(day, timeSlot);
                            return (
                                <div
                                    key={`${day.toISOString()}-${timeSlot}`}
                                    className={cn(
                                        'py-2 px-1 min-h-[60px] border-l border-border',
                                        isToday(day) && 'bg-primary/5'
                                    )}
                                >
                                    {slotAppointments.map((apt) => (
                                        <AppointmentCard
                                            key={apt.id}
                                            appointment={apt}
                                            compact
                                            onClick={onAppointmentClick}
                                        />
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </ScrollArea>
        </div>
    );
}
