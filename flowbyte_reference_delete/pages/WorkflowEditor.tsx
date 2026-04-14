import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import WorkflowCanvas from "@/flowbite/components/WorkflowCanvas";
import { Loader2 } from "lucide-react";
import type { Node, Edge } from "@xyflow/react";

export default function WorkflowEditor() {
  const { id } = useParams();
  const isNew = !id || id === "new";

  const [workflowName, setWorkflowName] = useState("My Workflow");
  const [initialNodes, setInitialNodes] = useState<Node[] | null>(null);
  const [initialEdges, setInitialEdges] = useState<Edge[] | null>(null);
  const [initialCron, setInitialCron] = useState("");
  const [initialScheduleEnabled, setInitialScheduleEnabled] = useState(false);
  const [loading, setLoading] = useState(!isNew);

  useEffect(() => {
    if (isNew) {
      setInitialNodes(undefined as any);
      setInitialEdges(undefined as any);
      setLoading(false);
      return;
    }

    (async () => {
      const { data, error } = await supabase
        .from("workflows")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) {
        setWorkflowName(data.name);
        setInitialNodes(data.nodes as any as Node[]);
        setInitialEdges(data.edges as any as Edge[]);
        setInitialCron((data as any).cron_expression || "");
        setInitialScheduleEnabled((data as any).schedule_enabled || false);
      }
      setLoading(false);
    })();
  }, [id, isNew]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <WorkflowCanvas
        key={id}
        workflowId={id}
        workflowName={workflowName}
        onNameChange={setWorkflowName}
        loadedNodes={initialNodes ?? undefined}
        loadedEdges={initialEdges ?? undefined}
        initialCron={initialCron}
        initialScheduleEnabled={initialScheduleEnabled}
      />
    </div>
  );
}
