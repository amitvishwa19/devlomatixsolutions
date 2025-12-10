'use server'
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";

const UpdateCard = z.object({
    id: z.string(),
    boardId: z.optional(z.string()),
    title: z.optional(z.string({
        required_error: "Title is required",
        invalid_type_error: "Title is required",
    }).min(3, {
        message: "Title is too short",
    })),
    description: z.optional(
        z.string({
            required_error: "Description is required",
            invalid_type_error: "Description is required",
        })
    ),
    orgId: z.string()
});

const handler = async (data) => {
    console.log('update card acction')
    const { id, orgId, boardId, ...values } = data;
    let card;
    let server;

    try {
        //console.log('updating card  from server action orgId', orgId)

        card = await db.card.update({
            where: { id },
            data: {
                ...values,
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
                            },
                            orderBy: {
                                createdAt: "desc",
                            },
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
            error: "Failed to update card"
        }
    }

    revalidatePath(`/dashboard/org/${orgId}/board/${boardId}`)
    return { data: { card, server } };

}


export const updateCard = createSafeAction(UpdateCard, handler);