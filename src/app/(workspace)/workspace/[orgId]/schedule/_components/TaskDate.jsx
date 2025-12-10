import React from 'react'
import { differenceInDays, format } from 'date-fns'
import { cn } from '@/lib/utils'


export default function TaskDate({ value, className }) {
    const today = new Date()
    const endDate = new Date(value)
    const diffInDate = differenceInDays(endDate, today)

    let textColor = 'text-muted-foreground';

    if (diffInDate <= 3) {
        textColor = 'text-orange-500';
    } else if (diffInDate <= 7) {
        textColor = 'text-yellow-500';
    } else if (diffInDate <= 14) {
        textColor = 'text-green-500';
    }


    return (
        <div className={textColor}>
            <span className={cn('truncate', className)}>
                {format(value, 'PPP')}
            </span>
        </div>
    )
}
