import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppLayout } from "@/flowgenix/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Trash2 } from "lucide-react";
import {
  createWorkflow,
  deleteWorkflow,
  listWorkflows,
  type WorkflowRow,
} from "@/flowgenix/lib/workflow-storage";
import { toast } from "sonner";

const Workflows = () => {
  const [items, setItems] = useState<WorkflowRow[]>([]);
  const [templates, setTemplates] = useState<WorkflowRow[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const refresh = async () => {
    const [wf, tpl] = await Promise.all([
      listWorkflows({ templates: false }),
      listWorkflows({ templates: true }),
    ]);
    setItems(wf);
    setTemplates(tpl);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const create = async () => {
    try {
      const wf = await createWorkflow("Untitled Workflow");
      navigate(`/canvas/${wf.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create");
    }
  };

  const remove = async (id: string) => {
    await deleteWorkflow(id);
    toast.success("Deleted");
    refresh();
  };

  return (
    <AppLayout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-mono text-sm">workflows</h1>
        <Button size="sm" onClick={create} className="gap-1.5 font-mono text-xs">
          <Plus className="h-3.5 w-3.5" /> New workflow
        </Button>
      </div>

      <div className="space-y-10">
        <section>
          <h2 className="mb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Your workflows
          </h2>
          {loading ? (
            <p className="font-mono text-xs text-muted-foreground">// loading…</p>
          ) : items.length === 0 ? (
            <div className="rounded-md border border-dashed border-border p-8 text-center">
              <p className="font-mono text-xs text-muted-foreground">
                // no workflows yet — click "New workflow" to create one
              </p>
            </div>
          ) : (
            <div className="grid gap-2">
              {items.map((wf) => (
                <div
                  key={wf.id}
                  className="group flex items-center justify-between rounded-md border border-border bg-card px-4 py-3 transition-colors hover:border-primary/50"
                >
                  <Link to={`/canvas/${wf.id}`} className="flex flex-1 items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-xs">{wf.name}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">
                        {wf.status} · updated {new Date(wf.updated_at).toLocaleString()}
                      </p>
                    </div>
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => remove(wf.id)}
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>

        {templates.length > 0 && (
          <section>
            <h2 className="mb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Templates
            </h2>
            <div className="grid gap-2">
              {templates.map((wf) => (
                <div
                  key={wf.id}
                  className="flex items-center justify-between rounded-md border border-border bg-card px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary text-foreground">
                      <FileText className="h-4 w-4" />
                    </div>
                    <p className="font-mono text-xs">{wf.name}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      const wfNew = await createWorkflow(wf.name + " (copy)");
                      // copy template content
                      const { saveWorkflow } = await import("@/flowgenix/lib/workflow-storage");
                      await saveWorkflow(wfNew.id, { nodes: wf.nodes, edges: wf.edges });
                      navigate(`/canvas/${wfNew.id}`);
                    }}
                    className="font-mono text-xs"
                  >
                    Use
                  </Button>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </AppLayout>
  );
};

export default Workflows;
