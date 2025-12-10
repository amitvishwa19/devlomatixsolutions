'use client'
import { Button } from '@/components/ui/button'
import { useMutation } from '@tanstack/react-query'
import { PlayIcon } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { HandleExecuteWorkflow } from '../../_actions/execute-workflow-button'

export default function RunButton({ workflowId }) {
    const params = useParams()
    const { orgId } = params
    const { data: session } = useSession()


    const mutation = useMutation({
        mutationFn: HandleExecuteWorkflow,
        onSuccess: () => {
            toast.success('Workflow running', { id: workflowId })
        },
        onError: (error) => {
            toast.error('Error while running workflow', { id: workflowId })
        }
    })


    return (
        <Button
            variant='outline'
            className='flex items-center gap-2'
            disabled={mutation.isPending}
            onClick={() => {
                toast.loading('Schedule Running', { id: workflowId })
                mutation.mutate({
                    workflowId,
                    userId: session.user.userId,
                    orgId
                })
            }}
        >
            <PlayIcon size={16} />
            Run
        </Button>
    )
}
