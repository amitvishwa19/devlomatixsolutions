import { Droppable } from '@hello-pangea/dnd';
import { TaskCard } from './TaskCard.jsx';
import { Circle, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils.js';

const columnStyles = {
  todo: {
    bg: 'bg-column-todo',
    icon: <Circle className="w-4 h-4" />,
    accent: 'text-muted-foreground',
  },
  'in-progress': {
    bg: 'bg-column-progress',
    icon: <Loader2 className="w-4 h-4" />,
    accent: 'text-warning',
  },
  done: {
    bg: 'bg-column-done',
    icon: <CheckCircle2 className="w-4 h-4" />,
    accent: 'text-success',
  },
};

export const KanbanColumn = ({ column, onDeleteTask }) => {
  const style = columnStyles[column.id] || columnStyles.todo;

  return (
    <div className={cn('flex-1 min-w-[320px] max-w-[400px] rounded-xl p-4', style.bg)}>
      <div className="flex items-center gap-2 mb-4">
        <span className={style.accent}>{style.icon}</span>
        <h3 className="font-semibold text-foreground">{column.title}</h3>
        <span className="ml-auto bg-background/60 text-muted-foreground text-xs font-medium px-2 py-0.5 rounded-full">
          {column.tasks.length}
        </span>
      </div>

      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'min-h-[200px] rounded-lg transition-colors',
              snapshot.isDraggingOver && 'bg-primary/5 ring-2 ring-primary/20 ring-dashed'
            )}
          >
            {column.tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onDelete={onDeleteTask}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};
