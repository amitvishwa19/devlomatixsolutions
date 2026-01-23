import { TrendingUp, TrendingDown, DollarSign, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
  {
    label: "Total Collection Today",
    value: "₹2,45,800",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
  },
  {
    label: "Pending Amount",
    value: "₹89,500",
    change: "-8.2%",
    trend: "down",
    icon: Clock,
  },
  {
    label: "Bills Cleared",
    value: "34",
    change: "+15%",
    trend: "up",
    icon: CheckCircle,
  },
  {
    label: "Overdue Bills",
    value: "7",
    change: "-3",
    trend: "down",
    icon: AlertCircle,
  },
];

const QuickStats = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => {
        const isPositive = stat.trend === "up";
        const Icon = stat.icon;
        
        return (
          <div
            key={stat.label}
            className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                <p className="text-xl font-bold font-heading">{stat.value}</p>
              </div>
              <div className={cn(
                "rounded-lg p-2",
                stat.label.includes("Overdue") 
                  ? "bg-destructive/10 text-destructive"
                  : stat.label.includes("Pending")
                  ? "bg-warning/10 text-warning"
                  : "bg-primary/10 text-primary"
              )}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <div className={cn(
              "flex items-center gap-1 mt-2 text-xs font-medium",
              stat.label.includes("Overdue") || stat.label.includes("Pending")
                ? isPositive ? "text-destructive" : "text-success"
                : isPositive ? "text-success" : "text-destructive"
            )}>
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {stat.change} from yesterday
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default QuickStats;
