import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { deleteInventory } from '../../_action/delete-inventory'
import { useAction } from '@/hooks/use-action'



export default function InventoryDelete({ isOpen, onClose, inventory, handleSubmit }) {
    const [loading, setLoading] = useState(false)

    const handleOpenCLose = () => {
        setLoading(false)
        onClose()
    }


    const { execute } = useAction(deleteInventory, {
        onSuccess: (data) => {
            setLoading(false)
            onClose(data?.inventory)
            toast.success(`Inventory "${data?.inventory?.name}" deleted successfully`)
        },
        onError: (error) => {
            toast.error('Oops!, Something went wrong, try again later')
            setLoading(false)
        }
    })


    const handleDelete = async () => {
        setLoading(true)
        await execute({ inventoryId: inventory?.id })
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenCLose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you absolutely sure to delete Inventory</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete and remove your data from our servers.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="ghost" disabled={loading} size='sm'>Cancel</Button>
                    </DialogClose>
                    <Button variant={'save'} disabled={loading} size='sm' onClick={handleDelete}>
                        {loading ? <Loader className=' animate-spin' /> : <Trash2 />}
                        Delete Inventory
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
