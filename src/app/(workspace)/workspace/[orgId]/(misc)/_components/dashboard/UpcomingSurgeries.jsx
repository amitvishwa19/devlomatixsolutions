import { Clock, User, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";

const surgeries = [
  {
    id: 1,
    procedure: "Coronary Bypass",
    patient: "Robert Smith",
    doctor: "Dr. Michael Chen",
    time: "09:00 AM",
    duration: "4h",
    status: "in-progress",
    room: "OR-1"
  },
  {
    id: 2,
    procedure: "Hip Replacement",
    patient: "Mary Johnson",
    doctor: "Dr. James Wilson",
    time: "11:30 AM",
    duration: "2.5h",
    status: "scheduled",
    room: "OR-2"
  },
  {
    id: 3,
    procedure: "Appendectomy",
    patient: "David Brown",
    doctor: "Dr. Lisa Anderson",
    time: "02:00 PM",
    duration: "1.5h",
    status: "scheduled",
    room: "OR-3"
  },
  {
    id: 4,
    procedure: "Spinal Fusion",
    patient: "Jennifer Lee",
    doctor: "Dr. Emily Parker",
    time: "04:30 PM",
    duration: "5h",
    status: "scheduled",
    room: "OR-1"
  },
];

const statusStyles = {
  "in-progress": "bg-success/10 text-success border-success/20",
  "scheduled": "bg-secondary text-muted-foreground border-border",
  "completed": "bg-muted text-muted-foreground border-border",
};

export function UpcomingSurgeries() {
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Today's Surgeries</h3>
          <p className="text-xs text-muted-foreground">Operating room schedule</p>
        </div>
        <span className="text-xs font-medium text-primary">{surgeries.length} procedures</span>
      </div>

      <div className="space-y-2">
        {surgeries.map((surgery) => (
          <div 
            key={surgery.id}
            className="rounded-lg bg-secondary/30 p-3 space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-foreground">{surgery.procedure}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <User className="h-3 w-3" />
                  {surgery.patient}
                </p>
              </div>
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full border",
                statusStyles[surgery.status]
              )}>
                {surgery.status === "in-progress" ? "In Progress" : "Scheduled"}
              </span>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {surgery.time} ({surgery.duration})
              </span>
              <span className="flex items-center gap-1">
                <Stethoscope className="h-3 w-3" />
                {surgery.doctor}
              </span>
              <span className="ml-auto font-medium text-foreground">{surgery.room}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
