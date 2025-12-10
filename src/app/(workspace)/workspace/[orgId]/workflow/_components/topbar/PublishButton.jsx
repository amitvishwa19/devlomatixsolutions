'use client'
import { Button } from '@/components/ui/button'
import { useMutation } from '@tanstack/react-query'
import { Loader, UploadIcon } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'
import { useReactFlow } from '@xyflow/react'
import { PublishWorkflow } from '../../_actions/publish-workflow'


export default function PublishButton({ userId, workflowId, orgId }) {
    const { toObject } = useReactFlow()


    const mutation = useMutation({
        mutationFn: PublishWorkflow,
        onSuccess: () => {
            toast.success('Workflow published successfully', { id: workflowId })
        },
        onError: (err) => {
            //console.log(err)
            toast.error('Error while publishing workflow', { id: workflowId })
        }
    })



    return (
        <Button
            size='sm'
            className='bg-blue-600 hover:bg-blue-800 text-white '
            onClick={() => {
                toast.loading('Publishing workflow', { id: workflowId })
                mutation.mutate({
                    userId,
                    workflowId,
                    defination: JSON.stringify(toObject()),
                    orgId
                })



            }}

            disabled={mutation.isPending}
        >
            {mutation.isPending ? <Loader size={16} className='mr-2 animate-spin' /> : <UploadIcon size={16} className='mr-2' />}


            Publish
        </Button>

    )
}
