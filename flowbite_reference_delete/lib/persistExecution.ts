import { supabase } from "@/integrations/supabase/client";
import type { NodeExecutionResult } from "@/flowbite/hooks/useWorkflowExecution";

export async function persistExecution({
  workflowId,
  workflowName,
  status,
  startedAt,
  finishedAt,
  duration,
  mode,
  errorMessage,
  nodeExecutions,
}: {
  workflowId?: string;
  workflowName: string;
  status: string;
  startedAt: string;
  finishedAt: string | null;
  duration: string | null;
  mode: string;
  errorMessage?: string;
  nodeExecutions: any[];
}) {
  // Only set workflow_id if it's a valid UUID (not "new" or undefined)
  const isValidUuid = workflowId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(workflowId);

  const { data: { user } } = await supabase.auth.getUser();
  
  const { error } = await supabase.from("executions").insert({
    workflow_id: isValidUuid ? workflowId : null,
    workflow_name: workflowName,
    status,
    started_at: startedAt,
    finished_at: finishedAt || null,
    duration,
    mode,
    error_message: errorMessage || null,
    node_executions: nodeExecutions,
    user_id: user?.id,
  });

  if (error) {
    console.error("Failed to persist execution:", error);
  }
}
