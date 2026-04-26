"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    MessageSquare,
    Settings,
    Workflow as WorkflowIcon,
    History,
    KeyRound,
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

import { toast } from "sonner";

export default function FlowgenixDashboard() {
    const params = useParams();
    const workspaceId = params?.workspaceId;
    const userId = "cmo6yh2uq0000m4ik3bo51ghc"; // Default fallback user ID for demo

    const [config, setConfig] = useState(null);
    const [docs, setDocs] = useState([]);
    const [mainWorkflow, setMainWorkflow] = useState(null);
    const [runs, setRuns] = useState([]);
    const [credentials, setCredentials] = useState([]);

    const [loading, setLoading] = useState(true);
    const [runsLoading, setRunsLoading] = useState(false);
    const [credsLoading, setCredsLoading] = useState(false);

    useEffect(() => {
        init();
    }, [workspaceId]);

    const init = async () => {
        setLoading(true);
        try {
            const [c, d, w] = await Promise.all([
                getOrCreateAgentConfig(workspaceId, userId),
                listRagDocs(workspaceId),
                getOrCreateMainWorkflow(workspaceId, userId)
            ]);
            setConfig(c);
            setDocs(d);
            setMainWorkflow(w);
        } catch (error) {
            toast.error("Failed to load dashboard data");
        } finally {
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

    if (loading) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-background/50 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="h-12 w-12 rounded-full border-t-2 border-primary animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <WorkflowIcon className="h-5 w-5 text-primary/50" />
                        </div>
                    </div>
                    <p className="font-mono text-xs text-muted-foreground animate-pulse uppercase tracking-widest">Initialising Flowgenix Engine...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full w-full flex-col p-0">
            <Tabs defaultValue="chat" className="flex-1 flex flex-col w-full rounded-none">
                <TabsList className="w-full h-12 border-b border-border bg-card/30 p-0 grid grid-cols-5 rounded-none">
                    <TabsTrigger value="chat" className="h-12 rounded-none border-b-2 border-transparent px-0 text-sm transition-all data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:text-primary hover:text-foreground/80 shadow-none bg-transparent">
                        <MessageSquare className="h-3.5 w-3.5 mr-2" /> Chat
                    </TabsTrigger>
                    <TabsTrigger value="setup" className="h-12 rounded-none border-b-2 border-transparent px-0 text-sm transition-all data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:text-primary hover:text-foreground/80 shadow-none bg-transparent">
                        <Settings className="h-3.5 w-3.5 mr-2" /> Setup
                    </TabsTrigger>
                    <TabsTrigger value="workflow" className="h-12 rounded-none border-b-2 border-transparent px-0 text-sm transition-all data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:text-primary hover:text-foreground/80 shadow-none bg-transparent">
                        <WorkflowIcon className="h-3.5 w-3.5 mr-2" /> Workflow
                    </TabsTrigger>
                    <TabsTrigger value="runs" onClick={loadRuns} className="h-12 rounded-none border-b-2 border-transparent px-0 text-sm transition-all data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:text-primary hover:text-foreground/80 shadow-none bg-transparent">
                        <History className="h-3.5 w-3.5 mr-2" /> Runs
                    </TabsTrigger>
                    <TabsTrigger value="credentials" onClick={loadCredentials} className="h-12 rounded-none border-b-2 border-transparent px-0 text-sm transition-all data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:text-primary hover:text-foreground/80 shadow-none bg-transparent">
                        <KeyRound className="h-3.5 w-3.5 mr-2" /> Credentials
                    </TabsTrigger>
                </TabsList>

                <div className="flex-1 p-2">
                    <TabsContent value="chat" className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden flex flex-col h-[86vh]">
                        <div className="flex-1 overflow-hidden rounded-xl border border-border bg-card/50 shadow-2xl shadow-primary/5">
                            <ChatPanel config={config} ragDocs={docs} userId={userId} />
                        </div>
                    </TabsContent>

                    <TabsContent value="setup" className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden overflow-auto h-[86vh]">
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 p-4">
                            <div className="rounded-xl border border-border bg-card/50 p-6 lg:col-span-2">
                                <h2 className="mb-6 font-mono text-xs text-primary/80 flex items-center gap-2">
                                    <span className="h-1 w-1 rounded-full bg-primary" /> Models & Routing
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



                    <TabsContent value="credentials" className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden h-[86vh] p-4">
                        <CredentialList
                            credentials={credentials}
                            loading={credsLoading}
                            onRefresh={loadCredentials}
                            onAdd={() => { }}
                            onDelete={handleDeleteCredential}
                        />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
