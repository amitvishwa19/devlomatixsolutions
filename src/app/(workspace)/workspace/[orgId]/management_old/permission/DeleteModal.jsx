import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Loader } from 'lucide-react'
import { toast } from 'sonner'
import { useModal } from '@/hooks/useModal'
import { useAction } from '@/hooks/use-action'
import { permissionManagement } from '../_action/permission-management'
import { useDispatch } from 'react-redux'
import { setPermissions } from '../_redux/management-slice'




export function DeletePermission({ open, values }) {

    const [loading, setLoading] = useState(false)
    const { isOpen, onClose, type, data } = useModal();
    const isModalOpen = isOpen && type === "deletePermission";
    const dispatch = useDispatch()

    const { execute } = useAction(permissionManagement, {
        onSuccess: (data) => {
            dispatch(setPermissions(JSON.stringify(data.permissions)))
            toast.success('Permission Deleted successfully', { id: 'deletePermission' })
            handleOpenChange()
            setLoading(false)
        },
        onError: (error) => {
            setLoading(false)
            console.log(error)
        }
    })

    const handleOnSubmit = () => {
        setLoading(true)
        toast.loading('Deleting selected permission', { id: 'deletePermission' })
        execute({ id: data.id, type: 'deletePermission' })
    }


    const handleOpenChange = async () => {
        onClose()
    }



    return (
        <Dialog open={isModalOpen} onOpenChange={handleOpenChange} >

            <DialogContent className="sm:max-w-[625px] dark:text-[#d3e3fd] p-0 overflow-hidden dark:bg-darkSecondaryBackground">

                <DialogHeader className="flex flex-col gap-4 p-4">
                    <DialogTitle className="text-lg text-center font-semibold">
                        Delete Permission for your Organization
                    </DialogTitle>
                    <DialogDescription className='self-center text-sm mt-8 items-center text-center'>
                        Are you sure you want to delete the permission?<br />
                        This  action cannot be undone!
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
