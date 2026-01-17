// 'use client'

// import React, { forwardRef, useEffect, useRef, ElementRef, useState, KeyboardEventHandler } from 'react'
// import { cn } from '@/lib/utils'
// import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
// import { ListHeader } from './ListHeader'
// import { CardForm } from './CardForm'

// export function Card({ index, data }) {
//     const textAareaRef = useRef(null)
//     const formRef = useRef(null)
//     const inputRef = useRef(null)
//     const [isEditing, setIsEditing] = useState(false)



//     const enableEditing = () => {
//         setIsEditing(true)
//         setTimeout(() => {

//         })
//     }

//     const disableEditing = () => {
//         setIsEditing(false)
//     }

//     return (
//         <Draggable draggableId={data.id} index={index}>
//             {(provided) => (
//                 <li {...provided.draggableProps} ref={provided.innerRef} className='shrink-0 h-full w-[272px] select-none'>
//                     <div {...provided.dragHandleProps} className='w-full rounded-md bg-[#f1f2f4] shadow-md pb-2 text-slate-800'>
//                         <ListHeader
//                             onAddTask={enableEditing}
//                             data={data}
//                         />
//                         <Droppable droppableId={data.id} type='card'>
//                             {(provided) => (
//                                 <ol ref={provided.innerRef} {...provided.droppableProps} className={cn('mx-1 px-1 py-0.5 flex flex-col gap-y-2', data?.cards?.length > 0 ? 'mt-2' : 'mt-0')}>
//                                     {
//                                         data?.cards?.map((task, index) => {
//                                             return (
//                                                 < TaskCardItem index={index} key={task?.id} data={task} />
//                                             )
//                                         })
//                                     }
//                                     {provided.placeholder}
//                                 </ol>
//                             )}
//                         </Droppable>
//                         <CardForm
//                             data={data}
//                             pillerId={data?.id}
//                             ref={textAareaRef}
//                             isEditing={isEditing}
//                             enableEditing={enableEditing}
//                             disableEditing={disableEditing}
//                         />
//                     </div>
//                 </li>
//             )}
//         </Draggable>
//     )
// }
