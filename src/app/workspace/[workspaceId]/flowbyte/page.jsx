'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useModal } from '@/hooks/useModal'
import { InboxIcon, PlusIcon, WorkflowIcon } from 'lucide-react'
import { useParams } from 'next/navigation'
import { getWorkflow } from './_actions/get-workflows'
import { useAction } from '@/hooks/use-action'
import { toast } from 'sonner'
import { useAuth } from '@/providers/AuthProvider'
import WorkflowCard from './_components/WorkflowCard'

export default function WorkflowsPage() {
    const { user } = useAuth()
    const { workspaceId } = useParams()
    const [workflows, setWorkflows] = useState([])
    const { onOpen, isOpen } = useModal()

    const { execute, isLoading } = useAction(getWorkflow, {
        onSuccess: (data) => {
            setWorkflows(data || [])
        },
        onError: (error) => {
            toast.error(error)
        }
    })

    useEffect(() => {
        if (user?.id) {
            execute({ userId: user.id, workspaceId })
        }
    }, [user, workspaceId, isOpen])

    return (
        <div className='p-6 flex flex-1 flex-col h-full w-full max-w-7xl mx-auto animate-in fade-in duration-500'>
            <div className='mb-8'>
                <div className='flex items-center justify-between mb-2'>
                    <div className='flex items-center gap-3'>
                        <div className="bg-primary/10 p-2.5 rounded-xl">
                            <WorkflowIcon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold tracking-tight">Workflows</h3>
                            <p className="text-sm text-muted-foreground">
                                Automate your tasks with low-code workflows
                            </p>
                        </div>
                    </div>
                    <Button 
                        onClick={() => onOpen("createWorkFLow", { workspaceId, userId: user?.id })} 
                        className='bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl gap-2 shadow-lg shadow-primary/20'
                    >
                        <PlusIcon size={18} />
                        Create Workflow
                    </Button>
                </div>
            </div>

            {isLoading && workflows.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-muted-foreground font-medium">Loading workflows...</p>
                    </div>
                </div>
            ) : workflows.length > 0 ? (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4'>
                    {workflows.map((workflow) => (
                        <WorkflowCard key={workflow.id} workflow={workflow} workspaceId={workspaceId} />
                    ))}
                </div>
            ) : (
                <div className='flex flex-1 flex-col items-center justify-center border-2 border-dashed border-muted rounded-3xl bg-muted/5 mt-4 p-12 text-center'>
                    <div className='rounded-full bg-primary/10 w-24 h-24 flex items-center justify-center mb-6'>
                        <InboxIcon size={48} className='text-primary opacity-50' />
                    </div>
                    <div className='flex flex-col gap-2 max-w-sm'>
                        <h4 className='text-xl font-bold'>No workflows created yet</h4>
                        <p className='text-sm text-muted-foreground leading-relaxed'>
                            Build your first automation to streamline your repetitive tasks and save precious time.
                        </p>
                        <Button 
                            variant="link"
                            className='text-primary font-bold mt-2'
                            onClick={() => onOpen("createWorkFLow", { workspaceId, userId: user?.id })}
                        >
                            Click here to start building →
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
