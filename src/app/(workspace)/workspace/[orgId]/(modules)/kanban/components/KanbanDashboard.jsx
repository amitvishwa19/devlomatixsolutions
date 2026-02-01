import { useState, useCallback } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { Plus, LayoutGrid, List, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useLocalStorage } from '@/carewell/hooks/useLocalStorage';
import {
  KanbanColumn,
  KanbanFilters,
  KanbanStats,
  TaskDetailSheet,
  AddTaskDialog
} from './components';
import { mockColumns } from './utils/mockData';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export function KanbanDashboard() {
  const [columns, setColumns] = useLocalStorage('carewell-kanban-columns', mockColumns);
  const [filters, setFilters] = useState({
    search: '',
    priority: '',
    taskType: '',
    department: '',
    assignee: '',
    showOverdueOnly: false,
  });
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskSheetOpen, setIsTaskSheetOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addToColumnId, setAddToColumnId] = useState('backlog');

  // Get unique values for filters
  const allTasks = columns.flatMap(col => col.tasks);
  const departments = [...new Set(allTasks.map(t => t.assignedDepartment))];
  const assignees = [...new Set(allTasks.map(t => t.assignedTo))];

  // Filter tasks
  const getFilteredTasks = useCallback((tasks) => {
    return tasks.filter(task => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          task.patientName.toLowerCase().includes(searchLower) ||
          task.patientId.toLowerCase().includes(searchLower) ||
          task.description.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }
      if (filters.priority && filters.priority !== 'all' && task.priority !== filters.priority) return false;
      if (filters.taskType && filters.taskType !== 'all' && task.taskType !== filters.taskType) return false;
      if (filters.department && filters.department !== 'all' && task.assignedDepartment !== filters.department) return false;
      if (filters.assignee && filters.assignee !== 'all' && task.assignedTo !== filters.assignee) return false;
      if (filters.showOverdueOnly && new Date(task.dueDate) >= new Date()) return false;
      return true;
    });
  }, [filters]);

  const filteredColumns = columns.map(col => ({
    ...col,
    tasks: getFilteredTasks(col.tasks),
  }));

  // Drag and drop handler
  const onDragEnd = useCallback((result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    setColumns(prevColumns => {
      const newColumns = [...prevColumns];

      // Find source and destination columns
      const sourceColIndex = newColumns.findIndex(col => col.id === source.droppableId);
      const destColIndex = newColumns.findIndex(col => col.id === destination.droppableId);

      if (sourceColIndex === -1 || destColIndex === -1) return prevColumns;

      const sourceCol = { ...newColumns[sourceColIndex], tasks: [...newColumns[sourceColIndex].tasks] };
      const destCol = source.droppableId === destination.droppableId
        ? sourceCol
        : { ...newColumns[destColIndex], tasks: [...newColumns[destColIndex].tasks] };

      // Remove from source
      const [movedTask] = sourceCol.tasks.splice(source.index, 1);

      // Update task's columnId
      const updatedTask = { ...movedTask, columnId: destination.droppableId };

      // Add to destination
      destCol.tasks.splice(destination.index, 0, updatedTask);

      // Update columns
      newColumns[sourceColIndex] = sourceCol;
      if (source.droppableId !== destination.droppableId) {
        newColumns[destColIndex] = destCol;
      }

      // Show toast for column changes
      if (source.droppableId !== destination.droppableId) {
        const destColName = newColumns[destColIndex].title;
        toast.success(`Task moved to ${destColName}`);
      }

      return newColumns;
    });
  }, [setColumns]);

  // Task handlers
  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsTaskSheetOpen(true);
  };

  const handleTaskUpdate = (updatedTask) => {
    setColumns(prevColumns =>
      prevColumns.map(col => ({
        ...col,
        tasks: col.tasks.map(t => t.id === updatedTask.id ? updatedTask : t),
      }))
    );
    setSelectedTask(updatedTask);
    toast.success('Task updated');
  };

  const handleMoveToColumn = (taskId, fromColumnId, toColumnId) => {
    setColumns(prevColumns => {
      const newColumns = [...prevColumns];
      const fromColIndex = newColumns.findIndex(col => col.id === fromColumnId);
      const toColIndex = newColumns.findIndex(col => col.id === toColumnId);

      if (fromColIndex === -1 || toColIndex === -1) return prevColumns;

      const fromCol = { ...newColumns[fromColIndex], tasks: [...newColumns[fromColIndex].tasks] };
      const toCol = { ...newColumns[toColIndex], tasks: [...newColumns[toColIndex].tasks] };

      const taskIndex = fromCol.tasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) return prevColumns;

      const [task] = fromCol.tasks.splice(taskIndex, 1);
      const updatedTask = { ...task, columnId: toColumnId };
      toCol.tasks.push(updatedTask);

      newColumns[fromColIndex] = fromCol;
      newColumns[toColIndex] = toCol;

      // Update selected task if it's the one being moved
      if (selectedTask?.id === taskId) {
        setSelectedTask(updatedTask);
      }

      return newColumns;
    });
    toast.success(`Task moved to ${columns.find(c => c.id === toColumnId)?.title}`);
  };

  const handleTaskDelete = (task) => {
    setColumns(prevColumns =>
      prevColumns.map(col => ({
        ...col,
        tasks: col.tasks.filter(t => t.id !== task.id),
      }))
    );
    toast.success('Task deleted');
  };

  const handleAddTask = (columnId) => {
    setAddToColumnId(columnId);
    setIsAddDialogOpen(true);
  };

  const handleAddNewTask = (newTask) => {
    setColumns(prevColumns =>
      prevColumns.map(col => {
        if (col.id === newTask.columnId) {
          return { ...col, tasks: [...col.tasks, newTask] };
        }
        return col;
      })
    );
    toast.success('Task added successfully');
  };

  const handleClearCompleted = () => {
    setColumns(prevColumns =>
      prevColumns.map(col => {
        if (col.id === 'completed') {
          return { ...col, tasks: [] };
        }
        return col;
      })
    );
    toast.success('Completed tasks cleared');
  };

  const handleRefresh = () => {
    setColumns(mockColumns);
    toast.success('Board refreshed with sample data');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border bg-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Task Board</h1>
            <p className="text-sm text-muted-foreground">Manage patient tasks and workflows</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => handleAddTask('backlog')}>
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>

        {/* Stats */}
        <KanbanStats columns={columns} />

        {/* Filters */}
        <div className="mt-4">
          <KanbanFilters
            filters={filters}
            onFiltersChange={setFilters}
            departments={departments}
            assignees={assignees}
          />
        </div>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <ScrollArea className="flex-1 p-6">
          <div className="flex gap-4 min-w-max pb-4">
            {filteredColumns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                onAddTask={handleAddTask}
                onTaskClick={handleTaskClick}
                onTaskEdit={handleTaskClick}
                onTaskDelete={handleTaskDelete}
                onClearCompleted={handleClearCompleted}
              />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </DragDropContext>

      {/* Task Detail Sheet */}
      <TaskDetailSheet
        task={selectedTask}
        open={isTaskSheetOpen}
        onOpenChange={setIsTaskSheetOpen}
        onUpdate={handleTaskUpdate}
        onMoveToColumn={handleMoveToColumn}
        columns={columns}
      />

      {/* Add Task Dialog */}
      <AddTaskDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddNewTask}
        defaultColumnId={addToColumnId}
      />
    </div>
  );
}
