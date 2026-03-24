import { db } from '@/lib/db';

export async function getWorkspaceData(userId) {


    // 1. Default server WITH current user's roles and permissions
    const defaultServer = await db.server.findFirst({
        where: {
            members: {
                some: { userId },
            },
            default: true,
        },
        select: {
            id: true,
            name: true,
            imageUrl: true,
            inviteCode: true,
            description: true,
            // _count: {
            //     select: {
            //         members: true,
            //         channels: true,
            //         appointments: true,
            //     },
            // },

        },
    });

    // 2. Current user with roles/permissions (separate query)
    const currentUser = await db.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
            displayName: true,
            email: true,
            avatar: true,
            role: true,
            roles: {
                where: { status: true },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    color: true,
                    permissions: {
                        where: { status: true },
                        select: {
                            id: true,
                            title: true,
                            value: true,
                            description: true,
                            category: true,
                        },
                    },
                },
            },
        },
    });


    const servers = await db.server.findMany({
        where: {
            members: {
                some: { userId },
            },
        },
        select: {
            id: true,
            name: true,
            imageUrl: true,
            default: true,
        },
        orderBy: { createdAt: 'desc' },
    });

    const hospital = await db.hospital.findMany({
        where: {
            members: {
                some: { id: userId },
            }
        },
    })


    const appSettings = await db.appSettings.findFirst({
        where: { key: 'global' }
    })



    console.log('@@hospital member', hospital)

    return {
        hospital,
        defaultServer,
        currentUser,
        servers,
        appSettings,
    };
}
