import { Card, CardContent } from "@/components/ui/card";

const tones = {
  primary: { wrap: "bg-primary/15 text-primary ring-primary/30", glow: "from-primary/10" },
  success: { wrap: "bg-success/15 text-success ring-success/30", glow: "from-success/10" },
  info: { wrap: "bg-info/15 text-info ring-info/30", glow: "from-info/10" },
  warning: { wrap: "bg-warning/15 text-warning ring-warning/30", glow: "from-warning/10" },
  destructive: { wrap: "bg-destructive/15 text-destructive ring-destructive/30", glow: "from-destructive/10" },
};

export function MetricCard({ icon: Icon, label, value, helper, tone = "primary" }) {
  const t = tones[tone] || tones.primary;
  return (
    <Card className="group relative overflow-hidden rounded-md border-border/60 bg-gradient-card shadow-card transition-all hover:border-primary/40 hover:shadow-glow">
      <div className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${t.glow} to-transparent blur-2xl opacity-70`} />
      <CardContent className="relative flex items-start justify-between gap-4 p-5">
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="truncate text-3xl font-bold tracking-tight text-foreground">{value}</p>
          {helper && <p className="truncate text-xs text-muted-foreground">{helper}</p>}
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md ring-1 ${t.wrap}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
