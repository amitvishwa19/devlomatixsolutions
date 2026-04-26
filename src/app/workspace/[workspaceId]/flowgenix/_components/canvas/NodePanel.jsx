'use client'

import { useState } from "react";
import {
    Search, X, Zap, Code, GitBranch, Send, Mail, Database, FileText, Webhook,
    MessageSquare, Clock, Bot, Brain, HardDrive, Cpu, Sparkles, BookOpen,
    Repeat, Filter, Merge, Split, Timer, Globe, Key, Shield, FileJson,
    Table, BarChart3, Image, Mic, Video, PenTool, Braces, Terminal,
    Workflow, RefreshCw, ArrowRightLeft, Layers, Archive, Cloud,
    Link, Plug, Settings, Hash, List, CheckSquare, AlertTriangle
} from "lucide-react";

const nodeCategories = [
    {
        name: "Triggers",
        nodes: [
            { type: "webhook", label: "Webhook", icon: Webhook, description: "Start workflow on HTTP request" },
            { type: "schedule", label: "Schedule Trigger", icon: Clock, description: "Run on a schedule" },
            { type: "trigger", label: "Manual Trigger", icon: Zap, description: "Start manually" },
            { type: "email-trigger", label: "Email Trigger", icon: Mail, description: "Trigger on incoming email" },
            { type: "chat-trigger", label: "When chat message received", icon: MessageSquare, description: "Start from chat message" },
        ],
    },
    {
        name: "AI / Agents",
        nodes: [
            { type: "ai-agent", label: "AI Agent", icon: Bot, description: "Autonomous AI agent with tools" },
            { type: "ai-chain", label: "Chain", icon: Link, description: "Sequential LLM chain" },
            { type: "ai-tool", label: "Tool", icon: Plug, description: "Custom tool for AI agents" },
            { type: "ai-output-parser", label: "Output Parser", icon: Braces, description: "Parse structured AI output" },
        ],
    },
    {
        name: "LLM Models",
        nodes: [
            { type: "openai", label: "OpenAI GPT", icon: Sparkles, description: "GPT-4o, GPT-5 models" },
            { type: "anthropic", label: "Anthropic Claude", icon: Brain, description: "Claude 3.5 / Claude 4" },
            { type: "google-ai", label: "Google Gemini", icon: Globe, description: "Gemini Pro & Flash models" },
            { type: "ollama", label: "Ollama", icon: Terminal, description: "Local open-source models" },
            { type: "huggingface", label: "Hugging Face", icon: Cpu, description: "Inference API models" },
            { type: "groq", label: "Groq", icon: Zap, description: "Ultra-fast LLM inference" },
        ],
    },
    {
        name: "Memory",
        nodes: [
            { type: "buffer-memory", label: "Buffer Memory", icon: HardDrive, description: "Store recent conversation" },
            { type: "window-memory", label: "Window Memory", icon: Layers, description: "Sliding window of messages" },
            { type: "vector-store-memory", label: "Vector Store Memory", icon: Database, description: "Semantic memory retrieval" },
            { type: "summary-memory", label: "Summary Memory", icon: FileText, description: "Summarized conversation history" },
        ],
    },
    {
        name: "Vector Stores",
        nodes: [
            { type: "pinecone", label: "Pinecone", icon: Database, description: "Pinecone vector database" },
            { type: "qdrant", label: "Qdrant", icon: Database, description: "Qdrant vector search" },
            { type: "chromadb", label: "ChromaDB", icon: Database, description: "Open-source embeddings DB" },
        ],
    },
    {
        name: "Embeddings",
        nodes: [
            { type: "openai-embeddings", label: "OpenAI Embeddings", icon: Hash, description: "text-embedding-3 models" },
            { type: "cohere-embeddings", label: "Cohere Embeddings", icon: Hash, description: "Cohere embed models" },
            { type: "google-embeddings", label: "Google Embeddings", icon: Hash, description: "Gecko embedding model" },
        ],
    },
    {
        name: "Document Loaders",
        nodes: [
            { type: "pdf-loader", label: "PDF Loader", icon: FileText, description: "Extract text from PDFs" },
            { type: "csv-loader", label: "CSV Loader", icon: Table, description: "Load CSV file data" },
            { type: "web-scraper", label: "Web Scraper", icon: Globe, description: "Scrape webpage content" },
            { type: "json-loader", label: "JSON Loader", icon: FileJson, description: "Parse JSON documents" },
        ],
    },
    {
        name: "Text Splitters",
        nodes: [
            { type: "recursive-splitter", label: "Recursive Splitter", icon: Split, description: "Split text recursively" },
            { type: "token-splitter", label: "Token Splitter", icon: Braces, description: "Split by token count" },
        ],
    },
    {
        name: "Core",
        nodes: [
            { type: "if", label: "IF", icon: GitBranch, description: "Route based on conditions" },
            { type: "switch", label: "Switch", icon: ArrowRightLeft, description: "Multi-path routing" },
            { type: "set", label: "Set", icon: FileText, description: "Set or transform data" },
            { type: "code", label: "Code", icon: Code, description: "Run custom JavaScript" },
            { type: "http", label: "HTTP Request", icon: Send, description: "Make HTTP requests" },
            { type: "merge", label: "Merge", icon: Merge, description: "Merge multiple inputs" },
            { type: "loop", label: "Loop Over Items", icon: Repeat, description: "Iterate over items" },
            { type: "filter", label: "Filter", icon: Filter, description: "Filter items by condition" },
            { type: "wait", label: "Wait", icon: Timer, description: "Pause execution" },
            { type: "error-trigger", label: "Error Trigger", icon: AlertTriangle, description: "Handle workflow errors" },
        ],
    },
    {
        name: "Communication",
        nodes: [
            { type: "email", label: "Send Email", icon: Mail, description: "Send email messages" },
            { type: "slack", label: "Slack", icon: MessageSquare, description: "Send Slack messages" },
            { type: "discord", label: "Discord", icon: MessageSquare, description: "Discord bot messages" },
            { type: "telegram", label: "Telegram", icon: Send, description: "Telegram bot API" },
            { type: "twilio", label: "Twilio SMS", icon: MessageSquare, description: "Send SMS messages" },
        ],
    },
    {
        name: "Data & Storage",
        nodes: [
            { type: "database", label: "Database", icon: Database, description: "Query a database" },
            { type: "postgres", label: "PostgreSQL", icon: Database, description: "PostgreSQL queries" },
            { type: "mysql", label: "MySQL", icon: Database, description: "MySQL queries" },
            { type: "redis", label: "Redis", icon: HardDrive, description: "Redis key-value store" },
            { type: "google-sheets", label: "Google Sheets", icon: Table, description: "Read/write spreadsheets" },
            { type: "airtable", label: "Airtable", icon: Table, description: "Airtable records" },
            { type: "s3", label: "AWS S3", icon: Cloud, description: "S3 file storage" },
        ],
    },
    {
        name: "Productivity",
        nodes: [
            { type: "notion", label: "Notion", icon: BookOpen, description: "Notion pages & databases" },
            { type: "google-calendar", label: "Google Calendar", icon: Clock, description: "Calendar events" },
            { type: "google-drive", label: "Google Drive", icon: Archive, description: "Drive file management" },
            { type: "trello", label: "Trello", icon: CheckSquare, description: "Trello cards & boards" },
            { type: "jira", label: "Jira", icon: List, description: "Jira issues & projects" },
            { type: "github", label: "GitHub", icon: Code, description: "GitHub repos & issues" },
        ],
    },
    {
        name: "Media",
        nodes: [
            { type: "image-edit", label: "Edit Image", icon: Image, description: "Resize, crop, convert images" },
            { type: "text-to-speech", label: "Text to Speech", icon: Mic, description: "Convert text to audio" },
            { type: "speech-to-text", label: "Speech to Text", icon: Mic, description: "Transcribe audio to text" },
            { type: "generate-image", label: "Generate Image", icon: PenTool, description: "AI image generation" },
        ],
    },
    {
        name: "Analytics",
        nodes: [
            { type: "google-analytics", label: "Google Analytics", icon: BarChart3, description: "GA4 data & events" },
            { type: "segment", label: "Segment", icon: BarChart3, description: "Track analytics events" },
        ],
    },
    {
        name: "Security & Auth",
        nodes: [
            { type: "oauth2", label: "OAuth2", icon: Key, description: "OAuth2 authentication" },
            { type: "jwt", label: "JWT", icon: Shield, description: "Create/verify JWT tokens" },
            { type: "crypto", label: "Crypto", icon: Shield, description: "Encrypt/decrypt data" },
        ],
    },
];

// Mapping from agent slot id to allowed node category names
const SLOT_CATEGORY_FILTER = {
    llm: ["LLM Models"],
    memory: ["Memory"],
    tool: ["AI / Agents", "Core"],
};

export default function NodePanel({ onClose, onAddNode, slotFilter }) {
    const [search, setSearch] = useState("");

    const allowedCategories = slotFilter ? SLOT_CATEGORY_FILTER[slotFilter] : null;

    const filtered = nodeCategories
        .filter((cat) => !allowedCategories || allowedCategories.includes(cat.name))
        .map((cat) => ({
            ...cat,
            nodes: cat.nodes.filter(
                (n) =>
                    n.label.toLowerCase().includes(search.toLowerCase()) ||
                    n.description.toLowerCase().includes(search.toLowerCase()) ||
                    n.type.toLowerCase().includes(search.toLowerCase())
            ),
        }))
        .filter((cat) => cat.nodes.length > 0);

    const onDragStart = (event, type, label) => {
        event.dataTransfer.setData("application/reactflow-type", type);
        event.dataTransfer.setData("application/reactflow-label", label);
        event.dataTransfer.effectAllowed = "move";
    };

    return (
        <div className="absolute top-12 right-0 w-[540px] h-[calc(100%-3rem)] bg-card border-l border-border shadow-lg z-20 flex flex-col">
            <div className="p-3 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-sm text-foreground">{slotFilter ? `Add ${slotFilter === 'llm' ? 'Chat Model' : slotFilter === 'memory' ? 'Memory' : 'Tool'}` : 'Add Node'}</h3>
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                </button>
            </div>

            <div className="p-3 border-b border-border">
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search nodes..."
                        className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
                        autoFocus
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-4">
                <p className="text-xs text-muted-foreground italic">Drag a node onto the canvas or click to add</p>
                {filtered.map((cat) => (
                    <div key={cat.name}>
                        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">{cat.name}</h4>
                        <div className="space-y-1">
                            {cat.nodes.map((node) => (
                                <button
                                    key={node.type}
                                    draggable
                                    onDragStart={(e) => onDragStart(e, node.type, node.label)}
                                    onClick={() => onAddNode(node.type, node.label)}
                                    className="w-full flex items-center gap-3 p-2.5 rounded-md hover:bg-muted transition-colors text-left cursor-grab active:cursor-grabbing"
                                >
                                    <div className="p-1.5 rounded bg-muted">
                                        <node.icon className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-sm font-medium text-foreground">{node.label}</div>
                                        <div className="text-xs text-muted-foreground truncate">{node.description}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
