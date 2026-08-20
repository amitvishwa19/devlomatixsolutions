import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from '@/components/ui/alert-dialog';
import { useAction } from '@/hooks/use-action';
import { Loader, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { deletePermission } from '../../_action/delete-permission';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';



export function DeleteConfirmDialog({ open, onOpenChange, title, description, onConfirm, type, data, id }) {
    const [loading, setLoading] = useState()
    const { data: session } = useSession()

    const { execute: permissionDelete } = useAction(deletePermission, {
        onSuccess: (data) => {
            console.log(data)
            setLoading(false)
            toast.success('Permission deleted successfully...', { id: 'new-permission' })
        },
        onError: (error) => {
            console.log(error)
            toast.error('Oops somethig went wrong ! try again later', { id: 'new-invoice' })
            setLoading(false);
        }
    })

    const { execute: roleDelete } = useAction(deletePermission, {
        onSuccess: (data) => {
            setLoading(false);
            toast.success(`Role deleted successfully...`, { id: 'new-permission' })
        },
        onError: (error) => {
            console.log(error)
            toast.error('Oops somethig went wrong ! try again later', { id: 'new-invoice' })
            setLoading(false);
        }
    })


    const handleOnDelete = async () => {
        setLoading(true)
        // if (type ==='permission') {
        // await permissionDelete({ userId: session?.user?.userId, id: id })
        // }
        console.log('@delete permission', id)
    }

    const handleOpenClose = () => {
        setLoading(false);
        onOpenChange()
    }


    return (
        <AlertDialog open={open} onOpenChange={handleOpenClose}>
            <AlertDialogContent className="sm:max-w-[425px] bg-card/95 backdrop-blur-2xl border-destructive/20 shadow-2xl">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-lg font-bold text-destructive flex items-center gap-2">
                        <Trash2 className="w-5 h-5 text-destructive shrink-0" />
                        <span>{title || "Delete Item"}</span>
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-xs font-medium text-muted-foreground mt-2">
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2 sm:gap-0 mt-4">
                    <AlertDialogCancel disabled={loading} className="rounded-md font-bold">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleOnDelete}
                        disabled={loading}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md font-bold flex items-center gap-2"
                    >
                        {loading ? <Loader className='w-4 h-4 animate-spin' /> : null}
                        {loading ? 'Deleting...' : 'Delete Permission'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}