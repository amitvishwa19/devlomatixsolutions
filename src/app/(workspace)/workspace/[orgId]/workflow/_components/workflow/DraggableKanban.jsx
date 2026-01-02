import { StatusBadge } from './StatusBadge';
import { WorkflowTypeBadge } from './WorkflowTypeBadge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { User, Stethoscope, Clock, Circle, ClipboardList, Activity, TestTube, Pill, CalendarCheck, CheckCircle2, FileInput, Bed, DoorOpen, ClipboardCheck, HeartPulse, Repeat, ListChecks, FileText, BadgeCheck, LucideIcon, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { toast } from 'sonner';
import { IPD_WORKFLOW_STEPS, OPD_WORKFLOW_STEPS } from '../../_hooks/types';


export function DraggableKanban({ patients, workflowType, onViewDetails, onMovePatient }) {
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

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const { draggableId, source, destination } = result;

        if (source.droppableId === destination.droppableId) return;

        const sourceIndex = steps.findIndex(s => s.id === source.droppableId);
        const destIndex = steps.findIndex(s => s.id === destination.droppableId);

        // Only allow forward movement or one step back
        if (destIndex < sourceIndex - 1) {
            toast.error('Cannot move patient more than one stage back');
            return;
        }

        onMovePatient(draggableId, destination.droppableId);
        const destStep = steps.find(s => s.id === destination.droppableId);
        toast.success(`Patient moved to ${destStep?.name}`);
    };

    return (
        <div className=" rounded-md overflow-hidden h-full">
            <div className="p-4 border-b border-border flex items-center gap-3">
                <WorkflowTypeBadge type={workflowType} />
                <span className="text-sm text-muted-foreground">
                    {filteredPatients.length} patients in workflow
                </span>
                <span className="text-xs text-muted-foreground ml-auto">
                    Drag cards to move patients between stages
                </span>
            </div>
            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="flex gap-4 p-4 min-w-max">
                    {steps.map((step) => {
                        const stagePatients = getPatientsInStage(step.id);
                        const Icon = getIcon(step.icon);

                        return (
                            <Droppable key={step.id} droppableId={step.id} >
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={cn(
                                            "w-56 flex flex-col  transition-colors ",
                                            snapshot.isDraggingOver && "bg-primary/10 ring-2 ring-primary/30"
                                        )}
                                    >
                                        {/* Column Header */}
                                        <div className="p-3 border-b border-border/50 bg-card rounded-md mb-2">
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
                                        <div className=" space-y-2  ">
                                            {stagePatients.length === 0 ? (
                                                <div className="text-center py-8 text-muted-foreground text-sm">
                                                    No patients
                                                </div>
                                            ) : (
                                                stagePatients.map((patient, index) => {
                                                    const currentStageEntry = patient.stageHistory.find(
                                                        h => h.stage === patient.currentStage
                                                    );
                                                    const timeInStage = currentStageEntry
                                                        ? formatDistanceToNow(new Date(currentStageEntry.enteredAt), { addSuffix: false })
                                                        : null;

                                                    return (
                                                        <Draggable key={patient.id} draggableId={patient.id} index={index}>
                                                            {(provided, snapshot) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                    onClick={() => onViewDetails(patient)}
                                                                    className={cn(
                                                                        'bg-card rounded-lg p-3 border border-border cursor-grab active:cursor-grabbing',
                                                                        'hover:border-primary/30 hover:shadow-md transition-all duration-200',
                                                                        'group',
                                                                        snapshot.isDragging && 'shadow-lg ring-2 ring-primary rotate-2'
                                                                    )}
                                                                >
                                                                    <div className="flex items-start justify-between mb-2">
                                                                        <div className="flex items-center gap-2">
                                                                            <div className={cn(
                                                                                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                                                                                patient.status === 'critical'
                                                                                    ? "bg-destructive text-destructive-foreground"
                                                                                    : "gradient-primary text-primary-foreground"
                                                                            )}>
                                                                                {patient.name.split(' ').map(n => n[0]).join('')}
                                                                            </div>
                                                                            <div>
                                                                                <p className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                                                                                    {patient.name}
                                                                                </p>
                                                                                <p className="text-xs text-muted-foreground">{patient.mrn}</p>
                                                                            </div>
                                                                        </div>
                                                                        {patient.status === 'critical' && (
                                                                            <AlertTriangle className="w-4 h-4 text-destructive animate-pulse" />
                                                                        )}
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
                                                            )}
                                                        </Draggable>
                                                    );
                                                })
                                            )}
                                            {provided.placeholder}
                                        </div>
                                    </div>
                                )}
                            </Droppable>
                        );
                    })}
                </div>
            </DragDropContext>
        </div>
    );
}
