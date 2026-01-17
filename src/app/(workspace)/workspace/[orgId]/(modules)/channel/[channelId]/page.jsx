'use client'
import React, { useContext, useEffect, useState } from 'react'
import { redirect, useParams, useRouter } from 'next/navigation'
//import { ChannelType } from '@prisma/client'
//import ChatInput from '../_components/ChatInput'
//import { ChatMessages } from '../_components/ChatMessages'
import ChatHeader from '../_components/ChatHeader'
//import MediaRoom from '../_components/media-room'
import { OrgContext } from '@/providers/OrgProvider'
import { useAuth } from '@/providers/AuthProvider'
import { ChannelType } from '@prisma/client'
import { ChatMessages } from '../_components/ChatMessages'
import ChatInput from '../_components/ChatInput'
import MediaRoom from '../_components/media-room'
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAction } from '@/hooks/use-action'
import { getMessage } from '../_actions/get-message'
import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchItems } from '../_utils/messages'

export default function ChannelPage({ params }) {
    const router = useRouter()
    const { orgId, channelId } = useParams()
    const { user } = useAuth()
    const { server, setChatMessages, chatMessages, fetchChatMessages } = useContext(OrgContext)
    const channel = server?.channels?.find(i => i?.id === channelId)
    const member = server?.members?.find(i => i?.user?.id === user?.id)
    const messages = channel?.messages


    useEffect(() => {
        // if (!channel) {
        //     router.replace('/')
        // }
    }, [])

    // useEffect(() => {
    //     handleFetchMessages({ orgId, channelId })
    // }, [])

    // const { execute: handleFetchMessages } = useAction(getMessage, {
    //     onSuccess: (data) => {
    //         console.log('data from get-message action', data)
    //         setChatMessages(data?.messages)
    //     },
    //     onError: (error) => {
    //         toast.error('Error while creating board ,Please try again later', error)
    //     }
    // })

    // const items = Array.from({ length: 100 }).map((_, i) => ({
    //     id: i,
    //     name: `Item ${i}`
    // }))




    // const {
    //     data,
    //     status,
    //     error,
    //     isFetchingNextPage,
    //     hasNextPage,
    // } = useInfiniteQuery({
    //     queryKey: ['messages'],
    //     queryFn: fetchItems,
    //     initialPageParam: 0,
    //     getNextPageParam: (lastPage) => lastPage.nextPage,
    //     refetchInterval: 1000
    // })

    // useEffect(() => {
    //     console.log('Fetch msg data', data, status, error, isFetchingNextPage, hasNextPage)
    //     console.log('status', status)
    // }, [data, chatMessages])






    return (
        <div className="flex flex-col absolute inset-0 ">

            <div>
                <ChatHeader
                    name={channel?.name}
                    serverId={channel?.serverId}
                    type='channel'
                />
            </div>


            <div className='flex flex-1 flex-col overflow-auto'>

                <ScrollArea className=' flex-1 h-full overflow-auto'>
                    <ChatMessages
                        member={member}
                        name={channel?.name}
                        chatId={channel?.id}
                        type="channel"
                        apiUrl="/api/v1/org/messages"
                        // socketUrl="/api/socket/messages"

                        socketQuery={{
                            channelId: channel?.id,
                            serverId: channel?.serverId,
                            userId: user?.id
                        }}
                        paramKey="channelId"
                        paramValue={channel?.id}
                    />
                </ScrollArea>


                <div className=''>
                    <ChatInput
                        name={channel?.name}
                        member={member}
                        type='channel'
                        apiUrl='/api/socket/messages'
                        query={{ channelId: channel?.id, serverId: channel?.serverId, userId: user?.id }}
                    />
                </div>
            </div>

            {channel?.type === ChannelType.AUDIO && (
                <MediaRoom
                    chatId={channel.id}
                    video={false}
                    audio={true}
                    userId={user.id}
                    name={'name'}
                />
            )}

            {channel?.type === ChannelType.VIDEO && (
                <MediaRoom
                    chatId={channel.id}
                    video={true}
                    audio={true}
                    userId={user.id}
                    name={'name'}
                />
            )}


        </div>
    )
}
