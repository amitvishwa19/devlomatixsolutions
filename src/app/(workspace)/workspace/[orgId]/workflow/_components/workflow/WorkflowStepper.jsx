import { cn } from '@/lib/utils';
import { Check, Circle, ClipboardList, Activity, Clock, Stethoscope, TestTube, Pill, CalendarCheck, CheckCircle2, FileInput, Bed, DoorOpen, ClipboardCheck, HeartPulse, Repeat, ListChecks, FileText, BadgeCheck } from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { IPD_WORKFLOW_STEPS, OPD_WORKFLOW_STEPS } from '../../_hooks/types';


export function WorkflowStepper({ workflowType, currentStage, completedStages, compact = false }) {
    const steps = workflowType === 'OPD' ? OPD_WORKFLOW_STEPS : IPD_WORKFLOW_STEPS;
    const currentIndex = steps.findIndex(s => s.id === currentStage);

    const getStepStatus = (step, index) => {
        if (completedStages.includes(step.id)) return 'completed';
        if (step.id === currentStage) return 'current';
        if (index < currentIndex) return 'completed';
        return 'upcoming';
    };

    const iconMap = {
        ClipboardList, Activity, Clock, Stethoscope, TestTube, Pill, CalendarCheck, CheckCircle2,
        FileInput, Bed, DoorOpen, ClipboardCheck, HeartPulse, Repeat, ListChecks, FileText, BadgeCheck, Circle
    };

    const getIcon = (iconName) => {
        return iconMap[iconName] || Circle;
    };

    if (compact) {
        return (
            <div className="flex items-center gap-1">
                {steps.map((step, index) => {
                    const status = getStepStatus(step, index);
                    return (
                        <div
                            key={step.id}
                            className={cn(
                                'w-2 h-2 rounded-full transition-all duration-300',
                                status === 'completed' && 'bg-success',
                                status === 'current' && 'bg-primary animate-pulse',
                                status === 'upcoming' && 'bg-border'
                            )}
                            title={step.name}
                        />
                    );
                })}
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                    const status = getStepStatus(step, index);
                    const Icon = getIcon(step.icon);
                    const isLast = index === steps.length - 1;

                    return (
                        <div key={step.id} className="flex items-center flex-1 last:flex-initial">
                            <div className="flex flex-col items-center">
                                <div
                                    className={cn(
                                        'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border-2',
                                        status === 'completed' && 'bg-success border-success text-success-foreground',
                                        status === 'current' && 'bg-primary border-primary text-primary-foreground shadow-lg animate-pulse',
                                        status === 'upcoming' && 'bg-muted border-border text-muted-foreground'
                                    )}
                                >
                                    {status === 'completed' ? (
                                        <Check className="w-5 h-5" />
                                    ) : (
                                        <Icon className="w-5 h-5" />
                                    )}
                                </div>
                                <span
                                    className={cn(
                                        'mt-2 text-xs font-medium text-center max-w-[80px] leading-tight',
                                        status === 'completed' && 'text-success',
                                        status === 'current' && 'text-primary font-semibold',
                                        status === 'upcoming' && 'text-muted-foreground'
                                    )}
                                >
                                    {step.name}
                                </span>
                            </div>
                            {!isLast && (
                                <div
                                    className={cn(
                                        'h-0.5 flex-1 mx-2 transition-colors duration-500',
                                        status === 'completed' || index < currentIndex ? 'bg-success' : 'bg-border'
                                    )}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
