import useAuth from '@/hooks/useAuth'
import React from 'react'
import { redirect } from 'next/navigation'
import { getOrCreateConversation } from '@/lib/conversation'
import { db } from '@/lib/db'
import ChatHeader from '../../channel/_components/ChatHeader'
import MediaRoom from '../../channel/_components/media-room'
import { ChatMessages } from '../../channel/_components/ChatMessages'
import ChatInput from '../../channel/_components/ChatInput'



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
        <div className="bg-white dark:bg-[#313338] flex flex-col h-screen">

            <ChatHeader
                avatar={otherMember.user.avatar}
                name={otherMember.user.displayName}
                serverId={params.orgId}
                type=
                "conversation"
            />
            {searchParams.video && (
                <MediaRoom
                    chatId={conversation.id}
                    video={true}
                    audio={true}
                    name={name}
                />
            )}
            {!searchParams.video && (
                <>
                    <ChatMessages
                        member={currentMember}
                        name={otherMember.user.displayName}
                        chatId={conversation.id}
                        type="conversation"
                        apiUrl="/api/v1/org/direct-messages"
                        socketUrl="/api/socket/direct-messages"
                        socketQuery={{
                            conversationId: conversation.id,
                            userId: userId
                        }}
                        paramKey="conversationId"
                        paramValue={conversation.id}
                    />


                    <ChatInput
                        name={otherMember.user.displayName}
                        type='conversation'
                        apiUrl='/api/socket/direct-messages'
                        query={{
                            conversationId: conversation.id,
                            userId: userId
                        }}
                    />
                </>
            )}


        </div>
    )
}
