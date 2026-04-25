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
    ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Components
import { ChatPanel } from "./_components/ChatPanel";
import { AgentSettings } from "./_components/AgentSettings";
import { ModelsManager } from "./_components/ModelsManager";
import { RagPanel } from "./_components/RagPanel";

// Libs
import { defaultConfig, loadConfig, loadRag } from "./_lib/agent-storage";
import { listWorkflows } from "./_lib/workflow-storage";
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
                    <TabsTrigger value="chat" className="h-12 rounded-none border-b-2 border-transparent px-0 font-mono text-[10px] uppercase tracking-widest transition-all data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:text-primary hover:text-foreground/80 shadow-none bg-transparent">
                        <MessageSquare className="h-3.5 w-3.5 mr-2" /> Chat
                    </TabsTrigger>
                    <TabsTrigger value="setup" className="h-12 rounded-none border-b-2 border-transparent px-0 font-mono text-[10px] uppercase tracking-widest transition-all data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:text-primary hover:text-foreground/80 shadow-none bg-transparent">
                        <Settings className="h-3.5 w-3.5 mr-2" /> Setup
                    </TabsTrigger>
                    <TabsTrigger value="workflows" className="h-12 rounded-none border-b-2 border-transparent px-0 font-mono text-[10px] uppercase tracking-widest transition-all data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:text-primary hover:text-foreground/80 shadow-none bg-transparent">
                        <Workflow className="h-3.5 w-3.5 mr-2" /> Workflows
                    </TabsTrigger>
                    <TabsTrigger value="runs" onClick={loadRuns} className="h-12 rounded-none border-b-2 border-transparent px-0 font-mono text-[10px] uppercase tracking-widest transition-all data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:text-primary hover:text-foreground/80 shadow-none bg-transparent">
                        <History className="h-3.5 w-3.5 mr-2" /> Runs
                    </TabsTrigger>
                    <TabsTrigger value="canvas" className="h-12 rounded-none border-b-2 border-transparent px-0 font-mono text-[10px] uppercase tracking-widest transition-all data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:text-primary hover:text-foreground/80 shadow-none bg-transparent">
                        <LayoutGrid className="h-3.5 w-3.5 mr-2" /> Canvas
                    </TabsTrigger>
                    <TabsTrigger value="credentials" onClick={loadCredentials} className="h-12 rounded-none border-b-2 border-transparent px-0 font-mono text-[10px] uppercase tracking-widest transition-all data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:text-primary hover:text-foreground/80 shadow-none bg-transparent">
                        <KeyRound className="h-3.5 w-3.5 mr-2" /> Credentials
                    </TabsTrigger>
                </TabsList>

                <div className="flex-1 p-2">

                    {/* CHAT TAB */}
                    <TabsContent value="chat" className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden flex flex-col">
                        <div className="flex-1 overflow-hidden rounded-xl border border-border bg-card/50 shadow-2xl shadow-primary/5">
                            <ChatPanel config={config} ragDocs={docs} />
                        </div>
                    </TabsContent>

                    {/* SETUP TAB */}
                    <TabsContent value="setup" className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden overflow-auto">
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            <div className="rounded-xl border border-border bg-card/50 p-6 lg:col-span-2">
                                <h2 className="mb-6 font-mono text-xs uppercase tracking-widest text-primary/80 flex items-center gap-2">
                                    <span className="h-1 w-1 rounded-full bg-primary" /> Models & Routing
                                </h2>
                                <ModelsManager config={config} onChange={setConfig} />
                            </div>
                            <div className="rounded-xl border border-border bg-card/50 p-6">
                                <h2 className="mb-6 font-mono text-xs uppercase tracking-widest text-primary/80 flex items-center gap-2">
                                    <span className="h-1 w-1 rounded-full bg-primary" /> Agent Configuration
                                </h2>
                                <AgentSettings config={config} onChange={setConfig} />
                            </div>
                            <div className="rounded-xl border border-border bg-card/50 p-6 self-start">
                                <h2 className="mb-6 font-mono text-xs uppercase tracking-widest text-primary/80 flex items-center gap-2">
                                    <span className="h-1 w-1 rounded-full bg-primary" /> Knowledge Base
                                </h2>
                                <RagPanel config={config} docs={docs} setDocs={setDocs} />
                            </div>
                        </div>
                    </TabsContent>

                    {/* WORKFLOWS TAB */}
                    <TabsContent value="workflows" className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden overflow-auto">
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search workflows..."
                                    value={wfSearch}
                                    onChange={(e) => setWfSearch(e.target.value)}
                                    className="pl-10 font-mono text-sm bg-card/50 border-border/50 focus:border-primary/50 transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {workflows.filter(w => w.name.toLowerCase().includes(wfSearch.toLowerCase())).map(w => (
                                    <div key={w.id} className="group relative flex flex-col rounded-xl border border-border bg-card/40 p-4 transition-all hover:border-primary/30 hover:bg-card/60 hover:shadow-lg hover:shadow-primary/5">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                    <Workflow className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <h3 className="font-mono text-sm font-medium">{w.name}</h3>
                                                    <p className="text-[10px] text-muted-foreground font-mono">ID: {w.id.slice(0, 8)}...</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex items-center justify-between">
                                            <span className="font-mono text-[10px] text-muted-foreground">Updated {new Date(w.updated_at).toLocaleDateString()}</span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 font-mono text-[10px] uppercase tracking-wider gap-2 border-primary/20 hover:bg-primary/10 hover:text-primary transition-all"
                                                onClick={() => router.push(`/workspace/${workspaceId}/flowgenix/canvas/${w.id}`)}
                                            >
                                                Open Canvas <ExternalLink className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    {/* RUNS TAB */}
                    <TabsContent value="runs" className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden overflow-auto">
                        <div className="rounded-xl border border-border bg-card/50 overflow-hidden shadow-2xl shadow-black/5">
                            <table className="w-full text-left">
                                <thead className="bg-muted/30 border-b border-border/50">
                                    <tr>
                                        <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Workflow</th>
                                        <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Status</th>
                                        <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Trigger</th>
                                        <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Timestamp</th>
                                        <th className="px-6 py-4 text-right"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {runsLoading ? (
                                        <tr>
                                            <td colSpan={5} className="p-12 text-center">
                                                <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary/50" />
                                            </td>
                                        </tr>
                                    ) : runs.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-12 text-center font-mono text-xs text-muted-foreground">
                                                No execution history found
                                            </td>
                                        </tr>
                                    ) : (
                                        runs.map(r => (
                                            <tr key={r.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="font-mono text-sm">{r.workflow_name}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant="outline" className={cn(
                                                        "font-mono text-[10px] uppercase px-2 py-0.5",
                                                        r.status === 'success' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                            r.status === 'error' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                                'bg-primary/10 text-primary border-primary/20'
                                                    )}>
                                                        {r.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{r.trigger}</td>
                                                <td className="px-6 py-4 font-mono text-[10px] text-muted-foreground">
                                                    {new Date(r.started_at).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
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
                    <TabsContent value="credentials" className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden overflow-auto">
                        <div className="rounded-xl border border-border bg-card/50 overflow-hidden shadow-2xl shadow-black/5">
                            <table className="w-full text-left">
                                <thead className="bg-muted/30 border-b border-border/50">
                                    <tr>
                                        <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Name</th>
                                        <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Kind</th>
                                        <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Status</th>
                                        <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Updated</th>
                                        <th className="px-6 py-4 text-right"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {credsLoading ? (
                                        <tr>
                                            <td colSpan={5} className="p-12 text-center">
                                                <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary/50" />
                                            </td>
                                        </tr>
                                    ) : credentials.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-12 text-center font-mono text-xs text-muted-foreground">
                                                No credentials registered
                                            </td>
                                        </tr>
                                    ) : (
                                        credentials.map(c => (
                                            <tr key={c.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                                                <td className="px-6 py-4 font-mono text-sm font-medium">{c.name}</td>
                                                <td className="px-6 py-4 font-mono text-[10px] text-muted-foreground uppercase">{c.kind}</td>
                                                <td className="px-6 py-4">
                                                    {c.secret_id ? (
                                                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20 font-mono text-[10px] uppercase tracking-tighter">Encrypted</Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="font-mono text-[10px] uppercase tracking-tighter">Public</Badge>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 font-mono text-[10px] text-muted-foreground">
                                                    {new Date(c.updated_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
