import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, Clock, Trash2, Loader2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import TemplateGallery from "@/flowbite/components/TemplateGallery";
import type { Node, Edge } from "@xyflow/react";

const statusColors: Record<string, string> = {
  active: "bg-n8n-success/15 text-n8n-success",
  error: "bg-destructive/15 text-destructive",
  inactive: "bg-muted text-muted-foreground",
  draft: "bg-n8n-warning/15 text-n8n-warning",
};

export default function Index() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);

  const { data: workflows = [], isLoading } = useQuery({
    queryKey: ["workflows"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workflows")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("workflows").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      toast.success("Workflow deleted");
    },
    onError: (err: any) => toast.error("Delete failed: " + err.message),
  });

  const filtered = workflows.filter((wf) =>
    wf.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Workflows</h1>
          <p className="text-sm text-muted-foreground mt-1">{workflows.length} workflows</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setShowTemplates(true)}>
            <BookOpen className="h-4 w-4" />
            Templates
          </Button>
          <Link to="/workflow/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Workflow
            </Button>
          </Link>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search workflows..."
          className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">{search ? "No workflows match your search" : "No workflows yet. Create your first one!"}</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((wf) => {
            const nodeCount = Array.isArray(wf.nodes) ? (wf.nodes as any[]).length : 0;
            return (
              <div key={wf.id} className="flex items-center justify-between p-4 bg-card rounded-lg border border-border hover:border-primary/30 hover:shadow-sm transition-all group">
                <Link to={`/workflow/${wf.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${wf.status === "active" ? "bg-n8n-success" : wf.status === "error" ? "bg-destructive" : "bg-muted-foreground/40"}`} />
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">{wf.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[wf.status] || statusColors.draft}`}>
                        {wf.status}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(wf.updated_at).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-muted-foreground">{nodeCount} nodes</span>
                    </div>
                  </div>
                </Link>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      deleteMutation.mutate(wf.id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showTemplates && (
        <TemplateGallery
          onClose={() => setShowTemplates(false)}
          onLoadTemplate={(name, templateNodes, templateEdges) => {
            // Create a new workflow from template
            (async () => {
              const { data: { user } } = await supabase.auth.getUser();
              const { data, error } = await supabase.from("workflows").insert({
                name,
                nodes: JSON.parse(JSON.stringify(templateNodes)),
                edges: JSON.parse(JSON.stringify(templateEdges)),
                status: "draft",
                user_id: user?.id,
              }).select("id").single();
              if (error) {
                toast.error("Failed to create from template");
                return;
              }
              toast.success(`Created workflow from template: ${name}`);
              navigate(`/workflow/${data.id}`);
            })();
          }}
        />
      )}
    </div>
  );
}
