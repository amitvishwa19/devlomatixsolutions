'use client'
import React, { useState } from 'react'
import { useModal } from '@/hooks/useModal'
import { useAction } from '@/hooks/use-action'
import { deleteWorkflow } from '../_actions/delete-workflow'
import { 
    AlertDialog, 
    AlertDialogAction, 
    AlertDialogCancel, 
    AlertDialogContent, 
    AlertDialogDescription, 
    AlertDialogFooter, 
    AlertDialogHeader, 
    AlertDialogTitle 
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function DeleteWorkflowModal() {
    const [confirmText, setConfirmText] = useState('')
    const { onClose, isOpen, type, data } = useModal()
    const isModalOpen = isOpen && type === "deleteWorkFLow"
    const { workflow, workspaceId, userId } = data

    const { execute, isLoading } = useAction(deleteWorkflow, {
        onSuccess: (data) => {
            toast.success(`Workflow "${data.name}" deleted successfully`, { id: 'delete-workflow' })
            onClose()
            setConfirmText('')
        },
        onError: (error) => {
            toast.error(error, { id: 'delete-workflow' })
        }
    })

    const handleDelete = () => {
        toast.loading('Deleting workflow...', { id: 'delete-workflow' })
        execute({ workflowId: workflow?.id, workspaceId, userId })
    }

    return (
        <AlertDialog open={isModalOpen} onOpenChange={(open) => !open && onClose()}>
            <AlertDialogContent className="rounded-2xl">
                <AlertDialogHeader>
                    <AlertDialogTitle className='text-xl font-bold'>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription className="text-sm">
                        This action cannot be undone. This will permanently delete your
                        workflow <span className="font-bold text-foreground">"{workflow?.name}"</span>.
                    </AlertDialogDescription>
                    <div className='bg-destructive/5 p-4 rounded-xl border border-destructive/10 mt-4'>
                        <p className='text-[11px] text-muted-foreground uppercase font-bold tracking-wider mb-2'>
                            Confirm deletion by typing the workflow name:
                        </p>
                        <Input
                            placeholder={workflow?.name}
                            className='bg-background border-muted focus-visible:ring-destructive/20'
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                        />
                    </div>
                </AlertDialogHeader>

                <AlertDialogFooter className="mt-6">
                    <AlertDialogCancel className="rounded-xl border-muted hover:bg-muted" onClick={() => setConfirmText('')}>
                        Cancel
                    </AlertDialogCancel>
                    <Button
                        variant="destructive"
                        className='rounded-xl font-bold px-6'
                        disabled={confirmText !== workflow?.name || isLoading}
                        onClick={handleDelete}
                    >
                        {isLoading ? <Loader2 size={16} className='mr-2 animate-spin' /> : null}
                        Delete Permanently
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
