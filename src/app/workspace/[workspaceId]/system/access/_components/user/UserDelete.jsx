import { useAction } from '@/hooks/use-action';
import { Loader2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { deleteUser } from '../../_action/delete-user';

export function UserDelete({ open, onClose, data }) {
    const [loading, setLoading] = useState(false);
    const { data: session } = useSession();

    const { execute } = useAction(deleteUser, {
        onSuccess: (data) => {
            onClose(data?.user);
            setLoading(false);
            toast.success(`User "${data.user.displayName}" deleted successfully...`);
        },
        onError: (error) => {
            console.log(error);
            toast.error('Oops something went wrong! Try again later', { id: 'delete-user' });
            setLoading(false);
        }
    });

    const handleOnDelete = async () => {
        setLoading(true);
        await execute({ userId: session?.user?.userId, deleteUserId: data?.id });
    };

    const handleOpenClose = () => {
        if (!loading) {
            setLoading(false);
            onClose();
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenClose}>
            <DialogContent className="sm:max-w-[425px] bg-card/95 backdrop-blur-2xl border-destructive/20 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-destructive flex items-center gap-2">
                        <Trash2 className="w-5 h-5 text-destructive shrink-0" />
                        <span>Delete User</span>
                    </DialogTitle>
                    <DialogDescription className="text-xs font-medium text-muted-foreground mt-2">
                        Are you sure you want to delete <span className="font-bold text-foreground">"{data?.displayName}"</span>? This action cannot be undone and will permanently remove this user account.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="gap-2 sm:gap-0 mt-4">
                    <DialogClose asChild>
                        <Button variant="outline" disabled={loading} className="rounded-md font-bold">
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        variant="destructive"
                        className="rounded-md font-bold flex items-center gap-2"
                        onClick={handleOnDelete}
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        {loading ? 'Deleting...' : 'Delete User'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}