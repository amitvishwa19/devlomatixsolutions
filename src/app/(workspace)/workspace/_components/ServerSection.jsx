'use client'
import { useModal } from '@/hooks/useModal';
import { MemberRole } from '@prisma/client';
import React from 'react'
import { ActionTooltip } from './ActionTooltip';
import { Plus, Settings } from "lucide-react";

export default function ServerSection({ label, role, sectionType, channelType, server, }) {

    const { onOpen } = useModal();

    const handleCreateChannel = (channelType) => {
        //console.log('Create channel channelType')
        onOpen("createChannel", { channelType })
    }


    return (
        <div className="flex items-center justify-between p-2">
            <p className="text-xs uppercase font-semibold text-zinc-800 dark:text-zinc-400">
                {label}
            </p>
            {role !== MemberRole.GUEST && sectionType === "channels" && (
                <ActionTooltip label="Create Channel" side="top">
                    <button
                        onClick={() => { handleCreateChannel(channelType) }}
                        className="text-zinc-800 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                </ActionTooltip>
            )}
            {role === MemberRole.ADMIN && sectionType === "members" && (
                <ActionTooltip label="Manage Members" side="top">
                    <button
                        onClick={() => onOpen("members", { server })}
                        className="text-zinc-800 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"
                    >
                        <Settings className="h-4 w-4" />
                    </button>
                </ActionTooltip>
            )}
        </div>
    )
}
