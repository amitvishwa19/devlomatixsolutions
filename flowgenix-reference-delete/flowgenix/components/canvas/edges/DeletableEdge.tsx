import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, type EdgeProps, useReactFlow } from "@xyflow/react";
import { Trash2 } from "lucide-react";

export const DeletableEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  style,
}: EdgeProps) => {
  const { setEdges } = useReactFlow();
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 0,
  });

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setEdges((es) => es.filter((edge) => edge.id !== id));
          }}
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
          }}
          className="nodrag nopan pointer-events-auto absolute flex h-5 w-5 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-colors hover:border-destructive hover:text-destructive"
          title="Delete edge"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </EdgeLabelRenderer>
    </>
  );
};
