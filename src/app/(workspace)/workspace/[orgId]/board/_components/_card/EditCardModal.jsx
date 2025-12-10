'use client'
import { Button } from '@/components/ui/button'
import { useAction } from '@/hooks/use-action'
import { Loader, Plus, XIcon } from 'lucide-react'
import { useParams } from 'next/navigation'
import React, { forwardRef, useContext, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { FormSubmit } from '@/components/global/FormSubmit'
import { useDispatch } from 'react-redux'
import { createTaskCard } from '../../_actions/_card/create_card'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, } from "@/components/ui/sheet"
import { Textarea } from '@/components/ui/textarea'
import { OrgContext } from '@/providers/OrgProvider'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DatePicker } from '@/components/global/DatePicker'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import moment from 'moment'

const formSchema = z.object({
    title: z.string().min(1, {
        message: "Please give title for Task Card"
    }),
    description: z.optional(z.string()),
    priority: z.string().min(3, {
        message: "Please select priority"
    }),
    status: z.boolean(),
    color: z.string(),
    dueDate: z.date(),
    assigneeId: z.string().min(5, {
        message: "Please select assignee"
    })
});

const cardColor = [
    { 'priority': 'LOW', 'color': '#2563EB' },
    { 'priority': 'MEDIUM', 'color': '#059669' },
    { 'priority': 'HIGH', 'color': '#D97706' },
]

export const EditCardModal = forwardRef(({ data, boardId, listId, server, userId }, ref) => {
    const params = useParams()
    const formRef = useRef(null)
    const dispatch = useDispatch()
    const [open, setOpen] = useState(false)
    const [formData, setFormData] = useState({ title: '', description: '' })
    const { updateLoading, updateServer } = useContext(OrgContext)
    const members = server?.members?.filter((member) => member?.userId !== userId)
    const [loading, setLoading] = useState(true)
    const color = cardColor.find((item) => item?.priority === data?.priority)

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            priority: 'LOW',
            status: true,
            color: "#2563EB",
            dueDate: new Date(),
            assigneeId: userId
        }
    });

    console.log(data)

    useEffect(() => {
        if (data) {
            form.setValue('title', data.title)
            //form.setValue('type', channel.type)
        }
    }, [form])

    const isLoading = form.formState.isSubmitting;


    const { execute: createNewCard, fieldErrors } = useAction(createTaskCard, {
        onSuccess: (data) => {
            //console.log(data)
            updateLoading(false)
            updateServer(data.server)
            toast.success(`Card ${data.card.title} created successfully`)
        },
        onError: (error) => {
            toast.error(error)
            updateLoading(false)
        }
    })

    const handleOpenChange = () => {
        setOpen(!open)
        form.reset()
    }

    const onSubmit = (values) => {

        //console.log('create card', values)
        //console.log(server)

        // if (formData.title === '') return toast.error('Provide a title for the card')
        updateLoading(true)
        handleOpenChange()
        createNewCard({ ...values, boardId, userId, listId: pillerId, orgId: server.id, priority: values.priority.toUpperCase() })
    }



    return (

        <Dialog open={open} onOpenChange={handleOpenChange}>

            <DialogTrigger asChild>
                <div onClick={() => { }} className='flex flex-wrap text-wrap capitalize w-full p-2 border-l-[4px] ' style={{ borderLeftColor: `${color.color}` }}>
                    <div className='flex flex-col w-full gap-2'>
                        <div className='text-xs'>{data?.title}</div>
                        <div className='flex justify-start text-[8px] text-muted-foreground'>{moment(data.createdAt).format('Do MMM YY, h:mm a')}</div>
                    </div>

                </div>
            </DialogTrigger >

            <DialogContent className='text-white w-[1800px] sm:max-w-[625px] '>

                <DialogHeader>
                    <DialogTitle>Create task card</DialogTitle>
                    <DialogDescription>
                        Create a task card for this taskbord and manage workflow
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 mt-6">

                    <div>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="">
                                <div className="space-y-4">

                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className=" text-xs font-bold text-slate-800 dark:text-gray-400"                                        >
                                                    Task card title
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        disabled={isLoading}
                                                        className=" shadow-none"  {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage className='text-xs text-orange-500' />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className=" text-xs font-bold text-slate-800 dark:text-gray-400"                                        >
                                                    Task card Description
                                                </FormLabel>
                                                <FormControl>

                                                    <Textarea

                                                        rows='5'
                                                        disabled={isLoading}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage className='text-xs' />
                                            </FormItem>
                                        )}
                                    />


                                    <FormField
                                        control={form.control}
                                        name="dueDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className=" text-xs font-bold text-slate-800 dark:text-gray-400"                                        >
                                                    Due Date
                                                </FormLabel>
                                                <FormControl>
                                                    <DatePicker {...field} />
                                                </FormControl>
                                                <FormMessage className='text-xs' />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className=" text-xs font-bold text-slate-800 dark:text-gray-400"                                        >
                                                    Status
                                                </FormLabel>
                                                <FormControl>

                                                    <Select disabled={isLoading} onValueChange={field.onChange} defaultValue={field.value} className="">
                                                        <SelectTrigger className="">
                                                            <SelectValue placeholder="Select Priority" />
                                                        </SelectTrigger>
                                                        <SelectContent className='flex gap-2'>
                                                            <SelectItem value={true} >Active</SelectItem>
                                                            <SelectItem value={false} >InActive</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage className='text-xs' />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="priority"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className=" text-xs font-bold text-slate-800 dark:text-gray-400"                                        >
                                                    Priority
                                                </FormLabel>
                                                <FormControl>

                                                    <Select disabled={isLoading} onValueChange={field.onChange} defaultValue={field.value} className="">
                                                        <SelectTrigger className="">
                                                            <SelectValue placeholder="Select Priority" />
                                                        </SelectTrigger>
                                                        <SelectContent className='flex gap-2'>
                                                            <SelectItem value={'LOW'} className=' '>Low</SelectItem>
                                                            <SelectItem value={'MEDIUM'} className=' '>Medium</SelectItem>
                                                            <SelectItem value={'HIGH'} className=' '>High</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage className='text-xs' />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="assigneeId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className=" text-xs font-bold text-slate-800 dark:text-gray-400"                                        >
                                                    Assignee
                                                </FormLabel>
                                                <FormControl>

                                                    <Select disabled={isLoading} onValueChange={field.onChange} defaultValue={field.value} className="">
                                                        <SelectTrigger className="">
                                                            <SelectValue placeholder="Select Assignee" />
                                                        </SelectTrigger>
                                                        <SelectContent className='flex gap-2'>
                                                            <SelectGroup>

                                                                {server?.members.map((member, index) => {
                                                                    return (
                                                                        <SelectItem key={index} value={member.user.id}>
                                                                            <div className='flex gap-2 items-center'>
                                                                                <Avatar className='h-6 w-6 rounded-sm'>
                                                                                    <AvatarFallback className='text-xs bg-blue-600 rounded-sm'>{member?.user?.name?.substring(0, 1)}</AvatarFallback>
                                                                                </Avatar>
                                                                                {member.user.name}
                                                                            </div>
                                                                        </SelectItem>
                                                                    )
                                                                })}
                                                            </SelectGroup>
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage className='text-xs text-orange-500' />
                                            </FormItem>
                                        )}
                                    />


                                    <div className='flex justify-end mt-2'>
                                        <Button variant="outline" disabled={isLoading} className='bg-blue-600 w-full hover:bg-sky-800' >
                                            {
                                                isLoading && <Loader className='w-4 h-4 animate-spin mr-2' />
                                            }

                                            Create Task Card
                                        </Button>
                                    </div>

                                </div>

                            </form>
                        </Form>
                    </div>


                </div>


            </DialogContent >
        </Dialog>


    )
})
EditCardModal.displayName = "CardForm";