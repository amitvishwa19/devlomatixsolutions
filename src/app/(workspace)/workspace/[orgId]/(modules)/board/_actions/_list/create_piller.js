'use server'
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { AppMailer } from "@/utils/AppMailer";
import ListNotification from "@/emails/ListNotification";

const CreatePiller = z.object({
    title: z.string(),
    boardId: z.string(),
    orgId: z.string()
});

const handler = async (data) => {

    const { title, boardId, orgId } = data;
    let server;
    let board;
    let piller;

    console.log(data)


    try {
        const lastList = await db.list.findFirst({
            where: { boardId: boardId },
            orderBy: { order: "desc" },
            select: { order: true },
        });
        const newOrder = lastList ? lastList.order + 1 : 1
        //piller = await Piller.create({ title, board: boardId, order: newOrder })

        board = await db.board.findFirst({
            where: {
                id: boardId,
            }
        })

        piller = await db.list.create({
            data: { boardId, title, order: newOrder }
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

                await AppMailer({
                    to: i.user.email,
                    from: 'Devlomatix <noreply@devlomatix.online>',
                    subject: `Taskboard-${board?.title}'s  new list  ${piller.title} created`,
                }, < ListNotification
                    mailData={
                        {
                            type: 'create',
                            name: i.user.displayName,
                            title: piller.title,
                            path: `${process.env.APP_URL}/workspace/${orgId}/board/${board.id}`
                        }
                    }
                />)
            })
        }


    } catch (error) {
        console.log(error)
        return {
            error: "Failed to create new piller."
        }
    }


    return { data: { server, board, piller } };

}


export const createPiller = createSafeAction(CreatePiller, handler);