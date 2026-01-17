'use client'
import React, { forwardRef, useContext, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Droppable, Draggable } from '@hello-pangea/dnd'
import { CardForm } from '../_card/CreateCard'
import { CardItem } from '../_card/CardItem'
import { useParams, useRouter } from 'next/navigation'
import { useAction } from '@/hooks/use-action'
import { toast } from 'sonner'
import { OrgContext } from '@/providers/OrgProvider'
import { Input } from '@/components/ui/input'
import { ListHeaderOptions } from './ListHeaderOptions'
import { updatePiller } from '../../_actions/_list/update_piller '
import { useSession } from 'next-auth/react'

export const ListItems = ({ data, index, boardId }) => {
    const textAareaRef = useRef(null)
    const formRef = useRef(null)
    const inputRef = useRef(null)
    const [isEditing, setIsEditing] = useState(false)
    const { data: session } = useSession()
    const { server } = useContext(OrgContext)

    const enableEditing = () => {
        setIsEditing(true)
        setTimeout(() => {

        })
    }

    const disableEditing = () => {
        setIsEditing(false)
    }

    return (
        <Draggable draggableId={data.id} index={index}>
            {(provided) => (
                <li {...provided.draggableProps} ref={provided.innerRef} className='shrink-0 h-full w-[272px] select-none'>
                    <div {...provided.dragHandleProps} className='w-full rounded-md dark:bg-slate-800/90 bg-gray-300 shadow-md pb-2 text-slate-800'>
                        <ListHeader
                            onAddTask={enableEditing}
                            data={data}
                        />
                        <Droppable droppableId={data.id} type='card'>
                            {(provided) => (
                                <ol ref={provided.innerRef} {...provided.droppableProps} className={cn('mx-1 px-1 py-0.5 flex flex-col gap-y-2', data.cards.length > 0 ? 'mt-2' : 'mt-0')}>
                                    {
                                        data?.cards?.map((task, index) => {
                                            return (
                                                <CardItem index={index} key={task?.id} data={task} boardId={boardId} listId={data?.id} server={server} userId={session?.user?.userId} />
                                            )
                                        })
                                    }
                                    {provided.placeholder}
                                </ol>
                            )}
                        </Droppable>
                        <CardForm
                            server={server}
                            data={data}
                            boardId={boardId}
                            pillerId={data?.id}
                            userId={session?.user?.userId}
                            ref={textAareaRef}
                            isEditing={isEditing}
                            enableEditing={enableEditing}
                            disableEditing={disableEditing}
                        />

                    </div>
                </li>
            )}
        </Draggable>
    )
}

const ListHeader = ({ data, onAddTask }) => {
    const [title, setTitle] = useState(data?.title)
    const [isEditing, setIsEditing] = useState(false)
    const route = useRouter()
    const formRef = useRef(null)
    const inputRef = useRef(null)
    const { loading, updateLoading } = useContext(OrgContext)
    const { orgId } = useParams()

    const enableEditing = () => {
        setIsEditing(true)
        setTimeout(() => {
            inputRef.current?.focus()
            inputRef.current?.select()
        })
    }

    const disableEditing = () => {
        setIsEditing(false)
    }

    const { execute, fieldErrors, isLoading } = useAction(updatePiller, {
        onSuccess: (data) => {
            console.log(data)

            toast.success(`Piller title updated to ${data.list?.title} `)
            updateLoading(false)
            setTitle(data?.list?.title)
            disableEditing()
            route.refresh()
        },

        onError: (error) => {
            disableEditing()
            updateLoading(false)
            toast.error(error)
        }
    })


    const onSubmit = () => {
        updateLoading(true)
        execute({ title, id: data?.id, boardId: data?.boardId, orgId })
    }

    const onBlur = () => {
        disableEditing()
        if (title !== data.title) {
            onSubmit()
        }
        //formRef.current?.requestSubmit()
    }

    const handleEnter = (e) => {
        if (e.key === 'Enter') {
            onBlur()
        }

    }

    return (
        <div className='pt-2 px-2 text-sm font-semibold flex justify-between gap-x-2 items-center'>
            {
                isEditing ?
                    (
                        <div ref={formRef} className='flex-1 px-[2px]' onBlur={onBlur}>
                            {/* <input hidden id='id' name='id' value={data?._id} />
                            <input hidden id='boardId' name='boardId' value={data.board} /> */}

                            <Input
                                ref={inputRef}
                                value={title}
                                onChange={(e) => { setTitle(e.target.value) }}
                                onKeyDown={handleEnter}
                                className='text-sm px-2 py-2 h-7 font-medium border-transparent hover:border-input focus:border-input transition dark:text-white text-slate-900 shadow-none truncate focus:text-white/80'
                            />

                        </div>
                    ) :
                    (<div className='w-full text-md px-2.5 py-1 h-7 dark:text-white  font-semibold border-transparent capitalize' onClick={enableEditing}>
                        {title}
                    </div>)

            }
            <ListHeaderOptions data={data} onAddTask={onAddTask} className='' />
        </div>
    )
}