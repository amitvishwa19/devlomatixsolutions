import { supabase } from "@/lib/supabase";

export async function listThreads(scope, workflowId) {
  let q = supabase.from("chat_threads").select("*").eq("scope", scope).order("updated_at", { ascending: false });
  if (scope === "canvas" && workflowId) q = q.eq("workflow_id", workflowId);
  if (scope === "canvas" && !workflowId) return [];
  const { data, error } = await q;
  if (error) {
    console.error(error);
    return [];
  }
  return data ?? [];
}

export async function createThread(
  scope,
  workflowId,
  title = "New chat",
) {
  const { data, error } = await supabase
    .from("chat_threads")
    .insert({ scope, workflow_id: workflowId, title })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function renameThread(id, title) {
  const { error } = await supabase.from("chat_threads").update({ title }).eq("id", id);
  if (error) throw error;
}

export async function deleteThread(id) {
  await supabase.from("messages").delete().eq("thread_id", id);
  const { error } = await supabase.from("chat_threads").delete().eq("id", id);
  if (error) throw error;
}

export async function touchThread(id) {
  await supabase.from("chat_threads").update({ updated_at: new Date().toISOString() }).eq("id", id);
}

// ---------- Thread-scoped messages (for the main agent chat) ----------

export async function loadThreadMessages(threadId) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });
  if (error) {
    console.error(error);
    return [];
  }
  return (data ?? []).map((m) => ({
    role: m.role,
    content: m.content,
    meta: m.meta ?? undefined,
  }));
}

export async function appendThreadMessage(threadId, m) {
  const { error } = await supabase.from("messages").insert({
    role: m.role,
    content: m.content,
    meta: m.meta ?? null,
    thread_id: threadId,
  });
  if (error) throw error;
  await touchThread(threadId);
}

export async function clearThreadMessages(threadId) {
  const { error } = await supabase.from("messages").delete().eq("thread_id", threadId);
  if (error) throw error;
}

/** Delete the most recent assistant message in a thread (used by Regenerate). */
export async function deleteLastAssistant(threadId) {
  const { data, error } = await supabase
    .from("messages")
    .select("id, role, created_at")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: false })
    .limit(1);
  if (error) throw error;
  const last = data?.[0];
  if (last && last.role === "assistant") {
    await supabase.from("messages").delete().eq("id", last.id);
  }
}

/** Get-or-create a default thread for a scope (used on first load). */
export async function ensureDefaultThread(
  scope,
  workflowId,
) {
  const existing = await listThreads(scope, workflowId);
  if (existing.length > 0) return existing[0];
  return createThread(scope, workflowId, "Default");
}
