'use client';

import React, { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import {
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  Check,
  X,
  AlertTriangle,
  FolderPlus
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CrmKanbanCard } from './CrmKanbanCard';
import { cn } from "@/lib/utils";

export const CrmKanbanColumn = ({
  column,
  tasks = [],
  onCreateTask,
  onRenameColumn,
  onDeleteColumn,
  onEditTask,
  onDeleteTask,
  allColumns = [],
  onMoveToColumn
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [titleValue, setTitleValue] = useState(column.title);

  const handleSaveRename = () => {
    if (!titleValue.trim() || titleValue === column.title) {
      setIsEditing(false);
      return;
    }
    onRenameColumn && onRenameColumn(column.id, titleValue.trim());
    setIsEditing(false);
  };

  const urgentCount = tasks.filter(t => t.priority === 'urgent' || t.priority === 'high').length;

  return (
    <div className="shrink-0 w-80 h-full max-h-full flex flex-col rounded-2xl bg-card/40 border border-border/50 backdrop-blur-md shadow-lg shadow-black/5 overflow-hidden">
      {/* Top Accent Header Line */}
      <div className="h-1 w-full bg-linear-to-r from-primary/70 via-primary to-blue-500/70" />

      {/* Column Header */}
      <div className="p-3.5 flex items-center justify-between border-b border-border/30 bg-muted/10 gap-2 shrink-0">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Task count pill */}
          <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-extrabold flex items-center justify-center shrink-0">
            {tasks.length}
          </span>

          {/* Title or Inline Edit Input */}
          {isEditing ? (
            <div className="flex items-center gap-1 flex-1 min-w-0">
              <Input
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveRename();
                  if (e.key === 'Escape') {
                    setTitleValue(column.title);
                    setIsEditing(false);
                  }
                }}
                className="h-7 text-xs font-bold py-0 px-2 bg-background border-primary/40 rounded-md"
              />
              <button
                type="button"
                onClick={handleSaveRename}
                className="h-6 w-6 rounded flex items-center justify-center text-emerald-500 hover:bg-emerald-500/10"
              >
                <Check size={13} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setTitleValue(column.title);
                  setIsEditing(false);
                }}
                className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:bg-muted/30"
              >
                <X size={13} />
              </button>
            </div>
          ) : (
            <h3
              onDoubleClick={() => setIsEditing(true)}
              className="text-xs font-bold text-foreground truncate cursor-pointer hover:text-primary transition-colors flex-1"
              title="Double-click to rename"
            >
              {column.title}
            </h3>
          )}

          {/* Urgent Tasks alert pill */}
          {urgentCount > 0 && !isEditing && (
            <span
              className="flex items-center gap-1 text-[9px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-full shrink-0"
              title={`${urgentCount} urgent/high priority`}
            >
              <AlertTriangle size={10} />
              <span>{urgentCount}</span>
            </span>
          )}
        </div>

        {/* Quick Add & Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onCreateTask && onCreateTask(column.id)}
            className="h-6 w-6 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            title="Add task to stage"
          >
            <Plus size={14} />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
              >
                <MoreVertical size={13} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 text-xs font-medium">
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Edit2 size={13} className="mr-2 text-muted-foreground" /> Rename Stage
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDeleteColumn && onDeleteColumn(column.id)}
                className="text-rose-500 focus:text-rose-500 focus:bg-rose-500/10"
              >
                <Trash2 size={13} className="mr-2" /> Delete Stage
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Droppable Task Cards Container */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "flex-1 min-h-0 overflow-y-auto p-2.5 space-y-2.5 transition-colors duration-200",
              snapshot.isDraggingOver ? "bg-primary/5" : "bg-transparent"
            )}
            style={{ scrollbarWidth: 'thin' }}
          >
            {tasks.length === 0 ? (
              <div
                onClick={() => onCreateTask && onCreateTask(column.id)}
                className="h-28 rounded-xl border border-dashed border-border/40 hover:border-primary/40 bg-muted/5 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer text-muted-foreground/60 hover:text-primary group"
              >
                <FolderPlus size={18} className="transition-transform group-hover:scale-110" />
                <span className="text-[11px] font-semibold">No tasks in stage</span>
                <span className="text-[9px] text-muted-foreground/40 font-medium">+ Add task</span>
              </div>
            ) : (
              tasks.map((task, idx) => (
                <CrmKanbanCard
                  key={task.id}
                  task={task}
                  index={idx}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                  allColumns={allColumns}
                  onMoveToColumn={onMoveToColumn}
                />
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};
