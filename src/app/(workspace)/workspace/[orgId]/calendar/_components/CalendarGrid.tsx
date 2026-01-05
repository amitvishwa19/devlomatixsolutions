import { format, isSameMonth, isSameDay, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import { Appointment, CalendarView } from "./types";

interface CalendarGridProps {
  days: Date[];
  selectedDate: Date;
  calendarView: CalendarView;
  getAppointmentsForDay: (date: Date) => Appointment[];
  onDayClick: (date: Date) => void;
  onAppointmentClick: (appointment: Appointment) => void;
}

const statusColors: Record<string, string> = {
  scheduled: "bg-info/20 text-info border-info/30",
  confirmed: "bg-success/20 text-success border-success/30",
  "in-progress": "bg-warning/20 text-warning border-warning/30",
  completed: "bg-muted text-muted-foreground border-muted",
  cancelled: "bg-destructive/20 text-destructive border-destructive/30",
  "no-show": "bg-destructive/20 text-destructive border-destructive/30",
};

export function CalendarGrid({
  days,
  selectedDate,
  calendarView,
  getAppointmentsForDay,
  onDayClick,
  onAppointmentClick,
}: CalendarGridProps) {
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  if (calendarView === "month") {
    return (
      <div className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in">
        {/* Week day headers */}
        <div className="grid grid-cols-7 bg-muted/30">
          {weekDays.map((day) => (
            <div
              key={day}
              className="px-2 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 divide-x divide-y divide-border">
          {days.map((day, index) => {
            const dayAppointments = getAppointmentsForDay(day);
            const isCurrentMonth = isSameMonth(day, selectedDate);
            const isSelected = isSameDay(day, selectedDate);
            const isDayToday = isToday(day);

            return (
              <div
                key={index}
                className={cn(
                  "min-h-[100px] p-2 cursor-pointer transition-colors hover:bg-accent/50",
                  !isCurrentMonth && "bg-muted/20",
                  isSelected && "bg-accent"
                )}
                onClick={() => onDayClick(day)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={cn(
                      "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
                      !isCurrentMonth && "text-muted-foreground",
                      isDayToday && "bg-primary text-primary-foreground"
                    )}
                  >
                    {format(day, "d")}
                  </span>
                  {dayAppointments.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {dayAppointments.length}
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  {dayAppointments.slice(0, 3).map((apt) => (
                    <div
                      key={apt.id}
                      className={cn(
                        "text-xs px-1.5 py-0.5 rounded truncate border cursor-pointer hover:opacity-80",
                        statusColors[apt.status]
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAppointmentClick(apt);
                      }}
                    >
                      {apt.startTime} {apt.patientName}
                    </div>
                  ))}
                  {dayAppointments.length > 3 && (
                    <div className="text-xs text-muted-foreground px-1.5">
                      +{dayAppointments.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (calendarView === "week") {
    const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

    return (
      <div className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in">
        {/* Week day headers */}
        <div className="grid grid-cols-8 bg-muted/30 sticky top-0">
          <div className="px-2 py-3 text-center text-xs font-medium text-muted-foreground border-r border-border">
            Time
          </div>
          {days.map((day) => (
            <div
              key={day.toString()}
              className={cn(
                "px-2 py-3 text-center cursor-pointer hover:bg-accent/50",
                isToday(day) && "bg-primary/10"
              )}
              onClick={() => onDayClick(day)}
            >
              <div className="text-xs text-muted-foreground">{format(day, "EEE")}</div>
              <div
                className={cn(
                  "text-lg font-semibold mt-1",
                  isToday(day) && "text-primary"
                )}
              >
                {format(day, "d")}
              </div>
            </div>
          ))}
        </div>

        {/* Time grid */}
        <div className="divide-y divide-border">
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-8 min-h-[60px]">
              <div className="px-2 py-1 text-xs text-muted-foreground border-r border-border flex items-start justify-center pt-1">
                {format(new Date().setHours(hour, 0), "h a")}
              </div>
              {days.map((day) => {
                const dayAppointments = getAppointmentsForDay(day).filter((apt) => {
                  const aptHour = parseInt(apt.startTime.split(":")[0]);
                  return aptHour === hour;
                });

                return (
                  <div
                    key={day.toString()}
                    className="p-1 border-r border-border last:border-r-0 hover:bg-accent/30 cursor-pointer"
                    onClick={() => onDayClick(day)}
                  >
                    {dayAppointments.map((apt) => (
                      <div
                        key={apt.id}
                        className={cn(
                          "text-xs p-1.5 rounded border mb-1 cursor-pointer hover:opacity-80",
                          statusColors[apt.status]
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAppointmentClick(apt);
                        }}
                      >
                        <div className="font-medium truncate">{apt.patientName}</div>
                        <div className="truncate opacity-80">{apt.startTime} - {apt.endTime}</div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Day view
  const hours = Array.from({ length: 12 }, (_, i) => i + 8);
  const dayAppointments = getAppointmentsForDay(days[0]);

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in">
      <div className="divide-y divide-border">
        {hours.map((hour) => {
          const hourAppointments = dayAppointments.filter((apt) => {
            const aptHour = parseInt(apt.startTime.split(":")[0]);
            return aptHour === hour;
          });

          return (
            <div key={hour} className="grid grid-cols-12 min-h-[80px]">
              <div className="col-span-1 px-3 py-2 text-sm text-muted-foreground border-r border-border flex items-start justify-end pt-2">
                {format(new Date().setHours(hour, 0), "h a")}
              </div>
              <div className="col-span-11 p-2 hover:bg-accent/30">
                {hourAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className={cn(
                      "p-3 rounded-lg border mb-2 cursor-pointer hover:opacity-80 transition-opacity",
                      statusColors[apt.status]
                    )}
                    onClick={() => onAppointmentClick(apt)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{apt.title}</span>
                      <span className="text-sm">{apt.startTime} - {apt.endTime}</span>
                    </div>
                    <div className="text-sm mt-1">
                      <span className="font-medium">Patient:</span> {apt.patientName}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Doctor:</span> {apt.doctorName}
                    </div>
                    {apt.notes && (
                      <div className="text-sm mt-1 opacity-80 truncate">
                        {apt.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
