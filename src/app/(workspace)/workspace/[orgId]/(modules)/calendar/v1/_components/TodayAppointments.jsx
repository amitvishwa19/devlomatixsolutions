import { Clock, User, Stethoscope } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";



const statusVariants = {
  scheduled: { variant: "outline", label: "Scheduled" },
  confirmed: { variant: "default", label: "Confirmed" },
  "in-progress": { variant: "secondary", label: "In Progress" },
  completed: { variant: "secondary", label: "Completed" },
  cancelled: { variant: "destructive", label: "Cancelled" },
  "no-show": { variant: "destructive", label: "No Show" },
};

export function TodayAppointments({ appointments, onAppointmentClick }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          Today's Appointments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {appointments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No appointments scheduled for today
          </p>
        ) : (
          appointments
            .sort((a, b) => a.startTime.localeCompare(b.startTime))
            .map((apt, index) => (
              <div
                key={apt.id}
                className="p-3 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors animate-fade-in"
                style={{ animationDelay: `${index * 75}ms` }}
                onClick={() => onAppointmentClick(apt)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{apt.startTime} - {apt.endTime}</span>
                  <Badge variant={statusVariants[apt.status].variant}>
                    {statusVariants[apt.status].label}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{apt.patientName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Stethoscope className="h-3.5 w-3.5" />
                    <span>{apt.doctorName}</span>
                  </div>
                </div>
              </div>
            ))
        )}
      </CardContent>
    </Card>
  );
}
