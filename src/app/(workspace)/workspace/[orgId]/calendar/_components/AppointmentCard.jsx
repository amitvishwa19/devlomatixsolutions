
import { Clock, User, Phone, ArrowRightLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';


export function AppointmentCard({ appointment, compact = false, onClick }) {
    const statusStyles = {
        confirmed: 'appointment-confirmed bg-success/5',
        pending: 'appointment-pending bg-warning/5',
        cancelled: 'appointment-cancelled bg-destructive/5',
        delegated: 'appointment-delegated bg-appointment-delegated/5',
    };

    const statusBadgeStyles = {
        confirmed: 'bg-success/10 text-success border-success/20',
        pending: 'bg-warning/10 text-warning border-warning/20',
        cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
        delegated: 'bg-appointment-delegated/10 text-appointment-delegated border-appointment-delegated/20',
    };

    if (compact) {
        return (
            <button
                onClick={() => onClick(appointment)}
                className={cn(
                    'w-full text-left p-2 rounded-md transition-all hover:shadow-md cursor-pointer',
                    statusStyles[appointment.status],
                    'animate-fade-in'
                )}
            >
                <p className="text-xs font-medium text-foreground truncate">{appointment.patient.name}</p>
                <p className="text-xs text-muted-foreground">
                    {appointment.startTime} - {appointment.endTime}
                </p>
            </button>
        );
    }

    return (
        <button
            onClick={() => onClick(appointment)}
            className={cn(
                'w-full text-left p-4 rounded-lg transition-all hover:shadow-lg cursor-pointer bg-card shadow-card',
                statusStyles[appointment.status],
                'animate-fade-in'
            )}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-foreground truncate">{appointment.patient.name}</span>
                        <Badge variant="outline" className="text-xs">
                            {appointment.type}
                        </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{appointment.startTime} - {appointment.endTime}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5" />
                            <span>{appointment.patient.phone}</span>
                        </div>
                    </div>

                    {appointment.delegatedFrom && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-appointment-delegated">
                            <ArrowRightLeft className="h-3 w-3" />
                            <span>Delegated from {appointment.delegatedFrom.name}</span>
                        </div>
                    )}

                    {appointment.notes && (
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-1">
                            {appointment.notes}
                        </p>
                    )}
                </div>

                <Badge className={cn('shrink-0', statusBadgeStyles[appointment.status])}>
                    {appointment.status}
                </Badge>
            </div>
        </button>
    );
}
