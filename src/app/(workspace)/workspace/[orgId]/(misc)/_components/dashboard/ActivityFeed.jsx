import { UserPlus, FileText, CreditCard, Pill, AlertCircle, Clock } from "lucide-react";

const activities = [
  {
    id: 1,
    message: "New patient registered",
    detail: "John Smith - Room 204",
    time: "2 min ago",
    icon: UserPlus,
  },
  {
    id: 2,
    message: "Lab report uploaded",
    detail: "Blood test results for Emma Wilson",
    time: "15 min ago",
    icon: FileText,
  },
  {
    id: 3,
    message: "Payment received",
    detail: "$1,250.00 from Robert Davis",
    time: "32 min ago",
    icon: CreditCard,
  },
  {
    id: 4,
    message: "Prescription issued",
    detail: "Dr. Chen to Sarah Johnson",
    time: "1 hour ago",
    icon: Pill,
  },
  {
    id: 5,
    message: "Low inventory alert",
    detail: "Paracetamol stock below threshold",
    time: "2 hours ago",
    icon: AlertCircle,
  },
];

export function ActivityFeed() {
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Activity Feed</h3>
        <p className="text-xs text-muted-foreground">Recent updates</p>
      </div>

      <div className="space-y-3">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-secondary">
              <activity.icon className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">{activity.message}</p>
              <p className="text-xs text-muted-foreground truncate">{activity.detail}</p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {activity.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
