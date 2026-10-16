'use client';

import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import {
  Calendar,
  CheckSquare,
  AlertCircle,
  MoreVertical,
  Trash2,
  Edit2,
  Clock,
  User,
  Tag,
  ArrowRight
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const CrmKanbanCard = ({
  task,
  index,
  onEdit,
  onDelete,
  allColumns = [],
  onMoveToColumn
}) => {
  if (!task) return null;

  const priorityStyles = {
    urgent: "bg-rose-500/10 text-rose-500 border-rose-500/30",
    high: "bg-amber-500/10 text-amber-500 border-amber-500/30",
    medium: "bg-blue-500/10 text-blue-500 border-blue-500/30",
    low: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
  };

  const priorityDot = {
    urgent: "bg-rose-500 animate-ping",
    high: "bg-amber-500",
    medium: "bg-blue-500",
    low: "bg-emerald-500"
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
  const dueDateStr = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;

  const totalChecklists = Array.isArray(task.checklists) ? task.checklists.length : 0;
  const completedChecklists = totalChecklists > 0
    ? task.checklists.filter(c => c.completed).length
    : 0;

  const initials = task.assignee?.displayName
    ? task.assignee.displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : (task.assignee?.email?.[0] || 'U').toUpperCase();

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            "group relative rounded-xl border bg-card/70 p-3.5 transition-all duration-200 select-none",
            "hover:border-primary/40 hover:bg-card/90 hover:shadow-md hover:shadow-primary/5",
            snapshot.isDragging
              ? "shadow-2xl shadow-primary/20 border-primary scale-[1.02] rotate-1 bg-card z-50 ring-2 ring-primary/20"
              : "border-border/60 shadow-xs"
          )}
        >
          {/* Card Header: Type, Priority, Actions */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Type Badge */}
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground border border-border/40">
                {task.type || 'task'}
              </span>

              {/* Priority Pill */}
              <span className={cn(
                "flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border",
                priorityStyles[task.priority] || priorityStyles.medium
              )}>
                <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", priorityDot[task.priority] || "bg-blue-500")} />
                <span className="capitalize">{task.priority || 'medium'}</span>
              </span>
            </div>

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground/60 hover:text-foreground hover:bg-muted/40 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <MoreVertical size={14} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 text-xs font-medium">
                <DropdownMenuItem onClick={() => onEdit && onEdit(task)}>
                  <Edit2 size={13} className="mr-2 text-muted-foreground" /> Edit Task
                </DropdownMenuItem>
                {allColumns.length > 1 && (
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <ArrowRight size={13} className="mr-2 text-muted-foreground" /> Move to Stage
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent className="text-xs font-medium">
                        {allColumns
                          .filter(col => col.id !== task.columnId)
                          .map(col => (
                            <DropdownMenuItem
                              key={col.id}
                              onClick={() => onMoveToColumn && onMoveToColumn(task.id, col.id)}
                            >
                              {col.title}
                            </DropdownMenuItem>
                          ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete && onDelete(task.id)}
                  className="text-rose-500 focus:text-rose-500 focus:bg-rose-500/10"
                >
                  <Trash2 size={13} className="mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Title */}
          <h4 className="text-xs font-bold text-foreground leading-snug line-clamp-2 mb-1">
            {task.title}
          </h4>

          {/* Content / Notes preview */}
          {task.content && (
            <p className="text-[11px] text-muted-foreground/80 line-clamp-2 mb-2.5 font-medium leading-relaxed">
              {task.content}
            </p>
          )}

          {/* Checklist Progress Bar (if checklists exist) */}
          {totalChecklists > 0 && (
            <div className="mb-2.5 space-y-1">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground font-semibold">
                <span className="flex items-center gap-1">
                  <CheckSquare size={11} className={completedChecklists === totalChecklists ? "text-emerald-500" : "text-muted-foreground"} />
                  <span>Checklist</span>
                </span>
                <span>{completedChecklists}/{totalChecklists}</span>
              </div>
              <div className="w-full h-1 bg-muted/60 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-300 rounded-full",
                    completedChecklists === totalChecklists ? "bg-emerald-500" : "bg-primary"
                  )}
                  style={{ width: `${Math.round((completedChecklists / totalChecklists) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Card Footer: Due Date & Assignee */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/30 mt-1">
            {/* Due Date */}
            {dueDateStr ? (
              <span className={cn(
                "flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded",
                isOverdue
                  ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                  : "text-muted-foreground bg-muted/30"
              )}>
                <Clock size={11} className={isOverdue ? "animate-pulse" : ""} />
                <span>{dueDateStr}</span>
                {isOverdue && <span className="font-bold uppercase text-[8px]">Overdue</span>}
              </span>
            ) : (
              <span />
            )}

            {/* Assignee Avatar */}
            {task.assignee ? (
              <div className="flex items-center gap-1" title={task.assignee.displayName || task.assignee.email}>
                <Avatar className="h-5 w-5 border border-border/60">
                  <AvatarImage src={task.assignee.avatar} />
                  <AvatarFallback className="text-[9px] font-bold bg-primary/20 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
            ) : (
              <div className="h-5 w-5 rounded-full border border-dashed border-border/60 flex items-center justify-center text-muted-foreground/40" title="Unassigned">
                <User size={10} />
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};
