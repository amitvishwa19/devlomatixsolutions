import React, { useEffect, useState } from 'react'


import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog"
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Loader } from 'lucide-react'
import { toast } from 'sonner'
import { useModal } from '@/hooks/useModal'
import { useAction } from '@/hooks/use-action'
import { useDispatch } from 'react-redux'
import { deletePatient, deleteUser } from '../_action/delete-patient'
import { useOrg } from '@/providers/OrgProvider'

export function DeletePatient({ open, values }) {
    const [loading, setLoading] = useState(false)
    const { isOpen, onClose, type, data } = useModal();
    const isModalOpen = isOpen && type === "delete-patient";
    const dispatch = useDispatch()
    const { refreshServer } = useOrg()

    const { execute } = useAction(deletePatient, {
        onSuccess: (data) => {

            handleOpenChange()
            setLoading(false)
            refreshServer().then(
                toast.success('Patient Deleted successfully', { id: 'delete-patient' })
            )
        },
        onError: (error) => {
            setLoading(false)
            console.log(error)
        }
    })

    const handleOnSubmit = () => {
        toast.loading('Deleating Patient.....', { id: 'delete-patient' })
        setLoading(true)
        execute({ id: data.id, type: 'delete' })
    }


    const handleOpenChange = async () => {
        onClose()
    }



    return (
        <Dialog open={isModalOpen} onOpenChange={handleOpenChange} >

            <DialogContent className="sm:max-w-[625px] dark:text-[#d3e3fd] p-0 overflow-hidden dark:bg-darkSecondaryBackground">

                <DialogHeader className="flex flex-col gap-4 p-4">
                    <DialogTitle className="text-lg text-center font-semibold">
                        Delete Patient?
                    </DialogTitle>
                    <DialogDescription className='self-center text-sm mt-8'>
                        Are you sure you want to delete the patient? This  action cannot be undone!
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="dark:bg-black/40 p-2">

                    <Button variant="outline" size={'sm'} disabled={loading} onClick={handleOnSubmit}>
                        {
                            loading && <Loader className='w-4 h-4 animate-spin mr-2' />
                        }

                        Delete
                    </Button>
                </DialogFooter>

            </DialogContent>
        </Dialog>
    )
}
