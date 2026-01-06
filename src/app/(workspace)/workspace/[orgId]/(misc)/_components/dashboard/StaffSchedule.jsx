import { cn } from "@/lib/utils";

export function StaffSchedule() {
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Staff Schedule</h3>
        <p className="text-xs text-muted-foreground">Current shift overview</p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Morning Shift</span>
          <span className="font-medium text-foreground">24 staff</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Afternoon Shift</span>
          <span className="font-medium text-foreground">18 staff</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Night Shift</span>
          <span className="font-medium text-foreground">12 staff</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground mb-2">Upcoming Shifts</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-lg bg-secondary/30 p-2">
            <div>
              <p className="text-sm font-medium text-foreground">Dr. Sarah Chen</p>
              <p className="text-xs text-muted-foreground">Cardiology</p>
            </div>
            <span className="text-xs text-muted-foreground">2:00 PM</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-secondary/30 p-2">
            <div>
              <p className="text-sm font-medium text-foreground">Nurse John Doe</p>
              <p className="text-xs text-muted-foreground">Emergency</p>
            </div>
            <span className="text-xs text-muted-foreground">6:00 PM</span>
          </div>
        </div>
      </div>
    </div>
  );
}
