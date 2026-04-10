'use client';

import React from'react';
import { Draggable } from'@hello-pangea/dnd';
import { 
  Clock, 
  MoreHorizontal, 
  Type, 
  FileText, 
  Share2, 
  AlertCircle,
  CheckCircle2,
  ListTodo
} from'lucide-react';
import { Badge } from"@/components/ui/badge";
import { cn } from"@/lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from"@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from"@/components/ui/tooltip";

export const KanbanCard = ({ task, index, onDeleteTask, onUpdateTask }) => {
  const getTypeIcon = (type) => {
    switch (type) {
      case'article': return <FileText size={12} className="text-blue-400"/>;
      case'social': return <Share2 size={12} className="text-purple-400"/>;
      case'note': return <Type size={12} className="text-amber-400"/>;
      default: return <ListTodo size={12} className="text-primary/70"/>;
    }
  };

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case'urgent': return {
        badge: 'bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.15)]',
        glow: 'shadow-[inset_0_-1px_0_rgba(244,63,94,0.1)] border-rose-500/10 hover:border-rose-500/40 hover:shadow-rose-500/5'
      };
      case'high': return {
        badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        glow: 'border-amber-500/10 hover:border-amber-500/40'
      };
      case'medium': return {
        badge: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        glow: 'border-blue-500/10 hover:border-blue-500/40'
      };
      default: return {
        badge: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        glow: 'border-emerald-500/10 hover:border-emerald-500/40'
      };
    }
  };

  const styles = getPriorityStyles(task.priority);

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            "group p-4 mb-3 rounded-xl bg-card/40 border backdrop-blur-sm transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 relative overflow-hidden",
            styles.glow,
            snapshot.isDragging && "shadow-2xl border-primary bg-background/80 ring-4 ring-primary/10 rotate-1 scale-[1.03] z-50 pointer-events-none"
          )}
        >
          {/* Subtle Priority Accent */}
          <div className={cn(
            "absolute left-0 top-0 bottom-0 w-[3px] opacity-40 transition-opacity group-hover:opacity-100",
            task.priority === 'urgent' && "bg-rose-500",
            task.priority === 'high' && "bg-amber-500",
            task.priority === 'medium' && "bg-blue-500",
            task.priority === 'low' && "bg-emerald-500"
          )}/>

          <div className="space-y-4">
            {/* Card Cover */}
            {task.coverUrl && (
              <div className="relative -mx-4 -mt-4 mb-3 overflow-hidden rounded-t-xl h-28 border-b border-border/20">
                <img 
                  src={task.coverUrl} 
                  alt="Cover"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-60"/>
              </div>
            )}

            {/* Card Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-background/50 border border-border/20 shadow-sm transition-colors group-hover:border-primary/20">
                  {getTypeIcon(task.type)}
                </div>
                <span className="text-[9px] font-bold tracking-wider text-muted-foreground uppercase opacity-60 group-hover:text-primary transition-colors">
                  {task.type}
                </span>
              </div>
              <button 
                className="text-muted-foreground hover:text-foreground transition-all p-1 hover:bg-muted/50 rounded-lg opacity-0 group-hover:opacity-100"
                onClick={() => {
                  if (confirm(`Delete task "${task.title}"?`)) {
                    onDeleteTask(task.id);
                  }
                }}
              >
                <MoreHorizontal size={14} />
              </button>
            </div>

            {/* Card Title */}
            <div className="space-y-1">
              <h4 
                className="text-[13px] font-bold text-foreground/90 leading-snug line-clamp-2 cursor-pointer hover:text-primary transition-all decoration-primary/30 underline-offset-4"
                onClick={() => onUpdateTask(task.id)}
              >
                {task.title}
              </h4>
              {task.content && (
                <p className="text-[10px] text-muted-foreground line-clamp-1 opacity-50 font-medium">
                  {task.content}
                </p>
              )}
            </div>

            {/* Checklist Progress */}
            {task.checklists && task.checklists.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-[8px] font-bold tracking-widest text-muted-foreground/60 uppercase">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={10} className="text-primary/60"/>
                    <span>Checklist Progress</span>
                  </div>
                  <span>
                    {task.checklists.filter(i => i.completed).length}/{task.checklists.length}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-muted/20 rounded-full overflow-hidden border border-border/10">
                  <div 
                    className="h-full bg-linear-to-r from-primary/80 to-primary transition-all duration-700 rounded-full shadow-[0_0_8px_rgba(var(--primary),0.3)]"
                    style={{ 
                      width: `${(task.checklists.filter(i => i.completed).length / task.checklists.length) * 100}%` 
                    }}
                  />
                </div>
              </div>
            )}

            {/* Card Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-border/10 mt-2 bg-linear-to-b from-transparent to-muted/5 -mx-4 px-4 pb-4 rounded-b-xl">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn("text-[8px] font-bold px-2 py-0.5 h-5 border-none shadow-sm capitalize tracking-wide", styles.badge)}>
                  {task.priority || 'medium'}
                </Badge>
                {task.dueDate && (
                  <div className={cn(
                    "flex items-center gap-1.5 text-[9px] font-bold px-2 py-0.5 rounded-md border border-border/20 bg-background/50",
                    new Date(task.dueDate) < new Date() ? "text-rose-500 border-rose-500/20 bg-rose-500/5" : "text-muted-foreground"
                  )}>
                    <Clock size={10} />
                    <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              
              {task.assignee && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Avatar className="w-7 h-7 border-2 border-background shadow-lg hover:scale-110 transition-all cursor-help ring-2 ring-primary/5">
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