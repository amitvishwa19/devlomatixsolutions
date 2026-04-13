import React from 'react'
import { db } from '@/lib/db'
import WorkflowCanvas from '../_components/WorkflowCanvas'
import { redirect } from 'next/navigation'

export default async function WorkflowIdPage({ params }) {
    const { workflowId, workspaceId } = await params

    if (workflowId === "new") {
        return (
            <div className='flex h-[calc(100vh-145px)] w-full overflow-hidden bg-background relative'>
                <WorkflowCanvas 
                    workflowId="new"
                    initialName="New Workflow"
                    loadedNodes={[]}
                    loadedEdges={[]}
                />
            </div>
        )
    }

    const workflow = await db.workflow.findUnique({
        where: {
            id: workflowId
        }
    })

    if (!workflow) {
        return redirect(`/workspace/${workspaceId}/flowbyte`)
    }

    return (
        <div className='flex h-[calc(100vh-145px)] w-full overflow-hidden bg-background relative'>
            <WorkflowCanvas 
                workflowId={workflow.id}
                initialName={workflow.name}
                loadedNodes={workflow.nodes || []}
                loadedEdges={workflow.edges || []}
            />
        </div>
    )
}
