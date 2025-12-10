import React from 'react'
import FlowEditor from '../_components/FlowEditor'
import { db } from '@/lib/db'
import { ReactFlowProvider } from '@xyflow/react'
import TaskMenu from '../_components/TaskMenu'
import { FlowValidationContextProvider } from '../_context/FlowValidationContext'
//import { ReactFlowProvider } from 'reactflow'

export default async function WorkflowIdPage({ params }) {
    const { workflowId, orgId } = params
    console.log(workflowId)

    const workflow = await db.workflow.findUnique({
        where: {
            id: workflowId
        }
    })

    return (

        <div className='h-full w-full  flex'>


            <div className='h-full w-full'>

                <div className=' flex-1 h-full'>
                    <FlowValidationContextProvider>
                        <ReactFlowProvider>
                            <FlowEditor workflow={workflow} />
                        </ReactFlowProvider>
                    </FlowValidationContextProvider>
                </div>
            </div>
        </div>

    )
}
