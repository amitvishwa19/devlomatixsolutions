'use client'
import React, { useEffect, useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon, EnvelopeClosedIcon, FaceIcon, GearIcon, PersonIcon, RocketIcon, Logout } from "@radix-ui/react-icons"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut, } from "@/components/ui/command"
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/providers/AuthProvider'
import { UserAvatar } from './UseAvatar'
import { Avatar, AvatarFallback, AvatarImage, } from "@/components/ui/avatar"
import { Rocket, Settings, User } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { useModal } from '@/hooks/useModal'
import { cn } from '@/lib/utils'


export function AuthSelector({ name = false, classname }) {
    const [open, setOpen] = useState(false)
    const [appUser, setAppUser] = useState(null)
    const router = useRouter()
    const { data: session, status } = useSession()
    const { onOpen } = useModal()
    const { orgId } = useParams()

    //console.log('params', orgId)



    const getUserInfo = async () => {
        //const { userId } = await useAuth()
    }

    const onOpenchange = () => {
        setOpen(!open)
    }

    const handleOrg = () => {
        //console.log('Org Clicked')
        router.push('/workspace')
        onOpenchange()
    }

    const handleAdmin = () => {
        onOpenchange()
        router.push('/admin')
    }

    const handleManageAccount = () => {
        //console.log('handle manage account')
        onOpen("manageAccount", { orgId: 'params.orgId' })
    }


    //const { user } = useAuth()
    return (
        <Popover open={open} onOpenChange={onOpenchange} className=''>
            <PopoverTrigger asChild>

                {
                    session ?
                        (
                            <div role='button' className=' flex gap-2 items-center'>
                                <Avatar className='h-8 w-8'>
                                    <AvatarImage src={session?.user?.avatar} alt={session?.user?.displayName} />
                                    <AvatarFallback className=' capitalize'>{session?.user?.displayName?.substring(0, 1) || session?.user?.email?.substring(0, 1)}</AvatarFallback>
                                    {/* {name && <AvatarFallback>{session?.user?.displayName?.substring(0, 1) || session?.user?.email?.substring(0, 1)}</AvatarFallback>} */}
                                </Avatar>
                                {
                                    name && session?.user?.displayName && (<span className='text-white'> {session?.user?.displayName} </span>)
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

            </PopoverTrigger>


            <PopoverContent className="w-60 p-0 mx-1 bg-red-200">
                <Command className="rounded-lg border shadow-md">

                    <CommandList>

                        {
                            session &&
                            <div>
                                <CommandGroup>
                                    <CommandItem onSelect={handleOrg} className='cursor-pointer aria-selected:bg-transparent hover:bg-accent flex flex-row gap-2'>
                                        <Avatar className='h-8 w-8'>
                                            <AvatarImage src={session?.user?.avatar} alt={session?.user?.displayName} />
                                            <AvatarFallback className=' capitalize'>{session?.user?.displayName?.substring(0, 1) || session?.user?.email?.substring(0, 1)}</AvatarFallback>
                                        </Avatar>
                                        <div className='flex flex-col'>
                                            <span> {session?.user?.displayName}</span>
                                            <span className='text-xs text-muted-foreground'> {session?.user?.email}</span>
                                        </div>
                                    </CommandItem>
                                </CommandGroup>

                                <CommandSeparator />


                                <CommandGroup className='fles flex-col gap-4'>

                                    <CommandItem onSelect={handleAdmin} className=' cursor-pointer aria-selected:bg-transparent hover:bg-accent'>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        <span>Admin</span>
                                    </CommandItem>





                                </CommandGroup>
                                <CommandSeparator />
                                <CommandGroup>

                                    <CommandItem onSelect={handleOrg} className=' cursor-pointer aria-selected:bg-transparent hover:bg-accent'>
                                        <Rocket className="mr-2 h-4 w-4" />
                                        <span>My Workspaces</span>
                                    </CommandItem>

                                    {
                                        orgId &&
                                        <CommandItem onSelect={handleManageAccount} className=' cursor-pointer aria-selected:bg-transparent hover:bg-accent'>
                                            <Settings className="mr-2 h-4 w-4" />
                                            <span>Manage Account</span>
                                        </CommandItem>
                                    }



                                </CommandGroup>
                                <CommandSeparator />
                            </div>
                        }

                        <CommandGroup >

                            {
                                session
                                    ?
                                    (<CommandItem onSelect={signOut} className=' cursor-pointer aria-selected:bg-transparent hover:bg-accent'>
                                        <GearIcon className="mr-2 h-4 w-4" />
                                        <span>Logout</span>
                                        <CommandShortcut>⌘S</CommandShortcut>
                                    </CommandItem>)
                                    :
                                    (<CommandItem onSelect={() => { router.push('/login') }} className=' cursor-pointer aria-selected:bg-transparent hover:bg-red-400'>
                                        <GearIcon className="mr-2 h-4 w-4" />
                                        <span>Login</span>
                                        <CommandShortcut>⌘S</CommandShortcut>
                                    </CommandItem>)
                            }





                        </CommandGroup>

                    </CommandList>
                </Command>
            </PopoverContent >



        </Popover >
    )
}
