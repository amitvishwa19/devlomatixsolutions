import { Draggable } from '@hello-pangea/dnd';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Clock, Stethoscope, MapPin, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';


const priorityStyles = {
    high: 'bg-destructive/10 text-destructive border-destructive/20',
    medium: 'bg-warning/10 text-warning border-warning/20',
    low: 'bg-success/10 text-success border-success/20',
};

const categoryLabels = {
    'patient-care': 'Patient Care',
    'administrative': 'Administrative',
    'lab-work': 'Lab Work',
    'surgery': 'Surgery',
    'consultation': 'Consultation',
};

export const TaskCard = ({ task, index, onDelete }) => {
    return (
        <Draggable draggableId={task.id} index={index}>
            {(provided, snapshot) => (
                <Card
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={cn(
                        'mb-3 cursor-grab active:cursor-grabbing transition-shadow',
                        snapshot.isDragging && 'shadow-lg ring-2 ring-primary/20'
                    )}
                >
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="font-medium text-sm leading-tight">{task.title}</h4>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(task.id);
                                }}
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </div>

                        {task.description && (
                            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                                {task.description}
                            </p>
                        )}

                        <div className="space-y-2 mb-3">
                            {task.patientName && (
                                <div className="flex items-center gap-2 text-xs">
                                    <User className="w-3 h-3 text-muted-foreground" />
                                    <span>
                                        {task.patientName}
                                        {task.patientAge && `, ${task.patientAge}${task.patientGender ? ` ${task.patientGender[0]}` : ''}`}
                                    </span>
                                </div>
                            )}

                            {task.doctorName && (
                                <div className="flex items-center gap-2 text-xs">
                                    <Stethoscope className="w-3 h-3 text-muted-foreground" />
                                    <span>
                                        Dr. {task.doctorName}
                                        {task.doctorSpecialty && ` - ${task.doctorSpecialty}`}
                                    </span>
                                </div>
                            )}

                            {task.roomNumber && (
                                <div className="flex items-center gap-2 text-xs">
                                    <MapPin className="w-3 h-3 text-muted-foreground" />
                                    <span>Room {task.roomNumber}</span>
                                </div>
                            )}

                            {task.dueTime && (
                                <div className="flex items-center gap-2 text-xs">
                                    <Clock className="w-3 h-3 text-muted-foreground" />
                                    <span>{task.dueTime}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                            <Badge variant="outline" className={cn('text-xs', priorityStyles[task.priority])}>
                                {task.priority}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                                {categoryLabels[task.category] || task.category}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            )}
        </Draggable>
    );
};
