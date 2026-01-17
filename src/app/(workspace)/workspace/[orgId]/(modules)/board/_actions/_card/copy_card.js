'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { AppMailer } from "@/utils/AppMailer";
import CardNotification from "@/emails/CardNotification";

const CopyCard = z.object({
    id: z.string(),
    orgId: z.optional(z.string()),
    boardId: z.optional(z.string()),
    listId: z.optional(z.string()),
});

const handler = async (data) => {

    const { id, orgId, boardId, listId } = data;
    let server;
    let board;
    let card;
    let list;

    try {

        const cardToCopy = await db.card.findUnique({
            where: { id },
        });

        if (!cardToCopy) {
            return { error: 'Card not found' }
        }



        const lastCard = await db.card.findFirst({
            where: { listId },
            orderBy: { order: "desc" },
            select: { order: true },
        });

        const newOrder = lastCard ? lastCard.order + 1 : 1



        card = await db.card.create({
            data: {
                listId: cardToCopy.listId,
                title: `${cardToCopy.title} - Copy`,
                description: `${cardToCopy.description}`,
                order: newOrder,

            }
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
            error: "Failed to copy the card."
        }
    }

    //revalidatePath(`/project/taskman/board/${boardId}`)
    return { data: { card, server } };

}


export const copyCard = createSafeAction(CopyCard, handler);