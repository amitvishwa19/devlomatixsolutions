import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";



const doctors = [
    {
        id: "1",
        name: "Dr. Sarah Mitchell",
        initials: "SM",
        specialty: "General Dentist",
        status: "available",
    },
    {
        id: "2",
        name: "Dr. James Park",
        initials: "JP",
        specialty: "Orthodontist",
        status: "busy",
        nextAvailable: "11:30 AM",
    },
    {
        id: "3",
        name: "Dr. Emily Chen",
        initials: "EC",
        specialty: "Periodontist",
        status: "available",
    },
    {
        id: "4",
        name: "Dr. Michael Brown",
        initials: "MB",
        specialty: "Oral Surgeon",
        status: "break",
        nextAvailable: "2:00 PM",
    },
];

const statusStyles = {
    available: "bg-success/10 text-success border-success/20",
    busy: "bg-destructive/10 text-destructive border-destructive/20",
    break: "bg-warning/10 text-warning border-warning/20",
};

const statusDot = {
    available: "bg-success",
    busy: "bg-destructive",
    break: "bg-warning",
};

export function DoctorSchedule() {
    return (
        <div className="rounded-xl border border-border/50 bg-card dark:bg-darkSecondaryBackground p-5 shadow-card animate-slide-up" style={{ animationDelay: "350ms" }}>
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Doctors On Duty</h3>
                <Badge variant="outline" className="text-xs">
                    {doctors.filter(d => d.status === "available").length} available
                </Badge>
            </div>

            <div className="space-y-3">
                {doctors.map((doctor) => (
                    <div
                        key={doctor.id}
                        className="flex items-center justify-between rounded-lg border border-border/30 bg-background/50 dark:bg-darkFocusColor p-3 transition-colors hover:bg-accent/20"
                    >
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Avatar className="h-10 w-10 border-2 border-border/50">
                                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                                        {doctor.initials}
                                    </AvatarFallback>
                                </Avatar>
                                <span
                                    className={cn(
                                        "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card",
                                        statusDot[doctor.status]
                                    )}
                                />
                            </div>

                            <div>
                                <p className="font-medium text-foreground text-sm">{doctor.name}</p>
                                <p className="text-xs text-muted-foreground">{doctor.specialty}</p>
                            </div>
                        </div>

                        <div className="text-right">
                            <Badge
                                variant="outline"
                                className={cn("capitalize text-xs", statusStyles[doctor.status])}
                            >
                                {doctor.status}
                            </Badge>
                            {doctor.nextAvailable && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Next: {doctor.nextAvailable}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
