'use client'
import React, { useEffect, useState } from 'react'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useSession } from 'next-auth/react'
import { CalendarIcon, ClockIcon, TriangleIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { useMutation } from '@tanstack/react-query'
import { UpdateWorkflowCron } from '../_actions/update-workflow-cron'
import { toast } from 'sonner'
import cronstrue from 'cronstrue'
import parser from 'cron-parser'
import { useParams } from 'next/navigation'
import { RemoveWorkflowCron } from '../_actions/remove-workflow-cron'

export default function SchedularDialog(props) {
    const { data: session } = useSession()
    const [cron, setCron] = useState(props.cron || '')
    const [validCron, setValidCron] = useState(false)
    const [readableCron, setReadableCron] = useState('')
    const params = useParams()

    useEffect(() => {
        try {
            parser.parseExpression(cron)
            const humanCronStr = cronstrue.toString(cron)
            setValidCron(true)
            setReadableCron(humanCronStr)
        } catch (error) {
            setValidCron(false)
        }
    }, [cron])


    const mutation = useMutation({
        mutationFn: UpdateWorkflowCron,
        onSuccess: () => {
            setCron('')
            toast.success('Schedule updated successfully', { id: 'cron' })
        },
        onError: (error) => {
            toast.error('Error updating cron schedule', { id: 'cron' })
        }
    })

    const removeScheduleMutation = useMutation({
        mutationFn: RemoveWorkflowCron,
        onSuccess: () => {
            setCron('')
            toast.success('Schedule cron removed successfully', { id: 'cron' })
        },
        onError: (error) => {
            toast.error('Error removing cron schedule', { id: 'cron' })
        }
    })


    return (
        <Dialog >
            <DialogTrigger asChild>
                <Button variant='link' className={cn('text-sm p-0 h-auto')}>
                    {validCron ? (
                        <div className='flex items-center gap-2'>
                            <ClockIcon size={16} />
                            <span className='text-xs'>{readableCron}</span>
                        </div>
                    ) : (
                        <div className='flex items-center gap-1'>
                            <TriangleIcon className='h-3 w-3 mr-1' /> Set Schedule
                        </div>
                    )}

                </Button>
            </DialogTrigger>
            <DialogContent className='px-0 dark:text-white text-slate-800'>
                <DialogHeader className='flex flex-col items-center '>
                    <CalendarIcon size={28} />
                    <h2 className='font-bold'>Schedule workflow execution</h2>
                </DialogHeader>

                <div className='p-6 space-y-4'>
                    <p className='text-xs text-muted-foreground'>
                        Specify a cron expression to schedule preodic workflow execution. All time are in UTC
                    </p>
                    <Input placeholder='Eg. * * * * *' value={cron} onChange={(e) => { setCron(e.target.value) }} />
                    <div className={cn('text-xs text-red-400 bg-gray-500/20 rounded-md border p-4', validCron && 'text-green-500')}>
                        {validCron ? readableCron : 'Not a valid cron expression'}
                    </div>
                    {
                        validCron && (
                            <DialogClose asChild>
                                <div>
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        className='w-full  text-white'
                                        disabled={mutation.isPending || removeScheduleMutation.isPending}
                                        onClick={() => {
                                            toast.loading('Removing current schedule....', { id: 'cron' })
                                            removeScheduleMutation.mutate({
                                                id: props.workflowId,
                                                userId: session?.user?.userId,
                                                orgId: params.orgId
                                            })
                                        }}
                                    >
                                        Remove current schedule
                                    </Button>
                                </div>
                            </DialogClose>
                        )
                    }
                </div>
                <DialogFooter className='px-6 gap-2'>
                    <DialogClose asChild>
                        <Button size='sm' variant='outline' className='w-full'>Cancel</Button>
                    </DialogClose>
                    <DialogClose asChild>
                        <Button
                            size='sm'
                            className='w-full bg-blue-600 hover:bg-blue-800'
                            disabled={mutation.isPending || !validCron}
                            onClick={() => {
                                toast.loading('Scheduling cron schedule....', { id: 'cron' })
                                mutation.mutate({
                                    id: props.workflowId,
                                    cron,
                                    userId: session?.user?.userId,
                                    orgId: params.orgId
                                })
                            }}
                        >
                            Save
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
