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
    ChevronRight,
    Loader2
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

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
        setLoading(true);
        try {
            const [cfg, ragDocs, workflow, creds] = await Promise.all([
                getOrCreateAgentConfig(workspaceId, userId),
                listRagDocs(workspaceId),
                getOrCreateMainWorkflow(workspaceId, userId),
                listCredentials(workspaceId)
            ]);
            setConfig(cfg);
            setDocs(ragDocs);
            setMainWorkflow(workflow);
            setCredentials(creds);
        } catch (error) {
            console.error("Initialization error:", error);
            toast.error("Failed to initialize workspace");
        } finally {
            setLoading(false);
        }
    };

    const loadRuns = async () => {
        if (!workspaceId) return;
        setRunsLoading(true);
        try {
            const data = await listRuns(workspaceId);
            setRuns(data);
        } catch (error) {
            toast.error("Failed to load runs");
        } finally {
            setRunsLoading(false);
        }
    };

    const handleDeleteCredential = async (id) => {
        try {
            await deleteCredential(workspaceId, id);
            setCredentials(prev => prev.filter(c => c.id !== id));
            toast.success("Credential deleted");
        } catch (error) {
            toast.error("Failed to delete credential");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-sm font-mono animate-pulse">Initializing Flowgenix...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full w-full flex-col p-0">
            <Tabs defaultValue="chat" className="flex-1 flex flex-col w-full rounded-none">
                <TabsList className="w-full h-12 border-b border-border bg-card/30 p-0 grid grid-cols-4 rounded-none">
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
                </TabsList>

                <div className="flex-1 p-2">
                    <TabsContent value="chat" className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden flex flex-col h-[86vh]">
                        <div className="flex-1 overflow-hidden rounded-xl border border-border bg-card/50 shadow-2xl shadow-primary/5">
                            <ChatPanel config={config} ragDocs={docs} userId={userId} workspaceId={workspaceId} />
                        </div>
                    </TabsContent>

                    <TabsContent value="setup" className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden h-[86vh]">
                        <ScrollArea className="h-full w-full">
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 p-4">
                                <div className="space-y-6">
                                    <div className="rounded-xl border border-border bg-card/50 p-6 lg:col-span-2">
                                        <h2 className="mb-6 font-mono text-xs text-primary/80 flex items-center gap-2">
                                            <span className="h-1 w-1 rounded-full bg-primary" /> Models (Auto-Optimized)
                                        </h2>
                                        <ModelsManager config={config} onChange={setConfig} userId={userId} />
                                    </div>
                                    <CredentialList credentials={credentials} loading={credsLoading} onDelete={handleDeleteCredential} />
                                </div>
                                <div className="space-y-6">
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
                            </div>
                        </ScrollArea>
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
                            userId={userId}
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
