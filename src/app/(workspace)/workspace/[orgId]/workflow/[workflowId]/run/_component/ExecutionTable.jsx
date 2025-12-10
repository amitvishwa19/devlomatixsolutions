'use client'

import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { GetWorkflowExecutions } from '../_actions/get-workflow-executions'
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow, } from "@/components/ui/table"
import { Badge } from '@/components/ui/badge'
import { DatesToDurationString } from '../[workflowExecutionId]/_components/ExecutionViewer'
import ExecutionStatusIndicator from '../[workflowExecutionId]/_components/ExecutionStatusIndicator'
import { CoinsIcon } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useParams, useRouter } from 'next/navigation'

export function ExecutionTable({ initialData, workflowId, }) {

    const router = useRouter()
    const params = useParams()
    const query = useQuery({
        queryKey: ['executions', workflowId],
        initialData,
        queryFn: () => GetWorkflowExecutions(workflowId),
        refetchInterval: 5000
    })

    return (
        <div className='p-2 mt-4 '>
            <Table className='h-full rounded-md'>
                <TableHeader className='bg-muted '>
                    <TableRow className='rounded-md'>
                        <TableHead>ID</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Consumed</TableHead>
                        <TableHead className='text-right text-xs text-muted-foreground'>Started at (desc)</TableHead>

                    </TableRow>
                </TableHeader>

                <TableBody className='gap-2 h-full overflow-auto'>
                    {query.data.map(execution => {
                        const duration = DatesToDurationString(execution.completedAt, execution.startedAt)
                        const formatedStartedAt = execution.createdAt && formatDistanceToNow(execution.startedAt)
                        //console.log(execution)
                        return (
                            <TableRow
                                key={execution.id}
                                className='cursor-pointer'
                                onClick={() => {
                                    router.push(`/workspace/${params.orgId}/workflow/${workflowId}/run/${execution.id}`)
                                    //console.log(`workspace/${params.orgId}/workflow/${workflowId}/run/${execution.id}`)
                                }}
                            >
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        <span className='font-semibold'>{execution.id}</span>
                                        <div className='text-xs text-muted-foreground'>
                                            <span>Triggred via</span>
                                            <Badge variant={'outline'}>{execution.trigger}</Badge>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className='flex flex-col '>
                                        <div className="flex items-center gap-2">
                                            <ExecutionStatusIndicator status={execution.status} />
                                            <span className='text-xs'>{execution.status}</span>
                                        </div>
                                        <div className="text-xs text-muted-foreground">{duration}</div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className='flex flex-col '>
                                        <div className="flex items-center gap-2">
                                            <CoinsIcon size={16} />
                                            <span className='text-xs'>{execution.creditConsumed}</span>
                                        </div>
                                        <div className="text-xs text-muted-foreground">Credits</div>
                                    </div>
                                </TableCell>
                                <TableCell className='text-right text-muted-foreground'>{formatedStartedAt}</TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}