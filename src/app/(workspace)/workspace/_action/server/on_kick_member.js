'use server'
import useAuth from '@/hooks/useAuth'
import { db } from '@/lib/db'
import { MemberRole } from '@prisma/client'
import { includes, orderBy } from 'lodash'
import React from 'react'

export async function onKickMember(memberId, serverId) {

    try {
        console.log('kick out member  server action')
        const { userId } = useAuth()

        // if (!userId || !serverId) {
        //     return null
        // }

        const server = db.server.update({
            where: {
                id: serverId,
                userId
            },
            data: {
                members: {
                    deleteMany: {
                        id: memberId,
                        userId: {
                            not: userId
                        }
                    }
                }
            }, include: {
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
