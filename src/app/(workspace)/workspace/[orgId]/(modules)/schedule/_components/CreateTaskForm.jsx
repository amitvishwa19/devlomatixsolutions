import React, { useContext, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DatePicker } from '@/components/global/DatePicker'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSession } from 'next-auth/react'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { OrgContext } from '@/providers/OrgProvider'
import { Loader } from 'lucide-react'
import { useAction } from '@/hooks/use-action'
import { createTask } from '../_actions/create_task'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, } from "@/components/ui/sheet"

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
    }),
    boardId: z.string().min(2, {
        message: "Please select project"
    })
});


export const CreateTaskForm = () => {

    const { data: session } = useSession()
    const { server, updateLoading } = useContext(OrgContext)
    const members = server?.members?.filter((member) => member.userId !== session?.user?.userId)
    const [open, setOpen] = useState(false)
    const { orgId } = useParams()
    const router = useRouter()

    //console.log(server)

    const { execute: createNewCard, fieldErrors } = useAction(createTask, {
        onSuccess: (data) => {
            console.log(data)
            router.refresh()
            updateLoading(false)
            //updateServer(data.server)
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


    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            priority: 'LOW',
            status: true,
            color: "#2563EB",
            dueDate: new Date(),
            assigneeId: session?.user?.userId,
            boardId: ''
        }
    });

    const isLoading = form.formState.isSubmitting;

    const onSubmit = (values) => {
        updateLoading(true)
        handleOpenChange()
        createNewCard({ ...values, userId: session?.user?.userId, orgId: server.id })
    }

    return (
        <Sheet open={open} onOpenChange={handleOpenChange}>
            <SheetTrigger asChild>
                <Button variant='outline' className='bg-blue-600 text-white'>Add Task</Button>
            </SheetTrigger >
            <SheetContent className='text-white w-[1800px] sm:max-w-[625px] '>
                <SheetHeader>
                    <SheetTitle>Create task card</SheetTitle>
                    <SheetDescription>
                        Create a task card for this taskbord and manage workflow
                    </SheetDescription>
                </SheetHeader>
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
                                        name="boardId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className=" text-xs font-bold text-slate-800 dark:text-gray-400"                                        >
                                                    Project
                                                </FormLabel>
                                                <FormControl>

                                                    <Select disabled={isLoading} onValueChange={field.onChange} defaultValue={field.value} className="">
                                                        <SelectTrigger className="">
                                                            <SelectValue placeholder="Select Project" />
                                                        </SelectTrigger>
                                                        <SelectContent className='flex gap-2'>
                                                            <SelectGroup>

                                                                {server?.boards.map((board, index) => {
                                                                    return (
                                                                        <SelectItem key={index} value={board.id}>
                                                                            <div className='flex gap-2 items-center'>
                                                                                <Avatar className='h-6 w-6 rounded-sm'>
                                                                                    <AvatarFallback className='text-xs bg-blue-600 rounded-sm'>{board?.title.substring(0, 1)}</AvatarFallback>
                                                                                </Avatar>
                                                                                {board?.title}
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

            </SheetContent>
        </Sheet>
    )
}


// 