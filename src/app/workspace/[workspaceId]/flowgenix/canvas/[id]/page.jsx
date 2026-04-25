"use client";

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
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { DeletableEdge } from "../../_components/canvas/DeletableEdge";
import { NodePickerSheet } from "../../_components/canvas/NodePickerSheet";
import { AddFirstStepNode } from "../../_components/canvas/AddFirstStepNode";
import { TriggerNode } from "../../_components/canvas/TriggerNode";
import { AgentNode } from "../../_components/canvas/AgentNode";
import { UtilityNode } from "../../_components/canvas/UtilityNode";
import { ToolNode } from "../../_components/canvas/ToolNode";
import { Button } from "@/components/ui/button";
import { MessageSquare, Loader2 } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { AppLayout } from "../../_components/AppLayout";
import { CanvasChatPanel } from "../../_components/canvas/CanvasChatPanel";
import { NodeSettingsSheet } from "../../_components/canvas/NodeSettingsSheet";
import { CanvasToolbar } from "../../_components/canvas/CanvasToolbar";
import { iconForKind } from "../../_components/canvas/iconForKind";
import { FIRST_NODE_ID, usePicker } from "../../_components/canvas/usePicker";
import {
  createWorkflow,
  getWorkflow,
  listRunLogs,
  listRuns,
  saveAsTemplate,
  saveWorkflow,
} from "../../_lib/workflow-storage";
import { executeWorkflow } from "../../_lib/workflow-runtime";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const NODE_TYPES = {
  addFirst: AddFirstStepNode,
  trigger: TriggerNode,
  agent: AgentNode,
  utility: UtilityNode,
  tool: ToolNode,
};

const EDGE_TYPES = { deletable: DeletableEdge };

const initialNodes = [
  {
    id: FIRST_NODE_ID,
    type: "addFirst",
    position: { x: 0, y: 0 },
    data: { label: "Add first step…" },
    draggable: true,
  },
];

const VIEWPORT_NODE_ID = "__viewport__";

const CanvasInner = () => {
  const params = useParams();
  const routeId = params?.id;
  const workspaceId = params?.workspaceId;
  const router = useRouter();
  const { setViewport, getViewport } = useReactFlow();

  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("Untitled Workflow");
  const [saving, setSaving] = useState(false);
  const [executing, setExecuting] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [showMinimap, setShowMinimap] = useState(false);
  const [settingsNodeId, setSettingsNodeId] = useState(null);
  const [nodeStatuses, setNodeStatuses] = useState({});
  const viewportRef = useRef(null);
  const initialViewportRef = useRef(null);

  const [chatMessages, setChatMessages] = useState([]);
  const [runs, setRuns] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selectedRunId, setSelectedRunId] = useState(null);

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
        let wf = null;
        if (routeId) {
          wf = await getWorkflow(routeId);
          if (!wf) {
            toast.error("Workflow not found");
            router.push(`/workspace/${workspaceId}/flowgenix`);
            return;
          }
        } else {
          wf = await createWorkflow("Untitled Workflow");
          router.replace(`/workspace/${workspaceId}/flowgenix/canvas/${wf.id}`);
        }
        if (cancelled) return;
        setWorkflow(wf);
        setName(wf.name);

        const allLoaded = (wf.nodes ?? []);
        const viewportNode = allLoaded.find((n) => n.id === VIEWPORT_NODE_ID);
        const loadedNodes = allLoaded.filter((n) => n.id !== VIEWPORT_NODE_ID);
        const loadedEdges = (wf.edges ?? []);
        const savedViewport = viewportNode?.data?.viewport ?? null;
        initialViewportRef.current = savedViewport;
        if (savedViewport) viewportRef.current = savedViewport;

        if (loadedNodes.length === 0) {
          setNodes(initialNodes);
          setEdges([]);
        } else {
          const hydrated = loadedNodes.map((n) => {
            const data = n.data || {};
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
        toast.error(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [routeId, workspaceId, router, setViewport, setNodes, setEdges]);

  // ---------- realtime: runs + logs ----------
  useEffect(() => {
    if (!workflow) return;
    const ch = supabase
      .channel(`runs-${workflow.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "workflow_runs", filter: `workflow_id=eq.${workflow.id}` },
        (payload) => {
          const row = (payload.new ?? payload.old);
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
          setLogs((prev) => [...prev, payload.new]);
        },
      )
      .subscribe();
    return () => {
      cancelled = true;
      supabase.removeChannel(ch);
    };
  }, [selectedRunId]);

  const hasChatTrigger = nodes.some((n) => n.data?.kind === "trigger.chat");

  useEffect(() => {
    if (!hasChatTrigger && chatOpen) setChatOpen(false);
  }, [hasChatTrigger, chatOpen]);

  // ---------- node ops ----------
  const deleteNode = useCallback(
    (nodeId) => {
      setNodes((ns) => ns.filter((n) => n.id !== nodeId));
      setEdges((es) => es.filter((e) => e.source !== nodeId && e.target !== nodeId));
      setSettingsNodeId((curr) => (curr === nodeId ? null : curr));
    },
    [setNodes, setEdges],
  );

  const updateNodeData = useCallback(
    (nodeId, patch) => {
      setNodes((ns) => ns.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, ...patch } } : n)));
    },
    [setNodes],
  );

  const regenerateWebhookToken = useCallback(async () => {
    if (!workflow) return null;
    const token = crypto.randomUUID().replace(/-/g, "");
    await saveWorkflow(workflow.id, { webhook_token: token });
    setWorkflow({ ...workflow, webhook_token: token });
    return token;
  }, [workflow]);

  // Auto-generate webhook token when a webhook trigger node exists
  useEffect(() => {
    const hasWebhook = nodes.some((n) => n.data?.kind === "trigger.webhook");
    if (hasWebhook && workflow && !workflow.webhook_token) {
      const token = crypto.randomUUID().replace(/-/g, "");
      saveWorkflow(workflow.id, { webhook_token: token }).then(() => {
        setWorkflow((w) => (w ? { ...w, webhook_token: token } : w));
      });
    }
  }, [nodes, workflow]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, type: "deletable", animated: true }, eds)),
    [setEdges],
  );

  // inject callbacks + run status into nodes
  const nodesWithCallbacks = useMemo(
    () =>
      nodes.map((n) => {
        if (n.id === FIRST_NODE_ID) return { ...n, data: { ...n.data, onClick: openForFirst } };
        const data = n.data || {};
        return {
          ...n,
          data: {
            ...n.data,
            onDelete: deleteNode,
            onAdd: openAfter,
            onAddTool: n.type === "agent" ? openForTool : undefined,
            icon: n.data?.icon ?? iconForKind(data.kind),
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
      });
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
      toast.error(e.message);
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
      toast.error(e.message);
    }
  };

  const handleExecute = async (input, trigger = "manual") => {
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

      window.setTimeout(() => setNodeStatuses({}), 4000);
      return result;
    } catch (e) {
      toast.error(e.message);
      return null;
    } finally {
      setExecuting(false);
    }
  };

  const sendChatMessage = async (text) => {
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
          let pos;
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

export default function CanvasPage() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}
