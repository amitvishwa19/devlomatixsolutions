'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { AppMailer } from "@/utils/AppMailer";
import ListNotification from "@/emails/ListNotification";

const DeletePiller = z.object({
    id: z.string(),
    boardId: z.string(),
    orgId: z.string(),
});

const handler = async (data) => {

    const { id, boardId, orgId } = data;
    let board;
    let piller;
    let server;

    try {

        board = await db.board.findFirst({
            where: {
                id: boardId,
            }
        })

        piller = await db.list.delete({
            where: { id, boardId }
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

        if (piller) {
            server.members.forEach(async (i) => {

                const mailData = {
                    name: i.user.displayName,
                    title: piller.title,
                    path: ``
                }

                await AppMailer({
                    to: i.user.email,
                    from: 'Devlomatix <noreply@devlomatix.online>',
                    subject: `Taskboard-${board?.title}'s list  ${piller.title} deleted`,
                }, < ListNotification
                    mailData={
                        {
                            type: 'delete',
                            name: i.user.displayName,
                            title: piller.title,
                            path: ``
                        }
                    }
                />)
            })
        }


    } catch (error) {
        return {
            error: "Failed to delete list."
        }
    }

    //revalidatePath(`/project/taskman/board/${boardId}`)
    return { data: { server, board, piller } };

}


export const deletePiller = createSafeAction(DeletePiller, handler);