import { Skeleton } from "@/components/ui/skeleton";

export const StatsCard = ({ icon: Icon, label, value, subValue, color = "primary", loading = false }) => {
    if (loading) {
        return (
            <div className="flex items-center gap-4 p-4 rounded-lg bg-card border">
                <Skeleton className="w-11 h-11 rounded-lg" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-7 w-12" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-4 p-4 rounded-lg bg-card border transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-primary/30 cursor-default">
            <div
                className="p-3 rounded-lg transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: `hsl(var(--${color}) / 0.1)` }}
            >
                <Icon
                    className="w-5 h-5"
                    style={{ color: `hsl(var(--${color}))` }}
                />
            </div>
            <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-2xl font-bold">{value}</p>
                {subValue && (
                    <p className="text-xs text-muted-foreground">{subValue}</p>
                )}
            </div>
        </div>
    );
};