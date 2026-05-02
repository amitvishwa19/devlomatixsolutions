'use client'

import { useState, useEffect, useCallback } from "react";
import { WorkflowList } from "../canvas/WorkflowList";
import { WorkflowModal } from "../canvas/WorkflowModal";
import { toast } from "sonner";
import { listWorkflows, createWorkflow, deleteWorkflow, executeWorkflowAction } from "../../_actions/workflows/actions";
import { Loader2 } from "lucide-react";

export function WorkflowTab({ workspaceId, userId, onRefreshRuns }) {
    const [workflows, setWorkflows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedWorkflow, setSelectedWorkflow] = useState(null);
    const [isCanvasOpen, setIsCanvasOpen] = useState(false);

    const loadWorkflows = useCallback(async () => {
        if (!workspaceId) return;
        setLoading(true);
        try {
            const data = await listWorkflows(workspaceId);
            setWorkflows(data || []);
        } catch (error) {
            console.error("loadWorkflows error:", error);
            toast.error("Failed to load workflows");
        } finally {
            setLoading(false);
        }
    }, [workspaceId]);

    useEffect(() => {
        loadWorkflows();
    }, [loadWorkflows]);

    const handleCreateWorkflow = async () => {
        if (!userId) {
            toast.error("User session not found");
            return;
        }
        try {
            const newWf = await createWorkflow(workspaceId, userId, {
                name: "New Workflow",
                nodes: [],
                edges: [],
                scheduleCron: "0 * * * *",
                scheduleEnabled: false
            });
            setWorkflows(prev => [newWf, ...prev]);
            setSelectedWorkflow(newWf);
            setIsCanvasOpen(true);
            toast.success("Workflow created");
        } catch (error) {
            toast.error("Failed to create workflow");
        }
    };

    const handleDeleteWorkflow = async (id) => {
        if (!confirm("Are you sure?")) return;
        try {
            await deleteWorkflow(workspaceId, id);
            setWorkflows(prev => prev.filter(w => w.id !== id));
            toast.success("Workflow deleted");
        } catch (error) {
            toast.error("Failed to delete workflow");
        }
    };

    const handleExecuteWorkflow = async (id) => {
        try {
            toast.info("Starting execution...");
            await executeWorkflowAction({ workflowId: id, workspaceId, userId });
            toast.success("Execution started");
            if (onRefreshRuns) onRefreshRuns();
        } catch (error) {
            toast.error("Execution failed");
        }
    };

    if (loading && workflows.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-6 w-6 animate-spin text-primary/50" />
            </div>
        );
    }

    return (
        <div className="h-full">
            <WorkflowList 
                workflows={workflows}
                onEdit={(wf) => {
                    setSelectedWorkflow(wf);
                    setIsCanvasOpen(true);
                }}
                onCreate={handleCreateWorkflow}
                onDelete={handleDeleteWorkflow}
                onExecute={handleExecuteWorkflow}
            />

            <WorkflowModal 
                open={isCanvasOpen} 
                onOpenChange={(open) => {
                    setIsCanvasOpen(open);
                    if (!open) loadWorkflows(); // Refresh list when closing modal to show updated names/schedules
                }} 
                workflow={selectedWorkflow} 
                userId={userId} 
            />
        </div>
    );
}
