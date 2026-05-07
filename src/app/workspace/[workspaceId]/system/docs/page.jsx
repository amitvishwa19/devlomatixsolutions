"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Book,
    Layers,
    Code2,
    Database,
    Shield,
    Palette,
    Zap,
    Users,
    ShoppingCart,
    MessageSquare,
    GitBranch,
    FileText,
    Briefcase,
    Mail,
    CheckSquare,
    ChevronRight,
    Search,
    ChevronDown,
} from "lucide-react";

const docs = {
    overview: {
        title: "System Overview",
        icon: Book,
        content: `Devlomatix is a comprehensive Multi-tenant Business OS built on Next.js 14 App Router. Every entity is isolated by workspaceId, enabling complete data separation between organizations. The system combines CRM, E-commerce, WhatsApp Business management, Workflow automation, and productivity tools into a unified glassmorphic interface.`,
        features: [
            "Multi-tenant architecture with workspace isolation",
            "Role-based access control (RBAC) with permission inheritance",
            "AES-256-CBC encrypted credential storage",
            "Real-time workflow execution engine",
            "WhatsApp Business Cloud API integration",
            "AI-powered agent runtime system",
        ],
    },
    architecture: {
        title: "Architecture & Design Patterns",
        icon: Layers,
        sections: [
            {
                title: "Module-Based Architecture",
                description: "Each major feature operates as an independent module with consistent internal structure:",
                structure: [
                    "page.jsx - Route entry point",
                    "_components/ - Local UI components",
                    "_lib/ - Utility functions and libraries",
                    "_actions/ - Server actions (mutations)",
                    "_hooks/ - Custom React hooks",
                    "_types/ - Type definitions",
                    "_provider/ - Context providers",
                ],
            },
            {
                title: "Provider Pattern",
                description: "React Context manages module-specific state with lazy data fetching:",
                example: `AccessProvider → fetchAccessData() → resolveRolePermissions()`,
            },
            {
                title: "Server Actions Pattern",
                description: "Mutations use Zod validation with createSafeAction wrapper:",
                example: `createSafeAction(schemas, handler) → Prisma DB operation`,
            },
        ],
    },
    database: {
        title: "Database Layer (Prisma + Supabase PostgreSQL)",
        icon: Database,
        models: [
            {
                name: "User",
                fields: ["id", "email", "name", "password", "image", "emailVerified"],
            },
            {
                name: "Server (Workspace)",
                fields: ["id", "name", "userId", "default", "createdAt"],
            },
            {
                name: "Role",
                fields: ["id", "name", "permissions", "isDefault", "parentRoleId"],
            },
            {
                name: "Permission",
                fields: ["id", "name", "resource", "action", "conditions"],
            },
            {
                name: "Credentials",
                fields: ["id", "name", "type", "platform", "encrypted", "workspaceId"],
            },
            {
                name: "Contact",
                fields: ["id", "name", "phone", "email", "type", "tags", "info"],
            },
            {
                name: "Workflow",
                fields: ["id", "name", "nodes", "edges", "status", "workspaceId"],
            },
            {
                name: "WorkflowExecution",
                fields: ["id", "workflowId", "status", "input", "output", "logs"],
            },
        ],
    },
    api: {
        title: "API Routes",
        icon: Code2,
        endpoints: [
            { path: "/access", methods: ["GET", "POST", "PATCH", "DELETE"] },
            { path: "/contacts", methods: ["GET", "POST"] },
            { path: "/contacts/[id]", methods: ["GET", "PATCH", "DELETE"] },
            { path: "/contacts/groups", methods: ["GET", "POST"] },
            { path: "/ecommerce/products", methods: ["GET", "POST"] },
            { path: "/ecommerce/orders", methods: ["GET", "POST"] },
            { path: "/konnectx/messages", methods: ["GET", "POST"] },
            { path: "/konnectx/templates", methods: ["GET", "POST"] },
            { path: "/konnectx/campaigns", methods: ["GET", "POST"] },
            { path: "/flowgenix/workflows", methods: ["GET", "POST"] },
            { path: "/productivity/kanban", methods: ["GET", "POST"] },
            { path: "/productivity/mailbox", methods: ["GET", "POST"] },
            { path: "/ats/jobs", methods: ["GET", "POST"] },
            { path: "/ats/candidates", methods: ["GET", "POST"] },
            { path: "/document/files", methods: ["GET", "POST"] },
            { path: "/management/users", methods: ["GET", "POST"] },
            { path: "/management/roles", methods: ["GET", "POST"] },
            { path: "/agent/execute", methods: ["POST"] },
        ],
    },
    security: {
        title: "Security & Encryption",
        icon: Shield,
        features: [
            {
                title: "Authentication",
                description: "NextAuth.js with session-based auth. Every request verifies session.user.userId.",
            },
            {
                title: "Credential Encryption",
                description: "AES-256-CBC algorithm. Keys stored as iv:encryptedText. Never logged or exposed.",
                location: "src/lib/encryption.js",
            },
            {
                title: "Workspace Isolation",
                description: "All database queries include where: { workspaceId } clause.",
            },
            {
                title: "Role Permission Inheritance",
                description: "Roles can inherit from parent roles. Permissions merge recursively.",
            },
        ],
    },
    modules: {
        title: "Feature Modules",
        icon: Zap,
        items: [
            {
                name: "KonnectX",
                description: "WhatsApp Business Cloud API management",
                icon: MessageSquare,
                features: ["Messaging", "Chatbot Flows", "Campaigns", "Templates", "Queue Worker"],
                lib: ["whatsapp-cloud-api.js", "bot-engine.js", "campaign-engine.js", "queue-worker.js"],
            },
            {
                name: "FlowGenix",
                description: "AI Workflow automation engine",
                icon: GitBranch,
                features: ["Visual Workflow Builder", "Node Execution", "Agent Runtime", "Execution Logging"],
                lib: ["workflow-engine.js", "workflow-storage.js", "agent-runtime.js"],
            },
            {
                name: "Ecommerce",
                description: "Store & inventory management",
                icon: ShoppingCart,
                features: ["Products", "Orders", "Categories", "Inventory Tracking"],
            },
            {
                name: "Productivity",
                description: "Daily operations suite",
                icon: CheckSquare,
                features: ["Kanban Boards", "Mailbox", "Messages", "Workflow Management"],
            },
            {
                name: "ATS",
                description: "Applicant Tracking System",
                icon: Briefcase,
                features: ["Job Postings", "Candidate Pipeline", "Interview Scheduling", "Offer Management"],
            },
            {
                name: "Contacts",
                description: "CRM & contact management",
                icon: Users,
                features: ["Contact Vault", "Groups/Tags", "Lead Discovery", "Client Management"],
            },
            {
                name: "Documents",
                description: "Document management system",
                icon: FileText,
                features: ["File Storage", "Folders", "Versioning", "Sharing"],
            },
            {
                name: "Mail",
                description: "Email management",
                icon: Mail,
                features: ["Inbox", "Compose", "Templates", "Automation"],
            },
        ],
    },
    ui: {
        title: "UI/UX Design System",
        icon: Palette,
        tokens: [
            { name: "Surface", value: "bg-[#0a0a0a]/50", description: "Main background with glass blur" },
            { name: "Borders", value: "border-white/5", description: "Subtle glass borders" },
            { name: "Primary", value: "border-primary/20", description: "Accent borders" },
        ],
        colors: [
            { type: "CLIENT", color: "emerald-500/10", text: "emerald-400" },
            { type: "LEAD", color: "amber-500/10", text: "amber-400" },
            { type: "CONTACT", color: "blue-500/10", text: "blue-400" },
        ],
        components: ["HUD Stats", "Universal DataTable", "Batch Actions", "Glassmorphic Cards"],
    },
    components: {
        title: "Core Components",
        icon: Layers,
        items: [
            { name: "AppSidebar", path: "_components/", desc: "Navigation sidebar with collapsible menu groups" },
            { name: "AppTopNav", path: "_components/", desc: "Top navigation bar" },
            { name: "WorkspaceDashboard", path: "_components/", desc: "Module cards dashboard" },
            { name: "WorkspaceLoader", path: "_components/", desc: "Loading state for workspace init" },
            { name: "DataTable", path: "_components/", desc: "TanStack Table with sorting, filtering, pagination" },
            { name: "OrgAuthBlock", path: "_components/", desc: "Organization authentication block" },
        ],
    },
};

const DocumentationSection = ({ section, isActive, onClick }) => {
    const Icon = section.icon;
    return (
        <motion.button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${isActive
                ? "bg-primary/20 text-primary border border-primary/30"
                : "hover:bg-white/5 text-zinc-400 hover:text-white"
                }`}
            whileHover={{ x: 4 }}
        >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">{section.title}</span>
        </motion.button>
    );
};

export default function DocumentationPage() {
    const [activeSection, setActiveSection] = useState("overview");
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedModule, setExpandedModule] = useState(null);

    const currentDoc = docs[activeSection];
    const CurrentIcon = currentDoc?.icon || Book;

    const filteredModules = searchQuery
        ? docs.modules.items.filter((m) =>
            m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : docs.modules.items;

    return (
        <div className="min-h-screen ">
            <div className="flex">

                <motion.aside
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="w-72 border-r border-white/5  backdrop-blur-xl sticky top-0 h-screen overflow-y-auto"
                >
                    <div className="p-4 border-b border-white/5">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Search docs..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-primary/50"
                            />
                        </div>
                    </div>
                    <nav className="p-3 space-y-1 text-sm">
                        {Object.entries(docs).map(([key, section]) => (
                            <DocumentationSection
                                key={key}
                                section={section}
                                isActive={activeSection === key}
                                onClick={() => setActiveSection(key)}
                            />
                        ))}
                    </nav>
                </motion.aside>

                <main className="flex-1 p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeSection}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                            className=" mx-auto"
                        >
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                                    <CurrentIcon className="w-6 h-6 text-primary" />
                                </div>
                                <h1 className="text-2xl font-bold text-white">{currentDoc?.title}</h1>
                            </div>

                            {activeSection === "overview" && (
                                <div className="space-y-6">
                                    <p className="text-zinc-400 leading-relaxed">{docs.overview.content}</p>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white mb-4">Key Features</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {docs.overview.features.map((feature, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.1 }}
                                                    className="p-4 rounded-lg bg-white/5 border border-white/5"
                                                >
                                                    <p className="text-sm text-zinc-300">{feature}</p>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeSection === "architecture" && (
                                <div className="space-y-6">
                                    {docs.architecture.sections.map((section, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="p-6 rounded-xl bg-white/5 border border-white/5"
                                        >
                                            <h3 className="text-lg font-semibold text-white mb-2">{section.title}</h3>
                                            <p className="text-zinc-400 mb-4">{section.description}</p>
                                            {section.structure && (
                                                <div className="bg-black/30 rounded-lg p-4 font-mono text-sm">
                                                    {section.structure.map((item, j) => (
                                                        <div key={j} className="text-zinc-300">
                                                            <span className="text-primary">├──</span> {item}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {section.example && (
                                                <code className="block bg-black/30 rounded-lg p-4 text-sm text-emerald-400 font-mono">
                                                    {section.example}
                                                </code>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {activeSection === "database" && (
                                <div className="space-y-4">
                                    {docs.database.models.map((model, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="p-4 rounded-xl bg-white/5 border border-white/5"
                                        >
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-mono text-primary font-semibold">{model.name}</h3>
                                                <ChevronDown className="w-4 h-4 text-zinc-500" />
                                            </div>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {model.fields.map((field, j) => (
                                                    <span key={j} className="px-2 py-1 text-xs bg-white/5 rounded text-zinc-400 font-mono">
                                                        {field}
                                                    </span>
                                                ))}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {activeSection === "api" && (
                                <div className="space-y-3">
                                    {docs.api.endpoints.map((endpoint, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.03 }}
                                            className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5"
                                        >
                                            <code className="font-mono text-sm text-emerald-400">{endpoint.path}</code>
                                            <div className="flex gap-2">
                                                {endpoint.methods.map((method) => (
                                                    <span
                                                        key={method}
                                                        className={`px-2 py-1 text-xs rounded font-mono ${method === "GET"
                                                            ? "bg-blue-500/20 text-blue-400"
                                                            : method === "POST"
                                                                ? "bg-emerald-500/20 text-emerald-400"
                                                                : method === "PATCH"
                                                                    ? "bg-amber-500/20 text-amber-400"
                                                                    : "bg-red-500/20 text-red-400"
                                                            }`}
                                                    >
                                                        {method}
                                                    </span>
                                                ))}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {activeSection === "security" && (
                                <div className="space-y-4">
                                    {docs.security.features.map((feature, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="p-6 rounded-xl bg-white/5 border border-white/5"
                                        >
                                            <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                                            <p className="text-zinc-400">{feature.description}</p>
                                            {feature.location && (
                                                <code className="block mt-2 text-xs text-zinc-500">{feature.location}</code>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {activeSection === "modules" && (
                                <div className="space-y-4">
                                    {filteredModules.map((module, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="rounded-xl bg-white/5 border border-white/5 overflow-hidden"
                                        >
                                            <button
                                                onClick={() => setExpandedModule(expandedModule === i ? null : i)}
                                                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <module.icon className="w-5 h-5 text-primary" />
                                                    <div className="text-left">
                                                        <h3 className="font-semibold text-white">{module.name}</h3>
                                                        <p className="text-sm text-zinc-500">{module.description}</p>
                                                    </div>
                                                </div>
                                                <ChevronRight
                                                    className={`w-5 h-5 text-zinc-500 transition-transform ${expandedModule === i ? "rotate-90" : ""
                                                        }`}
                                                />
                                            </button>
                                            <AnimatePresence>
                                                {expandedModule === i && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="border-t border-white/5"
                                                    >
                                                        <div className="p-4 space-y-4">
                                                            <div>
                                                                <h4 className="text-sm font-medium text-zinc-400 mb-2">Features</h4>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {module.features.map((feat, j) => (
                                                                        <span key={j} className="px-3 py-1 text-xs bg-white/10 rounded-full text-zinc-300">
                                                                            {feat}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            {module.lib && (
                                                                <div>
                                                                    <h4 className="text-sm font-medium text-zinc-400 mb-2">Core Libraries</h4>
                                                                    <div className="bg-black/30 rounded-lg p-3 font-mono text-xs">
                                                                        {module.lib.map((lib, j) => (
                                                                            <div key={j} className="text-zinc-400">
                                                                                <span className="text-primary">├──</span> {lib}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {activeSection === "ui" && (
                                <div className="space-y-6">
                                    <div className="p-6 rounded-xl bg-white/5 border border-white/5">
                                        <h3 className="text-lg font-semibold text-white mb-4">Design Tokens</h3>
                                        <div className="space-y-3">
                                            {docs.ui.tokens.map((token, i) => (
                                                <div key={i} className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-lg ${token.value} border border-white/10`} />
                                                    <div>
                                                        <p className="font-medium text-white">{token.name}</p>
                                                        <code className="text-xs text-zinc-500">{token.value}</code>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="p-6 rounded-xl bg-white/5 border border-white/5">
                                        <h3 className="text-lg font-semibold text-white mb-4">Classification Colors</h3>
                                        <div className="flex gap-4">
                                            {docs.ui.colors.map((color, i) => (
                                                <div key={i} className="flex items-center gap-2">
                                                    <div className={`w-4 h-4 rounded-full bg-[${color.color}]`} />
                                                    <span className="text-sm text-zinc-300">{color.type}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="p-6 rounded-xl bg-white/5 border border-white/5">
                                        <h3 className="text-lg font-semibold text-white mb-4">Core Components</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {docs.ui.components.map((comp, i) => (
                                                <span key={i} className="px-3 py-2 bg-white/10 rounded-lg text-sm text-zinc-300">
                                                    {comp}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeSection === "components" && (
                                <div className="space-y-4">
                                    {docs.components.items.map((comp, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="p-4 rounded-xl bg-white/5 border border-white/5"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-mono text-primary">{comp.name}</h3>
                                                    <p className="text-sm text-zinc-500 mt-1">{comp.desc}</p>
                                                </div>
                                                <code className="text-xs text-zinc-600">{comp.path}</code>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}
