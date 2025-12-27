import React, { useState } from 'react'
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { Button } from '@/components/ui/button'
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader } from 'lucide-react'
import { toast } from 'sonner'
import { useModal } from '@/hooks/useModal'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAction } from '@/hooks/use-action'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, } from "@/components/ui/sheet"
import { permissionManagement } from '../_action/permission-management'
import { Label } from '@/components/ui/label'
import { useDispatch } from 'react-redux'
import { setPermissions } from '../_redux/management-slice'
import { slugify } from '@/utils/functions'


export function AddPermission({ open, values }) {
    const [loading, setLoading] = useState(false)
    const { isOpen, onClose, type, data } = useModal();
    const isModalOpen = isOpen && type === "addPermission";
    const [permission, setPermission] = useState({ title: '', description: '', status: true })
    const dispatch = useDispatch()

    const handleOpenChange = async () => {
        onClose()
        setPermission({ title: '', description: '', status: true })
    }

    const { execute } = useAction(permissionManagement, {
        onSuccess: (data) => {
            console.log(data)
            dispatch(setPermissions(JSON.stringify(data.permissions)))
            toast.success('Permission created successfully', { id: 'createPermission' })
            handleOpenChange()
            setLoading(false)
        },
        onError: (error) => {
            setLoading(false)
            toast.error('Error creating permission, Permission already exist', { id: 'createPermission' })
            console.log(error.message)
        }
    })

    const onSubmit = async (values) => {
        console.log(permission)

        if (permission.title === '') return toast.error('Please provida a title for permission')
        // if (permission.description === '') return toast.error('Please provida a breif description for permission')

        setLoading(true)
        toast.loading('Creating Permission', { id: 'createPermission' })
        execute({ title: slugify(permission.title), description: permission.description, status: permission.status, type: 'addPermission' })
    }

    return (
        <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>

            <DialogContent className=" dark:bg-darkPrimaryBackground">
                <DialogHeader>
                    <DialogTitle>Add new Permission</DialogTitle>

                </DialogHeader>
                <div className="grid gap-4">
                    <div className="grid gap-3">
                        <Label >Title</Label>
                        <Input value={permission?.title} onChange={(e) => { setPermission({ ...permission, title: e.target.value }) }} />
                    </div>
                    <div className="grid gap-3">
                        <Label >Description</Label>
                        <Textarea rows='4' value={permission?.description} onChange={(e) => { setPermission({ ...permission, description: e.target.value }) }} />
                    </div>
                    <div className="grid gap-3">
                        <Label >Status</Label>
                        <Select defaultValue={permission.status} onValueChange={(e) => {
                            console.log(e)
                            console.log(setPermission({ ...permission, status: e }))
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
