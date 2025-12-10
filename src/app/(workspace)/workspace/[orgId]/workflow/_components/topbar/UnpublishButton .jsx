'use client'
import { Button } from '@/components/ui/button'
import { useMutation } from '@tanstack/react-query'
import { DownloadIcon, Loader, UploadIcon } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'
import { useReactFlow } from '@xyflow/react'
import { UnpublishWorkflow } from '../../_actions/unpublish-workflow'


export default function UnpublishButton({ userId, workflowId, orgId }) {
    const { toObject } = useReactFlow()


    const mutation = useMutation({
        mutationFn: UnpublishWorkflow,
        onSuccess: () => {
            toast.success('Workflow unpublished successfully', { id: workflowId })
        },
        onError: (err) => {
            //console.log(err)
            toast.error('Error while unpublishing workflow', { id: workflowId })
        }
    })



    return (
        <Button
            size='sm'
            className='bg-blue-600 hover:bg-blue-800 text-white '
            onClick={() => {
                toast.loading('Unpublishing workflow', { id: workflowId })
                mutation.mutate({
                    userId,
                    workflowId,
                    orgId
                })



            }}

            disabled={mutation.isPending}
        >
            {mutation.isPending ? <Loader size={16} className='mr-2 animate-spin' /> : <DownloadIcon size={16} className='mr-2' />}


            Unpublish
        </Button>

    )
}
