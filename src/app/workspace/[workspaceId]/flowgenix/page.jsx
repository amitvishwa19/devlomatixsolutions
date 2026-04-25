"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppLayout } from "./_components/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    MessageSquare,
    Settings,
    Workflow,
    History,
    LayoutGrid,
    KeyRound,
    Loader2,
    Search,
    ExternalLink,
    Edit2,
    Plus,
    RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Play, Trash2, Eye } from "lucide-react";

// Components
import { ChatPanel } from "./_components/ChatPanel";
import { AgentSettings } from "./_components/AgentSettings";
import { ModelsManager } from "./_components/ModelsManager";
import { RagPanel } from "./_components/RagPanel";

// Libs
import { defaultConfig, loadConfig, loadRag } from "./_lib/agent-storage";
import { listWorkflows, listRunLogs } from "./_lib/workflow-storage";
import { listCredentials } from "./_lib/node-credentials";
import { supabase } from "@/lib/supabase";

export default function FlowgenixDashboard() {
    const params = useParams();
    const router = useRouter();
    const workspaceId = params?.workspaceId;

    // Common State
    const [loading, setLoading] = useState(true);
    const [config, setConfig] = useState(defaultConfig);
    const [docs, setDocs] = useState([]);

    // Workflows State
    const [workflows, setWorkflows] = useState([]);
    const [wfSearch, setWfSearch] = useState("");

    // Runs State
    const [runs, setRuns] = useState([]);
    const [runsLoading, setRunsLoading] = useState(false);
    const [rerunningId, setRerunningId] = useState(null);

    // Credentials State
    const [credentials, setCredentials] = useState([]);
    const [credsLoading, setCredsLoading] = useState(false);

    // Logs State
    const [openRunId, setOpenRunId] = useState(null);
    const [logs, setLogs] = useState([]);
    const [logsLoading, setLogsLoading] = useState(false);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            try {
                const [c, d, wfs] = await Promise.all([
                    loadConfig(),
                    loadRag(),
                    listWorkflows({ templates: false })
                ]);
                setConfig(c);
                setDocs(d);
                setWorkflows(wfs);
            } catch (e) {
                toast.error("Failed to load initial data");
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    useEffect(() => {
        if (!openRunId) {
            setLogs([]);
            return;
        }
        setLogsLoading(true);
        listRunLogs(openRunId)
            .then(setLogs)
            .finally(() => setLogsLoading(false));
    }, [openRunId]);

    // Tab specific data loading
    const loadRuns = async () => {
        setRunsLoading(true);
        try {
            const { data, error } = await supabase
                .from("workflow_runs")
                .select("*")
                .order("started_at", { ascending: false })
                .limit(50);
            if (error) throw error;

            const byId = new Map(workflows.map(w => [w.id, w.name]));
            setRuns((data ?? []).map(r => ({
                ...r,
                workflow_name: byId.get(r.workflow_id) || "Unknown Workflow"
            })));
        } catch (e) {
            toast.error("Failed to load runs");
        } finally {
            setRunsLoading(false);
        }
    };

    const loadCredentials = async () => {
        setCredsLoading(true);
        try {
            setCredentials(await listCredentials());
        } catch (e) {
            toast.error("Failed to load credentials");
        } finally {
            setCredsLoading(false);
        }


    };

    if (loading) {
        return (
            <AppLayout>
                <div className="flex h-[80vh] items-center justify-center font-mono text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
                    initializing flowgenix environment...
                </div>
            </AppLayout>
        );
    }

    return (

        <div className="flex h-full w-full flex-col p-0">
            <Tabs defaultValue="chat" className="flex-1 flex flex-col w-full rounded-none">
                <TabsList className="w-full h-12 border-b border-border bg-card/30 p-0 grid grid-cols-6 rounded-none">
                    <TabsTrigger value="chat" className="h-12 rounded-none border-b-2 border-transparent px-0 text-sm    transition-all data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:text-primary hover:text-foreground/80 shadow-none bg-transparent">
                        <MessageSquare className="h-3.5 w-3.5 mr-2" /> Chat
                    </TabsTrigger>
                    <TabsTrigger value="setup" className="h-12 rounded-none border-b-2 border-transparent px-0 text-sm    transition-all data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:text-primary hover:text-foreground/80 shadow-none bg-transparent">
                        <Settings className="h-3.5 w-3.5 mr-2" /> Setup
                    </TabsTrigger>
                    <TabsTrigger value="workflows" className="h-12 rounded-none border-b-2 border-transparent px-0 text-sm    transition-all data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:text-primary hover:text-foreground/80 shadow-none bg-transparent">
                        <Workflow className="h-3.5 w-3.5 mr-2" /> Workflows
                    </TabsTrigger>
                    <TabsTrigger value="runs" onClick={loadRuns} className="h-12 rounded-none border-b-2 border-transparent px-0 text-sm    transition-all data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:text-primary hover:text-foreground/80 shadow-none bg-transparent">
                        <History className="h-3.5 w-3.5 mr-2" /> Runs
                    </TabsTrigger>
                    <TabsTrigger value="canvas" className="h-12 rounded-none border-b-2 border-transparent px-0 text-sm    transition-all data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:text-primary hover:text-foreground/80 shadow-none bg-transparent">
                        <LayoutGrid className="h-3.5 w-3.5 mr-2" /> Canvas
                    </TabsTrigger>
                    <TabsTrigger value="credentials" onClick={loadCredentials} className="h-12 rounded-none border-b-2 border-transparent px-0 text-sm    transition-all data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:text-primary hover:text-foreground/80 shadow-none bg-transparent">
                        <KeyRound className="h-3.5 w-3.5 mr-2" /> Credentials
                    </TabsTrigger>
                </TabsList>

                <div className="flex-1 p-2">

                    {/* CHAT TAB */}
                    <TabsContent value="chat" className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden flex flex-col  h-[86vh]">
                        <div className="flex-1 overflow-hidden rounded-xl border border-border bg-card/50 shadow-2xl shadow-primary/5">
                            <ChatPanel config={config} ragDocs={docs} />
                        </div>
                    </TabsContent>

                    {/* SETUP TAB */}
                    <TabsContent value="setup" className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden overflow-auto">
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            <div className="rounded-xl border border-border bg-card/50 p-6 lg:col-span-2">
                                <h2 className="mb-6 font-mono text-xs   text-primary/80 flex items-center gap-2">
                                    <span className="h-1 w-1 rounded-full bg-primary" /> Models & Routing
                                </h2>
                                <ModelsManager config={config} onChange={setConfig} />
                            </div>
                            <div className="rounded-xl border border-border bg-card/50 p-6">
                                <h2 className="mb-6 font-mono text-xs   text-primary/80 flex items-center gap-2">
                                    <span className="h-1 w-1 rounded-full bg-primary" /> Agent Configuration
                                </h2>
                                <AgentSettings config={config} onChange={setConfig} />
                            </div>
                            <div className="rounded-xl border border-border bg-card/50 p-6 self-start">
                                <h2 className="mb-6 font-mono text-xs   text-primary/80 flex items-center gap-2">
                                    <span className="h-1 w-1 rounded-full bg-primary" /> Knowledge Base
                                </h2>
                                <RagPanel config={config} docs={docs} setDocs={setDocs} />
                            </div>
                        </div>
                    </TabsContent>

                    {/* WORKFLOWS TAB */}
                    <TabsContent value="workflows" className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden flex flex-col h-[85vh]">
                        <Card className="rounded-md border-border/60 bg-card shadow-sm flex-1 flex flex-col overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 py-4 shrink-0">
                                <div>
                                    <CardTitle className="text-lg font-bold">Workflows</CardTitle>
                                    <p className="text-xs text-muted-foreground font-medium">Manage and monitor your automation sequences.</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="relative w-64">
                                        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                                        <Input
                                            placeholder="Search workflows..."
                                            value={wfSearch}
                                            onChange={(e) => setWfSearch(e.target.value)}
                                            className="pl-9 h-9 text-xs"
                                        />
                                    </div>
                                    <Button size="sm" className="h-8 gap-2 px-3">
                                        <Workflow className="h-3.5 w-3.5" /> New Workflow
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 flex-1 overflow-hidden">
                                <ScrollArea className="h-full">
                                    <table className="w-full text-xs">
                                        <thead className="sticky top-0 bg-muted/90 backdrop-blur z-10">
                                            <tr className="border-b border-border/60 text-left font-bold  tracking-tighter text-muted-foreground">
                                                <th className="py-3 pl-6">Workflow Name</th>
                                                <th>Status</th>
                                                <th>Nodes</th>
                                                <th>Last Updated</th>
                                                <th className="pr-6 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/60">
                                            {workflows.filter(w => w.name.toLowerCase().includes(wfSearch.toLowerCase())).map((w) => (
                                                <tr key={w.id} className="hover:bg-muted/30 transition-colors group">
                                                    <td className="py-4 pl-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                                <Workflow className="h-4 w-4" />
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-sm">{w.name}</div>
                                                                <div className="font-mono  text-muted-foreground opacity-60">ID: {w.id.slice(0, 8)}...</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px] h-5 rounded-sm font-bold  tracking-tighter">
                                                            Active
                                                        </Badge>
                                                    </td>
                                                    <td>
                                                        <span className="font-medium text-muted-foreground">12 nodes</span>
                                                    </td>
                                                    <td className="text-muted-foreground font-medium">
                                                        {new Date(w.updated_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="pr-6 text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-40">
                                                                <DropdownMenuItem onClick={() => router.push(`/workspace/${workspaceId}/flowgenix/canvas/${w.id}`)}>
                                                                    <Eye className="h-3.5 w-3.5 mr-2" /> View Canvas
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem>
                                                                    <Play className="h-3.5 w-3.5 mr-2" /> Execute
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="text-destructive">
                                                                    <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* RUNS TAB */}
                    <TabsContent value="runs" className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden flex flex-col h-[85vh]">
                        <Card className="rounded-md border-border/60 bg-card shadow-sm flex-1 flex flex-col overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 py-4 shrink-0">
                                <div>
                                    <CardTitle className="text-lg font-bold">Execution History</CardTitle>
                                    <p className="text-xs text-muted-foreground font-medium">Real-time log of all workflow runs and triggers.</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge variant="outline" className=" font-bold h-5  ">{runs.length} RUNS</Badge>
                                    <Button size="sm" variant="ghost" onClick={loadRuns} disabled={runsLoading} className="h-8 w-8 p-0">
                                        <RefreshCw className={`h-4 w-4 ${runsLoading ? "animate-spin" : ""}`} />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 flex-1 overflow-hidden">
                                <ScrollArea className="h-full">
                                    <table className="w-full text-xs">
                                        <thead className="sticky top-0 bg-muted/90 backdrop-blur z-10">
                                            <tr className="border-b border-border/60 text-left font-bold  tracking-tighter text-muted-foreground">
                                                <th className="py-3 pl-6">Started At</th>
                                                <th>Workflow</th>
                                                <th>Status</th>
                                                <th>Trigger</th>
                                                <th className="pr-6 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/60">
                                            {runsLoading && !runs.length && (
                                                <tr><td colSpan={5} className="py-20 text-center text-muted-foreground animate-pulse font-mono   ">Initializing stream...</td></tr>
                                            )}
                                            {runs.length === 0 && !runsLoading && (
                                                <tr><td colSpan={5} className="py-20 text-center text-muted-foreground font-mono  ">No runs found</td></tr>
                                            )}
                                            {runs.map((r) => (
                                                <tr key={r.id} className="hover:bg-muted/30 transition-colors group">
                                                    <td className="py-3 pl-6 text-muted-foreground font-mono">
                                                        {new Date(r.started_at).toLocaleString()}
                                                    </td>
                                                    <td>
                                                        <div className="font-bold text-sm">{r.workflow_name}</div>
                                                        <div className="font-mono text-[9px] text-muted-foreground opacity-50">{r.id.slice(0, 8)}</div>
                                                    </td>
                                                    <td>
                                                        <Badge variant="outline" className={cn(
                                                            "text-[9px] h-5 rounded-sm font-bold  tracking-tighter",
                                                            r.status === 'success' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                                r.status === 'error' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                                    'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                                        )}>
                                                            {r.status}
                                                        </Badge>
                                                    </td>
                                                    <td>
                                                        <Badge variant="outline" className="text-[9px] h-5 rounded-sm font-bold  tracking-tighter opacity-60">
                                                            {r.trigger}
                                                        </Badge>
                                                    </td>
                                                    <td className="pr-6 text-right">
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setOpenRunId(r.id)}>
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* CANVAS TAB */}
                    <TabsContent value="canvas" className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden overflow-auto">
                        <div className="flex flex-col items-center justify-center h-full space-y-4 py-20 text-center">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <LayoutGrid className="h-10 w-10" />
                            </div>
                            <div>
                                <h2 className="font-mono text-lg font-semibold tracking-tight">Interactive Canvas</h2>
                                <p className="max-w-md font-mono text-sm text-muted-foreground mt-2">
                                    Select a workflow from the Workflows tab to open it in the visual editor.
                                </p>
                            </div>
                        </div>
                    </TabsContent>

                    {/* CREDENTIALS TAB */}
                    <TabsContent value="credentials" className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden flex flex-col h-[85vh]">
                        <Card className="rounded-md border-border/60 bg-card shadow-sm flex-1 flex flex-col overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 py-4 shrink-0">
                                <div>
                                    <CardTitle className="text-lg font-bold">Node Credentials</CardTitle>
                                    <p className="text-xs text-muted-foreground font-medium">Securely store API keys and auth tokens for nodes.</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button size="sm" variant="outline" onClick={loadCredentials} className="h-8 gap-2">
                                        <RefreshCw className={cn("h-3.5 w-3.5", credsLoading && "animate-spin")} /> Refresh
                                    </Button>
                                    <Button size="sm" className="h-8 gap-2 px-3">
                                        <Plus className="h-3.5 w-3.5" /> Add Credential
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 flex-1 overflow-hidden">
                                <ScrollArea className="h-full">
                                    <table className="w-full text-xs">
                                        <thead className="sticky top-0 bg-muted/90 backdrop-blur z-10">
                                            <tr className="border-b border-border/60 text-left font-bold  tracking-tighter text-muted-foreground">
                                                <th className="py-3 pl-6">Name</th>
                                                <th>Type / Provider</th>
                                                <th>Status</th>
                                                <th>Updated At</th>
                                                <th className="pr-6 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/60">
                                            {credsLoading && !credentials.length && (
                                                <tr><td colSpan={5} className="py-20 text-center text-muted-foreground animate-pulse font-mono  ">Loading credentials...</td></tr>
                                            )}
                                            {credentials.length === 0 && !credsLoading && (
                                                <tr><td colSpan={5} className="py-20 text-center text-muted-foreground font-mono  ">No credentials registered</td></tr>
                                            )}
                                            {credentials.map((c) => (
                                                <tr key={c.id} className="hover:bg-muted/30 transition-colors group">
                                                    <td className="py-4 pl-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                                <KeyRound className="h-4 w-4" />
                                                            </div>
                                                            <div className="font-bold text-sm">{c.name}</div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <code className=" font-mono bg-muted/50 px-2 py-0.5 rounded border border-border/40  text-muted-foreground">
                                                            {c.kind}
                                                        </code>
                                                    </td>
                                                    <td>
                                                        <Badge variant={c.secret_id ? "default" : "outline"} className={cn(
                                                            "text-[9px] h-5 rounded-sm font-bold  tracking-tighter",
                                                            c.secret_id ? "bg-emerald-500/20 text-emerald-500 border-0" : "opacity-60"
                                                        )}>
                                                            {c.secret_id ? "Encrypted" : "Public"}
                                                        </Badge>
                                                    </td>
                                                    <td className="text-muted-foreground font-medium">
                                                        {new Date(c.updated_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="pr-6 text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-40">
                                                                <DropdownMenuItem>
                                                                    <Edit2 className="h-3.5 w-3.5 mr-2" /> Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="text-destructive">
                                                                    <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
