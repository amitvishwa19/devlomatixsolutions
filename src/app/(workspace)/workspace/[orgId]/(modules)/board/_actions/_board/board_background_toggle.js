'use server'
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";

const ToggleBoardBackground = z.object({
    boardId: z.optional(z.string()),
    showBackground: z.optional(z.boolean()),
    orgId: z.optional(z.string())
});

const handler = async (data) => {

    const { boardId, showBackground, orgId } = data;
    let board;
    let server;

    try {

        board = await db.board.update({
            where: { id: boardId },
            data: {
                showBackground: showBackground
            },
        });

        server = await db.server.findFirst({
            where: {
                id: orgId
            },
            include: {
                channels: {
                    orderBy: {
                        createdAt: "desc",
                    },
                },
                boards: {
                    where: {
                        status: true
                    },
                    include: {
                        lists: {
                            include: {
                                cards: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: "desc",
                    },
                },
                members: {
                    include: {
                        user: true,
                    },
                    orderBy: {
                        role: "desc",
                    }
                },

            }
        })


    } catch (error) {
        console.log(error)
        return {
            error: "Failed to update Board"
        }
    }

    revalidatePath(`/dashboard/org/${orgId}/board/${boardId}`)
    return { data: server };

}


export const toggleBoardBackground = createSafeAction(ToggleBoardBackground, handler);