import React, { useContext, useEffect, useState } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage, } from "@/components/ui/avatar"
import { CircleUserRound, CreditCard, EllipsisVertical, Layers, PlusCircle, ShieldUser } from 'lucide-react'
import { useModal } from '@/hooks/useModal'
import { useSession, signOut } from 'next-auth/react'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { useOrg } from '@/providers/OrgProvider'
import { toast } from 'sonner'
import { useApp } from '@/providers/AppProvider'
import { useDispatch } from 'react-redux'
import logo from '@/assets/images/devlomatix.png'
import { setServer } from '@/redux/slices/org'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

export default function OrgSwitcher() {
    const [open, setOpen] = useState(false)
    const { data: session } = useSession()
    const { onOpen } = useModal()
    const router = useRouter()
    const { refreshServer, hasPermission, superAdmin } = useOrg()
    const [light, setLight] = useState(true)
    const { theme, themeToggle } = useApp()
    const dispatch = useDispatch()
    const { server, servers, updateServer } = useOrg()
    const defaultServer = servers?.find(item => item.default === true)
    const restServers = servers?.filter(item => item.id !== server?.id)
    const pathname = usePathname();



    const handleOnItemClick = (ser) => {

        updateServer(ser)
        dispatch(setServer(JSON.stringify(ser)))
        router.push(changeWorkspaceId(pathname, ser.id))

    }

    function changeWorkspaceId(url, newId) {
        const parts = url.split('/');
        parts[2] = newId;       // part after workspace
        return parts.join('/');
    }


    useEffect(() => {
        theme === 'light' ? setLight(true) : setLight(false)
    }, [theme])


    return (
        <div className=''>
            <DropdownMenu onOpenChange={() => { setOpen(!open) }}>

                <DropdownMenuTrigger asChild className=''>

                    {server ? (
                        <div variant="ghost" className={`p-1 dark:hover:bg-[#1C2736] ${open && 'dark:bg-[#1C2736] '} rounded-md flex flex-row items-center justify-between cursor-pointer`}>
                            <div className='flex flex-row items-center gap-2'>


                                <div className='flex flex-row items-center gap-2'>
                                    <Avatar className='h-10 w-10 rounded-md'>
                                        <AvatarImage src={server?.imageUrl} alt="@shadcn" className='grayscale' />
                                        <AvatarFallback className='rounded-md font-bold text-2xl capitalize'>{server?.name?.substring(0, 1)}</AvatarFallback>
                                    </Avatar>
                                    <div className='flex flex-col'>
                                        <span className='text-sm'>{server?.name}</span>
                                    </div>
                                </div>


                            </div>
                            <div>
                                {
                                    server.default ? <ShieldUser size={15} /> : <EllipsisVertical size={20} />
                                }

                            </div>
                        </div>
                    ) : (
                        <div className='flex flex-row items-center gap-1'>
                            <Skeleton className=" h-[48px] w-[56px]  rounded-lg" />
                            <Skeleton className=" h-[48px] w-full  rounded-lg " />
                        </div>
                    )}


                </DropdownMenuTrigger>

                <DropdownMenuContent className="dark:bg-darkSecondaryBackground w-64 ml-2 rounded-md border p-2 mr-2" side='right' align='start' sideOffset={4}>

                    <DropdownMenuLabel className="p-0 font-normal px-2 flex flex-row items-center gap-2 text-sky-500">
                        <Layers size={15} />
                        <span className='text-sm'>Departments</span>
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    {restServers?.length > 0 ? (
                        <div>
                            <DropdownMenuGroup className='flex flex-col text-xs gap-2'>
                                {
                                    restServers?.map((server) => {

                                        return (
                                            <DropdownMenuItem key={server.id} className='flex flex-row justify-between cursor-pointer' onSelect={() => { handleOnItemClick(server) }}>
                                                <div className='flex flex-row gap-2 text-xs'>
                                                    <CircleUserRound size={15} className='text-muted-foreground' />
                                                    {server?.name}
                                                </div>
                                                {
                                                    server.default && <div>
                                                        <ShieldUser size={15} />
                                                    </div>
                                                }
                                            </DropdownMenuItem>
                                        )
                                    })
                                }
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                        </div>
                    ) : (
                        <div>

                        </div>
                    )}

                    <DropdownMenuItem disabled={(hasPermission('create-org') || superAdmin()) ? false : true} className='flex flex-row gap-2 text-xs items-center' onSelect={() => {
                        onOpen('neworgmodal')
                    }}>
                        <PlusCircle size={15} className='' />
                        Add new Department
                    </DropdownMenuItem>
                </DropdownMenuContent>

            </DropdownMenu>
        </div>
    )
}


const ServersLoader = () => {

    return (
        <div className='flex flex-col'>
            <div className='mb-4 group relative flex items-center'>
                <div className={cn("absolute left-0 bdark:bg-primary bg-[#E5E7EB] rounded-r-full transition-all w-[4px] h-[36px]")} />
                <Skeleton className="mx-3 h-[48px] w-[48px] rounded-lg bg-red-200" />
            </div>

            <div className='mb-4 group relative flex items-center'>
                <div className={cn("absolute left-0 bdark:bg-primary bg-[#E5E7EB] rounded-r-full transition-all w-[4px] h-[36px]")} />
                <Skeleton className="mx-3 h-[48px] w-[48px] rounded-lg bg-red-200" />
            </div>

            <div className='mb-4 group relative flex items-center'>
                <div className={cn("absolute left-0 bdark:bg-primary bg-[#E5E7EB] rounded-r-full transition-all w-[4px] h-[36px]")} />
                <Skeleton className="mx-3 h-[48px] w-[48px] rounded-lg bg-red-200" />
            </div>

            <div className='mb-4 group relative flex items-center'>
                <div className={cn("absolute left-0 bdark:bg-primary bg-[#E5E7EB] rounded-r-full transition-all w-[4px] h-[36px]")} />
                <Skeleton className="mx-3 h-[48px] w-[48px] rounded-lg bg-red-200" />
            </div>

        </div>

    )
}
