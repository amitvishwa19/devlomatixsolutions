import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const doctors = [
  { id: 1, name: "Dr. Michael Chen", specialty: "Cardiology", initials: "MC", status: "available", patients: 12 },
  { id: 2, name: "Dr. Emily Parker", specialty: "Neurology", initials: "EP", status: "busy", patients: 8 },
  { id: 3, name: "Dr. James Wilson", specialty: "Orthopedics", initials: "JW", status: "available", patients: 15 },
  { id: 4, name: "Dr. Lisa Anderson", specialty: "Dermatology", initials: "LA", status: "away", patients: 6 },
  { id: 5, name: "Dr. Sarah Johnson", specialty: "Pediatrics", initials: "SJ", status: "available", patients: 10 },
];

const statusStyles = {
  available: "bg-success",
  busy: "bg-warning",
  away: "bg-muted-foreground",
};

export function DoctorsList() {
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Active Doctors</h3>
          <p className="text-xs text-muted-foreground">Currently on shift</p>
        </div>
        <span className="text-xs text-muted-foreground">{doctors.length} total</span>
      </div>

      <div className="space-y-2">
        {doctors.map((doctor) => (
          <div 
            key={doctor.id}
            className="flex items-center gap-3 rounded-lg bg-secondary/30 p-2.5"
          >
            <div className="relative">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {doctor.initials}
                </AvatarFallback>
              </Avatar>
              <span className={cn(
                "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-card",
                statusStyles[doctor.status]
              )} />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{doctor.name}</p>
              <p className="text-xs text-muted-foreground">{doctor.specialty}</p>
            </div>

            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{doctor.patients}</p>
              <p className="text-xs text-muted-foreground">patients</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
