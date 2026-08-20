'use client'
import { Plus, Search, Clock, Trash2, Loader2, BookOpen, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getWorkflow } from "./_actions/get-workflows";
import { deleteWorkflow } from "./_actions/delete-workflow";
import { toast } from "sonner";
import TemplateGallery from "./_components/TemplateGallery";
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

const statusColors = {
    ACTIVE: "bg-emerald-500/15 text-emerald-500",
    ERROR: "bg-destructive/15 text-destructive",
    INACTIVE: "bg-muted text-muted-foreground",
    DRAFT: "bg-amber-500/15 text-amber-500",
};

export default function Index() {
    const { workspaceId } = useParams();
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [showTemplates, setShowTemplates] = useState(false);
    const [workflows, setWorkflows] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteId, setDeleteId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchWorkflows = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await getWorkflow({ workspaceId });
            if (res.data) {
                setWorkflows(res.data);
            } else if (res.error) {
                toast.error(res.error);
            }
        } catch (error) {
            toast.error("Failed to fetch workflows");
        } finally {
            setIsLoading(false);
        }
    }, [workspaceId]);

    useEffect(() => {
        fetchWorkflows();
    }, [fetchWorkflows]);

    const handleDelete = (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            const res = await deleteWorkflow({ workflowId: deleteId, workspaceId });
            if (res.data) {
                toast.success("Workflow deleted");
                fetchWorkflows();
            } else if (res.error) {
                toast.error(res.error);
            }
        } catch (error) {
            toast.error("Failed to delete workflow");
        } finally {
            setIsDeleting(false);
            setDeleteId(null);
        }
    };

    const filtered = workflows.filter((wf) =>
        wf.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Workflows</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {isLoading ? "..." : (workflows?.length || 0)} workflows
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-9 gap-2" onClick={fetchWorkflows} disabled={isLoading}>
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button variant="outline" size="sm" className="h-9 gap-2" onClick={() => setShowTemplates(true)}>
                        <BookOpen className="h-4 w-4" />
                        Templates
                    </Button>
                    <Link href={`/workspace/${workspaceId}/flowbyte/new`}>
                        <Button size="sm" className="h-9 gap-2">
                            <Plus className="h-4 w-4" />
                            Add Workflow
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search workflows..."
                    className="w-full h-10 pl-10 pr-4 py-2.5 text-sm border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-xl bg-muted/10">
                    <p className="text-sm">{search ? "No workflows match your search" : "No workflows yet. Create your first one!"}</p>
                </div>
            ) : (
                <div className="grid gap-3">
                    {filtered.map((wf) => {
                        const nodeCount = Array.isArray(wf.nodes) ? wf.nodes.length : 0;
                        const status = wf.status || "DRAFT";
                        return (
                            <div key={wf.id} className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:border-primary/30 hover:shadow-md transition-all group relative overflow-hidden">
                                <Link 
                                    href={`/workspace/${workspaceId}/flowbyte/${wf.id}`} 
                                    className="flex items-center gap-4 flex-1 min-w-0 z-10"
                                >
                                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${status === "ACTIVE" ? "bg-emerald-500" : status === "ERROR" ? "bg-destructive" : "bg-muted-foreground/40"}`} />
                                    <div className="min-w-0">
                                        <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">{wf.name}</h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${statusColors[status] || statusColors.DRAFT}`}>
                                                {status}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {new Date(wf.updatedAt).toLocaleDateString()}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground font-medium">{nodeCount} nodes</span>
                                        </div>
                                    </div>
                                </Link>

                                <div className="flex items-center gap-1 z-10">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all duration-200"
                                        onClick={(e) => handleDelete(e, wf.id)}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {showTemplates && (
                <TemplateGallery 
                    onClose={() => setShowTemplates(false)} 
                    onLoadTemplate={(name, nodes, edges) => {
                        console.log("Loading template:", name);
                        toast.info("Create a new workflow first to apply this template");
                        setShowTemplates(false);
                    }} 
                />
            )}

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && !isDeleting && setDeleteId(null)}>
                <AlertDialogContent className="sm:max-w-[425px] bg-card/95 backdrop-blur-2xl border-destructive/20 shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-lg font-bold text-destructive flex items-center gap-2">
                            <Trash2 className="w-5 h-5 text-destructive shrink-0" />
                            <span>Delete Workflow</span>
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-xs font-medium text-muted-foreground mt-2">
                            Are you sure you want to delete this workflow? This action cannot be undone and will permanently remove all execution logs and node configurations.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 sm:gap-0 mt-4">
                        <AlertDialogCancel disabled={isDeleting} className="rounded-md font-bold">Cancel</AlertDialogCancel>
                        <Button 
                            variant="destructive" 
                            onClick={confirmDelete}
                            disabled={isDeleting}
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-md font-bold flex items-center gap-2"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete Workflow"
                            )}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
