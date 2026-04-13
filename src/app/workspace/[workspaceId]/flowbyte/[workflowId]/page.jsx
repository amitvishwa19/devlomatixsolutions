import React from 'react'
import { db } from '@/lib/db'
import { ReactFlowProvider } from '@xyflow/react'
import FlowEditor from '../_components/FlowEditor'
import TaskMenu from '../_components/TaskMenu'
import { FlowValidationContextProvider } from '../_context/FlowValidationContext'
import { redirect } from 'next/navigation'

export default async function WorkflowIdPage({ params }) {
    const { workflowId, workspaceId } = await params

    const workflow = await db.workflow.findUnique({
        where: {
            id: workflowId
        }
    })

    if (!workflow) {
        return redirect(`/workspace/${workspaceId}/flowbyte`)
    }

    return (
        <div className='flex h-[calc(100vh-64px)] w-full overflow-hidden bg-background'>
            <FlowValidationContextProvider>
                <ReactFlowProvider>
                    <TaskMenu />
                    <div className='flex-1 h-full relative'>
                        <FlowEditor workflow={workflow} />
                    </div>
                </ReactFlowProvider>
            </FlowValidationContextProvider>
        </div>
    )
}
