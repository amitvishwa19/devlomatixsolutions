'use client'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { AlignJustify, AlignLeft, BookA, Copy, CreditCard, Trash2, X } from 'lucide-react'
import { useAction } from '@/hooks/use-action'
import { toast } from 'sonner'
import { useParams } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { setLoading, setServer } from '@/redux/slices/org'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { z } from 'zod';
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import moment from 'moment'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, } from "@/components/ui/sheet"
import { OrgContext } from '@/providers/OrgProvider'
import { updateCard } from '../../_actions/_card/update_card'
import { copyCard } from '../../_actions/_card/copy_card'
import { deleteSelectedCard } from '../../_actions/_card/delete_card'

const cardColor = [
    { 'priority': 'LOW', 'color': '#2563EB' },
    { 'priority': 'MEDIUM', 'color': '#059669' },
    { 'priority': 'HIGH', 'color': '#D97706' },
]


export function CardModal({ data, boardId, listId }) {
    return (
        <BoardListCard data={data} listId={listId} />
    )

}

const BoardListCard = ({ data, listId }) => {
    const [open, setOpen] = useState(false)
    const dispatch = useDispatch()
    const params = useParams()
    const { boardId, orgId } = params
    const [enableEditing, setEnableEditing] = useState({ title: false, desc: false })
    const [formData, setFormData] = useState({ title: data.title, description: data.description })
    const { updateLoading, updateServer } = useContext(OrgContext)
    const color = cardColor.find((item) => item.priority === data.priority)


    const { execute } = useAction(updateCard, {
        onSuccess: (data) => {
            updateLoading(false)
            updateServer(data.server)
            toast.success(`Task Card ${data.card.title} updated`)
        },
        onError: (error) => {
            updateLoading(false)
            toast.error(error)
        }
    })

    const onSubmit = () => {
        console.log({ id: data.id, title: formData.title, description: formData.description, orgId })
        onOpenChange()
        updateLoading(true)
        execute({ id: data.id, title: formData.title, description: formData.description, orgId })
    }

    const { execute: handleDeleteSelectedCard, fieldErrors } = useAction(deleteSelectedCard, {
        onSuccess: (data) => {
            updateLoading(false)
            updateServer(data.server)
            onOpenChange()
            toast.success(`Card ${data?.card?.title} deleted`)
        },
        onError: (error) => {
            toast.error(error)
        }
    })

    const handleDeleteCard = async () => {
        onOpenChange()
        updateLoading(true)
        handleDeleteSelectedCard({ id: data?.id, boardId, orgId, listId })
    }

    const { execute: copySelectedCard } = useAction(copyCard, {
        onSuccess: (data) => {
            updateLoading(false)
            updateServer(data.server)
            onOpenChange()
            toast.success(`Card ${data?.card?.title} copied`)
        },
        onError: (error) => {
            toast.error(error)
        }
    })


    const handleCardCopy = () => {
        onOpenChange()
        updateLoading(true)
        copySelectedCard({ id: data?.id, orgId, boardId, listId })
    }


    const onOpenChange = () => {
        setOpen(!open)

    }


    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetTrigger asChild>
                <div onClick={() => { }} className='flex flex-wrap text-wrap capitalize w-full p-2 border-l-[4px] ' style={{ borderLeftColor: `${color.color}` }}>
                    <div className='flex flex-col w-full gap-2'>
                        <div className='text-xs'>{data?.title}</div>
                        <div className='flex justify-start text-[8px] text-muted-foreground'>{moment(data.createdAt).format('Do MMM YY, h:mm a')}</div>
                    </div>

                </div>
            </SheetTrigger>
            <SheetContent className='min-w-[30%] text-white'>
                <SheetHeader>
                    <div className='flex w-full justify-end'>
                        <div className='flex gap-4'>
                            <Copy className='h-4 w-4 cursor-pointer' onClick={() => { handleCardCopy() }} />
                            <Trash2 className='h-4 w-4 cursor-pointer' onClick={() => { handleDeleteCard() }} />
                        </div>
                    </div>
                    <SheetTitle>Edit task card</SheetTitle>
                    <SheetDescription className='text-xs'>
                        Create a task card for this taskbord and manage workflow
                    </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 mt-6">
                    <div className="">
                        <Input
                            value={formData.title}
                            onChange={(e) => { setFormData({ ...formData, title: e.target.value }) }}
                            placeholder='Task card title'
                            className="col-span-3 focus:ring-0"
                        />
                    </div>
                    <div className="">
                        <Textarea
                            value={formData.description}
                            onChange={(e) => { setFormData({ ...formData, description: e.target.value }) }}
                            placeholder='Task card description'
                            className="col-span-3"
                            rows={'5'}
                        />
                    </div>
                    <div className='flex min-w-full'>
                        <Button variant='outline' className='w-full' onClick={onSubmit}>
                            Update Task Card
                        </Button>
                    </div>
                </div>

            </SheetContent>
        </Sheet>
    )
}

