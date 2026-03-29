'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export const AlertModal = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  variant = "destructive"
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="rounded-3xl border-none shadow-2xl p-6 bg-card/95 backdrop-blur-xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl tracking-tight italic">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="font-medium text-muted-foreground/80 leading-relaxed">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-2 pt-4">
          <AlertDialogCancel asChild>
            <Button 
              variant="outline" 
              disabled={loading}
              onClick={onClose}
              className="h-11 rounded-xl font-bold border-border/40 bg-background/50 flex-1"
            >
              {cancelText}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant={variant}
              disabled={loading}
              onClick={(e) => {
                e.preventDefault();
                onConfirm();
              }}
              className={`h-11 rounded-xl font-bold flex-1 shadow-lg ${variant === 'destructive' ? 'shadow-rose-500/20' : 'shadow-primary/20'}`}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : confirmText}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
