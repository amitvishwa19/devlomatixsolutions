import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CalendarView } from "./types";
import { format } from "date-fns";

interface CalendarHeaderProps {
    selectedDate: Date;
    calendarView: CalendarView;
    onViewChange: (view: CalendarView) => void;
    onPrevious: () => void;
    onNext: () => void;
    onToday: () => void;
    onCreateAppointment: () => void;
}

export function CalendarHeader({
    selectedDate,
    calendarView,
    onViewChange,
    onPrevious,
    onNext,
    onToday,
    onCreateAppointment,
}: CalendarHeaderProps) {
    const getHeaderTitle = () => {
        if (calendarView === "month") {
            return format(selectedDate, "MMMM yyyy");
        } else if (calendarView === "week") {
            return format(selectedDate, "'Week of' MMM d, yyyy");
        } else {
            return format(selectedDate, "EEEE, MMMM d, yyyy");
        }
    };

    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">


            <div className="flex flex-wrap items-center gap-3">
                {/* Navigation */}
                <div className="flex items-center gap-1 bg-secondary/30 rounded-lg p-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onPrevious}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="px-3 text-sm font-medium min-w-[180px] text-center">
                        {getHeaderTitle()}
                    </span>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onNext}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                {/* Today Button */}
                <Button variant="outline" size="sm" onClick={onToday}>
                    Today
                </Button>

                {/* View Switcher */}
                <div className="flex items-center bg-secondary/30 rounded-lg p-1">
                    {(["month", "week", "day"] as CalendarView[]).map((view) => (
                        <Button
                            key={view}
                            variant={calendarView === view ? "secondary" : "ghost"}
                            size="sm"
                            className="capitalize"
                            onClick={() => onViewChange(view)}
                        >
                            {view}
                        </Button>
                    ))}
                </div>

                {/* Create Button */}
                <Button onClick={onCreateAppointment}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Appointment
                </Button>
            </div>
        </div>
    );
}
