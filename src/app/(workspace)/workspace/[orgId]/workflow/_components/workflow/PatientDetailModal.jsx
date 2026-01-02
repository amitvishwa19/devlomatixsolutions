
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { StatusBadge } from './StatusBadge';
import { WorkflowTypeBadge } from './WorkflowTypeBadge';
import { WorkflowStepper } from './WorkflowStepper';
import { PatientDetailTabs } from './PatientDetailTabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User, Phone, Calendar, Stethoscope, MapPin, ArrowRight, Clock, FileText, Activity, CheckCircle2 } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { IPD_WORKFLOW_STEPS, OPD_WORKFLOW_STEPS } from '../../_hooks/types';



export function PatientDetailModal({ patient, open, onClose, onAdvanceStage, onUpdatePatient }) {
    if (!patient) return null;

    const steps = patient.workflowType === 'OPD' ? OPD_WORKFLOW_STEPS : IPD_WORKFLOW_STEPS;
    const currentIndex = steps.findIndex(s => s.id === patient.currentStage);
    const nextStep = currentIndex < steps.length - 1 ? steps[currentIndex + 1] : null;
    const completedStages = patient.stageHistory.filter(h => h.completedAt).map(h => h.stage);
    const isLastStage = patient.currentStage === 'discharged';

    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent className="w-full sm:max-w-2xl p-0 overflow-hidden">
                <SheetHeader className="p-6 pb-4 gradient-hero text-primary-foreground">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center text-2xl font-display font-bold backdrop-blur-sm">
                                {patient.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                                <SheetTitle className="text-2xl font-display text-primary-foreground">
                                    {patient.name}
                                </SheetTitle>
                                <p className="text-primary-foreground/80 mt-1">{patient.mrn}</p>
                                <div className="flex items-center gap-3 mt-2">
                                    <WorkflowTypeBadge type={patient.workflowType} className="bg-primary-foreground/20 border-primary-foreground/30 text-primary-foreground" />
                                    <StatusBadge status={patient.status} className="bg-primary-foreground/20 border-primary-foreground/30 text-primary-foreground" />
                                </div>
                            </div>
                        </div>
                    </div>
                </SheetHeader>

                <ScrollArea className="max-h-[60vh]">
                    <div className="p-6 space-y-6">
                        {/* Patient Info Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <InfoItem icon={User} label="Age / Gender" value={`${patient.age} years, ${patient.gender}`} />
                            <InfoItem icon={Phone} label="Phone" value={patient.phone} />
                            <InfoItem icon={Calendar} label="Admitted" value={format(new Date(patient.admissionDate), 'dd MMM yyyy, hh:mm a')} />
                            <InfoItem icon={Activity} label="Department" value={patient.department || 'Not Assigned'} />
                            {patient.assignedDoctor && (
                                <InfoItem icon={Stethoscope} label="Doctor" value={patient.assignedDoctor} />
                            )}
                            {patient.room && (
                                <InfoItem icon={MapPin} label="Location" value={`Room ${patient.room}${patient.bed ? `-${patient.bed}` : ''}`} />
                            )}
                            {patient.diagnosis && (
                                <InfoItem icon={FileText} label="Diagnosis" value={patient.diagnosis} className="col-span-2" />
                            )}
                        </div>

                        {/* Additional Patient Details Tabs */}
                        <PatientDetailTabs
                            patient={patient}
                            onUpdatePatient={(updates) => onUpdatePatient?.(patient.id, updates)}
                        />

                        <Separator />

                        {/* Workflow Progress */}
                        <div>
                            <h3 className="font-display font-semibold text-lg mb-4">Workflow Progress</h3>
                            <div className="bg-secondary/30 rounded-xl p-6 overflow-x-auto">
                                <WorkflowStepper
                                    workflowType={patient.workflowType}
                                    currentStage={patient.currentStage}
                                    completedStages={completedStages}
                                />
                            </div>
                        </div>

                        <Separator />

                        {/* Stage History Timeline */}
                        <div>
                            <h3 className="font-display font-semibold text-lg mb-4">Stage History</h3>
                            <div className="relative">
                                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                                <div className="space-y-4">
                                    {patient.stageHistory.map((history, index) => {
                                        const stepInfo = steps.find(s => s.id === history.stage);
                                        const isCompleted = !!history.completedAt;
                                        const isCurrent = history.stage === patient.currentStage;

                                        return (
                                            <div key={index} className="relative flex items-start gap-4 pl-10">
                                                <div
                                                    className={`absolute left-2.5 w-3 h-3 rounded-full border-2 ${isCompleted
                                                        ? 'bg-success border-success'
                                                        : isCurrent
                                                            ? 'bg-primary border-primary animate-pulse'
                                                            : 'bg-muted border-border'
                                                        }`}
                                                />
                                                <div className="flex-1 bg-card rounded-lg p-4 border border-border">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="font-medium text-foreground">{stepInfo?.name}</h4>
                                                        {isCompleted && (
                                                            <CheckCircle2 className="w-4 h-4 text-success" />
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mt-1">{stepInfo?.description}</p>
                                                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            Started: {format(new Date(history.enteredAt), 'dd MMM, hh:mm a')}
                                                        </span>
                                                        {history.completedAt && (
                                                            <span className="flex items-center gap-1 text-success">
                                                                <CheckCircle2 className="w-3 h-3" />
                                                                Completed: {format(new Date(history.completedAt), 'dd MMM, hh:mm a')}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {history.completedBy && (
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            Completed by: {history.completedBy}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Action Button */}
                        {!isLastStage && nextStep && (
                            <div className="pt-4">
                                <Button
                                    onClick={() => {
                                        onAdvanceStage(patient.id);
                                        onClose();
                                    }}
                                    className="w-full gradient-primary text-primary-foreground hover:opacity-90 h-12 text-base"
                                >
                                    Advance to {nextStep.name}
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}

function InfoItem({
    icon: Icon,
    label,
    value,
    className = ''
}) {
    return (
        <div className={`flex items-start gap-3 ${className}`}>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-primary" />
            </div>
            <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium text-foreground">{value}</p>
            </div>
        </div>
    );
}
