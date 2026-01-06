import React from 'react'
import { useModal } from '@/hooks/useModal';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { ActionTooltip } from '@/components/global/ActionTooltip';
import { CalendarRange, Eye } from 'lucide-react';
import AppointmentEditor from './AppointmentEditor';
import { Button } from '@/components/ui/button';

export default function BookAppointment({ appointment, icon }) {

    const { isOpen, onClose, type: dtype, data } = useModal();
    const isModalOpen = isOpen && dtype === "book-appointment";


    const handleOpenChange = () => {
        onClose()
    }

    //console.log(data?.appointment)

    return (
        <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>

            <DialogContent>

                <DialogHeader className={'hidden'}>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete your account
                        and remove your data from our servers.
                    </DialogDescription>
                </DialogHeader>


                <div>
                    <AppointmentEditor
                        appointment={appointment}
                        onCLose={() => { onClose() }}
                    />
                </div>

            </DialogContent>
        </Dialog>
    )
}
