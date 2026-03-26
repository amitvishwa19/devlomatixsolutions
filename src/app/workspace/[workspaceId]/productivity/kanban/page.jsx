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
 // In a real app, you might need to update neighboring tasks' orders too
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
 <div className="absolute inset-0 flex flex-col gap-4">
 {/* Kanban Modals */}
 <AddKanbanColumnModal />
 <AddKanbanTaskModal />

 {/* Header Section */}
 <div className="flex items-center justify-between p-4">
 <div className="space-y-1">
 <div className="flex items-center gap-2">
 <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
 <Sparkles size={16} />
 </div>
 <h1 className="text-xl text-foreground font-bold">
 Unified Kanban Board
 </h1>
 </div>
 <p className="text-[12px] text-muted-foreground font-medium">
 Manage your content pipeline and tasks across the entire workspace.
 </p>
 </div>
 </div>

 {/* Kanban Toolbar */}
 <div className="flex flex-wrap items-center justify-between gap-4 p-4">
 <div className="flex flex-wrap items-center gap-4 flex-1">
 <div className="relative w-full md:w-80">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
 <Input
 placeholder="Search tasks, articles, or platforms..."
 className="pl-10 bg-muted/20 border-border/50 focus:ring-primary/20 transition-all text-[12px] h-10 rounded-xl"
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 />
 </div>
 
 <div className="flex items-center gap-2">
 {/* Type Filter */}
 <Select value={filterType} onValueChange={setFilterType}>
 <SelectTrigger className="w-[130px] h-10 text-[11px] font-bold border-border/50 bg-muted/20 rounded-xl">
 <SelectValue placeholder="All Types" />
 </SelectTrigger>
 <SelectContent className="rounded-xl font-bold">
 <SelectItem value="all">All Types</SelectItem>
 <SelectItem value="task">Default Task</SelectItem>
 <SelectItem value="article">Article</SelectItem>
 <SelectItem value="social">Social Post</SelectItem>
 <SelectItem value="note">Note/Draft</SelectItem>
 </SelectContent>
 </Select>

 {/* Priority Filter */}
 <Select value={filterPriority} onValueChange={setFilterPriority}>
 <SelectTrigger className="w-[130px] h-10 text-[11px] font-bold border-border/50 bg-muted/20 rounded-xl">
 <SelectValue placeholder="All Priorities" />
 </SelectTrigger>
 <SelectContent className="rounded-xl font-bold">
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
 className="h-10 text-[10px] font-black text-muted-foreground hover:text-foreground"
 >
 Reset
 </Button>
 )}
 </div>
 </div>

 <div className="flex items-center gap-3">
 <Button 
 variant="outline" 
 size="sm" 
 className="h-10 px-4 text-[11px] font-bold border-primary/20 text-primary hover:bg-primary/5 transition-all rounded-xl"
 onClick={addColumn}
 >
 <Plus size={16} className="mr-2" /> Add Column
 </Button>
 <Button 
 size="sm" 
 className="h-10 px-4 text-[11px] font-bold shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 transition-all rounded-xl"
 onClick={() => createTask()}
 >
 <Plus size={16} className="mr-2" /> Create Task
 </Button>
 </div>
 </div>

 {/* Kanban Board Area */}
 <ScrollArea className="flex-1 min-h-0 w-full rounded-2xl border border-border/10 bg-muted/5 shadow-inner overflow-hidden p-4">
 {loading ? (
 <div className="flex items-center justify-center h-full">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
 </div>
 ) : (
 <div className=" h-full">
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
 className="flex-shrink-0 w-80 h-full rounded-2xl border-2 border-dashed border-border/50 flex flex-col items-center justify-center group hover:border-primary/30 transition-all duration-300 bg-muted/5 hover:bg-primary/5 cursor-pointer"
 onClick={addColumn}
 >
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
 )}
 <ScrollBar orientation="horizontal" className="bg-muted/50" />
 </ScrollArea>
 </div>
 );
}
