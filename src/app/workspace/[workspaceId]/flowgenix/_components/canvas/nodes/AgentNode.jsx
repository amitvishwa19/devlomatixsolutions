import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { Bot, Plus } from "lucide-react";
import { NodeDeleteButton } from "./NodeDeleteButton";
import { statusRingClass } from "../nodeStatus";

export const AgentNode = memo(({ id, data }) => {
  return (
    <div className="group relative">
      <NodeDeleteButton onDelete={() => data?.onDelete?.(id)} />
      <Handle type="target" position={Position.Left} className="!h-2 !w-2 !bg-primary !border-0" />

      <div className={`w-[240px] rounded-md border border-border bg-card shadow-sm transition-all ${statusRingClass(data?.runStatus)}`}>
        <div className="flex items-center gap-3 border-b border-border px-3 py-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Bot className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-xs">{data?.label}</p>
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              ai_agent
            </p>
          </div>
        </div>

        <div className="flex items-center justify-around gap-2 px-3 py-2">
          {(["chat_model", "memory", "tool"]).map((slot) => (
            <div key={slot} className="flex flex-col items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-muted-foreground/40" />
              <span className="font-mono text-[9px] text-muted-foreground">{slot}</span>
            </div>
          ))}
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="!h-2 !w-2 !bg-primary !border-0" />
      <Handle
        id="tools"
        type="source"
        position={Position.Bottom}
        className="!h-2 !w-2 !bg-muted-foreground !border-0"
      />

      <button
        type="button"
        onClick={() => data?.onAdd?.(id)}
        className="absolute top-1/2 -right-10 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-border bg-background text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        title="Add next step"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={() => data?.onAddTool?.(id)}
        className="absolute -bottom-9 left-1/2 -translate-x-1/2 flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-border bg-background text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        title="Add tool"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
});
AgentNode.displayName = "AgentNode";
