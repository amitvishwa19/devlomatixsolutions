'use client';

import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Plus, MoreVertical } from 'lucide-react';
import { KanbanCard } from './KanbanCard';
import { cn } from "@/lib/utils";

export const KanbanColumn = ({ column, tasks, onCreateTask, onDeleteColumn, onDeleteTask, onUpdateTask }) => {
 return (
 <div className="flex-shrink-0 w-80 h-full flex flex-col bg-muted/20 rounded-2xl border border-border/10 overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md">
 {/* Column Header */}
 <div className="p-4 flex items-center justify-between border-b border-border/10 group">
 <div className="flex items-center gap-3">
 <div className="w-6 h-6 rounded-md bg-background flex items-center justify-center border border-border/10 shadow-sm">
 <span className="text-[10px] text-primary">
 {tasks.length}
 </span>
 </div>
 <h3 className="text-[12px] text-foreground/80 group-hover:text-primary transition-colors">
 {column.title}
 </h3>
 </div>
 <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
 <button 
 className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors"
 onClick={onCreateTask}
 >
 <Plus size={14} />
 </button>
 <button 
 className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors"
 onClick={() => {
 if (confirm(`Delete column "${column.title}" and all its tasks?`)) {
 onDeleteColumn(column.id);
 }
 }}
 >
 <MoreVertical size={14} />
 </button>
 </div>
 </div>

 {/* Tasks List */}
 <Droppable droppableId={column.id}>
 {(provided, snapshot) => (
 <div
 ref={provided.innerRef}
 {...provided.droppableProps}
 className={cn(
 "flex-1 p-3 overflow-y-auto min-h-[150px] transition-colors duration-200 scrollbar-thin scrollbar-thumb-muted-foreground/10 scrollbar-track-transparent",
 snapshot.isDraggingOver && "bg-primary/5"
 )}
 >
 {tasks.map((task, index) => (
 <KanbanCard 
 key={task.id} 
 task={task} 
 index={index} 
 onDeleteTask={onDeleteTask}
 onUpdateTask={onUpdateTask}
 />
 ))}
 {provided.placeholder}
 </div>
 )}
 </Droppable>

 {/* Column Footer */}
 <div className="p-3 border-t border-border/10 bg-muted/10 opacity-60 hover:opacity-100 transition-opacity text-center">
 <button 
 className="w-full py-2 flex items-center justify-center gap-2 text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors group"
 onClick={onCreateTask}
 >
 <Plus size={12} className="group-hover:scale-110 transition-transform" /> 
 <span>Add New Item</span>
 </button>
 </div>
 </div>
 );
};
