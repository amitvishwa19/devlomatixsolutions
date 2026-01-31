import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Calendar } from 'lucide-react';
import { APPOINTMENT_STATUSES, APPOINTMENT_TYPES, DEPARTMENTS } from '../misc/types';
import { formatAppointmentDate, getInitials } from '../misc/utils';

const statusStyles = {
  scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
  confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'in-progress': 'bg-primary/10 text-primary border-primary/20',
  completed: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
  'no-show': 'bg-amber-100 text-amber-700 border-amber-200',
};

export function AppointmentTableView({ appointments, onAppointmentClick, onStatusChange }) {
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
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/50">
            <TableHead className="w-[200px]">Patient</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Doctor</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map((appointment) => {
            const status = APPOINTMENT_STATUSES.find((s) => s.id === appointment.status);
            const type = APPOINTMENT_TYPES.find((t) => t.id === appointment.appointmentType);
            const department = DEPARTMENTS.find((d) => d.id === appointment.department);

            return (
              <TableRow
                key={appointment.id}
                className="cursor-pointer hover:bg-secondary/30"
                onClick={() => onAppointmentClick(appointment)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium text-xs">
                      {getInitials(appointment.patientName)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{appointment.patientName}</p>
                      <p className="text-xs text-muted-foreground">{appointment.patientId}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm font-medium">{formatAppointmentDate(appointment.date)}</p>
                    <p className="text-xs text-muted-foreground">{appointment.time}</p>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{appointment.doctorName}</TableCell>
                <TableCell className="text-sm">{department?.label || '-'}</TableCell>
                <TableCell className="text-sm">{type?.label || '-'}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-xs ${statusStyles[appointment.status]}`}>
                    {status?.label}
                  </Badge>
                </TableCell>
                <TableCell>
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
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
