'use client'
import { Button } from '@/components/ui/button'
import { Loader, Play } from 'lucide-react'
import React, { useState } from 'react'
import { useExecutionPlan } from '../../_hooks/useExecutionPlan'
import { useMutation } from '@tanstack/react-query'
import { HandleExecuteWorkflow } from '../../_actions/execute-workflow-button'
import { useSession } from 'next-auth/react'
import { useReactFlow } from '@xyflow/react'
import { toast } from 'sonner'
import { useParams } from 'next/navigation'

export default function ExecuteButton({ workflowId }) {

    const generate = useExecutionPlan()
    const { data: session } = useSession()
    const { toObject } = useReactFlow()
    const params = useParams()
    const { orgId } = params

    //console.log('@workflowId @ExecuteButton', workflowId)

    const mutation = useMutation({
        mutationFn: HandleExecuteWorkflow,
        onSuccess: (data) => {
            //console.log('@workflow mutation running-completed', data)
            setIsLoading(false)
            toast.success('Execution started')
        },
        onError: (error) => {
            //console.log('@workflow mutation error', error)
            setIsLoading(false)
            toast.error('Oops!, Something went wrong please try again')
        }

    })


    return (
        <Button
            size='sm'
            className='bg-blue-600 hover:bg-blue-800 text-white'
            disabled={mutation.isPending}
            onClick={() => {
                const plan = generate()
                //console.log('----Plan-----', plan)
                //console.table(plan)

                if (!plan) {
                    throw new Error('Workflow plan is not generated')
                    return
                }

                mutation.mutate({
                    workflowId,
                    userId: session.user.userId,
                    flowDefination: JSON.stringify(toObject()),
                    orgId
                })
            }}
        >
            {mutation.isPending ? <Loader size={16} className='mr-2 animate-spin' /> : <Play size={16} className='mr-2' />}
            Execute
        </Button>
    )
}
