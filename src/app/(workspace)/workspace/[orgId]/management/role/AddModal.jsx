import React, { useEffect, useState } from 'react'
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog"
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
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, } from "@/components/ui/sheet"
import { permissionManagement } from '../_action/permission-management'
import { roleManagement } from '../_action/role-management'
import { useDispatch, useSelector } from 'react-redux'
import { Badge } from '@/components/ui/badge'
import { pushRole, setRoles } from '../_redux/management-slice'
import { useApp } from '@/providers/AppProvider'
import { useOrg } from '@/providers/OrgProvider'
import { useRouter } from 'next/navigation'
import { addRole } from '../_action/add-role'
import { slugify } from '@/utils/functions'



export function AddRole({ open, values }) {
    const permissions = useSelector((state) => state.management.permissions)
    const [loading, setLoading] = useState(false)
    const { isOpen, onClose, type, data } = useModal();
    const isModalOpen = isOpen && type === "addRole";
    const [selectedPermissions, setSelectedPermissions] = useState([])
    const [role, setRole] = useState({ title: '', description: '', status: true })
    const dispatch = useDispatch()
    const { server } = useOrg()
    const router = useRouter()


    const { execute } = useAction(addRole, {
        onSuccess: (data) => {
            console.log('@Add Modal', data)
            dispatch(setRoles(JSON.stringify(data.roles)))
            toast.success('Role created successfully', { id: 'createRole' })
            handleOpenChange()
            setLoading(false)
        },
        onError: (error) => {
            setLoading(false)
            toast.error('Error creating role,Role already exists', { id: 'createRole' })
            console.log(error)
        }
    })

    const onSubmit = async (values) => {
        if (role.title === '') return toast.error('Please provide a title for role')
        if (!role) return toast.error('Please status for role')


        setLoading(true)
        toast.loading('Creating Role', { id: 'createRole' })
        console.log(role, selectedPermissions.map((i) => i.id))
        execute({ title: slugify(role.title), description: role.description, status: role.status, permissions: selectedPermissions.map((i) => i.id), type: 'addRole' })
    }

    const handleOpenChange = async () => {
        onClose()
        setLoading(false)
        toast.dismiss()
        setRole({ title: '', description: '', status: true })
        setSelectedPermissions([])
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

    return (
        <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>

            <DialogContent className=" dark:bg-darkPrimaryBackground">
                <DialogHeader>
                    <DialogTitle className=' self-center'>Add new Role</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 mt-4">
                    <div className="grid gap-3">
                        <Label >Title</Label>
                        <Input disabled={loading} value={role?.title} onChange={(e) => { setRole({ ...role, title: e.target.value }) }} />
                    </div>
                    <div className="grid gap-3">
                        <Label >Description</Label>
                        <Textarea disabled={loading} rows='4' value={role?.description} onChange={(e) => { setRole({ ...role, description: e.target.value }) }} />
                    </div>
                    <div className="grid gap-3">
                        <Label >Status</Label>
                        <Select disabled={loading} defaultValue={true} onValueChange={(e) => {
                            console.log(setRole({ ...role, status: e }))
                        }}>
                            <SelectTrigger className="">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value={true}>Active</SelectItem>
                                    <SelectItem value={false}>InActive</SelectItem>
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
                        {selectedPermissions.length > 0 && (
                            <div className='flex flex-wrap gap-2 p-2 rounded-md border mt-2'>
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
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="ghost" size={'sm'} >Cancel</Button>
                    </DialogClose>
                    <Button variant={'outline'} size={'sm'} onClick={() => { onSubmit() }} disabled={loading}>
                        {loading && <Loader className=' animate-spin' />}
                        Save changes
                    </Button>
                </DialogFooter>
            </DialogContent>

        </Dialog>

    )
}
