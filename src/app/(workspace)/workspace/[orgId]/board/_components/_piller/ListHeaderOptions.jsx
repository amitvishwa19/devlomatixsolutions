'use client'

import { useAction } from '@/hooks/use-action'
import { Copy, Loader, Plus, Trash2, XIcon } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import React, { forwardRef, useContext, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { MoreVertical } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger, PopoverClose } from "@/components/ui/popover"
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { OrgContext } from '@/providers/OrgProvider'
import { deletePiller } from '../../_actions/_list/delete_piller '
import { copyPiller } from '../../_actions/_list/copy_piller'



export const ListHeaderOptions = ({ data }) => {
    const { orgId, boardId } = useParams()
    const closeRef = useRef(null)
    const route = useRouter()
    const { loading, updateLoading, updateServer } = useContext(OrgContext)


    const { execute: executeDelete } = useAction(deletePiller, {
        onSuccess: (data) => {
            updateLoading(false)
            updateServer(data?.server)
            toast.success(`Piller ${data?.piller?.title} deleted `)
        },

        onError: (error) => {
            updateLoading(false)
            toast.error(error)
        }
    })

    const { execute: executeCopy } = useAction(copyPiller, {
        onSuccess: (data) => {
            toast.success(`Piller ${data?.title} copied`)
            route.refresh()
        },

        onError: (error) => {
            toast.error(error)
        }
    })

    const handleDeletePiller = () => {
        updateLoading(true)
        executeDelete({ id: data?.id, boardId, orgId })
        closeRef.current?.click()
    }

    const handleCopyPiller = () => {
        executeCopy({ id: data?.id, boardId: data?.boardId })
        closeRef.current?.click()
    }

    return (

        <Popover>
            <PopoverTrigger asChild>
                <MoreVertical className='h-4 w-4 cursor-default dark:text-darkText' />
            </PopoverTrigger>

            <PopoverContent className="w-60 px-2 py-4" side='bottom' align='start'>

                <PopoverClose ref={closeRef} asChild className='mb-2'>
                    <div className='flex justify-between text-sm'>
                        <span>Piller Options</span>
                        <XIcon className='h-4 w-4 cursor-pointer ' />
                    </div>
                </PopoverClose>

                <Separator />
                <ol className='flex flex-col gap-4 mt-4'>
                    <div type='button' className='flex items-center justify-between text-xs cursor-default'>
                        Add Card
                        <Plus className='w-4 h-4' />
                    </div>
                    <div className='flex items-center justify-between text-xs cursor-default' onClick={handleCopyPiller}>
                        Copy Piller
                        <Copy className='w-4 h-4' />
                    </div>
                    <div className='flex items-center justify-between text-xs cursor-default' onClick={handleDeletePiller}>
                        Delete
                        <Trash2 className='w-4 h-4' />
                    </div>
                </ol>
            </PopoverContent>
        </Popover>
    )
}