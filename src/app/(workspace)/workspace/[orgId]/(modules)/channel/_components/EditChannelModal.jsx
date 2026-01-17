'use client'
import { Loader, Plus } from 'lucide-react'
import React, { useContext, useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAction } from '@/hooks/use-action'
import { toast } from 'sonner'
import { useModal } from '@/hooks/useModal'
import { ChannelType } from '@prisma/client'
import { OrgContext } from '@/providers/OrgProvider'
import { updateChannel } from '../_actions/update-channel'

const formSchema = z.object({
    name: z.string().min(1, {
        message: "Channel name is required."
    }).refine(
        name => name !== 'general',
        { message: "Channel name cannot be 'general'" }
    ),
    type: z.nativeEnum(ChannelType)
});


export default function EditChannelModal({ userId, orgId, children }) {
    const { onOpen, onClose, isOpen, type, data } = useModal()
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [open, setOpen] = useState(false)
    const { updateLoading, updateServer } = useContext(OrgContext)


    const isModalOpen = isOpen && type === "editChannel";
    const { channel, server } = data



    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            type: channel?.type || ChannelType.TEXT,
        }
    });


    useEffect(() => {
        if (channel) {
            form.setValue('name', channel.name)
            form.setValue('type', channel.type)
        }
    }, [form, channel])

    const isLoading = form.formState.isSubmitting;

    const { execute } = useAction(updateChannel, {
        onSuccess: (data) => {

            updateServer(data.server)
            updateLoading(false)
            toast.success(`Channel ${data.name} updated successfully`)
        },
        onError: (error) => {
            updateLoading(false)
            toast.error(error)
        }
    })

    const onSubmit = async (values) => {
        try {
            updateLoading(true)
            handleClose()
            execute({ name: values.name, type: values.type, orgId: server.id, channelId: channel.id })
        } catch (error) {
            console.log(error);
        }
    }

    const handleClose = () => {
        onClose()
        form.reset();
    }

    return (
        <Sheet open={isModalOpen} onOpenChange={handleClose}>

            <SheetContent className='dark:text-white'>
                <SheetHeader>
                    <SheetTitle>
                        Create Channel for your Organization
                    </SheetTitle>
                    <SheetDescription className='text-xs'>
                        Channel helps you to communicate within your organization
                    </SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="">
                            <div className="space-y-8 ">


                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel
                                                className="uppercase text-xs font-bold text-slate-800 dark:text-gray-400"
                                            >
                                                Channel name
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    disabled={isLoading}
                                                    className=""
                                                    placeholder="Enter Channel name"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className='text-xs text-red-500' />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel
                                                className="uppercase text-xs font-bold text-slate-800 dark:text-gray-400"
                                            >
                                                Channel Type
                                            </FormLabel>
                                            <Select
                                                disabled={isLoading}
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger
                                                        className=" focus:ring-0  ring-offset-0 focus:ring-offset-0 capitalize outline-none"
                                                    >
                                                        <SelectValue placeholder="Select a channel type" className='text-gray-600' />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {Object.values(ChannelType).map((type) => (
                                                        <SelectItem
                                                            key={type}
                                                            value={type}
                                                            className="capitalize"
                                                        >
                                                            {type.toLowerCase()}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <SheetFooter className="  p-2 mt-4">

                                <Button variant="outline" disabled={isLoading} >
                                    {
                                        isLoading && <Loader className='w-4 h-4 animate-spin mr-2' />
                                    }

                                    Update
                                </Button>
                            </SheetFooter>
                        </form>

                    </Form>
                </div>

            </SheetContent>
        </Sheet>
    )
}





