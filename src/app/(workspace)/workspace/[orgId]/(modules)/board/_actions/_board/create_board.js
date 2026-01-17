'use server'
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { AppMailer } from "@/utils/AppMailer";
import BoardNotification from '@/emails/BoardNotification'
import useAuth from "@/hooks/useAuth";
import { DEFAULTBOARDPILLERS } from "@/constants/boards";


const CreateBoard = z.object({
    orgId: z.string(),
    title: z.string(),
    description: z.string(),
    avatar: z.string(),
});

const handler = async (data) => {
    const { user } = await useAuth()
    const { orgId, title, description, avatar } = data;
    let board;
    let server;

    try {

        board = await db.board.create(
            {
                data: {
                    serverId: orgId,
                    title,
                    description,
                    avatar,
                    showBackground: false
                }
            }
        )

        if (board) {
            DEFAULTBOARDPILLERS.forEach(async (piller, index) => {
                await db.list.create({
                    data: { boardId: board.id, title: piller.title, order: index }
                })
            })
        }

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


        if (board && server) {
            server.members.forEach(async (i) => {

                const mailData = {
                    name: i.user.displayName,
                    boardTitle: board.title,
                    boardPath: `${process.env.APP_URL}/workspace/${orgId}/board/${board.id}`
                }

                await AppMailer({
                    to: i.user.email,
                    from: 'Devlomatix <noreply@devlomatix.online>',
                    subject: `New taskboard ${board.title} created`,
                }, < BoardNotification
                    mailData={
                        {
                            type: 'create',
                            name: i.user.displayName,
                            boardTitle: board.title,
                            boardUrl: `${process.env.APP_URL}/workspace/${orgId}/board/${board.id}`
                        }
                    }
                />)
            })
        }


        //console.log(server.members)

    } catch (error) {
        console.log(error)
        return {
            error: "Failed to create new board."
        }
    }

    revalidatePath(`/dashboard/org/${orgId}`)
    return { data: { server, board } };

}


export const createBoard = createSafeAction(CreateBoard, handler);