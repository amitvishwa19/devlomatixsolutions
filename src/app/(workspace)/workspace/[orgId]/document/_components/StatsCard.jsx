import { cn } from "@/lib/utils";

const variantStyles = {
  default: "bg-card border-border",
  primary: "bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20",
  success: "bg-gradient-to-br from-success/20 to-success/5 border-success/20",
  warning: "bg-gradient-to-br from-warning/20 to-warning/5 border-warning/20",
};

const iconVariantStyles = {
  default: "bg-secondary text-muted-foreground",
  primary: "bg-primary/20 text-primary",
  success: "bg-success/20 text-success",
  warning: "bg-warning/20 text-warning",
};

export function StatsCard({ title, value, icon: Icon, trend, variant = "default", iconClassName }) {
  return (
    <div
      className={cn(
        "p-6 rounded-xl border transition-all duration-300 hover-lift animate-fade-in",
        variantStyles[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value.toLocaleString()}</p>
          {trend && (
            <p
              className={cn(
                "text-xs font-medium",
                trend.isPositive ? "text-success" : "text-destructive"
              )}
            >
              {trend.isPositive ? "+" : "-"}{trend.value}% from last month
            </p>
          )}
        </div>
        <div className={cn("p-3 rounded-lg", iconClassName ? "bg-secondary" : iconVariantStyles[variant])}>
          <Icon className={cn("w-6 h-6", iconClassName)} />
        </div>
      </div>
    </div>
  );
}
