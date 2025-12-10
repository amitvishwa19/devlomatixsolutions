'use server'
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { prisma } from "../../../../../../prisma/prisma";
import { v4 as uuidv4 } from 'uuid'
import { MemberRole } from "@prisma/client";
import useAuth from "@/hooks/useAuth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { AppMailer } from "@/utils/AppMailer";
import ServerNotification from "@/emails/ServerNotification";
redirect

const DeleteServer = z.object({
    orgId: z.string(),
});

const handler = async (data) => {
    const { userId } = await useAuth()

    const { orgId } = data;
    let deletedServer;
    let server;
    let servers;

    try {
        console.log('Delete server')

        deletedServer = await db.server.findFirst({
            where: {
                id: orgId
            },
            include: {
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


        await db.server.delete({
            where: {
                id: orgId,
                userId
            }
        })

        server = await db.server.findFirst({
            where: {
                userId: userId,
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

        servers = await db.server.findMany({
            where: {
                userId
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

        if (deletedServer) {
            deletedServer.members.forEach(async (i) => {

                await AppMailer({
                    to: i.user.email,
                    from: 'Devlomatix <noreply@devlomatix.online>',
                    subject: `Organizational workspace ${deletedServer.name} deleted`,
                }, < ServerNotification
                    mailData={
                        {
                            type: 'delete',
                            name: i.user.displayName,
                            orgTitle: deletedServer.name,
                            orgUrl: `${process.env.APP_URL}/workspace/${deletedServer.id}`
                        }
                    }
                />)
            })
            //await CreateBordEmail({ server, board })
        }


    } catch (error) {
        console.log(error)
        return {
            error: "Failed to delete server"
        }
    }

    revalidatePath(`/workspace/${server.id}`)
    return { data: { deletedServer, server, servers } };

}


export const deleteServer = createSafeAction(DeleteServer, handler);