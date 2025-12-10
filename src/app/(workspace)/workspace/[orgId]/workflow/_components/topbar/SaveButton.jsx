import { useMutation } from '@tanstack/react-query'
import React from 'react'
import { UpdateWorkflow } from '../../_actions/update-workflow'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Loader, Save } from 'lucide-react'
import { useReactFlow } from '@xyflow/react'

export default function SaveButton({ userId, workflowId, orgId }) {
    const { toObject } = useReactFlow()
    const saveMutation = useMutation({
        mutationFn: UpdateWorkflow,
        onSuccess: (data) => {
            //console.log('@@ save mutation success', data)
            toast.success(`Workflow ${data.workflow.name} saved successfully`, { id: 'save-workflow' })
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
