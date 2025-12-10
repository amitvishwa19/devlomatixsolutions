import { cn } from '@/lib/utils'
import React from 'react'

const indicatorColors = {
    PENDING: 'bg-slate-400',
    RUNNING: 'bg-yellow-400',
    FAILED: 'bg-red-400',
    COMPLETED: 'bg-emerald-400'
}

export default function ExecutionStatusIndicator({ status }) {
    return (
        <div className={cn('w-2 h-2  rounded-full bg-red-400',
            indicatorColors[status]
        )} />


    )
}
