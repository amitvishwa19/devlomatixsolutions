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

    const onDelete = (e) => {
        e.stopPropagation();
        setEdges((es) => es.filter((edge) => edge.id !== id));
        toast.success("Connection deleted");
    };

    return (
        <>
            <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={style} />
            <EdgeLabelRenderer>
                <button
                    type="button"
                    onClick={onDelete}
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                    }}
                    className="nodrag nopan pointer-events-auto absolute flex h-5 w-5 items-center justify-center rounded-full border border-white/10 bg-background hover:bg-rose-600 text-rose-500 hover:text-white shadow-md transition-all duration-200 cursor-pointer"
                    title="Delete connection"
                >
                    <Trash2 className="h-3 w-3" />
                </button>
            </EdgeLabelRenderer>
        </>
    );
};
