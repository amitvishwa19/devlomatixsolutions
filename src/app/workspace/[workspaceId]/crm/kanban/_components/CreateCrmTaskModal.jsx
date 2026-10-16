'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Trash2,
  CheckSquare,
  Calendar,
  AlertCircle,
  Tag,
  Loader2,
  Sparkles
} from 'lucide-react';
import { toast } from "sonner";
import {
  createKanbanTaskAction,
  updateKanbanTaskAction
} from '../../../productivity/kanban/_actions/kanban-actions';

export const CreateCrmTaskModal = ({
  isOpen,
  onClose,
  workspaceId,
  columns = [],
  defaultColumnId,
  taskToEdit = null,
  onSuccess
}) => {
  const isEdit = !!taskToEdit;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [columnId, setColumnId] = useState('');
  const [priority, setPriority] = useState('medium');
  const [type, setType] = useState('task');
  const [dueDate, setDueDate] = useState('');
  const [checklists, setChecklists] = useState([]);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (taskToEdit) {
        setTitle(taskToEdit.title || '');
        setContent(taskToEdit.content || '');
        setColumnId(taskToEdit.columnId || (columns[0]?.id || ''));
        setPriority(taskToEdit.priority || 'medium');
        setType(taskToEdit.type || 'task');
        setDueDate(
          taskToEdit.dueDate
            ? new Date(taskToEdit.dueDate).toISOString().split('T')[0]
            : ''
        );
        setChecklists(
          Array.isArray(taskToEdit.checklists)
            ? taskToEdit.checklists.map(c => ({ title: c.title, completed: c.completed }))
            : []
        );
      } else {
        setTitle('');
        setContent('');
        setColumnId(defaultColumnId || (columns[0]?.id || ''));
        setPriority('medium');
        setType('task');
        setDueDate('');
        setChecklists([]);
      }
      setNewChecklistText('');
    }
  }, [isOpen, taskToEdit, defaultColumnId, columns]);

  const handleAddChecklist = (e) => {
    e?.preventDefault();
    if (!newChecklistText.trim()) return;
    setChecklists(prev => [...prev, { title: newChecklistText.trim(), completed: false }]);
    setNewChecklistText('');
  };

  const handleToggleChecklist = (idx) => {
    setChecklists(prev => prev.map((item, i) => i === idx ? { ...item, completed: !item.completed } : item));
  };

  const handleRemoveChecklist = (idx) => {
    setChecklists(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    if (!columnId) {
      toast.error("Please select a stage");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        title: title.trim(),
        content: content.trim() || undefined,
        columnId,
        priority,
        type,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        checklists: checklists.map((c, i) => ({
          title: c.title,
          completed: c.completed,
          order: i
        }))
      };

      if (isEdit) {
        const res = await updateKanbanTaskAction(taskToEdit.id, payload);
        if (!res.success) throw new Error(res.error);
        toast.success("Task updated");
      } else {
        const res = await createKanbanTaskAction(workspaceId, payload);
        if (!res.success) throw new Error(res.error);
        toast.success("Task created");
      }

      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to save CRM task", err);
      toast.error(err.message || "Failed to save task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden rounded-2xl border-border/50 bg-card/95 backdrop-blur-xl">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <DialogHeader className="p-5 pb-3 border-b border-border/30 bg-muted/10">
            <DialogTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
              <Sparkles size={16} className="text-primary" />
              <span>{isEdit ? "Edit CRM Task" : "Create New CRM Task"}</span>
            </DialogTitle>
          </DialogHeader>

          {/* Form Body */}
          <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
            {/* Title */}
            <div>
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                Task Title *
              </label>
              <Input
                placeholder="e.g., Follow up with Acme Corp regarding Q4 Proposal"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                className="text-xs font-semibold h-9 rounded-xl bg-background/50 border-border/40 focus:ring-1 focus:ring-primary/40"
              />
            </div>

            {/* Stage & Priority Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                  Stage *
                </label>
                <Select value={columnId} onValueChange={setColumnId}>
                  <SelectTrigger className="text-xs font-bold h-9 rounded-xl bg-background/50 border-border/40">
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl font-medium">
                    {columns.map(col => (
                      <SelectItem key={col.id} value={col.id}>
                        {col.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                  Priority
                </label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="text-xs font-bold h-9 rounded-xl bg-background/50 border-border/40">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl font-medium">
                    <SelectItem value="urgent" className="text-rose-500 font-bold">Urgent</SelectItem>
                    <SelectItem value="high" className="text-amber-500 font-bold">High</SelectItem>
                    <SelectItem value="medium" className="text-blue-500 font-bold">Medium</SelectItem>
                    <SelectItem value="low" className="text-emerald-500 font-bold">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Type & Due Date Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                  Type
                </label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="text-xs font-bold h-9 rounded-xl bg-background/50 border-border/40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl font-medium">
                    <SelectItem value="task">Task</SelectItem>
                    <SelectItem value="deal">Deal</SelectItem>
                    <SelectItem value="follow-up">Follow-up</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="note">Note / Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                  Due Date
                </label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="text-xs font-semibold h-9 rounded-xl bg-background/50 border-border/40"
                />
              </div>
            </div>

            {/* Description / Content */}
            <div>
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                Details & Notes
              </label>
              <Textarea
                placeholder="Add contextual details, client background, action items, or meeting notes..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                className="text-xs font-medium rounded-xl bg-background/50 border-border/40 resize-none leading-relaxed"
              />
            </div>

            {/* Checklists */}
            <div>
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CheckSquare size={13} className="text-primary" />
                  <span>Action Items & Checklists</span>
                </span>
                <span className="text-[10px] text-muted-foreground/60">{checklists.length} items</span>
              </label>

              {/* Add Checklist Item input */}
              <div className="flex items-center gap-2 mb-2">
                <Input
                  placeholder="Add a checklist item and press Enter..."
                  value={newChecklistText}
                  onChange={(e) => setNewChecklistText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddChecklist();
                    }
                  }}
                  className="text-xs h-8 rounded-lg bg-background/50 border-border/40"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddChecklist}
                  className="h-8 px-2.5 text-xs font-bold shrink-0 rounded-lg"
                >
                  <Plus size={13} className="mr-1" /> Add
                </Button>
              </div>

              {/* Checklist items list */}
              {checklists.length > 0 && (
                <div className="space-y-1.5 p-2 rounded-xl bg-muted/20 border border-border/30 max-h-36 overflow-y-auto">
                  {checklists.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-background/60 border border-border/30 text-xs"
                    >
                      <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => handleToggleChecklist(idx)}
                          className="h-3.5 w-3.5 rounded text-primary border-border/60"
                        />
                        <span className={`truncate text-xs font-medium ${item.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {item.title}
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemoveChecklist(idx)}
                        className="text-muted-foreground/60 hover:text-rose-500 transition-colors p-0.5"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="p-4 border-t border-border/30 bg-muted/10 gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-9 px-4 text-xs font-semibold rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-9 px-5 text-xs font-bold rounded-xl shadow-md shadow-primary/20 bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="mr-1.5 animate-spin" />
                  Saving...
                </>
              ) : (
                isEdit ? "Update Task" : "Create Task"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
