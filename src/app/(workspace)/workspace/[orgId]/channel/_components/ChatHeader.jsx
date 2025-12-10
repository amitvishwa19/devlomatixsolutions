import React from 'react'
import { Menu, Hash, Lock, Mic, Trash, Video } from "lucide-react";
import { UserAvatar } from '@/components/global/UseAvatar';
import SocketIndicator from '@/components/global/SocketIndicator';
import ChatVideoButton from './ChatVideoButton';
import MobileToggleMenu from '@/app/(workspace)/workspace/_components/MobileToggleMenu';




export default function ChatHeader({ serverId, name, type, avatar }) {
    return (
        <div className="text-md font-semibold px-3 flex items-center h-12 border-b-1 dark:border-neutral-800 border-b-1 dark:bg-[#031525]/80 bg-zinc-500/60">
            {/* <MobileToggleMenu serverId={serverId} /> */}
            {type === "channel" && (
                <Hash className="w-5 h-5 text-zinc-500 dark:text-zinc-400 mr-2" />
            )}
            {type === "conversation" && (
                <UserAvatar
                    src={avatar}
                    className="h-8 w-8 md:h-8 md:w-8 mr-2"
                />
            )}
            <p className="font-semibold text-md text-black dark:text-white">
                {name}
            </p>
            <div className='ml-auto flex items-center'>
                {type === "conversation" && (
                    <ChatVideoButton />
                )}
                <SocketIndicator />
            </div>
        </div>
    )
}
