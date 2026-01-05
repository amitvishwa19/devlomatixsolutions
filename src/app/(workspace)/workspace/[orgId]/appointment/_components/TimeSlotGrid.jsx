import { cn } from "@/lib/utils";

// Configurable time slot duration in minutes
export const TIME_SLOT_DURATION = 15;

// Slot time ranges
const slotTimeRanges = {
  morning: { start: 9, end: 13 },    // 09:00 - 13:00
  noon: { start: 13, end: 17 },      // 13:00 - 17:00
  evening: { start: 17.5, end: 21.5 }, // 17:30 - 21:30
  night: { start: 0, end: 3 },       // 00:00 - 03:00
};

// Generate time slots based on duration
function generateTimeSlots(slotType) {
  const range = slotTimeRanges[slotType];
  if (!range) return [];

  const slots = [];
  let currentHour = range.start;

  while (currentHour < range.end) {
    const hours = Math.floor(currentHour);
    const minutes = Math.round((currentHour - hours) * 60);

    const isPM = hours >= 12;
    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const timeString = `${displayHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${isPM ? 'PM' : 'AM'}`;

    slots.push(timeString);
    currentHour += TIME_SLOT_DURATION / 60;
  }

  return slots;
}

// All possible time slots (for when no slot is selected)
const allTimeSlots = [
  ...generateTimeSlots("morning"),
  ...generateTimeSlots("noon"),
  ...generateTimeSlots("evening"),
  ...generateTimeSlots("night"),
];

export function TimeSlotGrid({ selectedTime, onSelectTime, selectedSlot, bookedTimes = [] }) {
  const timeSlots = selectedSlot ? generateTimeSlots(selectedSlot) : allTimeSlots;

  // Normalize booked times for comparison
  const normalizedBookedTimes = bookedTimes.map(t => t?.toLowerCase().trim());

  const isBooked = (time) => {
    const normalizedTime = time.toLowerCase().trim();
    return normalizedBookedTimes.includes(normalizedTime);
  };

  if (timeSlots.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">Select a preferred slot above to see available times</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {selectedSlot && (
        <p className="text-xs text-muted-foreground">
          Showing {TIME_SLOT_DURATION}-minute slots for {selectedSlot} ({timeSlots.length} slots)
        </p>
      )}
      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
        {timeSlots.map((time) => {
          const booked = isBooked(time);
          return (
            <button
              key={time}
              type="button"
              onClick={() => !booked && onSelectTime(time)}
              disabled={booked}
              className={cn(
                "px-2 py-2.5 rounded-lg text-xs font-medium transition-all duration-200",
                "border focus:outline-none focus:ring-2 focus:ring-primary/30",
                booked
                  ? "bg-muted/50 text-muted-foreground/50 border-border/30 cursor-not-allowed line-through decoration-destructive/60"
                  : "hover:scale-[1.02] active:scale-[0.98]",
                !booked && selectedTime === time
                  ? "bg-primary text-primary-foreground border-primary shadow-glow-sm"
                  : !booked && "bg-secondary/60 text-foreground border-border/60 hover:border-primary/40 hover:bg-secondary"
              )}
            >
              {time}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default TimeSlotGrid;
