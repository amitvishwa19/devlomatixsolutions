'use client'

import { useCallback, useState, useRef, useEffect } from "react";
import {
  ReactFlow, addEdge, useNodesState, useEdgesState, Controls, MiniMap,
  Background, BackgroundVariant, Panel, useReactFlow, ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import WorkflowNode from "./nodes/WorkflowNode";
import NodePanel from "./NodePanel";
import NodeDetailPanel from "./NodeDetailPanel";
import TemplateGallery from "./TemplateGallery";
import { Button } from "@/components/ui/button";
import { Plus, Play, Save, Pencil, Trash2, Loader2, Home, MessageSquare, BookOpen, Download, Clock } from "lucide-react";
import ScheduleDialog from "./ScheduleDialog";
import ChatPanel from "./ChatPanel";

import { useRouter, useParams } from "next/navigation";
import { useWorkflowExecution } from "../_hooks/useWorkflowExecution";
import { useWorkflowKeyboard } from "../_hooks/useWorkflowKeyboard";
import { toast } from "sonner";
import { streamChat } from "../_lib/streamChat";
import { saveWorkflowAction, saveAsTemplateAction } from "../_actions/workflow-mgmt";

const nodeTypes = { workflowNode: WorkflowNode };

const initialNodes = [
  { id: "trigger-placeholder", type: "workflowNode", position: { x: 300, y: 250 }, data: { label: "Add Trigger", type: "trigger-placeholder", subtitle: "Click to select a trigger", status: "idle" } },
];
const initialEdges = [];

function WorkflowCanvasInner({ workflowId, initialName, loadedNodes, loadedEdges, initialCron, initialScheduleEnabled }) {
    const [workflowName, setWorkflowName] = useState(initialName || "Untitled Workflow");
  const router = useRouter();
  const { workspaceId } = useParams();
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(loadedNodes && loadedNodes.length > 0 ? loadedNodes : initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(loadedEdges || initialEdges);
  const [showNodePanel, setShowNodePanel] = useState(false);
  const [nodePanelSlotFilter, setNodePanelSlotFilter] = useState(undefined);
  const [selectedNode, setSelectedNode] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatSessionId, setChatSessionId] = useState(() => crypto.randomUUID());
  const [chatLogs, setChatLogs] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [enableTools, setEnableTools] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [cronExpression, setCronExpression] = useState(initialCron || "");
  const [scheduleEnabled, setScheduleEnabled] = useState(initialScheduleEnabled || false);
  const { screenToFlowPosition } = useReactFlow();

  const hasChatTrigger = nodes.some((n) => n.data?.type === "chat-trigger");
  const isWaitingForChat = nodes.some((n) => n.data?.type === "chat-trigger" && n.data?.status === "waiting");

  // Get AI agent config for the chat — only if connected to the chat trigger via edges
  const chatTriggerNode = nodes.find((n) => n.data?.type === "chat-trigger");
  const agentNode = nodes.find((n) => n.data?.type === "ai-agent");
  const isChatConnectedToAgent = !!(chatTriggerNode && agentNode && edges.some(
    (e) => e.source === chatTriggerNode.id && e.target === agentNode.id
  ));
  const connectedAgentNode = isChatConnectedToAgent ? agentNode : null;
  const agentConfig = connectedAgentNode ? connectedAgentNode.data?.config : null;

  // Dynamic edge styling based on execution state
  const styledEdges = edges.map((edge) => {
    const sourceNode = nodes.find((n) => n.id === edge.source);
    const targetNode = nodes.find((n) => n.id === edge.target);
    const sourceStatus = sourceNode?.data?.status;
    const targetStatus = targetNode?.data?.status;

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


  const handleSlotAdd = useCallback((slotId) => {
    setNodePanelSlotFilter(slotId);
    setShowNodePanel(true);
  }, []);

  const nodesWithCallbacks = nodes.map((n) => {
    if (n.data?.type === "ai-agent") {
      return { ...n, data: { ...n.data, onSlotAdd: handleSlotAdd } };
    }
    return n;
  });

  const { execute, isExecuting, executionResults } = useWorkflowExecution(nodes, setNodes, edges, workflowId, workflowName);
  useWorkflowKeyboard(nodes, edges, setNodes, setEdges, selectedNode, setSelectedNode);

  const onUpdateConfig = useCallback((nodeId, config) => {
    setNodes((nds) => nds.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, config } } : n));
  }, [setNodes]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, type: "smoothstep", animated: true }, eds)),
    [setEdges]
  );

  const onEdgeClick = useCallback((_, edge) => {
    setSelectedNode(null);
    setContextMenu(null);
    setSelectedEdge(edge.id);
  }, []);

  const deleteEdge = useCallback((edgeId) => {
    setEdges((eds) => eds.filter((e) => e.id !== edgeId));
    setSelectedEdge(null);
  }, [setEdges]);

  // Delete selected edge on Delete/Backspace key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedEdge && !selectedNode) {
        deleteEdge(selectedEdge);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedEdge, selectedNode, deleteEdge]);

  const onNodeClick = useCallback((_, node) => {
    const nodeData = node.data;
    if (nodeData.type === "trigger-placeholder") { setShowNodePanel(true); return; }
    setSelectedNode(node);
    setSelectedEdge(null);
    setContextMenu(null);
  }, []);

  const onPaneClick = useCallback(() => { setSelectedNode(null); setSelectedEdge(null); setContextMenu(null); }, []);

  const onNodeContextMenu = useCallback((event, node) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY, nodeId: node.id });
  }, []);

  const deleteNode = useCallback((nodeId) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    setContextMenu(null);
    if (selectedNode?.id === nodeId) setSelectedNode(null);
  }, [setNodes, setEdges, selectedNode]);

  const editNode = useCallback((nodeId) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (node) setSelectedNode(node);
    setContextMenu(null);
  }, [nodes]);

  const addNode = useCallback(
    (type, label) => {
      const hasTriggerPlaceholder = nodes.some((n) => n.data?.type === "trigger-placeholder");
      if (hasTriggerPlaceholder) {
        setNodes((nds) =>
          nds.map((n) =>
            n.data?.type === "trigger-placeholder"
              ? { ...n, data: { label, type, subtitle: "", status: "idle", ...(type === "ai-agent" ? { config: { builtinLlm: "gpt-4", builtinMemory: "buffer", temperature: 0.7, maxIterations: 5 } } : {}) } }
              : n
          )
        );
      } else {
        const newNode = {
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
  const [savedId, setSavedId] = useState(workflowId);

  const saveWorkflow = useCallback(async () => {
    setIsSaving(true);
    try {
      const res = await saveWorkflowAction({
        id: savedId,
        name: workflowName,
        nodes,
        edges,
        workspaceId
      });
      
      if (res.error) throw new Error(res.error);
      
      if (!savedId || savedId === "new") {
        setSavedId(res.data.id);
        window.history.replaceState(null, "", `/workspace/${workspaceId}/flowbyte/${res.data.id}`);
        toast.success("Workflow created");
      } else {
        toast.success("Workflow saved");
      }
    } catch (err) {
      toast.error("Failed to save: " + err.message);
    } finally {
      setIsSaving(false);
    }
  }, [workflowName, nodes, edges, savedId, workspaceId]);

  const saveAsTemplate = useCallback(async () => {
    try {
      const res = await saveAsTemplateAction({
        name: workflowName,
        nodes,
        edges,
      });
      if (res.error) throw new Error(res.error);
      toast.success("Saved as template!");
    } catch (err) {
      toast.error("Failed to save template: " + err.message);
    }
  }, [workflowName, nodes, edges]);

  const onDragOver = useCallback((event) => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/reactflow-type");
      const label = event.dataTransfer.getData("application/reactflow-label");
      if (!type || !label) return;
      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      setNodes((nds) => [...nds, { id: `${Date.now()}`, type: "workflowNode", position, data: { label, type, subtitle: "", status: "idle" } }]);
    },
    [screenToFlowPosition, setNodes]
  );

  const handleChatSend = useCallback(async (text) => {
    const userMsg = { id: crypto.randomUUID(), role: "user", text, timestamp: new Date() };
    setChatMessages((prev) => [...prev, userMsg]);

    const newHistory = [...conversationHistory, { role: "user", content: text }];
    setConversationHistory(newHistory);

    setNodes((nds) => nds.map((n) => {
      const t = n.data?.type;
      if (t === "chat-trigger") return { ...n, data: { ...n.data, status: "success" } };
      if (t === "ai-agent") return { ...n, data: { ...n.data, status: "running" } };
      return n;
    }));

    setChatLogs((prev) => [...prev, {
      id: crypto.randomUUID(),
      nodeName: "Chat Trigger",
      duration: 0,
      status: "success",
      timestamp: new Date(),
      output: { chatInput: text, sessionId: chatSessionId, triggered: true },
    }]);

    if (connectedAgentNode) {
      setIsStreaming(true);
      const botMsgId = crypto.randomUUID();
      const startTime = Date.now();

      setChatMessages((prev) => [...prev, { id: botMsgId, role: "bot", text: "", timestamp: new Date(), isStreaming: true }]);

      let fullResponse = "";

      await streamChat({
        messages: newHistory,
        model: agentConfig?.builtinLlm || "gpt-4",
        temperature: agentConfig?.temperature ?? 0.7,
        systemPrompt: agentConfig?.systemPrompt || "You are a helpful AI assistant.",
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
          setNodes((nds) => nds.map((n) =>
            n.data?.type === "ai-agent" ? { ...n, data: { ...n.data, status: "success" } } : n
          ));
        },
        onError: (errMsg) => {
          setChatMessages((prev) =>
            prev.map((m) => m.id === botMsgId ? { ...m, text: `Error: ${errMsg}`, isStreaming: false } : m)
          );
          setIsStreaming(false);
          setNodes((nds) => nds.map((n) =>
            n.data?.type === "ai-agent" ? { ...n, data: { ...n.data, status: "error" } } : n
          ));
          toast.error(errMsg);
        },
      });
    } else {
      const startTime = Date.now();
      execute(text).then(() => {
        const duration = Date.now() - startTime;
        const lastResult = Array.from(executionResults.values()).pop();
        const outputData = lastResult?.output || { chatInput: text };
        setChatMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "bot", text: typeof outputData === 'string' ? outputData : JSON.stringify(outputData, null, 2), timestamp: new Date() }]);
        setChatLogs((prev) => [...prev, {
          id: crypto.randomUUID(), nodeName: "Workflow", duration,
          status: lastResult?.status || "success",
          timestamp: new Date(), output: outputData,
        }]);
      });
    }
  }, [conversationHistory, connectedAgentNode, agentConfig, execute, executionResults, enableTools, chatSessionId, setNodes]);

  const handleNewSession = useCallback(() => {
    setChatSessionId(crypto.randomUUID());
    setChatMessages([]);
    setConversationHistory([]);
  }, []);

  const handleClearExecution = useCallback(() => { setChatLogs([]); }, []);

  const handleLoadTemplate = useCallback((name, templateNodes, templateEdges) => {
    setWorkflowName(name);
    setNodes(templateNodes);
    setEdges(templateEdges);
  }, [setNodes, setEdges]);

  return (
    <div className="flex-1 relative h-full flex flex-col" ref={reactFlowWrapper}>
      {/* Top toolbar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 h-12 bg-card/80 glass border-b border-border/60">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => router.push(`/workspace/${workspaceId}/flowbyte`)}>
            <Home className="h-4 w-4" />
          </Button>
          <input
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
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
            Save Template
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={saveWorkflow} disabled={isSaving}>
            {isExecuting || isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            {isSaving ? "Saving..." : "Save"}
          </Button>
          <Button variant="outline" size="sm" className={`h-8 text-xs gap-1.5 ${scheduleEnabled ? "border-primary text-primary" : ""}`} onClick={() => setShowSchedule(true)}>
            <Clock className="h-3.5 w-3.5" />
            {scheduleEnabled ? "Scheduled" : "Schedule"}
          </Button>
          <Button size="sm" className="h-8 text-xs gap-1.5" onClick={() => {
              if (hasChatTrigger) {
                setShowChat(true);
                setNodes((nds) => nds.map((n) =>
                  n.data?.type === "chat-trigger"
                    ? { ...n, data: { ...n.data, status: "waiting" } }
                    : n.data?.type === "ai-agent"
                    ? { ...n, data: { ...n.data, status: "idle" } }
                    : n
                ));
                toast.info("Waiting for chat input...");
              } else {
                execute();
              }
            }} disabled={isExecuting}>
            {isExecuting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
            {isExecuting ? "Running..." : "Execute"}
          </Button>
        </div>
      </div>

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
        >
          {selectedEdge && (() => {
            const edge = edges.find((e) => e.id === selectedEdge);
            if (!edge) return null;
            return (
              <Panel position="top-left" style={{ left: 0, top: 0 }}>
                <div className="fixed z-50" style={{ left: "50%", top: "45%" , transform: "translate(-50%, -50%)" }}>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-7 text-xs gap-1 px-2 shadow-lg"
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
            <Button onClick={() => { setNodePanelSlotFilter(undefined); setShowNodePanel(true); }} size="sm" className="gap-1.5 shadow-lg">
              <Plus className="h-4 w-4" /> Add Node
            </Button>
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
                {showChat ? "Hide Chat" : "Open Chat"}
              </Button>
            </Panel>
          )}
        </ReactFlow>
      </div>

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
          node={selectedNode}
          executionResult={executionResults.get(selectedNode.id)}
          onClose={() => setSelectedNode(null)}
          onUpdateConfig={onUpdateConfig}
        />
      )}

      {showTemplates && (
        <TemplateGallery onClose={() => setShowTemplates(false)} onLoadTemplate={handleLoadTemplate} />
      )}

      {contextMenu && (
        <div className="fixed z-50 min-w-[160px] rounded-md border border-border bg-popover text-popover-foreground shadow-md" style={{ top: contextMenu.y, left: contextMenu.x }}>
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
        onSave={(cron, enabled) => {
          setCronExpression(cron);
          setScheduleEnabled(enabled);
          toast.success("Schedule updated");
        }}
      />
    </div>
  );
}

export default function WorkflowCanvas(props) {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
