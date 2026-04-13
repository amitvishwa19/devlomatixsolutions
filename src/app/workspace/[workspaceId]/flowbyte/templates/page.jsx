'use client'

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
    Search, Plus, Trash2, Loader2, Zap, Bot, MessageSquare,
    Database, GitBranch, Code, Mail, Globe, BookOpen, X,
} from "lucide-react";
import { toast } from "sonner";
import { createFromTemplate } from "../_actions/create-from-template";
import { Badge } from "@/components/ui/badge";

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
        definition: {
            nodes: [
                { id: "t1", type: "workflowNode", position: { x: 100, y: 250 }, data: { label: "When chat message received", type: "chat-trigger", status: "idle" } },
                { id: "a1", type: "workflowNode", position: { x: 400, y: 250 }, data: { label: "AI Agent", type: "ai-agent", status: "idle", config: { builtinLlm: "gpt-4", temperature: 0.7 } } },
            ],
            edges: [{ id: "e1", source: "t1", target: "a1", animated: true }],
        }
    },
    {
        id: "builtin-webhook-process",
        name: "Webhook Processor",
        description: "Receive webhook data, filter it, and send results via HTTP",
        category: "Integration",
        icon: "globe",
        definition: {
            nodes: [
                { id: "t1", type: "workflowNode", position: { x: 100, y: 250 }, data: { label: "Webhook", type: "webhook", status: "idle" } },
                { id: "f1", type: "workflowNode", position: { x: 350, y: 250 }, data: { label: "Filter", type: "filter", status: "idle" } },
                { id: "h1", type: "workflowNode", position: { x: 600, y: 250 }, data: { label: "HTTP Request", type: "http", status: "idle" } },
            ],
            edges: [
                { id: "e1", source: "t1", target: "f1", animated: true },
                { id: "e2", source: "f1", target: "h1", animated: true },
            ],
        }
    },
    {
        id: "builtin-schedule-notify",
        name: "Scheduled Email Alert",
        description: "Run on a schedule, fetch data, and send email notifications",
        category: "Automation",
        icon: "mail",
        definition: {
            nodes: [
                { id: "t1", type: "workflowNode", position: { x: 100, y: 250 }, data: { label: "Schedule", type: "schedule", status: "idle" } },
                { id: "c1", type: "workflowNode", position: { x: 350, y: 250 }, data: { label: "Code", type: "code", status: "idle" } },
                { id: "m1", type: "workflowNode", position: { x: 600, y: 250 }, data: { label: "Send Email", type: "email", status: "idle" } },
            ],
            edges: [
                { id: "e1", source: "t1", target: "c1", animated: true },
                { id: "e2", source: "c1", target: "m1", animated: true },
            ],
        }
    },
];

export default function TemplatesPage() {
    const router = useRouter();
    const { workspaceId } = useParams();
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [loadingTemplate, setLoadingTemplate] = useState(null);

    const categories = ["All", ...Array.from(new Set(BUILT_IN_TEMPLATES.map((t) => t.category)))];

    const filtered = BUILT_IN_TEMPLATES.filter((t) => {
        const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
            t.description.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory === "All" || t.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleUseTemplate = async (template) => {
        setLoadingTemplate(template.id);
        try {
            const workflow = await createFromTemplate({
                workspaceId,
                name: template.name,
                definition: template.definition
            });
            toast.success(`Workflow created: ${template.name}`);
            router.push(`/workspace/${workspaceId}/flowbyte/${workflow.id}`);
        } catch (err) {
            toast.error("Failed to create workflow from template");
        } finally {
            setLoadingTemplate(null);
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Templates Library</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Accelerate your automation with pre-built workflow blueprints
                    </p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search templates (e.g. AI, Webhook)..."
                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-xl bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`text-xs font-semibold px-4 py-2 rounded-lg whitespace-nowrap transition-all ${selectedCategory === cat
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((template) => {
                    const IconComp = iconMap[template.icon] || Zap;
                    const isProcessing = loadingTemplate === template.id;

                    return (
                        <div
                            key={template.id}
                            className="group relative border border-border rounded-2xl p-6 bg-card hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all flex flex-col h-full"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="bg-primary/10 rounded-xl p-3 text-primary group-hover:scale-110 transition-transform">
                                    <IconComp className="h-6 w-6" />
                                </div>
                                <Badge variant="secondary" className="bg-muted text-[10px] uppercase font-bold tracking-wider">
                                    {template.category}
                                </Badge>
                            </div>

                            <div className="space-y-2 mb-6 flex-1">
                                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                                    {template.name}
                                    <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded font-bold">BUILT-IN</span>
                                </h3>
                                <p className="text-xs text-muted-foreground leading-relaxed leading-6 line-clamp-3">
                                    {template.description}
                                </p>
                            </div>

                            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground mb-6 uppercase tracking-widest opacity-60">
                                <GitBranch className="h-3 w-3" />
                                {template.definition.nodes.length} Configured Nodes
                            </div>

                            <Button
                                size="sm"
                                className="w-full h-10 rounded-xl font-bold transition-all active:scale-[0.98]"
                                onClick={() => handleUseTemplate(template)}
                                disabled={!!loadingTemplate}
                            >
                                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Deploy Template"}
                            </Button>
                        </div>
                    );
                })}
                {filtered.length === 0 && (
                    <div className="col-span-full text-center py-20 border-2 border-dashed border-border rounded-3xl opacity-40">
                        <BookOpen className="h-12 w-12 mx-auto mb-4" />
                        <p className="text-sm font-medium">No templates match your search</p>
                    </div>
                )}
            </div>
        </div>
    );
}
