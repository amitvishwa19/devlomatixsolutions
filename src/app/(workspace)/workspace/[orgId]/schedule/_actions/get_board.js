'use server'
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { prisma } from "../../../../../../../prisma/prisma";

const GetBoard = z.object({

    boardId: z.string(),
});

const handler = async (data) => {

    const { boardId } = data;
    let board;

    try {



    } catch (error) {
        console.log(error)
        return {
            error: "Failed to get all boards"
        }
    }

    //revalidatePath(`/project/taskman/board/${boardId}`)
    return { data: 'board' };

}


export const getBoard = createSafeAction(GetBoard, handler);