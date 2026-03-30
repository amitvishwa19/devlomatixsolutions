'use client';

import { useState, useEffect } from"react";
import { useModal } from"@/hooks/useModal";
import { 
 Dialog,
 DialogContent,
 DialogDescription,
 DialogFooter,
 DialogHeader,
 DialogTitle,
} from"@/components/ui/dialog";
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from"@/components/ui/select";
import {
 Tabs,
 TabsContent,
 TabsList,
 TabsTrigger,
} from"@/components/ui/tabs";
import { Button } from"@/components/ui/button";
import { Input } from"@/components/ui/input";
import { Textarea } from"@/components/ui/textarea";
import { Checkbox } from"@/components/ui/checkbox";
import { 
 Loader2, 
 Sparkles, 
 Type, 
 AlignLeft, 
 AlertCircle, 
 Clock, 
 Briefcase,
 CheckSquare,
 History,
 Plus,
 Trash2,
 Image as ImageIcon
} from"lucide-react";
import { toast } from"sonner";
import { cn } from"@/lib/utils";
import { UnsplashImagePicker } from"@/components/global/UnsplashImagePicker";
import { 
 Popover,
 PopoverContent,
 PopoverTrigger,
} from"@/components/ui/popover";

export const AddKanbanTaskModal = () => {
 const { isOpen, onClose, type, data } = useModal();
 const isModalOpen = isOpen && type ==="addKanbanTask";
 const { workspaceId, columnId, onApply, task } = data || {};

 const [isLoading, setIsLoading] = useState(false);
 const [title, setTitle] = useState("");
 const [content, setContent] = useState("");
 const [taskType, setTaskType] = useState("task");
 const [priority, setPriority] = useState("medium");
 const [dueDate, setDueDate] = useState("");
 const [coverUrl, setCoverUrl] = useState("");
 const [assigneeId, setAssigneeId] = useState("");
 const [members, setMembers] = useState([]);
 
 // Checklist State
 const [checklists, setChecklists] = useState([]);
 const [newChecklistItem, setNewChecklistItem] = useState("");
 const [isChecking, setIsChecking] = useState(false);

 // Activity State
 const [activities, setActivities] = useState([]);

 const isEdit = !!task;

 const fetchMembers = async () => {
 if (!workspaceId) return;
 try {
 const response = await fetch(`/api/workspace/${workspaceId}/management/user`);
 const data = await response.json();
 setMembers(data);
 } catch (error) {
 console.error("Failed to fetch members", error);
 }
 };

 useEffect(() => {
 if (isModalOpen) {
 fetchMembers();
 if (task) {
 setTitle(task.title ||"");
 setContent(task.content ||"");
 setTaskType(task.type ||"task");
 setPriority(task.priority ||"medium");
 setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] :"");
 setCoverUrl(task.coverUrl ||"");
 setAssigneeId(task.assigneeId ||"");
 setChecklists(task.checklists || []);
 setActivities(task.activities || []);
 } else {
 setTitle("");
 setContent("");
 setTaskType("task");
 setPriority("medium");
 setDueDate("");
 setCoverUrl("");
 setAssigneeId("");
 setChecklists([]);
 setActivities([]);
 }
 }
 }, [isModalOpen, task]);

 const onSubmit = async (e) => {
 e.preventDefault();
 try {
 setIsLoading(true);
 const payload = {
 title,
 content,
 type: taskType,
 priority,
 dueDate: dueDate || null,
 columnId,
 coverUrl,
 assigneeId: assigneeId || null,
 checklists: !isEdit ? checklists : undefined
 };

 const url = isEdit 
 ? `/api/workspace/${workspaceId}/productivity/kanban/tasks/${task.id}`
 : `/api/workspace/${workspaceId}/productivity/kanban/tasks`;
 
 const method = isEdit ?'PATCH':'POST';

 const response = await fetch(url, {
 method,
 body: JSON.stringify(payload)
 });
 
 if (!response.ok) throw new Error("Failed to save task");
 
 const savedTask = await response.json();
 toast.success(isEdit ?"Task updated":"Task created");
 
 if (onApply) onApply(savedTask);
 onClose();
 } catch (error) {
 console.error(error);
 toast.error("Something went wrong");
 } finally {
 setIsLoading(false);
 }
 };

 const addChecklistItem = async () => {
 if (!newChecklistItem.trim()) return;
 
 if (!isEdit) {
 // Local state for new tasks
 setChecklists([...checklists, { 
 id: Math.random().toString(), 
 title: newChecklistItem, 
 completed: false 
 }]);
 setNewChecklistItem("");
 return;
 }

 if (!task?.id) return;
 
 try {
 setIsChecking(true);
 const response = await fetch(`/api/workspace/${workspaceId}/productivity/kanban/tasks/${task.id}/checklists`, {
 method:'POST',
 body: JSON.stringify({ title: newChecklistItem })
 });
 const newItem = await response.json();
 setChecklists([...checklists, newItem]);
 setNewChecklistItem("");
 } catch (error) {
 toast.error("Failed to add item");
 } finally {
 setIsChecking(false);
 }
 };

 const toggleChecklistItem = async (itemId, completed) => {
 setChecklists(checklists.map(item => item.id === itemId ? { ...item, completed } : item));
 
 if (!isEdit) return; // Only local update for new tasks

 try {
 await fetch(`/api/workspace/${workspaceId}/productivity/kanban/tasks/${task.id}/checklists/${itemId}`, {
 method:'PATCH',
 body: JSON.stringify({ completed })
 });
 } catch (error) {
 toast.error("Failed to update item");
 }
 };

 const deleteChecklistItem = async (itemId) => {
 setChecklists(checklists.filter(item => item.id !== itemId));
 
 if (!isEdit) return; // Only local deletion for new tasks

 try {
 await fetch(`/api/workspace/${workspaceId}/productivity/kanban/tasks/${task.id}/checklists/${itemId}`, {
 method:'DELETE'
 });
 } catch (error) {
 toast.error("Failed to delete item");
 }
 };

 const handleClose = () => {
 onClose();
 };

 return (
 <Dialog open={isModalOpen} onOpenChange={handleClose}>
 <DialogContent className="sm:max-w-xl overflow-hidden border shadow-2xl p-0 bg-background rounded-md">
 {/* Cover Preview */}
 {coverUrl && (
 <div className="relative h-32 w-full overflow-hidden">
 <img src={coverUrl} alt="Cover"className="w-full h-full object-cover"/>
 <Button 
 variant="destructive"
 size="icon"
 className="absolute top-2 right-2 h-6 w-6 rounded-md opacity-0 hover:opacity-100 transition-opacity bg-black/50 border-none"
 onClick={() => setCoverUrl("")}
 >
 <Trash2 size={12} />
 </Button>
 </div>
 )}

 <form onSubmit={onSubmit} className="flex flex-col">
 <DialogHeader className="p-8 pb-4">
 <div className="flex items-center justify-between gap-3 mb-2">
 <div className="flex items-center gap-3">
 <div className="p-2 rounded-md bg-primary/10">
 <Sparkles className="h-5 w-5 text-primary"/>
 </div>
 <DialogTitle className="text-2xl font-bold">
 {isEdit ?"Edit Task":"Create New Task"}
 </DialogTitle>
 </div>
 
 {/* Cover Picker Popover */}
 <Popover>
 <PopoverTrigger asChild>
 <Button variant="outline"size="sm"className="h-8 rounded-md text-[10px] font-bold gap-2">
 <ImageIcon size={14} /> 
 {coverUrl ?"Change Cover":"Add Cover"}
 </Button>
 </PopoverTrigger>
 <PopoverContent align="end"className="w-[340px] p-0 border-none shadow-2xl">
 <div className="p-4 bg-background rounded-md border border-border/40">
 <h4 className="text-[10px] tracking-[0.2em] mb-4 text-muted-foreground">Select a Cover Image</h4>
 <UnsplashImagePicker 
 onClick={(img) => setCoverUrl(img.full)} 
 selectedImage={null}
 setSelectedImage={() => {}}
 />
 </div>
 </PopoverContent>
 </Popover>
 </div>
 <DialogDescription className="text-sm font-medium text-muted-foreground">
 {isEdit ?"Update your task details and track history.":"Add a new task or content item to your pipeline."}
 </DialogDescription>
 </DialogHeader>

 <Tabs defaultValue="details"className="w-full px-8">
 <TabsList className="grid w-full grid-cols-3 h-11 bg-muted/20 p-1 rounded-md mb-6">
 <TabsTrigger value="details"className="rounded-md text-[10px] font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">
 <Briefcase className="w-3.5 h-3.5 mr-2"/> Details
 </TabsTrigger>
 <TabsTrigger value="checklist"className="rounded-md text-[10px] font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">
 <CheckSquare className="w-3.5 h-3.5 mr-2"/> Checklist
 </TabsTrigger>
 <TabsTrigger value="activity"className="rounded-md text-[10px] font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">
 <History className="w-3.5 h-3.5 mr-2"/> Activity
 </TabsTrigger>
 </TabsList>

 <div className="min-h-[350px] max-h-[50vh] overflow-y-auto custom-scrollbar pr-2 mb-6">
 <TabsContent value="details"className="space-y-6 mt-0">
 <div className="space-y-4">
 {/* Title Field */}
 <div className="space-y-2">
 <label className="text-[10px] text-muted-foreground ml-1 flex items-center gap-1.5 opacity-70">
 <Type size={12} /> Task Title
 </label>
 <Input
 disabled={isLoading}
 className="h-12 bg-muted/30 border-none rounded-md focus-visible:ring-1 focus-visible:ring-primary shadow-inner text-sm font-bold"
 placeholder="What needs to be done?"
 value={title}
 onChange={(e) => setTitle(e.target.value)}
 required
 />
 </div>

 {/* Type & Priority Row */}
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-2">
 <label className="text-[10px] text-muted-foreground ml-1 flex items-center gap-1.5 opacity-70">
 <Briefcase size={12} /> Content Type
 </label>
 <Select value={taskType} onValueChange={setTaskType} disabled={isLoading}>
 <SelectTrigger className="h-12 bg-muted/30 border-none rounded-md focus-visible:ring-1 focus-visible:ring-primary shadow-inner text-sm font-bold">
 <SelectValue />
 </SelectTrigger>
 <SelectContent className="rounded-md border-border/40">
 <SelectItem value="task"className="font-bold rounded-md">Default Task</SelectItem>
 <SelectItem value="article"className="font-bold rounded-md text-blue-500">Article</SelectItem>
 <SelectItem value="social"className="font-bold rounded-md text-purple-500">Social Post</SelectItem>
 <SelectItem value="note"className="font-bold rounded-md text-amber-500">Note/Draft</SelectItem>
 </SelectContent>
 </Select>
 </div>
 <div className="space-y-2">
 <label className="text-[10px] text-muted-foreground ml-1 flex items-center gap-1.5 opacity-70">
 <History size={12} /> Assigned To
 </label>
 <Select value={assigneeId} onValueChange={setAssigneeId} disabled={isLoading}>
 <SelectTrigger className="h-12 bg-muted/30 border-none rounded-md focus-visible:ring-1 focus-visible:ring-primary shadow-inner text-sm font-bold">
 <SelectValue placeholder="Unassigned"/>
 </SelectTrigger>
 <SelectContent className="rounded-md border-border/40 font-bold">
 <SelectItem value="none"className="rounded-md">Unassigned</SelectItem>
 {members.map((member) => (
 <SelectItem key={member.id} value={member.id} className="rounded-md">
 {member.displayName}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 </div>

 {/* Priority & Due Date Row */}
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-2">
 <label className="text-[10px] text-muted-foreground ml-1 flex items-center gap-1.5 opacity-70">
 <AlertCircle size={12} /> Priority
 </label>
 <Select value={priority} onValueChange={setPriority} disabled={isLoading}>
 <SelectTrigger className="h-12 bg-muted/30 border-none rounded-md focus-visible:ring-1 focus-visible:ring-primary shadow-inner text-sm font-bold">
 <SelectValue />
 </SelectTrigger>
 <SelectContent className="rounded-md border-border/40 font-bold">
 <SelectItem value="low"className="text-green-500 rounded-md">Low</SelectItem>
 <SelectItem value="medium"className="text-amber-500 rounded-md">Medium</SelectItem>
 <SelectItem value="high"className="text-red-500 rounded-md">High</SelectItem>
 <SelectItem value="urgent"className="text-rose-600 rounded-md">Urgent</SelectItem>
 </SelectContent>
 </Select>
 </div>
 </div>

 {/* Due Date */}
 <div className="space-y-2">
 <label className="text-[10px] text-muted-foreground ml-1 flex items-center gap-1.5 opacity-70">
 <Clock size={12} /> Due Date (Optional)
 </label>
 <Input
 disabled={isLoading}
 type="date"
 className="h-12 bg-muted/30 border-none rounded-md focus-visible:ring-1 focus-visible:ring-primary shadow-inner text-sm font-bold text-muted-foreground px-4"
 value={dueDate}
 onChange={(e) => setDueDate(e.target.value)}
 />
 </div>

 {/* Description Field */}
 <div className="space-y-2">
 <label className="text-[10px] text-muted-foreground ml-1 flex items-center gap-1.5 opacity-70">
 <AlignLeft size={12} /> Description
 </label>
 <Textarea
 disabled={isLoading}
 rows="4"
 className="bg-muted/30 border-none rounded-md focus-visible:ring-1 focus-visible:ring-primary shadow-inner text-sm py-3 px-4 resize-none"
 placeholder="Add more details about this task..."
 value={content}
 onChange={(e) => setContent(e.target.value)}
 />
 </div>
 </div>
 </TabsContent>

 <TabsContent value="checklist"className="space-y-6 mt-0">
 <div className="space-y-4">
 <div className="flex gap-2">
 <Input 
 placeholder="Add a sub-task..."
 value={newChecklistItem}
 onChange={(e) => setNewChecklistItem(e.target.value)}
 className="bg-muted/30 border-none rounded-md text-sm font-bold"
 onKeyDown={(e) => e.key ==='Enter'&& (e.preventDefault(), addChecklistItem())}
 />
 <Button 
 type="button"
 size="icon"
 onClick={addChecklistItem}
 disabled={isChecking || !newChecklistItem.trim()}
 className="w-10 shrink-0 rounded-md"
 >
 <Plus size={18} />
 </Button>
 </div>

 <div className="space-y-2">
 {checklists.length === 0 ? (
 <div className="py-12 border-2 border-dashed border-border/20 rounded-md flex flex-col items-center justify-center text-muted-foreground opacity-40">
 <CheckSquare size={32} className="mb-2"/>
 <p className="text-[10px]">No sub-tasks yet</p>
 </div>
 ) : (
 checklists.map((item) => (
 <div key={item.id} className="group flex items-center gap-3 p-3 bg-muted/20 border border-border/10 rounded-md hover:border-primary/20 transition-all">
 <Checkbox 
 checked={item.completed} 
 onCheckedChange={(checked) => toggleChecklistItem(item.id, !!checked)}
 className="h-5 w-5 rounded-md border-2 border-primary/20 bg-background data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
 />
 <span className={cn(
"flex-1 text-xs font-bold transition-all",
 item.completed &&"line-through text-muted-foreground opacity-50"
 )}>
 {item.title}
 </span>
 <button 
 type="button"
 onClick={() => deleteChecklistItem(item.id)}
 className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-red-500 transition-all"
 >
 <Trash2 size={14} />
 </button>
 </div>
 ))
 )}
 </div>
 </div>
 </TabsContent>

 <TabsContent value="activity"className="space-y-6 mt-0">
 <div className="space-y-6">
 {activities.length === 0 ? (
 <div className="py-12 flex flex-col items-center justify-center text-muted-foreground opacity-40">
 <History size={32} className="mb-2"/>
 <p className="text-[10px]">No activity recorded</p>
 </div>
 ) : (
 <div className="relative space-y-6 pl-4 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-border/20">
 {activities.map((act) => (
 <div key={act.id} className="relative flex items-start gap-3">
 <div className="absolute -left-[18px] top-1 h-3 w-3 rounded-full bg-background border-2 border-primary shadow-sm z-10"/>
 <div className="flex-1 space-y-1">
 <div className="flex items-center gap-2">
 <span className="text-[10px] text-foreground/80">
 {act.user?.displayName ||"System"}
 </span>
 <span className="text-[8px] font-bold text-muted-foreground tracking-tighter opacity-50">
 {new Date(act.createdAt).toLocaleString()}
 </span>
 </div>
 <p className="text-[11px] text-muted-foreground leading-relaxed">
 {act.description}
 </p>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </TabsContent>
 </div>
 </Tabs>

 <DialogFooter className="p-8 pt-0 flex gap-3">
 <Button
 type="button"
 variant="outline"
 onClick={handleClose}
 className="h-12 rounded-md font-bold flex-1 border-border/40 bg-background/50"
 >
 Cancel
 </Button>
 <Button
 disabled={isLoading || !title.trim()}
 className="h-12 rounded-md font-bold flex-1 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
 >
 {isLoading ? (
 <Loader2 className="h-4 w-4 animate-spin"/>
 ) : (
 isEdit ?"Save Changes":"Create Task"
 )}
 </Button>
 </DialogFooter>
 </form>
 </DialogContent>
 </Dialog>
 );
};