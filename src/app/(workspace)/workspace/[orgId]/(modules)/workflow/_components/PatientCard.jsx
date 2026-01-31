//import { getTimeInStage, getInitials } from './utils';
import { Clock, User, Stethoscope, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { getInitials } from '@/utils/functions';
import { getTimeInStage } from '../_misc/utils';

const statusStyles = {
    pending: 'bg-amber-100 text-amber-700',
    'in-progress': 'bg-primary/10 text-primary',
    completed: 'bg-emerald-100 text-emerald-700',
    critical: 'bg-destructive/10 text-destructive',
};

const statusDotStyles = {
    pending: 'bg-amber-500',
    'in-progress': 'bg-primary',
    completed: 'bg-emerald-500',
    critical: 'bg-destructive',
};

const statusLabels = {
    pending: 'Pending',
    'in-progress': 'In Progress',
    completed: 'Completed',
    critical: 'Critical',
};

export function PatientCard({
    patient,
    isDragging = false,
    viewMode = 'grid',
    onClick,
    nextStageName,
    onMoveToNextStage,
    isLastStage = false
}) {
    const cardBaseClasses = "bg-card border border-border rounded-lg p-4 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow";
    const draggingClasses = isDragging ? "shadow-lg ring-2 ring-primary/30" : "";

    const handleMoveClick = (e) => {
        e.stopPropagation();
        onMoveToNextStage?.(patient);
    };

    if (viewMode === 'list') {
        return (
            <div
                className={`${cardBaseClasses} ${draggingClasses} animate-fade-in`}
                onClick={onClick}
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm shrink-0">
                        {getInitials(patient.name)}
                    </div>
                    <div className="flex-1 min-w-0 flex items-center gap-6">
                        <div className="min-w-[140px]">
                            <h4 className="font-semibold text-card-foreground truncate">{patient.name}</h4>
                            <p className="text-xs text-muted-foreground">{patient.mrn}</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-[80px]">
                            <User className="w-3.5 h-3.5" />
                            <span>{patient.age}y, {patient.gender}</span>
                        </div>
                        {patient.doctor && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-[120px]">
                                <Stethoscope className="w-3.5 h-3.5" />
                                <span className="truncate">{patient.doctor}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-[100px]">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{getTimeInStage(patient.stageEnteredAt)} in stage</span>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[patient.status]}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusDotStyles[patient.status]}`} />
                            {statusLabels[patient.status]}
                        </span>
                    </div>
                    {!isLastStage && nextStageName && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 gap-1 shrink-0"
                                        onClick={handleMoveClick}
                                    >
                                        <span className="hidden sm:inline">Next</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Move to {nextStageName}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div
            className={`${cardBaseClasses} ${draggingClasses} animate-fade-in`}
            onClick={onClick}
        >
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm shrink-0">
                    {getInitials(patient.name)}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-card-foreground truncate">{patient.name}</h4>
                    <p className="text-xs text-muted-foreground">{patient.mrn}</p>
                </div>
            </div>

            <div className="mt-3 space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="w-3.5 h-3.5" />
                    <span>{patient.age}y, {patient.gender}</span>
                </div>
                {patient.doctor && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Stethoscope className="w-3.5 h-3.5" />
                        <span className="truncate">{patient.doctor}</span>
                    </div>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{getTimeInStage(patient.stageEnteredAt)} in stage</span>
                </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[patient.status]}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusDotStyles[patient.status]}`} />
                    {statusLabels[patient.status]}
                </span>

                {!isLastStage && nextStageName && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 px-2 gap-1 text-xs"
                                    onClick={handleMoveClick}
                                >
                                    <span className="hidden sm:inline">{nextStageName}</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Move to {nextStageName}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>
        </div>
    );
}
