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
            _count: {
                select: {
                    members: true,
                    channels: true,
                    appointments: true,
                },
            },

        },
    });

    // 2. Current user with roles/permissions (separate query)
    const currentUser = await db.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
            online: true,
            status: true,
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

    const users = await db.user.findMany({
        where: {
            members: {
                some: {
                    serverId: { in: servers.map(s => s.id) },
                },
            },
        },
        select: {
            id: true,
            name: true,
            avatar: true,
        },
        take: 100,
    });

    const appSettings = await db.appSettings.findFirst({
        where: { key: 'global' }
    })



    return {
        defaultServer,
        currentUser,
        servers,
        users,
        appSettings,
    };
}
