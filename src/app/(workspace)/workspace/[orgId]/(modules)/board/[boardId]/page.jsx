'use client'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { useParams } from 'next/navigation';
import { OrgContext } from '@/providers/OrgProvider';
import { useAction } from '@/hooks/use-action';
import { updatePillerOrder } from '../_actions/_list/update_piller_order';
import { updateCardOrder } from '../_actions/_card/reorder_card';
import { moveCardToOtherPiller } from '../_actions/_card/move_card_to_other_piller';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { ListItems } from '../_components/_piller/ListItems';
import { toast } from 'sonner';
import { ListForm } from '../_components/_piller/ListForm';



function reorder(list, startIndex, endIndex) {
    const result = Array.from(list)
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)
    return result
}

export default function BoardIdPage({ params }) {
    const { boardId, orgId } = useParams()
    const { server } = useContext(OrgContext)
    const board = server?.boards?.find(i => i.id === boardId)
    const data = board?.lists
    const [orderedData, setOrderedData] = useState(data)
    const { loading, updateLoading } = useContext(OrgContext)


    useEffect(() => {
        if (data) {
            let pillerList = []
            data.forEach((item) => {
                pillerList.push(item)
            })

            setOrderedData(pillerList.sort((a, b) => a.order - b.order))
        }
    }, [data])

    const { execute: executeUpdatePillerOrder } = useAction(updatePillerOrder, {
        onSuccess: (data) => {
            console.log('piller reorder', data)
            updateLoading(false)
            toast.success('List reordered successfully', { id: 'reorder-list' })
        },
        onError: (error) => {
            updateLoading(false)
            toast.error(error)
        }
    })

    const handlePillerReorder = (data) => {
        //updateLoading(true)
        toast.loading('Reordering List...', { id: 'reorder-list' })
        executeUpdatePillerOrder(data);
    }

    const { execute: executeUpdateCardOrder } = useAction(updateCardOrder, {
        onSuccess: (data) => {
            updateLoading(false)
            toast.success('Card reordered successfully', { id: 'reorder-card' })
        },
        onError: (error) => {
            updateLoading(false)
            toast.error(error)
        }
    })

    const handleCardReorder = (data) => {
        console.log({ ...data, orgId, boardId })
        //updateLoading(true)
        toast.loading('Reordering card...', { id: 'reorder-card' })
        executeUpdateCardOrder({ ...data, orgId, boardId })
    }

    const { execute: executeMoveCardToOtherPiller } = useAction(moveCardToOtherPiller, {
        onSuccess: (data) => {
            toast.success('Task Card moved  successfully')
        },
        onError: (error) => {
            toast.error(error)
        }
    })



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
            handlePillerReorder({ items, boardId, orgId })

        }

        // User moves a card
        if (type === "card") {
            let newOrderedData = [...orderedData];

            // Source and destination list
            let sourceList = newOrderedData.find(list => list.id === source.droppableId);
            let destList = newOrderedData.find(list => list.id === destination.droppableId);

            if (!sourceList || !destList) { return; }

            // Check if cards exists on the sourceList
            if (!sourceList.cards) {
                sourceList.cards = [];
            }

            // Check if cards exists on the destList
            if (!destList.cards) {
                destList.cards = [];
            }

            // Moving the card in the same list
            if (source.droppableId === destination.droppableId) {
                let reorderedCards = reorder(
                    sourceList.cards,
                    source.index,
                    destination.index,
                );

                reorderedCards.forEach((card, idx) => {
                    card.order = idx;
                });

                sourceList.cards = reorderedCards;
                setOrderedData(newOrderedData);
                handleCardReorder({
                    boardId: boardId,
                    items: reorderedCards,
                })


                // User moves the card to another list
            } else {
                // // Remove card from the source list
                const [movedCard] = sourceList.cards.splice(source.index, 1);

                // // Assign the new listId to the moved card
                movedCard.listId = destination.droppableId;

                // // Add card to the destination list
                destList.cards.splice(destination.index, 0, movedCard);

                sourceList.cards.forEach((card, idx) => {
                    card.order = idx;
                });

                // // Update the order for each card in the destination list
                destList.cards.forEach((card, idx) => {
                    card.order = idx;
                });

                setOrderedData(newOrderedData);
                handleCardReorder({
                    boardId: boardId,
                    items: destList.cards,
                })
            }
        }
    }

    return (

        <div className='flex-1 h-full '>


            <div className='p-2'>
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId='lists' type='list' direction='horizontal'>
                        {(provided) => (
                            <ol className='flex gap-x-3 h-full' ref={provided.innerRef} {...provided.droppableProps}>
                                {
                                    orderedData?.map((piller, index) => {
                                        return (
                                            <ListItems key={piller?.id} index={index} data={piller} boardId={boardId} />
                                        )
                                    })
                                }
                                {provided.placeholder}
                                <ListForm />
                                <div className='flex-shrink-0 w-1 ' />
                            </ol>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>
        </div>

    )
}
