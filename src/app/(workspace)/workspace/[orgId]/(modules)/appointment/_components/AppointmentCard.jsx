import { 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  Building2, 
  Video, 
  MessageCircle, 
  Phone, 
  MoreVertical, 
  Pencil, 
  Trash2, 
  Eye,
  Bell,
  CheckCircle,
  XCircle,
  PlayCircle,
  Timer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const typeIcons = {
  clinic: Building2,
  video: Video,
  chat: MessageCircle,
  phone: Phone,
};

const typeLabels = {
  clinic: "In-Person",
  video: "Video Call",
  chat: "Chat",
  phone: "Phone Call",
};

export function AppointmentCard({ 
  appointment, 
  onView, 
  onEdit, 
  onDelete, 
  onStatusChange,
  onSendReminder 
}) {
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

  const getPriorityIndicator = () => {
    if (appointment.priority === "high") {
      return <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-status-pending animate-pulse" />;
    }
    return null;
  };

  return (
    <div 
      className="appointment-card cursor-pointer relative"
      onClick={() => onView?.(appointment)}
    >
      {getPriorityIndicator()}
      
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="icon-container shrink-0">
            <Stethoscope className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-foreground truncate">{appointment.doctorName}</h3>
              <span className={cn("status-badge", getStatusClass())}>
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{appointment.specialty}</p>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-secondary">
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-popover border-border/60 rounded-xl p-1.5">
            <DropdownMenuItem 
              onClick={(e) => { e.stopPropagation(); onView?.(appointment); }}
              className="gap-2.5 cursor-pointer rounded-lg"
            >
              <Eye className="h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => { e.stopPropagation(); onEdit?.(appointment); }}
              className="gap-2.5 cursor-pointer rounded-lg"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </DropdownMenuItem>
            
            <DropdownMenuSeparator className="bg-border/60" />
            
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="gap-2.5 cursor-pointer rounded-lg">
                <PlayCircle className="h-4 w-4" />
                Change Status
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="bg-popover border-border/60 rounded-xl p-1.5">
                <DropdownMenuItem 
                  onClick={(e) => { e.stopPropagation(); onStatusChange?.(appointment.id, "scheduled"); }}
                  className="gap-2.5 cursor-pointer rounded-lg"
                >
                  <Timer className="h-4 w-4 text-status-scheduled" />
                  Scheduled
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => { e.stopPropagation(); onStatusChange?.(appointment.id, "pending"); }}
                  className="gap-2.5 cursor-pointer rounded-lg"
                >
                  <Clock className="h-4 w-4 text-status-pending" />
                  Pending
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => { e.stopPropagation(); onStatusChange?.(appointment.id, "completed"); }}
                  className="gap-2.5 cursor-pointer rounded-lg"
                >
                  <CheckCircle className="h-4 w-4 text-status-completed" />
                  Completed
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => { e.stopPropagation(); onStatusChange?.(appointment.id, "cancelled"); }}
                  className="gap-2.5 cursor-pointer rounded-lg"
                >
                  <XCircle className="h-4 w-4 text-status-cancelled" />
                  Cancelled
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            
            {appointment.status === "scheduled" && (
              <DropdownMenuItem 
                onClick={(e) => { e.stopPropagation(); onSendReminder?.(appointment); }}
                className="gap-2.5 cursor-pointer rounded-lg"
              >
                <Bell className="h-4 w-4" />
                Send Reminder
              </DropdownMenuItem>
            )}
            
            <DropdownMenuSeparator className="bg-border/60" />
            
            <DropdownMenuItem 
              onClick={(e) => { e.stopPropagation(); onDelete?.(appointment.id); }}
              className="gap-2.5 cursor-pointer rounded-lg text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="flex items-center gap-2.5">
          <User className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-sm text-foreground truncate">{appointment.patientName}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-sm text-foreground">{appointment.date}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-sm text-foreground">{appointment.time}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <TypeIcon className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-sm text-foreground">{typeLabels[appointment.type] || appointment.type}</span>
        </div>
      </div>

      {appointment.notes && (
        <div className="mt-4 pt-4 border-t border-border/40">
          <p className="text-sm text-muted-foreground line-clamp-1">
            <span className="font-medium text-foreground/70">Note:</span> {appointment.notes}
          </p>
        </div>
      )}
    </div>
  );
}

export default AppointmentCard;
