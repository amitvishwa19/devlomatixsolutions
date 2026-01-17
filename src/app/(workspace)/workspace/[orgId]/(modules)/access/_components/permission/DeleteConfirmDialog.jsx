import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from "@/components/ui/alert-dialog";
import { useAction } from "@/hooks/use-action";
import { Loader } from "lucide-react";
import { useState } from "react";
import { deletePermission } from "../../_action/delete-permission";
import { useAccess } from "../../_provider/accessProvider";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";


export const DeleteConfirmDialog = ({ open, onOpenChange, title, description, onConfirm, module }) => {

    const [loading, setLoading] = useState()
    const { permissions } = useAccess()
    const { data: session } = useSession()

    const { execute } = useAction(deletePermission, {
        onSuccess: (data) => {
            setLoading(false)
            onConfirm()
            toast.success('Permission deleted successfully...', { id: 'delete-permission' })
        },
        onError: (error) => {
            console.log(error)
            toast.error('Oops somethig went wrong ! try again later', { id: 'delete-permission' })
            setLoading(false);
        }
    })



    const handleDelete = async () => {
        setLoading(true)
        const permissionsToDelete = permissions.filter((p) => p.category === module.category);
        await execute({ userId: session.user.userId, permissionsToDelete: permissionsToDelete })

    }

    const handleOpenChange = () => {
        onOpenChange()
        setLoading(false)
    }


    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => {
                        setLoading(false)
                        onOpenChange()
                    }}>Cancel</AlertDialogCancel>
                    <Button
                        disabled={loading}
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {loading && <Loader className=" animate-spin" />}

                        Delete
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};