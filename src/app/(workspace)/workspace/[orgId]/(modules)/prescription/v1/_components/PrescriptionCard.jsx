import { Prescription } from '@/types/prescription';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge } from './StatusBadge';
import { Button } from '@/components/ui/button';
import { Eye, User, Stethoscope, Calendar, Pill } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';


export function PrescriptionCard({ prescription, onView, className }) {
    return (
        <Card
            className={cn(
                'group cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/30 animate-fade-in',
                className
            )}
            onClick={() => onView(prescription)}
        >
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-semibold text-primary font-display">
                            {prescription.prescriptionNumber}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {prescription.diagnosis}
                        </p>
                    </div>
                    <StatusBadge status={prescription.status} />
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-3">
                    <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{prescription.patient.name}</span>
                        <span className="text-muted-foreground">
                            ({prescription.patient.age}y, {prescription.patient.gender})
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Stethoscope className="h-4 w-4 text-muted-foreground" />
                        <span>{prescription.doctor.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                            {format(prescription.createdAt, 'MMM dd, yyyy • HH:mm')}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Pill className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                            {prescription.medications.length} medication{prescription.medications.length > 1 ? 's' : ''}
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-end pt-2 border-t">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-primary hover:text-primary hover:bg-primary/10"
                        onClick={(e) => {
                            e.stopPropagation();
                            onView(prescription);
                        }}
                    >
                        <Eye className="h-4 w-4" />
                        View Details
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
