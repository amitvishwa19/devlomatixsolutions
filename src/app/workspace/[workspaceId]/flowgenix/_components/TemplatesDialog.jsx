import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, Loader2 } from "lucide-react";
import { createWorkflow, listWorkflows, saveWorkflow } from "../_lib/workflow-storage";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";

export const TemplatesDialog = () => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewing, setPreviewing] = useState(null);
  const router = useRouter();
  const params = useParams();
  const workspaceId = params?.workspaceId;

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    listWorkflows({ templates: true })
      .then(setItems)
      .catch((e) => toast.error(e instanceof Error ? e.message : "Failed"))
      .finally(() => setLoading(false));
  }, [open]);

  const useTemplate = async (tpl) => {
    try {
      const wf = await createWorkflow(`${tpl.name} (copy)`);
      await saveWorkflow(wf.id, { nodes: tpl.nodes, edges: tpl.edges });
      setOpen(false);
      router.push(`/workspace/${workspaceId}/flowgenix/canvas/${wf.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to clone");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="gap-1.5 font-mono text-xs">
          <BookOpen className="h-3.5 w-3.5" /> Templates
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-mono text-sm">Workflow templates</DialogTitle>
          <DialogDescription className="font-mono text-xs">
            Browse and clone workflows saved as templates.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <p className="py-12 text-center font-mono text-xs text-muted-foreground">
            // no templates yet — use "Save as Template" on a workflow
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {items.map((tpl) => (
              <div
                key={tpl.id}
                className={`rounded-md border bg-card p-3 transition-colors ${
                  previewing?.id === tpl.id ? "border-primary" : "border-border hover:border-primary/40"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-xs">{tpl.name}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                      {(tpl.nodes ?? []).length} nodes · {(tpl.edges ?? []).length} edges
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setPreviewing(previewing?.id === tpl.id ? null : tpl)}
                    className="font-mono text-xs"
                  >
                    {previewing?.id === tpl.id ? "Hide" : "Preview"}
                  </Button>
                  <Button size="sm" onClick={() => useTemplate(tpl)} className="font-mono text-xs">
                    Use
                  </Button>
                </div>
                {previewing?.id === tpl.id && (
                  <div className="mt-3 max-h-40 overflow-auto rounded border border-border bg-secondary/30 p-2">
                    <ul className="space-y-1">
                      {(tpl.nodes ?? []).map((n) => {
                        const d = n.data;
                        return (
                          <li key={n.id} className="font-mono text-[10px]">
                            <span className="text-muted-foreground">{d.kind ?? n.type}</span> · {d.label}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
