import { useMemo } from 'react';
import { format, isToday, isTomorrow, startOfDay, addDays, isSameDay } from 'date-fns';
import { AppointmentCard } from './AppointmentCard';
import { CalendarClock, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';



export function AppointmentSidebar({ appointments, onAppointmentClick }) {
    const today = startOfDay(new Date());

    const stats = useMemo(() => {
        const todayAppts = appointments.filter(apt => isSameDay(apt.date, today));
        const upcomingAppts = appointments.filter(
            apt => apt.date >= today && apt.status !== 'cancelled'
        );
        const pendingAppts = appointments.filter(apt => apt.status === 'pending');

        return {
            today: todayAppts.length,
            upcoming: upcomingAppts.length,
            pending: pendingAppts.length,
        };
    }, [appointments, today]);

    const upcomingAppointments = useMemo(() => {
        return appointments
            .filter(apt => apt.date >= today && apt.status !== 'cancelled')
            .sort((a, b) => {
                const dateCompare = a.date.getTime() - b.date.getTime();
                if (dateCompare !== 0) return dateCompare;
                return a.startTime.localeCompare(b.startTime);
            })
            .slice(0, 5);
    }, [appointments, today]);

    const getDateLabel = (date) => {
        if (isToday(date)) return 'Today';
        if (isTomorrow(date)) return 'Tomorrow';
        return format(date, 'MMM d');
    };

    return (
        <div className="w-80 bg-card rounded-xl shadow-card p-5 space-y-6 animate-slide-in">
            {/* Stats */}
            <div>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                    Overview
                </h3>
                <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-primary/10 rounded-lg text-center">
                        <p className="text-2xl font-bold text-primary">{stats.today}</p>
                        <p className="text-xs text-muted-foreground">Today</p>
                    </div>
                    <div className="p-3 bg-success/10 rounded-lg text-center">
                        <p className="text-2xl font-bold text-success">{stats.upcoming}</p>
                        <p className="text-xs text-muted-foreground">Upcoming</p>
                    </div>
                    <div className="p-3 bg-warning/10 rounded-lg text-center">
                        <p className="text-2xl font-bold text-warning">{stats.pending}</p>
                        <p className="text-xs text-muted-foreground">Pending</p>
                    </div>
                </div>
            </div>

            {/* Upcoming Appointments */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <CalendarClock className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                        Upcoming
                    </h3>
                </div>

                <div className="space-y-3">
                    {upcomingAppointments.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No upcoming appointments
                        </p>
                    ) : (
                        upcomingAppointments.map((apt, index) => (
                            <div key={apt.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                                <p className={cn(
                                    'text-xs font-medium mb-1',
                                    isToday(apt.date) ? 'text-primary' : 'text-muted-foreground'
                                )}>
                                    {getDateLabel(apt.date)}
                                </p>
                                <AppointmentCard
                                    appointment={apt}
                                    compact
                                    onClick={onAppointmentClick}
                                />
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Quick Stats */}
            <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4 text-success" />
                    <span>
                        {appointments.filter(a => a.status === 'confirmed').length} confirmed this week
                    </span>
                </div>
            </div>
        </div>
    );
}
