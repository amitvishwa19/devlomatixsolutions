"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Button } from "@/components/ui/button";
import { Save, Plus, Play } from "lucide-react";
import { updateWorkflow } from "../../_actions/workflows/actions";
import { toast } from "sonner";
import { useParams } from "next/navigation";

const initialNodes = [];
const initialEdges = [];

const CanvasInner = ({ workflow }) => {
  const params = useParams();
  const workspaceId = params?.workspaceId;
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (workflow) {
      setNodes(workflow.nodes || []);
      setEdges(workflow.edges || []);
    }
  }, [workflow, setNodes, setEdges]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleSave = async () => {
    if (!workflow?.id) return;
    try {
      await updateWorkflow(workspaceId, workflow.id, {
        nodes,
        edges,
      });
      toast.success("Workflow saved");
    } catch (e) {
      toast.error("Failed to save workflow: " + e.message);
    }
  };

  const addNode = () => {
    const id = `node_${Date.now()}`;
    const newNode = {
      id,
      data: { label: `Node ${nodes.length + 1}` },
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      type: "default",
    };
    setNodes((nds) => nds.concat(newNode));
  };

  return (
    <div className="relative h-full w-full bg-background">
      <div className="absolute left-4 top-4 z-10 flex gap-2">
        <Button size="sm" onClick={addNode} className="h-8 font-mono text-[10px]">
          <Plus className="mr-1 h-3 w-3" /> add_node
        </Button>
        <Button size="sm" variant="secondary" onClick={handleSave} className="h-8 font-mono text-[10px]">
          <Save className="mr-1 h-3 w-3" /> save_flow
        </Button>
      </div>

      <div className="absolute right-4 top-4 z-10">
        <Button size="sm" variant="default" className="h-8 font-mono text-[10px] bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30">
          <Play className="mr-1 h-3 w-3" /> execute
        </Button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        className="bg-muted/5"
      >
        <Controls />
        <MiniMap zoomable pannable />
        <Background variant="dots" gap={20} size={1} />
      </ReactFlow>
    </div>
  );
};

export const Canvas = (props) => {
  return (
    <ReactFlowProvider>
      <CanvasInner {...props} />
    </ReactFlowProvider>
  );
};

export default Canvas;
