'use client'
import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { cn } from '@/lib/utils'
import { 
    FileTextIcon, 
    PlayIcon, 
    ShuffleIcon, 
    EllipsisVertical, 
    Edit, 
    Trash2,
    CoinsIcon,
    CornerDownRightIcon,
    MoveRightIcon,
    ClockIcon,
    ChevronRightIcon
} from 'lucide-react'
import Link from 'next/link'
import { Button, buttonVariants } from '@/components/ui/button'
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuLabel, 
    DropdownMenuShortcut, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { useAuth } from '@/providers/AuthProvider'
import { useModal } from '@/hooks/useModal'
import { Badge } from '@/components/ui/badge'
import { WORKFLOW_STATUS } from '../_utils/constants'
import { formatDistanceToNow } from 'date-fns'

const statusColor = {
    [WORKFLOW_STATUS.DRAFT]: "bg-yellow-400/10 text-yellow-600 border-yellow-200",
    [WORKFLOW_STATUS.PUBLISHED]: "bg-emerald-400/10 text-emerald-600 border-emerald-200"
}

export default function WorkflowCard({ workflow, workspaceId }) {
    const isDraft = workflow.status === WORKFLOW_STATUS.DRAFT
    const { onOpen } = useModal()
    const { user } = useAuth()

    return (
        <Card className="group border-separate shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-all duration-300">
            <CardContent className='p-5 flex items-center h-[100px] justify-between bg-card/50'>
                <div className='flex items-center gap-4'>
                    <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center border transition-colors", 
                        statusColor[workflow.status]
                    )}>
                        {isDraft ? <FileTextIcon className='h-6 w-6' /> : <PlayIcon className='h-6 w-6' />}
                    </div>
                    <div>
                        <div className='flex items-center gap-2'>
                            <Link 
                                href={`/workspace/${workspaceId}/flowbyte/${workflow.id}`} 
                                className='text-lg font-bold text-foreground hover:text-primary transition-colors'
                            >
                                {workflow.name}
                            </Link>
                            {isDraft && (
                                <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 font-bold text-[10px] h-5">
                                    DRAFT
                                </Badge>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {workflow.description || "No description provided"}
                        </p>
                    </div>
                </div>

                <div className='flex items-center gap-2'>
                    <Link 
                        href={`/workspace/${workspaceId}/flowbyte/${workflow.id}`} 
                        className={cn('gap-2 rounded-xl transition-all', buttonVariants({ variant: 'outline', size: 'sm' }))}
                    >
                        <ShuffleIcon size={16} />
                        <span className="hidden sm:inline">Edit</span>
                    </Link>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-xl">
                                <EllipsisVertical size={18} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-muted">
                            <DropdownMenuLabel className="text-xs text-muted-foreground">Actions</DropdownMenuLabel>
                            <DropdownMenuItem className="cursor-pointer gap-2 rounded-lg">
                                <Edit size={16} /> Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                className="cursor-pointer gap-2 text-destructive focus:text-destructive focus:bg-destructive/10 rounded-lg"
                                onSelect={() => onOpen("deleteWorkFLow", { workflow, workspaceId, userId: user?.id })}
                            >
                                <Trash2 size={16} /> Delete Workflow
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardContent>
            
            {workflow.lastRunAt && (
                <div className='px-5 py-2 flex justify-between items-center text-[11px] text-muted-foreground bg-muted/20 border-t border-muted/50'>
                    <div className='flex items-center gap-2'>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Last run {formatDistanceToNow(new Date(workflow.lastRunAt), { addSuffix: true })}</span>
                    </div>
                    <div className='flex items-center gap-1 opacity-70'>
                        <ClockIcon size={12} />
                        <span>Next run scheduled</span>
                    </div>
                </div>
            )}
        </Card>
    )
}
