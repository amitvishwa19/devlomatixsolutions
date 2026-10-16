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
import { Loader2, Plus, Columns } from 'lucide-react';
import { toast } from "sonner";
import { createKanbanColumnAction } from '../../../productivity/kanban/_actions/kanban-actions';

export const CreateStageModal = ({
  isOpen,
  onClose,
  workspaceId,
  order = 0,
  onSuccess
}) => {
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a stage name");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await createKanbanColumnAction(workspaceId, title.trim(), order);
      if (!res.success) throw new Error(res.error);

      toast.success("Stage added");
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to add stage", err);
      toast.error(err.message || "Failed to create stage");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl border-border/50 bg-card/95 backdrop-blur-xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="p-5 pb-3 border-b border-border/30 bg-muted/10">
            <DialogTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
              <Columns size={16} className="text-primary" />
              <span>Add Board Stage</span>
            </DialogTitle>
          </DialogHeader>

          <div className="p-5 space-y-3">
            <div>
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                Stage Name *
              </label>
              <Input
                placeholder="e.g., Qualified Leads, Contract Sent, Negotiation..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                className="text-xs font-semibold h-9 rounded-xl bg-background/50 border-border/40"
              />
            </div>
            <p className="text-[11px] text-muted-foreground/70">
              Stages organize your tasks and deals from initial contact to completion.
            </p>
          </div>

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
                  Creating...
                </>
              ) : (
                "Add Stage"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
