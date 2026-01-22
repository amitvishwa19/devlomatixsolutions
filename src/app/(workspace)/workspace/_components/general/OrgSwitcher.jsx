import React, { useContext, useEffect, useState } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage, } from "@/components/ui/avatar"
import { ChevronLeft, ChevronRight, CircleUserRound, CreditCard, EllipsisVertical, Layers, PlusCircle, ShieldUser } from 'lucide-react'
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
import { useOrgServer, useOrgServers, useWorkspace } from '../../_provider/WorkspaceProvider'

export default function OrgSwitcher({ collapsed }) {
    const [open, setOpen] = useState(false)
    const { data: session } = useSession()
    const { onOpen } = useModal()
    const router = useRouter()
    const [light, setLight] = useState(true)
    const { theme, themeToggle } = useApp()
    const dispatch = useDispatch()
    //const { server, servers, updateServer } = useOrg()
    //const defaultServer = servers?.find(item => item.default === true)

    const pathname = usePathname();

    const server = useOrgServer()
    const servers = useOrgServers()
    const restServers = servers?.filter(item => item.id !== server?.id)




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
            <div >

                {server ? (
                    <div variant="ghost" className={`p-1  ${open && 'bg-card '} rounded-md flex flex-row items-center justify-between cursor-pointer`}>

                        <div className='flex flex-row items-center justify-between gap-2 '>
                            <Avatar className='h-8 w-8 rounded-md border'>
                                <AvatarImage src={server?.imageUrl} alt="@shadcn" className='grayscale' />
                                <AvatarFallback className='rounded-md font-bold text-xl capitalize'>{server?.name?.substring(0, 1)}</AvatarFallback>
                            </Avatar>

                            {!collapsed && (
                                <div className='flex flex-col capitalize'>
                                    <span className='text-md font-extrabold'>{server?.name}</span>
                                    {/* <span className='text-xs text-muted-foreground'> {server?.user?.email}</span> */}
                                </div>
                            )}

                        </div>



                    </div>
                ) : (
                    <div className='flex flex-row items-center gap-1'>
                        <Skeleton className=" h-[48px] w-[56px]  rounded-lg bg-card" />
                        <Skeleton className=" h-[48px] w-full  rounded-lg bg-card " />
                    </div>
                )}



            </div>
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
