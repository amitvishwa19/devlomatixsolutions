import React, { useEffect, useState } from 'react'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { Button } from '@/components/ui/button'
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useModal } from '@/hooks/useModal'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAction } from '@/hooks/use-action'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, } from "@/components/ui/sheet"
import { permissionManagement } from '../_action/permission-management'
import { roleManagement } from '../_action/role-management'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { useDispatch, useSelector } from 'react-redux'
import { Badge } from '@/components/ui/badge'
import { editRole } from '../_action/edit-role'
import { useOrg } from '@/providers/OrgProvider'
import { setRoles, setUsers } from '../_redux/management-slice'
import { editUser } from '../_action/edit-user'



export function EditUser({ open, values }) {
    const permissions = useSelector((state) => state.management.permissions)
    const roles = useSelector((state) => state.management.roles)


    const [loading, setLoading] = useState(false)
    const { isOpen, onOpen, onClose, type, data } = useModal();
    const [selectedRole, setSelectedRole] = useState([])
    const [user, setUser] = useState({ name: '', email: '', status: null })
    const isModalOpen = isOpen && type === "edituser";
    const { server } = useOrg()
    const dispatch = useDispatch()

    useEffect(() => {
        setSelectedRole(data?.user?.roles)
        setUser({ name: data?.user?.displayName, email: data?.user?.email, status: data?.user?.status })
    }, [isOpen])

    const { execute } = useAction(editUser, {
        onSuccess: (data) => {
            toast.success('User updated successfully', { id: 'updatinguser' })
            dispatch(setUsers(JSON.stringify(data.users)))
            setLoading(false)
            handleOpenChange()
        },
        onError: (error) => {
            setLoading(false)
            toast.error('Error creating role,Role already exists', { id: 'updatinguser' })
            console.log(error)
        }
    })


    const onSubmit = () => {
        setLoading(true)
        toast.loading('Updating User details.....', { id: 'updatinguser' })
        execute({
            id: data?.user?.id,
            serverId: server?.id,
            status: user.status,
            roles: selectedRole.map((i) => i.id), type: 'addRole'
        })

    }

    const selectRole = (i) => {
        const item = roles.find((e) => e.id === i)
        const aitem = selectedRole?.find((e) => e.id === i)
        if (!aitem) {
            setSelectedRole([...selectedRole, item])
        }
    }

    const removeRole = (e, item) => {
        e.preventDefault()
        const remaining = selectedRole.filter((i) => {
            return i.id !== item.id
        })
        setSelectedRole(remaining)
    }

    const handleOpenChange = async () => {
        onClose()
        setLoading(false)
        //setRole({ title: '', description: '', status: true })
        setSelectedRole([])
    }

    return (
        <Dialog open={isModalOpen} onOpenChange={() => { handleOpenChange() }}>

            <DialogContent className='dark:bg-darkPrimaryBackground'>
                <DialogHeader>
                    <DialogTitle className='font-semibold text-md'>{`Edit user`} <span className='text-sky-600'>( {data?.user?.displayName} )</span></DialogTitle>
                </DialogHeader>

                <div className='flex flex-col gap-4'>

                    <div className='flex flex-col gap-2'>
                        <Label className='text-xs'>Name</Label>
                        <Input value={user?.name} disabled={true} onChange={(e) => { setUser({ ...user, name: e.target.value }) }} />
                    </div>

                    <div className='flex flex-col gap-2'>
                        <Label className='text-xs'>Email</Label>
                        <Input value={user?.email} disabled={true} onChange={(e) => { setUser({ ...user, email: e.target.value }) }} />
                    </div>



                    <div className='flex flex-col gap-2'>
                        <Label>Status</Label>
                        <Select defaultValue={user.status} onValueChange={(e) => { setUser({ ...user, status: e }) }}>
                            <SelectTrigger className="">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent className='dark:bg-darkPrimaryBackground'>
                                <SelectGroup >
                                    <SelectItem value={true}>Active</SelectItem>
                                    <SelectItem value={false}>InActive</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Select Role(s)</Label>
                        <Select disabled={loading} onValueChange={selectRole}>
                            <SelectTrigger className="">
                                <SelectValue placeholder={roles.length > 0 ? 'Select Role' : 'No Role to assign'} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {
                                        roles.map((item, index) => {
                                            return (
                                                <SelectItem key={index} value={item.id}>{item.title}</SelectItem>
                                            )
                                        })
                                    }
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        {selectedRole?.length > 0 && (
                            <div className='flex flex-wrap gap-2 p-2 rounded-md border mt-2 dark:bg-darkSecondaryBackground/20'>
                                {selectedRole?.map((item, index) => {
                                    return (

                                        <Badge key={index} variant={'primary'} className='p-2 flex flex-row rounded-md gap-2'>
                                            <span>{item.title}</span>
                                            <Trash2 size={14} className=' cursor-pointer' onClick={(e) => { removeRole(e, item) }} />
                                        </Badge>


                                    )
                                })}
                            </div>
                        )}

                    </div>

                    <div className='flex justify-end'>

                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="ghost" size={'sm'} >Cancel</Button>
                        </DialogClose>
                        <Button variant={'outline'} size={'sm'} className=' justify-end' onClick={() => { onSubmit() }}>
                            {loading && <Loader className=' animate-spin' />}
                            Save
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    )
}
