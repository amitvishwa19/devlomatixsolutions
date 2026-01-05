import { format } from "date-fns";
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  Building2,
  FileText,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Appointment } from "./types";

interface ViewAppointmentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  onEdit: (appointment: Appointment) => void;
  onDelete: (id: string) => void;
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
}

const statusVariants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
  scheduled: { variant: "outline", label: "Scheduled" },
  confirmed: { variant: "default", label: "Confirmed" },
  "in-progress": { variant: "secondary", label: "In Progress" },
  completed: { variant: "secondary", label: "Completed" },
  cancelled: { variant: "destructive", label: "Cancelled" },
  "no-show": { variant: "destructive", label: "No Show" },
};

const typeColors: Record<string, string> = {
  consultation: "bg-info/10 text-info",
  "follow-up": "bg-primary/10 text-primary",
  procedure: "bg-warning/10 text-warning",
  emergency: "bg-destructive/10 text-destructive",
  checkup: "bg-success/10 text-success",
};

export function ViewAppointmentSheet({
  open,
  onOpenChange,
  appointment,
  onEdit,
  onDelete,
  onConfirm,
  onCancel,
}: ViewAppointmentSheetProps) {
  if (!appointment) return null;

  const canConfirm = appointment.status === "scheduled";
  const canCancel = appointment.status === "scheduled" || appointment.status === "confirmed";
  const canEdit = appointment.status !== "completed" && appointment.status !== "cancelled";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[500px]">
        <SheetHeader>
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-xl">{appointment.title}</SheetTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={statusVariants[appointment.status].variant}>
                  {statusVariants[appointment.status].label}
                </Badge>
                <Badge className={typeColors[appointment.type]} variant="secondary">
                  {appointment.type}
                </Badge>
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Date & Time */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Schedule
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{format(new Date(appointment.date), "EEEE, MMMM d, yyyy")}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{appointment.startTime} - {appointment.endTime}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Patient & Doctor */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Details
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Patient</p>
                  <p className="text-sm font-medium">{appointment.patientName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-info/10">
                  <Stethoscope className="h-4 w-4 text-info" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Doctor</p>
                  <p className="text-sm font-medium">{appointment.doctorName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <Building2 className="h-4 w-4 text-success" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Department</p>
                  <p className="text-sm font-medium">{appointment.department}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {appointment.notes && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Notes
                </h4>
                <div className="flex items-start gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <p className="text-sm">{appointment.notes}</p>
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Actions */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Actions
            </h4>
            <div className="flex flex-wrap gap-2">
              {canConfirm && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onConfirm(appointment.id)}
                  className="text-success border-success/30 hover:bg-success/10"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Confirm
                </Button>
              )}
              {canCancel && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCancel(appointment.id)}
                  className="text-warning border-warning/30 hover:bg-warning/10"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              )}
              {canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onOpenChange(false);
                    onEdit(appointment);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(appointment.id)}
                className="text-destructive border-destructive/30 hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>

          {/* Metadata */}
          <div className="pt-4 text-xs text-muted-foreground">
            <p>Created: {format(new Date(appointment.createdAt), "PPp")}</p>
            <p>Updated: {format(new Date(appointment.updatedAt), "PPp")}</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
