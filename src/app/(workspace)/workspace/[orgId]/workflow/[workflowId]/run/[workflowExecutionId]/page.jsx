import React, { Suspense } from 'react'
import WorkflowTopbar from '../../../_components/topbar/WorkflowTopbar'
import { Loader2Icon } from 'lucide-react'
import { GetWorkflowExecutionWithPhase } from '../../../_actions/get-workflow-execution-with-phase'
import ExecutionViewer from './_components/ExecutionViewer'


export default function WorkflowExecutionRunPage({ params }) {
    return (
        <div className='flex flex-col w-full h-full  overflow-hidden'>

            <WorkflowTopbar
                workflowId={params.workflowId}
                title='Workflow run details'
                subtitle={`Run Id: ${params.workflowExecutionId}`}
                hideButtons={true}
            />
            {/* {JSON.stringify(params)} */}
            <section>
                <Suspense fallback={
                    <div>
                        <Loader2Icon size={20} className='h-10 w-10 animate-spin' />
                    </div>
                }>
                    <ExecutionViewerWrapper executionId={params.workflowExecutionId} />
                </Suspense>
            </section>

        </div>
    )
}

async function ExecutionViewerWrapper({ executionId }) {

    const workflowExecution = await GetWorkflowExecutionWithPhase(executionId)
    return <pre>
        {/* {JSON.stringify(workflowExecution, null, 4)} */}
        <ExecutionViewer initialData={workflowExecution} />
    </pre>
}
