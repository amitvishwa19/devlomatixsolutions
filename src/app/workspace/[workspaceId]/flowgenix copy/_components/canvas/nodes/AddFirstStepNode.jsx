import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { Plus } from "lucide-react";

export const AddFirstStepNode = memo(({ data }) => {
  const onClick = data?.onClick;
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-24 w-24 flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-border bg-card/50 p-2 transition-all hover:border-primary hover:bg-card"
    >
      <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-dashed border-border bg-background text-muted-foreground transition-colors group-hover:border-primary group-hover:text-primary">
        <Plus className="h-3.5 w-3.5" />
      </div>
      <p className="text-center font-mono text-[10px]  text-muted-foreground group-hover:text-foreground">
        Add first step…
      </p>
      <Handle type="source" position={Position.Right} className="opacity-0!" />
    </button>
  );
});
AddFirstStepNode.displayName = "AddFirstStepNode";
