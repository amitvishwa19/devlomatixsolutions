import { memo } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { 
  Inbox, 
  ClipboardList, 
  Activity, 
  Clock, 
  Eye, 
  CheckCircle,
  Plus,
  MoreVertical,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { KanbanCard } from './KanbanCard';
import { cn } from '@/lib/utils';

const iconMap = {
  Inbox,
  ClipboardList,
  Activity,
  Clock,
  Eye,
  CheckCircle,
};

function KanbanColumnComponent({ 
  column, 
  onAddTask, 
  onTaskClick, 
  onTaskEdit, 
  onTaskDelete,
  onClearCompleted 
}) {
  const Icon = iconMap[column.icon] || Inbox;
  const isOverLimit = column.limit > 0 && column.tasks.length > column.limit;
  const isAtLimit = column.limit > 0 && column.tasks.length === column.limit;

  return (
    <div className="flex flex-col bg-muted/30 rounded-lg min-w-[300px] w-[300px] max-h-[calc(100vh-220px)]">
      {/* Column Header */}
      <div className="p-3 border-b border-border bg-card rounded-t-lg">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className={cn('w-2 h-2 rounded-full', column.color)} />
            <h3 className="font-semibold text-sm text-foreground">{column.title}</h3>
            <Badge variant="secondary" className="text-xs">
              {column.tasks.length}
              {column.limit > 0 && `/${column.limit}`}
            </Badge>
            {isOverLimit && (
              <Tooltip>
                <TooltipTrigger>
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                </TooltipTrigger>
                <TooltipContent>WIP limit exceeded!</TooltipContent>
              </Tooltip>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 w-7 p-0"
                  onClick={() => onAddTask?.(column.id)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add task</TooltipContent>
            </Tooltip>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onAddTask?.(column.id)}>
                  Add Task
                </DropdownMenuItem>
                {column.id === 'completed' && (
                  <DropdownMenuItem 
                    onClick={onClearCompleted}
                    className="text-destructive"
                  >
                    Clear All Completed
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Progress bar for WIP limit */}
        {column.limit > 0 && (
          <div className="mt-2">
            <div className="h-1 bg-secondary rounded-full overflow-hidden">
              <div 
                className={cn(
                  'h-full transition-all duration-300',
                  isOverLimit ? 'bg-destructive' : isAtLimit ? 'bg-amber-500' : 'bg-primary'
                )}
                style={{ width: `${Math.min((column.tasks.length / column.limit) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Column Body */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <ScrollArea className="flex-1">
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={cn(
                'p-2 min-h-[200px] transition-colors duration-200',
                snapshot.isDraggingOver && 'bg-accent/50'
              )}
            >
              {column.tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Icon className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">No tasks</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => onAddTask?.(column.id)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add task
                  </Button>
                </div>
              ) : (
                column.tasks.map((task, index) => (
                  <KanbanCard
                    key={task.id}
                    task={task}
                    index={index}
                    onClick={onTaskClick}
                    onEdit={onTaskEdit}
                    onDelete={onTaskDelete}
                  />
                ))
              )}
              {provided.placeholder}
            </div>
          </ScrollArea>
        )}
      </Droppable>
    </div>
  );
}

export const KanbanColumn = memo(KanbanColumnComponent);
