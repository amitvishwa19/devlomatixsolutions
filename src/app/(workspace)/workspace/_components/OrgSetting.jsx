'use client'
import React from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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

export default function OrgSetting({ serverId, server, role }) {
    const isAdmin = role === MemberRole.ADMIN;
    const isModerator = isAdmin || role === MemberRole.MODERATOR;
    const { onOpen } = useModal()

    console.log('server', server)
    console.log('role', role)

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Settings className='h-5 w-5 cursor-pointer' />
            </PopoverTrigger>
            <PopoverContent side='right' className="w-480">

                {isModerator && (
                    <div
                        onClick={() => onOpen('inviteModal', { server })}
                        className="text-indigo-600 dark:text-indigo-400 px-3 py-2 text-sm cursor-pointer"
                    >
                        Invite People
                        <UserPlus className="h-4 w-4 ml-auto" />
                    </div>
                )}
                {isAdmin && (
                    <div
                        onClick={() => onOpen('orgSettings', { server })}
                        className="px-3 py-2 text-sm cursor-pointer"
                    >
                        Organization Settings
                        <Settings className="h-4 w-4 ml-auto" />
                    </div>
                )}
                {/* {isAdmin && (
                    <DropdownMenuItem
                        onClick={() => onOpen('manageMembers', { server })}
                        className="px-3 py-2 text-sm cursor-pointer"
                    >
                        Manage Members
                        <Users className="h-4 w-4 ml-auto" />
                    </DropdownMenuItem>
                )} */}
                {/* {isModerator && (
                    <DropdownMenuItem
                        onClick={() => onOpen('createChannel', { server })}
                        className="px-3 py-2 text-sm cursor-pointer"
                    >
                        Create Channel
                        <PlusCircle className="h-4 w-4 ml-auto" />
                    </DropdownMenuItem>
                )} */}
                {/* {isModerator && (
                    <DropdownMenuSeparator />
                )} */}
                {/* {isAdmin && (
                    <DropdownMenuItem
                        onClick={() => onOpen('deleteServer', { serverId })}
                        className="text-rose-400 px-3 py-2 text-sm cursor-pointer"
                    >
                        Delete Organization
                        <Trash2 className="h-4 w-4 ml-auto" />
                    </DropdownMenuItem>
                )} */}
                {/* {!isAdmin && (
                    <DropdownMenuItem
                        onClick={() => onOpen('leaveServer', { server })}
                        className="text-rose-800 px-3 py-2 text-sm cursor-pointer"
                    >
                        Leave Organization
                        <LogOut className="h-4 w-4 ml-auto" />
                    </DropdownMenuItem>
                )}  */}

            </PopoverContent>
        </Popover>
    )
}
