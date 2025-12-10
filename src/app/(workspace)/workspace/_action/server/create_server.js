'use server'
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { v4 as uuidv4 } from 'uuid'
import { MemberRole } from "@prisma/client";
import useAuth from "@/hooks/useAuth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { AppMailer } from "@/utils/AppMailer";
import ServerNotification from "@/emails/ServerNotification";
import { put } from '@vercel/blob'

const CreateServer = z.object({
    name: z.string(),
    imageUrl: z.string(),
    userId: z.string(),
    file: z.optional(z.any()),
    type: z.optional(z.string()),
    size: z.optional(z.number())
});

const handler = async (data) => {


    const { name, imageUrl, userId, file } = data;
    let newServer;
    let server;
    let servers;
    let blob;
    let imgUrl = null

    console.log('data from server', data)

    try {

        const formFile = file.get('file')

        console.log('formFile', formFile)

        if (formFile) {
            blob = await put(name, file.get('file'), {
                access: 'public'
            })
            imgUrl = blob.url
        }

        console.log('formFile', formFile)
        console.log('imageUrl', imageUrl)

        newServer = await db.server.create({
            data: {
                userId,
                name,
                imageUrl: (formFile == null) ? imageUrl : blob.url,
                inviteCode: uuidv4(),
                channels: {
                    create: [{ name: 'general', userId }]
                },
                members: {
                    create: [
                        {
                            userId,
                            role: MemberRole.ADMIN
                        }
                    ]
                }
            }
        })

        server = await db.server.findFirst({
            where: {
                id: newServer.id,
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

            },
            orderBy: {
                createdAt: "desc",
            },
        })

        if (server) {
            server.members.forEach(async (i) => {

                await AppMailer({
                    to: i.user.email,
                    from: 'Devlomatix <noreply@devlomatix.online>',
                    subject: `New Organizational workspace ${server.name} created`,
                }, < ServerNotification
                    mailData={
                        {
                            type: 'create',
                            name: i.user.displayName,
                            orgTitle: server.name,
                            orgUrl: `${process.env.APP_URL}/workspace/${server.id}`
                        }
                    }
                />)
            })
            //await CreateBordEmail({ server, board })
        }



    } catch (error) {
        console.log(error)
        return {
            error: "Failed to create organizational workspace"
        }
    }
    revalidatePath(`/workspace/${newServer.id}`)
    return { data: { server, servers } };

}


export const createServer = createSafeAction(CreateServer, handler);