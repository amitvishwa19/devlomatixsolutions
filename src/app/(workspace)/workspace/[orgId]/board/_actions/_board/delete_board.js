'use server'
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { AppMailer } from "@/utils/AppMailer";
import BoardNotification from '@/emails/BoardNotification'

const DeleteBoard = z.object({
    boardId: z.string(),
    orgId: z.optional(z.string())
});

const handler = async (data) => {
    // const { user } = await useAuth()
    const { boardId, orgId } = data;
    let board;
    let server;
    //console.log('OrgId', orgId)
    try {

        board = await db.board.update({
            where: { id: boardId },
            data: {
                status: false
            }
        })


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




    } catch (error) {
        console.log(error)
        return {
            error: "Failed to delete board."
        }
    }

    //revalidatePath(`/dashboard/org/${orgId}`)
    //redirect(`/org/${orgId}`)
    return { data: server };

}


export const deleteBoard = createSafeAction(DeleteBoard, handler);