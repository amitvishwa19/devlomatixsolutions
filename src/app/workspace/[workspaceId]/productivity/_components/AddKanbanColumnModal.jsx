'use client';

import { useState, useEffect } from "react";
import { useModal } from "@/hooks/useModal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, LayoutPanelTop, Type, Edit3 } from "lucide-react";
import { toast } from "sonner";
import { createKanbanColumnAction, updateKanbanColumnAction } from "../kanban/_actions/kanban-actions";

export const AddKanbanColumnModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const isModalOpen = isOpen && type === "addKanbanColumn";
  const { workspaceId, onApply, order, column } = data || {};
  const isEdit = !!column;

  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (isModalOpen) {
      if (column) {
        setTitle(column.title || "");
      } else {
        setTitle("");
      }
    }
  }, [isModalOpen, column]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setIsLoading(true);

      let res;
      if (isEdit) {
        res = await updateKanbanColumnAction(column.id, title.trim());
      } else {
        res = await createKanbanColumnAction(workspaceId, title.trim(), order || 0);
      }

      if (!res?.success) throw new Error(res?.error || `Failed to ${isEdit ? 'update' : 'create'} column`);

      toast.success(`Column ${isEdit ? 'updated' : 'created'} successfully`);
      
      if (onApply) onApply(res.column);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md overflow-hidden border shadow-2xl p-0 bg-background rounded-2xl">
        <form onSubmit={onSubmit} className="flex flex-col">
          <DialogHeader className="p-6 pb-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 shadow-xs">
                {isEdit ? (
                  <Edit3 className="h-5 w-5 text-primary" />
                ) : (
                  <LayoutPanelTop className="h-5 w-5 text-primary" />
                )}
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">
                  {isEdit ? "Rename Column" : "Create New Column"}
                </DialogTitle>
                <DialogDescription className="text-xs font-medium text-muted-foreground mt-0.5">
                  {isEdit ? "Update column title." : "Add a new stage to your workspace's Kanban board."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 opacity-80">
                <Type size={12} className="text-primary" /> Column Title
              </label>
              <Input
                disabled={isLoading}
                className="h-11 bg-muted/20 border-border/40 rounded-xl focus-visible:ring-1 focus-visible:ring-primary shadow-xs text-sm font-bold"
                placeholder="e.g. TO DO, IN PROGRESS, DONE"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          <DialogFooter className="p-6 pt-0 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              disabled={isLoading}
              onClick={handleClose}
              className="rounded-xl h-10 text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !title.trim()}
              className="rounded-xl h-10 px-5 text-xs font-bold shadow-lg shadow-primary/25"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEdit ? "Update Column" : "Create Column"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};