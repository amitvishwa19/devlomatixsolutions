'use client'
import React, { useContext, useState } from 'react'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useModal } from '@/hooks/useModal'
import { useOrigin } from '@/hooks/useOrigin'
import { useAction } from '@/hooks/use-action'
import { deleteServer } from '../_action/server/delete_server'
import { useRouter } from 'next/navigation'
import { OrgContext } from '@/providers/OrgProvider'
import { toast } from 'sonner'



export default function DeleteServerModal() {
    const { onOpen, isOpen, onClose, type, data } = useModal()
    const origin = useOrigin();
    const router = useRouter()
    const { loading, updateLoading, updateServer, updateServers } = useContext(OrgContext)

    const isModalOpen = isOpen && type === "deleteServer";
    const { serverId } = data;


    const { execute, isLoading } = useAction(deleteServer, {
        onSuccess: (data) => {
            console.log(data)
            updateServer(data?.server)
            updateServers(data?.servers)
            updateLoading(false)
            //onClose()

            if (data?.server) {
                router.push(`/workspace/${data?.server?.id}`)
            } else {
                router.push(`/`)
            }

            toast.success(`Organizational workspace ${data?.deletedServer?.name} deleted`)
        },
        onError: (error) => {
            updateLoading(false)
            toast.error('Error while deleting this workspace')
        }
    })

    const handleDeleteOrg = () => {
        onClose()
        updateLoading(true)
        execute({ orgId: serverId })
    };


    const handleOpenChange = () => {
        onClose()
    }

    return (
        <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>

            <DialogContent className="sm:max-w-[525px] dark:text-white text-black p-0 overflow-hidden">
                <DialogHeader className="pt-4 px-6">
                    <DialogTitle className="text-xl text-center font-bold dark:text-white/90 text-slate-600">
                        Delete  Organizational Workspace
                    </DialogTitle>
                    <DialogDescription className='text-xs'>
                        All related data associated with this workspace will be lost ! Are you sure you want to delete  ?

                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className='dark:bg-slate-900 bg-gray-200 px-6 py-1-0 '>
                    <div className='flex items-center justify-between w-full mb-2'>
                        <Button
                            onClick={() => { onClose() }}
                            disabled={isLoading}
                            variant="outline"
                            size="sm"
                            className="text-xs mt-4 "
                        >

                            Cancel

                        </Button>

                        <Button
                            onClick={() => { handleDeleteOrg() }}
                            disabled={isLoading}
                            variant="outline"
                            size="sm"
                            className="text-xs mt-4 bg-[#117a65] hover:bg-[#0e6655]"
                        >
                            Delete Organization
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    )
}
