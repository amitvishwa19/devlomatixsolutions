import React from 'react'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import AppointmentEditor from './AppointmentEditor'


export default function EditAppointment({ isOpen, onClose, appointment }) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>

            <DialogContent>

                <DialogHeader className={'hidden'}>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete your account
                        and remove your data from our servers.
                    </DialogDescription>
                </DialogHeader>


                <AppointmentEditor appointment={appointment} />
            </DialogContent>
        </Dialog>
    )
}
