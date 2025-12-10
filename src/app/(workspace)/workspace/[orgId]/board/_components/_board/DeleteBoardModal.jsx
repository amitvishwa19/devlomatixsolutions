'use client'
import React, { useContext, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useModal } from '@/hooks/useModal'
import { useOrigin } from '@/hooks/useOrigin'
import { Check, Copy, RefreshCw, Loader } from 'lucide-react'
import { useAction } from '@/hooks/use-action'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { setLoading, setServer } from '@/redux/slices/org'
import { OrgContext } from '@/providers/OrgProvider'
import { deleteBoard } from '../../_actions/_board/delete_board'




export default function DeleteBoardModal({ params }) {
    const [open, setOpen] = useState(false)
    const [processing, setProcessing] = useState(false)
    const { onOpen, isOpen, onClose, type, data } = useModal()
    const origin = useOrigin();
    const router = useRouter()
    const dispatch = useDispatch()
    const { loading, updateLoading, updateServer } = useContext(OrgContext)

    const isModalOpen = isOpen && type === "deleteBoard";
    const { board, orgId } = data;


    const { execute, isLoading } = useAction(deleteBoard, {
        onSuccess: (data) => {
            updateLoading(false)
            updateServer(data)
            setProcessing(false)
            toast.success(`Board deleted`)
        },
        onError: (error) => {
            console.log('Error deleteting board', error)
            setProcessing(false)
            updateLoading(false)
        }
    })

    const handleDelete = async () => {
        handleClose()
        updateLoading(true)
        setProcessing(true)
        execute({ boardId: board.id, orgId })
    };

    const handleClose = () => {
        onClose()
        setProcessing(false)
    }


    return (
        <Dialog open={isModalOpen} onOpenChange={handleClose}>

            <DialogContent className="sm:max-w-[625px] dark:text-white text-black p-0 overflow-hidden">
                <DialogHeader className="pt-2 px-6">
                    <DialogTitle className="text-xl text-center font-bold text-slate-600">
                        Delete Board
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this ? <span className='font-semibold text-indigo-500'>{board?.title}</span> will be permanently deleted.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className='dark:bg-slate-900 bg-gray-200 px-6 py-1-0 '>
                    <div className='flex items-center justify-between w-full mb-2'>
                        <Button
                            onClick={handleClose}
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
                                processing && <Loader className={`w-4 h-4 mr-2 animate-spin`} />
                            }

                            Delete

                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
