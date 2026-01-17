'use server'
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";


const GetCardData = z.object({
    id: z.string(),
    boardId: z.optional(z.string()),
    listId: z.optional(z.string())
});

const handler = async (data) => {

    const { id } = data;
    let card;

    try {


        card = await db.card.findUnique({
            where: { id },
            include: { list: { select: { title: true, } } },
        });



    } catch (error) {
        console.log(error)
        return {
            error: "Failed to get all boards"
        }
    }

    //revalidatePath(`/project/taskman/board/${boardId}`)
    return { data: card };

}


export const getCardData = createSafeAction(GetCardData, handler);