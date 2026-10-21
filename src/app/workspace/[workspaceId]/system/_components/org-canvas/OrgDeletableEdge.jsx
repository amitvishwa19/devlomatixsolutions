'use client';

import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, useReactFlow } from '@xyflow/react';
import { Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

export function OrgDeletableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  style,
  data,
}) {
  const { setEdges } = useReactFlow();

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 16,
  });

  const handleDelete = (e) => {
    e.stopPropagation();
    if (data?.onDeleteEdge) {
      data.onDeleteEdge(id);
    } else {
      setEdges((edges) => edges.filter((edge) => edge.id !== id));
      toast.success('Reporting connection severed');
    }
  };

  const handleInsert = (e) => {
    e.stopPropagation();
    if (data?.onInsertRole) {
      data.onInsertRole(data.sourceNodeId, data.targetNodeId);
    }
  };

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          strokeWidth: 2,
          stroke: 'var(--border, #94a3b8)',
          ...style,
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
          }}
          className="nodrag nopan pointer-events-auto flex items-center gap-1 bg-white/95 dark:bg-[#1e1e2e]/95 backdrop-blur-md px-1.5 py-1 rounded-full border border-border/80 dark:border-white/15 shadow-md transition-all group hover:scale-105"
        >
          {/* Insert role in middle shortcut */}
          <button
            type="button"
            onClick={handleInsert}
            className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 hover:bg-primary text-primary hover:text-white transition-colors cursor-pointer"
            title="Insert new role in middle"
          >
            <Plus className="h-3 w-3" />
          </button>

          {/* Delete edge button */}
          <button
            type="button"
            onClick={handleDelete}
            className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500/10 hover:bg-rose-600 text-rose-500 hover:text-white transition-colors cursor-pointer"
            title="Delete connection (Sever reporting line)"
          >
            <Trash2 className="h-2.5 w-2.5" />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export default OrgDeletableEdge;
