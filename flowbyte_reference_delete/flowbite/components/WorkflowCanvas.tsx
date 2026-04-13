import { useCallback, useState, useRef, useEffect, type DragEvent } from "react";
import {
  ReactFlow, addEdge, useNodesState, useEdgesState, Controls, MiniMap,
  Background, BackgroundVariant, type Connection, type Edge, type Node,
  Panel, useReactFlow, ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import WorkflowNode from "./WorkflowNode";
import NodePanel from "./NodePanel";
import NodeDetailPanel from "./NodeDetailPanel";
import TemplateGallery from "./TemplateGallery";
import { Button } from "@/components/ui/button";
import { Plus, Play, Save, Pencil, Trash2, Loader2, Home, MessageSquare, BookOpen, Download, Clock } from "lucide-react";
import ScheduleDialog from "./ScheduleDialog";
import ChatPanel from "./ChatPanel";
import type { ChatMessage } from "./ChatPanel";
import { useNavigate } from "react-router-dom";
import { useWorkflowExecution } from "@/flowbite/hooks/useWorkflowExecution";
import { useWorkflowKeyboard } from "@/flowbite/hooks/useWorkflowKeyboard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { streamChat, type ChatMsg } from "@/flowbite/lib/streamChat";

const nodeTypes = { workflowNode: WorkflowNode };

const initialNodes: Node[] = [
  { id: "trigger-placeholder", type: "workflowNode", position: { x: 300, y: 250 }, data: { label: "Add Trigger", type: "trigger-placeholder", subtitle: "Click to select a trigger", status: "idle" } },
];
const initialEdges: Edge[] = [];

interface WorkflowCanvasProps {
  workflowId?: string;
  workflowName: string;
  onNameChange: (name: string) => void;
  loadedNodes?: Node[];
  loadedEdges?: Edge[];
  initialCron?: string;
  initialScheduleEnabled?: boolean;
}

function WorkflowCanvasInner({ workflowId, workflowName, onNameChange, loadedNodes, loadedEdges, initialCron: initCron, initialScheduleEnabled: initSchedule }: WorkflowCanvasProps) {
  const navigate = useNavigate();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(loadedNodes ?? initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(loadedEdges ?? initialEdges);
  const [showNodePanel, setShowNodePanel] = useState(false);
  const [nodePanelSlotFilter, setNodePanelSlotFilter] = useState<string | undefined>(undefined);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatSessionId, setChatSessionId] = useState(() => crypto.randomUUID());
  const [chatLogs, setChatLogs] = useState<{ id: string; nodeName: string; duration: number; status: "success" | "error"; timestamp: Date; output: Record<string, unknown> }[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ChatMsg[]>([]);
  const [enableTools, setEnableTools] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [cronExpression, setCronExpression] = useState(initCron || "");
  const [scheduleEnabled, setScheduleEnabled] = useState(initSchedule || false);
  const { screenToFlowPosition } = useReactFlow();

  const hasChatTrigger = nodes.some((n) => (n.data as any).type === "chat-trigger");
  const isWaitingForChat = nodes.some((n) => (n.data as any).type === "chat-trigger" && (n.data as any).status === "waiting");

  // Get AI agent config for the chat — only if connected to the chat trigger via edges
  const chatTriggerNode = nodes.find((n) => (n.data as any).type === "chat-trigger");
  const agentNode = nodes.find((n) => (n.data as any).type === "ai-agent");
  const isChatConnectedToAgent = !!(chatTriggerNode && agentNode && edges.some(
    (e) => e.source === chatTriggerNode.id && e.target === agentNode.id
  ));
  const connectedAgentNode = isChatConnectedToAgent ? agentNode : null;
  const agentConfig = connectedAgentNode ? (connectedAgentNode.data as any).config : null;

  // Dynamic edge styling based on execution state
  const styledEdges = edges.map((edge) => {
    const sourceNode = nodes.find((n) => n.id === edge.source);
    const targetNode = nodes.find((n) => n.id === edge.target);
    const sourceStatus = (sourceNode?.data as any)?.status;
    const targetStatus = (targetNode?.data as any)?.status;

    if (isWaitingForChat) {
      return {
        ...edge,
        animated: true,
        style: {
          stroke: "hsl(var(--chart-4))",
          strokeWidth: 3,
          strokeDasharray: "6 6",
          filter: "drop-shadow(0 0 4px hsl(var(--chart-4) / 0.5))",
        },
      };
    }
    if (sourceStatus === "success" && targetStatus === "running") {
      return {
        ...edge,
        animated: true,
        style: {
          stroke: "hsl(var(--primary))",
          strokeWidth: 3,
          strokeDasharray: "none",
          filter: "drop-shadow(0 0 6px hsl(var(--primary) / 0.6))",
        },
      };
    }
    if (sourceStatus === "success" && targetStatus === "success") {
      return {
        ...edge,
        animated: false,
        style: {
          stroke: "hsl(var(--chart-2))",
          strokeWidth: 2.5,
          strokeDasharray: "none",
        },
      };
    }
    if (sourceStatus === "error" || targetStatus === "error") {
      return {
        ...edge,
        animated: false,
        style: {
          stroke: "hsl(var(--destructive))",
          strokeWidth: 2.5,
          strokeDasharray: "none",
        },
      };
    }
    // Highlight selected edge
    if (edge.id === selectedEdge) {
      return {
        ...edge,
        style: {
          ...edge.style,
          stroke: "hsl(var(--destructive))",
          strokeWidth: 3,
          filter: "drop-shadow(0 0 6px hsl(var(--destructive) / 0.5))",
        },
      };
    }
    return edge;
  });


  const handleSlotAdd = useCallback((slotId: string) => {
    setNodePanelSlotFilter(slotId);
    setShowNodePanel(true);
  }, []);

  const nodesWithCallbacks = nodes.map((n) => {
    if ((n.data as any).type === "ai-agent") {
      return { ...n, data: { ...n.data, onSlotAdd: handleSlotAdd } };
    }
    return n;
  });

  const { execute, isExecuting, executionResults } = useWorkflowExecution(nodes, setNodes, edges, workflowId, workflowName);
  useWorkflowKeyboard(nodes, edges, setNodes, setEdges, selectedNode, setSelectedNode);

  const onUpdateConfig = useCallback((nodeId: string, config: Record<string, unknown>) => {
    setNodes((nds) => nds.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, config } } : n));
  }, [setNodes]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, type: "smoothstep", animated: true }, eds)),
    [setEdges]
  );

  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    setSelectedNode(null);
    setContextMenu(null);
    setSelectedEdge(edge.id);
  }, []);

  const deleteEdge = useCallback((edgeId: string) => {
    setEdges((eds) => eds.filter((e) => e.id !== edgeId));
    setSelectedEdge(null);
  }, [setEdges]);

  // Delete selected edge on Delete/Backspace key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedEdge && !selectedNode) {
        deleteEdge(selectedEdge);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedEdge, selectedNode, deleteEdge]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    const nodeData = node.data as Record<string, unknown>;
    if (nodeData.type === "trigger-placeholder") { setShowNodePanel(true); return; }
    setSelectedNode(node);
    setSelectedEdge(null);
    setContextMenu(null);
  }, []);

  const onPaneClick = useCallback(() => { setSelectedNode(null); setSelectedEdge(null); setContextMenu(null); }, []);

  const onNodeContextMenu = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY, nodeId: node.id });
  }, []);

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    setContextMenu(null);
    if (selectedNode?.id === nodeId) setSelectedNode(null);
  }, [setNodes, setEdges, selectedNode]);

  const editNode = useCallback((nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (node) setSelectedNode(node);
    setContextMenu(null);
  }, [nodes]);

  const addNode = useCallback(
    (type: string, label: string) => {
      const hasTriggerPlaceholder = nodes.some((n) => (n.data as any).type === "trigger-placeholder");
      if (hasTriggerPlaceholder) {
        setNodes((nds) =>
          nds.map((n) =>
            (n.data as any).type === "trigger-placeholder"
              ? { ...n, data: { label, type, subtitle: "", status: "idle", ...(type === "ai-agent" ? { config: { builtinLlm: "gpt-4", builtinMemory: "buffer", temperature: 0.7, maxIterations: 5 } } : {}) } }
              : n
          )
        );
      } else {
        const newNode: Node = {
          id: `${Date.now()}`,
          type: "workflowNode",
          position: { x: 400 + Math.random() * 200, y: 150 + Math.random() * 200 },
          data: { label, type, subtitle: "", status: "idle", ...(type === "ai-agent" ? { config: { builtinLlm: "gpt-4", builtinMemory: "buffer", temperature: 0.7, maxIterations: 5 } } : {}) },
        };
        setNodes((nds) => [...nds, newNode]);
      }
      setShowNodePanel(false);
    },
    [setNodes, nodes]
  );

  const [isSaving, setIsSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | undefined>(workflowId);

  const saveWorkflow = useCallback(async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const payload = { name: workflowName, nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)), status: "draft", ...(savedId && savedId !== "new" ? {} : { user_id: user?.id }) };
      if (savedId && savedId !== "new") {
        const { error } = await supabase.from("workflows").update(payload).eq("id", savedId);
        if (error) throw error;
        toast.success("Workflow saved");
      } else {
        const { data, error } = await supabase.from("workflows").insert(payload).select("id").single();
        if (error) throw error;
        setSavedId(data.id);
        window.history.replaceState(null, "", `/workflow/${data.id}`);
        toast.success("Workflow created");
      }
    } catch (err: any) {
      toast.error("Failed to save: " + err.message);
    } finally {
      setIsSaving(false);
    }
  }, [workflowName, nodes, edges, savedId]);

  const saveAsTemplate = useCallback(async () => {
    try {
      const { error } = await supabase.from("workflow_templates").insert({
        name: workflowName,
        description: `Template from "${workflowName}"`,
        category: "Custom",
        nodes: JSON.parse(JSON.stringify(nodes)),
        edges: JSON.parse(JSON.stringify(edges)),
      });
      if (error) throw error;
      toast.success("Saved as template!");
    } catch (err: any) {
      toast.error("Failed to save template: " + err.message);
    }
  }, [workflowName, nodes, edges]);

  const onDragOver = useCallback((event: DragEvent) => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/reactflow-type");
      const label = event.dataTransfer.getData("application/reactflow-label");
      if (!type || !label) return;
      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      setNodes((nds) => [...nds, { id: `${Date.now()}`, type: "workflowNode", position, data: { label, type, subtitle: "", status: "idle" } }]);
    },
    [screenToFlowPosition, setNodes]
  );

  // Streaming chat handler
  const handleChatSend = useCallback(async (text: string) => {
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", text, timestamp: new Date() };
    setChatMessages((prev) => [...prev, userMsg]);

    const newHistory: ChatMsg[] = [...conversationHistory, { role: "user", content: text }];
    setConversationHistory(newHistory);

    // Mark chat-trigger as success (input received) and agent as running
    setNodes((nds) => nds.map((n) => {
      const t = (n.data as any).type;
      if (t === "chat-trigger") return { ...n, data: { ...n.data, status: "success" } };
      if (t === "ai-agent") return { ...n, data: { ...n.data, status: "running" } };
      return n;
    }));

    // Log the Chat Trigger execution
    setChatLogs((prev) => [...prev, {
      id: crypto.randomUUID(),
      nodeName: "Chat Trigger",
      duration: 0,
      status: "success",
      timestamp: new Date(),
      output: { chatInput: text, sessionId: chatSessionId, triggered: true },
    }]);

    // If we have an AI agent, stream directly
    if (connectedAgentNode) {
      setIsStreaming(true);
      const botMsgId = crypto.randomUUID();
      const startTime = Date.now();

      // Add empty bot message that will be filled with streaming tokens
      setChatMessages((prev) => [...prev, { id: botMsgId, role: "bot", text: "", timestamp: new Date(), isStreaming: true }]);

      let fullResponse = "";

      await streamChat({
        messages: newHistory,
        model: agentConfig?.builtinLlm as string || "gpt-4",
        temperature: (agentConfig?.temperature as number) ?? 0.7,
        systemPrompt: (agentConfig?.systemPrompt as string) || "You are a helpful AI assistant. Keep answers clear and concise.",
        enableTools,
        onDelta: (chunk) => {
          fullResponse += chunk;
          setChatMessages((prev) =>
            prev.map((m) => m.id === botMsgId ? { ...m, text: fullResponse } : m)
          );
        },
        onDone: () => {
          setChatMessages((prev) =>
            prev.map((m) => m.id === botMsgId ? { ...m, isStreaming: false } : m)
          );
          setIsStreaming(false);
          setConversationHistory((prev) => [...prev, { role: "assistant", content: fullResponse }]);

          const duration = Date.now() - startTime;
          setChatLogs((prev) => [...prev, {
            id: crypto.randomUUID(),
            nodeName: "AI Agent",
            duration,
            status: "success",
            timestamp: new Date(),
            output: { input: text, response: fullResponse },
          }]);
          // Mark agent node as success
          setNodes((nds) => nds.map((n) =>
            (n.data as any).type === "ai-agent" ? { ...n, data: { ...n.data, status: "success" } } : n
          ));
        },
        onError: (errMsg) => {
          setChatMessages((prev) =>
            prev.map((m) => m.id === botMsgId ? { ...m, text: `Error: ${errMsg}`, isStreaming: false } : m)
          );
          setIsStreaming(false);
          // Mark agent node as error
          setNodes((nds) => nds.map((n) =>
            (n.data as any).type === "ai-agent" ? { ...n, data: { ...n.data, status: "error" } } : n
          ));
          toast.error(errMsg);
        },
      });
    } else {
      // Fallback: execute workflow
      const startTime = Date.now();
      execute(text).then(() => {
        const duration = Date.now() - startTime;
        const lastResult = Array.from(executionResults.values()).pop();
        const outputData = lastResult?.output || { chatInput: text };
        setChatMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "bot", text: JSON.stringify(outputData, null, 2), timestamp: new Date() }]);
        setChatLogs((prev) => [...prev, {
          id: crypto.randomUUID(), nodeName: "Workflow", duration,
          status: (lastResult?.status || "success") as "success" | "error",
          timestamp: new Date(), output: outputData,
        }]);
      });
    }
  }, [conversationHistory, connectedAgentNode, agentConfig, execute, executionResults, enableTools, chatSessionId]);

  const handleNewSession = useCallback(() => {
    setChatSessionId(crypto.randomUUID());
    setChatMessages([]);
    setConversationHistory([]);
  }, []);

  const handleClearExecution = useCallback(() => { setChatLogs([]); }, []);

  const handleLoadTemplate = useCallback((name: string, templateNodes: Node[], templateEdges: Edge[]) => {
    onNameChange(name);
    setNodes(templateNodes);
    setEdges(templateEdges);
  }, [onNameChange, setNodes, setEdges]);

  return (
    <div className="flex-1 relative h-full flex flex-col" ref={reactFlowWrapper}>
      {/* Top toolbar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 h-12 bg-card/80 glass border-b border-border/60">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => navigate("/")}>
            <Home className="h-4 w-4" />
          </Button>
          <input
            value={workflowName}
            onChange={(e) => onNameChange(e.target.value)}
            className="text-sm font-semibold bg-transparent border-none outline-none text-foreground hover:bg-muted px-2 py-1 rounded transition-colors"
          />
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">Draft</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5" onClick={() => setShowTemplates(true)}>
            <BookOpen className="h-3.5 w-3.5" />
            Templates
          </Button>
          <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5" onClick={saveAsTemplate}>
            <Download className="h-3.5 w-3.5" />
            Save as Template
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={saveWorkflow} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            {isSaving ? "Saving..." : "Save"}
          </Button>
          <Button variant="outline" size="sm" className={`h-8 text-xs gap-1.5 ${scheduleEnabled ? "border-primary text-primary" : ""}`} onClick={() => setShowSchedule(true)}>
            <Clock className="h-3.5 w-3.5" />
            {scheduleEnabled ? "Scheduled" : "Schedule"}
          </Button>
          <Button size="sm" className="h-8 text-xs gap-1.5" onClick={() => {
              if (hasChatTrigger) {
                // Open chat and wait for user input instead of executing immediately
                setShowChat(true);
                setNodes((nds) => nds.map((n) =>
                  (n.data as any).type === "chat-trigger"
                    ? { ...n, data: { ...n.data, status: "waiting" } }
                    : (n.data as any).type === "ai-agent"
                    ? { ...n, data: { ...n.data, status: "idle" } }
                    : n
                ));
                toast.info("Chat Trigger activated — send a message in the chat panel to continue execution");
              } else {
                execute();
              }
            }} disabled={isExecuting}>
            {isExecuting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
            {isExecuting ? "Running..." : "Execute"}
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 pt-12">
        <ReactFlow
          nodes={nodesWithCallbacks}
          edges={styledEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onNodeContextMenu={onNodeContextMenu}
          onEdgeClick={onEdgeClick}
          onPaneClick={onPaneClick}
          onDragOver={onDragOver}
          onDrop={onDrop}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          defaultEdgeOptions={{ type: "smoothstep", animated: true, style: { stroke: "hsl(var(--n8n-connection))", strokeWidth: 2, strokeDasharray: "8 4" } }}
        >
          {/* Floating delete button for selected edge */}
          {selectedEdge && (() => {
            const edge = edges.find((e) => e.id === selectedEdge);
            if (!edge) return null;
            const sourceNode = nodes.find((n) => n.id === edge.source);
            const targetNode = nodes.find((n) => n.id === edge.target);
            if (!sourceNode || !targetNode) return null;
            const midX = (sourceNode.position.x + targetNode.position.x) / 2 + 50;
            const midY = (sourceNode.position.y + targetNode.position.y) / 2 - 20;
            return (
              <Panel position="top-left" className="!absolute !pointer-events-auto" style={{ left: 0, top: 0 }}>
                <div className="fixed z-50" style={{ left: "50%", top: "45%" , transform: "translate(-50%, -50%)" }}>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-7 text-xs gap-1 px-2 shadow-lg animate-scale-in"
                    onClick={() => deleteEdge(selectedEdge)}
                  >
                    <Trash2 className="h-3 w-3" /> Delete Connection
                  </Button>
                </div>
              </Panel>
            );
          })()}
          <Background variant={BackgroundVariant.Dots} gap={16} size={1.5} color="hsl(var(--n8n-canvas-dot))" />
          <Controls position="bottom-right" showInteractive={false} />
          <MiniMap position="top-right" style={{ background: 'hsl(var(--card))' }} maskColor="hsl(var(--muted) / 0.7)" nodeColor="hsl(var(--primary))" nodeBorderRadius={4} />

          <Panel position="bottom-left">
            <div className="flex items-center gap-2">
              <Button onClick={() => { setNodePanelSlotFilter(undefined); setShowNodePanel(true); }} size="sm" className="gap-1.5 shadow-lg">
                <Plus className="h-4 w-4" /> Add Node
              </Button>
            </div>
          </Panel>

          {hasChatTrigger && (
            <Panel position="bottom-center">
              <Button
                onClick={() => setShowChat((v) => !v)}
                size="sm"
                variant={showChat ? "outline" : "default"}
                className="gap-1.5 shadow-lg bg-orange-600 hover:bg-orange-700 text-white border-orange-600"
              >
                <MessageSquare className="h-4 w-4" />
                {showChat ? "Hide chat" : "Open chat"}
              </Button>
            </Panel>
          )}
        </ReactFlow>
      </div>

      {/* Chat Panel */}
      {showChat && hasChatTrigger && (
        <div className="h-[300px] border-t border-border">
          <ChatPanel
            sessionId={chatSessionId}
            messages={chatMessages}
            onSendMessage={handleChatSend}
            onClose={() => setShowChat(false)}
            onNewSession={handleNewSession}
            logs={chatLogs}
            onClearExecution={handleClearExecution}
            isStreaming={isStreaming}
            enableTools={enableTools}
            onToggleTools={setEnableTools}
          />
        </div>
      )}

      {showNodePanel && (
        <NodePanel onClose={() => { setShowNodePanel(false); setNodePanelSlotFilter(undefined); }} onAddNode={addNode} slotFilter={nodePanelSlotFilter} />
      )}

      {selectedNode && (
        <NodeDetailPanel
          node={selectedNode as any}
          executionResult={executionResults.get(selectedNode.id)}
          onClose={() => setSelectedNode(null)}
          onUpdateConfig={onUpdateConfig}
        />
      )}

      {showTemplates && (
        <TemplateGallery onClose={() => setShowTemplates(false)} onLoadTemplate={handleLoadTemplate} />
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div className="fixed z-50 min-w-[160px] rounded-md border border-border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95" style={{ top: contextMenu.y, left: contextMenu.x }}>
          <div className="p-1">
            <button onClick={() => editNode(contextMenu.nodeId)} className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
            <button onClick={() => deleteNode(contextMenu.nodeId)} className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors">
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </div>
        </div>
      )}

      <ScheduleDialog
        open={showSchedule}
        onClose={() => setShowSchedule(false)}
        cronExpression={cronExpression}
        scheduleEnabled={scheduleEnabled}
        onSave={async (cron, enabled) => {
          setCronExpression(cron);
          setScheduleEnabled(enabled);
          // Save to DB if workflow is saved
          if (savedId && savedId !== "new") {
            const { error } = await supabase.from("workflows").update({
              cron_expression: cron,
              schedule_enabled: enabled,
            }).eq("id", savedId);
            if (error) {
              toast.error("Failed to save schedule");
            } else {
              toast.success(enabled ? `Schedule set: ${cron}` : "Schedule disabled");
            }
          } else {
            toast.info("Save the workflow first to enable scheduling");
          }
        }}
      />
    </div>
  );
}

export default function WorkflowCanvas(props: WorkflowCanvasProps) {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
