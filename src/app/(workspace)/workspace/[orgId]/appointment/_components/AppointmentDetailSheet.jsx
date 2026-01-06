import {
    Calendar,
    Clock,
    User,
    Stethoscope,
    Building2,
    Video,
    MessageCircle,
    Phone,
    FileText,
    Tag,
    Mail,
    PhoneCall,
    Timer,
    Bell,
    CheckCircle,
    XCircle,
    AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

const typeIcons = {
    clinic: Building2,
    video: Video,
    chat: MessageCircle,
    phone: Phone,
};

const typeLabels = {
    clinic: "In-Person Visit",
    video: "Video Consultation",
    chat: "Chat Consultation",
    phone: "Phone Consultation",
};

export function AppointmentDetailSheet({
    open,
    onOpenChange,
    appointment,
    onEdit,
    onDelete,
    onStatusChange,
    onSendReminder
}) {
    if (!appointment) return null;

    const TypeIcon = typeIcons[appointment.type] || Building2;

    const getStatusClass = () => {
        switch (appointment.status) {
            case "scheduled": return "status-scheduled";
            case "completed": return "status-completed";
            case "pending": return "status-pending";
            case "cancelled": return "status-cancelled";
            default: return "status-scheduled";
        }
    };

    const getStatusIcon = () => {
        switch (appointment.status) {
            case "scheduled": return Timer;
            case "completed": return CheckCircle;
            case "pending": return AlertCircle;
            case "cancelled": return XCircle;
            default: return Timer;
        }
    };

    const StatusIcon = getStatusIcon();

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="min-w-[620px] bg-transparent border-0 p-2">
                <div className="bg-card rounded-md h-full border overflow-hidden">
                    <SheetHeader className="space-y-4 pb-6">
                        <div className="flex items-center gap-3">
                            <div className="icon-container">
                                <Stethoscope className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <SheetTitle className="text-md font-bold text-foreground">
                                    Appointment Details
                                </SheetTitle>
                                <SheetDescription className="text-muted-foreground text-xs">
                                    Full information about this appointment
                                </SheetDescription>
                            </div>
                        </div>
                    </SheetHeader>

                    <ScrollArea className=" h-[83vh] p-4">
                        <div className="space-y-6 py-4 text-sm ">
                            {/* Status Section */}
                            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border/60">
                                <div className="flex items-center gap-3">
                                    <StatusIcon className={cn(
                                        "h-5 w-5",
                                        appointment.status === "scheduled" && "text-status-scheduled",
                                        appointment.status === "completed" && "text-status-completed",
                                        appointment.status === "pending" && "text-status-pending",
                                        appointment.status === "cancelled" && "text-status-cancelled",
                                    )} />
                                    <span className="text-sm font-medium text-muted-foreground">Current Status</span>
                                </div>
                                <span className={cn("status-badge text-sm", getStatusClass())}>
                                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                </span>
                            </div>

                            {/* Quick Actions */}
                            {appointment.status !== "cancelled" && appointment.status !== "completed" && (
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onStatusChange?.(appointment.id, "completed")}
                                        className="flex-1 gap-2 border-status-completed/30 text-status-completed hover:bg-status-completed/10 hover:border-status-completed/50"
                                    >
                                        <CheckCircle className="h-4 w-4" />
                                        Mark Complete
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onSendReminder?.(appointment)}
                                        className="flex-1 gap-2 border-border/60"
                                    >
                                        <Bell className="h-4 w-4" />
                                        Send Reminder
                                    </Button>
                                </div>
                            )}

                            <Separator className="bg-border/40" />

                            {/* Doctor Info */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Doctor Information</h4>
                                <div className="flex items-start gap-4 p-4 rounded-xl bg-secondary/30 border border-border/30">
                                    <div className="icon-container">
                                        <Stethoscope className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-semibold text-foreground">Dr. {appointment?.doctor?.displayName}</h3>
                                        <p className="text-sm text-muted-foreground">{appointment.department || 'General Plysician'}</p>
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-border/40" />

                            {/* Patient Info */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Patient Information</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20">
                                        <User className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Patient Name</p>
                                            <p className="text-foreground font-medium">{appointment?.patient?.displayName}</p>
                                        </div>
                                    </div>
                                    {appointment?.patient?.email && (
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20">
                                            <Mail className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Email</p>
                                                <p className="text-foreground font-medium">{appointment?.patient?.email}</p>
                                            </div>
                                        </div>
                                    )}
                                    {appointment.patientPhone && (
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20">
                                            <PhoneCall className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Phone</p>
                                                <p className="text-foreground font-medium">{appointment?.patient?.phone || 'NA'}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Separator className="bg-border/40" />

                            {/* Appointment Details */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Appointment Details</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20">
                                        <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-xs text-muted-foreground">Date</p>
                                            <p className="text-foreground font-medium truncate">{format(appointment.date, "dd MMM yyyy")}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20">
                                        <Clock className="h-5 w-5 text-muted-foreground shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-xs text-muted-foreground">Time</p>
                                            <p className="text-foreground font-medium truncate">{appointment.time}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20">
                                        <TypeIcon className="h-5 w-5 text-muted-foreground shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-xs text-muted-foreground">Type</p>
                                            <p className="text-foreground font-medium truncate">{typeLabels[appointment.type.type] || appointment.type.type}</p>
                                        </div>
                                    </div>

                                    {appointment.visitType && (
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20">
                                            <Tag className="h-5 w-5 text-muted-foreground shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-xs text-muted-foreground">Visit Type</p>
                                                <p className="text-foreground font-medium capitalize truncate">{appointment.visitType}</p>
                                            </div>
                                        </div>
                                    )}


                                </div>
                            </div>

                            {/* Appointment Details */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Appointment Details</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20">
                                        <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-xs text-muted-foreground">Date</p>
                                            <p className="text-foreground font-medium truncate">{format(appointment.date, "dd MMM yyyy")}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20">
                                        <Clock className="h-5 w-5 text-muted-foreground shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-xs text-muted-foreground">Time</p>
                                            <p className="text-foreground font-medium truncate">{appointment.time}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20">
                                        <TypeIcon className="h-5 w-5 text-muted-foreground shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-xs text-muted-foreground">Type</p>
                                            <p className="text-foreground font-medium truncate">{typeLabels[appointment.type.type] || appointment.type.type}</p>
                                        </div>
                                    </div>

                                    {appointment.visitType && (
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20">
                                            <Tag className="h-5 w-5 text-muted-foreground shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-xs text-muted-foreground">Visit Type</p>
                                                <p className="text-foreground font-medium capitalize truncate">{appointment.visitType}</p>
                                            </div>
                                        </div>
                                    )}


                                </div>
                            </div>

                            {/* Notes */}
                            {appointment.notes && (
                                <>
                                    <Separator className="bg-border/40" />
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Notes</h4>
                                        <div className="p-4 rounded-xl bg-secondary/30 border border-border/30">
                                            <div className="flex items-start gap-3">
                                                <FileText className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                                                <p className="text-foreground text-sm leading-relaxed">{appointment.notes}</p>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </ScrollArea>

                    <SheetFooter className="pt-4  border-t border-border/60 mt-0 flex flex-row items-center gap-2 justify-end">
                        <Button
                            variant="destructive"
                            onClick={() => onDelete?.(appointment.id)}
                            className="flex-1 sm:flex-none rounded-md"
                        >
                            Delete
                        </Button>
                        <Button
                            onClick={() => onEdit?.(appointment)}
                            className="flex-1 sm:flex-none bg-primary text-primary-foreground hover:bg-primary/90 rounded-md shadow-glow-sm"
                        >
                            Edit Appointment
                        </Button>
                    </SheetFooter>
                </div>
            </SheetContent>
        </Sheet>
    );
}

export default AppointmentDetailSheet;
