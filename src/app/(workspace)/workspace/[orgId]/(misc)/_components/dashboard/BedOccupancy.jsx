import { Bed, AlertTriangle, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

const departments = [
  { name: "ICU", occupied: 8, total: 10, status: "critical" },
  { name: "General Ward", occupied: 35, total: 50, status: "good" },
  { name: "Pediatric", occupied: 12, total: 20, status: "good" },
  { name: "Maternity", occupied: 14, total: 15, status: "critical" },
  { name: "Emergency", occupied: 6, total: 12, status: "good" },
];

const statusStyles = {
  good: { bg: "bg-secondary", text: "text-muted-foreground", icon: Bed },
  warning: { bg: "bg-secondary", text: "text-muted-foreground", icon: TrendingDown },
  critical: { bg: "bg-secondary", text: "text-muted-foreground", icon: AlertTriangle },
};

export function BedOccupancy() {
  const totalOccupied = departments.reduce((sum, d) => sum + d.occupied, 0);
  const totalBeds = departments.reduce((sum, d) => sum + d.total, 0);
  const criticalCount = departments.filter(d => d.status === "critical").length;

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Bed Occupancy</h3>
          <p className="text-xs text-muted-foreground">Current availability</p>
        </div>
        {criticalCount > 0 && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <AlertTriangle className="h-3 w-3" />
            {criticalCount} critical
          </span>
        )}
      </div>

      <div className="space-y-2">
        {departments.map((dept) => {
          const style = statusStyles[dept.status];
          const Icon = style.icon;
          const percentage = Math.round((dept.occupied / dept.total) * 100);

          return (
            <div 
              key={dept.name}
              className="flex items-center gap-3 rounded-lg bg-secondary/30 p-2.5"
            >
              <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", style.bg)}>
                <Icon className={cn("h-4 w-4", style.text)} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-foreground truncate">{dept.name}</p>
                  <span className={cn("text-xs font-medium", style.text)}>
                    {dept.occupied}/{dept.total}
                  </span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all bg-primary/60"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-4 mt-4 border-t border-border">
        <span className="text-xs text-muted-foreground">Total Occupancy</span>
        <span className="text-sm font-semibold text-foreground">{totalOccupied}/{totalBeds} ({Math.round((totalOccupied/totalBeds)*100)}%)</span>
      </div>
    </div>
  );
}
