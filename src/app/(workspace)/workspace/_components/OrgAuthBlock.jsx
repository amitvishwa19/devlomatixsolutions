import React, { useContext, useEffect, useState } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSubTrigger, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage, } from "@/components/ui/avatar"
import { Captions, CircleUserRound, EllipsisVertical, LogOut, Megaphone, Moon, RefreshCcw, ScanEye, Settings, ShieldUser, Sun } from 'lucide-react'
import { useModal } from '@/hooks/useModal'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useOrg } from '@/providers/OrgProvider'
import { toast } from 'sonner'
import { useApp } from '@/providers/AppProvider'
import { Skeleton } from '@/components/ui/skeleton'


export default function OrgAuthBlock({ side = 'right', align = 'start' }) {
    const [open, setOpen] = useState(false)
    const { data: session } = useSession()
    const { onOpen } = useModal()
    const router = useRouter()
    const { refreshServer } = useOrg()
    const [light, setLight] = useState(true)
    const { theme, themeToggle } = useApp()


    useEffect(() => {
        theme === 'light' ? setLight(true) : setLight(false)
    }, [theme])


    return (
        <div className=''>
            <DropdownMenu onOpenChange={() => { setOpen(!open) }}>

                <DropdownMenuTrigger asChild className=''>
                    {session ? (
                        <div variant="ghost" className={`p-1 dark:hover:bg-[#1C2736] ${open && 'dark:bg-[#1C2736] '} rounded-md flex flex-row items-center justify-between cursor-pointer`}>

                            <div className='flex flex-row items-center gap-2'>
                                <Avatar className='h-10 w-10 rounded-md'>
                                    <AvatarImage src={session?.user?.avatar} alt="@shadcn" className='grayscale' />
                                    <AvatarFallback className='rounded-md capitalize'>{session?.user?.displayName?.substring(0, 1)}</AvatarFallback>
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
                    ) : (
                        <div className='flex flex-row items-center gap-1'>
                            <Skeleton className=" h-[48px] w-[56px]  rounded-lg" />
                            <Skeleton className=" h-[48px] w-full  rounded-lg " />
                        </div>
                    )}
                </DropdownMenuTrigger>

                <DropdownMenuContent className="dark:bg-darkSecondaryBackground w-64 ml-2 rounded-lg border p-2 mb-2" side={side} align={align} sideOffset={2}>

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

                        <DropdownMenuItem className='flex flex-row gap-2' onSelect={async () => {
                            await refreshServer()
                            setTimeout(() => {
                                toast.success('Organization data refreshed successfully')
                            }, 2000);
                        }}>
                            <RefreshCcw size={15} className='text-muted-foreground' />
                            Refresh Data
                        </DropdownMenuItem>

                        <DropdownMenuItem className='flex flex-row gap-2'>
                            <Captions size={15} className='text-muted-foreground' />
                            Billing
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
            </DropdownMenu>
        </div>
    )
}
