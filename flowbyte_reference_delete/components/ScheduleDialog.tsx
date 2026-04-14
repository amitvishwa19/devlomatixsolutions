import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, X } from "lucide-react";

interface ScheduleDialogProps {
  open: boolean;
  onClose: () => void;
  cronExpression: string;
  scheduleEnabled: boolean;
  onSave: (cron: string, enabled: boolean) => void;
}

const presets = [
  { label: "Every minute", cron: "* * * * *" },
  { label: "Every 5 minutes", cron: "*/5 * * * *" },
  { label: "Every 15 minutes", cron: "*/15 * * * *" },
  { label: "Every hour", cron: "0 * * * *" },
  { label: "Every 6 hours", cron: "0 */6 * * *" },
  { label: "Daily at midnight", cron: "0 0 * * *" },
  { label: "Daily at 9am", cron: "0 9 * * *" },
  { label: "Weekly (Monday 9am)", cron: "0 9 * * 1" },
  { label: "Monthly (1st at midnight)", cron: "0 0 1 * *" },
];

function describeCron(cron: string): string {
  const preset = presets.find((p) => p.cron === cron);
  if (preset) return preset.label;
  return `Custom: ${cron}`;
}

export default function ScheduleDialog({ open, onClose, cronExpression, scheduleEnabled, onSave }: ScheduleDialogProps) {
  const [cron, setCron] = useState(cronExpression || "0 * * * *");
  const [enabled, setEnabled] = useState(scheduleEnabled);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Schedule Workflow</h2>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="schedule-enabled">Enable Schedule</Label>
            <Switch id="schedule-enabled" checked={enabled} onCheckedChange={setEnabled} />
          </div>

          <div className="space-y-2">
            <Label>Preset</Label>
            <Select value={presets.find((p) => p.cron === cron)?.cron || "custom"} onValueChange={(v) => { if (v !== "custom") setCron(v); }}>
              <SelectTrigger>
                <SelectValue placeholder="Select a schedule" />
              </SelectTrigger>
              <SelectContent>
                {presets.map((p) => (
                  <SelectItem key={p.cron} value={p.cron}>{p.label}</SelectItem>
                ))}
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cron-expression">Cron Expression</Label>
            <Input
              id="cron-expression"
              value={cron}
              onChange={(e) => setCron(e.target.value)}
              placeholder="* * * * *"
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Format: minute hour day-of-month month day-of-week
            </p>
            <p className="text-sm text-foreground font-medium">{describeCron(cron)}</p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { onSave(cron, enabled); onClose(); }}>
            Save Schedule
          </Button>
        </div>
      </div>
    </div>
  );
}
