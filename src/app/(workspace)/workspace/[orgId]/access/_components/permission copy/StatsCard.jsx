import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";


export const StatsCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    iconColor = "text-primary",
    delay = 0,
}) => {
    return (
        <div
            className="bg-card rounded-xl p-5 animate-slide-up  duration-300 hover:border-primary/30 transition-colors animate-fade-in border"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground font-medium">{title}</p>
                    <p className="text-3xl font-bold tracking-tight">{value}</p>
                    {subtitle && (
                        <p className="text-xs text-muted-foreground">{subtitle}</p>
                    )}
                </div>
                <div
                    className={cn(
                        "p-3 rounded-xl bg-primary/10 border border-primary/20",
                        iconColor
                    )}
                >
                    <Icon className="w-5 h-5" />
                </div>
            </div>
        </div>
    );
};
