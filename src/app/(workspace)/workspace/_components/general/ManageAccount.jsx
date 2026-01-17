import React, { useContext, useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, } from "@/components/ui/accordion"
import { Avatar, AvatarFallback, AvatarImage, } from "@/components/ui/avatar"
import { useModal } from '@/hooks/useModal'
import { Separator } from '@/components/ui/separator'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger, } from "@/components/ui/tabs"
import { Component, Shield, User, Users } from 'lucide-react'
import { OrgContext } from '@/providers/OrgProvider'
import { useParams } from 'next/navigation'
import { AlertDialogTitle } from '@/components/ui/alert-dialog'

export default function ManageAccount() {

    const { onOpen, onClose, isOpen, type } = useModal()
    const isModalOpen = isOpen && type === "manageAccount";
    const { data: session } = useSession()
    const { servers, server } = useContext(OrgContext)


    const handleOpenChange = () => {
        onClose()
    }

    // useEffect(() => {
    //     console.log('manage account org server', server)
    // }, [])


    // useEffect(() => {
    //     //const temp = servers.find((server) => server.id === orgId)
    //     //console.log('servers', server)
    //     //setMembers(servers.find((server) => server.id === orgId))
    // }, [servers])


    return (
        <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>

            <DialogContent className="sm:max-w-[825px] h-[600px] text-white/60 p-0">

                {/* <DialogHeader>
                    <DialogTitle>Edit profile</DialogTitle>

                </DialogHeader> */}

                <Tabs defaultValue="account" className="flex" >

                    <TabsList className=" flex flex-col w-[30%] h-full  justify-start gap-2 px-2 rounded-none">
                        <div className=' px-2 py-4'>
                            <div className='flex flex-col text-lg items-center'>
                                <h1 className='font-bold  '>Account</h1>
                                <p className='text-xs text-muted-foreground'>Manage your account info.</p>
                            </div>
                        </div>
                        <TabsTrigger value="profile" className='w-full py-2 mx-2  justify-start flex gap-2'>
                            <User size={18} />
                            Profile
                        </TabsTrigger>
                        <TabsTrigger value="security" className='w-full py-2 mx-2  justify-start flex gap-2'>
                            <Shield size={18} />
                            Security
                        </TabsTrigger>
                        <TabsTrigger value="workspaces" className='w-full py-2 mx-2  justify-start flex gap-2'>
                            <Component size={18} />
                            Workspaces
                        </TabsTrigger>
                        <TabsTrigger value="members" className='w-full py-2 mx-2  justify-start flex gap-2'>
                            <Users size={18} />
                            Members
                        </TabsTrigger>
                    </TabsList>


                    <TabsContent value="profile" className='w-full px-6'>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1" className='py-2'>
                                <div className='flex items-center justify-between'>
                                    <div className='flex items-center justify-between w-[50%]'>
                                        <span>
                                            Profile
                                        </span>
                                        <span className='flex gap-4 items-center'>
                                            <Avatar>
                                                <AvatarImage src={session?.user?.avatar} alt="@shadcn" />
                                                <AvatarFallback>{session?.user?.displayName.substring(0, 1)}</AvatarFallback>
                                            </Avatar>
                                            <span>
                                                email
                                            </span>
                                        </span>
                                    </div>
                                    <AccordionTrigger>
                                        <span className='text-sky-600 font-semibold'>
                                            Update profile
                                        </span>
                                    </AccordionTrigger>
                                </div>
                                <AccordionContent>
                                    Yes. It adheres to the WAI-ARIA design pattern.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-2">
                                <AccordionTrigger>Email addresses</AccordionTrigger>
                                <AccordionContent>
                                    Yes. It comes with default styles that matches the other
                                    components&apos; aesthetic.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-3">
                                <AccordionTrigger>Connected accounts</AccordionTrigger>
                                <AccordionContent>
                                    Yes. It's animated by default, but you can disable it if you prefer.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </TabsContent>
                    <TabsContent value="security" className='w-full px-6'>
                        <Card>
                            <CardHeader>
                                <CardTitle>Password</CardTitle>
                                <CardDescription>
                                    Change your password here. After saving, you'll be logged out.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="space-y-1">
                                    <Label htmlFor="current">Current password</Label>
                                    <Input id="current" type="password" />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="new">New password</Label>
                                    <Input id="new" type="password" />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button>Save password</Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>
                    <TabsContent value="workspaces" className='w-full'>
                        <div className=' p-2'>
                            <div className='flex flex-col text-lg items-center'>
                                <h1 className='font-bold  '>Workspaces</h1>
                                <p className='text-xs text-muted-foreground'>Manage your all workspace.</p>
                            </div>
                            <Separator className="my-4" />

                            <div>

                                {
                                    servers.map((org, index) => {
                                        return (
                                            <div key={index} className='flex items-center justify-between mb-4'>
                                                <div className='flex items-center gap-4'>
                                                    <Avatar>
                                                        <AvatarImage src={org?.imageUrl} alt="@shadcn" />
                                                        <AvatarFallback>CN</AvatarFallback>
                                                    </Avatar>
                                                    <span>
                                                        {org.name}
                                                    </span>
                                                </div>
                                                <div className='text-xs cursor-pointer text-red-400' onClick={() => { console.log('delete click') }}>
                                                    <h4>Delete</h4>
                                                </div>
                                            </div>
                                        )
                                    })
                                }
                            </div>

                        </div>
                    </TabsContent>
                    <TabsContent value="members" className='w-full'>
                        <div className=' p-2'>
                            <div className='flex flex-col text-lg items-center'>
                                <h1 className='font-bold  '>Members</h1>
                                <p className='text-xs text-muted-foreground'>Manage members linked with this workspace.</p>
                            </div>
                            <Separator className="my-4" />

                            {
                                server?.members?.map((member, index) => {
                                    return (
                                        <div key={index} className='flex items-center justify-between mb-4'>
                                            <div className='flex items-center gap-4'>
                                                <Avatar>
                                                    <AvatarImage src={member?.user?.avatar} alt="@shadcn" />
                                                    <AvatarFallback>{member?.user?.name?.substring(1, 0)}</AvatarFallback>
                                                </Avatar>
                                                <div className='flex flex-col'>
                                                    <span>
                                                        {member?.user?.name}
                                                    </span>
                                                    <span className='text-xs text-muted-foreground'>
                                                        {member?.user?.email}

                                                    </span>
                                                </div>
                                            </div>
                                            <div className='text-xs cursor-pointer text-red-400' onClick={() => { console.log('remove member') }}>
                                                {member?.role != 'ADMIN' &&
                                                    <h4>Remove</h4>
                                                }
                                            </div>
                                        </div>
                                    )
                                })
                            }

                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
