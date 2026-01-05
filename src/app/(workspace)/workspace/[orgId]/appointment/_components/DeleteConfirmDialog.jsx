import { AlertTriangle } from "lucide-react";
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

export function DeleteConfirmDialog({ open, onOpenChange, onConfirm, appointmentName }) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card border-border/60 rounded-2xl max-w-md">
        <AlertDialogHeader className="space-y-4">
          <div className="mx-auto p-4 rounded-2xl bg-destructive/10 w-fit">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <AlertDialogTitle className="text-center text-xl font-bold text-foreground">
            Delete Appointment
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-muted-foreground leading-relaxed">
            Are you sure you want to delete this appointment with{" "}
            <span className="font-semibold text-foreground">{appointmentName}</span>? 
            This action cannot be undone and all associated data will be permanently removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-3 sm:gap-3 pt-4">
          <AlertDialogCancel className="flex-1 sm:flex-none border-border/60 rounded-xl hover:bg-secondary">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="flex-1 sm:flex-none bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
          >
            Delete Appointment
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteConfirmDialog;
