import React, { useEffect, useState } from 'react'
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { Button } from '@/components/ui/button'
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader } from 'lucide-react'
import { toast } from 'sonner'
import { useModal } from '@/hooks/useModal'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAction } from '@/hooks/use-action'
import { permissionManagement } from '../_action/permission-management'
import { Label } from '@/components/ui/label'
import { useDispatch } from 'react-redux'
import { setPermissions } from '../_redux/management-slice'
import { slugify } from '@/utils/functions'

export function EditPermission({ open, values }) {

    const [loading, setLoading] = useState(false)
    const { isOpen, onClose, type, data } = useModal();
    const isModalOpen = isOpen && type === "editPermission";
    const [permission, setPermission] = useState({ title: '', description: '', status: null })
    const dispatch = useDispatch()


    useEffect(() => {
        setPermission({
            title: data?.permission?.title,
            description: data?.permission?.description,
            status: data?.permission?.status
        })
    }, [isOpen])


    const { execute } = useAction(permissionManagement, {
        onSuccess: (data) => {
            console.log(data.permissions)
            dispatch(setPermissions(JSON.stringify(data.permissions)))
            toast.success('Permission updated successfully', { id: 'updatePermission' })
            handleOpenChange()
            setLoading(false)
        },
        onError: (error) => {
            toast.error('Error updating permission, Permission already exist', { id: 'updatePermission' })
            console.log(error)
        }
    })


    const handleOpenChange = async () => {
        onClose()
    }

    const onSubmit = async (values) => {
        toast.loading('Updating Permission', { id: 'updatePermission' })
        execute({ id: data.permission.id, title: slugify(permission.title), description: permission.description, status: permission.status, type: 'editPermission' })
    }

    return (
        <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>

            <DialogContent className=" dark:bg-darkPrimaryBackground">
                <DialogHeader>
                    <DialogTitle>Edit Permission</DialogTitle>

                </DialogHeader>
                <div className="grid gap-4">
                    <div className="grid gap-3">
                        <Label >Title</Label>
                        <Input value={permission?.title} disabled={loading} onChange={(e) => { setPermission({ ...permission, title: e.target.value }) }} />
                    </div>
                    <div className="grid gap-3">
                        <Label >Description</Label>
                        <Textarea rows='4' value={permission?.description} disabled={loading} onChange={(e) => { setPermission({ ...permission, description: e.target.value }) }} />
                    </div>
                    <div className="grid gap-3">
                        <Label >Status</Label>
                        <Select defaultValue={permission?.status} disabled={loading} onValueChange={(e) => {
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
                        <Button variant="ghost" size={'sm'} disabled={loading}>Cancel</Button>
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
