'use client'
import React, { useContext, useEffect, useState } from 'react';
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { CaretSortIcon, CheckIcon, PlusCircledIcon } from "@radix-ui/react-icons"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import axios from '@/utils/axios';
import { KeyRound, Power } from 'lucide-react';
import defaultAvatar from "@/assets/images/default_avatar.png";
import { toast } from 'sonner';
import { useAuth } from '@/providers/AuthProvider';
import { redirect, useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { OrgCreator } from './OrgCreator';
import { useAction } from '@/hooks/use-action';
import { logoutUser } from '@/app/(auth)/_action/logout';
import { orgSwitch } from '@/app/(auth)/_action/org_switch';
import Link from 'next/link'
import { Check, Copy, Gavel, Loader, RefreshCw, Shield, ShieldAlert, ShieldCheck, Boxes, ShieldQuestion, MoreVertical } from 'lucide-react'
export default function AuthOrgSelector({ displayInfo = true, currentUser, roles }) {

    const [open, setOpen] = React.useState(false)
    const [showNewTeamDialog, setShowNewTeamDialog] = React.useState(false)
    const [orgs, setOrgs] = useState([])
    const [loading, setLoading] = useState(false)
    const [orgData, setOrgData] = useState({ title: '', description: '' })
    const route = useRouter()



    const checkRole = (data) => {
        return roles.some((role) => role.title === data)
    }


    const { execute: logoutUserFromApp } = useAction(logoutUser, {
        onSuccess: (data) => {
            toast.success(data)
            //handleUserLogout()
            setOpen(false)
        },
        onError: (error) => {
            console.log(error)
            toast.error(error)
        }
    })

    const { execute: switchOrganization } = useAction(orgSwitch, {
        onSuccess: (data) => { setOpen(false); setOrganizations(data) },
        onError: (error) => { console.log(error) }
    })

    const handleOnOrgSelect = async (item) => {
        //console.log('Org selected')
        // switchOrganization({ orgId: item.id, userId: user.id }).then((e) => {
        //     toast.success(`Organization switched to ${item.title}`)
        // })
        setOpen(false)
        route.replace(`/org/${item?.id}`)
    }

    const userLogout = async () => {
        logoutUserFromApp({})
    }

    if (!currentUser) {
        return (
            <Link href={'/login'} className='relative inline-flex h-10 overflow-hidden rounded-full p-[2px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 '>
                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />

                <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white backdrop-blur-2xl">
                    Get Started
                </span>
            </Link>
        )
    }


    return (

        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    role="combobox"
                    aria-expanded={open}
                    aria-label="Select a team"
                    className=" justify-between outline-none"
                >
                    <Avatar className="mr-2 h-5 w-5">
                        {/* <AvatarImage
                            src={currentUser?.avatar || defaultAvatar.src}
                            alt={'avatar'}
                        /> */}
                        {/* <AvatarFallback>SC</AvatarFallback> */}
                    </Avatar>
                    {displayInfo && (currentUser?.displayName || currentUser?.email)}

                </Button>
            </PopoverTrigger>

            <PopoverContent className=" p-0 mr-2 ">

                <Command className=''>



                    <div>
                        <CommandList>
                            <CommandInput placeholder="Search ..." />
                            <CommandEmpty>No team found.</CommandEmpty>



                            {/* {
                                checkRole('org') &&
                                <CommandGroup >

                                    <div className='flex items-center m-2 '>
                                        <Avatar className="mr-2 h-8 w-8">
                                            <AvatarImage
                                                src={currentUser?.avatar || defaultAvatar.src}
                                                alt={'avatar'}
                                            />
                                            <AvatarFallback>SC</AvatarFallback>
                                        </Avatar>
                                        <div className='flex flex-col text-sm'>
                                            {currentUser?.displayName}
                                            <span className='text-xs text-muted-foreground'> {currentUser?.email}</span>
                                        </div>
                                    </div>

                                    <CommandSeparator />

                                    {
                                        orgs?.length > 0 && <span className='text-xs text-muted-foreground mt-2 mx-2'>
                                            Organizations
                                        </span>
                                    }

                                    {currentUser?.servers?.map((item, index) => (
                                        <CommandItem key={index} onSelect={() => { route.push(`/org/${item?.id}`) }} className={`text-sm ${item.default ? 'bg-[#1E293Ba]' : null}`} >
                                            <Avatar className="mr-2 h-5 w-5">
                                                <AvatarImage src={item.imageUrl} alt={'avatar'} />
                                                <AvatarFallback>SC</AvatarFallback>
                                            </Avatar>
                                            <div className='capitalize text-sm'>
                                                {item.name}
                                               
                                            </div>

                                        </CommandItem>
                                    ))}
                                </CommandGroup>

                            } */}

                            <CommandSeparator />
                            {
                                checkRole('org') &&
                                <CommandGroup >
                                    <CommandItem className='flex items-center gap-2' onSelect={() => { route.push('/org') }}>
                                        <Boxes className='h-4 w-4 text-rose-600' />
                                        Organizations
                                    </CommandItem>
                                </CommandGroup>
                            }

                            {
                                checkRole('admin') &&
                                <CommandGroup >
                                    <CommandItem className='flex items-center gap-2' onSelect={() => { route.push('/admin') }}>
                                        <ShieldCheck className='h-4 w-4 text-green-600' />
                                        Admin
                                    </CommandItem>
                                </CommandGroup>
                            }


                        </CommandList>

                    </div>



                    {/* Create Organization */}


                    <CommandSeparator />

                    <CommandList>
                        <CommandGroup>

                            <CommandItem onSelect={() => { userLogout() }} className='text-xs'>
                                <Power className="mr-2 h-4 w-4" />
                                Logout
                            </CommandItem>

                        </CommandGroup>
                    </CommandList>

                </Command>


            </PopoverContent>
        </Popover>





    )
}


{/* <DialogContent className='dark:text-[#d3e3fd]'>
    <DialogHeader>
        <div className='flex  justify-between'>
            <div>
                <DialogTitle>Create Organization</DialogTitle>
                <DialogDescription>
                    Add a new organization to manage workflow.
                </DialogDescription>
            </div>
            <div>
                <CldUploadButton options={{ maxFiles: 1 }} onUpload={uploadPhoto} uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}>
                    <img src={defaultImage.src} alt="" className='h-16 rounded-md' />
                </CldUploadButton>
            </div>
        </div>
    </DialogHeader>
    <div>
        <div className="space-y-4 py-2 pb-4">
            <div className="space-y-2">
                <Label htmlFor="name">Organization name</Label>
                <Input value={orgData.title} onChange={(e) => { setOrgData({ ...orgData, title: e.target.value }) }} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="name">Organization Description</Label>
                <Textarea rows='4' value={orgData.description} onChange={(e) => { setOrgData({ ...orgData, description: e.target.value }) }} />
            </div>

        </div>
    </div>
    <DialogFooter>
        <Button variant="outline" size='sm' onClick={() => handleModalClose()}>
            Cancel
        </Button>
        <Button type="submit" size='sm' onClick={() => { createNewOrganization() }} >
            {loading && (
                <Icon name={'Loader'} size={16} className={' animate-spin mr-2'} />
            )}
            Create Organization
        </Button>
    </DialogFooter>
</DialogContent> */}