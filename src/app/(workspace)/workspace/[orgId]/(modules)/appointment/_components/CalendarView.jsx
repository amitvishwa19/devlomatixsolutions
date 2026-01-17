import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, Building2, Video, MessageCircle, Phone, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const typeIcons = {
  clinic: Building2,
  video: Video,
  chat: MessageCircle,
  phone: Phone,
};

const statusColors = {
  scheduled: "bg-status-scheduled",
  completed: "bg-status-completed",
  cancelled: "bg-status-cancelled",
  pending: "bg-status-pending",
};

export function CalendarView({ appointments, onSelectAppointment }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startDay = monthStart.getDay();
  const paddingDays = Array(startDay).fill(null);

  const getAppointmentsForDay = (date) => {
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.date);
      return isSameDay(aptDate, date);
    });
  };

  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  return (
    <div className="glass-effect-strong rounded-2xl p-6 lg:p-8">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="icon-container">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="border-border/60 hover:border-primary/40 hover:bg-primary/5 rounded-lg"
          >
            Today
          </Button>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPreviousMonth}
              className="h-9 w-9 rounded-lg border-border/60 hover:border-primary/40"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={goToNextMonth}
              className="h-9 w-9 rounded-lg border-border/60 hover:border-primary/40"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 mb-3">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
          <div
            key={day}
            className={cn(
              "text-center text-xs font-semibold py-3",
              index === 0 || index === 6 ? "text-muted-foreground/60" : "text-muted-foreground"
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {paddingDays.map((_, index) => (
          <div key={`padding-${index}`} className="aspect-square p-1" />
        ))}

        {daysInMonth.map((day) => {
          const dayAppointments = getAppointmentsForDay(day);
          const isToday = isSameDay(day, new Date());
          const isWeekend = day.getDay() === 0 || day.getDay() === 6;

          return (
            <div
              key={day.toISOString()}
              className={cn(
                "aspect-square p-1.5 rounded-xl border border-transparent transition-all duration-200",
                "hover:border-primary/30 hover:bg-primary/5 cursor-pointer",
                isToday && "border-primary/50 bg-primary/10 shadow-glow-sm"
              )}
            >
              <div className="h-full flex flex-col">
                <span
                  className={cn(
                    "text-xs font-semibold mb-1",
                    isToday && "text-primary",
                    !isToday && isWeekend && "text-muted-foreground/60",
                    !isToday && !isWeekend && "text-foreground"
                  )}
                >
                  {format(day, "d")}
                </span>
                <div className="flex-1 space-y-0.5 overflow-hidden">
                  {dayAppointments.slice(0, 2).map((apt) => (
                    <div
                      key={apt.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAppointment?.(apt);
                      }}
                      className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded-md truncate text-white font-medium",
                        "hover:opacity-90 transition-opacity cursor-pointer",
                        statusColors[apt.status]
                      )}
                      title={`${apt.doctorName} - ${apt.time}`}
                    >
                      {apt.time}
                    </div>
                  ))}
                  {dayAppointments.length > 2 && (
                    <div className="text-[10px] text-primary font-medium px-1">
                      +{dayAppointments.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-6 mt-8 pt-6 border-t border-border/40">
        {[
          { label: "Scheduled", color: "bg-status-scheduled" },
          { label: "Completed", color: "bg-status-completed" },
          { label: "Pending", color: "bg-status-pending" },
          { label: "Cancelled", color: "bg-status-cancelled" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded-full", item.color)} />
            <span className="text-xs text-muted-foreground font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CalendarView;
