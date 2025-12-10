'use client'
import { createNewPiller } from '@/actions/taskman/taskman'
import { createPiller } from '@/app/(workspace)/workspace/[orgId]/board/_actions/_list/create_piller'
import { updatePiller } from '@/app/(workspace)/workspace/[orgId]/board/_actions/_list/update_piller '
import { FormInput } from '@/components/global/FormInput'
import { Button } from '@/components/ui/button'
import { useAction } from '@/hooks/use-action'
import { Copy, Loader, Plus, Trash2, XIcon } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import React, { forwardRef, useEffect, useRef, ElementRef, useState, KeyboardEventHandler } from 'react'
import { toast } from 'sonner'
import { MoreVertical } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger, PopoverClose } from "@/components/ui/popover"
import { Separator } from '@/components/ui/separator'
import { deletePiller } from '@/app/(workspace)/workspace/[orgId]/board/_actions/_list/delete_piller '
import { copyPiller } from '@/app/(workspace)/workspace/[orgId]/board/_actions/_list/copy_piller'
import { FormTextarea } from '@/components/global/FormTextarea'
import { FormSubmit } from '@/components/global/FormSubmit'
import { createTaskCard } from '@/actions/taskman/create_task_card'
import { useAuth } from '@/providers/AuthProvider'
import { cn } from '@/lib/utils'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { updatePillerOrder } from '@/actions/org/taskman/update_piller_order'
import { updateCardOrder } from '@/actions/org/taskman/update_card_order'
import { moveCardToOtherPiller } from '@/actions/org/taskman/move_card_to_other_piller'
import { useCardModal } from '@/hooks/useCardModal'


function reorder(list, startIndex, endIndex) {
    const result = Array.from(list)
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)
    return result
}

export default function PillerListContainer({ data, boardId }) {

    const [orderedData, setOrderedData] = useState(JSON.parse(data))


    const { execute: executeUpdatePillerOrder } = useAction(updatePillerOrder, {
        onSuccess: (data) => {
            toast.success('Piller reordered successfully')
        },
        onError: (error) => {
            toast.error(error)
        }
    })

    const { execute: executeUpdateCardOrder } = useAction(updateCardOrder, {
        onSuccess: (data) => {
            toast.success('Task Card reordered successfully')
        },
        onError: (error) => {
            toast.error(error)
        }
    })

    const { execute: executeMoveCardToOtherPiller } = useAction(moveCardToOtherPiller, {
        onSuccess: (data) => {
            toast.success('Task Card moved  successfully')
        },
        onError: (error) => {
            toast.error(error)
        }
    })

    useEffect(() => {
        //setOrderedData(JSON.parse(data))
    }, [data])



    const onDragEnd = (result) => {

        const { destination, source, type } = result;

        if (!destination) { return; }

        // if dropped in the same position
        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) { return; }

        // User moves a list
        if (type === "list") {
            const items = reorder(
                orderedData,
                source.index,
                destination.index,
            ).map((item, index) => ({ ...item, order: index }));

            setOrderedData(items);
            executeUpdatePillerOrder({ items, boardId });
        }

        // User moves a card
        if (type === "card") {
            let newOrderedData = [...orderedData];

            // Source and destination list
            const sourceList = newOrderedData.find(list => list._id === source.droppableId);
            const destList = newOrderedData.find(list => list._id === destination.droppableId);


            if (!sourceList || !destList) { return; }

            // Check if cards exists on the sourceList
            if (!sourceList.tasks) {
                sourceList.tasks = [];
            }

            // Check if cards exists on the destList
            if (!destList.tasks) {
                destList.tasks = [];
            }

            // Moving the card in the same list
            if (source.droppableId === destination.droppableId) {
                const reorderedCards = reorder(
                    sourceList.tasks,
                    source.index,
                    destination.index,
                );

                reorderedCards.forEach((card, idx) => {
                    card.order = idx;
                });

                sourceList.tasks = reorderedCards;



                setOrderedData(newOrderedData);
                executeUpdateCardOrder({
                    boardId: boardId,
                    pillerId: sourceList._id,
                    items: reorderedCards,
                });


                // User moves the card to another list
            } else {
                // Remove card from the source list
                const [movedCard] = sourceList.tasks.splice(source.index, 1);

                // Assign the new listId to the moved card
                movedCard.piller = destination.droppableId;

                // Add card to the destination list
                destList.tasks.splice(destination.index, 0, movedCard);

                sourceList.tasks.forEach((card, idx) => {
                    card.order = idx;
                });

                // Update the order for each card in the destination list
                destList.tasks.forEach((card, idx) => {
                    card.order = idx;
                });

                setOrderedData(newOrderedData);

                console.log('newOrderedData', newOrderedData)
                executeMoveCardToOtherPiller({
                    boardId: boardId,
                    sourcePillerId: sourceList._id,
                    destPillerId: destList._id,
                    items: newOrderedData,
                });
            }
        }
    }

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId='lists' type='list' direction='horizontal'>
                {(provided) => (
                    <ol className='flex gap-x-3 h-full' ref={provided.innerRef} {...provided.droppableProps}>
                        {
                            orderedData?.map((piller, index) => {
                                return (
                                    <PillerListItem key={piller?.id} index={index} data={piller} />
                                )
                            })
                        }
                        {provided.placeholder}
                        <PillerForm />
                        <div className='flex-shrink-0 w-1' />
                    </ol>
                )}
            </Droppable>
        </DragDropContext>
    )
}


const PillerListItem = ({ data, index }) => {
    const textAareaRef = useRef(null)
    const formRef = useRef(null)
    const inputRef = useRef(null)
    const [isEditing, setIsEditing] = useState(false)



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
                    <div {...provided.dragHandleProps} className='w-full rounded-md bg-[#f1f2f4] shadow-md pb-2 text-slate-800'>
                        <PillerHeader
                            onAddTask={enableEditing}
                            data={data}
                        />
                        <Droppable droppableId={data.id} type='card'>
                            {(provided) => (
                                <ol ref={provided.innerRef} {...provided.droppableProps} className={cn('mx-1 px-1 py-0.5 flex flex-col gap-y-2', data.cards.length > 0 ? 'mt-2' : 'mt-0')}>
                                    {
                                        data?.cards?.map((task, index) => {
                                            return (
                                                < TaskCardItem index={index} key={task?.id} data={task} />
                                            )
                                        })
                                    }
                                    {provided.placeholder}
                                </ol>
                            )}
                        </Droppable>
                        <TaskForm
                            data={data}
                            pillerId={data?.id}
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

const TaskCardItem = ({ index, data }) => {

    const cardModal = useCardModal()

    return (
        <Draggable draggableId={data?.id} index={index}>
            {(provided) => (
                <div
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    ref={provided.innerRef}
                    role='button'
                    onClick={() => { cardModal.onOpen(data.id) }}
                    className="truncate border-2 border-transparent hover:bg-slate-200 py-2 px-3 text-sm bg-white rounded-md shadow-sm">
                    {data?.title}
                </div>
            )}
        </Draggable>
    )
}

const TaskForm = forwardRef(({ data, pillerId, isEditing, enableEditing, disableEditing }, ref) => {
    const { user } = useAuth()
    const params = useParams()
    const formRef = useRef(null)

    const { execute: createNewCard, fieldErrors } = useAction(createTaskCard, {
        onSuccess: (data) => {
            console.log(data)
            toast.success(`Card ${data.title} created`)
            formRef.current?.reset()
            disableEditing()
        },
        onError: (error) => {
            toast.error(error)
        }
    })

    const onKeyDown = (e) => {
        if (e.key === 'Escape') {
            disableEditing()
        }
    }

    const onTextAreaKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            formRef.current?.requestSubmit()
        }
    }

    const onSubmit = (formData) => {
        const title = formData.get('title')
        if (title === '') return toast.error('Provide a title for the card')


        createNewCard({ title, listId: pillerId, boardId: data?.boardId })
    }

    if (isEditing) {
        return (
            <form ref={formRef} action={onSubmit} className='m-1 py-0.5 px-1 space-y-4'>
                <FormTextarea
                    id='title'
                    onKeyDown={onTextAreaKeyDown}
                    ref={ref}
                    placeholder='Enter title for this Task Card'
                />
                <div className='flex item-center gap-x-1'>
                    <FormSubmit>
                        Add Task Card
                    </FormSubmit>
                    <Button size='sm' variant='ghost' onClick={disableEditing}>
                        <XIcon className='h-4 w-4' />
                    </Button>
                </div>
            </form>
        )
    }

    return (
        <div className='pt-2 px-2'>
            <Button variant='ghost' className='h-auto px-2 py-1.5 w-full justify-start text-sm font-medium' onClick={enableEditing}>
                <Plus className='w-4 h-4 mr-2' />
                Add a Card
            </Button>
        </div>
    )
})
TaskForm.displayName = "TaskForm";

const PillerHeader = ({ data, onAddTask }) => {
    const [title, setTitle] = useState(data?.title)
    const [isEditing, setIsEditing] = useState(false)
    const route = useRouter()
    const formRef = useRef(null)
    const inputRef = useRef(null)

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
            toast.success(`Piller title updated to ${data.title} `)
            setTitle(data.title)
            disableEditing()
            route.refresh()
        },

        onError: (error) => {
            toast.error(error)
        }
    })


    const onSubmit = async (formData) => {
        try {
            console.log('form submit', data)
            const title = formData.get('title')

            if (title === data.title) {
                console.log('No changes')
                return disableEditing()
            }

            execute({ title, id: data?._id, boardId: data?.board })
        } catch (error) {
            console.log('error while updating title', error)
        }
    }

    const onBlur = () => {
        formRef.current?.requestSubmit()
    }

    return (
        <div className='pt-2 px-2 text-sm font-semibold flex justify-between gap-x-2 items-center'>
            {
                isEditing ?
                    (
                        <form ref={formRef} action={onSubmit} className='flex-1 px-[2px]'>
                            {/* <input hidden id='id' name='id' value={data?._id} />
                            <input hidden id='boardId' name='boardId' value={data.board} /> */}
                            <FormInput
                                ref={inputRef}
                                onBlur={onBlur}
                                id='title'
                                className='text-sm px-2 py-2 h-7 font-medium border-transparent hover:border-input focus:border-input transition text-slate-900 shadow-none truncate'
                                placeholder='Enter Piller title'
                                defaultValue={title}
                            />

                        </form>
                    ) :
                    (<div className='w-full text-md px-2.5 py-1 h-7  font-semibold border-transparent' onClick={enableEditing}>
                        {title}
                    </div>)

            }
            <PillerHeaderOptions data={data} onAddTask={onAddTask} />
        </div>
    )
}

const PillerHeaderOptions = ({ data }) => {
    const closeRef = useRef(null)
    const route = useRouter()


    const { execute: executeDelete } = useAction(deletePiller, {
        onSuccess: (data) => {
            toast.success(`Piller deleted `)
            route.refresh()
        },

        onError: (error) => {
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
        console.log('first', data)
        executeDelete({ id: data?._id, boardId: data?.board })
        closeRef.current?.click()
    }

    const handleCopyPiller = () => {
        console.log('first', data)
        executeCopy({ id: data?._id, boardId: data?.board })
        closeRef.current?.click()
    }

    return (

        <Popover>
            <PopoverTrigger asChild>
                <MoreVertical className='h-4 w-4' />
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

const PillerForm = () => {
    const formRef = useRef(null)
    const inputRef = useRef(null)
    const [isEditing, setIsEditing] = useState(false)
    const [processing, setProcessing] = useState(false)
    //useEventListner('keydown', onKeyDown)
    const params = useParams()
    const route = useRouter()

    const enableEditing = () => {
        setIsEditing(true)
        setTimeout(() => {
            inputRef.current.focus()
        })
    }

    const disableEditing = () => {
        setIsEditing(false)
    }

    const onKeyDown = (e) => {
        if (e.key === 'Escape') {
            disableEditing()
        }
    }

    const { execute, fieldErrors, isLoading } = useAction(createPiller, {
        onSuccess: (data) => {
            toast.success(`Piller ${data.title} created`)
            disableEditing()
            route.refresh()
        },

        onError: (error) => {
            toast.error(error)
        }
    })



    const onBlur = () => {
        disableEditing()
    }

    const onSubmit = async (formData) => {
        const title = formData.get('title')
        const boardId = params.boardId
        execute({ title, boardId })
    }

    if (isEditing) {
        return (
            <PillerWrapper>
                <form ref={formRef} action={onSubmit} className='w-full p-3 rounded-sm bg-slate-200 space-y-4 shadow-md'>
                    <FormInput
                        ref={inputRef}
                        errors={fieldErrors}
                        id='title'
                        // onBlur={disableEditing}
                        className='text-sm px-2 py-2 h-7 font-medium border-transparent hover:border-input focus:border-input transition text-slate-900 shadow-none '
                        placeholder='Enter Piller title'
                    />

                    <div className='flex justify-between'>
                        <Button variant='outline' onClick={disableEditing} className='bg-slate-900'>Cancel</Button>
                        <Button disabled={isLoading} variant='primary'>{isLoading && <Loader className='w-4 h-4 animate-spin mr-2' />} Add Piller</Button>
                    </div>
                </form>

            </PillerWrapper>
        )
    }

    return (
        <PillerWrapper>

            <button className='w-full rounded-md  bg-white/80 hover:bg-white/50 transition p-3 flex items-center font-medium text-sm text-slate-800' onClick={enableEditing}>
                <Plus className='w-4 h-4' />
                Add a Piller
            </button>
        </PillerWrapper>
    )
}
const PillerWrapper = ({ children }) => {
    return (
        <li className='shrink-0 h-full w-[272px] select-none'>
            {children}
        </li>
    )
}