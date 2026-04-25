import { supabase } from "@/integrations/supabase/client";
import type { Edge, Node } from "@xyflow/react";

export type WorkflowRow = {
  id: string;
  name: string;
  is_template: boolean;
  status: string;
  nodes: Node[];
  edges: Edge[];
  schedule_cron: string | null;
  schedule_enabled: boolean;
  webhook_token?: string | null;
  failure_webhook_url?: string | null;
  created_at: string;
  updated_at: string;
};

export type WorkflowRunRow = {
  id: string;
  workflow_id: string;
  status: "running" | "success" | "error";
  trigger: string;
  input: unknown;
  output: unknown;
  error: string | null;
  started_at: string;
  finished_at: string | null;
};

export type WorkflowRunLogRow = {
  id: string;
  run_id: string;
  node_id: string;
  node_label: string | null;
  node_kind: string | null;
  status: "success" | "error" | "info";
  message: string | null;
  data: unknown;
  duration_ms: number | null;
  created_at: string;
};

// strip non-serializable callbacks before persisting
const sanitizeNode = (n: Node): Node => {
  const data = n.data as Record<string, unknown>;
  const cleaned: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    if (typeof v === "function") continue;
    if (k === "icon") continue; // LucideIcon component
    cleaned[k] = v;
  }
  return { ...n, data: cleaned };
};

export async function listWorkflows(opts: { templates?: boolean } = {}): Promise<WorkflowRow[]> {
  const { data, error } = await supabase
    .from("workflows")
    .select("*")
    .eq("is_template", opts.templates ?? false)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as WorkflowRow[];
}

export async function getWorkflow(id: string): Promise<WorkflowRow | null> {
  const { data, error } = await supabase.from("workflows").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as unknown as WorkflowRow) ?? null;
}

export async function createWorkflow(name = "Untitled Workflow"): Promise<WorkflowRow> {
  const { data, error } = await supabase
    .from("workflows")
    .insert({ name })
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as WorkflowRow;
}

export async function saveWorkflow(
  id: string,
  patch: Partial<Pick<WorkflowRow, "name" | "status" | "is_template" | "schedule_cron" | "schedule_enabled" | "webhook_token" | "failure_webhook_url">> & {
    nodes?: Node[];
    edges?: Edge[];
  },
) {
  const payload: Record<string, unknown> = { ...patch };
  if (patch.nodes) payload.nodes = patch.nodes.map(sanitizeNode) as never;
  if (patch.edges) payload.edges = patch.edges as never;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await supabase.from("workflows").update(payload as any).eq("id", id);
  if (error) throw error;
}

export async function saveAsTemplate(id: string, name: string) {
  const wf = await getWorkflow(id);
  if (!wf) throw new Error("Workflow not found");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await supabase.from("workflows").insert({
    name,
    is_template: true,
    nodes: wf.nodes as never,
    edges: wf.edges as never,
  } as any);
  if (error) throw error;
}

export async function deleteWorkflow(id: string) {
  const { error } = await supabase.from("workflows").delete().eq("id", id);
  if (error) throw error;
}

// --- runs / logs ---

export async function createRun(workflowId: string, trigger = "manual", input?: unknown): Promise<WorkflowRunRow> {
  const { data, error } = await supabase
    .from("workflow_runs")
    .insert({ workflow_id: workflowId, trigger, input: (input as never) ?? null })
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as WorkflowRunRow;
}

export async function finishRun(runId: string, status: "success" | "error", output?: unknown, errorMsg?: string) {
  const { error } = await supabase
    .from("workflow_runs")
    .update({
      status,
      output: (output as never) ?? null,
      error: errorMsg ?? null,
      finished_at: new Date().toISOString(),
    })
    .eq("id", runId);
  if (error) throw error;
}

export async function appendRunLog(entry: {
  run_id: string;
  node_id: string;
  node_label?: string | null;
  node_kind?: string | null;
  status?: "success" | "error" | "info";
  message?: string | null;
  data?: unknown;
  duration_ms?: number | null;
}) {
  const { error } = await supabase.from("workflow_run_logs").insert({
    run_id: entry.run_id,
    node_id: entry.node_id,
    node_label: entry.node_label ?? null,
    node_kind: entry.node_kind ?? null,
    status: entry.status ?? "success",
    message: entry.message ?? null,
    data: (entry.data as never) ?? null,
    duration_ms: entry.duration_ms ?? null,
  });
  if (error) throw error;
}

export async function listRuns(workflowId: string, limit = 50): Promise<WorkflowRunRow[]> {
  const { data, error } = await supabase
    .from("workflow_runs")
    .select("*")
    .eq("workflow_id", workflowId)
    .order("started_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as WorkflowRunRow[];
}

export async function listRunLogs(runId: string): Promise<WorkflowRunLogRow[]> {
  const { data, error } = await supabase
    .from("workflow_run_logs")
    .select("*")
    .eq("run_id", runId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as WorkflowRunLogRow[];
}
