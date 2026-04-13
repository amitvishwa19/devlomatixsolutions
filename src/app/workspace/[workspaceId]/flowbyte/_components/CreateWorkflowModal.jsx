'use client'
import React, { useEffect, useState } from 'react'
import { useModal } from '@/hooks/useModal'
import { useAuth } from '@/providers/AuthProvider'
import { useSession } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogHeader, 
    DialogTitle 
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { 
    Form, 
    FormControl, 
    FormDescription, 
    FormField, 
    FormItem, 
    FormLabel, 
    FormMessage 
} from "@/components/ui/form"
import { Textarea } from '@/components/ui/textarea'
import { useAction } from '@/hooks/use-action'
import { createWorkflow } from '../_actions/create-workflow'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(50),
    description: z.string().max(100).optional()
})

export default function CreateWorkflowModal() {
    const { onClose, isOpen, type, data } = useModal()
    const isModalOpen = isOpen && type === "createWorkFLow"
    const { workspaceId, userId: modalUserId } = data
    const { user } = useAuth()
    const { data: session } = useSession()
    
    // Fallback to current user if modal data doesn't have it
    const userId = modalUserId || user?.id || session?.user?.userId;
    const router = useRouter()

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            description: '',
        },
    })

    const { execute, isLoading, fieldErrors } = useAction(createWorkflow, {
        onSuccess: (data) => {
            onClose()
            form.reset()
            toast.success(`Workflow "${data?.name}" created successfully`, { id: 'create-workflow' })
            router.push(`/workspace/${workspaceId}/flowbyte/${data.id}`)
        },
        onError: (error) => {
            toast.error(error, { id: 'create-workflow' })
        }
    })

    useEffect(() => {
        if (fieldErrors && Object.keys(fieldErrors).length > 0) {
            const firstError = Object.values(fieldErrors)[0][0];
            toast.error(firstError, { id: 'create-workflow' });
        }
    }, [fieldErrors]);

    const onSubmit = (values) => {
        toast.loading('Creating workflow...', { id: 'create-workflow' })
        execute({ workspaceId, userId, name: values.name, description: values.description })
    }

    return (
        <Dialog open={isModalOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Create Workflow</DialogTitle>
                    <DialogDescription className='text-xs'>
                        Define a new automation workflow.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="E.g. Daily Web Scraper" className="rounded-xl border-muted focus-visible:ring-primary/20" {...field} />
                                    </FormControl>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea 
                                            placeholder="What does this workflow do?" 
                                            rows={3} 
                                            className="rounded-xl border-muted focus-visible:ring-primary/20 resize-none" 
                                            {...field} 
                                        />
                                    </FormControl>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                            )}
                        />
                        <div className="pt-2">
                            <Button 
                                type="submit" 
                                className='w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl'
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                        Creating...
                                    </>
                                ) : "Create Workflow"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
