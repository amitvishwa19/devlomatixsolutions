import { DollarSign, TrendingUp } from "lucide-react";
import { RadialProgress } from "./RadialProgress";

export function PerformanceMetrics() {
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Performance</h3>
        <p className="text-xs text-muted-foreground">Hospital metrics</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <RadialProgress
          value={92}
          size={80}
          strokeWidth={6}
          label="Satisfaction"
          color="success"
        />
        <RadialProgress
          value={78}
          size={80}
          strokeWidth={6}
          label="Utilization"
          color="warning"
        />
        <RadialProgress
          value={85}
          size={80}
          strokeWidth={6}
          label="Efficiency"
          color="primary"
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2 rounded-lg bg-secondary/30 p-3">
          <DollarSign className="h-4 w-4 text-success" />
          <div>
            <p className="text-sm font-semibold text-foreground">$142K</p>
            <p className="text-xs text-muted-foreground">Revenue</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-secondary/30 p-3">
          <TrendingUp className="h-4 w-4 text-info" />
          <div>
            <p className="text-sm font-semibold text-foreground">+18%</p>
            <p className="text-xs text-muted-foreground">Growth</p>
          </div>
        </div>
      </div>
    </div>
  );
}
