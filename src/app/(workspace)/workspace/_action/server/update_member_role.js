'use server'
import useAuth from '@/hooks/useAuth'
import { db } from '@/lib/db'
import { MemberRole } from '@prisma/client'
import { includes, orderBy } from 'lodash'
import React from 'react'

export async function updateMemberRole(memberId, serverId, role) {

    try {

        const { userId } = useAuth()

        // if (!userId || !serverId) {
        //     return null
        // }

        const server = await db.server.update({
            where: {
                id: serverId,
                userId
            },
            data: {
                members: {
                    update: {
                        where: {
                            id: memberId,
                            userId: { not: userId }
                        },
                        data: {
                            role: role
                        }
                    }
                }
            },
            include: {
                members: {
                    include: {
                        user: true
                    },
                    orderBy: {
                        role: 'asc'
                    }
                }
            }
        })

        return server;
    } catch (error) {
        return null;
    }
    return 'Member updated' + memberId
}
