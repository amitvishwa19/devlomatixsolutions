'use client'

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import {
    Webhook, Code, GitBranch, Send, Mail, Database, FileText, Zap,
    MessageSquare, Clock, Check, X, Loader2, Bot, Brain, HardDrive,
    Cpu, Sparkles, Globe, Key, Shield, FileJson, Table, BarChart3,
    Image, Mic, PenTool, Braces, Terminal, Repeat, Filter, Merge,
    Split, Timer, ArrowRightLeft, Layers, Archive, Cloud, Link, Plug,
    Hash, List, CheckSquare, AlertTriangle, BookOpen, Video, Settings,
    Plus
} from "lucide-react";

const iconMap = {
    "trigger-placeholder": Zap,
    webhook: Webhook,
    code: Code,
    if: GitBranch,
    switch: ArrowRightLeft,
    http: Send,
    email: Mail,
    "email-trigger": Mail,
    database: Database,
    set: FileText,
    trigger: Zap,
    slack: MessageSquare,
    schedule: Clock,
    "chat-trigger": MessageSquare,
    // AI
    "ai-agent": Bot,
    "ai-chain": Link,
    "ai-tool": Plug,
    "ai-output-parser": Braces,
    // LLMs
    openai: Sparkles,
    anthropic: Brain,
    "google-ai": Globe,
    ollama: Terminal,
    huggingface: Cpu,
    groq: Zap,
    // Memory
    "buffer-memory": HardDrive,
    "window-memory": Layers,
    "vector-store-memory": Database,
    "summary-memory": FileText,
    // Vector Stores
    pinecone: Database,
    "supabase-vector": Database,
    qdrant: Database,
    chromadb: Database,
    // Embeddings
    "openai-embeddings": Hash,
    "cohere-embeddings": Hash,
    "google-embeddings": Hash,
    // Document Loaders
    "pdf-loader": FileText,
    "csv-loader": Table,
    "web-scraper": Globe,
    "json-loader": FileJson,
    // Text Splitters
    "recursive-splitter": Split,
    "token-splitter": Braces,
    // Core
    merge: Merge,
    loop: Repeat,
    filter: Filter,
    wait: Timer,
    "error-trigger": AlertTriangle,
    // Communication
    discord: MessageSquare,
    telegram: Send,
    twilio: MessageSquare,
    // Data
    postgres: Database,
    mysql: Database,
    redis: HardDrive,
    "google-sheets": Table,
    airtable: Table,
    s3: Cloud,
    // Productivity
    notion: BookOpen,
    "google-calendar": Clock,
    "google-drive": Archive,
    trello: CheckSquare,
    jira: List,
    github: Code,
    // Media
    "image-edit": Image,
    "text-to-speech": Mic,
    "speech-to-text": Mic,
    "generate-image": PenTool,
    // Analytics
    "google-analytics": BarChart3,
    segment: BarChart3,
    // Security
    oauth2: Key,
    jwt: Shield,
    crypto: Shield,
};

const colorMap = {
    "trigger-placeholder": "bg-primary/50",
    webhook: "bg-purple-500",
    code: "bg-emerald-500",
    if: "bg-amber-500",
    switch: "bg-amber-600",
    http: "bg-blue-500",
    email: "bg-red-400",
    "email-trigger": "bg-red-400",
    database: "bg-cyan-500",
    set: "bg-gray-500",
    trigger: "bg-primary",
    slack: "bg-purple-600",
    schedule: "bg-orange-400",
    "chat-trigger": "bg-indigo-500",
    // AI - distinctive purple/violet
    "ai-agent": "bg-violet-600",
    "ai-chain": "bg-violet-500",
    "ai-tool": "bg-violet-400",
    "ai-output-parser": "bg-violet-500",
    // LLMs - green tones
    openai: "bg-emerald-600",
    anthropic: "bg-amber-600",
    "google-ai": "bg-blue-600",
    ollama: "bg-gray-600",
    huggingface: "bg-yellow-500",
    groq: "bg-orange-500",
    // Memory - teal
    "buffer-memory": "bg-teal-500",
    "window-memory": "bg-teal-600",
    "vector-store-memory": "bg-teal-400",
    "summary-memory": "bg-teal-500",
    // Vector/Embeddings
    pinecone: "bg-cyan-600",
    "supabase-vector": "bg-cyan-500",
    qdrant: "bg-cyan-600",
    chromadb: "bg-cyan-400",
    "openai-embeddings": "bg-emerald-500",
    "cohere-embeddings": "bg-emerald-400",
    "google-embeddings": "bg-blue-500",
    // Document loaders
    "pdf-loader": "bg-red-500",
    "csv-loader": "bg-green-500",
    "web-scraper": "bg-blue-400",
    "json-loader": "bg-yellow-600",
    // Splitters
    "recursive-splitter": "bg-indigo-400",
    "token-splitter": "bg-indigo-500",
    // Core
    merge: "bg-gray-500",
    loop: "bg-blue-400",
    filter: "bg-amber-400",
    wait: "bg-gray-400",
    "error-trigger": "bg-red-500",
    // Communication
    discord: "bg-indigo-600",
    telegram: "bg-sky-500",
    twilio: "bg-red-500",
    // Data
    postgres: "bg-blue-700",
    mysql: "bg-blue-600",
    redis: "bg-red-600",
    "google-sheets": "bg-green-600",
    airtable: "bg-blue-400",
    s3: "bg-orange-500",
    // Productivity
    notion: "bg-gray-700",
    "google-calendar": "bg-blue-500",
    "google-drive": "bg-yellow-500",
    trello: "bg-blue-500",
    jira: "bg-blue-600",
    github: "bg-gray-800",
    // Media
    "image-edit": "bg-pink-500",
    "text-to-speech": "bg-indigo-500",
    "speech-to-text": "bg-indigo-400",
    "generate-image": "bg-pink-600",
    // Analytics
    "google-analytics": "bg-yellow-600",
    segment: "bg-green-500",
    // Security
    oauth2: "bg-gray-600",
    jwt: "bg-gray-700",
    crypto: "bg-gray-600",
};

// Types that are AI sub-components (can be attached to agent)
const AI_SUB_TYPES = new Set([
    "openai", "anthropic", "google-ai", "ollama", "huggingface", "groq",
    "buffer-memory", "window-memory", "vector-store-memory", "summary-memory",
    "ai-tool", "ai-output-parser",
]);

// Agent attachment slot definitions
const AGENT_SLOTS = [
    { id: "llm", label: "Chat Model", required: true },
    { id: "memory", label: "Memory", required: false },
    { id: "tool", label: "Tool", required: false },
];

const StatusIndicator = ({ status }) => {
    if (status === "success") {
        return (
            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 border-2 border-card flex items-center justify-center shadow-sm">
                <Check className="h-3 w-3 text-white" strokeWidth={3} />
            </div>
        );
    }
    if (status === "error") {
        return (
            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive border-2 border-card flex items-center justify-center shadow-sm">
                <X className="h-3 w-3 text-white" strokeWidth={3} />
            </div>
        );
    }
    if (status === "running") {
        return (
            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary border-2 border-card flex items-center justify-center shadow-sm">
                <Loader2 className="h-3 w-3 text-white animate-spin" strokeWidth={3} />
            </div>
        );
    }
    if (status === "waiting") {
        return (
            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-500 border-2 border-card flex items-center justify-center shadow-sm animate-pulse">
                <Clock className="h-3 w-3 text-white" strokeWidth={3} />
            </div>
        );
    }
    return null;
};

const WorkflowNode = ({ data, selected }) => {
    const nodeData = data;
    const Icon = iconMap[nodeData.type] || Zap;
    const colorClass = colorMap[nodeData.type] || "bg-primary";
    const isAgent = nodeData.type === "ai-agent";
    const agentConfig = nodeData.config;
    const hasBuiltinLlm = isAgent; // Always has built-in LLM
    const hasBuiltinMemory = isAgent && agentConfig?.builtinMemory && agentConfig.builtinMemory !== "none";
    const isSubComponent = AI_SUB_TYPES.has(nodeData.type);

    const status = nodeData.status
        ? nodeData.status
        : nodeData.error
            ? "error"
            : nodeData.executed
                ? "success"
                : "idle";

    const borderClass =
        status === "error"
            ? "border-destructive"
            : status === "running"
                ? "border-primary animate-pulse"
                : status === "waiting"
                    ? "border-amber-500 animate-pulse"
                    : "border-n8n-node-border";

    const isTrigger = ["trigger", "webhook", "schedule", "email-trigger", "chat-trigger", "trigger-placeholder"].includes(nodeData.type);
    const isPlaceholder = nodeData.type === "trigger-placeholder";
    const isChatTrigger = nodeData.type === "chat-trigger";

    if (isPlaceholder) {
        return (
            <div className="flex flex-col items-center gap-2 cursor-pointer group">
                <div className="w-[72px] h-[72px] rounded-lg border-2 border-dashed border-muted-foreground/40 group-hover:border-primary bg-card flex items-center justify-center transition-colors">
                    <Plus className="h-7 w-7 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                </div>
                <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">Add first step...</span>
                <Handle
                    type="source"
                    position={Position.Right}
                    className="!w-0 !h-0 !opacity-0"
                />
            </div>
        );
    }

    // Large square chat trigger node (n8n style)
    if (isChatTrigger) {
        return (
            <div className="flex flex-col items-center gap-1.5 cursor-pointer group">
                <div className="relative">
                    <div
                        className={`w-20 h-20 rounded-lg border bg-card flex items-center justify-center transition-all
              ${selected ? "border-2 ring-primary shadow-lg border-primary" : `${borderClass} hover:shadow-lg border-2`}
            `}
                    >
                        <MessageSquare className="h-7 w-7 text-foreground" />
                    </div>
                    {/* Status indicator */}
                    {status === "success" && (
                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-emerald-500 border-2 border-card flex items-center justify-center shadow-sm">
                            <Check className="h-3 w-3 text-white" strokeWidth={3} />
                        </div>
                    )}
                    {status === "error" && (
                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-destructive border-2 border-card flex items-center justify-center shadow-sm">
                            <X className="h-3 w-3 text-white" strokeWidth={3} />
                        </div>
                    )}
                    {status === "running" && (
                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-primary border-2 border-card flex items-center justify-center shadow-sm">
                            <Loader2 className="h-3 w-3 text-white animate-spin" strokeWidth={3} />
                        </div>
                    )}
                    {status === "running" && (
                        <div className="absolute -top-1 -left-2">
                            <Zap className="h-4 w-4 text-amber-400 fill-amber-400 animate-pulse" />
                        </div>
                    )}
                    {/* Output handle - inside relative container */}
                    <Handle
                        type="source"
                        position={Position.Right}
                        className="w-3! h-3! bg-muted-foreground/40 border-2 border-card hover:bg-primary transition-colors"
                    />
                </div>
                <span className="text-xs text-center text-foreground font-medium max-w-[120px] leading-tight mt-1">
                    {nodeData.label}
                </span>
            </div>
        );
    }

    // AI Agent - special n8n-style card with sub-slots below
    if (isAgent) {
        return (
            <div className="flex flex-col items-center cursor-pointer group">

                <div
                    className={`relative rounded-lg border bg-card transition-all min-w-[200px]
            ${selected ? "border-primary border-2" : `${borderClass} hover:shadow-elevated  border-2`}
          `}
                    style={{ boxShadow: 'var(--shadow-node)' }}
                >
                    <Handle
                        type="target"
                        position={Position.Left}
                        className="w-3! h-3! bg-muted-foreground/40 border-2 border-card hover:bg-primary transition-colors"
                    />
                    <div className="flex items-center gap-3 px-4 py-2.5">
                        <div className="bg-card border border-border/50 rounded-lg p-1.5 flex items-center justify-center">
                            <Bot className="h-5 w-5 text-foreground" />
                        </div>
                        <span className="text-sm font-semibold text-card-foreground">
                            {nodeData.label}
                        </span>
                    </div>
                    <StatusIndicator status={status} />
                    <Handle
                        type="source"
                        position={Position.Right}
                        className="!w-3 !h-3 !bg-muted-foreground/40 !border-2 !border-card hover:!bg-primary transition-colors"
                    />
                </div>

                <div className="flex items-start gap-6 mt-0">
                    {AGENT_SLOTS.map((slot) => {
                        const attached = nodeData.attachedSlots?.[slot.id];
                        const isBuiltinActive =
                            (slot.id === "llm" && hasBuiltinLlm) ||
                            (slot.id === "memory" && hasBuiltinMemory);
                        const builtinLabel =
                            slot.id === "llm" && hasBuiltinLlm
                                ? (agentConfig?.builtinLlm) || "gpt-4"
                                : slot.id === "memory" && hasBuiltinMemory
                                    ? (agentConfig?.builtinMemory)
                                    : undefined;

                        return (
                            <div key={slot.id} className="flex flex-col items-center relative">
                                <div className="w-px h-4 bg-muted-foreground/30" />
                                {/* Diamond connector */}
                                <div className="relative w-5 h-5 flex items-center justify-center">
                                    <div className={`w-2.5 h-2.5 rotate-45 border ${isBuiltinActive ? "border-emerald-500 bg-emerald-500/20" : "border-muted-foreground/40 bg-card"}`} />
                                    <Handle
                                        type="target"
                                        position={Position.Bottom}
                                        id={`slot-${slot.id}`}
                                        className="!w-5 !h-5 !bg-transparent !border-0 !rounded-none !transform-none"
                                        style={{ position: "absolute", top: 0, left: 0 }}
                                    />
                                </div>
                                <span className="text-[11px] text-muted-foreground mt-1.5 whitespace-nowrap">
                                    {slot.label}
                                    {!isBuiltinActive && slot.required && !attached && (
                                        <span className="text-destructive">*</span>
                                    )}
                                </span>
                                {isBuiltinActive && builtinLabel && (
                                    <span className="text-[9px] text-emerald-500 font-medium truncate max-w-[80px]">
                                        {builtinLabel}
                                    </span>
                                )}
                                <div className="w-px h-3 bg-muted-foreground/30" />
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        nodeData.onSlotAdd?.(slot.id);
                                    }}
                                    className="w-6 h-6 rounded-md border border-muted-foreground/30 bg-card flex items-center justify-center hover:border-primary hover:text-primary transition-colors text-muted-foreground"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    const executionClass = status === "running" ? "node-executing" : status === "success" ? "node-success-flash" : "";

    return (
        <div
            className={`workflow-node rounded-lg border bg-card transition-all cursor-pointer min-w-[160px] ${executionClass}
        ${selected ? "ring-[1px] ring-primary shadow-elevated border-primary" : `${borderClass} hover:shadow-elevated`}
      `}
            style={{ boxShadow: 'var(--shadow-node)' }}
        >
            {!isTrigger && (
                <Handle
                    type="target"
                    position={Position.Left}
                    className="!w-3 !h-3 !bg-muted-foreground/40 !border-2 !border-card hover:!bg-primary transition-colors"
                />
            )}

            {isSubComponent && (
                <Handle
                    type="source"
                    position={Position.Top}
                    id="to-agent"
                    className="!w-3 !h-3 !bg-violet-400 !border-2 !border-card hover:!bg-violet-500 transition-colors"
                />
            )}

            <div className="flex items-center gap-3 px-3 py-2.5">
                <div className={`bg-card border border-border/50 rounded-md p-1.5 flex items-center justify-center`}>
                    <Icon className="h-4 w-4 text-foreground" />
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-card-foreground truncate">
                        {nodeData.label}
                    </span>
                    {nodeData.subtitle && (
                        <span className="text-xs text-muted-foreground truncate">
                            {nodeData.subtitle}
                        </span>
                    )}
                </div>
            </div>

            <StatusIndicator status={status} />

            <Handle
                type="source"
                position={Position.Right}
                className="!w-3 !h-3 !bg-muted-foreground/40 !border-2 !border-card hover:!bg-primary transition-colors"
            />
        </div>
    );
};

export default memo(WorkflowNode);
