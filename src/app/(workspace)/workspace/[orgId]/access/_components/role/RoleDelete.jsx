import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from '@/components/ui/alert-dialog';
import { useAction } from '@/hooks/use-action';
import { Loader, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { deletePermission } from '../../_action/delete-permission';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { deleteRole } from '../../_action/delete-role';


export function RoleDelete({ open, onClose, data }) {
    const [loading, setLoading] = useState()
    const { data: session } = useSession()

    const { execute } = useAction(deleteRole, {
        onSuccess: (data) => {
            onClose(data?.role)
            setLoading(false)
            toast.success('Role deleted successfully...', { id: 'new-permission' })
        },
        onError: (error) => {
            console.log(error)
            toast.error('Oops somethig went wrong ! try again later', { id: 'new-invoice' })
            setLoading(false);
        }
    })

    const handleOnDelete = async () => {
        setLoading(true)
        await execute({ userId: session?.user?.userId, roleId: data?.id })
    }

    const handleOpenClose = () => {
        setLoading(false);
        onClose()
    }

    console.log(data)

    return (
        <Dialog open={open} onOpenChange={handleOpenClose}>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle className='flex flex-row items-center gap-2'>
                        <Trash2 />
                        Delete Role
                    </DialogTitle>
                    <DialogDescription className='text-sm text-muted-foreground'>
                        Are you sure you want to delete "{data?.title}"? This action cannot be undone. Users with this role will need to be reassigned.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" size='sm' disabled={loading}>Cancel</Button>
                    </DialogClose>
                    <Button
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        size='sm'
                        onClick={handleOnDelete}
                        disabled={loading}
                    >
                        {loading ? <Loader className=' animate-spin' /> : <Trash2 />}
                        Delete Role
                    </Button>
                </DialogFooter>


            </DialogContent>
        </Dialog>

        // <AlertDialog open={open} onOpenChange={onOpenChange} on>
        //     <AlertDialogContent className='bg-card'>
        //         <AlertDialogHeader>
        //             <AlertDialogTitle>{title}</AlertDialogTitle>
        //             <AlertDialogDescription>{description}</AlertDialogDescription>
        //         </AlertDialogHeader>
        //         <AlertDialogFooter>
        //             <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
        //             <Button
        //                 onClick={handleOnDelete}
        //                 variant='sm'
        //                 disabled={loading}
        //                 className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        //             >
        //                 {loading ? <Loader className=' animate-spin' /> : <Trash2 />}
        //                 Delete Permission
        //             </Button>
        //         </AlertDialogFooter>
        //     </AlertDialogContent>
        // </AlertDialog>
    );
}
