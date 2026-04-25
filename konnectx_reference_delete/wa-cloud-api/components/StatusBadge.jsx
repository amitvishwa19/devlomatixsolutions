const map = {
  failed: "bg-destructive/15 text-destructive ring-destructive/30",
  error: "bg-destructive/15 text-destructive ring-destructive/30",
  disabled: "bg-destructive/15 text-destructive ring-destructive/30",
  rejected: "bg-destructive/15 text-destructive ring-destructive/30",
  pending: "bg-warning/15 text-warning ring-warning/30",
  in_review: "bg-warning/15 text-warning ring-warning/30",
  in_appeal: "bg-warning/15 text-warning ring-warning/30",
  approved: "bg-success/15 text-success ring-success/30",
  delivered: "bg-success/15 text-success ring-success/30",
  read: "bg-info/15 text-info ring-info/30",
  sent: "bg-primary/15 text-primary ring-primary/30",
  active: "bg-success/15 text-success ring-success/30",
  completed: "bg-success/15 text-success ring-success/30",
  paused: "bg-secondary text-secondary-foreground ring-border",
};

// Friendlier labels for template lifecycle states.
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
  const cls = map[key] || "bg-secondary text-secondary-foreground ring-border";
  const label = LABELS[key] || value.replaceAll("_", " ");
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${cls}`}>
      {label}
    </span>
  );
}
