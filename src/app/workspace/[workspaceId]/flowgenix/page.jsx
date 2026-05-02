"use client";

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
import { useSession } from "next-auth/react";

// Components
import { ChatPanel } from "./_components/chat/ChatPanel";
import { RunListTab } from "./_components/tabs/RunListTab";
import { CredentialListTab } from "./_components/tabs/CredentialListTab";
import { WorkflowTab } from "./_components/tabs/WorkflowTab";
import { SetupTab } from "./_components/tabs/SetupTab";

export default function FlowgenixDashboard() {
    const { data: session, status: sessionStatus } = useSession();
    const params = useParams();
    const workspaceId = params?.workspaceId;
    const userId = session?.user?.userId;

    if (sessionStatus === "loading") {
        return (
            <div className="flex items-center justify-center h-screen bg-background text-foreground">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-xs font-mono animate-pulse uppercase tracking-widest">Initialising FlowGenix...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[92vh] overflow-hidden p-2">
            <Tabs defaultValue="chat" className="flex flex-col h-full bg-card/20 border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-6 py-2 border-b border-border/50 bg-card/30">
                    <div className="flex items-center gap-2">
                        <h1 className="text-sm font-bold tracking-tight uppercase">FlowGenix</h1>
                    </div>

                    <TabsList className="bg-muted/50 p-1 rounded-lg border border-border/50">
                        <TabsTrigger value="chat" className="gap-2 font-medium text-xs px-4 rounded-md">
                            <MessageSquare className="h-3.5 w-3.5" /> Chat with AI Agent
                        </TabsTrigger>
                        <TabsTrigger value="workflow" className="gap-2 font-medium text-xs px-4 rounded-md">
                            <WorkflowIcon className="h-3.5 w-3.5" /> Workflows
                        </TabsTrigger>
                        <TabsTrigger value="history" className="gap-2 font-medium text-xs px-4 rounded-md">
                            <History className="h-3.5 w-3.5" /> Executions
                        </TabsTrigger>
                        <TabsTrigger value="setup" className="gap-2 font-medium text-xs px-4 rounded-md">
                            <Settings2 className="h-3.5 w-3.5" /> Setup
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* Content Section */}
                <div className="flex-1 min-h-0 relative">
                    <TabsContent value="chat" className="h-full mt-0 data-[state=inactive]:hidden">
                        <ChatPanel
                            userId={userId}
                            workspaceId={workspaceId}
                        />
                    </TabsContent>

                    <TabsContent value="workflow" className="h-full mt-0 data-[state=inactive]:hidden p-4">
                        <WorkflowTab
                            workspaceId={workspaceId}
                            userId={userId}
                        />
                    </TabsContent>

                    <TabsContent value="history" className="h-full mt-0 data-[state=inactive]:hidden p-4">
                        <RunListTab
                            workspaceId={workspaceId}
                        />
                    </TabsContent>

                    <TabsContent value="setup" className="h-full mt-0 data-[state=inactive]:hidden">
                        <SetupTab
                            workspaceId={workspaceId}
                            userId={userId}
                        />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
