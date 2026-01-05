import { UserPlus, Calendar, FileText, Pill, Upload, BedDouble } from "lucide-react";

const actions = [
  { label: "Add Patient", icon: UserPlus },
  { label: "New Appointment", icon: Calendar },
  { label: "Create Invoice", icon: FileText },
  { label: "Prescription", icon: Pill },
  { label: "Upload Doc", icon: Upload },
  { label: "Manage Beds", icon: BedDouble },
];

export function QuickActions() {
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Quick Actions</h3>
        <p className="text-xs text-muted-foreground">Frequently used tasks</p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {actions.map((action) => (
          <button
            key={action.label}
            className="flex flex-col items-center gap-2 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group"
          >
            <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
              <action.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors text-center">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
