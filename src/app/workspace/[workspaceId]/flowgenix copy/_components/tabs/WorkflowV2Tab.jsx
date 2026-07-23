"use client";

import { GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function WorkflowV2Tab({ workspaceId, userId }) {
    const router = useRouter();

    return (
        <div className="h-full w-full flex items-center justify-center bg-muted/5">
            <div className="flex flex-col items-center gap-6 text-center max-w-md p-12 rounded-3xl border-2 border-dashed bg-card/50">
                <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center rotate-12 group hover:rotate-0 transition-transform duration-500">
                    <GitBranch className="h-10 w-10 text-primary" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight">Workflow Engine v2</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        A complete replication of the n8n architecture. Modular nodes, item-based processing, and dynamic expressions.
                    </p>
                </div>
                <Button 
                    onClick={() => router.push(`/workspace/${workspaceId}/flowgenix/v2`)}
                    size="lg" 
                    className="h-12 px-8 rounded-xl font-bold shadow-lg hover:scale-105 transition-all"
                >
                    Launch V2 Editor
                </Button>
            </div>
        </div>
    );
}
