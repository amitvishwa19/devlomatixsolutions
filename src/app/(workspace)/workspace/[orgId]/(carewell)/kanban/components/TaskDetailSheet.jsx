import { 
  User, 
  Calendar, 
  Clock, 
  Building2, 
  Stethoscope,
  AlertCircle,
  Tag,
  MessageSquare,
  History,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PRIORITY_CONFIG, TASK_TYPE_CONFIG, COLUMN_CONFIG } from '../types';
import { QuickActionButtons } from '@/carewell/utils/crossModuleNavigation';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export function TaskDetailSheet({ 
  task, 
  open, 
  onOpenChange, 
  onUpdate, 
  onMoveToColumn,
  columns 
}) {
  if (!task) return null;

  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const taskTypeConfig = TASK_TYPE_CONFIG[task.taskType];

  const handlePriorityChange = (newPriority) => {
    onUpdate?.({ ...task, priority: newPriority });
  };

  const handleColumnChange = (newColumnId) => {
    onMoveToColumn?.(task.id, task.columnId, newColumnId);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg p-0 border-l bg-transparent">
        <div className="h-full flex flex-col bg-card rounded-l-lg border-l">
          <SheetHeader className="p-6 pb-4 border-b border-border">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge 
                    variant="outline" 
                    className={cn('text-xs', priorityConfig.textColor, priorityConfig.bgLight)}
                  >
                    {priorityConfig.label} Priority
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {taskTypeConfig.label}
                  </Badge>
                </div>
                <SheetTitle className="text-xl">{task.patientName}</SheetTitle>
                <p className="text-sm text-muted-foreground mt-1">{task.patientId}</p>
              </div>
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {/* Quick Actions */}
              <div>
                <h4 className="text-sm font-medium mb-3">Quick Actions</h4>
                <QuickActionButtons
                  patientId={task.patientId}
                  patientName={task.patientName}
                  actions={['viewPatient', 'scheduleAppointment', 'newPrescription', 'orderLabTest']}
                />
              </div>

              <Separator />

              {/* Task Details */}
              <div>
                <h4 className="text-sm font-medium mb-3">Task Details</h4>
                <p className="text-sm text-muted-foreground">{task.description}</p>
              </div>

              {/* Patient Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>{task.age} years, {task.gender}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <span>{task.assignedDepartment}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Stethoscope className="w-4 h-4 text-muted-foreground" />
                  <span>{task.assignedTo}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{format(new Date(task.createdAt), 'MMM d, yyyy')}</span>
                </div>
              </div>

              <Separator />

              {/* Status Controls */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Priority</label>
                  <Select value={task.priority} onValueChange={handlePriorityChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${config.color}`} />
                            {config.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Move to Column</label>
                  <Select value={task.columnId} onValueChange={handleColumnChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COLUMN_CONFIG.map((col) => (
                        <SelectItem key={col.id} value={col.id}>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${col.color}`} />
                            {col.title}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Tags */}
              {task.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Tags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Due Date */}
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                <Clock className={cn(
                  'w-4 h-4',
                  new Date(task.dueDate) < new Date() ? 'text-destructive' : 'text-muted-foreground'
                )} />
                <span className="text-sm">
                  Due: {format(new Date(task.dueDate), 'MMM d, yyyy h:mm a')}
                </span>
                {new Date(task.dueDate) < new Date() && (
                  <Badge variant="destructive" className="ml-auto text-xs">Overdue</Badge>
                )}
              </div>

              {/* Notes */}
              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Notes
                </h4>
                <Textarea 
                  placeholder="Add notes about this task..."
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t border-border flex gap-2">
            <Button className="flex-1" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
