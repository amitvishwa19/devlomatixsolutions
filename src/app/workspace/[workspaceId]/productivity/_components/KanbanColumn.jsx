'use client';

import React from'react';
import { Droppable } from'@hello-pangea/dnd';
import { Plus, MoreVertical, LayoutGrid } from'lucide-react';
import { KanbanCard } from'./KanbanCard';
import { cn } from"@/lib/utils";

export const KanbanColumn = ({ column, tasks, onCreateTask, onDeleteColumn, onDeleteTask, onUpdateTask }) => {
  return (
    <div className="shrink-0 w-80 h-full flex flex-col bg-card/20 backdrop-blur-md rounded-2xl border border-border/40 overflow-hidden shadow-2xl transition-all duration-300 hover:shadow-primary/5 group/col">
      {/* Column Header */}
      <div className="p-5 flex items-center justify-between border-b border-border/20 bg-muted/5 relative">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
            <span className="text-[10px] font-bold text-primary">
              {tasks.length}
            </span>
          </div>
          <div>
            <h3 className="text-[13px] font-bold text-foreground/90 tracking-tight group-hover/col:text-primary transition-colors">
              {column.title}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover/col:opacity-100 transition-all duration-300 transform translate-x-2 group-hover/col:translate-x-0">
          <button 
            className="p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
            onClick={onCreateTask}
            title="Quick Add"
          >
            <Plus size={14} />
          </button>
          <button 
            className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-all"
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
              "flex-1 p-4 overflow-y-auto min-h-[200px] transition-colors duration-200 scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent custom-scrollbar",
              snapshot.isDraggingOver && "bg-primary/5"
            )}
          >
            <div className="space-y-1">
              {tasks.map((task, index) => (
                <KanbanCard 
                  key={task.id} 
                  task={task} 
                  index={index} 
                  onDeleteTask={onDeleteTask}
                  onUpdateTask={onUpdateTask}
                />
              ))}
            </div>
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* Column Footer */}
      <div className="p-4 bg-muted/5 border-t border-border/20">
        <button 
          className="w-full py-3 flex items-center justify-center gap-2 text-[11px] font-bold text-muted-foreground hover:text-primary transition-all group/add rounded-xl bg-background/20 hover:bg-primary/5 border border-transparent hover:border-primary/20"
          onClick={onCreateTask}
        >
          <Plus size={14} className="group-hover/add:rotate-90 transition-transform duration-300"/> 
          <span>Add Task</span>
        </button>
      </div>
    </div>
  );
};