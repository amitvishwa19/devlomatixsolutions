import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
  type NodeTypes,
  type EdgeTypes,
  type Viewport,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { DeletableEdge } from "@/flowgenix/components/canvas/edges/DeletableEdge";
import { NodePickerSheet } from "@/flowgenix/components/canvas/NodePickerSheet";
import { AddFirstStepNode } from "@/flowgenix/components/canvas/nodes/AddFirstStepNode";
import { TriggerNode } from "@/flowgenix/components/canvas/nodes/TriggerNode";
import { AgentNode } from "@/flowgenix/components/canvas/nodes/AgentNode";
import { UtilityNode } from "@/flowgenix/components/canvas/nodes/UtilityNode";
import { ToolNode } from "@/flowgenix/components/canvas/nodes/ToolNode";
import { Button } from "@/components/ui/button";
import { MessageSquare, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/flowgenix/components/AppLayout";
import { CanvasChatPanel } from "@/flowgenix/components/canvas/CanvasChatPanel";
import { NodeSettingsSheet } from "@/flowgenix/components/canvas/NodeSettingsSheet";
import { CanvasToolbar } from "@/flowgenix/components/canvas/CanvasToolbar";
import { iconForKind } from "@/flowgenix/components/canvas/iconForKind";
import { FIRST_NODE_ID, usePicker } from "@/flowgenix/components/canvas/usePicker";
import type { NodeRunStatus } from "@/flowgenix/components/canvas/nodeStatus";
import {
  createWorkflow,
  getWorkflow,
  listRunLogs,
  listRuns,
  saveAsTemplate,
  saveWorkflow,
  type WorkflowRow,
  type WorkflowRunLogRow,
  type WorkflowRunRow,
} from "@/flowgenix/lib/workflow-storage";
import { executeWorkflow } from "@/flowgenix/lib/workflow-runtime";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const NODE_TYPES: NodeTypes = {
  addFirst: AddFirstStepNode,
  trigger: TriggerNode,
  agent: AgentNode,
  utility: UtilityNode,
  tool: ToolNode,
};

const EDGE_TYPES: EdgeTypes = { deletable: DeletableEdge };

const initialNodes: Node[] = [
  {
    id: FIRST_NODE_ID,
    type: "addFirst",
    position: { x: 0, y: 0 },
    data: { label: "Add first step…" },
    draggable: true,
  },
];

type ChatMsg = { id: string; role: "user" | "assistant"; content: string };

const VIEWPORT_NODE_ID = "__viewport__";

const CanvasInner = () => {
  const { id: routeId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setViewport, getViewport } = useReactFlow();

  const [workflow, setWorkflow] = useState<WorkflowRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("Untitled Workflow");
  const [saving, setSaving] = useState(false);
  const [executing, setExecuting] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [showMinimap, setShowMinimap] = useState(false);
  const [settingsNodeId, setSettingsNodeId] = useState<string | null>(null);
  const [nodeStatuses, setNodeStatuses] = useState<Record<string, NodeRunStatus>>({});
  const viewportRef = useRef<Viewport | null>(null);
  const initialViewportRef = useRef<Viewport | null>(null);

  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [runs, setRuns] = useState<WorkflowRunRow[]>([]);
  const [logs, setLogs] = useState<WorkflowRunLogRow[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

  const { picker, setPicker, openForFirst, openAfter, openForTool, openAll, handlePick } = usePicker(nodes, edges, {
    setNodes,
    setEdges,
  });

  // ---------- load / create workflow ----------
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        let wf: WorkflowRow | null = null;
        if (routeId) {
          wf = await getWorkflow(routeId);
          if (!wf) {
            toast.error("Workflow not found");
            navigate("/workflows");
            return;
          }
        } else {
          wf = await createWorkflow("Untitled Workflow");
          navigate(`/canvas/${wf.id}`, { replace: true });
        }
        if (cancelled) return;
        setWorkflow(wf);
        setName(wf.name);

        const allLoaded = (wf.nodes ?? []) as Node[];
        const viewportNode = allLoaded.find((n) => n.id === VIEWPORT_NODE_ID);
        const loadedNodes = allLoaded.filter((n) => n.id !== VIEWPORT_NODE_ID);
        const loadedEdges = (wf.edges ?? []) as Edge[];
        const savedViewport =
          (viewportNode?.data as { viewport?: Viewport } | undefined)?.viewport ?? null;
        initialViewportRef.current = savedViewport;
        if (savedViewport) viewportRef.current = savedViewport;

        if (loadedNodes.length === 0) {
          setNodes(initialNodes);
          setEdges([]);
        } else {
          const hydrated = loadedNodes.map((n) => {
            const data = n.data as { kind?: string };
            return { ...n, data: { ...n.data, icon: iconForKind(data.kind) } };
          });
          setNodes(hydrated);
          setEdges(loadedEdges);
        }

        if (savedViewport) {
          window.setTimeout(() => setViewport(savedViewport, { duration: 0 }), 0);
        }

        const r = await listRuns(wf.id, 50);
        if (!cancelled) setRuns(r);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeId]);

  // ---------- realtime: runs + logs ----------
  useEffect(() => {
    if (!workflow) return;
    const ch = supabase
      .channel(`runs-${workflow.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "workflow_runs", filter: `workflow_id=eq.${workflow.id}` },
        (payload) => {
          const row = (payload.new ?? payload.old) as WorkflowRunRow;
          setRuns((prev) => {
            if (payload.eventType === "DELETE") return prev.filter((p) => p.id !== row.id);
            const exists = prev.some((p) => p.id === row.id);
            if (exists) return prev.map((p) => (p.id === row.id ? row : p));
            return [row, ...prev];
          });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [workflow]);

  useEffect(() => {
    if (!selectedRunId) {
      setLogs([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const l = await listRunLogs(selectedRunId);
      if (!cancelled) setLogs(l);
    })();
    const ch = supabase
      .channel(`logs-${selectedRunId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "workflow_run_logs", filter: `run_id=eq.${selectedRunId}` },
        (payload) => {
          setLogs((prev) => [...prev, payload.new as WorkflowRunLogRow]);
        },
      )
      .subscribe();
    return () => {
      cancelled = true;
      supabase.removeChannel(ch);
    };
  }, [selectedRunId]);

  const hasChatTrigger = nodes.some((n) => (n.data as { kind?: string } | undefined)?.kind === "trigger.chat");

  useEffect(() => {
    if (!hasChatTrigger && chatOpen) setChatOpen(false);
  }, [hasChatTrigger, chatOpen]);

  // ---------- node ops ----------
  const deleteNode = useCallback(
    (nodeId: string) => {
      setNodes((ns) => ns.filter((n) => n.id !== nodeId));
      setEdges((es) => es.filter((e) => e.source !== nodeId && e.target !== nodeId));
      setSettingsNodeId((curr) => (curr === nodeId ? null : curr));
    },
    [setNodes, setEdges],
  );

  const updateNodeData = useCallback(
    (nodeId: string, patch: { label?: string; description?: string; config?: Record<string, unknown> }) => {
      setNodes((ns) => ns.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, ...patch } } : n)));
    },
    [setNodes],
  );

  const regenerateWebhookToken = useCallback(async (): Promise<string | null> => {
    if (!workflow) return null;
    const token = crypto.randomUUID().replace(/-/g, "");
    await saveWorkflow(workflow.id, { webhook_token: token });
    setWorkflow({ ...workflow, webhook_token: token });
    return token;
  }, [workflow]);

  // Auto-generate webhook token when a webhook trigger node exists
  useEffect(() => {
    const hasWebhook = nodes.some((n) => (n.data as { kind?: string })?.kind === "trigger.webhook");
    if (hasWebhook && workflow && !workflow.webhook_token) {
      const token = crypto.randomUUID().replace(/-/g, "");
      saveWorkflow(workflow.id, { webhook_token: token }).then(() => {
        setWorkflow((w) => (w ? { ...w, webhook_token: token } : w));
      });
    }
  }, [nodes, workflow]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, type: "deletable", animated: true }, eds)),
    [setEdges],
  );

  // inject callbacks + run status into nodes
  const nodesWithCallbacks = useMemo(
    () =>
      nodes.map((n) => {
        if (n.id === FIRST_NODE_ID) return { ...n, data: { ...n.data, onClick: openForFirst } };
        const data = n.data as { kind?: string };
        return {
          ...n,
          data: {
            ...n.data,
            onDelete: deleteNode,
            onAdd: openAfter,
            onAddTool: n.type === "agent" ? openForTool : undefined,
            icon: (n.data as { icon?: unknown }).icon ?? iconForKind(data.kind),
            runStatus: nodeStatuses[n.id] ?? "idle",
          },
        };
      }),
    [nodes, openForFirst, deleteNode, openAfter, openForTool, nodeStatuses],
  );

  const settingsNode = settingsNodeId ? nodes.find((n) => n.id === settingsNodeId) ?? null : null;

  // ---------- save / execute ----------
  const buildPersistNodes = useCallback(() => {
    const cleanNodes = nodes.filter((n) => n.id !== FIRST_NODE_ID);
    const vp = viewportRef.current ?? (() => {
      try { return getViewport(); } catch { return null; }
    })();
    if (vp) {
      cleanNodes.push({
        id: VIEWPORT_NODE_ID,
        type: "default",
        position: { x: 0, y: 0 },
        data: { viewport: vp },
        hidden: true,
        selectable: false,
        draggable: false,
      } as Node);
    }
    return cleanNodes;
  }, [nodes, getViewport]);

  const handleSave = async () => {
    if (!workflow) return;
    setSaving(true);
    try {
      await saveWorkflow(workflow.id, { name, nodes: buildPersistNodes(), edges });
      toast.success("Saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAsTemplate = async () => {
    if (!workflow) return;
    try {
      await handleSave();
      await saveAsTemplate(workflow.id, `${name} (template)`);
      toast.success("Saved as template");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  const handleExecute = async (input?: { prompt?: string }, trigger = "manual") => {
    if (!workflow) return null;
    setExecuting(true);
    setNodeStatuses({});
    try {
      const persistNodes = buildPersistNodes();
      const cleanNodes = persistNodes.filter((n) => n.id !== VIEWPORT_NODE_ID);
      await saveWorkflow(workflow.id, { name, nodes: persistNodes, edges });

      const result = await executeWorkflow({
        workflowId: workflow.id,
        nodes: cleanNodes,
        edges,
        trigger,
        input,
        failureWebhook: workflow.failure_webhook_url ?? null,
        workflowName: name,
        onNodeStatus: (id, status) => setNodeStatuses((prev) => ({ ...prev, [id]: status })),
      });
      setSelectedRunId(result.id);
      if (result.status === "error") toast.error(result.error ?? "Execution failed");
      else toast.success("Execution complete");

      // fade success states after a short delay
      window.setTimeout(() => setNodeStatuses({}), 4000);
      return result;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
      return null;
    } finally {
      setExecuting(false);
    }
  };

  const sendChatMessage = async (text: string) => {
    setChatMessages((m) => [...m, { id: crypto.randomUUID(), role: "user", content: text }]);
    if (!chatOpen) setChatOpen(true);
    const result = await handleExecute({ prompt: text }, "chat");
    if (result) {
      const reply =
        typeof result.output === "string" ? result.output : JSON.stringify(result.output ?? "(no output)");
      setChatMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), role: "assistant", content: reply || "(empty)" },
      ]);
    }
  };

  if (loading) {
    return (
      <AppLayout fullBleed>
        <div className="flex h-full items-center justify-center bg-background">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout fullBleed>
    <div className="relative h-full w-full bg-background">
      <CanvasToolbar
        name={name}
        onNameChange={setName}
        onNameBlur={handleSave}
        status={workflow?.status ?? "draft"}
        saving={saving}
        executing={executing}
        onSave={handleSave}
        onSaveAsTemplate={handleSaveAsTemplate}
        onExecute={() => handleExecute()}
        workflowId={workflow?.id}
        scheduleEnabled={workflow?.schedule_enabled}
        scheduleCron={workflow?.schedule_cron}
        onScheduleSaved={(enabled, cron) =>
          setWorkflow((w) => (w ? { ...w, schedule_enabled: enabled, schedule_cron: cron } : w))
        }
        failureWebhookUrl={workflow?.failure_webhook_url ?? null}
        onFailureWebhookSaved={(url) =>
          setWorkflow((w) => (w ? { ...w, failure_webhook_url: url } : w))
        }
        showMinimap={showMinimap}
        onShowMinimapChange={setShowMinimap}
        onAddNode={() => {
          // place near current viewport center in flow coords
          let pos: { x: number; y: number } | undefined;
          try {
            const vp = getViewport();
            const w = window.innerWidth;
            const h = window.innerHeight;
            pos = { x: (w / 2 - vp.x) / vp.zoom, y: (h / 2 - vp.y) / vp.zoom };
          } catch { pos = undefined; }
          openAll(pos);
        }}
      />

      <ReactFlow
        nodes={nodesWithCallbacks}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onMove={(_, vp) => {
          viewportRef.current = vp;
        }}
        onNodeDoubleClick={(_, node) => {
          if (node.id === FIRST_NODE_ID) return;
          setSettingsNodeId(node.id);
        }}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
        fitView={!initialViewportRef.current}
        fitViewOptions={{ padding: 0.4, minZoom: 0.6, maxZoom: 1.2 }}
        defaultViewport={initialViewportRef.current ?? undefined}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ type: "deletable", animated: true }}
      >
        <Background gap={18} size={1.2} color="hsl(var(--muted-foreground) / 0.35)" />
        <Controls className="!bottom-4 !left-4" showInteractive={false} />
        {showMinimap && (
          <MiniMap
            pannable
            zoomable
            className="!bottom-4 !right-4"
            maskColor="hsl(var(--background) / 0.7)"
            nodeColor={() => "hsl(var(--primary) / 0.8)"}
            nodeStrokeColor="hsl(var(--primary))"
            nodeBorderRadius={4}
            style={{ width: 180, height: 120 }}
          />
        )}
      </ReactFlow>

      {hasChatTrigger && (
        <div
          className={`absolute left-1/2 z-30 -translate-x-1/2 transition-all ${
            chatOpen ? "bottom-[332px]" : "bottom-4"
          }`}
        >
          <Button
            size="sm"
            onClick={() => setChatOpen((v) => !v)}
            className={`gap-1.5 font-mono text-xs shadow-lg ${
              chatOpen
                ? "bg-secondary text-foreground hover:bg-secondary/80"
                : "bg-[hsl(var(--primary))] text-primary-foreground"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            {chatOpen ? "Hide chat" : "Open chat"}
          </Button>
        </div>
      )}

      {hasChatTrigger && chatOpen && workflow && (
        <CanvasChatPanel
          workflowId={workflow.id}
          onClose={() => setChatOpen(false)}
          onSend={sendChatMessage}
          messages={chatMessages}
          setMessages={setChatMessages}
          runs={runs}
          logs={logs}
          selectedRunId={selectedRunId}
          onSelectRun={setSelectedRunId}
          onClearRuns={() => setRuns([])}
        />
      )}

      <NodePickerSheet
        open={picker.open}
        onOpenChange={(o) => !o && setPicker({ open: false })}
        mode={picker.open ? picker.mode : "first"}
        onPick={handlePick}
      />

      <NodeSettingsSheet
        node={settingsNode}
        open={settingsNodeId !== null}
        onOpenChange={(o) => !o && setSettingsNodeId(null)}
        onSave={updateNodeData}
        onDelete={deleteNode}
        webhookToken={workflow?.webhook_token ?? null}
        onRegenerateWebhookToken={regenerateWebhookToken}
      />
    </div>
    </AppLayout>
  );
};

const Canvas = () => (
  <ReactFlowProvider>
    <CanvasInner />
  </ReactFlowProvider>
);

export default Canvas;
