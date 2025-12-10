import { useAction } from '@/hooks/use-action';
import { useModal } from '@/hooks/useModal';
import { useSession } from 'next-auth/react';
import React, { useState } from 'react'
import { deleteWorkflow } from '../_actions/delete-workflow';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function DeleteWorkflowModal() {

    const [confirmText, setConfirmText] = useState('')
    const { data: session } = useSession()

    const { onOpen, onClose, isOpen, type, data } = useModal()
    const isModalOpen = isOpen && type === "deleteWorkFLow";
    const { workflow, orgId, userId } = data



    const { execute } = useAction(deleteWorkflow, {
        onSuccess: (data) => {
            console.log('data', data)
            toast.success(`Workflow ${data.name} deleted`)
        },
        onError: (error) => {
            toast.error(error)
        }
    })

    const handleDeleteWOrkflow = (workflowId) => {
        execute({ workflowId, orgId, userId: session?.user?.userId })
    }

    const handleModalClose = () => {
        onClose()
    }


    return (
        <AlertDialog open={isModalOpen} onOpenChange={handleModalClose}>
            {/* <AlertDialogTrigger asChild>
                <Button variant="outline">Show Dialog</Button>
            </AlertDialogTrigger> */}
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className='text-white'>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        workflow {workflow?.name}.
                    </AlertDialogDescription>
                    <p className='text-sm text-muted-foreground'>

                        <span>If you are sure ,enter </span>
                        <b className='font-semibold text-white'>{workflow?.name}</b>
                        <span> to confirm</span>
                    </p>
                </AlertDialogHeader>

                <div>
                    <Input
                        className='text-white'
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                    />
                </div>

                <AlertDialogFooter className='flex items-center'>
                    <Button variant='' size='sm' onClick={() => {
                        handleModalClose()
                        setConfirmText('')
                    }}>Cancel</Button>

                    <AlertDialogAction
                        className='bg-red-600 hover:bg-red-800 text-white'
                        disabled={confirmText !== workflow?.name}
                        onClick={() => {
                            handleDeleteWOrkflow(workflow?.id)
                        }}
                    >
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
