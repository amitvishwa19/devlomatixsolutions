'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { KanbanColumn } from './KanbanColumn';
import {
    Search,
    Filter,
    Plus,
    LayoutGrid,
    ListFilter,
    Sparkles
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const initialData = {
    tasks: {
        'task-1': { id: 'task-1', title: 'Refine Article: Future of AI', type: 'article', priority: 'high', dueDate: 'Oct 24', assignee: 'AV' },
        'task-2': { id: 'task-2', title: 'Schedule Twitter Thread on SEO', type: 'social', priority: 'medium', dueDate: 'Oct 25', assignee: 'JD' },
        'task-3': { id: 'task-3', title: 'Draft Brand Style Guide', type: 'note', priority: 'low', dueDate: 'Oct 26' },
        'task-4': { id: 'task-4', title: 'LinkedIn Post: Workspace Launch', type: 'social', priority: 'high', dueDate: 'Oct 24', assignee: 'AV' },
        'task-5': { id: 'task-5', title: 'Internal Review: Q4 Roadmap', type: 'article', priority: 'medium', dueDate: 'Oct 27' },
    },
    columns: {
        'column-1': { id: 'column-1', title: 'TO DO', taskIds: ['task-1', 'task-2', 'task-3'] },
        'column-2': { id: 'column-2', title: 'IN PROGRESS', taskIds: ['task-4'] },
        'column-3': { id: 'column-3', title: 'COMPLETED', taskIds: ['task-5'] },
        'column-4': { id: 'column-4', title: 'POST-PUBLISH', taskIds: [] },
        'column-5': { id: 'column-5', title: 'ARCHIVED', taskIds: [] },
    },
    columnOrder: ['column-1', 'column-2', 'column-3', 'column-4', 'column-5'],
};

export const KanbanBoard = () => {
    const [data, setData] = useState(initialData);
    const [searchTerm, setSearchTerm] = useState('');

    const onDragEnd = (result) => {
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
    };

    return (
        <div className="absolute inset-0 flex flex-col gap-2 p-2">

            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                            <Sparkles size={16} />
                        </div>
                        <h1 className="text-xl font-black tracking-tight text-foreground">
                            Unified Kanban Board
                        </h1>
                    </div>
                    <p className="text-[12px] text-muted-foreground font-medium">
                        Manage your content pipeline and tasks across the entire workspace.
                    </p>
                </div>
            </div>

            {/* Kanban Toolbar */}
            <div className="flex items-center justify-between gap-4 p-4 ">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative w-64 md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <Input
                            placeholder="Search tasks, articles, or platforms..."
                            className="pl-10 bg-muted/20 border-border/50 focus:ring-primary/20 transition-all text-[12px]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-9 px-3 text-[11px] font-bold border-border/50 hover:bg-muted/50">
                            <Filter size={14} className="mr-2" /> Filter
                        </Button>
                        <Button variant="outline" size="sm" className="h-9 px-3 text-[11px] font-bold border-border/50 hover:bg-muted/50">
                            <ListFilter size={14} className="mr-2" /> Sort
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden lg:flex items-center bg-muted/30 p-1 rounded-lg border border-border/50">
                        <Button variant="ghost" size="icon" className="h-7 w-7 bg-background shadow-sm text-primary">
                            <LayoutGrid size={14} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground opacity-50">
                            <Sparkles size={14} />
                        </Button>
                    </div>
                    <Button variant="outline" size="sm" className="h-9 px-4 text-[11px] font-bold border-primary/20 text-primary hover:bg-primary/5 transition-all">
                        <Plus size={16} className="mr-2" /> Add Column
                    </Button>
                    <Button size="sm" className="h-9 px-4 text-[11px] font-bold shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 transition-all">
                        <Plus size={16} className="mr-2" /> Create Task
                    </Button>
                </div>
            </div>

            {/* Kanban Board Area */}
            <ScrollArea className="flex-1 min-h-0 w-full rounded-2xl border border-border/10 bg-muted/5 shadow-inner overflow-hidden">
                <div className="p-4 h-full">
                    <DragDropContext onDragEnd={onDragEnd}>
                        <div className="flex gap-6 h-full min-w-max pb-4">
                            {data.columnOrder.map((columnId) => {
                                const column = data.columns[columnId];
                                const tasks = column.taskIds
                                    .map((taskId) => data.tasks[taskId])
                                    .filter(task =>
                                        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        task.type.toLowerCase().includes(searchTerm.toLowerCase())
                                    );

                                return (
                                    <KanbanColumn key={column.id} column={column} tasks={tasks} />
                                );
                            })}

                            {/* New Column Placeholder */}
                            <div className="flex-shrink-0 w-80 h-full rounded-2xl border-2 border-dashed border-border/50 flex flex-col items-center justify-center group hover:border-primary/30 transition-all duration-300 bg-muted/5 hover:bg-primary/5 cursor-pointer">
                                <div className="p-3 rounded-full bg-muted/50 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-all duration-300">
                                    <Plus size={24} />
                                </div>
                                <span className="mt-4 text-[12px] font-bold text-muted-foreground group-hover:text-primary transition-colors">
                                    Create New Column
                                </span>
                            </div>
                        </div>
                    </DragDropContext>
                </div>
                <ScrollBar orientation="horizontal" className="bg-muted/50" />
            </ScrollArea>
        </div>
    );
};
