'use client'

import React, { useEffect, useState } from 'react'
import { Plus, Search, Loader2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { getWorkflow } from './_actions/get-workflows'
import { useAction } from '@/hooks/use-action'
import { toast } from 'sonner'
import { useAuth } from '@/providers/AuthProvider'
import { useModal } from '@/hooks/useModal'
import WorkflowCard from './_components/WorkflowCard'
import TemplateGallery from './_components/TemplateGallery'
import CreateWorkflowModal from './_components/CreateWorkflowModal'
import { saveWorkflowAction } from './_actions/workflow-mgmt'

export default function WorkflowsPage() {
    const { data: session } = useSession()
    const { user } = useAuth()
    const router = useRouter()
    const { workspaceId } = useParams()
    const [workflows, setWorkflows] = useState([])
    const [search, setSearch] = useState("");
    const [showTemplates, setShowTemplates] = useState(false);
    const { onOpen, isOpen } = useModal()

    const userId = user?.id || session?.user?.userId;

    const { execute, isLoading } = useAction(getWorkflow, {
        onSuccess: (data) => {
            setWorkflows(data || [])
        },
        onError: (error) => {
            toast.error(error)
        }
    })

    useEffect(() => {
        if (userId) {
            execute({ userId, workspaceId })
        }
    }, [userId, workspaceId, isOpen])

    const filtered = workflows.filter((wf) =>
        wf.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleLoadTemplate = async (name, nodes, edges) => {
        try {
            const res = await saveWorkflowAction({
                name,
                nodes,
                edges,
                workspaceId,
                userId
            });
            if (res.error) throw new Error(res.error);
            toast.success(`Created workflow from template: ${name}`);
            router.push(`/workspace/${workspaceId}/flowbyte/${res.data.id}`);
        } catch (err) {
            toast.error("Failed to create from template: " + err.message);
        }
    };

    return (
        <div className="p-6 ">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Workflows</h1>
                    <p className="text-sm text-muted-foreground mt-1">{workflows.length} workflows</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="gap-2" onClick={() => setShowTemplates(true)}>
                        <BookOpen className="h-4 w-4" />
                        Templates
                    </Button>
                    <Button
                        className="gap-2"
                        onClick={() => onOpen("createWorkFLow", { workspaceId, userId })}
                    >
                        <Plus className="h-4 w-4" />
                        Add Workflow
                    </Button>
                </div>
            </div>

            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search workflows..."
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
            </div>

            {isLoading && workflows.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <p className="text-sm">{search ? "No workflows match your search" : "No workflows yet. Create your first one!"}</p>
                </div>
            ) : (
                <div className="grid gap-3">
                    {filtered.map((wf) => (
                        <WorkflowCard key={wf.id} workflow={wf} workspaceId={workspaceId} />
                    ))}
                </div>
            )}

            {showTemplates && (
                <TemplateGallery 
                    onClose={() => setShowTemplates(false)} 
                    onLoadTemplate={handleLoadTemplate}
                />
            )}

            <CreateWorkflowModal />
        </div>
    );
}
