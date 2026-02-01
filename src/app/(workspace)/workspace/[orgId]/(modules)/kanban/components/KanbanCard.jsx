import { memo } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import {
  User,
  Clock,
  Stethoscope,
  TestTube,
  Pill,
  Syringe,
  LogOut,
  Scan,
  MoreHorizontal,
  Calendar
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { PRIORITY_CONFIG, TASK_TYPE_CONFIG } from '../utils/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const iconMap = {
  Stethoscope,
  TestTube,
  Pill,
  Syringe,
  LogOut,
  Scan,
};

function KanbanCardComponent({ task, index, onClick, onEdit, onDelete }) {
  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const taskTypeConfig = TASK_TYPE_CONFIG[task.taskType];
  const TaskIcon = iconMap[taskTypeConfig?.icon] || Stethoscope;

  const isOverdue = new Date(task.dueDate) < new Date();
  const timeLeft = formatDistanceToNow(new Date(task.dueDate), { addSuffix: true });

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            'mb-2 cursor-grab active:cursor-grabbing transition-all duration-200',
            'hover:shadow-md hover:border-primary/30',
            snapshot.isDragging && 'shadow-lg rotate-2 scale-105 border-primary',
            task.priority === 'critical' && 'border-l-4 border-l-red-500',
            task.priority === 'high' && 'border-l-4 border-l-orange-500'
          )}
          onClick={() => onClick?.(task)}
        >
          <CardContent className="p-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <Tooltip>
                  <TooltipTrigger>
                    <div className={cn('p-1.5 rounded-md', priorityConfig.bgLight)}>
                      <TaskIcon className={cn('w-3.5 h-3.5', taskTypeConfig.color)} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>{taskTypeConfig.label}</TooltipContent>
                </Tooltip>
                <div className="min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">{task.patientName}</p>
                  <p className="text-xs text-muted-foreground">{task.patientId}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onClick?.(task); }}>
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit?.(task); }}>
                    Edit Task
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={(e) => { e.stopPropagation(); onDelete?.(task); }}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Description */}
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{task.description}</p>

            {/* Patient Info */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <User className="w-3 h-3" />
              <span>{task.age}y, {task.gender}</span>
              <span className="text-muted-foreground/50">•</span>
              <span>{task.assignedDepartment}</span>
            </div>

            {/* Tags */}
            {task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {task.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                    {tag}
                  </Badge>
                ))}
                {task.tags.length > 2 && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    +{task.tags.length - 2}
                  </Badge>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="flex items-center gap-1">
                <Badge
                  variant="outline"
                  className={cn('text-[10px] px-1.5 py-0', priorityConfig.textColor, priorityConfig.bgLight)}
                >
                  {priorityConfig.label}
                </Badge>
              </div>
              <Tooltip>
                <TooltipTrigger>
                  <div className={cn(
                    'flex items-center gap-1 text-[10px]',
                    isOverdue ? 'text-destructive' : 'text-muted-foreground'
                  )}>
                    <Clock className="w-3 h-3" />
                    <span>{timeLeft}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Due: {new Date(task.dueDate).toLocaleString()}</TooltipContent>
              </Tooltip>
            </div>
          </CardContent>
        </Card>
      )}
    </Draggable>
  );
}

export const KanbanCard = memo(KanbanCardComponent);
