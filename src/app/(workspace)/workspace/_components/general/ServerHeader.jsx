'use client'
import React, { useContext } from 'react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MemberRole } from '@prisma/client';
import { ChevronDown, LogOut, PlusCircle, Settings, Trash2, UserPlus, Users } from 'lucide-react';

import { useModal } from '@/hooks/useModal';
import { OrgContext } from '@/providers/OrgProvider';

export function ServerHeader({ server, role }) {
    const isAdmin = role === MemberRole.ADMIN;
    const isModerator = isAdmin || role === MemberRole.MODERATOR;
    const { onOpen } = useModal()



    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                className="focus:outline-none"
                asChild
            >
                <button
                    className="border-b-[0.5px]/90 w-full text-center text-md font-semibold px-3 flex items-center min-h-12 dark:bg-[#0E141B]/20 dark:text-gray-200 bg-zinc-500/60  transition text-slate-700 capitalize"
                >
                    <span className='capatalize text-sm'>
                        {server?.name} Workspace

                    </span>
                    <Settings className="h-4 w-4 ml-auto" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side='bottom' sideOffset={5} className="w-[250px] mt-1 text-x2l font-medium text-slate-800 dark:text-neutral-200 space-y-[2px]" >
                {isModerator && (
                    <DropdownMenuItem
                        onClick={() => onOpen('inviteModal', { server })}
                        className="text-indigo-600 dark:text-indigo-400 px-3 py-2 text-sm cursor-pointer"
                    >
                        Invite People
                        <UserPlus className="h-4 w-4 ml-auto" />
                    </DropdownMenuItem>
                )}
                {isAdmin && (
                    <DropdownMenuItem
                        onClick={() => onOpen('orgSettings', { server })}
                        className="px-3 py-2 text-sm cursor-pointer"
                    >
                        Organization Settings
                        <Settings className="h-4 w-4 ml-auto" />
                    </DropdownMenuItem>
                )}
                {isAdmin && (
                    <DropdownMenuItem
                        onClick={() => onOpen('manageMembers', { server })}
                        className="px-3 py-2 text-sm cursor-pointer"
                    >
                        Manage Members
                        <Users className="h-4 w-4 ml-auto" />
                    </DropdownMenuItem>
                )}
                {isModerator && (
                    <DropdownMenuItem
                        onClick={() => onOpen('createChannel', { server })}
                        className="px-3 py-2 text-sm cursor-pointer"
                    >
                        Create Channel
                        <PlusCircle className="h-4 w-4 ml-auto" />
                    </DropdownMenuItem>
                )}
                {isModerator && (
                    <DropdownMenuSeparator />
                )}
                {isAdmin && (
                    <DropdownMenuItem
                        onClick={() => onOpen('deleteServer', { serverId: server?.id })}
                        className="text-red-500 px-3 py-2 text-sm cursor-pointer"
                    >
                        Delete Organization
                        <Trash2 className="h-4 w-4 ml-auto" />
                    </DropdownMenuItem>
                )}
                {!isAdmin && (
                    <DropdownMenuItem
                        onClick={() => onOpen('leaveServer', { server })}
                        className="text-rose-800 px-3 py-2 text-sm cursor-pointer"
                    >
                        Leave Organization
                        <LogOut className="h-4 w-4 ml-auto" />
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
