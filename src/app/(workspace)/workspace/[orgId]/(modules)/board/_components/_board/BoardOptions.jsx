'use client'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger, PopoverClose } from "@/components/ui/popover"
import { MoreHorizontal, MoreVertical, X, Trash2, XIcon, Plus, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { redirect, useParams, useRouter } from 'next/navigation'
import { useAction } from '@/hooks/use-action'
import { Separator } from '@/components/ui/separator'
import { Switch } from "@/components/ui/switch"
import { useDispatch, useSelector } from 'react-redux'
import { OrgContext } from '@/providers/OrgProvider'
import { toggleBoardBackground } from '../../_actions/_board/board_background_toggle'
import { deleteBoard } from '../../_actions/_board/delete_board'


export default function BoardOptions() {
    const closeRef = useRef(null)
    const route = useRouter()
    const [showBackground, setShowBackground] = useState(true)
    const dispatch = useDispatch()
    const { boardId, orgId } = useParams()


    const { updateLoading, server, updateServer } = useContext(OrgContext)
    const board = server?.boards?.find(i => i.id === boardId)

    useEffect(() => {
        setShowBackground(board?.showBackground)
    }, [])

    const { execute: toggleBackground } = useAction(toggleBoardBackground, {
        onSuccess: (data) => {
            updateLoading(false)
            updateServer(data)
            closeRef.current?.click()
            toast.success('Background display toggle success')
        },
        onError: (error) => {
            updateLoading(false)
            toast.error(error)
        }
    })

    const handleBackgroundToggle = () => {
        closeRef.current?.click()
        updateLoading(true)
        setShowBackground(!showBackground)
        toggleBackground({ boardId: board?.id, orgId: orgId, showBackground: !board?.showBackground })
    }

    const { execute } = useAction(deleteBoard, {
        onSuccess: (data) => {
            updateLoading(false)
            closeRef.current?.click()
            toast.success(`Taskboard ${data.name} deleted successfully`)
            route.replace(`/workspace/${server.id}`)
        },
        onError: (error) => {
            updateLoading(false)
            toast.error(error)
        }
    })


    const handleBoardDelete = () => {
        closeRef.current?.click()
        updateLoading(true)
        execute({ boardId: board?.id, orgId: orgId })
    }


    return (
        <>
            <Popover >
                <PopoverTrigger asChild>
                    <MoreVertical className='h-4 w-4 text-gray-400' />
                </PopoverTrigger>

                <PopoverContent className="w-60 px-2 py-4 mr-4" side='bottom' align='start'>


                    <PopoverClose ref={closeRef} asChild className='mb-2'>
                        <div className='flex justify-between text-sm'>
                            <span>Board Options</span>
                            <XIcon className='h-4 w-4 cursor-pointer text-gray-400' />
                        </div>
                    </PopoverClose>



                    <Separator />
                    <ol className='flex flex-col gap-4 mt-4'>

                        <div className='flex items-center justify-between text-xs cursor-pointer' onClick={() => { }}>
                            Display Background
                            <Switch id="background" className='h-4 bg-red-600' checked={showBackground} onCheckedChange={handleBackgroundToggle} />
                        </div>


                        <div className='flex items-center justify-between text-xs cursor-pointer' onClick={() => { }}>
                            Copy Board
                            <Copy className='w-4 h-4' />
                        </div>
                        <div className='flex items-center justify-between text-xs cursor-pointer' onClick={handleBoardDelete}>
                            Delete
                            <Trash2 className='w-4 h-4' />
                        </div>
                    </ol>
                </PopoverContent>
            </Popover>


        </>
    )
}
