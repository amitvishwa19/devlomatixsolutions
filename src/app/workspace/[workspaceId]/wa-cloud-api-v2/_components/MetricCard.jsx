import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function MetricCard({ icon: Icon, label, value, helper, tone = "default" }) {
  const tones = {
    default: "bg-muted/20 text-foreground",
    success: "bg-green-500/10 text-green-500",
    primary: "bg-blue-500/10 text-blue-500",
    warning: "bg-yellow-500/10 text-yellow-500",
    destructive: "bg-red-500/10 text-red-500",
    info: "bg-blue-500/10 text-blue-500",
  };

  return (
    <Card className="rounded-md border-border/60 bg-card shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-2">
          <div className={cn("flex h-8 w-8 items-center justify-center rounded-md", tones[tone])}>
            <Icon className="h-4 w-4" />
          </div>
          {helper && <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">{helper}</span>}
        </div>
        <div className="mt-3">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
          <p className="mt-0.5 text-2xl font-bold tracking-tight tabular-nums">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
