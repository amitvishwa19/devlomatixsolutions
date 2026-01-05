import { Calendar, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Appointment } from "./types";
import { isToday, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";

interface AppointmentStatsProps {
  appointments: Appointment[];
}

export function AppointmentStats({ appointments }: AppointmentStatsProps) {
  const today = new Date();
  const weekStart = startOfWeek(today);
  const weekEnd = endOfWeek(today);

  const todayCount = appointments.filter((apt) => isToday(new Date(apt.date))).length;
  const weekCount = appointments.filter((apt) => 
    isWithinInterval(new Date(apt.date), { start: weekStart, end: weekEnd })
  ).length;
  const completedCount = appointments.filter((apt) => apt.status === "completed").length;
  const cancelledCount = appointments.filter((apt) => apt.status === "cancelled").length;

  const stats = [
    {
      label: "Today",
      value: todayCount,
      icon: Calendar,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "This Week",
      value: weekCount,
      icon: Clock,
      color: "text-info",
      bgColor: "bg-info/10",
    },
    {
      label: "Completed",
      value: completedCount,
      icon: CheckCircle2,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      label: "Cancelled",
      value: cancelledCount,
      icon: XCircle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card 
          key={stat.label}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
