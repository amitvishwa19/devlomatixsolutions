'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { DragDropContext } from '@hello-pangea/dnd';

import {
  Search,
  Plus,
  Sparkles,
  RefreshCw,
  Kanban,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ListTodo,
  FilterX
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { KanbanColumn } from '../../productivity/_components/KanbanColumn';
import { KanbanSkeleton } from '../../productivity/_components/KanbanSkeleton';
import { AddKanbanColumnModal } from '../../productivity/_components/AddKanbanColumnModal';
import { AddKanbanTaskModal } from '../../productivity/_components/AddKanbanTaskModal';
import { useModal } from "@/hooks/useModal";
import { toast } from "sonner";
import {
  getKanbanDataAction,
  updateTaskOrderAction,
  deleteKanbanColumnAction,
  deleteKanbanTaskAction
} from '../../productivity/kanban/_actions/kanban-actions';

export default function CrmKanbanPage() {
  const params = useParams();
  const workspaceId = params?.workspaceId;
  const { onOpen } = useModal();

  const [data, setData] = useState({ tasks: {}, columns: {}, columnOrder: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterDueStatus, setFilterDueStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async (showRefreshToast = false) => {
    if (!workspaceId) return;
    try {
      if (showRefreshToast) setIsRefreshing(true);
      else setLoading(true);

      const res = await getKanbanDataAction(workspaceId);

      if (!res?.success || !Array.isArray(res?.columns)) {
        console.error("Failed to fetch CRM kanban data", res?.error);
        if (showRefreshToast) toast.error("Failed to refresh board");
        return;
      }

      const columns = res.columns;
      const tasksMap = {};
      const columnsMap = {};
      const columnOrder = [];

      columns.forEach(col => {
        columnsMap[col.id] = {
          id: col.id,
          title: col.title,
          taskIds: (col.tasks || []).sort((a, b) => a.order - b.order).map(t => t.id)
        };
        columnOrder.push(col.id);
        (col.tasks || []).forEach(task => {
          tasksMap[task.id] = {
            ...task,
          };
        });
      });

      setData({
        tasks: tasksMap,
        columns: columnsMap,
        columnOrder
      });

      if (showRefreshToast) toast.success("CRM board refreshed");
    } catch (error) {
      console.error("Failed to fetch CRM kanban data", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [workspaceId]);

  // Telemetry Metrics
  const metrics = useMemo(() => {
    const allTasks = Object.values(data.tasks);
    const totalTasks = allTasks.length;
    const urgentHighCount = allTasks.filter(t => t.priority === 'urgent' || t.priority === 'high').length;

    const now = new Date();
    const overdueCount = allTasks.filter(t => t.dueDate && new Date(t.dueDate) < now).length;

    let totalChecklistItems = 0;
    let completedChecklistItems = 0;
    allTasks.forEach(t => {
      if (Array.isArray(t.checklists)) {
        totalChecklistItems += t.checklists.length;
        completedChecklistItems += t.checklists.filter(c => c.completed).length;
      }
    });

    return {
      totalTasks,
      urgentHighCount,
      overdueCount,
      checklistProgress: totalChecklistItems > 0 ? Math.round((completedChecklistItems / totalChecklistItems) * 100) : 0,
      totalChecklistItems,
      completedChecklistItems
    };
  }, [data.tasks]);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const start = data.columns[source.droppableId];
    const finish = data.columns[destination.droppableId];
    const oldData = { ...data };

    if (start === finish) {
      const newTaskIds = Array.from(start.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = {
        ...start,
        taskIds: newTaskIds,
      };

      const newState = {
        ...data,
        columns: {
          ...data.columns,
          [newColumn.id]: newColumn,
        },
      };

      setData(newState);

      try {
        await updateTaskOrderAction(draggableId, start.id, destination.index);
      } catch (error) {
        console.error("Failed to update task order", error);
        setData(oldData);
        toast.error("Failed to update task position");
      }
      return;
    }

    // Moving across columns
    const startTaskIds = Array.from(start.taskIds);
    startTaskIds.splice(source.index, 1);
    const newStart = {
      ...start,
      taskIds: startTaskIds,
    };

    const finishTaskIds = Array.from(finish.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);
    const newFinish = {
      ...finish,
      taskIds: finishTaskIds,
    };

    const newState = {
      ...data,
      columns: {
        ...data.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish,
      },
    };

    setData(newState);

    try {
      await updateTaskOrderAction(draggableId, finish.id, destination.index);
    } catch (error) {
      console.error("Failed to update task column", error);
      setData(oldData);
      toast.error("Failed to move task");
    }
  };

  const addColumn = async () => {
    onOpen("addKanbanColumn", {
      workspaceId,
      order: data.columnOrder.length,
      onApply: () => fetchData()
    });
  };

  const createTask = async (columnId) => {
    const targetColumnId = columnId || data.columnOrder[0];
    if (!targetColumnId) {
      toast.error("Please create a column first!");
      return;
    }

    onOpen("addKanbanTask", {
      workspaceId,
      columnId: targetColumnId,
      onApply: () => fetchData()
    });
  };

  const onDeleteColumn = async (columnId) => {
    try {
      await deleteKanbanColumnAction(columnId);
      setData(prev => {
        const newColumns = { ...prev.columns };
        delete newColumns[columnId];
        return {
          ...prev,
          columns: newColumns,
          columnOrder: prev.columnOrder.filter(id => id !== columnId)
        };
      });
      toast.success("Column deleted");
    } catch (error) {
      console.error("Failed to delete column", error);
      toast.error("Failed to delete column");
    }
  };

  const onDeleteTask = async (taskId) => {
    try {
      await deleteKanbanTaskAction(taskId);
      setData(prev => {
        const newTasks = { ...prev.tasks };
        delete newTasks[taskId];

        const newColumns = { ...prev.columns };
        Object.keys(newColumns).forEach(colId => {
          newColumns[colId].taskIds = newColumns[colId].taskIds.filter(id => id !== taskId);
        });

        return {
          ...prev,
          tasks: newTasks,
          columns: newColumns
        };
      });
      toast.success("Task deleted");
    } catch (error) {
      console.error("Failed to delete task", error);
      toast.error("Failed to delete task");
    }
  };

  const onUpdateTask = (taskId) => {
    onOpen("addKanbanTask", {
      workspaceId,
      task: data.tasks[taskId],
      onApply: () => fetchData()
    });
  };

  const hasActiveFilters = searchTerm || filterType !== 'all' || filterPriority !== 'all' || filterDueStatus !== 'all';

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] w-full overflow-hidden bg-background relative">
      {/* Background Glow */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[35%] h-[35%] rounded-full bg-primary/10 blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[35%] h-[35%] rounded-full bg-blue-500/10 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Modals */}
      <AddKanbanColumnModal />
      <AddKanbanTaskModal />

      {/* Top Header & Telemetry Bar */}
      <div className="flex-none p-4 pb-2.5 border-b border-border/40 bg-card/25 backdrop-blur-sm space-y-3 z-10 relative">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Title Area */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-xs shrink-0">
              <Sparkles size={18} className="animate-pulse" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                CRM Kanban Board
              </h1>
              <p className="text-xs text-muted-foreground font-medium opacity-80">
                Manage, organize, and streamline deals and task workflows across your workspace.
              </p>
            </div>
          </div>

          {/* Telemetry Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card/50 border border-border/40 text-xs font-semibold shadow-xs">
              <ListTodo size={14} className="text-primary shrink-0" />
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Total:</span>
              <span className="font-extrabold text-foreground">{metrics.totalTasks}</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card/50 border border-border/40 text-xs font-semibold shadow-xs">
              <AlertTriangle size={14} className="text-amber-500 shrink-0" />
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Urgent:</span>
              <span className="font-extrabold text-amber-500">{metrics.urgentHighCount}</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card/50 border border-border/40 text-xs font-semibold shadow-xs">
              <Clock size={14} className={metrics.overdueCount > 0 ? "text-rose-500 animate-pulse shrink-0" : "text-muted-foreground shrink-0"} />
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Overdue:</span>
              <span className={`font-extrabold ${metrics.overdueCount > 0 ? 'text-rose-500' : 'text-foreground'}`}>
                {metrics.overdueCount}
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card/50 border border-border/40 text-xs font-semibold shadow-xs">
              <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Checklists:</span>
              <span className="font-extrabold text-emerald-500">{metrics.checklistProgress}%</span>
            </div>
          </div>
        </div>

        {/* Filter Controls & Actions Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Filters Cluster */}
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
            {/* Search */}
            <div className="relative w-full sm:w-56 md:w-64 group shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={14} />
              <Input
                placeholder="Search tasks, content, tags..."
                className="pl-9 h-8 bg-background/50 border-border/40 text-xs rounded-lg font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Type Filter */}
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="h-8 w-[105px] text-xs font-bold border-border/40 bg-background/50 rounded-lg">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent className="rounded-lg font-medium">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="task">Task</SelectItem>
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="social">Social Post</SelectItem>
                  <SelectItem value="note">Note/Draft</SelectItem>
                </SelectContent>
              </Select>

              {/* Priority Filter */}
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="h-8 w-[105px] text-xs font-bold border-border/40 bg-background/50 rounded-lg">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent className="rounded-lg font-medium">
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              {/* Due Date Filter */}
              <Select value={filterDueStatus} onValueChange={setFilterDueStatus}>
                <SelectTrigger className="h-8 w-[105px] text-xs font-bold border-border/40 bg-background/50 rounded-lg">
                  <SelectValue placeholder="Due Date" />
                </SelectTrigger>
                <SelectContent className="rounded-lg font-medium">
                  <SelectItem value="all">Any Date</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="dueToday">Due Today</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterType('all');
                    setFilterPriority('all');
                    setFilterDueStatus('all');
                  }}
                  className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground rounded-lg gap-1 font-semibold"
                >
                  <FilterX size={13} /> Reset
                </Button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fetchData(true)}
              disabled={isRefreshing || loading}
              className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg"
              title="Refresh CRM Board"
            >
              <RefreshCw size={14} className={isRefreshing ? "animate-spin text-primary" : ""} />
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs font-bold border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-all rounded-lg border-dashed"
              onClick={addColumn}
            >
              <Plus size={14} className="mr-1" /> Add Stage
            </Button>

            <Button
              size="sm"
              className="h-8 px-3 text-xs font-bold shadow-md shadow-primary/20 bg-primary hover:bg-primary/90 transition-all rounded-lg"
              onClick={() => createTask()}
            >
              <Plus size={14} className="mr-1" /> Create Task
            </Button>
          </div>
        </div>
      </div>

      {/* Main Kanban Board Scroll Area */}
      <div
        className="flex-1 min-h-0 w-full overflow-x-auto overflow-y-hidden p-4"
        style={{ scrollbarWidth: 'thin' }}
      >
        {loading ? (
          <KanbanSkeleton />
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-4 h-full items-start">
              {data.columnOrder.map((columnId) => {
                const column = data.columns[columnId];
                if (!column) return null;

                const tasks = (column.taskIds || [])
                  .map((taskId) => data.tasks[taskId])
                  .filter(task => {
                    if (!task) return false;

                    const matchesSearch = !searchTerm ||
                      task?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      task?.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      task?.type?.toLowerCase().includes(searchTerm.toLowerCase());

                    const matchesType = filterType === 'all' || task?.type === filterType;
                    const matchesPriority = filterPriority === 'all' || task?.priority === filterPriority;

                    let matchesDue = true;
                    if (filterDueStatus === 'overdue') {
                      matchesDue = task.dueDate && new Date(task.dueDate) < new Date();
                    } else if (filterDueStatus === 'dueToday') {
                      if (!task.dueDate) matchesDue = false;
                      else {
                        const due = new Date(task.dueDate);
                        const today = new Date();
                        matchesDue = due.toDateString() === today.toDateString();
                      }
                    }

                    return matchesSearch && matchesType && matchesPriority && matchesDue;
                  });

                return (
                  <KanbanColumn
                    key={column.id}
                    column={column}
                    tasks={tasks}
                    onCreateTask={() => createTask(column.id)}
                    onDeleteColumn={onDeleteColumn}
                    onDeleteTask={onDeleteTask}
                    onUpdateTask={onUpdateTask}
                    onRefresh={fetchData}
                  />
                );
              })}

              {/* Add Stage Card Placeholder */}
              <div
                className="shrink-0 w-72 h-[220px] rounded-2xl border-2 border-dashed border-border/40 flex flex-col items-center justify-center group hover:border-primary/50 transition-all duration-300 bg-card/10 hover:bg-primary/5 cursor-pointer backdrop-blur-sm shadow-xs"
                onClick={addColumn}
              >
                <div className="p-3 rounded-xl bg-background/60 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-all duration-300 shadow-sm border border-border/20">
                  <Plus size={20} />
                </div>
                <span className="mt-3 text-xs font-bold text-muted-foreground group-hover:text-primary transition-colors">
                  Create New Stage
                </span>
                <span className="text-[10px] text-muted-foreground/60 mt-0.5 font-medium">
                  Add a pipeline stage to your board
                </span>
              </div>

              {/* Trailing Spacer ensuring complete horizontal scroll clearance */}
              <div className="shrink-0 w-16 h-full pointer-events-none" aria-hidden="true" />
            </div>
          </DragDropContext>
        )}
      </div>
    </div>
  );
}
