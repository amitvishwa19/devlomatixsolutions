'use server'
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { prisma } from "../../../../../../../../prisma/prisma";

const CopyPiller = z.object({
    id: z.string(),
    boardId: z.string(),
});

const handler = async (data) => {

    const { id, boardId } = data;
    let list;

    try {

        const listToCopy = await prisma.list.findUnique({
            where: {
                id,
                boardId,
            },
            include: { cards: true },
        });

        if (!listToCopy) {
            return { error: 'List not found' }
        }



        const lastList = await prisma.list.findFirst({
            where: { boardId },
            orderBy: { order: "desc" },
            select: { order: true },
        });

        const newOrder = lastList ? lastList.order + 1 : 1



        list = await prisma.list.create({
            data: {
                boardId: listToCopy.boardId,
                title: `${listToCopy.title} - Copy`,
                order: newOrder,
                cards: {
                    createMany: {
                        data: listToCopy.cards.map((card) => ({
                            title: card.title,
                            description: card.description,
                            order: card.order,
                        })),
                    },
                },
            },
            include: {
                cards: true,
            },
        });

        //for copy task add task create many and pillercopy tasks map and create


    } catch (error) {
        console.log(error)
        return {
            error: "Failed to copy the list."
        }
    }

    revalidatePath(`/project/taskman/board/${boardId}`)
    return { data: list };

}


export const copyPiller = createSafeAction(CopyPiller, handler);