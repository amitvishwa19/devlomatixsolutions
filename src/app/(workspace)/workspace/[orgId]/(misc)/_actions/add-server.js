'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { put } from '@vercel/blob'
import { db } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid'
import { MemberRole } from "@prisma/client";


const AddServer = z.object({
    userId: z.string(),
    title: z.string(),
    description: z.optional(z.string()),
    type: z.string(),
    file: z.optional(z.any()),
    fileName: z.optional(z.string()),
    size: z.optional(z.number())
});

const handler = async (data) => {
    const { title, description, type, file, fileName, size, userId } = data

    let newServer;
    let server = {};
    let servers = [];
    let imgUrl = null;
    let blob;

    try {

        if (file) {
            const formFile = file.get('file')
            blob = await put(fileName, file.get('file'), {
                access: 'public',
                allowOverwrite: true
            })
            imgUrl = blob.url

            const doc = await db.document.create({
                data: {
                    userId,
                    name: fileName,
                    url: blob.url,
                    type: blob.contentType,
                    size: size.toString()
                }
            })
        }


        // if (formFile) {
        //     blob = await put(fileName, file.get('file'), {
        //         access: 'public',
        //         allowOverwrite: true
        //     })
        //     imgUrl = blob.url
        // }



        newServer = await db.server.create({
            data: {
                userId,
                name: title,
                description,
                imageUrl: imgUrl,
                inviteCode: uuidv4(),
                type,
                setting: {
                    create: {}
                },
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
            },

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


    } catch (error) {
        console.log(error)
        return {
            message: "Oops!, something went wrong", error
        }
    }

    //revalidatePath(`/org/${orgId}`)
    return { data: { server, servers } };

}


export const addServer = createSafeAction(AddServer, handler);