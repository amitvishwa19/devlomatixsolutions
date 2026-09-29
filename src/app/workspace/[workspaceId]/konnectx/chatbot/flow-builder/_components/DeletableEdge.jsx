import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, useReactFlow } from '@xyflow/react';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

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
    label,
    data
}) => {
    const { setEdges } = useReactFlow();
    const [edgePath, labelX, labelY] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const displayLabel = label || data?.label;

    const onDelete = (e) => {
        e.stopPropagation();
        setEdges((es) => es.filter((edge) => edge.id !== id));
        toast.success("Connection deleted");
    };

    return (
        <>
            <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={style} />
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                    }}
                    className="nodrag nopan pointer-events-auto flex items-center gap-1.5"
                >
                    {displayLabel && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#1e1e2e]/95 text-white border border-white/20 shadow-md truncate max-w-[120px]">
                            {displayLabel}
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={onDelete}
                        className="flex h-5 w-5 items-center justify-center rounded-full border border-white/10 bg-background hover:bg-rose-600 text-rose-500 hover:text-white shadow-md transition-all duration-200 cursor-pointer"
                        title="Delete connection"
                    >
                        <Trash2 className="h-3 w-3" />
                    </button>
                </div>
            </EdgeLabelRenderer>
        </>
    );
};
