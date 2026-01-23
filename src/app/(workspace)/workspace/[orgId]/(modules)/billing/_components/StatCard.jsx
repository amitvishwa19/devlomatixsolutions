import { cn } from "@/lib/utils";

const StatCard = ({ title, value, icon: Icon, trend, trendValue, variant = "default" }) => {
  const iconStyles = {
    default: "bg-primary/10 text-primary",
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
  };

  const isPositive = trend === "up";

  return (
    <div className="bg-card border border-border rounded-xl p-4 lg:p-5 shadow-sm animate-slide-up transition-all duration-200 hover:shadow-md hover:translate-y-[-2px]">
      <div className="flex items-center gap-3">
        <div className={cn(
          "rounded-lg p-2.5 shrink-0",
          iconStyles[variant]
        )}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground truncate">
            {title}
          </p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <h3 className="text-xl lg:text-2xl font-bold font-heading truncate">{value}</h3>
            {trendValue && (
              <span className={cn(
                "text-xs font-semibold shrink-0",
                isPositive ? "text-success" : "text-destructive"
              )}>
                {isPositive ? "↑" : "↓"}{trendValue}%
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
