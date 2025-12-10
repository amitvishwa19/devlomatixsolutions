'use client'
import { Loader, Plus } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useCardModal } from '@/hooks/useCardModal'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FileUpload } from '@/components/global/FileUpload'
import { useAction } from '@/hooks/use-action'
import { toast } from 'sonner'
import { useModal } from '@/hooks/useModal'
import { updateServer } from '../_action/server/update_server'


const formSchema = z.object({
    name: z.string().min(1, {
        message: "Server name is required."
    }),
    imageUrl: z.string().min(1, {
        message: "Server image is required."
    })
});


export default function EditOrgModal() {
    const { onOpen, onClose, isOpen, type, data } = useModal()
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [open, setOpen] = useState(false)
    const { server } = data


    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            imageUrl: "",
        }
    });

    useEffect(() => {
        if (server) {
            form.setValue('name', server.name)
            form.setValue('imageUrl', server.imageUrl)
        }
    }, [server, form])

    const isModalOpen = isOpen && type === "editServer";

    const isLoading = form.formState.isSubmitting;


    const { execute } = useAction(updateServer, {
        onSuccess: (data) => {
            form.reset();
            router.refresh();
            onClose()
            toast.success(`Organization updated to  ${data.name}`)
        },
        onError: (error) => {
            toast.error(error)
        }
    })

    const onSubmit = async (values) => {
        try {
            console.log(values)
            execute({ serverId: server.id, name: values.name, imageUrl: values.imageUrl })
        } catch (error) {
            console.log(error);
        }
    }

    const handleClose = (e) => {
        e.preventDefault()
        setOpen(!open)
        form.reset();
    }


    const handleOpenChange = () => {
        //router.refresh();
        //form.reset();
        onClose()
    }

    return (
        <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>

            <DialogContent className="sm:max-w-[545px] bg-slate-200 text-slate-700  p-0 overflow-hidden ">
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-2xl text-center font-bold">
                        Edit your Organization
                    </DialogTitle>
                    <DialogDescription className="text-center  text-zinc-600">
                        Give your Organization a personality with a name and an image. You can always change it later.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="space-y-8 px-6">
                            <div className="flex items-center justify-center text-center">
                                <FormField
                                    control={form.control}
                                    name="imageUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <FileUpload
                                                    endpoint="serverImage"
                                                    value={field.value}
                                                    onChange={field.onChange}

                                                />
                                            </FormControl>
                                            <FormMessage className='text-xs' />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel
                                            className="uppercase text-xs font-bold text-zinc-500 dark:text-darkText/50"
                                        >
                                            Organization name
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                disabled={isLoading}
                                                className="border-0 shadow-none bg-gray-300  text-black  "
                                                placeholder="Enter Organization name"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className='text-xs' />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter className=" bg-slate-900 p-2">
                            <Button onClick={(e) => { onClose() }}>Cancel</Button>
                            <Button variant="primary" disabled={isLoading} >
                                {
                                    isLoading && <Loader className='w-4 h-4 animate-spin mr-2' />
                                }

                                save
                            </Button>
                        </DialogFooter>
                    </form>

                </Form>

            </DialogContent>
        </Dialog>

    )
}





