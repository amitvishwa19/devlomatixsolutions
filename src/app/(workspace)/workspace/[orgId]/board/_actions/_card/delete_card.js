'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { AppMailer } from "@/utils/AppMailer";
import CardNotification from "@/emails/CardNotification";

const DeleteCard = z.object({
    id: z.string(),
    boardId: z.optional(z.string()),
    orgId: z.string(),
    listId: z.string()
});

const handler = async (data) => {
    console.log('card delete')
    const { id, boardId, orgId, listId } = data;
    let server;
    let board;
    let list;
    let card;

    try {
        console.log('Delete card', data)

        card = await db.card.delete({
            where: { id },
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

        board = server?.boards?.find(i => i.id === boardId)
        list = board?.lists?.find(i => i.id === listId)

        if (card) {
            server.members.forEach(async (i) => {

                await AppMailer({
                    to: i.user.email,
                    from: 'Devlomatix <noreply@devlomatix.online>',
                    subject: `Task ${card.title} deleted`,
                }, < CardNotification
                    mailData={
                        {
                            type: 'delete',
                            user: i.user,
                            server,
                            board,
                            list,
                            card,
                            link: `${process.env.APP_URL}/workspace/${server.id}/board/${board.id}`
                        }
                    }
                />)
            })
        }

    } catch (error) {
        console.log(error)
        return {
            error: "Failed to delete card"
        }
    }

    //revalidatePath(`/dashboard/org/board/${boardId}`)
    return { data: { server, card } };

}


export const deleteSelectedCard = createSafeAction(DeleteCard, handler);