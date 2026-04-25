import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Plus, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { NodeDeleteButton } from "./NodeDeleteButton";
import { statusRingClass, type NodeRunStatus } from "../nodeStatus";

type Data = {
  label: string;
  icon?: LucideIcon;
  description?: string;
  onAdd?: (id: string) => void;
  onDelete?: (id: string) => void;
  runStatus?: NodeRunStatus;
};

export const TriggerNode = memo(({ id, data }: NodeProps) => {
  const d = data as Data;
  const Icon = d.icon ?? Zap;
  return (
    <div className="group relative">
      <NodeDeleteButton onDelete={() => d.onDelete?.(id)} />
      <div className={`flex w-[220px] items-center gap-3 rounded-md border-l-4 border-l-primary border border-border bg-card px-3 py-2.5 shadow-sm transition-all ${statusRingClass(d.runStatus)}`}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-xs">{d.label}</p>
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            trigger
          </p>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="!h-2 !w-2 !bg-primary !border-0" />

      <button
        type="button"
        onClick={() => d.onAdd?.(id)}
        className="absolute top-1/2 -right-10 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-border bg-background text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        title="Add next step"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
});
TriggerNode.displayName = "TriggerNode";
