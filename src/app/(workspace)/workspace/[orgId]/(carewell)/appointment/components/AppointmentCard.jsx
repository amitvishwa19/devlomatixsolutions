import { Clock, User, Phone, Stethoscope, MoreVertical, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { APPOINTMENT_STATUSES, APPOINTMENT_TYPES } from './types';
import { getInitials, formatAppointmentDate } from './utils';

const statusStyles = {
  scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
  confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'in-progress': 'bg-primary/10 text-primary border-primary/20',
  completed: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
  'no-show': 'bg-amber-100 text-amber-700 border-amber-200',
};

export function AppointmentCard({ appointment, onClick, onStatusChange }) {
  const status = APPOINTMENT_STATUSES.find((s) => s.id === appointment.status);
  const type = APPOINTMENT_TYPES.find((t) => t.id === appointment.appointmentType);

  return (
    <div
      className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick(appointment)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium text-sm">
            {getInitials(appointment.patientName)}
          </div>
          <div>
            <h3 className="font-medium text-sm text-foreground">{appointment.patientName}</h3>
            <p className="text-xs text-muted-foreground">{appointment.patientId}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {APPOINTMENT_STATUSES.filter((s) => s.id !== appointment.status).map((s) => (
              <DropdownMenuItem
                key={s.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange(appointment.id, s.id);
                }}
              >
                Mark as {s.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatAppointmentDate(appointment.date)}</span>
          <Clock className="w-3.5 h-3.5 ml-2" />
          <span>{appointment.time}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Stethoscope className="w-3.5 h-3.5" />
          <span>{appointment.doctorName}</span>
        </div>
        {type && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <User className="w-3.5 h-3.5" />
            <span>{type.label}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Badge variant="outline" className={`text-xs ${statusStyles[appointment.status]}`}>
          {status?.label}
        </Badge>
        {appointment.notes && (
          <span className="text-xs text-muted-foreground truncate max-w-[150px]">
            {appointment.notes}
          </span>
        )}
      </div>
    </div>
  );
}
