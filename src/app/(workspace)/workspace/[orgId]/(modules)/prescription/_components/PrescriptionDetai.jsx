import { Dialog, DialogContent, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, } from "@/components/ui/sheet"
import { StatusBadge } from './StatusBadge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { User, Phone, Mail, Stethoscope, Calendar, FileText, Pill, Clock, Printer, CheckCircle2, XCircle, } from 'lucide-react';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';



export function PrescriptionDetail({
    prescription,
    open,
    onOpenChange,
    onStatusChange,
}) {
    if (!prescription) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="max-w-2xl min-w-[620px] dark:bg-darkPrimaryBackground ">
                <DialogHeader className={'px-4 py-2 mb-0'}>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-display">
                            {prescription.prescriptionNumber}
                        </DialogTitle>
                        <StatusBadge status={prescription.status} />
                    </div>
                </DialogHeader>

                <ScrollArea className='p-4 h-[94vh]'>

                    <div className="space-y-6 pt-4">
                        {/* Patient Information */}
                        <div className="space-y-3">
                            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                                Patient Information
                            </h4>
                            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-primary" />
                                    <span className="font-medium">{prescription.patient.name}</span>
                                    <Badge variant="secondary" className="text-xs">
                                        {prescription.patient.age}y • {prescription.patient.gender}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Phone className="h-4 w-4" />
                                    <span>{prescription.patient.phone}</span>
                                </div>
                                {prescription.patient.email && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Mail className="h-4 w-4" />
                                        <span>{prescription.patient.email}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Doctor Information */}
                        <div className="space-y-3">
                            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                                Prescribing Physician
                            </h4>
                            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                                <div className="flex items-center gap-2">
                                    <Stethoscope className="h-4 w-4 text-primary" />
                                    <span className="font-medium">{prescription.doctor.name}</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {prescription.doctor.specialization} • License: {prescription.doctor.licenseNumber}
                                </p>
                            </div>
                        </div>

                        {/* Diagnosis */}
                        <div className="space-y-3">
                            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                                Diagnosis
                            </h4>
                            <div className="bg-muted/50 rounded-lg p-4">
                                <div className="flex items-start gap-2">
                                    <FileText className="h-4 w-4 text-primary mt-0.5" />
                                    <span>{prescription.diagnosis}</span>
                                </div>
                            </div>
                        </div>

                        {/* Medications */}
                        <div className="space-y-3">
                            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                                Medications ({prescription.medications.length})
                            </h4>
                            <div className="space-y-3">
                                {prescription.medications.map((medication, index) => (
                                    <div
                                        key={medication.id}
                                        className="bg-muted/50 rounded-lg p-4 space-y-2"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Pill className="h-4 w-4 text-accent" />
                                            <span className="font-medium">{medication.name}</span>
                                            <Badge variant="outline" className="text-xs">
                                                {medication.dosage}
                                            </Badge>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground pl-6">
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                <span>{medication.frequency}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                <span>{medication.duration}</span>
                                            </div>
                                        </div>
                                        {medication.instructions && (
                                            <p className="text-sm text-muted-foreground pl-6 italic">
                                                "{medication.instructions}"
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Medications */}
                        <div className="space-y-3">
                            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                                Medications ({prescription.medications.length})
                            </h4>
                            <div className="space-y-3">
                                {prescription.medications.map((medication, index) => (
                                    <div
                                        key={medication.id}
                                        className="bg-muted/50 rounded-lg p-4 space-y-2"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Pill className="h-4 w-4 text-accent" />
                                            <span className="font-medium">{medication.name}</span>
                                            <Badge variant="outline" className="text-xs">
                                                {medication.dosage}
                                            </Badge>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground pl-6">
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                <span>{medication.frequency}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                <span>{medication.duration}</span>
                                            </div>
                                        </div>
                                        {medication.instructions && (
                                            <p className="text-sm text-muted-foreground pl-6 italic">
                                                "{medication.instructions}"
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Notes */}
                        {prescription.notes && (
                            <div className="space-y-3">
                                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                                    Additional Notes
                                </h4>
                                <div className="bg-muted/50 rounded-lg p-4">
                                    <p className="text-sm">{prescription.notes}</p>
                                </div>
                            </div>
                        )}

                        {/* Timestamps */}
                        <div className="space-y-2 text-xs text-muted-foreground">
                            <Separator />
                            <div className="flex justify-between pt-2">
                                <span>Created: {format(prescription.createdAt, 'MMM dd, yyyy HH:mm')}</span>
                                {prescription.dispensedAt && (
                                    <span>Dispensed: {format(prescription.dispensedAt, 'MMM dd, yyyy HH:mm')}</span>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        {prescription.status === 'pending' && onStatusChange && (
                            <div className="flex gap-3 pt-4">
                                <Button
                                    className="flex-1 gap-2"
                                    onClick={() => onStatusChange(prescription.id, 'dispensed')}
                                >
                                    <CheckCircle2 className="h-4 w-4" />
                                    Mark as Dispensed
                                </Button>
                                <Button
                                    variant="outline"
                                    className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => onStatusChange(prescription.id, 'cancelled')}
                                >
                                    <XCircle className="h-4 w-4" />
                                    Cancel
                                </Button>
                                <Button variant="outline" className="gap-2">
                                    <Printer className="h-4 w-4" />
                                    Print
                                </Button>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
