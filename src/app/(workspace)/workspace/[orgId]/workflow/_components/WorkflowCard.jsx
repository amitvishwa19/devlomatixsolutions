'use client'
import React, { useState } from 'react'
import { Card, CardContent, } from "@/components/ui/card"
import { WORKFLOWSTATUS } from '@prisma/client'
import { cn } from '@/lib/utils'
import { ChevronRightIcon, ClockIcon, CoinsIcon, CornerDownRightIcon, Edit, EllipsisVertical, FileTextIcon, MoveRightIcon, PlayIcon, ShuffleIcon, Trash2, UserIcon } from 'lucide-react'
import Link from 'next/link'
import { Button, buttonVariants } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuShortcut, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from "@/components/ui/tooltip"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,

} from "@/components/ui/alert-dialog"
import { useMutation } from '@tanstack/react-query'
import { deleteWorkflow } from '../_actions/delete-workflow'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import { useAction } from '@/hooks/use-action'
import { useModal } from '@/hooks/useModal'
import SchedularDialog from './SchedularDialog'
import { Badge } from '@/components/ui/badge'
import { DeleteWorkflowModal } from './DeleteWorkflowModal'
import RunButton from './topbar/RunButton'
import { format, formatDistanceToNow } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'


const statusColor = {
    [WORKFLOWSTATUS.DRAFT]: "bg-red-400 text-red-600",
    [WORKFLOWSTATUS.PUBLISHED]: "bg-green-400 text-green-600"
}

export default function WorkflowCard({ workflow, orgId }) {
    //const isDraft = workflow.status //= WORKFLOWSTATUS.DRAFT
    //console.log(statusColor)
    //console.log(workflow)
    //console.log(isDraft)
    const isDraft = workflow.status === WORKFLOWSTATUS.DRAFT
    console.log(workflow.status)
    return (
        <Card key={workflow.id} className=" border border-separate shadow-sm rounded-lg overflow-hidden hover:shadow-md">
            <CardContent className='p-4 flex items-center h-[100px] justify-between'>

                <div className='flex items-center '>
                    <div className={cn(" w-10 h-10 rounded-full flex items-center justify-center mr-4", statusColor[workflow.status])}>
                        {
                            workflow.status === WORKFLOWSTATUS.DRAFT ?
                                (<FileTextIcon className='h-5 w-5' />) :
                                (<PlayIcon className='h-5 w-5' />)
                        }
                    </div>
                    <div>
                        <h3 className='text-base font-bold text-muted-foreground flex items-center'>
                            <Link href={`/workspace/${orgId}/workflow/${workflow.id}`} className='flex items-center hover:underline'>
                                {workflow.name}

                            </Link>
                            {isDraft && (
                                <span className='ml-2 px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full'>
                                    Draft
                                </span>
                            )}
                        </h3>
                        <SchedularSection isDraft={isDraft} creditCost={workflow.creditCost} workflowId={workflow.id} cron={workflow.cron} />
                    </div>
                </div>


                <div className='flex gap-2'>
                    {!isDraft && (
                        <RunButton workflowId={workflow.id} />
                    )}

                    <Link href={`/workspace/${orgId}/workflow/${workflow.id}`} className={cn('flex gap-2', buttonVariants({ variant: 'outline', size: 'sm' }))}>
                        <ShuffleIcon size={18} />
                        Edit
                    </Link>

                    <WorkFlowAction workflow={workflow} orgId={orgId} />
                </div>


                {/* {JSON.stringify(workflow)} */}
            </CardContent>
            <LastRunDetails workflow={workflow} orgId={orgId} />
        </Card>
    )
}

function WorkFlowAction({ workflow, orgId }) {
    const [showDeleteDialogModal, setShowDeleteDialogModal] = useState(false)
    const { data: session } = useSession()
    const openDeleteDialog = () => {
        setShowDeleteDialogModal(true)
    }
    const { onOpen } = useModal()

    return (
        <>
            {/* <DeleteOptionMOdal
                open={showDeleteDialogModal}
                setOpen={setShowDeleteDialogModal}
                workflow={workflow}
                orgId={orgId}
                openDeleteDialog={openDeleteDialog}
            /> */}

            <DeleteWorkflowModal />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className='p-0' size='sm'>
                        <EllipsisVertical size={16} />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="mr-2" align='end'>
                    <DropdownMenuLabel>Actionst</DropdownMenuLabel>
                    <DropdownMenuItem>
                        Edit
                        <DropdownMenuShortcut>
                            <Edit size={18} />
                        </DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => {
                        setShowDeleteDialogModal(true);
                        onOpen("deleteWorkFLow", { orgId, workflow, userId: session.user.userId })
                    }}>
                        Delete
                        <DropdownMenuShortcut >
                            <Trash2 size={18} />
                        </DropdownMenuShortcut>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}

// export function DeleteOptionMOdal() {
//     const [confirmText, setConfirmText] = useState('')
//     const { data: session } = useSession()

//     const { onOpen, onClose, isOpen, type, data } = useModal()
//     const isModalOpen = isOpen && type === "deleteWorkFLow";
//     const { workflow, orgId, userId } = data



//     const { execute } = useAction(deleteWorkflow, {
//         onSuccess: (data) => {
//             console.log('data', data)
//             toast.success(`Workflow ${data.name} deleted`)
//         },
//         onError: (error) => {
//             toast.error(error)
//         }
//     })

//     const handleDeleteWOrkflow = (workflowId) => {
//         execute({ workflowId, orgId, userId: session?.user?.userId })
//     }

//     const handleModalClose = () => {
//         onClose()
//     }

//     return (
//         <AlertDialog open={isModalOpen} onOpenChange={handleModalClose}>
//             {/* <AlertDialogTrigger asChild>
//                 <Button variant="outline">Show Dialog</Button>
//             </AlertDialogTrigger> */}
//             <AlertDialogContent>
//                 <AlertDialogHeader>
//                     <AlertDialogTitle className='text-white'>Are you absolutely sure?</AlertDialogTitle>
//                     <AlertDialogDescription>
//                         This action cannot be undone. This will permanently delete your
//                         workflow {workflow?.name}.
//                     </AlertDialogDescription>
//                     <p className='text-sm text-muted-foreground'>

//                         <span>If you are sure ,enter </span>
//                         <b className='font-semibold text-white'>{workflow?.name}</b>
//                         <span> to confirm</span>
//                     </p>
//                 </AlertDialogHeader>

//                 <div>
//                     <Input
//                         className='text-white'
//                         value={confirmText}
//                         onChange={(e) => setConfirmText(e.target.value)}
//                     />
//                 </div>

//                 <AlertDialogFooter className='flex items-center'>
//                     <Button variant='' size='sm' onClick={() => {
//                         handleModalClose()
//                         setConfirmText('')
//                     }}>Cancel</Button>

//                     <AlertDialogAction
//                         className='bg-destructive text-destructive-foreground'
//                         disabled={confirmText !== workflow?.name}
//                         onClick={() => {
//                             handleDeleteWOrkflow(workflow?.id)
//                         }}
//                     >
//                         Delete
//                     </AlertDialogAction>
//                 </AlertDialogFooter>
//             </AlertDialogContent>
//         </AlertDialog>
//     )
// }


function SchedularSection({ isDraft, creditCost, workflowId, cron }) {

    if (isDraft) return null
    return (
        <div className='flex items-center gap-2'>
            <CornerDownRightIcon size={16} className='h-4 w-4 text-muted-foreground' />
            <SchedularDialog workflowId={workflowId} cron={cron} key={`${cron}-${workflowId}`} />
            <MoveRightIcon size={16} className='h-4 w-4 text-muted-foreground' />
            <div className='flex items-center gap-3'>
                <Badge variant={'outline'} className={'space-x-2 text-muted-foreground rounded-sm space-y-1'}>
                    <CoinsIcon className='h-4 w-4' />
                    <span>{creditCost}</span>
                </Badge>
            </div>
        </div>
    )
}

function LastRunDetails({ workflow, orgId }) {
    const isDraft = workflow.status === WORKFLOWSTATUS.DRAFT
    const { lastRunAt, lastRunStatus, nextRunAt } = workflow
    const formattedStartedAt = lastRunAt && formatDistanceToNow(lastRunAt, { addSuffix: true })
    const nextSchedule = nextRunAt && format(nextRunAt, 'yyyy-MM-dd HH:mm')
    const nextScheduleUTC = nextRunAt && formatInTimeZone(nextRunAt, 'UTC', 'HH:mm')

    if (isDraft) return null
    return (
        <div className='px-4 py-1 flex justify-between items-center text-muted-foreground'>
            <div className='text-xs flex  items-center'>
                {lastRunAt &&
                    <Link href={`/workspace/${orgId}/workflow/${workflow.id}/run`} className='flex items-center gap-2 group'>
                        <span>Last run :</span>
                        <ExecutionStatusIndicator status={lastRunStatus} />
                        <span>{lastRunStatus}</span>
                        <span>{formattedStartedAt}</span>
                        <ChevronRightIcon size={14} className='-translate-x-[2px] group-hover:translate-x-0 transition' />
                    </Link>}
                {!lastRunAt && 'No run yet'}
            </div>
            {nextRunAt && (
                <div className='text-xs flex items-center text-muted-foreground gap-2'>
                    <ClockIcon size={14} />
                    <span>Next run at :</span>
                    <span>{nextSchedule}</span>
                    <span>Next Schedule UTC :({nextScheduleUTC})</span>
                </div>
            )}
        </div>
    )
}

function ExecutionStatusIndicator() {

    return (
        <div>Test</div>
    )
}