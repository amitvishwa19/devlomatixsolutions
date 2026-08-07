'use client'
import React, { useEffect, useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut, } from "@/components/ui/command"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { CalendarIcon, EnvelopeClosedIcon, FaceIcon, GearIcon, PersonIcon, RocketIcon, Logout } from "@radix-ui/react-icons"
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/providers/AuthProvider'
import { UserAvatar } from './UseAvatar'
import { Avatar, AvatarFallback, AvatarImage, } from "@/components/ui/avatar"
import { LogOut, Rocket, Settings, User } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { useModal } from '@/hooks/useModal'
import { cn } from '@/lib/utils'


export function AuthSelector({ name = false, classname }) {
    const [open, setOpen] = useState(false)
    const router = useRouter()
    const { data: session, status } = useSession()
    const { onOpen } = useModal()
    const { orgId } = useParams()

    const handleOrg = () => {
        router.push('/workspace')
        setOpen(false)
    }

    const handleAdmin = () => {
        setOpen(false)
        router.push('/admin')
    }

    const handleManageAccount = () => {
        onOpen("manageAccount", { orgId: 'params.orgId' })
    }



    return (
        <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
            <DropdownMenuTrigger asChild>
                {
                    session ?
                        (
                            <div role='button' className=' flex gap-2 items-center cursor-pointer'>
                                <Avatar className='h-10 w-10'>
                                    <AvatarImage src={session?.user?.avatar} alt={session?.user?.displayName} />
                                    <AvatarFallback className=' capitalize'>{session?.user?.displayName?.substring(0, 1) || session?.user?.email?.substring(0, 1)}</AvatarFallback>
                                    {/* {name && <AvatarFallback>{session?.user?.displayName?.substring(0, 1) || session?.user?.email?.substring(0, 1)}</AvatarFallback>} */}
                                </Avatar>
                                {
                                    session?.user?.displayName && (
                                        <div className='flex flex-col'>
                                            <span className=''> {session?.user?.displayName} </span>
                                            <span className='text-xs text-muted-foreground'> {session?.user?.email} </span>
                                        </div>
                                    )
                                }
                            </div>
                        ) :
                        (
                            (
                                <div className={`${classname} font-semibold hover:text-[#0495FF] `}>

                                    <Link href={'/login'}>
                                        Login
                                    </Link>
                                </div>
                            )
                        )
                }
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
                {session && (
                    <div>
                        <DropdownMenuLabel className='flex flex-row gap-2'>
                            <Avatar className='h-8 w-8'>
                                <AvatarImage src={session?.user?.avatar} alt={session?.user?.displayName} />
                                <AvatarFallback className=' capitalize'>{session?.user?.displayName?.substring(0, 1) || session?.user?.email?.substring(0, 1)}</AvatarFallback>
                            </Avatar>
                            <div className='flex flex-col'>
                                <span> {session?.user?.displayName}</span>
                                <span className='text-xs text-muted-foreground'> {session?.user?.email}</span>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                    </div>
                )}

                {session && (
                    <div>
                        <DropdownMenuGroup>
                            <DropdownMenuItem onSelect={handleOrg} className=' cursor-pointer aria-selected:bg-transparent '>
                                <Rocket className="mr-2 h-4 w-4" />
                                <span>Workspaces</span>
                            </DropdownMenuItem>

                            {
                                orgId &&
                                <DropdownMenuItem onSelect={handleManageAccount} className=' cursor-pointer aria-selected:bg-transparent hover:bg-accent'>
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Manage Account</span>
                                </DropdownMenuItem>
                            }
                        </DropdownMenuGroup>

                        <DropdownMenuSeparator />
                    </div>
                )}

                <DropdownMenuGroup>
                    {
                        session
                            ?
                            (<DropdownMenuItem onSelect={signOut} className=' cursor-pointer aria-selected:bg-transparent hover:bg-accent'>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Logout</span>
                                <DropdownMenuShortcut>⌘⇧Q</DropdownMenuShortcut>
                            </DropdownMenuItem>)
                            :
                            (<DropdownMenuItem onSelect={() => { router.push('/login') }} className=' cursor-pointer aria-selected:bg-transparent hover:bg-red-400'>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Login</span>
                                <DropdownMenuShortcut>⌘⇧Q</DropdownMenuShortcut>
                            </DropdownMenuItem>)
                    }

                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
