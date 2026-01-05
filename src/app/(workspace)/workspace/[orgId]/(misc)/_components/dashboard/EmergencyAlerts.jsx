import { AlertTriangle, Info, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const alerts = [
  {
    id: 1,
    type: "critical",
    title: "ICU Bed Shortage",
    message: "Only 2 ICU beds available",
    time: "5 min ago"
  },
  {
    id: 2,
    type: "warning",
    title: "Low Blood Supply",
    message: "O- blood type running low",
    time: "15 min ago"
  },
  {
    id: 3,
    type: "info",
    title: "Staff Meeting",
    message: "Department meeting at 3 PM",
    time: "30 min ago"
  },
  {
    id: 4,
    type: "warning",
    title: "Equipment Maintenance",
    message: "MRI scheduled for maintenance",
    time: "1 hour ago"
  },
];

const alertStyles = {
  critical: {
    bg: "bg-destructive/10",
    border: "border-destructive/30",
    icon: AlertTriangle,
    iconColor: "text-destructive",
  },
  warning: {
    bg: "bg-warning/10",
    border: "border-warning/30",
    icon: AlertTriangle,
    iconColor: "text-warning",
  },
  info: {
    bg: "bg-info/10",
    border: "border-info/30",
    icon: Info,
    iconColor: "text-info",
  },
};

export function EmergencyAlerts() {
  const criticalCount = alerts.filter(a => a.type === "critical").length;

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Alerts</h3>
          <p className="text-xs text-muted-foreground">System notifications</p>
        </div>
        {criticalCount > 0 && (
          <span className="flex items-center gap-1 text-xs text-destructive font-medium">
            <AlertTriangle className="h-3 w-3" />
            {criticalCount} critical
          </span>
        )}
      </div>

      <div className="space-y-2">
        {alerts.map((alert) => {
          const style = alertStyles[alert.type];
          const Icon = style.icon;
          
          return (
            <div 
              key={alert.id}
              className={cn(
                "rounded-lg p-3 border",
                style.bg,
                style.border
              )}
            >
              <div className="flex items-start gap-2">
                <Icon className={cn("h-4 w-4 mt-0.5 flex-shrink-0", style.iconColor)} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{alert.title}</p>
                  <p className="text-xs text-muted-foreground">{alert.message}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {alert.time}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
