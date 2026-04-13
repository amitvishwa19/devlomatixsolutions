import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Search, Plus, Trash2, Loader2, Zap, Bot, MessageSquare,
  Database, GitBranch, Code, Mail, Globe, BookOpen, X,
} from "lucide-react";
import { toast } from "sonner";
import type { Node, Edge } from "@xyflow/react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  zap: Zap, bot: Bot, message: MessageSquare, database: Database,
  branch: GitBranch, code: Code, mail: Mail, globe: Globe, book: BookOpen,
};

const BUILT_IN_TEMPLATES = [
  {
    id: "builtin-chat-agent",
    name: "Chat AI Agent",
    description: "A chat trigger connected to an AI agent with built-in LLM and memory",
    category: "AI",
    icon: "bot",
    nodes: [
      { id: "t1", type: "workflowNode", position: { x: 100, y: 250 }, data: { label: "When chat message received", type: "chat-trigger", subtitle: "", status: "idle" } },
      { id: "a1", type: "workflowNode", position: { x: 400, y: 250 }, data: { label: "AI Agent", type: "ai-agent", subtitle: "", status: "idle", config: { builtinLlm: "gpt-4", builtinMemory: "buffer", temperature: 0.7, maxIterations: 5 } } },
    ],
    edges: [{ id: "e1", source: "t1", target: "a1", type: "smoothstep", animated: true }],
  },
  {
    id: "builtin-webhook-process",
    name: "Webhook Processor",
    description: "Receive webhook data, filter it, and send results via HTTP",
    category: "Integration",
    icon: "globe",
    nodes: [
      { id: "t1", type: "workflowNode", position: { x: 100, y: 250 }, data: { label: "Webhook", type: "webhook", subtitle: "", status: "idle" } },
      { id: "f1", type: "workflowNode", position: { x: 350, y: 250 }, data: { label: "Filter", type: "filter", subtitle: "", status: "idle" } },
      { id: "h1", type: "workflowNode", position: { x: 600, y: 250 }, data: { label: "HTTP Request", type: "http", subtitle: "", status: "idle" } },
    ],
    edges: [
      { id: "e1", source: "t1", target: "f1", type: "smoothstep", animated: true },
      { id: "e2", source: "f1", target: "h1", type: "smoothstep", animated: true },
    ],
  },
  {
    id: "builtin-schedule-notify",
    name: "Scheduled Email Alert",
    description: "Run on a schedule, fetch data, and send email notifications",
    category: "Automation",
    icon: "mail",
    nodes: [
      { id: "t1", type: "workflowNode", position: { x: 100, y: 250 }, data: { label: "Schedule", type: "schedule", subtitle: "", status: "idle" } },
      { id: "c1", type: "workflowNode", position: { x: 350, y: 250 }, data: { label: "Code", type: "code", subtitle: "", status: "idle" } },
      { id: "m1", type: "workflowNode", position: { x: 600, y: 250 }, data: { label: "Send Email", type: "email", subtitle: "", status: "idle" } },
    ],
    edges: [
      { id: "e1", source: "t1", target: "c1", type: "smoothstep", animated: true },
      { id: "e2", source: "c1", target: "m1", type: "smoothstep", animated: true },
    ],
  },
  {
    id: "builtin-switch-router",
    name: "Data Router",
    description: "Use a Switch node to route data to different processing paths",
    category: "Core",
    icon: "branch",
    nodes: [
      { id: "t1", type: "workflowNode", position: { x: 100, y: 250 }, data: { label: "Webhook", type: "webhook", subtitle: "", status: "idle" } },
      { id: "s1", type: "workflowNode", position: { x: 350, y: 250 }, data: { label: "Switch", type: "switch", subtitle: "", status: "idle" } },
      { id: "p1", type: "workflowNode", position: { x: 600, y: 150 }, data: { label: "Process Order", type: "code", subtitle: "", status: "idle" } },
      { id: "p2", type: "workflowNode", position: { x: 600, y: 350 }, data: { label: "Process Refund", type: "code", subtitle: "", status: "idle" } },
    ],
    edges: [
      { id: "e1", source: "t1", target: "s1", type: "smoothstep", animated: true },
      { id: "e2", source: "s1", target: "p1", type: "smoothstep", animated: true },
      { id: "e3", source: "s1", target: "p2", type: "smoothstep", animated: true },
    ],
  },
];

export default function Templates() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: "", description: "", category: "General", icon: "zap" });

  const { data: savedTemplates = [], isLoading } = useQuery({
    queryKey: ["workflow_templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workflow_templates")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const allTemplates = [
    ...BUILT_IN_TEMPLATES.map((t) => ({ ...t, isBuiltin: true })),
    ...savedTemplates.map((t: any) => ({ ...t, isBuiltin: false })),
  ];

  const categories = ["All", ...Array.from(new Set(allTemplates.map((t) => t.category)))];

  const filtered = allTemplates.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("workflow_templates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflow_templates"] });
      toast.success("Template deleted");
    },
  });

  const createFromTemplate = async (template: typeof allTemplates[0]) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from("workflows").insert({
      name: template.name,
      nodes: JSON.parse(JSON.stringify(template.nodes)),
      edges: JSON.parse(JSON.stringify(template.edges)),
      status: "draft",
      user_id: user?.id,
    }).select("id").single();
    if (error) {
      toast.error("Failed to create workflow from template");
      return;
    }
    toast.success(`Created workflow: ${template.name}`);
    navigate(`/workflow/${data.id}`);
  };

  const createTemplateMutation = useMutation({
    mutationFn: async (tmpl: typeof newTemplate) => {
      const { error } = await supabase.from("workflow_templates").insert({
        name: tmpl.name,
        description: tmpl.description,
        category: tmpl.category,
        icon: tmpl.icon,
        nodes: [],
        edges: [],
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflow_templates"] });
      toast.success("Template created");
      setShowCreateDialog(false);
      setNewTemplate({ name: "", description: "", category: "General", icon: "zap" });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const iconOptions = Object.keys(iconMap);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Templates</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {allTemplates.length} templates available
          </p>
        </div>
        <Button className="gap-2" onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4" />
          Create Template
        </Button>
      </div>

      {/* Search + Categories */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No templates found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((template) => {
            const IconComp = iconMap[template.icon] || Zap;
            return (
              <div
                key={template.id}
                className="border border-border rounded-xl p-5 bg-card hover:border-primary/40 hover:shadow-md transition-all group flex flex-col"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="bg-primary/10 rounded-lg p-2.5 flex-shrink-0">
                    <IconComp className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground truncate">{template.name}</h3>
                      {template.isBuiltin && (
                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">Built-in</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{template.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{template.category}</span>
                  <span className="text-[10px] text-muted-foreground">{(template.nodes as any[]).length} nodes</span>
                </div>

                <div className="mt-auto flex items-center gap-2">
                  <Button
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => createFromTemplate(template)}
                  >
                    Use Template
                  </Button>
                  {!template.isBuiltin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      onClick={() => deleteMutation.mutate(template.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Template Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Create Template</h2>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setShowCreateDialog(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  placeholder="My Template"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                  placeholder="What does this template do?"
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Category</Label>
                  <select
                    value={newTemplate.category}
                    onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {["General", "AI", "Integration", "Automation", "Core"].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Icon</Label>
                  <div className="flex gap-1.5 mt-1 flex-wrap">
                    {iconOptions.map((key) => {
                      const Ic = iconMap[key];
                      return (
                        <button
                          key={key}
                          onClick={() => setNewTemplate({ ...newTemplate, icon: key })}
                          className={`p-1.5 rounded-md border transition-colors ${
                            newTemplate.icon === key ? "border-primary bg-primary/10" : "border-border hover:border-primary/30"
                          }`}
                        >
                          <Ic className="h-4 w-4 text-foreground" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <Button
                className="w-full"
                disabled={!newTemplate.name.trim()}
                onClick={() => createTemplateMutation.mutate(newTemplate)}
              >
                Create Template
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
