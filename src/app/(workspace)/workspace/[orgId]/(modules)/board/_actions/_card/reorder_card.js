'use server'
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { AppMailer } from "@/utils/AppMailer";
import CardNotification from "@/emails/CardNotification";

const UpdateCardOrder = z.object({
    items: z.array(
        z.object({
            id: z.string(),
            title: z.string(),
            order: z.number(),
            listId: z.string(),
        })
    ),
    boardId: z.string(),
    orgId: z.string(),
});

const handler = async (data) => {

    const { items, boardId, orgId } = data;
    //console.log('update card data', data)
    let updatedCards;
    let server;
    let board;
    let list;


    try {
        const transaction = items.map((card) =>
            db.card.update({
                where: { id: card.id },
                data: {
                    order: card.order,
                    listId: card.listId,
                },
            }),
        );

        updatedCards = await db.$transaction(transaction);

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
        list = board?.lists?.find(i => i.id === items.listId)

        if (list) {
            server.members.forEach(async (i) => {

                await AppMailer({
                    to: i.user.email,
                    from: 'Devlomatix <noreply@devlomatix.online>',
                    subject: `Status of Task  changed`,
                }, < CardNotification
                    mailData={
                        {
                            type: 'order',
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
            error: "Failed to reorder cards."
        }
    }



    return { data: updatedCards };

}


export const updateCardOrder = createSafeAction(UpdateCardOrder, handler);