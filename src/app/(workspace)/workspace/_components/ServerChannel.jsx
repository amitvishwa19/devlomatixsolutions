"use client";
import React from 'react'
import { Channel, ChannelType, MemberRole, Server } from "@prisma/client";
import { Edit, Hash, Lock, Mic, Trash, Video } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { useModal } from '@/hooks/useModal';
import { ActionTooltip } from './ActionTooltip';

const iconMap = {
    [ChannelType.TEXT]: Hash,
    [ChannelType.AUDIO]: Mic,
    [ChannelType.VIDEO]: Video,
}

export default function ServerChannel({ channel, server, role }) {

    const { onOpen } = useModal();
    const params = useParams();
    const router = useRouter();

    const Icon = iconMap[channel.type];

    const onClick = () => {
        router.push(`/workspace/${params?.orgId}/channel/${channel.id}`)
    }

    const onAction = (e, action) => {
        e.stopPropagation();
        onOpen(action, { channel, server });
    }

    return (
        <button
            onClick={onClick}
            className={cn(
                "group p-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-muted-foreground/10 transition mb-1",
                params?.channelId === channel.id && "bg-muted-foreground/10 dark:bg-slate-900/40"
            )}
        >
            <Icon className="flex-shrink-0 w-4 h-4 text-zinc-700 dark:text-zinc-400" />
            <p className={cn(
                "line-clamp-1 font-semibold text-xs text-zinc-700 group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300 transition",
                params?.channelId === channel.id && "text-primary dark:text-zinc-200 dark:group-hover:text-white"
            )}>
                {channel.name}
            </p>
            {channel.name !== "general" && role !== MemberRole.GUEST && (
                <div className="ml-auto flex items-center gap-x-2">
                    <ActionTooltip label="Edit">
                        <Edit
                            onClick={(e) => onAction(e, "editChannel")}
                            className="hidden group-hover:block w-4 h-4 text-zinc-700 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"
                        />
                    </ActionTooltip>
                    <ActionTooltip label="Delete">
                        <Trash
                            onClick={(e) => onAction(e, "deleteChannel")}
                            className="hidden group-hover:block w-4 h-4 text-zinc-700 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"
                        />
                    </ActionTooltip>
                </div>
            )}
            {channel.name === "general" && (
                <Lock
                    className="ml-auto w-4 h-4 text-zinc-700 dark:text-zinc-400"
                />
            )}
        </button>
    )
}
