import useAuth from '@/hooks/useAuth'
import React from 'react'
import { redirect } from 'next/navigation'
import { getOrCreateConversation } from '@/lib/conversation'
import { db } from '@/lib/db'



export default async function MemberIdPage({ params, searchParams, }) {

    const { userId, name } = await useAuth()

    if (!userId) {
        redirect('/auth/login')
    }

    const currentMember = await db.member.findFirst({
        where: {
            serverId: params.orgId,
            userId: userId,
        },
        include: {
            user: true,
        },
    });

    //console.log(currentMember)

    if (!currentMember) {
        redirect('/')
    }

    const conversation = await getOrCreateConversation(currentMember.id, params.memberId);

    //console.log('conversation', conversation)

    if (!conversation) {
        return redirect(`/org/${params.orgId}`);
    }

    const { memberOne, memberTwo } = conversation;

    const otherMember = memberOne.userId === userId ? memberTwo : memberOne;

    return (
        <div className="bg-white dark:bg-[#313338] flex flex-col h-screen items-center justify-center p-4">
            <h2 className="text-xl font-bold">Conversation with {otherMember.user.displayName}</h2>
            <p className="text-muted-foreground mt-2">
                The conversation interface is currently being updated as shared components were removed.
            </p>
        </div>
    )
}
