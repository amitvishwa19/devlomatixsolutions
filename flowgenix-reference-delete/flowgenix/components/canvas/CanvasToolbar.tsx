import { Download, Save, Play, Loader2, Map, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { TemplatesDialog } from "@/flowgenix/components/TemplatesDialog";
import { SchedulePopover } from "@/flowgenix/components/SchedulePopover";
import { WorkflowSettingsPopover } from "@/flowgenix/components/WorkflowSettingsPopover";

type Props = {
  name: string;
  onNameChange: (name: string) => void;
  onNameBlur: () => void;
  status: string;
  saving: boolean;
  executing: boolean;
  onSave: () => void;
  onSaveAsTemplate: () => void;
  onExecute: () => void;
  workflowId?: string;
  scheduleEnabled?: boolean;
  scheduleCron?: string | null;
  onScheduleSaved?: (enabled: boolean, cron: string) => void;
  failureWebhookUrl?: string | null;
  onFailureWebhookSaved?: (url: string | null) => void;
  showMinimap: boolean;
  onShowMinimapChange: (v: boolean) => void;
  onAddNode: () => void;
};

export const CanvasToolbar = ({
  name,
  onNameChange,
  onNameBlur,
  status,
  saving,
  executing,
  onSave,
  onSaveAsTemplate,
  onExecute,
  workflowId,
  scheduleEnabled,
  scheduleCron,
  onScheduleSaved,
  failureWebhookUrl,
  onFailureWebhookSaved,
  showMinimap,
  onShowMinimapChange,
  onAddNode,
}: Props) => (
  <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between border-b border-border bg-card/80 px-4 py-2 backdrop-blur">
    <div className="flex items-center gap-2">
      <Input
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        onBlur={onNameBlur}
        className="h-7 w-44 border-transparent bg-transparent font-mono text-xs hover:border-border focus:border-border"
      />
      <Badge variant="secondary" className="font-mono text-[10px] uppercase">{status}</Badge>
    </div>
    <div className="flex items-center gap-1">
      <div className="mr-1 flex items-center gap-1.5 rounded-md border border-border px-2 py-1">
        <Map className="h-3.5 w-3.5 text-muted-foreground" />
        <Label htmlFor="minimap-toggle" className="font-mono text-xs text-muted-foreground">Minimap</Label>
        <Switch id="minimap-toggle" checked={showMinimap} onCheckedChange={onShowMinimapChange} />
      </div>
      <Button size="sm" variant="outline" onClick={onAddNode} className="gap-1.5 font-mono text-xs">
        <Plus className="h-3.5 w-3.5" /> Add node
      </Button>
      <TemplatesDialog />
      <Button size="sm" variant="ghost" onClick={onSaveAsTemplate} className="gap-1.5 font-mono text-xs">
        <Download className="h-3.5 w-3.5" /> Save as Template
      </Button>
      <Button size="sm" variant="outline" onClick={onSave} disabled={saving} className="gap-1.5 font-mono text-xs">
        <Save className="h-3.5 w-3.5" /> {saving ? "Saving…" : "Save"}
      </Button>
      {workflowId && onScheduleSaved && (
        <SchedulePopover
          workflowId={workflowId}
          initialEnabled={!!scheduleEnabled}
          initialCron={scheduleCron ?? null}
          onSaved={onScheduleSaved}
        />
      )}
      {workflowId && onFailureWebhookSaved && (
        <WorkflowSettingsPopover
          workflowId={workflowId}
          initialUrl={failureWebhookUrl ?? null}
          onSaved={onFailureWebhookSaved}
        />
      )}
      <Button size="sm" onClick={onExecute} disabled={executing} className="gap-1.5 font-mono text-xs">
        {executing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5 fill-current" />}
        Execute
      </Button>
    </div>
  </div>
);
