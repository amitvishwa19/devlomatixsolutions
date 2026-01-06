import { Package, AlertTriangle, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

const inventory = [
  { name: "Surgical Masks", stock: 2450, min: 500, status: "good" },
  { name: "Latex Gloves", stock: 1820, min: 1000, status: "good" },
  { name: "IV Fluids", stock: 340, min: 200, status: "warning" },
  { name: "Syringes", stock: 89, min: 300, status: "critical" },
  { name: "Bandages", stock: 567, min: 400, status: "good" },
  { name: "Antibiotics", stock: 45, min: 100, status: "critical" },
];

const statusStyles = {
  good: { bg: "bg-secondary", text: "text-muted-foreground", icon: Package },
  warning: { bg: "bg-secondary", text: "text-muted-foreground", icon: TrendingDown },
  critical: { bg: "bg-secondary", text: "text-muted-foreground", icon: AlertTriangle },
};

export function InventoryStatus() {
  const criticalCount = inventory.filter(i => i.status === "critical").length;
  const warningCount = inventory.filter(i => i.status === "warning").length;

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Inventory Status</h3>
          <p className="text-xs text-muted-foreground">Medical supplies overview</p>
        </div>
        {criticalCount > 0 && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <AlertTriangle className="h-3 w-3" />
            {criticalCount} critical
          </span>
        )}
      </div>

      <div className="space-y-2">
        {inventory.map((item) => {
          const style = statusStyles[item.status];
          const Icon = style.icon;
          const percentage = Math.min((item.stock / item.min) * 100, 100);
          
          return (
            <div 
              key={item.name}
              className="flex items-center gap-3 rounded-lg bg-secondary/30 p-2.5"
            >
              <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", style.bg)}>
                <Icon className={cn("h-4 w-4", style.text)} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                  <span className={cn("text-xs font-medium", style.text)}>
                    {item.stock} units
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
    </div>
  );
}
