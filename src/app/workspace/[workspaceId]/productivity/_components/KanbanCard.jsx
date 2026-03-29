'use client';

import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { 
 Clock, 
 MoreHorizontal, 
 Type, 
 FileText, 
 Share2, 
 AlertCircle 
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

export const KanbanCard = ({ task, index, onDeleteTask, onUpdateTask }) => {
 const getTypeIcon = (type) => {
 switch (type) {
 case 'article': return <FileText size={12} className="text-blue-500" />;
 case 'social': return <Share2 size={12} className="text-purple-500" />;
 default: return <Type size={12} className="text-amber-500" />;
 }
 };

 const getPriorityColor = (priority) => {
 switch (priority) {
 case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20';
 case 'medium': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
 default: return 'bg-green-500/10 text-green-500 border-green-500/20';
 }
 };

 return (
 <Draggable draggableId={task.id} index={index}>
 {(provided, snapshot) => (
 <div
 ref={provided.innerRef}
 {...provided.draggableProps}
 {...provided.dragHandleProps}
 className={cn(
 "group p-4 mb-3 rounded-md bg-card border border-border/100 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/30",
 snapshot.isDragging && "shadow-2xl border-primary ring-2 ring-primary/20 rotate-1 scale-105 z-50 bg-background"
 )}
 >
 <div className="space-y-3">
 {/* Card Cover */}
 {task.coverUrl && (
 <div className="relative -mx-4 -mt-4 mb-2 overflow-hidden rounded-t-xl h-24">
 <img 
 src={task.coverUrl} 
 alt="Cover" 
 className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
 />
 <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
 </div>
 )}

 {/* Card Header */}
 <div className="flex items-start justify-between">
 <div className="flex items-center gap-2">
 <div className="p-1.5 rounded-md bg-muted/30">
 {getTypeIcon(task.type)}
 </div>
 <span className="text-[9px] text-muted-foreground opacity-60">
 {task.type}
 </span>
 </div>
 <button 
 className="text-muted-foreground hover:text-foreground transition-colors p-1"
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
 <h4 
 className="text-[11px] font-bold text-foreground leading-snug line-clamp-2 cursor-pointer hover:text-primary transition-colors"
 onClick={() => onUpdateTask(task.id)}
 >
 {task.title}
 </h4>

 {/* Checklist Progress */}
 {task.checklists && task.checklists.length > 0 && (
 <div className="space-y-1.5 pt-1">
 <div className="flex items-center justify-between text-[8px] font-bold text-muted-foreground ">
 <span>Progress</span>
 <span>
 {task.checklists.filter(i => i.completed).length}/{task.checklists.length}
 </span>
 </div>
 <div className="h-1 w-full bg-muted/30 rounded-full overflow-hidden">
 <div 
 className="h-full bg-primary transition-all duration-500 rounded-full"
 style={{ 
 width: `${(task.checklists.filter(i => i.completed).length / task.checklists.length) * 100}%` 
 }}
 />
 </div>
 </div>
 )}

 {/* Card Footer */}
 <div className="flex items-center justify-between pt-2 border-t border-border/10">
 <div className="flex items-center gap-2">
 <Badge variant="outline" className={cn("text-[8px] font-bold px-1.5 py-0 h-4 border", getPriorityColor(task.priority))}>
 {task.priority?.toUpperCase()}
 </Badge>
 {task.dueDate && (
 <div className="flex items-center gap-1 text-[9px] font-medium text-muted-foreground">
 <Clock size={10} />
 <span>{task.dueDate}</span>
 </div>
 )}
 </div>
 
 {task.assignee && (
 <TooltipProvider>
 <Tooltip>
 <TooltipTrigger asChild>
 <Avatar className="w-6 h-6 border-2 border-background shadow-sm hover:scale-110 transition-transform cursor-help">
 <AvatarImage src={task.assignee.avatar} />
 <AvatarFallback className="bg-primary/10 text-[8px] text-primary">
 {task.assignee.displayName?.charAt(0) || "U"}
 </AvatarFallback>
 </Avatar>
 </TooltipTrigger>
 <TooltipContent side="top" className="bg-background/95 backdrop-blur-md border px-3 py-1.5 rounded-md shadow-xl">
 <p className="text-[10px] font-bold ">{task.assignee.displayName}</p>
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
