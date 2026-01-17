'use server'
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { AppMailer } from "@/utils/AppMailer";
import ListNotification from "@/emails/ListNotification";

const UpdatePiller = z.object({
    title: z.string(),
    id: z.string(),
    boardId: z.string(),
    orgId: z.string()
});

const handler = async (data) => {
    const { title, id, boardId, orgId } = data;
    let server;
    let board;
    let oldList;
    let list;


    try {

        board = await db.board.findFirst({
            where: {
                id: boardId,
            }
        })

        oldList = await db.list.findFirst({
            where: { id, boardId }
        })

        list = await db.list.update({
            where: { id, boardId },
            data: { title }
        })

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


        if (list) {
            server.members.forEach(async (i) => {
                await AppMailer({
                    to: i.user.email,
                    from: 'Devlomatix <noreply@devlomatix.online>',
                    subject: `Taskboard-${board?.title}'s list  ${oldList.title}  updated to  ${list.title}`,
                }, < ListNotification
                    mailData={
                        {
                            type: 'title-update',
                            name: i.user.displayName,
                            boardTitle: board?.title,
                            oldTitle: oldList.title,
                            updatedTitle: list.title,
                            path: `/workspace/${orgId}/board/${boardId}`
                        }
                    }
                />)
            })
        }



    } catch (error) {
        console.error(error)
        return {
            error: "Failed to update ,Please try again."
        }
    }

    return { data: { oldList, list } };

}


export const updatePiller = createSafeAction(UpdatePiller, handler);