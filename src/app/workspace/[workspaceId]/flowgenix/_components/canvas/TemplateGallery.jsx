'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Zap, Bot, MessageSquare, Database, GitBranch, Code, Mail, Globe, BookOpen } from "lucide-react";
import { toast } from "sonner";

const iconMap = {
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
];

export default function TemplateGallery({ onClose, onLoadTemplate }) {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "AI", "Integration"];
  const filtered = selectedCategory === "All" ? BUILT_IN_TEMPLATES : BUILT_IN_TEMPLATES.filter((t) => t.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Template Gallery</h2>
            <p className="text-sm text-muted-foreground">Start from a template or create your own</p>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 px-6 py-3 border-b border-border overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Templates grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 gap-4">
          {filtered.map((template) => {
            const IconComp = iconMap[template.icon] || Zap;
            return (
              <div
                key={template.id}
                className="border border-border rounded-lg p-4 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => {
                  onLoadTemplate(
                    template.name,
                    template.nodes,
                    template.edges
                  );
                  onClose();
                  toast.success(`Loaded template: ${template.name}`);
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 rounded-lg p-2 flex-shrink-0">
                    <IconComp className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                        {template.name}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{template.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{template.category}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {template.nodes.length} nodes
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
