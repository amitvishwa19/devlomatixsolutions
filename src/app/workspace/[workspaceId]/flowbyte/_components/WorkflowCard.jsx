'use client'

import React from 'react'
import Link from 'next/link'
import { Clock, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useModal } from '@/hooks/useModal'
import { useAuth } from '@/providers/AuthProvider'

const statusColors = {
    active: "bg-n8n-success/15 text-n8n-success",
    error: "bg-destructive/15 text-destructive",
    inactive: "bg-muted text-muted-foreground",
    draft: "bg-n8n-warning/15 text-n8n-warning",
};

export default function WorkflowCard({ workflow, workspaceId }) {
    const { onOpen } = useModal()
    const { user } = useAuth()
    const nodeCount = Array.isArray(workflow.nodes) ? workflow.nodes.length : 0;
    const status = workflow.status?.toLowerCase() || 'draft';

    return (
        <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border hover:border-primary/30 hover:shadow-sm transition-all group">
            <Link 
                href={`/workspace/${workspaceId}/flowbyte/${workflow.id}`} 
                className="flex items-center gap-4 flex-1 min-w-0"
            >
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${status === "active" ? "bg-n8n-success" : status === "error" ? "bg-destructive" : "bg-muted-foreground/40"}`} />
                <div className="min-w-0">
                    <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                        {workflow.name}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[status] || statusColors.draft}`}>
                            {status.toUpperCase()}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {new Date(workflow.updatedAt).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-muted-foreground">{nodeCount} nodes</span>
                    </div>
                </div>
            </Link>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onOpen("deleteWorkFLow", { workflow, workspaceId, userId: user?.id })
                    }}
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </Button>
            </div>
        </div>
    );
}
