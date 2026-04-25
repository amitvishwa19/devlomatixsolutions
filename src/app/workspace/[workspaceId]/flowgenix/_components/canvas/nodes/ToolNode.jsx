import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { Wrench } from "lucide-react";
import { NodeDeleteButton } from "./NodeDeleteButton";

export const ToolNode = memo(({ id, data }) => {
  const Icon = data?.icon ?? Wrench;
  return (
    <div className="group relative">
      <NodeDeleteButton onDelete={() => data?.onDelete?.(id)} />
      <Handle type="target" position={Position.Top} className="!h-2 !w-2 !bg-muted-foreground !border-0" />
      <div className="flex w-[160px] items-center gap-2 rounded-md border border-dashed border-border bg-secondary/40 px-3 py-2 shadow-sm">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-background text-foreground">
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[11px] truncate">{data?.label}</p>
          <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">tool</p>
        </div>
      </div>
    </div>
  );
});
ToolNode.displayName = "ToolNode";
