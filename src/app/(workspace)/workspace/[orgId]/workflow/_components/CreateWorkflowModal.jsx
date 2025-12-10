import { useModal } from '@/hooks/useModal';
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form"
import { Textarea } from '@/components/ui/textarea';
import { useAction } from '@/hooks/use-action';
import { createWorkflow } from '../_actions/create-workflow';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loader } from 'lucide-react';

const formSchema = z.object({
    name: z.string().min(2).max(50),
    description: z.string().max(100).optional()
})



export default function CreateWorkflowModal() {
    const { onOpen, onClose, isOpen, type, data } = useModal()
    const isModalOpen = isOpen && type === "createWorkFLow";
    const { orgId, userId } = data
    const router = useRouter()

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            description: '',
        },
    })


    const handleOnOpenChange = () => {
        onClose()
        form.reset()
    }

    const { execute, isLoading } = useAction(createWorkflow, {
        onSuccess: (data) => {
            console.log('data', data)
            handleOnOpenChange()
            toast.success(`Workflow ${data?.name} created successfully`, { id: 'create-workflow' })
            router.push(`/workspace/${orgId}/workflow/${data.id}`)
        },
        onError: (error) => {
            toast.error(error)
        }
    })

    const onSubmit = (values) => {
        console.log(values, data)
        toast.loading('Creating workflow', { id: 'create-workflow' })
        execute({ orgId, userId, name: values.name, description: values.description })
    }

    return (
        <Dialog open={isModalOpen} onOpenChange={handleOnOpenChange}>

            <DialogContent className="sm:max-w-[525px] text-white">
                <DialogHeader>
                    <DialogTitle>Create Workflow</DialogTitle>
                    <DialogDescription className='text-xs text-muted-foreground '>
                        Start building your workflow
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title (required)</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Choose a descriptive and unique name
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea rows='4'  {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Provide a breif description of what your workflow does.
                                        This is optional but can help you to remember workflow's purpose
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" size='sm' className='bg-blue-600 hover:bg-blue=800 text-white w-full'>
                            {isLoading && <Loader size={16} className='mr-2 animate-spin' />}
                            Submit
                        </Button>
                    </form>
                </Form>

            </DialogContent>
        </Dialog>
    )
}
