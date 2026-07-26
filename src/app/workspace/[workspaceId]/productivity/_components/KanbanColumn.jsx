'use client';

import React, { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Plus, MoreVertical, Edit, Trash2, Check, X, Layers } from 'lucide-react';
import { KanbanCard } from './KanbanCard';
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { updateKanbanColumnAction } from '../kanban/_actions/kanban-actions';

export const KanbanColumn = ({ column, tasks, onCreateTask, onDeleteColumn, onDeleteTask, onUpdateTask, onRefresh }) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(column.title);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleRenameColumn = async () => {
    if (!titleInput.trim() || titleInput === column.title) {
      setIsEditingTitle(false);
      return;
    }

    try {
      setIsUpdating(true);
      const res = await updateKanbanColumnAction(column.id, titleInput.trim());
      if (!res.success) throw new Error(res.error);
      toast.success("Column renamed");
      setIsEditingTitle(false);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Failed to rename column", error);
      toast.error("Failed to update column name");
      setTitleInput(column.title);
    } finally {
      setIsUpdating(false);
    }
  };

  const urgentCount = tasks.filter(t => t.priority === 'urgent' || t.priority === 'high').length;

  return (
    <div className="shrink-0 w-80 h-full flex flex-col bg-card/25 backdrop-blur-md rounded-2xl border border-border/40 overflow-hidden shadow-xl transition-all duration-300 hover:shadow-primary/5 group/col">
      {/* Top Accent Line */}
      <div className="h-1 w-full bg-linear-to-r from-primary/60 via-primary to-primary/40 opacity-80" />

      {/* Column Header */}
      <div className="p-4 flex items-center justify-between border-b border-border/20 bg-muted/5 relative">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-xs shrink-0">
            <span className="text-[10px] font-extrabold text-primary">
              {tasks.length}
            </span>
          </div>

          {isEditingTitle ? (
            <div className="flex items-center gap-1 flex-1">
              <Input
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                className="h-7 text-xs font-bold bg-background/80 px-2 py-0"
                autoFocus
                disabled={isUpdating}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRenameColumn();
                  if (e.key === 'Escape') {
                    setIsEditingTitle(false);
                    setTitleInput(column.title);
                  }
                }}
              />
              <button 
                onClick={handleRenameColumn}
                className="p-1 rounded-md bg-primary text-primary-foreground hover:opacity-90"
              >
                <Check size={12} />
              </button>
              <button 
                onClick={() => { setIsEditingTitle(false); setTitleInput(column.title); }}
                className="p-1 rounded-md bg-muted hover:bg-muted/80 text-muted-foreground"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <div className="min-w-0 flex-1">
              <h3 
                className="text-[13px] font-bold text-foreground/90 tracking-tight group-hover/col:text-primary transition-colors truncate cursor-pointer"
                onClick={() => setIsEditingTitle(true)}
                title="Click to rename"
              >
                {column.title}
              </h3>
              {urgentCount > 0 && (
                <p className="text-[9px] text-amber-500 font-semibold truncate">
                  {urgentCount} high priority task{urgentCount > 1 ? 's' : ''}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Header Action Menu */}
        <div className="flex items-center gap-1 opacity-0 group-hover/col:opacity-100 transition-all duration-300">
          <button 
            className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
            onClick={onCreateTask}
            title="Quick Add Task"
          >
            <Plus size={14} />
          </button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1.5 rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-all">
                <MoreVertical size={14} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 p-1 rounded-xl shadow-xl border-border/40">
              <DropdownMenuItem onClick={() => setIsEditingTitle(true)} className="rounded-lg text-xs font-semibold gap-2">
                <Edit size={14} className="text-primary" />
                Rename Stage
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onCreateTask} className="rounded-lg text-xs font-semibold gap-2">
                <Plus size={14} className="text-muted-foreground" />
                Add New Task
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => {
                  if (confirm(`Delete column "${column.title}" and all its tasks?`)) {
                    onDeleteColumn(column.id);
                  }
                }} 
                className="rounded-lg text-xs font-semibold gap-2 text-rose-500 focus:bg-rose-500/10 focus:text-rose-500"
              >
                <Trash2 size={14} />
                Delete Column
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tasks List Droppable Area */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "flex-1 p-3 overflow-y-auto min-h-[220px] transition-colors duration-200 scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent custom-scrollbar",
              snapshot.isDraggingOver && "bg-primary/5 rounded-b-2xl"
            )}
          >
            <div className="space-y-1 min-h-full">
              {tasks.map((task, index) => (
                <KanbanCard 
                  key={task.id} 
                  task={task} 
                  index={index} 
                  onDeleteTask={onDeleteTask}
                  onUpdateTask={onUpdateTask}
                  onChecklistToggle={onRefresh}
                />
              ))}

              {tasks.length === 0 && !snapshot.isDraggingOver && (
                <div 
                  className="h-32 border-2 border-dashed border-border/20 rounded-xl flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-all group/empty"
                  onClick={onCreateTask}
                >
                  <Layers size={20} className="text-muted-foreground/40 group-hover/empty:text-primary transition-colors mb-1.5" />
                  <span className="text-[11px] font-bold text-muted-foreground/60 group-hover/empty:text-primary transition-colors">
                    No tasks in {column.title}
                  </span>
                  <span className="text-[9px] text-muted-foreground/40 mt-0.5">
                    Click to add a task
                  </span>
                </div>
              )}
            </div>
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* Column Footer */}
      <div className="p-3 bg-muted/5 border-t border-border/20">
        <button 
          className="w-full py-2.5 flex items-center justify-center gap-2 text-[11px] font-bold text-muted-foreground hover:text-primary transition-all group/add rounded-xl bg-background/20 hover:bg-primary/5 border border-transparent hover:border-primary/20"
          onClick={onCreateTask}
        >
          <Plus size={14} className="group-hover/add:rotate-90 transition-transform duration-300 text-primary"/> 
          <span>Add Task</span>
        </button>
      </div>
    </div>
  );
};