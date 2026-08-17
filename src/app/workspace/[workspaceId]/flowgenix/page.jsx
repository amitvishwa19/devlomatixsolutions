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
import { OmniRouteDashboard } from "./_components/OmniRouteDashboard";

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
                    <p className="text-xs font-mono animate-pulse uppercase tracking-widest">Initialising FLowGenix AI Gateway...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[92vh] overflow-hidden">
            <OmniRouteDashboard workspaceId={workspaceId} userId={userId} />
        </div>
    );
}
