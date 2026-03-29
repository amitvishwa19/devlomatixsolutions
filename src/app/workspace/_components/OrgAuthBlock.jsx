'use client'
import React, { useContext, useEffect, useState } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSubTrigger, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage, } from "@/components/ui/avatar"
import { Captions, CircleQuestionMark, CircleUserRound, EllipsisVertical, LogOut, Megaphone, Moon, RefreshCcw, ScanEye, Settings, ShieldUser, Sun } from 'lucide-react'
import { useModal } from '@/hooks/useModal'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useApp } from '@/providers/AppProvider'
import { Skeleton } from '@/components/ui/skeleton'
import { getInitials } from '@/utils/functions'



export default function OrgAuthBlock({ side = 'right', align = 'start', sideOffset = 0, collapsed }) {
    const [open, setOpen] = useState(false)
    const { data: session } = useSession()
    const { onOpen } = useModal()
    const router = useRouter()

    // Hooks from providers
    const { themeToggle, theme } = useApp()

    const light = theme === 'light'



    const [settingModal, setSettingModal] = useState({
        isOpen: false,
        mode: 'add',
        settings: null
    })

    const [settingModalOld, setSettingModalOld] = useState({
        isOpen: false,
        mode: 'add',
        settings: null
    })

    const [documentModal, setDocumentModal] = useState({
        isOpen: false,
        mode: 'add',
        settings: null
    })

    console.log(session?.user?.image)


    return (
        <div className=''>
            <DropdownMenu onOpenChange={() => { setOpen(!open) }}>


                <DropdownMenuTrigger asChild className=''>
                    {session ? (
                        <div variant="ghost" className={`p-1  ${open && 'bg-card'} rounded-md flex flex-row items-center justify-between cursor-pointer text-primary transition-all duration-300`}>

                            <div className='flex flex-row items-center gap-2'>
                                <Avatar className='h-10 w-10 rounded-xl border border-border/50'>
                                    <AvatarImage src={session?.user?.image} alt="@shadcn" className='' />
                                    <AvatarFallback className='rounded-xl capitalize font-bold text-xl border'>{getInitials(session?.user?.displayName)}</AvatarFallback>
                                </Avatar>
                                {!collapsed && (
                                    <div className='flex flex-col'>
                                        <span className='text-sm font-semibold'>{session?.user?.displayName}</span>
                                        <span className='text-muted-foreground truncate text-xs'>{session?.user?.email}</span>
                                    </div>
                                )}
                            </div>
                            {!collapsed && (
                                <div>
                                    <EllipsisVertical size={20} />
                                </div>
                            )}

                        </div>
                    ) : (
                        <div className='flex flex-row items-center gap-1'>
                            <Skeleton className=" h-[48px] w-[56px]  rounded-xl" />
                            <Skeleton className=" h-[48px] w-full  rounded-xl " />
                        </div>
                    )}
                </DropdownMenuTrigger>

                {!collapsed && (

                    <DropdownMenuContent className=" w-64 ml-2 rounded-md border p-2 mb-2 shadow-soft animate-fade-in" side={side} align={align} sideOffset={sideOffset}>

                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-xl border border-border/50">
                                    <AvatarImage src={session?.user?.image || session?.user?.image} alt="@shadcn" className='' />
                                    <AvatarFallback className='rounded-xl'>{session?.user?.displayName?.substring(0, 1)}</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">{session?.user?.displayName}</span>
                                    <span className="text-muted-foreground truncate text-xs">
                                        {session?.user?.email}
                                    </span>
                                </div>
                            </div>
                        </DropdownMenuLabel>

                        <DropdownMenuSeparator />

                        <DropdownMenuGroup className='text-xs'>

                            <DropdownMenuItem className='flex flex-row gap-2 text-xs'>
                                <CircleUserRound size={15} className='text-muted-foreground' />
                                Account
                            </DropdownMenuItem>


                            <DropdownMenuItem className='flex flex-row gap-2' onClick={() => {
                                setSettingModal({
                                    isOpen: true,
                                    mode: 'open',
                                    setting: null
                                })
                            }}>
                                <Settings size={15} className='text-muted-foreground' />
                                Settings
                            </DropdownMenuItem>

                            <DropdownMenuItem className='flex flex-row gap-2' onClick={() => {
                                setSettingModalOld({
                                    isOpen: true,
                                    mode: 'open',
                                    setting: null
                                })
                            }}>
                                <Settings size={15} className='text-muted-foreground' />
                                Settings old
                            </DropdownMenuItem>



                            <DropdownMenuItem className='flex flex-row gap-2' onClick={() => {
                                setDocumentModal({
                                    isOpen: true
                                })
                            }}>
                                <CircleQuestionMark size={15} className='text-muted-foreground' />
                                Docs
                            </DropdownMenuItem>

                            <DropdownMenuItem className='flex flex-row gap-2'>
                                <Megaphone size={15} className='text-muted-foreground' />
                                Notification
                            </DropdownMenuItem>

                            <DropdownMenuItem className='flex flex-row gap-2 items-center justify-between'>
                                <div className='flex flex-row gap-2 items-center'>
                                    <ScanEye size={15} className='text-muted-foreground' />
                                    Appearence
                                </div>
                                <div className='flex flex-row gap-4 items-center'>
                                    <div className={`p-1 rounded-md border ${!light && 'bg-gray-500'}`} onClick={themeToggle} >
                                        <Moon size={15} className=' cursor-pointer' />
                                    </div>
                                    <div className={`p-1 rounded-md border ${light && 'bg-gray-500'}`} onClick={themeToggle} >
                                        <Sun size={15} className=' cursor-pointer' />
                                    </div>
                                </div>
                            </DropdownMenuItem>

                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className='flex flex-row gap-2' onSelect={() => {
                            router.push('/')
                            signOut()
                        }}>
                            <LogOut size={15} className='text-muted-foreground' />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>

                )}


            </DropdownMenu>
        </div>
    )
}
