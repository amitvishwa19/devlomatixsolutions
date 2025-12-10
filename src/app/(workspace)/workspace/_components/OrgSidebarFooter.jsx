import React, { useState } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSubTrigger, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage, } from "@/components/ui/avatar"
import { Captions, CircleUserRound, EllipsisVertical, LogOut, Megaphone, Settings, ShieldUser } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useModal } from '@/hooks/useModal'


export default function OrgSidebarFooter() {
    const [open, setOpen] = useState(false)
    const { data: session } = useSession()
    const { onOpen } = useModal()


    return (
        <div className=''>
            <DropdownMenu onOpenChange={() => { setOpen(!open) }}>
                <DropdownMenuTrigger asChild className=''>
                    <div variant="ghost" className={`p-1 dark:hover:bg-[#1C2736] ${open && 'dark:bg-[#1C2736] '} rounded-md flex flex-row items-center justify-between cursor-pointer`}>

                        <div className='flex flex-row items-center gap-2'>
                            <Avatar className='h-10 w-10 rounded-md'>
                                <AvatarImage src={session?.user?.avatar} alt="@shadcn" className='grayscale' />
                                <AvatarFallback className='rounded-md'>{session?.user?.displayName?.substring(0, 1)}</AvatarFallback>
                            </Avatar>
                            <div className='flex flex-col'>
                                <span className='text-sm'>{session?.user?.displayName}</span>
                                <span className='text-muted-foreground truncate text-xs'>{session?.user?.email}</span>
                            </div>
                        </div>
                        <div>
                            <EllipsisVertical size={20} />
                        </div>

                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="dark:bg-darkPrimaryBackground w-64 ml-2 rounded-lg border p-2" side='right' align='end' sideOffset={4}>

                    <DropdownMenuLabel className="p-0 font-normal">
                        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={session?.user?.avatar} alt="@shadcn" className='' />
                                <AvatarFallback>{session?.user?.displayName?.substring(0, 1)}</AvatarFallback>
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

                        <DropdownMenuItem className='flex flex-row gap-2' onClick={() => { onOpen('orgsetting') }}>
                            <Settings size={15} className='text-muted-foreground' />
                            Settings
                        </DropdownMenuItem>



                        <DropdownMenuItem className='flex flex-row gap-2'>
                            <Captions size={15} className='text-muted-foreground' />
                            Billing
                        </DropdownMenuItem>

                        <DropdownMenuItem className='flex flex-row gap-2'>
                            <Megaphone size={15} className='text-muted-foreground' />
                            Notification
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className='flex flex-row gap-2'>
                        <LogOut />
                        Log out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
