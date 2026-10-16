'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { DragDropContext } from '@hello-pangea/dnd';

import {
  Search,
  Plus,
  Sparkles,
  RefreshCw,
  Columns,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ListTodo,
  FilterX,
  Layers,
  FolderPlus
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
import { toast } from "sonner";

import { CrmKanbanColumn } from './_components/CrmKanbanColumn';
import { CreateCrmTaskModal } from './_components/CreateCrmTaskModal';
import { CreateStageModal } from './_components/CreateStageModal';

import {
  getKanbanDataAction,
  updateTaskOrderAction,
  deleteKanbanColumnAction,
  deleteKanbanTaskAction,
  updateKanbanColumnAction
} from '../../productivity/kanban/_actions/kanban-actions';

export default function CrmKanbanPage() {
  const params = useParams();
  const workspaceId = params?.workspaceId;

  // Board Data State
  const [columnsMap, setColumnsMap] = useState({});
  const [tasksMap, setTasksMap] = useState({});
  const [columnOrder, setColumnOrder] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterDueStatus, setFilterDueStatus] = useState('all');

  // Modals State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedColumnIdForTask, setSelectedColumnIdForTask] = useState(null);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [isStageModalOpen, setIsStageModalOpen] = useState(false);

  // Fetch Board Data
  const fetchData = useCallback(async (showToast = false) => {
    if (!workspaceId) return;
    try {
      if (showToast) setIsRefreshing(true);
      else setLoading(true);

      const res = await getKanbanDataAction(workspaceId);

      if (!res?.success || !Array.isArray(res?.columns)) {
        console.error("Failed to load CRM kanban data", res?.error);
        if (showToast) toast.error("Failed to refresh board");
        return;
      }

      const cols = {};
      const tasks = {};
      const order = [];

      res.columns.forEach((col) => {
        cols[col.id] = {
          id: col.id,
          title: col.title,
          order: col.order,
          taskIds: (col.tasks || []).sort((a, b) => a.order - b.order).map(t => t.id)
        };
        order.push(col.id);

        (col.tasks || []).forEach((t) => {
          tasks[t.id] = t;
        });
      });

      setColumnsMap(cols);
      setTasksMap(tasks);
      setColumnOrder(order);

      if (showToast) toast.success("CRM Board refreshed");
    } catch (err) {
      console.error("Error loading CRM board", err);
      if (showToast) toast.error("Error fetching board data");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derived array of columns
  const allColumnsList = useMemo(() => {
    return columnOrder.map(id => columnsMap[id]).filter(Boolean);
  }, [columnOrder, columnsMap]);

  // Live Telemetry Metrics
  const metrics = useMemo(() => {
    const tasks = Object.values(tasksMap);
    const total = tasks.length;
    const urgentHigh = tasks.filter(t => t.priority === 'urgent' || t.priority === 'high').length;
    const now = new Date();
    const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < now).length;

    let totalChecklists = 0;
    let completedChecklists = 0;
    tasks.forEach(t => {
      if (Array.isArray(t.checklists)) {
        totalChecklists += t.checklists.length;
        completedChecklists += t.checklists.filter(c => c.completed).length;
      }
    });

    return {
      total,
      urgentHigh,
      overdue,
      checklistProgress: totalChecklists > 0 ? Math.round((completedChecklists / totalChecklists) * 100) : 0
    };
  }, [tasksMap]);

  // Filter Tasks Predicate
  const isTaskVisible = useCallback((task) => {
    if (!task) return false;

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = task.title?.toLowerCase().includes(q);
      const matchContent = task.content?.toLowerCase().includes(q);
      const matchType = task.type?.toLowerCase().includes(q);
      if (!matchTitle && !matchContent && !matchType) return false;
    }

    // Type filter
    if (filterType !== 'all' && task.type !== filterType) return false;

    // Priority filter
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;

    // Due date filter
    if (filterDueStatus === 'overdue') {
      if (!task.dueDate || new Date(task.dueDate) >= new Date()) return false;
    } else if (filterDueStatus === 'dueToday') {
      if (!task.dueDate) return false;
      const due = new Date(task.dueDate).toDateString();
      const today = new Date().toDateString();
      if (due !== today) return false;
    }

    return true;
  }, [searchTerm, filterType, filterPriority, filterDueStatus]);

  // Drag & Drop Handler
  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const sourceCol = columnsMap[source.droppableId];
    const destCol = columnsMap[destination.droppableId];

    if (!sourceCol || !destCol) return;

    // Snapshot for rollback
    const prevColumns = { ...columnsMap };
    const prevTasks = { ...tasksMap };

    // Same column move
    if (sourceCol.id === destCol.id) {
      const newTaskIds = Array.from(sourceCol.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      setColumnsMap(prev => ({
        ...prev,
        [sourceCol.id]: {
          ...sourceCol,
          taskIds: newTaskIds
        }
      }));

      try {
        await updateTaskOrderAction(draggableId, sourceCol.id, destination.index);
      } catch (err) {
        console.error("Failed to reorder task", err);
        setColumnsMap(prevColumns);
        toast.error("Failed to reorder task");
      }
      return;
    }

    // Across column move
    const sourceTaskIds = Array.from(sourceCol.taskIds);
    sourceTaskIds.splice(source.index, 1);

    const destTaskIds = Array.from(destCol.taskIds);
    destTaskIds.splice(destination.index, 0, draggableId);

    setColumnsMap(prev => ({
      ...prev,
      [sourceCol.id]: {
        ...sourceCol,
        taskIds: sourceTaskIds
      },
      [destCol.id]: {
        ...destCol,
        taskIds: destTaskIds
      }
    }));

    setTasksMap(prev => ({
      ...prev,
      [draggableId]: {
        ...prev[draggableId],
        columnId: destCol.id
      }
    }));

    try {
      await updateTaskOrderAction(draggableId, destCol.id, destination.index);
    } catch (err) {
      console.error("Failed to move task across stages", err);
      setColumnsMap(prevColumns);
      setTasksMap(prevTasks);
      toast.error("Failed to move task to new stage");
    }
  };

  // Stage Handlers
  const handleRenameColumn = async (columnId, newTitle) => {
    try {
      const res = await updateKanbanColumnAction(columnId, newTitle);
      if (!res.success) throw new Error(res.error);
      setColumnsMap(prev => ({
        ...prev,
        [columnId]: { ...prev[columnId], title: newTitle }
      }));
      toast.success("Stage renamed");
    } catch (err) {
      console.error("Failed to rename stage", err);
      toast.error("Failed to rename stage");
    }
  };

  const handleDeleteColumn = async (columnId) => {
    try {
      await deleteKanbanColumnAction(columnId);
      setColumnsMap(prev => {
        const copy = { ...prev };
        delete copy[columnId];
        return copy;
      });
      setColumnOrder(prev => prev.filter(id => id !== columnId));
      toast.success("Stage deleted");
    } catch (err) {
      console.error("Failed to delete stage", err);
      toast.error("Failed to delete stage");
    }
  };

  // Task Handlers
  const handleDeleteTask = async (taskId) => {
    try {
      await deleteKanbanTaskAction(taskId);
      setTasksMap(prev => {
        const copy = { ...prev };
        delete copy[taskId];
        return copy;
      });
      setColumnsMap(prev => {
        const updated = {};
        Object.keys(prev).forEach(colId => {
          updated[colId] = {
            ...prev[colId],
            taskIds: prev[colId].taskIds.filter(id => id !== taskId)
          };
        });
        return updated;
      });
      toast.success("Task deleted");
    } catch (err) {
      console.error("Failed to delete task", err);
      toast.error("Failed to delete task");
    }
  };

  const handleOpenCreateTask = (columnId = null) => {
    setSelectedColumnIdForTask(columnId || columnOrder[0] || null);
    setTaskToEdit(null);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTask = (task) => {
    setTaskToEdit(task);
    setSelectedColumnIdForTask(task.columnId);
    setIsTaskModalOpen(true);
  };

  const handleMoveToColumn = async (taskId, targetColumnId) => {
    const task = tasksMap[taskId];
    if (!task || task.columnId === targetColumnId) return;

    const sourceCol = columnsMap[task.columnId];
    const destCol = columnsMap[targetColumnId];
    if (!sourceCol || !destCol) return;

    setColumnsMap(prev => ({
      ...prev,
      [sourceCol.id]: {
        ...sourceCol,
        taskIds: sourceCol.taskIds.filter(id => id !== taskId)
      },
      [destCol.id]: {
        ...destCol,
        taskIds: [...destCol.taskIds, taskId]
      }
    }));

    setTasksMap(prev => ({
      ...prev,
      [taskId]: { ...prev[taskId], columnId: targetColumnId }
    }));

    try {
      await updateTaskOrderAction(taskId, targetColumnId, destCol.taskIds.length);
      toast.success(`Moved to ${destCol.title}`);
    } catch (err) {
      console.error("Failed to move task", err);
      fetchData();
      toast.error("Failed to move task");
    }
  };

  const hasActiveFilters = searchTerm || filterType !== 'all' || filterPriority !== 'all' || filterDueStatus !== 'all';

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] w-full max-w-full min-w-0 overflow-hidden bg-background relative">
      {/* Background Glow */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[35%] h-[35%] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[35%] h-[35%] rounded-full bg-blue-500/10 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Modals */}
      <CreateCrmTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        workspaceId={workspaceId}
        columns={allColumnsList}
        defaultColumnId={selectedColumnIdForTask}
        taskToEdit={taskToEdit}
        onSuccess={fetchData}
      />

      <CreateStageModal
        isOpen={isStageModalOpen}
        onClose={() => setIsStageModalOpen(false)}
        workspaceId={workspaceId}
        order={columnOrder.length}
        onSuccess={fetchData}
      />

      {/* Top Header & Telemetry Bar */}
      <div className="flex-none p-4 pb-2.5 border-b border-border/40 bg-card/25 backdrop-blur-sm space-y-3 z-10 relative max-w-full min-w-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Title Area */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-xs shrink-0">
              <Sparkles size={18} className="animate-pulse" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2 truncate">
                CRM Sales & Task Kanban
              </h1>
              <p className="text-xs text-muted-foreground font-medium opacity-80 truncate">
                Track deals, client follow-ups, and pipeline stages across your workspace.
              </p>
            </div>
          </div>

          {/* Telemetry Pills */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card/50 border border-border/40 text-xs font-semibold shadow-xs">
              <ListTodo size={14} className="text-primary shrink-0" />
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Total:</span>
              <span className="font-extrabold text-foreground">{metrics.total}</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card/50 border border-border/40 text-xs font-semibold shadow-xs">
              <AlertTriangle size={14} className="text-amber-500 shrink-0" />
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Urgent/High:</span>
              <span className="font-extrabold text-amber-500">{metrics.urgentHigh}</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card/50 border border-border/40 text-xs font-semibold shadow-xs">
              <Clock size={14} className={metrics.overdue > 0 ? "text-rose-500 animate-pulse shrink-0" : "text-muted-foreground shrink-0"} />
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Overdue:</span>
              <span className={`font-extrabold ${metrics.overdue > 0 ? 'text-rose-500' : 'text-foreground'}`}>
                {metrics.overdue}
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card/50 border border-border/40 text-xs font-semibold shadow-xs">
              <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Checklists:</span>
              <span className="font-extrabold text-emerald-500">{metrics.checklistProgress}%</span>
            </div>
          </div>
        </div>

        {/* Filter Controls & Actions Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 max-w-full min-w-0">
          {/* Filters Cluster */}
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
            {/* Search Input */}
            <div className="relative w-full sm:w-56 md:w-64 group shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={14} />
              <Input
                placeholder="Search deals, tasks, tags..."
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
                  <SelectItem value="deal">Deal</SelectItem>
                  <SelectItem value="follow-up">Follow-up</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="note">Note / Draft</SelectItem>
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
              onClick={() => setIsStageModalOpen(true)}
            >
              <Plus size={14} className="mr-1" /> Add Stage
            </Button>

            <Button
              size="sm"
              className="h-8 px-3.5 text-xs font-bold shadow-md shadow-primary/20 bg-primary hover:bg-primary/90 transition-all rounded-lg"
              onClick={() => handleOpenCreateTask()}
            >
              <Plus size={14} className="mr-1" /> New Task
            </Button>
          </div>
        </div>
      </div>

      {/* Main Board Horizontal Scroll Area */}
      <div
        className="flex-1 min-h-0 min-w-0 w-full max-w-full overflow-x-auto overflow-y-hidden p-4"
        style={{ scrollbarWidth: 'thin' }}
      >
        {loading ? (
          <div className="flex gap-4 h-full items-start">
            {[...Array(4)].map((_, idx) => (
              <div
                key={idx}
                className="shrink-0 w-80 h-full rounded-2xl bg-card/20 border border-border/30 p-4 space-y-3 animate-pulse"
              >
                <div className="h-5 w-28 bg-muted/60 rounded-md" />
                <div className="h-28 bg-muted/30 rounded-xl" />
                <div className="h-28 bg-muted/30 rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex gap-4 h-full items-start">
              {columnOrder.map((colId) => {
                const column = columnsMap[colId];
                if (!column) return null;

                const columnTasks = (column.taskIds || [])
                  .map(taskId => tasksMap[taskId])
                  .filter(Boolean)
                  .filter(isTaskVisible);

                return (
                  <CrmKanbanColumn
                    key={column.id}
                    column={column}
                    tasks={columnTasks}
                    onCreateTask={(colId) => handleOpenCreateTask(colId)}
                    onRenameColumn={handleRenameColumn}
                    onDeleteColumn={handleDeleteColumn}
                    onEditTask={handleOpenEditTask}
                    onDeleteTask={handleDeleteTask}
                    allColumns={allColumnsList}
                    onMoveToColumn={handleMoveToColumn}
                  />
                );
              })}

              {/* Add Stage Card Placeholder */}
              <div
                className="shrink-0 w-72 h-[220px] rounded-2xl border-2 border-dashed border-border/40 hover:border-primary/50 flex flex-col items-center justify-center group transition-all duration-300 bg-card/10 hover:bg-primary/5 cursor-pointer backdrop-blur-sm shadow-xs"
                onClick={() => setIsStageModalOpen(true)}
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
              <div className="shrink-0 w-24 h-full pointer-events-none" aria-hidden="true" />
            </div>
          </DragDropContext>
        )}
      </div>
    </div>
  );
}
