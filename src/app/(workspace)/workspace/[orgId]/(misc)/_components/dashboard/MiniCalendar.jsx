import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const events = [
  { date: 5, type: "surgery", count: 3 },
  { date: 8, type: "appointment", count: 12 },
  { date: 12, type: "meeting", count: 2 },
  { date: 15, type: "surgery", count: 5 },
  { date: 18, type: "appointment", count: 8 },
  { date: 22, type: "meeting", count: 1 },
  { date: 25, type: "surgery", count: 4 },
];

const eventColors = {
  surgery: "bg-destructive",
  appointment: "bg-primary",
  meeting: "bg-warning",
};

export function MiniCalendar() {
  const [currentDate] = useState(new Date());
  const today = currentDate.getDate();
  const month = currentDate.toLocaleString("default", { month: "long" });
  const year = currentDate.getFullYear();
  
  const daysInMonth = new Date(year, currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, currentDate.getMonth(), 1).getDay();
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingDays = Array.from({ length: firstDayOfMonth }, (_, i) => null);
  const allDays = [...paddingDays, ...days];

  const getEventForDay = (day) => events.find(e => e.date === day);

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{month} {year}</h3>
          <p className="text-xs text-muted-foreground">Schedule overview</p>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div key={day} className="text-center text-xs text-muted-foreground font-medium py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {allDays.map((day, index) => {
          const event = day ? getEventForDay(day) : null;
          return (
            <div 
              key={index}
              className={cn(
                "aspect-square flex flex-col items-center justify-center rounded-lg text-xs relative",
                day === today && "bg-primary text-primary-foreground font-semibold",
                day && day !== today && "hover:bg-secondary cursor-pointer",
                !day && "invisible"
              )}
            >
              {day}
              {event && (
                <span 
                  className={cn(
                    "absolute bottom-1 h-1 w-1 rounded-full",
                    eventColors[event.type]
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-center gap-4 mt-4 pt-3 border-t border-border">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-primary" />
          <span className="text-xs text-muted-foreground">Appointments</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-destructive" />
          <span className="text-xs text-muted-foreground">Surgeries</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-warning" />
          <span className="text-xs text-muted-foreground">Meetings</span>
        </div>
      </div>
    </div>
  );
}
