'use server'
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';



import React from 'react'

export default async function InvitePage({ params }) {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.userId;
    const { inviteCode } = await params

    //const userSlug = router.query.slug


    if (!userId) {
        return redirect('/')
    }

    if (!inviteCode) {
        return redirect('/')
    }

    const existingServer = await db.server.findFirst({
        where: {
            inviteCode: inviteCode,
            members: {
                some: {
                    userId: session?.user?.userId
                }
            }
        }
    });

    if (existingServer) {
        return redirect(`/workspace/${existingServer.id}`);
    }

    const server = await db.server.update({
        where: {
            inviteCode: inviteCode,
        },
        data: {
            members: {
                create: [
                    {
                        userId: userId,
                    }
                ]
            }
        }
    });



    // if (server) {
    //     return redirect(`/workspace/${server.id}`);
    // }

    //return null

    return (
        <div>
            <div>UserId: {userId}</div>
            <div>Invite Code: {inviteCode}</div>
        </div>

    )
}
