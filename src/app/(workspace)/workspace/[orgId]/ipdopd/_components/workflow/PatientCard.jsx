
import { StatusBadge } from './StatusBadge';
import { WorkflowTypeBadge } from './WorkflowTypeBadge';
import { WorkflowStepper } from './WorkflowStepper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { User, Phone, Calendar, Stethoscope, MapPin, ArrowRight, Clock } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { IPD_WORKFLOW_STEPS, OPD_WORKFLOW_STEPS } from '../../_hooks/types';



export function PatientCard({ patient, onAdvanceStage, onViewDetails }) {
    const steps = patient.workflowType === 'OPD' ? OPD_WORKFLOW_STEPS : IPD_WORKFLOW_STEPS;
    const currentStepInfo = steps.find(s => s.id === patient.currentStage);
    const currentIndex = steps.findIndex(s => s.id === patient.currentStage);
    const nextStep = currentIndex < steps.length - 1 ? steps[currentIndex + 1] : null;
    const completedStages = patient.stageHistory.filter(h => h.completedAt).map(h => h.stage);
    const isLastStage = patient.currentStage === 'discharged';

    const currentStageEntry = patient.stageHistory.find(h => h.stage === patient.currentStage);
    const timeInCurrentStage = currentStageEntry
        ? formatDistanceToNow(new Date(currentStageEntry.enteredAt), { addSuffix: false })
        : null;

    return (
        <Card className="workflow-card group cursor-pointer hover:border-primary/30" onClick={() => onViewDetails(patient)}>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-display font-bold text-lg">
                            {patient.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                            <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors">
                                {patient.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">{patient.mrn}</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <WorkflowTypeBadge type={patient.workflowType} />
                        <StatusBadge status={patient.status} />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Patient Info */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="w-4 h-4" />
                        <span>{patient.age}y, {patient.gender}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        <span className="truncate">{patient.phone}</span>
                    </div>
                    {patient.assignedDoctor && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Stethoscope className="w-4 h-4" />
                            <span className="truncate">{patient.assignedDoctor}</span>
                        </div>
                    )}
                    {patient.room && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span>Room {patient.room}{patient.bed ? `-${patient.bed}` : ''}</span>
                        </div>
                    )}
                </div>

                {/* Current Stage */}
                <div className="bg-secondary/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Current Stage
                        </span>
                        {timeInCurrentStage && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {timeInCurrentStage}
                            </span>
                        )}
                    </div>
                    <p className="font-medium text-foreground">{currentStepInfo?.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{currentStepInfo?.description}</p>
                </div>

                {/* Compact Progress */}
                <div className="flex items-center gap-2">
                    <WorkflowStepper
                        workflowType={patient.workflowType}
                        currentStage={patient.currentStage}
                        completedStages={completedStages}
                        compact
                    />
                    <span className="text-xs text-muted-foreground ml-auto">
                        {currentIndex + 1}/{steps.length}
                    </span>
                </div>

                {/* Action */}
                {!isLastStage && nextStep && (
                    <Button
                        variant='save'
                        onClick={(e) => {
                            e.stopPropagation();
                            onAdvanceStage(patient.id);
                        }}
                        className="w-full gradient-primary  hover:opacity-90 transition-opacity"
                    >
                        Move to {nextStep.name}
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                )}
                {isLastStage && (
                    <div className="text-center py-2 text-success font-medium text-sm">
                        ✓ Workflow Completed
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
