'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { MemberRole } from "@prisma/client";
import useAuth from "@/hooks/useAuth";
import { db } from "@/lib/db";
import { DeleteChannelMail } from "../_mails/delete-channel";


const DeleteChannel = z.object({
    orgId: z.string(),
    channelId: z.string(),
    name: z.string()
});

const handler = async (data) => {
    const { userId } = await useAuth()

    const { orgId, channelId, name } = data;
    let server;

    try {
        server = await db.server.update({
            where: {
                id: orgId,
                members: {
                    some: {
                        userId,
                        role: {
                            in: [MemberRole.ADMIN, MemberRole.MODERATOR]
                        }
                    }
                }
            },
            data: {
                channels: {
                    delete: {
                        id: channelId,
                        name: {
                            not: "general"
                        }
                    }
                }
            }

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


        await DeleteChannelMail({ server, channelId, name })

    } catch (error) {
        return { error: "Failed to delete channel" }
    }


    return { data: { server, name } };

}


export const deleteChannel = createSafeAction(DeleteChannel, handler);