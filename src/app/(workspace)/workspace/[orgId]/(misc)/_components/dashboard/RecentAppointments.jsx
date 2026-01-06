import { Badge } from "@/components/ui/badge";
import { Clock, Video, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const appointments = [
  {
    id: 1,
    patient: "Sarah Johnson",
    initials: "SJ",
    doctor: "Dr. Michael Chen",
    department: "Cardiology",
    time: "09:00 AM",
    status: "confirmed",
    type: "video",
  },
  {
    id: 2,
    patient: "Robert Williams",
    initials: "RW",
    doctor: "Dr. Emily Parker",
    department: "Neurology",
    time: "10:30 AM",
    status: "in-progress",
    type: "in-person",
  },
  {
    id: 3,
    patient: "Maria Garcia",
    initials: "MG",
    doctor: "Dr. James Wilson",
    department: "Orthopedics",
    time: "11:15 AM",
    status: "confirmed",
    type: "in-person",
  },
  {
    id: 4,
    patient: "David Brown",
    initials: "DB",
    doctor: "Dr. Lisa Anderson",
    department: "Dermatology",
    time: "02:00 PM",
    status: "pending",
    type: "video",
  },
];

const statusStyles = {
  confirmed: "bg-success/10 text-success border-success/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  "in-progress": "bg-info/10 text-info border-info/20",
};

export function RecentAppointments() {
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Today's Appointments</h3>
          <p className="text-xs text-muted-foreground">4 scheduled for today</p>
        </div>
        <button className="text-xs text-primary hover:underline">View All</button>
      </div>

      <div className="space-y-2">
        {appointments.map((appointment) => (
          <div 
            key={appointment.id} 
            className="flex items-center gap-3 rounded-lg bg-secondary/30 p-3 hover:bg-secondary/50 transition-colors"
          >
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
              {appointment.initials}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground truncate">{appointment.patient}</p>
                {appointment.type === "video" ? (
                  <Video className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                ) : (
                  <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {appointment.doctor} • {appointment.department}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {appointment.time}
              </div>
              <Badge 
                variant="outline" 
                className={cn(
                  "capitalize text-xs px-2 py-0",
                  statusStyles[appointment.status]
                )}
              >
                {appointment.status.replace("-", " ")}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
