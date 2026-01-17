'use client'
import { ActionTooltip } from '@/components/global/ActionTooltip'
import { Avatar, AvatarFallback, AvatarImage, } from "@/components/ui/avatar"
import { UserAvatar } from '@/components/global/UseAvatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { NavigationAction } from './NavigationAction'
import logo from '@/assets/images/devlomatix.png'
import { useParams, useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import Image from "next/image";
import { useDispatch, useSelector } from 'react-redux'
import { setServer } from '@/redux/slices/org'
import { useOrg } from '@/providers/OrgProvider'
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from 'next-auth/react'

export function OrgNavigation() {
    const { orgId } = useParams();
    const router = useRouter();
    const dispatch = useDispatch()
    const { server, servers, updateServer } = useOrg()
    const { data: session } = useSession()
    const defaultServer = servers?.find(item => item.type === 'default')
    const serversData = servers?.filter(item => item.type !== 'default')
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

    return (
        <div className='hidden md:flex'>
            <div className='space-y-4 py-3 flex flex-col item-center dark:bg-[#0E141B] bg-zinc-500 h-screen w-[80px] border '>
                {/* <UserAvatar src={logo.src} className='ml-3' /> */}

                {/* Default server */}

                <div>
                    {defaultServer ? (
                        <div className=''>
                            <ActionTooltip
                                side="right"
                                align="center"
                                label={defaultServer?.name}
                            >
                                <button
                                    onClick={() => { handleOnItemClick(defaultServer) }}
                                    className="group relative flex items-center"
                                >
                                    <div className={cn(
                                        "absolute left-0 bdark:bg-primary bg-[#E5E7EB] rounded-r-full transition-all w-[4px]",
                                        orgId !== defaultServer?.id && "group-hover:h-[20px]",
                                        orgId === defaultServer?.id ? "h-[36px]" : "h-[8px]"
                                    )} />
                                    <div className={cn(
                                        "relative group flex mx-3 h-[48px] w-[48px] rounded-lg group-hover:rounded-lg transition-all overflow-hidden ",
                                        orgId === defaultServer?.id && "bg-primary/10 text-primary rounded-[16px]"
                                    )}>

                                        {
                                            defaultServer?.imageUrl ? (
                                                <Image
                                                    fill
                                                    src={defaultServer?.imageUrl || logo}
                                                    alt="Channel"
                                                />) : (
                                                <div className=' bg-[#E5E7EB] flex items-center justify-center w-full capitalize font-bold text-3xl dark:bg-sky-500'>
                                                    {defaultServer?.name?.substring(0, 1)}
                                                </div>
                                            )
                                        }

                                    </div>

                                </button>
                            </ActionTooltip>
                        </div>
                    ) : (
                        <div className=' group relative flex items-center'>
                            <div className={cn("absolute left-0 bdark:bg-primary bg-[#E5E7EB] rounded-r-full transition-all w-[4px] h-[36px]")} />
                            <Skeleton className="mx-3 h-[48px] w-[48px] rounded-lg  dark:bg-sky-500" />
                        </div>
                    )}
                </div>


                <Separator className='h-[2px] dark:bg-gray-600  rounded-md w-12 mx-auto' />

                <ScrollArea className='flex-1 w-full'>
                    {servers.length === 0 && <ServersLoader />}

                    {

                        serversData?.map((server, index) => {
                            return (
                                <div key={server.id} className='mb-4 flex flex-col items-center'>
                                    <ActionTooltip
                                        side="right"
                                        align="center"
                                        label={server?.name}
                                    >
                                        <button
                                            onClick={() => { handleOnItemClick(server) }}
                                            className="group relative flex items-center"
                                        >
                                            <div className={cn(
                                                "absolute left-0 bdark:bg-primary bg-[#E5E7EB] rounded-r-full transition-all w-[4px]",
                                                orgId !== server?.id && "group-hover:h-[20px]",
                                                orgId === server?.id ? "h-[36px]" : "h-[8px]"
                                            )} />
                                            <div className={cn(
                                                "relative group flex mx-3 h-[48px] w-[48px] rounded-lg group-hover:rounded-lg transition-all overflow-hidden ",
                                                orgId === server?.id && "bg-primary/10 text-primary rounded-[16px]"
                                            )}>

                                                {
                                                    server?.imageUrl ? (
                                                        <Image
                                                            fill
                                                            src={server?.imageUrl || logo}
                                                            alt="Channel"
                                                        />) : (
                                                        <div className='dark:bg-darkSecondaryBackground bg-[#E5E7EB] flex items-center justify-center w-full capitalize font-bold text-3xl'>
                                                            {server?.name?.substring(0, 1)}
                                                        </div>
                                                    )
                                                }

                                            </div>

                                        </button>
                                    </ActionTooltip>
                                    {/* <span className='text-xs truncate self-center flex flex-wrap'>{server?.name}</span> */}
                                </div>
                            )
                        })
                    }
                    {/* <Separator className='h-[2px] dark:bg-gray-600  rounded-md w-12 mx-auto mb-2' /> */}

                </ScrollArea>

                <Separator className='h-[2px] dark:bg-gray-600  rounded-md w-12 mx-auto' />

                <div className="pb-0 mt-auto flex items-center flex-col gap-y-4">
                    <NavigationAction />
                </div>
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


