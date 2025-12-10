'use server'
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { v4 as uuidv4 } from 'uuid'
import { MemberRole, ROLE } from "@prisma/client";
import useAuth from "@/hooks/useAuth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { AppMailer } from "@/utils/AppMailer";
import ServerNotification from "@/emails/ServerNotification";
import { put } from '@vercel/blob'

const GetServerData = z.object({
    userId: z.string(),
    serverId: z.optional(z.string())
});

const handler = async (data) => {
    const { userId, serverId } = data
    let server
    let servers
    let users

    try {



        servers = await db.server.findMany({
            where: {
                members: {
                    some: { userId }
                }
            },
            include: {
                appointments: {
                    include: {
                        doctor: {
                            include: {
                                profile: true
                            }
                        },
                        patient: {
                            include: {
                                profile: true
                            }
                        },
                    },
                    orderBy: {
                        createdAt: "desc",
                    }
                },
                setting: true,
                user: {
                    include: {
                        profile: true,
                        roles: {
                            include: {
                                permissions: true
                            }
                        },
                        servers: true
                    }
                },
                roles: {
                    include: {
                        permissions: true
                    }
                },
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
                        user: {
                            include: {
                                servers: {
                                    where: {
                                        default: true
                                    },
                                    include: {
                                        setting: true,
                                        appointments: true
                                    },

                                }
                            }
                        },
                        server: true
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

        users = await db.user.findMany({
            include: {
                medicalProfile: true,
                profile: true,
                servers: true

            },
            orderBy: {
                createdAt: "desc",
            }
        })


    } catch (error) {
        console.log(error)
        return {
            error: "Failed to create organizational workspace"
        }
    }

    return { data: { servers, server, users } };

}


export const getServerData = createSafeAction(GetServerData, handler);