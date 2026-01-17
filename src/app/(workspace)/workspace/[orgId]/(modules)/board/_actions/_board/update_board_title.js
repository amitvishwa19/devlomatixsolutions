'use server'
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";

const UpdateBoardTitile = z.object({
    title: z.string({
        required_error: "Title is required",
        invalid_type_error: "Title is required",
    }).min(3, {
        message: "Title is too short",
    }),
    boardId: z.string(),
});

const handler = async (data) => {

    const { title, boardId } = data;
    let board;

    try {


        board = await db.board.update({
            where: { id: boardId },
            data: { title }
        })


    } catch (error) {

        return {
            error: error.message
        }
    }

    revalidatePath(`/project/taskman/board/${boardId}`)
    return { data: board };

}


export const updateBoardTitle = createSafeAction(UpdateBoardTitile, handler);