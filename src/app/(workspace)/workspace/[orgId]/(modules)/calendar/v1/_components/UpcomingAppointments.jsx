import { CalendarDays, User, Stethoscope } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, isToday, isTomorrow } from "date-fns";



const typeColors = {
  consultation: "bg-info/10 text-info",
  "follow-up": "bg-primary/10 text-primary",
  procedure: "bg-warning/10 text-warning",
  emergency: "bg-destructive/10 text-destructive",
  checkup: "bg-success/10 text-success",
};

export function UpcomingAppointments({ appointments, onAppointmentClick }) {
  const getDateLabel = (date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "EEE, MMM d");
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary" />
          Upcoming (7 days)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {appointments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No upcoming appointments
          </p>
        ) : (
          appointments.slice(0, 6).map((apt, index) => (
            <div
              key={apt.id}
              className="p-3 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors animate-fade-in"
              style={{ animationDelay: `${index * 75}ms` }}
              onClick={() => onAppointmentClick(apt)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">
                  {getDateLabel(new Date(apt.date))} at {apt.startTime}
                </span>
                <Badge className={typeColors[apt.type]} variant="secondary">
                  {apt.type}
                </Badge>
              </div>
              <div className="font-medium text-sm mb-1">{apt.title}</div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span>{apt.patientName}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Stethoscope className="h-3 w-3" />
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
