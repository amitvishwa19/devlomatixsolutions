'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";

const UpdatePillerOrder = z.object({
    items: z.array(
        z.object({
            id: z.string(),
            title: z.string(),
            order: z.number(),
            //createdAt: z.date(),
            //updatedAt: z.date()
        })
    ),
    boardId: z.string(),
    orgId: z.optional(z.string())
});

const handler = async (data) => {

    const { items, boardId, orgId } = data;
    console.log('Piller list reorder')

    let lists;
    let server;

    try {
        const transaction = items.map((list) =>
            db.list.update({
                where: {
                    id: list.id
                },
                data: {
                    order: list.order,
                },
            })
        );

        lists = await db.$transaction(transaction);

        console.log('list from action', lists)

        server = await db.server.findFirst({
            where: {
                id: orgId
            },
            include: {
                channels: {
                    orderBy: {
                        createdAt: "asc",
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
                        createdAt: "asc",
                    },
                },
                members: {
                    include: {
                        user: true,
                    },
                    orderBy: {
                        role: "asc",
                    }
                },

            }
        })

        //console.log(server)

    } catch (error) {
        console.log(error)
        return {
            error: "Failed to reorder the list."
        }
    }

    //revalidatePath(`/project/taskman/board/${boardId}`)
    return { data: server };

}


export const updatePillerOrder = createSafeAction(UpdatePillerOrder, handler);