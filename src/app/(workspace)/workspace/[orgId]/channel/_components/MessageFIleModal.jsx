'use client'
import { Loader, Plus } from 'lucide-react'
import React from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FileUpload } from '@/components/global/FileUpload'
import { useAction } from '@/hooks/use-action'
import { toast } from 'sonner'
import { useModal } from '@/hooks/useModal'
import axios from '@/utils/axios'
import qs from 'query-string'
import { createServer } from '@/app/(workspace)/workspace/_action/server/create_server'

const formSchema = z.object({
    fileUrl: z.string().min(1, {
        message: "File attachment is required."
    })
});


export default function MessageFIleModal({ userId, orgId, children }) {
    const { onOpen, onClose, isOpen, type, data } = useModal()
    const router = useRouter();
    const isModalOpen = isOpen && type === "messageFile";
    const { apiUrl, query } = data

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fileUrl: "",
        }
    });


    const isLoading = form.formState.isSubmitting;


    const { execute } = useAction(createServer, {
        onSuccess: (data) => {
            form.reset();
            router.refresh();
            setOpen(!open)
            toast.success(`Server ${data.name} created successfully`)
        },
        onError: (error) => {
            toast.error(error)
        }
    })

    const onSubmit = async (values) => {
        try {
            const url = qs.stringifyUrl({
                url: apiUrl || '',
                query
            })

            await axios.post(url, {
                ...values, content: values.fileUrl
            })
            form.reset()
            router.refresh()
            onClose()

        } catch (error) {
            console.log(error);
        }
    }



    const handleOpenChange = () => {
        router.refresh();
        form.reset();
        onClose()
    }

    return (
        <Dialog open={isModalOpen} onOpenChange={handleOpenChange} >
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[645px] bg-slate-200 text-slate-700  p-0 overflow-hidden ">
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-2xl text-center font-bold">
                        Add an attachment
                    </DialogTitle>
                    <DialogDescription className="text-center  text-zinc-600">
                        Send file as a message
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="space-y-8 px-6">
                            <div className="flex items-center justify-center text-center">
                                <FormField
                                    control={form.control}
                                    name="fileUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <FileUpload
                                                    endpoint="messageFile"
                                                    value={field.value}
                                                    onChange={field.onChange}

                                                />
                                            </FormControl>
                                            <FormMessage className='text-xs' />
                                        </FormItem>
                                    )}
                                />
                            </div>


                        </div>
                        <DialogFooter className=" bg-slate-500 p-2 ">
                            <div className='flex items-center justify-between'>
                                <Button variant="primary" size='sm' disabled={isLoading} >
                                    {
                                        isLoading && <Loader className='w-4 h-4 animate-spin mr-2' />
                                    }

                                    Send Attachment
                                </Button>
                            </div>
                        </DialogFooter>
                    </form>

                </Form>

            </DialogContent>
        </Dialog>

    )
}





