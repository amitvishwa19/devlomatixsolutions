'use client'

import { useState, useEffect, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ModelsManager } from "../setup/ModelsManager";
import { AgentSettings } from "../setup/AgentSettings";
import { RagPanel } from "../setup/RagPanel";
import { getOrCreateAgentConfig, listRagDocs } from "../../_actions/setup/actions";
import { Loader2 } from "lucide-react";

export function SetupTab({ workspaceId, userId }) {
    const [config, setConfig] = useState(null);
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        if (!workspaceId || !userId) return;
        setLoading(true);
        try {
            const [cfg, ragDocs] = await Promise.all([
                getOrCreateAgentConfig(workspaceId, userId),
                listRagDocs(workspaceId)
            ]);
            setConfig(cfg);
            setDocs(ragDocs);
        } catch (error) {
            console.error("SetupTab load error:", error);
        } finally {
            setLoading(false);
        }
    }, [workspaceId, userId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    if (loading && !config) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-6 w-6 animate-spin text-primary/50" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-4">
            <ModelsManager 
                config={config} 
                workspaceId={workspaceId} 
                userId={userId} 
                onChange={loadData}
            />
            <AgentSettings 
                config={config} 
                workspaceId={workspaceId} 
                userId={userId} 
                onUpdate={loadData} 
            />
            <RagPanel 
                docs={docs} 
                workspaceId={workspaceId} 
                onRefresh={loadData} 
            />
        </div>
    );
}
