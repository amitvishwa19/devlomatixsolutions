'use client'

import { useState, useEffect, useCallback } from "react";
import { WorkflowList } from "../canvas/WorkflowList";
import { WorkflowModal } from "../canvas/WorkflowModal";
import { toast } from "sonner";
import { listWorkflows, createWorkflow, deleteWorkflow, executeWorkflowAction } from "../../_actions/workflows/actions";
import { Loader2 } from "lucide-react";

import { 
    AlertDialog, 
    AlertDialogAction, 
    AlertDialogCancel, 
    AlertDialogContent, 
    AlertDialogDescription, 
    AlertDialogFooter, 
    AlertDialogHeader, 
    AlertDialogTitle, 
} from "@/components/ui/alert-dialog";

export function WorkflowTab({ workspaceId, userId, onRefreshRuns }) {
    const [workflows, setWorkflows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedWorkflow, setSelectedWorkflow] = useState(null);
    const [isCanvasOpen, setIsCanvasOpen] = useState(false);
    
    // Delete states
    const [workflowToDelete, setWorkflowToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

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

    const confirmDelete = async () => {
        if (!workflowToDelete) return;
        setIsDeleting(true);
        try {
            await deleteWorkflow(workspaceId, workflowToDelete.id);
            setWorkflows(prev => prev.filter(w => w.id !== workflowToDelete.id));
            toast.success("Workflow deleted");
            setWorkflowToDelete(null);
        } catch (error) {
            toast.error("Failed to delete workflow");
        } finally {
            setIsDeleting(false);
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
                onDelete={(wf) => setWorkflowToDelete(wf)}
                onExecute={handleExecuteWorkflow}
            />

            <WorkflowModal 
                open={isCanvasOpen} 
                onOpenChange={(open) => {
                    setIsCanvasOpen(open);
                    if (!open) loadWorkflows(); // Refresh list when closing modal
                }} 
                workflow={selectedWorkflow} 
                userId={userId} 
            />

            <AlertDialog open={!!workflowToDelete} onOpenChange={(open) => !open && setWorkflowToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the workflow
                            <span className="font-semibold text-foreground mx-1">"{workflowToDelete?.name}"</span>
                            and all its configuration.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={(e) => {
                                e.preventDefault();
                                confirmDelete();
                            }}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            {isDeleting ? "Deleting..." : "Delete Workflow"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
