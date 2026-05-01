"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    LayoutDashboard,
    MessageSquare,
    Settings2,
    Workflow as WorkflowIcon,
    History,
    KeyRound,
    FlaskConical,
    ChevronRight,
    Loader2
} from "lucide-react";

// Server Actions
import { getOrCreateAgentConfig, listAgentModels, listRagDocs } from "./_actions/setup/actions";
import { getOrCreateMainWorkflow } from "./_actions/workflows/actions";
import { listRuns } from "./_actions/runs/actions";
import { listCredentials, deleteCredential } from "./_actions/credentials/actions";

// Components
import { ChatPanel } from "./_components/chat/ChatPanel";
import { ModelsManager } from "./_components/setup/ModelsManager";
import { AgentSettings } from "./_components/setup/AgentSettings";
import { RagPanel } from "./_components/setup/RagPanel";
import { RunList } from "./_components/runs/RunList";
import { CredentialList } from "./_components/credentials/CredentialList";
import WorkflowCanvas from "./_components/canvas/WorkflowCanvas";
import { Playground } from "./_components/playground/Playground";

import { toast } from "sonner";

import { useSession } from "next-auth/react";

export default function FlowgenixDashboard() {
    const { data: session, status: sessionStatus } = useSession();
    const params = useParams();
    const workspaceId = params?.workspaceId;
    const userId = session?.user?.userId;

    const [config, setConfig] = useState(null);
    const [docs, setDocs] = useState([]);
    const [mainWorkflow, setMainWorkflow] = useState(null);
    const [runs, setRuns] = useState([]);
    const [credentials, setCredentials] = useState([]);

    const [loading, setLoading] = useState(false);
    const [runsLoading, setRunsLoading] = useState(false);
    const [credsLoading, setCredsLoading] = useState(false);

    useEffect(() => {
        if (workspaceId && userId) {
            init();
        }
    }, [workspaceId, userId]);

    const init = async () => {
        if (!workspaceId || !userId) {
            console.warn("⚠️ [Flowgenix] Missing workspaceId or userId", { workspaceId, userId });
            return;
        }

        console.log("🚀 [Flowgenix] Starting Initialization...", { workspaceId, userId });
        setLoading(true);

        const withTimeout = (promise, label, timeout = 10000) => {
            return Promise.race([
                promise,
                new Promise((_, reject) => setTimeout(() => reject(new Error(`${label} timed out after ${timeout}ms`)), timeout))
            ]);
        };

        try {
            // Step 1: Agent Config
            console.log("📡 [Flowgenix] Step 1: Fetching Agent Config...");
            try {
                const configRes = await withTimeout(getOrCreateAgentConfig(workspaceId, userId), "AgentConfig");
                console.log("✅ [Flowgenix] Config loaded:", configRes?.name);
                setConfig(configRes);
            } catch (e) {
                console.error("❌ [Flowgenix] Config Fetch Failed or Timed Out:", e);
                toast.error("Agent Config taking too long...");
            }

            // Step 2: Knowledge Docs
            console.log("📡 [Flowgenix] Step 2: Fetching Knowledge Docs...");
            try {
                const docsRes = await withTimeout(listRagDocs(workspaceId), "RagDocs");
                console.log("✅ [Flowgenix] Docs loaded:", docsRes?.length);
                setDocs(docsRes || []);
            } catch (e) {
                console.error("❌ [Flowgenix] Docs Fetch Failed:", e);
            }

            // Step 3: Main Workflow
            console.log("📡 [Flowgenix] Step 3: Fetching Main Workflow...");
            try {
                const workflowRes = await withTimeout(getOrCreateMainWorkflow(workspaceId, userId), "MainWorkflow");
                console.log("✅ [Flowgenix] Workflow loaded:", workflowRes?.name);
                setMainWorkflow(workflowRes);
            } catch (e) {
                console.error("❌ [Flowgenix] Workflow Fetch Failed or Timed Out:", e);
                toast.error("Workflow taking too long...");
            }

            console.log("✨ [Flowgenix] Initialization Complete");
        } catch (error) {
            console.error("🔥 [Flowgenix] Global Init Error:", error);
        } finally {
            console.log("🏁 [Flowgenix] Setting loading to false");
            setLoading(false);
        }
    };

    const loadRuns = async () => {
        setRunsLoading(true);
        try {
            const data = await listRuns(workspaceId);
            setRuns(data);
        } finally {
            setRunsLoading(false);
        }
    };

    const loadCredentials = async () => {
        setCredsLoading(true);
        try {
            const data = await listCredentials(workspaceId);
            setCredentials(data);
        } finally {
            setCredsLoading(false);
        }
    };

    const handleDeleteCredential = async (id) => {
        try {
            await deleteCredential(workspaceId, id);
            toast.success("Credential deleted");
            loadCredentials();
        } catch (e) {
            toast.error(e.message);
        }
    };

    return (
        <div className="flex h-full w-full flex-col p-0">
            <Tabs defaultValue="chat" className="flex-1 flex flex-col w-full rounded-none">
                <TabsList className="w-full h-12 border-b border-border bg-card/30 p-0 grid grid-cols-5 rounded-none">
                    <TabsTrigger value="chat" className="h-12 rounded-none border-b-2 border-transparent px-0 text-sm transition-all data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:text-primary hover:text-foreground/80 shadow-none bg-transparent">
                        <MessageSquare className="h-3.5 w-3.5 mr-2" /> Chat
                    </TabsTrigger>
                    <TabsTrigger value="setup" className="h-12 rounded-none border-b-2 border-transparent px-0 text-sm transition-all data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:text-primary hover:text-foreground/80 shadow-none bg-transparent">
                        <Settings2 className="h-3.5 w-3.5 mr-2" /> Setup
                    </TabsTrigger>
                    <TabsTrigger value="workflow" className="h-12 rounded-none border-b-2 border-transparent px-0 text-sm transition-all data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:text-primary hover:text-foreground/80 shadow-none bg-transparent">
                        <WorkflowIcon className="h-3.5 w-3.5 mr-2" /> Workflow
                    </TabsTrigger>
                    <TabsTrigger value="runs" onClick={loadRuns} className="h-12 rounded-none border-b-2 border-transparent px-0 text-sm transition-all data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:text-primary hover:text-foreground/80 shadow-none bg-transparent">
                        <History className="h-3.5 w-3.5 mr-2" /> Runs
                    </TabsTrigger>
                    <TabsTrigger value="playground" className="h-12 rounded-none border-b-2 border-transparent px-0 text-sm transition-all data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:text-primary hover:text-foreground/80 shadow-none bg-transparent">
                        <FlaskConical className="h-3.5 w-3.5 mr-2" /> Playground
                    </TabsTrigger>
                </TabsList>

                <div className="flex-1 p-2">
                    <TabsContent value="chat" className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden flex flex-col h-[86vh]">
                        <div className="flex-1 overflow-hidden rounded-xl border border-border bg-card/50 shadow-2xl shadow-primary/5">
                            <ChatPanel config={config} ragDocs={docs} userId={userId} />
                        </div>
                    </TabsContent>

                    <TabsContent value="runs" className="flex-1 overflow-auto p-4 data-[state=inactive]:hidden h-[86vh]">
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground font-mono text-sm">
                            <History className="h-8 w-8 mb-2 opacity-20" />
                            <p>No recent runs found</p>
                        </div>
                    </TabsContent>

                    <TabsContent value="playground" className="flex-1 overflow-auto p-4 data-[state=inactive]:hidden h-[86vh]">
                        <Playground config={config} />
                    </TabsContent>

                    <TabsContent value="setup" className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden overflow-auto h-[86vh]">
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 p-4">
                            <div className="rounded-xl border border-border bg-card/50 p-6 lg:col-span-2">
                                <h2 className="mb-6 font-mono text-xs text-primary/80 flex items-center gap-2">
                                    <span className="h-1 w-1 rounded-full bg-primary" /> Models (Auto-Optimized)
                                </h2>
                                <ModelsManager config={config} onChange={setConfig} userId={userId} />
                            </div>
                            <div className="rounded-xl border border-border bg-card/50 p-6">
                                <h2 className="mb-6 font-mono text-xs text-primary/80 flex items-center gap-2">
                                    <span className="h-1 w-1 rounded-full bg-primary" /> Agent Configuration
                                </h2>
                                <AgentSettings config={config} onChange={setConfig} userId={userId} />
                            </div>
                            <div className="rounded-xl border border-border bg-card/50 p-6 self-start">
                                <h2 className="mb-6 font-mono text-xs text-primary/80 flex items-center gap-2">
                                    <span className="h-1 w-1 rounded-full bg-primary" /> Knowledge Base
                                </h2>
                                <RagPanel config={config} docs={docs} setDocs={setDocs} userId={userId} />
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="workflow" className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden h-[86vh] rounded-xl overflow-hidden border border-border">
                        <WorkflowCanvas
                            workflowId={mainWorkflow?.id}
                            workflowName={mainWorkflow?.name}
                            loadedNodes={mainWorkflow?.nodes}
                            loadedEdges={mainWorkflow?.edges}
                            initialCron={mainWorkflow?.cronExpression}
                            initialScheduleEnabled={mainWorkflow?.scheduleEnabled}
                            initialViewport={mainWorkflow?.viewport}
                        />
                    </TabsContent>

                    <TabsContent value="runs" className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden h-[86vh] p-4">
                        <RunList
                            runs={runs}
                            loading={runsLoading}
                            onRefresh={loadRuns}
                            onRerun={(run) => { }}
                            onOpenLogs={(id) => { }}
                        />
                    </TabsContent>



                </div>
            </Tabs>
        </div>
    );
}
