'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { KanbanColumn } from '../_components/KanbanColumn';
import { KanbanSkeleton } from '../_components/KanbanSkeleton';
import { AddKanbanColumnModal } from '../_components/AddKanbanColumnModal';
import { AddKanbanTaskModal } from '../_components/AddKanbanTaskModal';
import { useModal } from "@/hooks/useModal";
import { toast } from "sonner";
import {
  getKanbanDataAction,
  updateTaskOrderAction,
  deleteKanbanColumnAction,
  deleteKanbanTaskAction
} from './_actions/kanban-actions';

export default function KanbanPage({ params }) {
  const { workspaceId } = React.use(params);
  const { onOpen } = useModal();
  const [data, setData] = useState({ tasks: {}, columns: {}, columnOrder: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterDueStatus, setFilterDueStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) setIsRefreshing(true);
      else setLoading(true);

      const res = await getKanbanDataAction(workspaceId);

      if (!res?.success || !Array.isArray(res?.columns)) {
        console.error("Failed to fetch kanban data", res?.error);
        if (showRefreshToast) toast.error("Failed to refresh board");
        return;
      }

      const columns = res.columns;

      // Transform DB data to board state
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

      if (showRefreshToast) toast.success("Board refreshed");
    } catch (error) {
      console.error("Failed to fetch kanban data", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [workspaceId]);

  // Compute Metrics Overview
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

    // Optimistic UI update
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

      // Persist order change via Server Action
      try {
        await updateTaskOrderAction(draggableId, start.id, destination.index);
      } catch (error) {
        console.error("Failed to update task order", error);
        setData(oldData);
        toast.error("Failed to update task position");
      }
      return;
    }

    // Moving from one list to another
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

    // Persist column and order change via Server Action
    try {
      await updateTaskOrderAction(draggableId, finish.id, destination.index);
    } catch (error) {
      console.error("Failed to update task status", error);
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
    <div className="absolute inset-0 flex flex-col gap-3 overflow-hidden">
      {/* Background Glow Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Modals */}
      <AddKanbanColumnModal />
      <AddKanbanTaskModal />

      {/* Top Header Section with Metrics */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 px-6 pt-4 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary shadow-lg shadow-primary/5 border border-primary/20">
              <Sparkles size={20} className="animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg text-foreground font-bold flex items-center gap-2">
                Kanban Productivity Board
              </h1>
              <p className="text-xs text-muted-foreground font-medium opacity-75">
                Organize, track, and streamline tasks and workflows across your workspace.
              </p>
            </div>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card/40 backdrop-blur-md border border-border/40 shadow-xs">
            <ListTodo size={16} className="text-primary" />
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Total Tasks</span>
              <span className="text-sm font-extrabold text-foreground leading-none">{metrics.totalTasks}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card/40 backdrop-blur-md border border-border/40 shadow-xs">
            <AlertTriangle size={16} className="text-amber-500" />
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">High/Urgent</span>
              <span className="text-sm font-extrabold text-amber-500 leading-none">{metrics.urgentHighCount}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card/40 backdrop-blur-md border border-border/40 shadow-xs">
            <Clock size={16} className={metrics.overdueCount > 0 ? "text-rose-500 animate-pulse" : "text-muted-foreground"} />
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Overdue</span>
              <span className={`text-sm font-extrabold leading-none ${metrics.overdueCount > 0 ? 'text-rose-500' : 'text-foreground'}`}>
                {metrics.overdueCount}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card/40 backdrop-blur-md border border-border/40 shadow-xs">
            <CheckCircle2 size={16} className="text-emerald-500" />
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Checklists</span>
              <span className="text-sm font-extrabold text-emerald-500 leading-none">{metrics.checklistProgress}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar Section */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 px-6 py-2.5 mx-6 rounded-2xl bg-card/30 backdrop-blur-md border border-border/40 shadow-xl">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Box */}
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={15} />
            <Input
              placeholder="Search tasks, content, or tags..."
              className="pl-10 h-9 bg-background/50 border-border/30 focus:ring-1 focus:ring-primary/40 transition-all text-xs rounded-xl shadow-inner font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Type Filter */}
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="h-9 w-[130px] text-xs font-bold border-border/30 bg-background/50 rounded-xl hover:bg-background/80 transition-all">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/40 font-bold">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="task">Task</SelectItem>
                <SelectItem value="article">Article</SelectItem>
                <SelectItem value="social">Social Post</SelectItem>
                <SelectItem value="note">Note/Draft</SelectItem>
              </SelectContent>
            </Select>

            {/* Priority Filter */}
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="h-9 w-[130px] text-xs font-bold border-border/30 bg-background/50 rounded-xl hover:bg-background/80 transition-all">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/40 font-bold">
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            {/* Due Status Filter */}
            <Select value={filterDueStatus} onValueChange={setFilterDueStatus}>
              <SelectTrigger className="h-9 w-[130px] text-xs font-bold border-border/30 bg-background/50 rounded-xl hover:bg-background/80 transition-all">
                <SelectValue placeholder="Due Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/40 font-bold">
                <SelectItem value="all">Any Due Date</SelectItem>
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
                className="h-9 px-3 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all rounded-xl gap-1.5 font-semibold"
              >
                <FilterX size={14} /> Reset
              </Button>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fetchData(true)}
            disabled={isRefreshing || loading}
            className="h-9 w-9 text-muted-foreground hover:text-foreground rounded-xl"
            title="Refresh Board"
          >
            <RefreshCw size={15} className={isRefreshing ? "animate-spin text-primary" : ""} />
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-9 px-4 text-xs font-bold border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-all rounded-xl border-dashed"
            onClick={addColumn}
          >
            <Plus size={15} className="mr-1.5" /> Add Column
          </Button>

          <Button
            size="sm"
            className="h-9 px-4 text-xs font-bold shadow-lg shadow-primary/25 bg-primary hover:bg-primary/90 transition-all rounded-xl"
            onClick={() => createTask()}
          >
            <Plus size={15} className="mr-1.5" /> Create Task
          </Button>
        </div>
      </div>

      {/* Kanban Board Container */}
      <ScrollArea className="flex-1 min-h-0 w-full px-6 pb-6 overflow-hidden">
        {loading ? (
          <KanbanSkeleton />
        ) : (
          <div className="h-full pt-3">
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="flex gap-6 h-full min-w-max pb-4">
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

                {/* Create Column Card Placeholder */}
                <div
                  className="shrink-0 w-80 h-[220px] rounded-2xl border-2 border-dashed border-border/30 flex flex-col items-center justify-center group hover:border-primary/50 transition-all duration-300 bg-card/10 hover:bg-primary/5 cursor-pointer backdrop-blur-sm shadow-xs"
                  onClick={addColumn}
                >
                  <div className="p-3 rounded-xl bg-background/60 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-all duration-300 shadow-sm border border-border/20">
                    <Plus size={22} />
                  </div>
                  <span className="mt-3 text-xs font-bold text-muted-foreground group-hover:text-primary transition-colors">
                    Create New Column
                  </span>
                  <span className="text-[10px] text-muted-foreground/50 mt-0.5 font-medium">
                    Add a stage to your board
                  </span>
                </div>
              </div>
            </DragDropContext>
          </div>
        )}
        <ScrollBar orientation="horizontal" className="bg-muted/30" />
      </ScrollArea>
    </div>
  );
}