const map = {
  failed: "bg-destructive/15 text-destructive ring-destructive/30",
  error: "bg-destructive/15 text-destructive ring-destructive/30",
  disabled: "bg-destructive/15 text-destructive ring-destructive/30",
  rejected: "bg-destructive/15 text-destructive ring-destructive/30",
  pending: "bg-yellow-500/15 text-yellow-500 ring-yellow-500/30",
  in_review: "bg-yellow-500/15 text-yellow-500 ring-yellow-500/30",
  approved: "bg-green-500/15 text-green-500 ring-green-500/30",
  delivered: "bg-green-500/15 text-green-500 ring-green-500/30",
  read: "bg-blue-500/15 text-blue-500 ring-blue-500/30",
  sent: "bg-primary/15 text-primary ring-primary/30",
  active: "bg-green-500/15 text-green-500 ring-green-500/30",
  completed: "bg-green-500/15 text-green-500 ring-green-500/30",
  paused: "bg-muted text-muted-foreground ring-border",
};

const LABELS = {
  pending: "In review",
  in_review: "In review",
  in_appeal: "In appeal",
  approved: "Approved",
  rejected: "Rejected",
  disabled: "Disabled",
  paused: "Paused",
};

export function StatusBadge({ status }) {
  const value = String(status || "unknown");
  const key = value.toLowerCase();
  const cls = map[key] || "bg-muted text-muted-foreground ring-border";
  const label = LABELS[key] || value.replaceAll("_", " ");
  return (
    <span className={`inline-flex items-center rounded-sm px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-tight ring-1 ring-inset ${cls}`}>
      {label}
    </span>
  );
}
