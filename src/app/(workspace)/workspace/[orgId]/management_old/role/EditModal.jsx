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
import { setRoles } from '../_redux/management-slice'
import { slugify } from '@/utils/functions'



export function EditRole({ open, values }) {
    const permissions = useSelector((state) => state.management.permissions)
    const [loading, setLoading] = useState(false)
    const { isOpen, onOpen, onClose, type, data } = useModal();
    const [selectedPermissions, setSelectedPermissions] = useState([])
    const [role, setRole] = useState({ title: '', description: '', status: null })
    const isModalOpen = isOpen && type === "editRole";
    const { server } = useOrg()
    const dispatch = useDispatch()

    useEffect(() => {
        setSelectedPermissions(data?.role?.permissions)
        setRole({ title: data?.role?.title, description: data?.role?.description, status: data?.role?.status })
    }, [isOpen])

    const { execute } = useAction(editRole, {
        onSuccess: (data) => {
            toast.success('Role updated successfully', { id: 'updatingrole' })
            dispatch(setRoles(JSON.stringify(data.roles)))
            setLoading(false)
            onClose()
        },
        onError: (error) => {
            setLoading(false)
            toast.error('Error creating role,Role already exists', { id: 'updatingrole' })
            console.log(error)
        }
    })


    const onSubmit = () => {
        console.log('edit role', server.id)
        // console.log('save  role', role)
        if (role.title === '') return toast.error('Please provide a title for role')
        if (!role) return toast.error('Please status for role')

        setLoading(true)
        toast.loading('Updating role.....', { id: 'updatingrole' })
        // console.log(role, selectedPermissions.map((i) => i.id))
        execute({ serverId: server?.id, id: data?.role?.id, title: slugify(role.title), description: role.description, status: role.status, permissions: selectedPermissions.map((i) => i.id), type: 'addRole' })

    }

    const selectPermission = (i) => {
        const item = permissions.find((e) => e.id === i)
        const aitem = selectedPermissions?.find((e) => e.id === i)
        if (!aitem) {
            setSelectedPermissions([...selectedPermissions, item])
        }
    }

    const removePermission = (e, item) => {
        e.preventDefault()
        const remaining = selectedPermissions.filter((i) => {
            return i.id !== item.id
        })
        setSelectedPermissions(remaining)
    }

    const handleOpenChange = async () => {
        onClose()
        setRole({ title: '', description: '', status: true })
        setSelectedPermissions([])
    }

    return (
        <Dialog open={isModalOpen} onOpenChange={() => { onClose() }}>

            <DialogContent className='dark:bg-darkPrimaryBackground'>
                <DialogHeader>
                    <DialogTitle>{`Edit role`} <span className='text-sm'>( {data?.role?.title} )</span></DialogTitle>
                </DialogHeader>

                <div className='flex flex-col gap-4'>

                    <div className='flex flex-col gap-2'>
                        <Label className='text-xs'>Title</Label>
                        <Input value={role?.title} onChange={(e) => { setRole({ ...role, title: e.target.value }) }} />
                    </div>

                    <div className='flex flex-col gap-2'>
                        <Label>Description</Label>
                        <Textarea rows='4' value={role.description} onChange={(e) => { setRole({ ...role, description: e.target.value }) }} />
                    </div>

                    <div className='flex flex-col gap-2'>
                        <Label>Status</Label>
                        <Select defaultValue={JSON.stringify(data?.role?.status)} onValueChange={(e) => { console.log('first', e) }}>
                            <SelectTrigger className="">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent className='dark:bg-darkPrimaryBackground'>
                                <SelectGroup >
                                    <SelectItem value={'true'}>Active</SelectItem>
                                    <SelectItem value={'false'}>InActive</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Select Permission(s)</Label>
                        <Select disabled={loading} onValueChange={selectPermission}>
                            <SelectTrigger className="">
                                <SelectValue placeholder={permissions.length > 0 ? 'Select Permission' : 'No permissions to assign'} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {
                                        permissions.map((item, index) => {
                                            return (
                                                <SelectItem key={index} value={item.id}>{item.title}</SelectItem>
                                            )
                                        })
                                    }
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        {selectedPermissions?.length > 0 && (
                            <div className='flex flex-wrap gap-2 p-2 rounded-md border mt-2 dark:bg-darkSecondaryBackground/20'>
                                {selectedPermissions.map((item, index) => {
                                    return (

                                        <Badge key={index} variant={'primary'} className='p-2 flex flex-row rounded-md gap-2'>
                                            <span>{item.title}</span>
                                            <Trash2 size={14} className=' cursor-pointer' onClick={(e) => { removePermission(e, item) }} />
                                        </Badge>


                                    )
                                })}
                            </div>
                        )}

                    </div>

                    <div className='flex justify-end'>
                        <Button variant={'outline'} size={'sm'} className=' justify-end' onClick={() => { onSubmit() }}>
                            {loading && <Loader className=' animate-spin' />}
                            Save
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
