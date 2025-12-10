'use client'
import React from 'react'
import ExecuteButton from './ExecuteButton'
import { Button } from '@/components/ui/button'
import { useAction } from '@/hooks/use-action'
import { saveWorkflow } from '../../_actions/save-workflow'
import { toast } from 'sonner'
import { ChevronLeftIcon, Loader, RocketIcon, Save } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useReactFlow } from '@xyflow/react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import PublishButton from './PublishButton'
import UnpublishButton from './UnpublishButton '
import { useMutation } from '@tanstack/react-query'
import { UpdateWorkflow } from '../../_actions/update-workflow'
import SaveButton from './SaveButton'


export default function workflowWorkflowTopbar({ title, subtitle, workflowId, hideBUttons = false, defination, isPublished = false }) {
    const router = useRouter()
    const { data: session } = useSession()
    const { orgId } = useParams()

    return (
        <div className='flex items-center justify-between p-2 border-b-violet-200 bg-green-100/10'>


            {/* <div className='flex items-center'>
                <Button variant='outline' onClick={() => { router.back() }} className='mr-2 p-2'>
                    <ChevronLeftIcon size={20} />
                </Button>
                <div>
                    <p className='font-bold text-ellipsis truncate'>{title}</p>
                    {subtitle &&
                        <p className='text-xs  text-muted-foreground truncate text-ellipsis'>{subtitle}</p>
                    }
                </div>
            </div> */}


            <div>

                <div className='flex items-center'>
                    <Button variant='ghost' onClick={() => { router.back() }} className='mr-2 p-2'>
                        <ChevronLeftIcon size={20} />
                    </Button>
                    <div>
                        <p className='font-bold text-ellipsis truncate'>{title}</p>
                        {subtitle &&
                            <p className='text-xs  text-muted-foreground truncate text-ellipsis'>{subtitle}</p>
                        }
                    </div>
                </div>

            </div>


            {/* <SaveButton userId={session.user.userId} workflowId={workflowId} defination={defination} orgId={orgId} /> */}

            <div>
                {!hideBUttons === false && (
                    <div className='flex items-center gap-2 justify-end'>
                        <RunsButtion workflowId={workflowId} orgId={orgId} />
                        <ExecuteButton workflowId={workflowId} />
                        {/* <Button
                            size='sm'
                            className='bg-blue-600 hover:bg-blue-800 text-white '
                            onClick={() => { handleSaveWOrkflow() }}

                            disabled={isLoading}
                        >
                            {isLoading ? <Loader size={16} className='mr-2 animate-spin' /> : <Save size={16} className='mr-2' />}


                            Save
                        </Button> */}
                        {isPublished && (
                            <UnpublishButton userId={session?.user?.userId} workflowId={workflowId} defination={defination} orgId={orgId} />
                        )}
                        {!isPublished && (
                            <div className='flex items-center gap-2'>
                                <SaveButton userId={session?.user?.userId} workflowId={workflowId} defination={defination} orgId={orgId} />
                                <PublishButton userId={session?.user?.userId} workflowId={workflowId} defination={defination} orgId={orgId} />
                            </div>
                        )}
                    </div>
                )}
            </div>

        </div>
    )
}

function SaveButtonOld({ userId, workflowId, defination, orgId }) {

    //console.log('@@ New save button', workflowId)
    const { toObject } = useReactFlow()

    // const { execute, isLoading } = useAction(saveWorkflow, {
    //     onSuccess: (data) => {
    //         //console.log('data', data)
    //         // handleOnOpenChange()
    //         toast.success(`Workflow ${data?.name} saved successfully`)
    //         //router.push(`/workspace/${orgId}/workflow/${data.id}`)
    //     },
    //     onError: (error) => {
    //         toast.error(error)
    //     }
    // })

    // const handleSaveWOrkflow = () => {
    //     //console.log('@@defination,', defination)
    //     console.log('@@toObject', toObject())
    //     execute({ userId, workflowId, defination, orgId })

    //     //console.log(defination)
    // }

    const saveMutation = useMutation({
        mutationFn: UpdateWorkflow,
        onSuccess: (data) => {
            console.log('@@ save mutation success')
            toast.success(`Workflow ${data?.name} saved successfully`, { id: 'save-workflow' })
        },
        onError: () => {
            console.log('@@ save mutation error')
        }
    })

    return (
        <div className='flex items-center gap-2 justify-end '>
            <Button
                size='sm'
                className='bg-blue-600 hover:bg-blue-800 text-white '
                onClick={() => {
                    const workflowDefinition = JSON.stringify(toObject())
                    toast.loading("Saving workflow...", { id: 'save-workflow' })
                    saveMutation.mutate({
                        userId,
                        workflowId,
                        defination: workflowDefinition,
                    })

                }}

                disabled={saveMutation.isPending}
            >
                {saveMutation.isPending ? <Loader size={16} className='mr-2 animate-spin' /> : <Save size={16} className='mr-2' />}


                Save Workflow
            </Button>
        </div>
    )
}

function RunsButtion({ workflowId, orgId }) {

    return (
        <Link href={`/workspace/${orgId}/workflow/${workflowId}/run`}>
            <Button
                size='sm'
                className='bg-blue-600 hover:bg-blue-800 text-white '
            >
                <RocketIcon size={16} className='mr-2 ' />
                Runs
            </Button>
        </Link>

    )
}

