import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Loader2 } from "lucide-react";
import { saveWorkflow } from "../_lib/workflow-storage";
import { toast } from "sonner";

export const WorkflowSettingsPopover = ({ workflowId, initialUrl, onSaved }) => {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState(initialUrl ?? "");
  const [saving, setSaving] = useState(false);

  const apply = async () => {
    setSaving(true);
    try {
      const v = url.trim() || null;
      await saveWorkflow(workflowId, { failure_webhook_url: v });
      onSaved(v);
      toast.success("Settings saved");
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size="sm" variant="ghost" className="gap-1.5 font-mono text-xs" title="Workflow settings">
          <Settings className="h-3.5 w-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[420px] space-y-3 p-4">
        <div>
          <p className="font-mono text-xs">Failure notification</p>
          <p className="font-mono text-[10px] text-muted-foreground">
            // Slack incoming webhook URL pinged when a run errors out.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label className="font-mono text-xs">Slack webhook URL</Label>
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://hooks.slack.com/services/..."
            className="h-9 font-mono text-xs"
          />
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Button size="sm" variant="ghost" className="font-mono text-xs" onClick={() => setOpen(false)}>Cancel</Button>
          <Button size="sm" className="gap-1.5 font-mono text-xs" disabled={saving} onClick={apply}>
            {saving && <Loader2 className="h-3 w-3 animate-spin" />} Save
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
