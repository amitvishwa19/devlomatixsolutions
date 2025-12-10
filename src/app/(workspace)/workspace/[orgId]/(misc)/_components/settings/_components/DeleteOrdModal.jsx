'use client'
import React, { useState } from 'react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useModal } from '@/hooks/useModal'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Loader, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { deleteOrg } from '../_action/delete-org'
import { useAction } from '@/hooks/use-action'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export function DeleteOrdModal() {
    const { data: session } = useSession()
    const { onOpen, onClose, isOpen, type, data } = useModal()
    const isModalOpen = isOpen && type === "deleteorg";
    const [delData, setDelData] = useState({ name: '', alias: '' })
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleOpenChange = () => {
        onClose()
    }

    const { execute } = useAction(deleteOrg, {
        onSuccess: (data) => {
            handleOpenChange()
            toast.success('Organization deleted successfully', { id: "delete-org" })
            router.push(`/workspace/${data?.id}`)
        },
        onError: (error) => {
            console.log(error)
        }
    })

    const handleDeleteOrg = () => {
        if (delData.name !== data?.server?.name) return toast.error(`Organization name “${data?.server?.name}” is required`)
        if (delData.alias !== 'delete my organization') return toast.error(`Typing “delete my organization” is required`)

        setLoading(true)
        toast.loading(`Deleting organization, please wait....`, { id: "delete-org" })
        execute({ userId: session?.user?.userId, serverId: data?.server?.id })

        console.log({ userId: session?.user?.userId, serverId: data?.server?.id })

        setTimeout(() => {

            setLoading(false)
        }, 2000);
    }


    return (
        <AlertDialog open={isModalOpen} onOpenChange={handleOpenChange}>

            <AlertDialogContent className='dark:bg-darkPrimaryBackground'>

                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Organization?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete the orzanization and related resources like settings and organization related data.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className='flex flex-col gap-2'>
                    <Label>To confirm,type '{data?.server?.name}' </Label>
                    <Input value={delData.name} disabled={loading} onChange={(e) => { setDelData({ ...delData, name: e.target.value }) }} />
                </div>

                <div className='flex flex-col gap-2'>
                    <Label>To confirm,type 'delete my organization' </Label>
                    <Input value={delData.alias} disabled={loading} onChange={(e) => { setDelData({ ...delData, alias: e.target.value }) }} />
                </div>


                <AlertDialogFooter>
                    <Button size={'sm'} variant={'outline'} disabled={loading} onClick={() => { onClose() }}>Cancel</Button>
                    <Button size={'sm'} variant={'destructive'} disabled={loading} onClick={() => { handleDeleteOrg() }}>
                        {loading && <Loader className=' animate-spin ' />}Delete Organization
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
