'use client'
import React from 'react'
import { ChannelType } from '@prisma/client'
import { Edit, Hash, Lock, Mic, Trash, Video } from "lucide-react";
import { useRouter } from 'next/navigation';


export function ChannelItem({ channel }) {
    const router = useRouter()



    const handleClick = () => {
        router.push(`/org/${channel?.serverId}/channel/${channel.id}`)
    }

    return (
        <div
            className='group relative min-aspect-video aspect-auto bg-no-repeat bg-center bg-cover dark:bg-[#162C46] bg-slate-900/40 rounded-sm h-full w-full p-2 overflow-hidden cursor-pointer'
            onClick={handleClick}
        >
            <div className='flex flex-col gap-2 text-sm items-start item'>
                <div className='flex items-center gap-2'>
                    {channel.type === ChannelType.TEXT && <Hash className='h-4 w-4' />}
                    {channel.type === ChannelType.AUDIO && <Mic className='h-4 w-4' />}
                    {channel.type === ChannelType.VIDEO && <Video className='h-4 w-4' />}
                    {channel.name}
                </div>
                <div className='text-xs text-muted-foreground flex flex-col gap-1'>
                    <span>Text: 12</span>
                    <span>Audio: 04</span>
                    <span>Video: 02</span>
                </div>
            </div>
        </div>
    )
}
