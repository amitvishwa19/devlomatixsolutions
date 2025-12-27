
import { StatusBadge } from './StatusBadge';
import { WorkflowTypeBadge } from './WorkflowTypeBadge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { User, Stethoscope, Clock, Circle, ClipboardList, Activity, TestTube, Pill, CalendarCheck, CheckCircle2, FileInput, Bed, DoorOpen, ClipboardCheck, HeartPulse, Repeat, ListChecks, FileText, BadgeCheck, LucideIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { IPD_WORKFLOW_STEPS, OPD_WORKFLOW_STEPS } from '../../_hooks/types';



export function WorkflowKanban({ patients, workflowType, onViewDetails }) {
    const steps = workflowType === 'OPD' ? OPD_WORKFLOW_STEPS : IPD_WORKFLOW_STEPS;
    const filteredPatients = patients.filter(p => p.workflowType === workflowType);

    const iconMap = {
        ClipboardList, Activity, Clock, Stethoscope, TestTube, Pill, CalendarCheck, CheckCircle2,
        FileInput, Bed, DoorOpen, ClipboardCheck, HeartPulse, Repeat, ListChecks, FileText, BadgeCheck, Circle
    };

    const getIcon = (iconName) => {
        return iconMap[iconName] || Circle;
    };

    const getPatientsInStage = (stageId) => {
        return filteredPatients.filter(p => p.currentStage === stageId);
    };

    return (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border flex items-center gap-3">
                <WorkflowTypeBadge type={workflowType} />
                <span className="text-sm text-muted-foreground">
                    {filteredPatients.length} patients in workflow
                </span>
            </div>
            <div className="">
                <div className="flex flex-row flex-wrap justify-between gap-4 p-4">
                    {steps.map((step) => {
                        const stagePatients = getPatientsInStage(step.id);
                        const Icon = getIcon(step.icon);

                        return (
                            <div
                                key={step.id}
                                className="w-72 flex-shrink-0 bg-secondary/30 rounded-lg"
                            >
                                {/* Column Header */}
                                <div className="p-3 border-b border-border/50">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
                                            <Icon className="w-4 h-4 text-primary" />
                                        </div>
                                        <h3 className="font-medium text-foreground text-sm">{step.name}</h3>
                                        <span className="ml-auto bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full">
                                            {stagePatients.length}
                                        </span>
                                    </div>
                                    {step.estimatedTime && (
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {step.estimatedTime}
                                        </p>
                                    )}
                                </div>

                                {/* Patient Cards */}
                                <div className="p-2 space-y-2 min-h-[200px] max-h-[400px] overflow-y-auto">
                                    {stagePatients.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground text-sm">
                                            No patients
                                        </div>
                                    ) : (
                                        stagePatients.map((patient) => {
                                            const currentStageEntry = patient.stageHistory.find(
                                                h => h.stage === patient.currentStage
                                            );
                                            const timeInStage = currentStageEntry
                                                ? formatDistanceToNow(new Date(currentStageEntry.enteredAt), { addSuffix: false })
                                                : null;

                                            return (
                                                <div
                                                    key={patient.id}
                                                    onClick={() => onViewDetails(patient)}
                                                    className={cn(
                                                        'bg-card rounded-lg p-3 border border-border cursor-pointer',
                                                        'hover:border-primary/30 hover:shadow-md transition-all duration-200',
                                                        'group'
                                                    )}
                                                >
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                                                                {patient.name.split(' ').map(n => n[0]).join('')}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                                                                    {patient.name}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">{patient.mrn}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                            <User className="w-3 h-3" />
                                                            {patient.age}y, {patient.gender}
                                                        </div>
                                                        {patient.assignedDoctor && (
                                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                                <Stethoscope className="w-3 h-3" />
                                                                {patient.assignedDoctor}
                                                            </div>
                                                        )}
                                                        {timeInStage && (
                                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                                <Clock className="w-3 h-3" />
                                                                {timeInStage} in stage
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="mt-2">
                                                        <StatusBadge status={patient.status} className="text-[10px]" />
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <ScrollBar orientation="horizontal" />
            </div>
        </div>
    );
}
