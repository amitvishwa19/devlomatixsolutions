'use client';

import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import {
  Clock,
  MoreHorizontal,
  Type,
  FileText,
  Share2,
  AlertCircle,
  CheckCircle2,
  ListTodo,
  Edit,
  Trash2,
  Copy,
  Calendar,
  CheckSquare,
  Square
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { toggleChecklistItemAction } from '../kanban/_actions/kanban-actions';

export const KanbanCard = ({ task, index, onDeleteTask, onUpdateTask, onChecklistToggle }) => {
  const [checklists, setChecklists] = useState(task.checklists || []);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'article': return <FileText size={12} className="text-blue-400" />;
      case 'social': return <Share2 size={12} className="text-purple-400" />;
      case 'note': return <Type size={12} className="text-amber-400" />;
      default: return <ListTodo size={12} className="text-primary/70" />;
    }
  };

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'urgent': return {
        badge: 'bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-[0_0_12px_rgba(244,63,94,0.15)] font-bold',
        glow: 'border-rose-500/20 hover:border-rose-500/50 hover:shadow-rose-500/10'
      };
      case 'high': return {
        badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20 font-bold',
        glow: 'border-amber-500/20 hover:border-amber-500/50'
      };
      case 'medium': return {
        badge: 'bg-blue-500/10 text-blue-500 border-blue-500/20 font-bold',
        glow: 'border-blue-500/20 hover:border-blue-500/50'
      };
      default: return {
        badge: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-bold',
        glow: 'border-emerald-500/20 hover:border-emerald-500/50'
      };
    }
  };

  const getDueDateStatus = (dueDateStr) => {
    if (!dueDateStr) return null;
    const due = new Date(dueDateStr);
    const now = new Date();
    const diffHours = (due - now) / (1000 * 60 * 60);

    if (diffHours < 0) {
      return { label: 'Overdue', color: 'text-rose-500 border-rose-500/30 bg-rose-500/10 animate-pulse' };
    }
    if (diffHours <= 24) {
      return { label: 'Due Today', color: 'text-amber-500 border-amber-500/30 bg-amber-500/10' };
    }
    return { label: due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), color: 'text-muted-foreground border-border/20 bg-background/50' };
  };

  const handleToggleChecklist = async (itemId, currentStatus) => {
    const nextStatus = !currentStatus;
    // Local optimistic state update
    setChecklists(prev => prev.map(item => item.id === itemId ? { ...item, completed: nextStatus } : item));

    try {
      const res = await toggleChecklistItemAction(itemId, nextStatus);
      if (!res.success) throw new Error(res.error);
      if (onChecklistToggle) onChecklistToggle();
    } catch (error) {
      console.error("Failed to toggle checklist item", error);
      toast.error("Failed to update item status");
      // Revert local state
      setChecklists(prev => prev.map(item => item.id === itemId ? { ...item, completed: currentStatus } : item));
    }
  };

  const handleCopyTitle = () => {
    navigator.clipboard.writeText(task.title);
    toast.success("Task title copied to clipboard");
  };

  const styles = getPriorityStyles(task.priority);
  const dueDateInfo = getDueDateStatus(task.dueDate);
  const completedChecklistsCount = (checklists || []).filter(i => i.completed).length;
  const totalChecklistsCount = (checklists || []).length;

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            "group p-4 mb-3 rounded-2xl bg-card/50 border backdrop-blur-md transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 relative overflow-hidden",
            styles.glow,
            snapshot.isDragging && "shadow-2xl border-primary bg-background/90 ring-4 ring-primary/20 rotate-1 scale-[1.03] z-50"
          )}
        >
          {/* Priority Accent Line */}
          <div className={cn(
            "absolute left-0 top-0 bottom-0 w-[4px] opacity-70 transition-opacity group-hover:opacity-100",
            task.priority === 'urgent' && "bg-rose-500",
            task.priority === 'high' && "bg-amber-500",
            task.priority === 'medium' && "bg-blue-500",
            task.priority === 'low' && "bg-emerald-500"
          )} />

          <div className="space-y-3.5">
            {/* Card Cover */}
            {task.coverUrl && (
              <div className="relative -mx-4 -mt-4 mb-3 overflow-hidden rounded-t-2xl h-28 border-b border-border/20 group/cover">
                <img
                  src={task.coverUrl}
                  alt="Cover"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover/cover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent opacity-60" />
              </div>
            )}

            {/* Card Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1.5 rounded-lg bg-background/60 border border-border/20 shadow-xs transition-colors group-hover:border-primary/30">
                  {getTypeIcon(task.type)}
                </div>
                <span className="text-[9px] font-bold tracking-wider text-muted-foreground uppercase opacity-70 group-hover:text-primary transition-colors truncate">
                  {task.type}
                </span>
              </div>

              {/* Action Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-muted-foreground hover:text-foreground transition-all p-1 hover:bg-muted/60 rounded-lg opacity-0 group-hover:opacity-100">
                    <MoreHorizontal size={14} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 p-1 rounded-xl shadow-xl border-border/40">
                  <DropdownMenuItem onClick={() => onUpdateTask(task.id)} className="rounded-lg text-xs font-semibold gap-2">
                    <Edit size={14} className="text-primary" />
                    Edit Task
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCopyTitle} className="rounded-lg text-xs font-semibold gap-2">
                    <Copy size={14} className="text-muted-foreground" />
                    Copy Title
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      if (confirm(`Delete task "${task.title}"?`)) {
                        onDeleteTask(task.id);
                      }
                    }}
                    className="rounded-lg text-xs font-semibold gap-2 text-rose-500 focus:bg-rose-500/10 focus:text-rose-500"
                  >
                    <Trash2 size={14} />
                    Delete Task
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Card Title & Content */}
            <div className="space-y-1">
              <h4
                className="text-[13px] font-bold text-foreground/95 leading-snug line-clamp-2 cursor-pointer hover:text-primary transition-all decoration-primary/30"
                onClick={() => onUpdateTask(task.id)}
              >
                {task.title}
              </h4>
              {task.content && (
                <p className="text-[10px] text-muted-foreground line-clamp-2 opacity-70 font-medium leading-relaxed">
                  {task.content}
                </p>
              )}
            </div>

            {/* Checklist Progress with Interactive Popover */}
            {totalChecklistsCount > 0 && (
              <Popover>
                <PopoverTrigger asChild>
                  <div className="space-y-1.5 pt-1 cursor-pointer group/checklist p-1.5 -mx-1.5 rounded-lg hover:bg-muted/30 transition-all">
                    <div className="flex items-center justify-between text-[8px] font-bold  text-muted-foreground/70 uppercase">
                      <div className="flex items-center gap-1.5 group-hover/checklist:text-primary transition-colors">
                        <CheckCircle2 size={11} className="text-primary/70" />
                        <span>Checklist</span>
                      </div>
                      <span>
                        {completedChecklistsCount}/{totalChecklistsCount}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden border border-border/10">
                      <div
                        className="h-full bg-linear-to-r from-primary/80 to-primary transition-all duration-500 rounded-full shadow-[0_0_8px_rgba(var(--primary),0.3)]"
                        style={{
                          width: `${(completedChecklistsCount / totalChecklistsCount) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-64 p-3 rounded-xl shadow-2xl border-border/40 bg-background/95 backdrop-blur-md">
                  <h5 className="text-[11px] font-bold mb-2 flex items-center justify-between">
                    <span>Task Checklists</span>
                    <span className="text-[9px] text-muted-foreground">{completedChecklistsCount}/{totalChecklistsCount} completed</span>
                  </h5>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {checklists.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleToggleChecklist(item.id, item.completed)}
                        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted/40 transition-colors cursor-pointer text-xs"
                      >
                        {item.completed ? (
                          <CheckSquare size={14} className="text-primary shrink-0" />
                        ) : (
                          <Square size={14} className="text-muted-foreground shrink-0" />
                        )}
                        <span className={cn("text-[11px] font-medium transition-all line-clamp-1", item.completed && "line-through text-muted-foreground/60")}>
                          {item.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            )}

            {/* Card Footer */}
            <div className="flex items-center justify-between pt-2.5 border-t border-border/10 mt-2 bg-muted/5 -mx-4 px-4 pb-3 rounded-b-2xl">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Badge variant="outline" className={cn("text-[8px] font-bold px-2 py-0.5 h-5 border-none shadow-xs capitalize tracking-wide", styles.badge)}>
                  {task.priority || 'medium'}
                </Badge>

                {dueDateInfo && (
                  <div className={cn(
                    "flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-md border",
                    dueDateInfo.color
                  )}>
                    <Clock size={10} />
                    <span>{dueDateInfo.label}</span>
                  </div>
                )}
              </div>

              {task.assignee && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Avatar className="w-6 h-6 border-2 border-background shadow-md hover:scale-110 transition-all cursor-help ring-2 ring-primary/10">
                        <AvatarImage src={task.assignee.avatar} />
                        <AvatarFallback className="bg-primary/10 text-[9px] font-bold text-primary">
                          {task.assignee.displayName?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-background/95 backdrop-blur-md border px-3 py-1.5 rounded-lg shadow-2xl">
                      <p className="text-[10px] font-bold text-foreground">Assigned to: {task.assignee.displayName}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};