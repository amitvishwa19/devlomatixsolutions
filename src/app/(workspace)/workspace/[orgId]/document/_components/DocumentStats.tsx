import { FileText, FolderOpen, HardDrive, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
  {
    title: "Total Documents",
    value: "2,847",
    change: "+124 this month",
    icon: FileText,
    trend: "up",
  },
  {
    title: "Categories",
    value: "12",
    change: "Organized",
    icon: FolderOpen,
    trend: "neutral",
  },
  {
    title: "Storage Used",
    value: "45.2 GB",
    change: "of 100 GB",
    icon: HardDrive,
    trend: "neutral",
  },
  {
    title: "Pending Review",
    value: "23",
    change: "Needs attention",
    icon: Clock,
    trend: "warning",
  },
];

export function DocumentStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="bg-card rounded-xl border border-border p-4"
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-secondary/50 flex items-center justify-center flex-shrink-0">
              <stat.icon className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.title}</p>
              <p className={cn(
                "text-xs mt-0.5",
                stat.trend === "up" ? "text-success" : 
                stat.trend === "warning" ? "text-warning" : 
                "text-muted-foreground"
              )}>
                {stat.change}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}