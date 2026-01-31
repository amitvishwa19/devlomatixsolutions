import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    Clock, User, Stethoscope, Phone, FileText,
    Calendar, MapPin, ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import { APPOINTMENT_STATUSES, APPOINTMENT_TYPES } from '../../appointment/misc/types';


const statusStyles = {
    scheduled: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-150',
    confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-150',
    'in-progress': 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/15',
    completed: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-150',
    cancelled: 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/15',
    'no-show': 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-150',
    waitlisted: 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-150',
};

export function AppointmentEvent({ appointment, compact = false, onViewDetails }) {
    const status = APPOINTMENT_STATUSES.find((s) => s.id === appointment.status);
    const appointmentType = APPOINTMENT_TYPES.find((t) => t.id === appointment.appointmentType);

    const EventContent = () => (
        <div
            className={`rounded-md border cursor-pointer transition-all ${statusStyles[appointment.status]} ${compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs'
                }`}
        >
            <div className="flex items-center gap-1 truncate">
                {!compact && <Clock className="w-3 h-3 shrink-0" />}
                <span className="font-medium truncate">
                    {compact ? appointment.time.replace(':00', '') : appointment.time}
                </span>
                {!compact && <span className="truncate">- {appointment.patientName}</span>}
            </div>
            {compact && (
                <div className="truncate font-medium">{appointment.patientName.split(' ')[0]}</div>
            )}
        </div>
    );

    return (
        <Popover>
            <PopoverTrigger asChild>
                <div>
                    <EventContent />
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
                <div className="p-4 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="font-semibold text-foreground">{appointment.patientName}</h3>
                            <p className="text-sm text-muted-foreground">Patient ID: {appointment.patientId}</p>
                        </div>
                        <Badge variant="outline" className={statusStyles[appointment.status]}>
                            {status?.label}
                        </Badge>
                    </div>

                    <Separator />

                    {/* Details Grid */}
                    <div className="grid gap-3">
                        <div className="flex items-center gap-3 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>{format(new Date(appointment.date), 'EEEE, MMMM d, yyyy')}</span>
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>{appointment.time}</span>
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                            <Stethoscope className="w-4 h-4 text-muted-foreground" />
                            <div>
                                <span className="font-medium">{appointment.doctorName}</span>
                                <span className="text-muted-foreground ml-1">• {appointment.department}</span>
                            </div>
                        </div>

                        {appointment.patientPhone && (
                            <div className="flex items-center gap-3 text-sm">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                                <span>{appointment.patientPhone}</span>
                            </div>
                        )}

                        {appointmentType && (
                            <div className="flex items-center gap-3 text-sm">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                <span>{appointmentType.label}</span>
                            </div>
                        )}

                        {appointment.notes && (
                            <div className="flex items-start gap-3 text-sm">
                                <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <p className="text-muted-foreground line-clamp-2">{appointment.notes}</p>
                            </div>
                        )}
                    </div>

                    {/* Patient Info */}
                    <div className="bg-secondary/50 rounded-lg p-3 space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">Patient Details</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground ml-6">
                            {appointment.patientAge && <span>Age: {appointment.patientAge} years</span>}
                            {appointment.patientGender && <span>Gender: {appointment.patientGender}</span>}
                        </div>
                    </div>

                    <Separator />

                    {/* Actions */}
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => onViewDetails?.(appointment)}
                        >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Details
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
