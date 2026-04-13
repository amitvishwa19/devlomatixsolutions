'use client'

import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
  ReactFlowProvider,
  useReactFlow,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import WorkflowNode from "./nodes/WorkflowNode";
import NodePanel from "./NodePanel";
import NodeDetailPanel from "./NodeDetailPanel";
import ChatPanel, { type ChatMessage, type LogEntry } from "./ChatPanel";
import { Button } from "@/components/ui/button";
import { Plus, Play, Save, MessageSquare, ChevronDown, ChevronUp, Share2, Settings, History, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

const nodeTypes = {
  workflowNode: WorkflowNode,
};

const defaultViewport = { x: 0, y: 0, zoom: 0.8 };

export default function FlowEditor({ workflow }) {
  const { workspaceId, workflowId } = useParams();
  const router = useRouter();
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showNodePanel, setShowNodePanel] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatHeight, setChatHeight] = useState(300);
  const [slotFilter, setSlotFilter] = useState<string | null>(null);

  // Execution state
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResults, setExecutionResults] = useState<Record<string, any>>({});
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState(uuidv4());
  const [isStreaming, setIsStreaming] = useState(false);

  const { screenToFlowPosition, setViewport, toObject } = useReactFlow();

  // Load workflow
  useEffect(() => {
    if (workflow?.definition) {
      const { nodes: savedNodes = [], edges: savedEdges = [], viewport } = workflow.definition;
      setNodes(savedNodes);
      setEdges(savedEdges);
      if (viewport) {
        setViewport(viewport);
      }
    }
  }, [workflow, setNodes, setEdges, setViewport]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((_, node) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const onAddNode = useCallback((type, label) => {
    const newNode = {
      id: uuidv4(),
      type: "workflowNode",
      position: { x: 250, y: 150 },
      data: { 
        label, 
        type,
        config: {},
        onSlotAdd: (slotId) => {
            setSlotFilter(slotId);
            setShowNodePanel(true);
        }
      },
    };
    setNodes((nds) => nds.concat(newNode));
    setShowNodePanel(false);
    setSlotFilter(null);
  }, [setNodes]);

  const onUpdateNodeConfig = useCallback((nodeId, config) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, config } };
        }
        return node;
      })
    );
  }, [setNodes]);

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId),
    [nodes, selectedNodeId]
  );

  const handleSave = async () => {
    const flow = toObject();
    // Implementation for save action
    toast.success("Workflow saved successfully");
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    // Implementation for execution
    setTimeout(() => {
        setIsExecuting(false);
        toast.success("Workflow executed successfully");
    }, 2000);
  };

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactFlow");
      const label = event.dataTransfer.getData("application/reactflow-label");

      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: uuidv4(),
        type: "workflowNode",
        position,
        data: { 
            label, 
            type,
            config: {},
            onSlotAdd: (slotId) => {
                setSlotFilter(slotId);
                setShowNodePanel(true);
            }
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  return (
    <div className="flex flex-col h-full bg-n8n-canvas-bg relative overflow-hidden">
      {/* Header / Topbar */}
      <div className="h-12 border-b border-n8n-header-border bg-n8n-header-bg flex items-center justify-between px-4 shrink-0 z-30">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent" onClick={() => router.back()}>
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">F</div>
          </Button>
          <div className="h-4 w-px bg-border mx-1" />
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-foreground leading-tight">{workflow.name}</span>
            <span className="text-[10px] text-muted-foreground leading-tight">Draft • Last saved 2m ago</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                <History className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                <Settings className="h-3.5 w-3.5" />
            </Button>
            <div className="h-4 w-px bg-border mx-1" />
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs border-primary/20 hover:bg-primary/5 text-primary" onClick={handleSave}>
                <Save className="h-3.5 w-3.5" />
                Save
            </Button>
            <Button size="sm" className="h-8 gap-1.5 text-xs bg-primary hover:bg-primary/90 text-white shadow-sm" onClick={handleExecute} disabled={isExecuting}>
                {isExecuting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5 fill-current" />}
                Execute
            </Button>
        </div>
      </div>

      <div className="flex-1 relative flex flex-col min-h-0">
        <div className="flex-1 relative min-h-0">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            defaultViewport={defaultViewport}
            fitView
            minZoom={0.2}
            maxZoom={2}
            className="bg-n8n-canvas-bg"
            proOptions={{ hideAttribution: true }}
          >
            <Background variant="dots" gap={20} size={1} color="hsl(var(--n8n-canvas-dot))" />
            <Controls position="bottom-left" showInteractive={false} className="!bg-card !border-border" />
            
            <Panel position="top-right" className="mr-0 mt-0">
                <Button 
                    size="sm" 
                    variant="secondary" 
                    className="h-8 shadow-sm rounded-full bg-n8n-node-bg border border-border group"
                    onClick={() => setShowNodePanel(!showNodePanel)}
                >
                    <Plus className={`h-4 w-4 mr-2 transition-transform duration-200 ${showNodePanel ? 'rotate-45' : ''}`} />
                    Add Node
                </Button>
            </Panel>

            <Panel position="bottom-right" className="mb-0 flex flex-col gap-2">
                <Button 
                    size="sm" 
                    variant="secondary" 
                    className={`h-9 w-9 rounded-full bg-n8n-node-bg border border-border shadow-sm ${showChat ? 'text-primary border-primary/30' : ''}`}
                    onClick={() => setShowChat(!showChat)}
                >
                    <MessageSquare className="h-4.5 w-4.5" />
                </Button>
            </Panel>
          </ReactFlow>

          {/* Side Panels */}
          {showNodePanel && (
            <NodePanel
              onClose={() => { setShowNodePanel(false); setSlotFilter(null); }}
              onAddNode={onAddNode}
              slotFilter={slotFilter}
            />
          )}

          {selectedNode && (
            <NodeDetailPanel
              node={selectedNode}
              executionResult={executionResults[selectedNode.id]}
              onClose={() => setSelectedNodeId(null)}
              onUpdateConfig={onUpdateNodeConfig}
            />
          )}
        </div>

        {/* Bottom Chat / Logs Panel */}
        {showChat && (
          <div 
            className="w-full border-t border-border z-30 flex flex-col transition-all duration-300"
            style={{ height: chatHeight }}
          >
            <div className="h-1 bg-muted-foreground/10 cursor-ns-resize hover:bg-primary/20 transition-colors"
                onMouseDown={(e) => {
                    const startY = e.clientY;
                    const startHeight = chatHeight;
                    const onMouseMove = (moveEvent: MouseEvent) => {
                        const delta = startY - moveEvent.clientY;
                        setChatHeight(Math.max(150, Math.min(800, startHeight + delta)));
                    };
                    const onMouseUp = () => {
                        document.removeEventListener('mousemove', onMouseMove);
                        document.removeEventListener('mouseup', onMouseUp);
                    };
                    document.addEventListener('mousemove', onMouseMove);
                    document.addEventListener('mouseup', onMouseUp);
                }}
            />
            <ChatPanel
              sessionId={sessionId}
              onSendMessage={(msg) => {
                // Chat logic
                const userMsg: ChatMessage = { id: uuidv4(), role: "user", text: msg, timestamp: new Date() };
                setMessages(prev => [...prev, userMsg]);
              }}
              onClose={() => setShowChat(false)}
              onNewSession={() => {
                setSessionId(uuidv4());
                setMessages([]);
              }}
              messages={messages}
              logs={logs}
              onClearExecution={() => {
                setLogs([]);
                setExecutionResults({});
              }}
              isStreaming={isStreaming}
            />
          </div>
        )}
      </div>
    </div>
  );
}
