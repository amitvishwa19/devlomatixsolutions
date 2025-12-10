import React, { useEffect, useState } from 'react'


import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader } from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner'
import { useModal } from '@/hooks/useModal'


import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAction } from '@/hooks/use-action'
import { roleManagement } from '../_action/role-management'
import { useDispatch } from 'react-redux'
import { setRoles, setUsers } from '../_redux/management-slice'
import { deleteRole } from '../_action/delete-role'
import { deleteUser } from '../_action/delete-user'

export function DeleteUser({ open, values }) {
    const [loading, setLoading] = useState(false)
    const { isOpen, onClose, type, data } = useModal();
    const isModalOpen = isOpen && type === "deleteuser";
    const dispatch = useDispatch()


    const { execute } = useAction(deleteUser, {
        onSuccess: (data) => {
            dispatch(setUsers(JSON.stringify(data.users)))
            toast.success('User Deleted successfully', { id: 'delete-user' })
            handleOpenChange()
            setLoading(false)
        },
        onError: (error) => {
            setLoading(false)
            console.log(error)
        }
    })

    const handleOnSubmit = () => {
        toast.loading('Deleating user.....', { id: 'delete-user' })
        setLoading(true)
        execute({ id: data.id, type: 'deleteRole' })
    }


    const handleOpenChange = async () => {
        onClose()
    }



    return (
        <Dialog open={isModalOpen} onOpenChange={handleOpenChange} >

            <DialogContent className="sm:max-w-[625px] dark:text-[#d3e3fd] p-0 overflow-hidden dark:bg-darkSecondaryBackground">

                <DialogHeader className="flex flex-col gap-4 p-4">
                    <DialogTitle className="text-lg text-center font-semibold">
                        Delete User for your Organization
                    </DialogTitle>
                    <DialogDescription className='self-center text-sm mt-8'>
                        Are you sure you want to delete the User? This  action cannot be undone!
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
