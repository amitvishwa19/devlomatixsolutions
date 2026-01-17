'use client'
import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger, } from "@/components/ui/tabs"
import { Calendar, LayoutDashboard, Loader, Plus, SquareKanban } from 'lucide-react'
import BoardOptions from '../board/_components/_board/BoardOptions'
import { useQuery } from '@tanstack/react-query'
import { getProjectData } from './_actions/get-project-data'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useQueryState } from 'nuqs'
import { CreateTaskForm } from './_components/CreateTaskForm'
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage, } from "@/components/ui/avatar"
import { format } from 'date-fns'
import TaskDate from './_components/TaskDate'
import { snakeCseToTitleCase } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { useModal } from '@/hooks/useModal'

export default function ProjectPage() {

    const { orgId } = useParams()
    const { onOpen } = useModal()


    const [view, setView] = useState('task-view', {
        defaultValue: 'table'
    })

    const { data, isLoading, isError, error, isFetching } = useQuery({
        queryKey: ['projects'],
        queryFn: () => {
            return getProjectData(orgId)
        }
    })

    //console.log('data', data)

    return (
        <div className=''>



            <Tabs defaultValue={view} onValueChange={setView} className="">

                < TabsList className="h-12  bg-transparent text-slate-600 flex flex-row justify-between items-center px-4 py-4" >
                    <div>

                        <TabsTrigger value="table" className=' items-center gap-2'>
                            <LayoutDashboard size={14} />
                            Table
                        </TabsTrigger>

                        <TabsTrigger value="calender" className=' items-center gap-2'>
                            <Calendar size={14} />
                            Calender
                        </TabsTrigger>

                        <TabsTrigger value="kanban" className=' items-center gap-2'>
                            <SquareKanban size={14} />
                            Kanban
                        </TabsTrigger>
                    </div>
                    <div className='flex items-center gap-2'>
                        <CreateTaskForm />
                        <Button
                            variant='outline' className='bg-blue-600 text-white'
                            onClick={() => { onOpen("createBoard", { serverId: orgId }) }}
                        >
                            <Plus className='size-4 mr-2' />
                            Project
                        </Button>
                    </div>
                </TabsList >
                {/* {format(task?.dueDate, 'PPP')} */}

                {
                    !isLoading ? (
                        <>
                            <TabsContent value="table" className='text-xs text-wrap    '>
                                <Table>
                                    <TableCaption>A list of your recent projects.</TableCaption>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="">Project</TableHead>
                                            <TableHead className="">Title</TableHead>
                                            <TableHead className="">Assignee</TableHead>
                                            <TableHead>Due Date</TableHead>
                                            <TableHead>Priority</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.map((task) => {
                                            //console.log(task)
                                            return (
                                                <TableRow key={task.id}>
                                                    <TableCell className='flex gap-2 items-center'>
                                                        <Avatar className='h-6 w-6 rounded-sm'>
                                                            <AvatarFallback className='bg-blue-600 rounded-md '> {task?.board?.title?.substring(0, 1)}</AvatarFallback>
                                                        </Avatar>
                                                        <span>
                                                            {task?.board?.title}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="font-medium capitalize">{task?.title}</TableCell>
                                                    <TableCell className='flex gap-2 items-center'>
                                                        <Avatar className='h-6 w-6 rounded-sm'>
                                                            <AvatarFallback className='bg-blue-600 rounded-md '> {task?.assignee?.name?.substring(0, 1)}</AvatarFallback>
                                                        </Avatar>
                                                        <span>
                                                            {task?.assignee?.name}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <TaskDate value={task?.dueDate} />
                                                    </TableCell>
                                                    <TableCell className="font-medium capitalize ">
                                                        <Badge variant={`${task?.priority}`}>
                                                            {snakeCseToTitleCase(task?.priority)}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={' capitalize'}>
                                                            {task?.list?.title}
                                                        </Badge>
                                                    </TableCell>

                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>

                                </Table>
                            </TabsContent>


                            <TabsContent value="kanban">
                                kanban
                            </TabsContent>

                            <TabsContent value="calender">
                                calender
                            </TabsContent>
                        </>
                    ) : (
                        <div className='p-2'>
                            <div className='w-full border border-dashed rounded-lg flex flex-col items-center justify-center h-[200px]'>
                                <Loader className='size-5 animate-spin text-muted-foreground' />
                            </div>
                        </div>
                    )
                }


            </Tabs >

        </div >

    )
}
