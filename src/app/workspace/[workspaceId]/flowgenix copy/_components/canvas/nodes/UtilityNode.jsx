import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { Plus, Wrench } from "lucide-react";
import { NodeDeleteButton } from "./NodeDeleteButton";
import { statusRingClass } from "../nodeStatus";

export const UtilityNode = memo(({ id, data }) => {
  const Icon = data?.icon ?? Wrench;
  const isIf = data?.kind === "util.if";
  const hasRetry = (data?.retry?.count ?? 0) > 0;

  return (
    <div className="group relative">
      <NodeDeleteButton onDelete={() => data?.onDelete?.(id)} />
      <Handle type="target" position={Position.Left} className="!h-2 !w-2 !bg-primary !border-0" />
      <div className={`flex w-[220px] items-center gap-3 rounded-md border border-border bg-card px-3 py-2.5 shadow-sm transition-all ${statusRingClass(data?.runStatus)}`}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary text-foreground">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-xs">{data?.label}</p>
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {isIf ? "branch" : "action"}{hasRetry && ` · ↻${data.retry?.count}`}
          </p>
        </div>
      </div>

      {isIf ? (
        <>
          <Handle id="true" type="source" position={Position.Right} style={{ top: "35%" }} className="!h-2.5 !w-2.5 !bg-[hsl(142_76%_36%)] !border-0" title="true" />
          <Handle id="false" type="source" position={Position.Right} style={{ top: "70%" }} className="!h-2.5 !w-2.5 !bg-destructive !border-0" title="false" />
          <span className="absolute -right-8 top-[28%] font-mono text-[9px] uppercase text-[hsl(142_76%_36%)]">true</span>
          <span className="absolute -right-9 top-[64%] font-mono text-[9px] uppercase text-destructive">false</span>
        </>
      ) : (
        <>
          <Handle type="source" position={Position.Right} style={{ top: "40%" }} className="!h-2 !w-2 !bg-primary !border-0" />
          <Handle id="error" type="source" position={Position.Right} style={{ top: "75%" }} className="!h-2.5 !w-2.5 !bg-destructive !border-0" title="on error" />
          <span className="absolute -right-7 top-[70%] font-mono text-[9px] uppercase text-destructive">err</span>
        </>
      )}

      {!isIf && (
        <button
          type="button"
          onClick={() => data?.onAdd?.(id)}
          className="absolute top-[40%] -right-10 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-border bg-background text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          title="Add next step"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
});
UtilityNode.displayName = "UtilityNode";
