'use client'
import { useQuery } from '@tanstack/react-query'
import React, { useEffect, useState } from 'react'
import { GetWorkflowExecutionWithPhase } from '../../../../_actions/get-workflow-execution-with-phase'
import { ExecutionPhaseStatus, ExecutionStatus } from '../../../../types/types'
import { CalendarIcon, CircleCheckIcon, CircleDashedIcon, ClockIcon, CoinsIcon, Loader2Icon, LoaderIcon, WorkflowIcon } from 'lucide-react'
import { formatDistanceToNow, intervalToDuration } from 'date-fns'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GetWorkflowPhaseDetails } from '../../../../_actions/get-workflow-phase-detals'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card"
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { PhaseExecutionBadge } from './PhaseStatusBadge'
import UserAvaliableCreditsBadge from '../../../../_components/UserAvaliableCreditsBadge'
import CountupWrapper from '../../../../_components/CountupWrapper'

export default function ExecutionViewer({ initialData }) {
    const { data: session } = useSession()
    const [selectedPhase, setSelectedPhase] = useState(null)

    const query = useQuery({
        queryKey: ['execution', initialData?.id],
        initialData,
        queryFn: () => GetWorkflowExecutionWithPhase(initialData?.id),
        refetchInterval: (q) => q.state.data?.status === ExecutionStatus.RUNNING ? 1000 : false
    })


    const phaseDetails = useQuery({
        queryKey: ['phaseDetails', selectedPhase, query.data?.status],
        enabled: selectedPhase !== null,
        queryFn: () => GetWorkflowPhaseDetails(selectedPhase, session?.user?.userId)
    })

    //console.log('@phaseDetails', phaseDetails?.data)

    const isRunning = query?.data?.status === ExecutionPhaseStatus.RUNNING

    useEffect(() => {
        //console.log('@workflow viewer')
        //while running ew will select current running phase
        const phases = query?.data?.phases || []



        if (isRunning) {
            //setSelectedPhase(phases[phases.length - 1].id)
            const phaseToSelect = phases.toSorted((a, b) => a.startedAt > b.startedAt ? -1 : 1)[0]
            //console.log('@@phaseToSelect', phaseToSelect.id)
            setSelectedPhase(phaseToSelect.id)
            return
        }

        const phaseToSelect = phases.toSorted((a, b) => a.completedAt > b.completedAt ? -1 : 1)[0]
        setSelectedPhase(phaseToSelect.id)

    }, [query?.data?.phases, isRunning, setSelectedPhase])




    const duration = DatesToDurationString(query?.data?.completedAt, query?.data?.startedAt)

    const creditConsumed = GetPhaseTotalCost(query?.data?.phases || [])


    return (
        <div className='flex w-full h-full  absolute'>

            <aside className="w-[400px] min-w-[400px] max-w-[400px] border-r-2 border-separate flex flex-grow flex-col overflow-hidden ">
                <div className='py-4 px-2'>

                    <>


                        <ExecutionLabel
                            icon={CircleDashedIcon}
                            label={'Status'}
                            value={
                                query?.data?.status === ExecutionStatus.RUNNING || query?.data?.status === ExecutionStatus.PENDING ?
                                    <div className='flex gap-2 items-center'>
                                        <span>{query?.data?.status}</span>
                                        <Loader2Icon size={20} className="animate-spin stroke-yellow-500" />
                                    </div> :
                                    <div className='flex gap-2 items-center'>
                                        {query?.data?.status}
                                        <CircleCheckIcon size={20} className="stroke-green-500" />
                                    </div>
                            }
                        />



                        <ExecutionLabel
                            icon={CalendarIcon} label={'Started At'}
                            value={<span className=' lowercase'>
                                {query?.data?.startedAt ? formatDistanceToNow(new Date(query?.data?.startedAt)) : '-'}
                            </span>}
                        />

                        <ExecutionLabel
                            icon={ClockIcon}
                            label={'Duration'}
                            value={duration ? duration : <LoaderIcon size={20} className='animate-spin' />}
                        />

                        <ExecutionLabel
                            icon={CoinsIcon}
                            label={'Credit consumed'}
                            value={<CountupWrapper value={creditConsumed} />}
                        />
                    </>

                    <Separator />

                    <div className='flex justify-center items-center py-2 px-4'>
                        <div className='text-muted-foreground flex items-center justify-between gap-2'>
                            <WorkflowIcon size={20} className='stroke-muted-foreground/80' />
                            <span className='font-semibold'>
                                Phases
                            </span>
                        </div>
                    </div>

                    <Separator />



                    <div className='overflow-auto h-full px-2 py-4 flex flex-col gap-2'>
                        {
                            query?.data?.phases.map((phase, index) => (
                                <Button
                                    key={index}
                                    className=' w-full justify-between'
                                    variant={selectedPhase === phase.id ? 'outline' : 'ghost'}
                                    onClick={() => {
                                        if (isRunning) return
                                        setSelectedPhase(phase.id)
                                    }}
                                >
                                    <div className='flex items-center gap-2'>
                                        <Badge variant={'outline'}>{index + 1}</Badge>
                                        <p className='font-semibold'>{phase.name}</p>
                                    </div>
                                    {/* <p className='text-muted-foreground text-xs'>{phase?.status}</p> */}
                                    <PhaseExecutionBadge status={phase?.status} />
                                </Button>
                            ))
                        }
                    </div>

                </div>
            </aside>

            <div className='flex w-full h-full'>
                {/* <pre>
                    {JSON.stringify(phaseDetails?.data, null, 4)}
                </pre> */}
                {isRunning && (
                    <div className='flex items-center flex-col justify-center h-full w-full'>
                        <p className="font-bold">Run is in progress, please wait ....</p>
                    </div>
                )}

                {!isRunning && !selectedPhase && (
                    <div className="flex items-center flex-col justify-center h-full w-full">
                        <div className="flex flex-col gap-1 text-center">
                            <p className='font-bold'>No phase selected</p>
                            <p className='text-xs text-muted-foreground'>Please select a phase to view details</p>
                        </div>
                    </div>
                )}
                {!isRunning && selectedPhase && phaseDetails.data && (
                    <div className='flex flex-col py-4 container gap-4 overflow-auto'>
                        <div className='flex flex-col gap-4'>
                            <div className='flex gap-2 items-center'>
                                <Badge variant='outline' className={'space-x-4 flex gap-2 space-y-2 items-center'}>
                                    <div className='flex items-center gap-x-4 py-1'>
                                        <div className='flex gap-2'>
                                            <CoinsIcon size={18} />
                                            <span>Credits</span>
                                        </div>
                                        <span>{phaseDetails.data.creditConsumed}</span>
                                    </div>
                                </Badge>
                                {/* <UserAvaliableCreditsBadge /> */}
                                <Badge variant='outline' className={'space-x-4 flex gap-2 space-y-2 items-center'}>
                                    <div className='flex items-center gap-x-4 py-1'>
                                        <div className='flex gap-2'>
                                            <ClockIcon size={18} />
                                            <span>Duration</span>
                                        </div>
                                        <span>{DatesToDurationString(phaseDetails.data.completedAt, phaseDetails.data.startedAt) || '-'}</span>
                                    </div>
                                </Badge>
                            </div>

                            <ParamViewer
                                title='Inputs'
                                subtitle='Input used for this phase'
                                paramsJson={phaseDetails.data.inputs}
                            />

                            <ParamViewer
                                title='Outputs'
                                subtitle='Output generated by this phase'
                                paramsJson={phaseDetails.data.outputs}
                            />

                            <LogViewer logs={phaseDetails.data.workflowExecutionLogs} />
                            {/* {JSON.stringify(phaseDetails.data, null, 4)} */}

                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function ExecutionLabel({ icon, label, value }) {
    const Icon = icon
    return (
        <div className='flex justify-between items-center py-2 px-4 text-xs'>
            <div className='text-muted-foreground flex items-center gap-2'>
                <Icon size={20} className='stroke-muted-foreground' />
                <span>{label}</span>
            </div>
            <div className='font-semibold capitalize flex gap-2 items-center'>
                {value}
            </div>
        </div>
    )
}

export function DatesToDurationString(end, start) {
    if (!start || !end) return null

    //console.log('@start', start, '@end', end)


    const timeElapsed = end.getTime() - start.getTime()
    if (timeElapsed < 1000) {
        return `${timeElapsed}ms`
    }

    const duration = intervalToDuration({
        start: 0,
        end: timeElapsed
    })

    return `${duration.minutes || 0}m ${duration.seconds || 0}s`
}


function GetPhaseTotalCost(phases) {
    return phases.reduce((acc, phase) => acc + (phase.creditConsumed || 0), 0)
}

function ParamViewer({ title, subtitle, paramsJson }) {
    const params = paramsJson ? JSON.parse(paramsJson) : undefined
    //console.log('@@params', params)
    return (
        <Card>
            <CardHeader className='rounded-lg rounded-b-none border-b py-4 bg-gray-50 dark:bg-background'>
                <CardTitle className='text-base'>{title}</CardTitle>
                <CardDescription className='text-xs text-muted-foreground'>{subtitle}</CardDescription>
            </CardHeader>
            <CardContent className='py-4'>
                <div className='flex flex-col gap-2'>
                    {(!params || Object.keys(params).length === 0) && (
                        <div className='text-xs'>
                            No parameters generated by this phase
                        </div>
                    )}
                    {params && Object.entries(params).map(([key, value]) => (
                        <div key={key} className='flex gap-2 items-center justify-between space-y-1'>
                            <p className='text-muted-foreground text-xs  flex-1 basis-1/3'>
                                {key}
                            </p>
                            <Input readOnly className='flex-1 basis-2/3' value={value} />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

function LogViewer({ logs }) {
    if (!logs || logs.length === 0) {
        return
    }
    return (
        <Card>
            <CardHeader className='rounded-lg rounded-b-none border-b py-4 bg-gray-50 dark:bg-background'>
                <CardTitle className='text-base'>Logs</CardTitle>
                <CardDescription className='text-xs text-muted-foreground'>
                    Logs generated by this phase
                </CardDescription>
            </CardHeader>
            <CardContent className='mb-4'>
                <Table>
                    <TableHeader className='text-xs text-muted-foreground'>
                        <TableRow>
                            <TableHead>Time</TableHead>
                            <TableHead>Level</TableHead>
                            <TableHead>Message</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.map((log, key) => (
                            <TableRow key={log.id} className='text-xs text-muted-foreground'>
                                <TableCell width={190}>{log.createdAt.toISOString()}</TableCell>
                                <TableCell width={90}
                                    className={cn(
                                        'uppercase text-xs font-bold p-[3px] ',
                                        log.logLevel === 'success' && 'text-green-500',
                                        log.logLevel === 'info' && 'text-orange-400',
                                        log.logLevel === 'error' && 'text-red-500',
                                    )}
                                >
                                    {log.logLevel}</TableCell>
                                <TableCell className='text-wrap overflow-auto'>{log.message}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}