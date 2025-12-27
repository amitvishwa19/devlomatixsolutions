import { cn } from "@/lib/utils";



const StatCard = ({ value, label, className, delay = 0 }) => {
    return (
        <div
            className={cn(
                "text-center p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/30",
                className
            )}
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="font-display text-4xl md:text-5xl font-bold text-gradient mb-2">
                {value}
            </div>
            <div className="text-muted-foreground text-sm font-medium">
                {label}
            </div>
        </div>
    );
};

export default StatCard;
