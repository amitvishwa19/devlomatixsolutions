'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';

import {
  Search,
  Filter,
  Plus,
  LayoutGrid,
  ListFilter,
  Sparkles
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
import { AddKanbanColumnModal } from '../_components/AddKanbanColumnModal';
import { AddKanbanTaskModal } from '../_components/AddKanbanTaskModal';
import { useModal } from "@/hooks/useModal";
import { toast } from "sonner";
import axios from "@/utils/axios";


export default function KanbanPage({ params }) {
  const { workspaceId } = React.use(params);
  const { onOpen } = useModal();
  const [data, setData] = useState({ tasks: {}, columns: {}, columnOrder: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/workspace/${workspaceId}/productivity/kanban`);
      const columns = await response.json();

      if (!Array.isArray(columns)) {
        console.error("Invalid kanban data received", columns);
        setLoading(false);
        return;
      }

      // Transform DB data to board state
      const tasksMap = {};
      const columnsMap = {};
      const columnOrder = [];

      columns.forEach(col => {
        columnsMap[col.id] = {
          id: col.id,
          title: col.title,
          taskIds: col.tasks.sort((a, b) => a.order - b.order).map(t => t.id)
        };
        columnOrder.push(col.id);
        col.tasks.forEach(task => {
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
    } catch (error) {
      console.error("Failed to fetch kanban data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [workspaceId]);

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

      // Persist order change
      try {
        await fetch(`/api/workspace/${workspaceId}/productivity/kanban/tasks/${draggableId}`, {
          method: 'PATCH',
          body: JSON.stringify({
            order: destination.index,
            columnId: start.id
          })
        });
      } catch (error) {
        console.error("Failed to update task order", error);
        setData(oldData);
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

    // Persist column and order change
    try {
      await fetch(`/api/workspace/${workspaceId}/productivity/kanban/tasks/${draggableId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          columnId: finish.id,
          order: destination.index
        })
      });
    } catch (error) {
      console.error("Failed to update task status", error);
      setData(oldData);
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
      await fetch(`/api/workspace/${workspaceId}/productivity/kanban/columns/${columnId}`, {
        method: 'DELETE'
      });
      setData(prev => {
        const newColumns = { ...prev.columns };
        delete newColumns[columnId];
        return {
          ...prev,
          columns: newColumns,
          columnOrder: prev.columnOrder.filter(id => id !== columnId)
        };
      });
    } catch (error) {
      console.error("Failed to delete column", error);
    }
  };

  const onDeleteTask = async (taskId) => {
    try {
      await fetch(`/api/workspace/${workspaceId}/productivity/kanban/tasks/${taskId}`, {
        method: 'DELETE'
      });
      setData(prev => {
        const newTasks = { ...prev.tasks };
        delete newTasks[taskId];
        
        // Also remove from column taskIds
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
    } catch (error) {
      console.error("Failed to delete task", error);
    }
  };

  const onUpdateTask = (taskId, task) => {
    onOpen("addKanbanTask", {
      workspaceId,
      task: data.tasks[taskId],
      onApply: () => fetchData()
    });
  };


  return (
    <div className="absolute inset-0 flex flex-col gap-4 overflow-hidden bg-[#0a0a0b]">
      {/* Dynamic Mesh Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Kanban Modals */}
      <AddKanbanColumnModal />
      <AddKanbanTaskModal />

      {/* Header Section */}
      <div className="relative z-10 flex items-center justify-between p-6 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary shadow-lg shadow-primary/5 border border-primary/20">
              <Sparkles size={20} className="animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl text-foreground font-bold tracking-tight">
                Unified Kanban Board
              </h1>
              <p className="text-[11px] text-muted-foreground font-medium opacity-70">
                Manage your content pipeline and tasks across the entire workspace.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Toolbar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-6 px-6 py-3 mx-6 rounded-2xl bg-card/30 backdrop-blur-md border border-border/40 shadow-xl">
        <div className="flex flex-wrap items-center gap-4 flex-1">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
            <Input
              placeholder="Search tasks, articles, or platforms..."
              className="pl-12 h-10 bg-background/50 border-border/20 focus:ring-1 focus:ring-primary/30 transition-all text-[12px] rounded-xl shadow-inner font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3">
            {/* Type Filter */}
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="h-10 w-[140px] text-[11px] font-bold border-border/20 bg-background/50 rounded-xl hover:bg-background/80 transition-all">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/40 font-bold">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="task">Default Task</SelectItem>
                <SelectItem value="article">Article</SelectItem>
                <SelectItem value="social">Social Post</SelectItem>
                <SelectItem value="note">Note/Draft</SelectItem>
              </SelectContent>
            </Select>

            {/* Priority Filter */}
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="h-10 w-[140px] text-[11px] font-bold border-border/20 bg-background/50 rounded-xl hover:bg-background/80 transition-all">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/40 font-bold">
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>

            {(searchTerm || filterType !== 'all' || filterPriority !== 'all') && (
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                  setFilterPriority('all');
                }}
                className="h-10 px-4 text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all rounded-xl"
              >
                Reset Filters
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            size="sm"
            className="h-10 px-6 text-[11px] font-bold border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-all rounded-xl border-dashed"
            onClick={addColumn}
          >
            <Plus size={16} className="mr-2"/> Add Column
          </Button>
          <Button 
            size="sm"
            className="h-10 px-6 text-[11px] font-bold shadow-lg shadow-primary/30 bg-primary hover:bg-primary/90 transition-all rounded-xl"
            onClick={() => createTask()}
          >
            <Plus size={16} className="mr-2"/> Create Task
          </Button>
        </div>
      </div>

      {/* Kanban Board Area */}
      <ScrollArea className="flex-1 min-h-0 w-full px-6 pb-6 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="h-full pt-4">
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="flex gap-6 h-full min-w-max pb-4">
                {data.columnOrder.map((columnId) => {
                  const column = data.columns[columnId];
                  const tasks = column.taskIds
                    .map((taskId) => data.tasks[taskId])
                    .filter(task => {
                      const matchesSearch = task?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        task?.type?.toLowerCase().includes(searchTerm.toLowerCase());
                      const matchesType = filterType === 'all' || task?.type === filterType;
                      const matchesPriority = filterPriority === 'all' || task?.priority === filterPriority;
                      
                      return matchesSearch && matchesType && matchesPriority;
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
                    />
                  );
                })}

                {/* New Column Placeholder */}
                <div 
                  className="shrink-0 w-80 h-[200px] rounded-2xl border-2 border-dashed border-border/30 flex flex-col items-center justify-center group hover:border-primary/40 transition-all duration-300 bg-card/10 hover:bg-primary/5 cursor-pointer backdrop-blur-sm"
                  onClick={addColumn}
                >
                  <div className="p-3 rounded-xl bg-background/50 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-all duration-300 shadow-sm">
                    <Plus size={24} />
                  </div>
                  <span className="mt-4 text-[12px] font-bold text-muted-foreground group-hover:text-primary transition-colors">
                    Create New Column
                  </span>
                </div>
              </div>
            </DragDropContext>
          </div>
        )}
        <ScrollBar orientation="horizontal" className="bg-muted/50" />
      </ScrollArea>
    </div>
  );
}