import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from'@/components/ui/alert-dialog';
import { useAction } from'@/hooks/use-action';
import { Loader, Trash2 } from'lucide-react';
import { useState } from'react';
import { deletePermission } from'../../_action/delete-permission';
import { toast } from'sonner';
import { useSession } from'next-auth/react';



export function DeleteConfirmDialog({ open, onOpenChange, title, description, onConfirm, type, data, id }) {
 const [loading, setLoading] = useState()
 const { data: session } = useSession()

 const { execute: permissionDelete } = useAction(deletePermission, {
 onSuccess: (data) => {
 console.log(data)
 setLoading(false)
 toast.success('Permission deleted successfully...', { id:'new-permission'})
 },
 onError: (error) => {
 console.log(error)
 toast.error('Oops somethig went wrong ! try again later', { id:'new-invoice'})
 setLoading(false);
 }
 })

 const { execute: roleDelete } = useAction(deletePermission, {
 onSuccess: (data) => {
 setLoading(false);
 toast.success(`Role deleted successfully...`, { id:'new-permission'})
 },
 onError: (error) => {
 console.log(error)
 toast.error('Oops somethig went wrong ! try again later', { id:'new-invoice'})
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
 <AlertDialogContent className='bg-card'>
 <AlertDialogHeader>
 <AlertDialogTitle>{title}</AlertDialogTitle>
 <AlertDialogDescription>{description}</AlertDialogDescription>
 </AlertDialogHeader>
 <AlertDialogFooter>
 <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
 <AlertDialogAction
 onClick={handleOnDelete}
 variant='sm'
 disabled={loading}
 className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
 >
 {loading ? <Loader className='animate-spin'/> : <Trash2 />}
 Delete Permission
 </AlertDialogAction>
 </AlertDialogFooter>
 </AlertDialogContent>
 </AlertDialog>
 );
}