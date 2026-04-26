'use client'

import { useCallback, useState, useRef, useEffect } from "react";
import {
    ReactFlow, addEdge, useNodesState, useEdgesState, Controls,
    Background, BackgroundVariant, Panel, useReactFlow, ReactFlowProvider,
} from "@xyflow/react";
import { AnimatePresence } from "framer-motion";
import "@xyflow/react/dist/style.css";
import WorkflowNode from "./canvas/WorkflowNode";
import WorkflowEdge from "./canvas/WorkflowEdge";
import NodePanel from "./canvas/NodePanel";
import NodeDetailPanel from "./canvas/NodeDetailPanel";
import TemplateGallery from "./canvas/TemplateGallery";
import { Button } from "@/components/ui/button";
import { Plus, Play, Save, Pencil, Trash2, Loader2, Home, MessageSquare, BookOpen, Download, Clock } from "lucide-react";
import ScheduleDialog from "./canvas/ScheduleDialog";
import FlowChatPanel from "./canvas/FlowChatPanel";
import { useRouter, useParams } from "next/navigation";
import { useWorkflowExecution } from "../_hooks/useWorkflowExecution";
import { useWorkflowKeyboard } from "../_hooks/useWorkflowKeyboard";
import { toast } from "sonner";
import { streamChat } from "../_lib/streamChat";
import { saveWorkflowAction, updateScheduleAction } from "../_actions/workflows/actions";

const nodeTypes = { workflowNode: WorkflowNode };
const edgeTypes = { workflowEdge: WorkflowEdge };

const initialNodes = [
    { id: "trigger-placeholder", type: "workflowNode", position: { x: -350, y: 150 }, data: { label: "Add Trigger", type: "trigger-placeholder", subtitle: "Click to select a trigger", status: "idle" } },
];
const initialEdges = [];

const DEFAULT_VIEWPORT = {
    x: 889.39030116149,
    y: 218.0698850525018,
    zoom: 0.9594425829821254
};

function WorkflowCanvasInner({ workflowId, workflowName: controlledName, initialName, onNameChange, loadedNodes, loadedEdges, initialCron, initialScheduleEnabled, initialViewport }) {
    const router = useRouter();
    const params = useParams();
    const workspaceId = params.workspaceId;
    const reactFlowWrapper = useRef(null);
    
    const [nodes, setNodes, onNodesChange] = useNodesState((loadedNodes && loadedNodes.length > 0) ? loadedNodes : initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState((loadedEdges && loadedEdges.length > 0) ? loadedEdges : initialEdges);

    const [workflowName, setWorkflowName] = useState(controlledName || initialName || "Main Workflow");

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
    
    const { screenToFlowPosition, getViewport, setViewport } = useReactFlow();

    // Restore viewport
    useEffect(() => {
        const viewportToRestore = (initialViewport && typeof initialViewport === 'object')
            ? initialViewport
            : DEFAULT_VIEWPORT;

        const timer = setTimeout(() => {
            setViewport(viewportToRestore, { duration: 800 });
        }, 100);
        return () => clearTimeout(timer);
    }, [initialViewport, setViewport]);

    useEffect(() => {
        if (controlledName) setWorkflowName(controlledName);
    }, [controlledName]);

    const handleNameChange = (newName) => {
        setWorkflowName(newName);
        if (onNameChange) onNameChange(newName);
    };

    const hasChatTrigger = nodes.some((n) => n.data?.type === "chat-trigger");
    const isWaitingForChat = nodes.some((n) => n.data?.type === "chat-trigger" && n.data?.status === "waiting");

    useEffect(() => {
        if (!hasChatTrigger && showChat) setShowChat(false);
    }, [hasChatTrigger, showChat]);

    const chatTriggerNode = nodes.find((n) => n.data?.type === "chat-trigger");
    const agentNode = nodes.find((n) => n.data?.type === "ai-agent");
    const isChatConnectedToAgent = !!(chatTriggerNode && agentNode && edges.some(
        (e) => e.source === chatTriggerNode.id && e.target === agentNode.id
    ));
    const connectedAgentNode = isChatConnectedToAgent ? agentNode : null;
    const agentConfig = connectedAgentNode ? (connectedAgentNode.data).config : null;

    const styledEdges = edges.map((edge) => {
        const sourceNode = nodes.find((n) => n.id === edge.source);
        const targetNode = nodes.find((n) => n.id === edge.target);
        const sourceStatus = sourceNode?.data?.status;
        const targetStatus = targetNode?.data?.status;

        let edgeStatus = 'idle';
        if (sourceStatus === "success" && targetStatus === "running") edgeStatus = 'running';
        else if (sourceStatus === "success" && targetStatus === "success") edgeStatus = 'success';
        else if (sourceStatus === "error" || targetStatus === "error") edgeStatus = 'error';

        if (isWaitingForChat) {
            return {
                ...edge,
                type: 'workflowEdge',
                data: { status: 'running' },
                animated: true,
                style: { stroke: "var(--chart-4)", strokeWidth: 3, strokeDasharray: "6 6" },
            };
        }

        return {
            ...edge,
            type: 'workflowEdge',
            data: { status: edgeStatus },
            selected: edge.id === selectedEdge,
            style: {
                ...edge.style,
                ...(edge.id === selectedEdge ? { stroke: "var(--destructive)", strokeWidth: 3 } : {})
            }
        };
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
        (params) => setEdges((eds) => addEdge({ ...params, type: "workflowEdge", animated: true }, eds)),
        [setEdges]
    );

    const onEdgeClick = useCallback((_, edge) => {
        setSelectedNode(null);
        setContextMenu(null);
        setSelectedEdge(edge.id);
    }, []);

    const onNodeClick = useCallback((_, node) => {
        if (node.data?.type === "trigger-placeholder") { setShowNodePanel(true); return; }
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

    const addNode = useCallback(
        (type, label) => {
            const hasTriggerPlaceholder = nodes.some((n) => n.data?.type === "trigger-placeholder");
            if (hasTriggerPlaceholder) {
                setNodes((nds) =>
                    nds.map((n) =>
                        n.data?.type === "trigger-placeholder"
                            ? { ...n, data: { label, type, subtitle: "", status: "idle", ...(type === "ai-agent" ? { config: { builtinLlm: "gpt-4o", builtinMemory: "buffer", temperature: 0.7, maxIterations: 5 } } : {}) } }
                            : n
                    )
                );
            } else {
                const newNode = {
                    id: `${Date.now()}`,
                    type: "workflowNode",
                    position: { x: -300 + Math.random() * 200, y: 150 + Math.random() * 200 },
                    data: { label, type, subtitle: "", status: "idle", ...(type === "ai-agent" ? { config: { builtinLlm: "gpt-4o", builtinMemory: "buffer", temperature: 0.7, maxIterations: 5 } } : {}) },
                };
                setNodes((nds) => [...nds, newNode]);
            }
            setShowNodePanel(false);
        },
        [setNodes, nodes]
    );

    const [isSaving, setIsSaving] = useState(false);

    const saveWorkflow = useCallback(async () => {
        setIsSaving(true);
        try {
            const res = await saveWorkflowAction({
                id: workflowId,
                name: workflowName,
                nodes,
                edges,
                workspaceId,
                viewport: getViewport(),
            });

            if (res.error) toast.error(res.error);
            else toast.success("Workflow saved");
        } catch (error) {
            toast.error("Failed to save workflow");
        } finally {
            setIsSaving(false);
        }
    }, [workflowId, workflowName, nodes, edges, workspaceId, getViewport]);

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
                model: agentConfig?.builtinLlm || "gpt-4o",
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
                        duration: `${duration}ms`,
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
                setChatMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "bot", text: JSON.stringify(outputData, null, 2), timestamp: new Date() }]);
                setChatLogs((prev) => [...prev, {
                    id: crypto.randomUUID(), nodeName: "Workflow", duration: `${duration}ms`,
                    status: (lastResult?.status || "success"),
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

    const handleLoadTemplate = useCallback((name, templateNodes, templateEdges) => {
        setNodes(templateNodes);
        setEdges(templateEdges);
    }, [setNodes, setEdges]);

    return (
        <div className="flex-1 relative h-full flex flex-col" ref={reactFlowWrapper}>
            {/* Top toolbar */}
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 h-12 bg-card/80 glass border-b border-border/60">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => router.push(`/workspace/${workspaceId}/flowgenix`)}>
                        <Home className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-semibold px-2 py-1">{workflowName}</span>
                    <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded uppercase tracking-wider font-bold">Active</span>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5" onClick={() => setShowTemplates(true)}>
                        <BookOpen className="h-3.5 w-3.5" />
                        Templates
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
                            setShowChat(true);
                            setNodes((nds) => nds.map((n) =>
                                n.data?.type === "chat-trigger" ? { ...n, data: { ...n.data, status: "waiting" } } : n
                            ));
                            toast.info("Waiting for chat message...");
                        } else {
                            execute();
                        }
                    }} disabled={isExecuting}>
                        {isExecuting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                        Execute
                    </Button>
                </div>
            </div>

            {/* Canvas Container */}
            <div className="flex-1 relative overflow-hidden pt-12 bg-[#fafafa] dark:bg-[#0a0a0a]">
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
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    fitView
                    defaultEdgeOptions={{ type: "workflowEdge", animated: true }}
                >
                    <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
                    <Controls position="bottom-right" />
                    
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
                                {showChat ? "Hide chat" : "Open chat"}
                            </Button>
                        </Panel>
                    )}
                </ReactFlow>

                <AnimatePresence>
                    {showNodePanel && (
                        <NodePanel onClose={() => { setShowNodePanel(false); setNodePanelSlotFilter(undefined); }} onAddNode={addNode} slotFilter={nodePanelSlotFilter} />
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {selectedNode && (
                        <NodeDetailPanel
                            node={selectedNode}
                            executionResult={executionResults.get(selectedNode.id)}
                            onClose={() => setSelectedNode(null)}
                            onUpdateConfig={onUpdateConfig}
                        />
                    )}
                </AnimatePresence>

                {showTemplates && (
                    <TemplateGallery onClose={() => setShowTemplates(false)} onLoadTemplate={handleLoadTemplate} />
                )}
            </div>

            {/* Chat Panel */}
            {showChat && hasChatTrigger && (
                <div className="h-[40%] border-t border-border">
                    <FlowChatPanel
                        sessionId={chatSessionId}
                        messages={chatMessages}
                        onSendMessage={handleChatSend}
                        onClose={() => setShowChat(false)}
                        onNewSession={handleNewSession}
                        logs={chatLogs}
                        onClearExecution={() => setChatLogs([])}
                        isStreaming={isStreaming}
                        enableTools={enableTools}
                        onToggleTools={setEnableTools}
                    />
                </div>
            )}

            {/* Context Menu */}
            {contextMenu && (
                <div className="fixed z-50 min-w-[160px] rounded-md border border-border bg-popover text-popover-foreground shadow-md" style={{ top: contextMenu.y, left: contextMenu.x }}>
                    <div className="p-1">
                        <button onClick={() => { const node = nodes.find(n => n.id === contextMenu.nodeId); setSelectedNode(node); setContextMenu(null); }} className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent transition-colors">
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
                    try {
                        const res = await updateScheduleAction({ workflowId, cron, enabled });
                        if (res.error) toast.error(res.error);
                        else toast.success("Schedule updated");
                    } catch (e) {
                        toast.error("Failed to update schedule");
                    }
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
