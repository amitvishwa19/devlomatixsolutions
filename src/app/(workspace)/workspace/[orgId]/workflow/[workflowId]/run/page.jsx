import React, { Suspense } from 'react'
import Topbar from './_component/Topbar'
import { GetWorkflowExecutions } from './_actions/get-workflow-executions'
import { InboxIcon, Loader2 } from 'lucide-react'
import { WaitFor } from '../../_lib/waitFor'
import { ExecutionTable } from './_component/ExecutionTable'

export default function WorkflowIdRun({ params }) {

    //console.log('@@params', params)

    return (
        <div className='flex flex-col w-full h-full overflow-hidden'>
            <Topbar />
            <Suspense fallback={
                <div className='flex h-full w-full items-center justify-center'>
                    <Loader2 size={20} className='animate-spin stroke-primary' />
                </div>
            }>
                <ExecutionTableWrapper workflowId={params.workflowId} />
            </Suspense>
        </div>
    )
}


async function ExecutionTableWrapper({ workflowId }) {

    const executions = await GetWorkflowExecutions(workflowId)

    if (!executions) {
        return <div>No data found</div>
    }
    if (executions.length === 0) {
        return (
            <div className='container w-full h-full py-6'>
                <div className='flex flex-col items-center justify-center gap-2'>
                    <div className='rounded-full bg-accent h-20 w-20 flex items-center justify-center'>
                        <InboxIcon size={40} className='stroke-primary' />
                    </div>
                    <div className='flex flex-col gap-1 text-center'>
                        <p className='font-bold'>No Runs is triggred for this workflow</p>
                        <p className='text-xs text-muted-foreground'>You can trigger new run from editor page</p>
                    </div>
                </div>

            </div>
        )
    }
    return (
        <ExecutionTable initialData={executions} workflowId={workflowId} />
    )
}

