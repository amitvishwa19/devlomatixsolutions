import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from "@/components/ui/alert-dialog";
import { useAction } from "@/hooks/use-action";
import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { deletePermission } from "../../_action/delete-permission";
import { useAccess } from "@/providers/WorkspaceProvider";
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
            <AlertDialogContent className="sm:max-w-[425px] bg-card/95 backdrop-blur-2xl border-destructive/20 shadow-2xl">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-lg font-bold text-destructive flex items-center gap-2">
                        <Trash2 className="w-5 h-5 text-destructive shrink-0" />
                        <span>{title || "Delete Permission"}</span>
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-xs font-medium text-muted-foreground mt-2">
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2 sm:gap-0 mt-4">
                    <AlertDialogCancel
                        disabled={loading}
                        onClick={() => {
                            setLoading(false)
                            onOpenChange()
                        }}
                        className="rounded-md font-bold"
                    >
                        Cancel
                    </AlertDialogCancel>
                    <Button
                        disabled={loading}
                        onClick={handleDelete}
                        variant="destructive"
                        className="rounded-md font-bold flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        {loading ? 'Deleting...' : 'Delete Permission'}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};