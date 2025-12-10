'use client'
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useModal } from '@/hooks/useModal'
import { InboxIcon } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'
import { getWorkflow } from './_actions/get-workflows'
import { useAction } from '@/hooks/use-action'
import { toast } from 'sonner'
import WorkflowCard from './_components/WorkflowCard'
//import { db } from '@/lib/db'

export default function WorkflowPage() {


    const { data: session } = useSession()
    const { orgId } = useParams()
    const [workflows, setWorkflows] = useState([])
    const { onOpen, onClose, isOpen, type, data } = useModal()

    const { execute } = useAction(getWorkflow, {
        onSuccess: (data) => {
            console.log('data', data)
            setWorkflows(data)
        },
        onError: (error) => {
            toast.error(error)
        }
    })

    useEffect(() => {
        execute({ orgId, userId: session?.user?.userId })
        //getWorkflowsData()
    }, [session, isOpen])


    // const getWorkflowsData = async () => {
    //     const workflows = await db.workflow.findMany()
    //     console.log(workflows)
    // }


    return (
        <div className='p-2 flex flex-1 flex-col h-full w-full'>

            <div className='mb-2 '>
                <div className='flex items-center justify-between'>
                    <div>
                        <h3 className="text-md font-medium">Workflows</h3>
                        <p className="text-xs text-muted-foreground mb-4">
                            Manage your workflows
                        </p>
                    </div>
                    <div className='flex items-center  gap-4 mr-2'>

                        <Button size='sm' role='button' onClick={() => { onOpen("createWorkFLow", { orgId, userId: session.user.userId }) }} className='bg-blue-600 hover:bg-blue-800 text-white'>
                            Create Workflow
                        </Button>


                    </div>
                </div>
                <Separator />
            </div>

            {
                workflows.length > 0 ? (
                    <div className='flex flex-col gap-2'>
                        {
                            workflows.map((workflow, index) => {
                                //console.log(workflow)
                                return (
                                    <WorkflowCard key={workflow.id} workflow={workflow} orgId={orgId} />
                                )
                            })
                        }
                    </div>
                ) : (
                    <div className='flex flex-1 flex-col gap-4 h-full items-center justify-center'>
                        <div className=' rounded-full bg-accent w-20 h-20 flex items-center justify-center mt-10'>
                            <InboxIcon size={40} className=' stroke-public_primary_color' />
                        </div>
                        <div className='flex flex-col gap-1 text-center'>
                            <p className='font-bold'>No workflow created yet</p>
                            <p className='text-sm text-muted-foreground'>
                                Click
                                <span
                                    className='mx-1 cursor-pointer text-blue-600 font-semibold'
                                    onClick={() => { onOpen("createWorkFLow", { orgId, userId: session.user.userId }) }}
                                >
                                    here
                                </span>
                                button below to creat your first workflow
                            </p>
                        </div>
                    </div>
                )
            }

        </div>
    )
}
