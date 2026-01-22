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
import { SettingsModal } from '../../[orgId]/(modules)/setting/SettingsModal'
import SettingsModalOld from '../../[orgId]/(misc)/_components/settings/SettingsModal'
import { useData } from '../../[orgId]/(misc)/_providers/DataProvider'



export default function OrgAuthBlock({ side = 'right', align = 'start', sideOffset = 0, collapsed }) {
    const [open, setOpen] = useState(false)
    const { data: session } = useSession()
    const { onOpen } = useModal()
    const router = useRouter()
    const { refreshServer } = useOrg()
    const [light, setLight] = useState(true)
    const { theme, themeToggle } = useApp()
    const { topNav, setTopNav } = useData()

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


    useEffect(() => {
        // const topNav = localStorage.getItem("top-nav")
        // const mode = topNav == "true"
        // setTopNav(mode)
        // console.log('topnav', mode)

        // theme === 'light' ? setLight(true) : setLight(false)
    }, [theme])


    const toggleNav = () => {
        console.log('set top nav')
        setTopNav(!topNav)
        if (!topNav) {
            localStorage.setItem("top-nav", true);
        } else {
            localStorage.setItem("top-nav", false);
        }
    }


    return (
        <div className=''>
            <DropdownMenu onOpenChange={() => { setOpen(!open) }}>


                <DropdownMenuTrigger asChild className=''>
                    {session ? (
                        <div variant="ghost" className={`p-1  ${open && 'bg-card'} rounded-md flex flex-row items-center justify-between cursor-pointer`}>

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

                {!collapsed && (

                    <DropdownMenuContent className=" w-64 ml-2 rounded-lg border p-2 mb-2" side={side} align={align} sideOffset={sideOffset}>

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

                            <DropdownMenuItem className='flex flex-row gap-2' onClick={() => { toggleNav() }}>
                                <CircleUserRound size={15} className='text-muted-foreground' />
                                {topNav ? 'Side Bar' : 'Top Nav'}
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

                )}
                <SettingsModal
                    isOpen={settingModal.isOpen}
                    onClose={() => {
                        setSettingModal({
                            isOpen: false,
                            mode: 'close',
                            settings: null
                        })
                    }}
                />

                <SettingsModalOld
                    isOpen={settingModalOld.isOpen}
                    onClose={() => {
                        setSettingModalOld({
                            isOpen: false,
                            mode: 'close',
                            settings: null
                        })
                    }}

                />
            </DropdownMenu>
        </div>
    )
}
