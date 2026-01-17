'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import useAuth from "@/hooks/useAuth";
import { MemberRole } from "@prisma/client";
import { CreateChannelMail } from "../_mails/create-channel";

const CreateChannel = z.object({
    orgId: z.string(),
    name: z.string(),
    type: z.string(),
});

const handler = async (data) => {
    const { user } = await useAuth()
    const { orgId, name, type } = data;
    let channel;
    let server;

    try {

        channel = await db.server.update({
            where: {
                id: orgId,
                members: {
                    some: {
                        userId: user.id,
                        role: {
                            in: [MemberRole.ADMIN, MemberRole.MODERATOR]
                        }
                    }
                }
            },
            data: {
                channels: {
                    create: {
                        userId: user.id,
                        name,
                        type,
                    }
                }
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

        // const mailData = {
        //     name: user.displayName,
        //     boardTitle: title,
        //     type: 'create',
        //     boardUrl: `dashboard/org/${orgId}/board/${board.id}`
        // }


        // if (board) {
        //     AppMailer(
        //         user.email,
        //         'Devlomatix Info <info@devlomatix.online>',
        //         `Taskboard ${title} created successfully`,
        //         <BoardNotification mailData={mailData} />,
        //     )
        // }

        await CreateChannelMail({ server, channel })


    } catch (error) {
        console.log(error)
        return {
            error: "Failed to create channel"
        }
    }


    return { data: { server, channel } };

}


export const createChannel = createSafeAction(CreateChannel, handler);