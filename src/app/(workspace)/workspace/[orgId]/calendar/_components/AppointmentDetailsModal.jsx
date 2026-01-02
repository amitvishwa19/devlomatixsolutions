import { useState } from 'react';
import { format } from 'date-fns';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    User,
    Clock,
    Calendar,
    Phone,
    Mail,
    FileText,
    ArrowRightLeft,
    Stethoscope,
    X,
    Check,
    Pencil
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { doctors } from '../_data/mockData';



export function AppointmentDetailsModal({
    appointment,
    isOpen,
    onClose,
    onDelegate,
    onStatusChange,
    onEdit,
}) {
    const [isDelegating, setIsDelegating] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState('');

    if (!appointment) return null;

    const statusBadgeStyles = {
        confirmed: 'bg-success/10 text-success border-success/20',
        pending: 'bg-warning/10 text-warning border-warning/20',
        cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
        delegated: 'bg-appointment-delegated/10 text-appointment-delegated border-appointment-delegated/20',
    };

    const handleDelegate = () => {
        if (selectedDoctor) {
            const doctor = doctors.find(d => d.id === selectedDoctor);
            if (doctor) {
                onDelegate(appointment.id, doctor);
                setIsDelegating(false);
                setSelectedDoctor('');
            }
        }
    };

    const availableDoctors = doctors.filter(d => d.id !== appointment.doctor.id);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-semibold">
                            Appointment Details
                        </DialogTitle>
                        <Badge className={cn(statusBadgeStyles[appointment.status])}>
                            {appointment.status}
                        </Badge>
                    </div>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Patient Info */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                            Patient Information
                        </h3>
                        <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">{appointment.patient.name}</p>
                                    <p className="text-sm text-muted-foreground">{appointment.patient.age} years old</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Phone className="h-4 w-4" />
                                    <span>{appointment.patient.phone}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Mail className="h-4 w-4" />
                                    <span>{appointment.patient.email}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Appointment Details */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                            Appointment Details
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
                                <Calendar className="h-4 w-4 text-primary" />
                                <span className="text-sm text-foreground">
                                    {format(appointment.date, 'MMM d, yyyy')}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
                                <Clock className="h-4 w-4 text-primary" />
                                <span className="text-sm text-foreground">
                                    {appointment.startTime} - {appointment.endTime}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg col-span-2">
                                <Stethoscope className="h-4 w-4 text-primary" />
                                <span className="text-sm text-foreground">{appointment.type}</span>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    {appointment.notes && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                                Notes
                            </h3>
                            <div className="flex items-start gap-2 p-3 bg-secondary/50 rounded-lg">
                                <FileText className="h-4 w-4 text-primary mt-0.5" />
                                <p className="text-sm text-foreground">{appointment.notes}</p>
                            </div>
                        </div>
                    )}

                    {/* Delegation Section */}
                    {appointment.delegatedFrom && (
                        <div className="flex items-center gap-2 p-3 bg-appointment-delegated/10 rounded-lg text-appointment-delegated">
                            <ArrowRightLeft className="h-4 w-4" />
                            <span className="text-sm">
                                Delegated from {appointment.delegatedFrom.name}
                            </span>
                        </div>
                    )}

                    {/* Delegate to another doctor */}
                    {isDelegating ? (
                        <div className="space-y-3 p-4 border border-border rounded-lg">
                            <h3 className="text-sm font-medium text-foreground">
                                Delegate to another doctor
                            </h3>
                            <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a doctor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableDoctors.map((doctor) => (
                                        <SelectItem key={doctor.id} value={doctor.id}>
                                            <div className="flex flex-col">
                                                <span>{doctor.name}</span>
                                                <span className="text-xs text-muted-foreground">{doctor.specialty}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setIsDelegating(false);
                                        setSelectedDoctor('');
                                    }}
                                >
                                    <X className="h-4 w-4 mr-1" />
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleDelegate}
                                    disabled={!selectedDoctor}
                                >
                                    <Check className="h-4 w-4 mr-1" />
                                    Confirm Delegation
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex gap-2 pt-2">
                            {onEdit && (
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => onEdit(appointment)}
                                >
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setIsDelegating(true)}
                            >
                                <ArrowRightLeft className="h-4 w-4 mr-2" />
                                Delegate
                            </Button>
                            {appointment.status === 'pending' && (
                                <Button
                                    className="flex-1"
                                    onClick={() => onStatusChange(appointment.id, 'confirmed')}
                                >
                                    <Check className="h-4 w-4 mr-2" />
                                    Confirm
                                </Button>
                            )}
                            {appointment.status !== 'cancelled' && (
                                <Button
                                    variant="destructive"
                                    className="flex-1"
                                    onClick={() => onStatusChange(appointment.id, 'cancelled')}
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Cancel
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
