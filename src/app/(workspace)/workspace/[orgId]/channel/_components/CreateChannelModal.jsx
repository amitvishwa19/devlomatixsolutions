'use client'
import { Loader } from 'lucide-react'
import React, { useContext, useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input"
import { z } from 'zod'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { ChannelType } from '@prisma/client'
import { useModal } from '@/hooks/useModal'
import qs from 'query-string'
import axios from '@/utils/axios'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { createChannel } from '../_actions/create-channel'
import { useAction } from '@/hooks/use-action'
import { OrgContext } from '@/providers/OrgProvider'

const formSchema = z.object({
    name: z.string().min(1, {
        message: "Channel name is required."
    }).refine(
        name => name !== 'general',
        { message: "Channel name cannot be 'general'" }
    ),
    type: z.nativeEnum(ChannelType)
});


export default function CreateChannelModal() {
    const { isOpen, onClose, type, data } = useModal();
    const router = useRouter();
    const { orgId } = useParams();
    const { loading, updateLoading, updateServer } = useContext(OrgContext)

    const isModalOpen = isOpen && type === "createChannel";
    const { channelType } = data



    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            type: channelType || ChannelType.TEXT,
        }
    });


    useEffect(() => {
        if (channelType) {
            form.setValue('type', channelType)
        } else {
            form.setValue('type', ChannelType.TEXT)
        }
    }, [channelType, form])

    const isLoading = form.formState.isSubmitting;

    const { execute: handleCreateChannel, fieldErrors } = useAction(createChannel, {
        onSuccess: (data) => {
            updateServer(data.server)
            updateLoading(false)
            toast.success(`New channel ${data?.channel?.name} created`)
        },
        onError: (error) => {
            updateLoading(false)
            toast.error('Error while creating board ,Please try again later')
        }
    })

    const onSubmit = async (values) => {
        handleClose()
        updateLoading(true)
        handleCreateChannel({ orgId, name: values.name, type: values.type })
    }

    const handleClose = (e) => {
        form.reset();
        onClose();
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
                                                        className="capitalize outline-none"
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

                                    Create
                                </Button>
                            </SheetFooter>
                        </form>

                    </Form>
                </div>

            </SheetContent>
        </Sheet>

    )
}





