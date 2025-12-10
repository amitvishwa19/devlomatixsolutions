'use server'
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/utils/CreateSafeAction";

const MoveCardToOtherPiller = z.object({
    items: z.array(
        z.object({
            id: z.string(),
            title: z.string(),
            order: z.number(),
            cards: z.any()
            //createdAt: z.date(),
            //updatedAt: z.date()
        })
    ),
    boardId: z.string(),
    sourcePillerId: z.string(),
    destPillerId: z.string(),
});

const handler = async (data) => {

    const { items, boardId, sourcePillerId, destPillerId } = data;
    console.log('handler data', items)
    let lists;


    try {
        const transaction = items.map((list) =>
            prisma.list.update({
                where: {
                    id: list.id
                },
                data: {
                    order: list.order,
                },
            })
        );

        lists = await prisma.$transaction(transaction);


    } catch (error) {
        return {
            error: "Failed to move card to other piller."
        }
    }

    revalidatePath(`/project/taskman/board/${boardId}`)
    return { data: lists };

}


export const moveCardToOtherPiller = createSafeAction(MoveCardToOtherPiller, handler);