import React, { useState } from 'react'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { useModal } from '@/hooks/useModal';
import { Loader, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { deleteAppointment } from '../../_actions/delete-appointment';
import { useAction } from '@/hooks/use-action';
import { toast } from 'sonner';
import { useOrg } from '@/providers/OrgProvider';


export default function DeleteAppointment() {
    const { isOpen, onClose, type: dtype, data } = useModal();
    const isModalOpen = isOpen && dtype === "delete-appointment";
    const [loading, setLoading] = useState(false)
    const { refreshServer } = useOrg()

    const handleOpenChange = () => {
        setLoading(false)
        onClose()
    }


    const { execute } = useAction(deleteAppointment, {
        onSuccess: (data) => {

            setLoading(false)
            handleOpenChange()
            refreshServer().then(() => {
                setLoading(false)
                handleOpenChange()
                toast.success('Appointment deleted successfully', { id: 'delete-appointment' })
            })

        },
        onError: (error) => {
            setLoading(false)
        }
    })

    const handleDelete = async () => {
        setLoading(true)
        await execute({ appointmentId: data.appointmentId })
        //toast.loading('Deleting Appointment ....', { id: 'delete-appointment' })

    }

    return (
        <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Appointment</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete appointment
                        and remove your data from our servers.{data.appointmentId}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button disabled={loading} variant="outline" size='sm'>Cancel</Button>
                    </DialogClose>
                    <Button disabled={loading} variant='save' size='sm' onClick={handleDelete}>
                        {loading ? <Loader className=' animate-spin' /> : <Trash2 />}
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
