import { Sun, Sunrise, Sunset, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

const slotIcons = {
    morning: Sunrise,
    noon: Sun,
    evening: Sunset,
    night: Moon,
};

export const slotData = {
    morning: { label: "Morning", time: "09:00 - 13:00", gradient: "from-amber-500/20 to-orange-500/10", startHour: 9, endHour: 13 },
    noon: { label: "Noon", time: "13:00 - 17:00", gradient: "from-yellow-500/20 to-amber-500/10", startHour: 13, endHour: 17 },
    evening: { label: "Evening", time: "17:30 - 21:30", gradient: "from-purple-500/20 to-pink-500/10", startHour: 17.5, endHour: 21.5 },
    night: { label: "Night", time: "00:00 - 03:00", gradient: "from-indigo-500/20 to-blue-500/10", startHour: 0, endHour: 3 },
};

export function AppointmentSlotCard({ slot, selected, onSelect, disabled = false }) {
    const Icon = slotIcons[slot?.slot];
    const data = slotData[slot.slot];



    return (
        <div
            onClick={() => !disabled && onSelect(slot)}
            className={cn(
                "relative overflow-hidden rounded-xl p-4 transition-all duration-300",
                "border flex flex-col items-center justify-center gap-2 min-h-[90px]",
                disabled
                    ? "cursor-not-allowed opacity-50 grayscale"
                    : "cursor-pointer hover:scale-[1.02] active:scale-[0.98]",
                selected && !disabled
                    ? "border-primary bg-primary/10 shadow-glow-sm"
                    : !disabled && "border-border/60 bg-secondary/50 hover:border-primary/40 hover:bg-secondary/80",
                disabled && "border-border/40 bg-muted/30"
            )}
        >
            <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-50",
                data?.gradient,
                disabled && "opacity-20"
            )} />
            <div className="relative z-10 flex flex-col items-center gap-2">
                <div className={cn(
                    "p-2 rounded-lg transition-colors",
                    selected && !disabled ? "bg-primary/20" : "bg-background/50"
                )}>
                    <Icon className={cn(
                        "h-5 w-5 transition-colors",
                        selected && !disabled ? "text-primary" : "text-muted-foreground"
                    )} />
                </div>
                <div className="text-center">
                    <p className={cn(
                        "font-semibold text-sm transition-colors",
                        selected && !disabled ? "text-primary" : "text-foreground",
                        disabled && "text-muted-foreground"
                    )}>
                        {data?.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{slot.start}-{slot.end}</p>
                    {disabled && (
                        <p className="text-[9px] text-destructive/70 mt-0.5">Passed</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AppointmentSlotCard;
