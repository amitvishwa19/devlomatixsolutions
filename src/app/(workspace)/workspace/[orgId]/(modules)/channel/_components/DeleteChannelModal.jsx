'use client'
import React, { useContext, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useModal } from '@/hooks/useModal'
import { useOrigin } from '@/hooks/useOrigin'
import { Loader } from 'lucide-react'
import { useAction } from '@/hooks/use-action'
import { toast } from 'sonner'
import { OrgContext } from '@/providers/OrgProvider'
import { deleteChannel } from '../_actions/delete-channel'



export default function DeleteChannelModal() {
    const [open, setOpen] = useState(false)
    const [processing, setProcessing] = useState(false)
    const { onOpen, isOpen, onClose, type, data } = useModal()
    const origin = useOrigin();
    const { updateLoading, updateServer } = useContext(OrgContext)

    const isModalOpen = isOpen && type === "deleteChannel";
    const { server, channel } = data;


    const { execute, isLoading } = useAction(deleteChannel, {
        onSuccess: (data) => {
            updateServer(data.server)
            updateLoading(false)
            toast.success(`Channel ${data.name} deleted`)
        },
        onError: (error) => {
            updateLoading(false)
            toast.error(error)
        }
    })

    const handleDelete = async () => {
        onClose()
        updateLoading(true)
        execute({ orgId: server.id, channelId: channel.id, name: channel.name })
    };




    return (
        <Dialog open={isModalOpen} onOpenChange={onClose}>

            <DialogContent className="p-4 overflow-hidden">
                <DialogHeader className="flex flex-col gap-6">
                    <DialogTitle className="text-2xl text-center font-bold dark:text-white/80 mt-4">
                        Delete Channel
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this ? <span className='font-semibold text-indigo-500'>{channel?.name}</span> will be permanently deleted.

                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className=' px-6 py-1-0 '>
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
                            onClick={handleDelete}
                            disabled={isLoading}
                            variant="outline"
                            size="sm"
                            className="text-xs mt-4 "
                        >
                            {
                                isLoading && <Loader className={`w-4 h-4 mr-2 animate-spin`} />
                            }

                            Delete

                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
