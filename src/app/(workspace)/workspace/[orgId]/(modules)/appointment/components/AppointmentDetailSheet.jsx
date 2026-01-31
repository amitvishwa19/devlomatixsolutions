import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    User, Phone, Calendar, Clock, Stethoscope, FileText,
    MapPin, Mail, Building2, CheckCircle2, XCircle, AlertTriangle, ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import { APPOINTMENT_STATUSES, APPOINTMENT_TYPES, DEPARTMENTS, DOCTORS } from '../misc/types';
import { getInitials, formatAppointmentDate } from '../misc/utils';
import { useToast } from '@/hooks/use-toast';
import { ModuleLinkBadge, QuickActionsMenu } from '../../utils';
//import { QuickActionsMenu, ModuleLinkBadge } from '@/carewell/utils/crossModuleNavigation';

const statusStyles = {
    scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
    confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'in-progress': 'bg-primary/10 text-primary border-primary/20',
    completed: 'bg-green-100 text-green-700 border-green-200',
    cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
    'no-show': 'bg-amber-100 text-amber-700 border-amber-200',
};

export function AppointmentDetailSheet({ appointment, open, onOpenChange, onStatusChange }) {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('details');

    if (!appointment) return null;

    const status = APPOINTMENT_STATUSES.find((s) => s.id === appointment.status);
    const type = APPOINTMENT_TYPES.find((t) => t.id === appointment.appointmentType);
    const department = DEPARTMENTS.find((d) => d.id === appointment.department);

    const handleStatusChange = (newStatus) => {
        onStatusChange(appointment.id, newStatus);
        toast({
            title: 'Status updated',
            description: `Appointment marked as ${APPOINTMENT_STATUSES.find(s => s.id === newStatus)?.label}`
        });
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-[600px] p-0 flex flex-col h-full">
                <SheetHeader className="p-6 pb-4 border-b border-border shrink-0">
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shrink-0">
                            {getInitials(appointment.patientName)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <SheetTitle className="text-lg truncate">{appointment.patientName}</SheetTitle>
                            <p className="text-sm text-muted-foreground">{appointment.patientId}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                <Badge variant="outline" className={statusStyles[appointment.status]}>
                                    {status?.label}
                                </Badge>
                                {type && (
                                    <Badge variant="outline" className="bg-secondary">
                                        {type.label}
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <QuickActionsMenu
                            patientId={appointment.patientId}
                            patientName={appointment.patientName}
                            actions={['viewPatient', 'viewPrescriptions', 'orderLabTest', 'viewBedAssignment']}
                        />
                    </div>
                </SheetHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                    <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent px-6 h-auto py-0 shrink-0">
                        <TabsTrigger value="details" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-3 text-xs">
                            <FileText className="w-3.5 h-3.5 mr-1.5" />Details
                        </TabsTrigger>
                        <TabsTrigger value="patient" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-3 text-xs">
                            <User className="w-3.5 h-3.5 mr-1.5" />Patient
                        </TabsTrigger>
                        <TabsTrigger value="actions" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-3 text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />Actions
                        </TabsTrigger>
                    </TabsList>

                    <ScrollArea className="flex-1">
                        {/* Details Tab */}
                        <TabsContent value="details" className="p-6 pt-4 m-0 space-y-4">
                            <section>
                                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-primary" />Appointment Information
                                </h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <InfoCard label="Date" value={formatAppointmentDate(appointment.date)} icon={<Calendar className="w-3.5 h-3.5" />} />
                                    <InfoCard label="Time" value={appointment.time} icon={<Clock className="w-3.5 h-3.5" />} />
                                    <InfoCard label="Type" value={type?.label || 'N/A'} icon={<FileText className="w-3.5 h-3.5" />} />
                                    <InfoCard label="Status" value={status?.label || 'N/A'} icon={<CheckCircle2 className="w-3.5 h-3.5" />} />
                                </div>
                            </section>

                            <section>
                                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                    <Stethoscope className="w-4 h-4 text-primary" />Doctor & Department
                                </h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <InfoCard label="Doctor" value={appointment.doctorName} icon={<Stethoscope className="w-3.5 h-3.5" />} />
                                    <InfoCard label="Department" value={department?.label || 'N/A'} icon={<Building2 className="w-3.5 h-3.5" />} />
                                </div>
                            </section>

                            {appointment.notes && (
                                <section>
                                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-primary" />Notes
                                    </h3>
                                    <div className="bg-secondary/50 rounded-lg p-3 border border-border">
                                        <p className="text-sm text-muted-foreground">{appointment.notes}</p>
                                    </div>
                                </section>
                            )}
                        </TabsContent>

                        {/* Patient Tab */}
                        <TabsContent value="patient" className="p-6 pt-4 m-0 space-y-4">
                            <section>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                        <User className="w-4 h-4 text-primary" />Patient Information
                                    </h3>
                                    <ModuleLinkBadge
                                        moduleKey="patients"
                                        label="View Full Profile"
                                        patientId={appointment.patientId}
                                        patientName={appointment.patientName}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <InfoCard label="Name" value={appointment.patientName} icon={<User className="w-3.5 h-3.5" />} />
                                    <InfoCard label="MRN" value={appointment.patientId} />
                                    <InfoCard label="Age" value={`${appointment.patientAge} years`} />
                                    <InfoCard label="Gender" value={appointment.patientGender} />
                                    <InfoCard label="Phone" value={appointment.patientPhone} icon={<Phone className="w-3.5 h-3.5" />} />
                                </div>
                            </section>
                        </TabsContent>

                        {/* Actions Tab */}
                        <TabsContent value="actions" className="p-6 pt-4 m-0 space-y-4">
                            <section>
                                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-primary" />Update Status
                                </h3>
                                <div className="space-y-2">
                                    <Select value={appointment.status} onValueChange={handleStatusChange}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {APPOINTMENT_STATUSES.map((s) => (
                                                <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                    Quick Actions
                                </h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        variant="outline"
                                        className="justify-start gap-2"
                                        onClick={() => handleStatusChange('confirmed')}
                                    >
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                        Confirm
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="justify-start gap-2"
                                        onClick={() => handleStatusChange('in-progress')}
                                    >
                                        <Clock className="w-4 h-4 text-primary" />
                                        Start
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="justify-start gap-2"
                                        onClick={() => handleStatusChange('completed')}
                                    >
                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                        Complete
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="justify-start gap-2 text-destructive hover:text-destructive"
                                        onClick={() => handleStatusChange('cancelled')}
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Cancel
                                    </Button>
                                </div>
                            </section>
                        </TabsContent>
                    </ScrollArea>
                </Tabs>
            </SheetContent>
        </Sheet>
    );
}

function InfoCard({ label, value, icon }) {
    return (
        <div className="bg-secondary/50 rounded-lg p-3 border border-border">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                {icon}
                <span className="text-xs">{label}</span>
            </div>
            <p className="font-medium text-sm">{value}</p>
        </div>
    );
}
