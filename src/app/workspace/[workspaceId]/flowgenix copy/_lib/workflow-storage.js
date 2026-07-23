import { supabase } from "@/lib/supabase";

// strip non-serializable callbacks before persisting
const sanitizeNode = (n) => {
  const data = n.data || {};
  const cleaned = {};
  for (const [k, v] of Object.entries(data)) {
    if (typeof v === "function") continue;
    if (k === "icon") continue; // LucideIcon component
    cleaned[k] = v;
  }
  return { ...n, data: cleaned };
};

export async function listWorkflows(opts = {}) {
  const { data, error } = await supabase
    .from("workflows")
    .select("*")
    .eq("is_template", opts.templates ?? false)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getWorkflow(id) {
  const { data, error } = await supabase.from("workflows").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export async function createWorkflow(name = "Untitled Workflow") {
  const { data, error } = await supabase
    .from("workflows")
    .insert({ name })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function saveWorkflow(id, patch) {
  const payload = { ...patch };
  if (patch.nodes) payload.nodes = patch.nodes.map(sanitizeNode);
  if (patch.edges) payload.edges = patch.edges;
  
  const { error } = await supabase.from("workflows").update(payload).eq("id", id);
  if (error) throw error;
}

export async function saveAsTemplate(id, name) {
  const wf = await getWorkflow(id);
  if (!wf) throw new Error("Workflow not found");
  
  const { error } = await supabase.from("workflows").insert({
    name,
    is_template: true,
    nodes: wf.nodes,
    edges: wf.edges,
  });
  if (error) throw error;
}

export async function deleteWorkflow(id) {
  const { error } = await supabase.from("workflows").delete().eq("id", id);
  if (error) throw error;
}

// --- runs / logs ---

export async function createRun(workflowId, trigger = "manual", input) {
  const { data, error } = await supabase
    .from("workflow_runs")
    .insert({ workflow_id: workflowId, trigger, input: input ?? null })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function finishRun(runId, status, output, errorMsg) {
  const { error } = await supabase
    .from("workflow_runs")
    .update({
      status,
      output: output ?? null,
      error: errorMsg ?? null,
      finished_at: new Date().toISOString(),
    })
    .eq("id", runId);
  if (error) throw error;
}

export async function appendRunLog(entry) {
  const { error } = await supabase.from("workflow_run_logs").insert({
    run_id: entry.run_id,
    node_id: entry.node_id,
    node_label: entry.node_label ?? null,
    node_kind: entry.node_kind ?? null,
    status: entry.status ?? "success",
    message: entry.message ?? null,
    data: entry.data ?? null,
    duration_ms: entry.duration_ms ?? null,
  });
  if (error) throw error;
}

export async function listRuns(workflowId, limit = 50) {
  const { data, error } = await supabase
    .from("workflow_runs")
    .select("*")
    .eq("workflow_id", workflowId)
    .order("started_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function listRunLogs(runId) {
  const { data, error } = await supabase
    .from("workflow_run_logs")
    .select("*")
    .eq("run_id", runId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}
