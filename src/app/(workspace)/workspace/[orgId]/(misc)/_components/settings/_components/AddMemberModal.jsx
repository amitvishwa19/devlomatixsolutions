'use client'
import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useModal } from '@/hooks/useModal'
import { getAllUsers } from '../_action/get-all-users'
import { useAction } from '@/hooks/use-action'
import { Avatar, AvatarFallback, AvatarImage, } from "@/components/ui/avatar"
import { Loader } from 'lucide-react'
import { toast } from 'sonner'
import { useOrg } from '@/providers/OrgProvider'
import { addMemberOrg } from '../../../_actions/add-member'

const AddMemberModal = ({ open, setOpen }) => {
    const { onOpen, onClose, isOpen, type, data } = useModal()
    const isModalOpen = isOpen && type === "addmember";
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(false)
    const { server, users, refreshServer } = useOrg()

    const removeIds = new Set(data?.data?.map(r => r.id));
    const userData = users.filter(item => !removeIds.has(item.id));



    const { execute: addMember } = useAction(addMemberOrg, {
        onSuccess: (data) => {
            setUser(null)
            setLoading(false)
            toast.success('Member added to your organization', { id: 'addmember' })
        },
        onError: (error) => {
            console.log(error)
        }
    })

    const handleAddMember = async () => {

        try {
            if (!user) return toast.error('Please select a user to add to organization')
            setLoading(true)
            toast.loading('Adding member to your organization', { id: 'addmember' })
            await addMember({ serverId: server.id, userId: user })
            await refreshServer().then(setOpen(false)
            )
        } catch (error) {
            console.log(error)
            setLoading(false)
            toast.error('Oops !, something went wrong', { id: 'addmember' })
        } finally {
            setLoading(false)
        }




    }

    return (
        <Dialog open={open}>

            <DialogContent className="dark:bg-darkPrimaryBackground">

                <DialogHeader>
                    <DialogTitle>Add Member to organization</DialogTitle>
                    <DialogDescription>
                        Add member to your organization,to manage the org data
                    </DialogDescription>
                </DialogHeader>


                <div className="grid gap-4">
                    <Select disabled={loading} onValueChange={(e) => { setUser(e) }}>
                        <SelectTrigger className="">
                            <SelectValue placeholder="Select user" />
                        </SelectTrigger>
                        <SelectContent>
                            {users?.map((user, index) => {
                                return (
                                    <SelectItem key={user.id} value={user.id}>
                                        <div className='flex gap-2 items-center'>
                                            <Avatar className='h-6 w-6 rounded-md'>
                                                <AvatarFallback className='bg-sky-600 rounded-md'>{user.displayName?.substring(0, 1)}</AvatarFallback>
                                            </Avatar>
                                            <div className='flex flex-row gap-4'>
                                                <span>{user.displayName}</span>
                                                <span>({user.role})</span>
                                            </div>
                                        </div>

                                    </SelectItem>
                                )
                            })}
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="ghost" size={'sm'} disabled={loading} onClick={() => { setOpen(false) }}>Cancel</Button>
                    </DialogClose>
                    <Button variant={'outline'} size={'sm'} onClick={() => { handleAddMember() }} disabled={loading}>
                        {loading && <Loader className=' animate-spin' />}
                        Add Member
                    </Button>
                </DialogFooter>
            </DialogContent>

        </Dialog>
    )
}

export default AddMemberModal;
