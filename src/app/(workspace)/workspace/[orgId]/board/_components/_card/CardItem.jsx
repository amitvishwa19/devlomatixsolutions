'use client'

import React, { forwardRef, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { useCardModal } from '@/hooks/useCardModal'
import { Draggable } from '@hello-pangea/dnd'
import { CardModal } from './CardModal'
import { EditCardModal } from './EditCardModal'
import { useParams } from 'next/navigation'



export const CardItem = ({ index, data, boardId, listId, server, userId }) => {

    return (
        <Draggable draggableId={data?.id} index={index}>
            {(provided) => (
                <div
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    ref={provided.innerRef}
                    role='button'
                    // onClick={() => { cardModal.onOpen(data.id) }}
                    className={`font-semibold rounded-sm shadow-md bg-slate-200 hover:bg-slate-300 flex relative overflow-hidden`} >

                    <CardModal data={data} boardId={boardId} listId={listId} />
                    {/* <EditCardModal data={data} boardId={boardId} listId={listId} server={server} userId={userId} /> */}
                </div>

            )}
        </Draggable>
    )
}




