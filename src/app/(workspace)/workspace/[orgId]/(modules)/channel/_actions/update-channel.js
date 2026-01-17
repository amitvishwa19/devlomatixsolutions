'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { MemberRole } from "@prisma/client";
import useAuth from "@/hooks/useAuth";
import { db } from "@/lib/db";
import { UpdateChannelMail } from "../_mails/update-channel";


const UpdateChannel = z.object({
    name: z.string(),
    type: z.string(),
    orgId: z.string(),
    channelId: z.string()
});

const handler = async (data) => {
    const { userId } = await useAuth()

    const { name, type, orgId, channelId } = data;

    let channel;
    let server

    if (name === 'general') {
        return {
            error: "Channel name cannot be general"
        }
    }

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
                    update: {
                        where: {
                            id: channelId,
                            NOT: {
                                name: 'general'
                            }
                        },
                        data: {
                            name, type
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



        await UpdateChannelMail({ server, channelId })

    } catch (error) {
        console.log(error)
        return {
            error: "Failed to update channel"
        }
    }

    //revalidatePath(`/org//${server.id}`)
    return { data: { name, server } };

}


export const updateChannel = createSafeAction(UpdateChannel, handler);