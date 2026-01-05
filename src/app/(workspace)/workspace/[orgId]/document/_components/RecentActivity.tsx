import { Upload, Download, Eye, Trash2, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

const activities = [
  {
    id: 1,
    action: "uploaded",
    document: "Lab_Report_2024.pdf",
    user: "Dr. Sarah Johnson",
    time: "5 min ago",
    icon: Upload,
  },
  {
    id: 2,
    action: "viewed",
    document: "Patient_X-Ray_Chest.jpg",
    user: "Nurse Mike Chen",
    time: "12 min ago",
    icon: Eye,
  },
  {
    id: 3,
    action: "downloaded",
    document: "Prescription_Nov2024.pdf",
    user: "Dr. Emily Davis",
    time: "25 min ago",
    icon: Download,
  },
  {
    id: 4,
    action: "shared",
    document: "Medical_History.docx",
    user: "Admin Lisa Park",
    time: "1 hour ago",
    icon: Share2,
  },
  {
    id: 5,
    action: "deleted",
    document: "Old_Report_2020.pdf",
    user: "Dr. James Wilson",
    time: "2 hours ago",
    icon: Trash2,
  },
];

const actionStyles = {
  uploaded: "text-success",
  viewed: "text-primary",
  downloaded: "text-chart-2",
  shared: "text-chart-3",
  deleted: "text-destructive",
};

export function RecentActivity() {
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
        <p className="text-xs text-muted-foreground">Document actions log</p>
      </div>

      <div className="space-y-3">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 p-2 rounded-lg hover:bg-secondary/30 transition-colors"
          >
            <div className="h-8 w-8 rounded-lg bg-secondary/50 flex items-center justify-center flex-shrink-0">
              <activity.icon className={cn("h-4 w-4", actionStyles[activity.action as keyof typeof actionStyles])} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">
                <span className="font-medium">{activity.user}</span>
                {" "}
                <span className="text-muted-foreground">{activity.action}</span>
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {activity.document}
              </p>
            </div>
            <span className="text-xs text-muted-foreground flex-shrink-0">
              {activity.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}