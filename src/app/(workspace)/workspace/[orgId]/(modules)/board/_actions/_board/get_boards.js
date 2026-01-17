'use server'
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { prisma } from "../../../../../../prisma/prisma";

const GetBoards = z.object({

    orgId: z.string(),
});

const handler = async (data) => {

    const { orgId } = data;
    let boards;

    try {
        //console.log('Getting Boards', orgId)
        // boards = await prisma.boards.findMany({
        //     where: { organizationId: orgId }
        // })

        //for copy task add task create many and pillercopy tasks map and create
        boards = await prisma.board.findMany({
            where: { organizationId: orgId },
            select: {
                id: true,
                title: true,
                description: true,
                avatar: true,
                status: true,
            },
            orderBy: { title: 'asc' }
        });

        //console.log('boards', boards)



    } catch (error) {
        console.log(error)
        return {
            error: "Failed to get all boards"
        }
    }

    //revalidatePath(`/project/taskman/board/${boardId}`)
    return { data: boards };

}


export const getBoards = createSafeAction(GetBoards, handler);