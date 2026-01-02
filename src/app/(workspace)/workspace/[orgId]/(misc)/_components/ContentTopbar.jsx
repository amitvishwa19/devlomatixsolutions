'use client'
import { Button } from '@/components/ui/button'
import { FlaskConical } from 'lucide-react'
import { DynamicIcon, icon } from 'lucide-react/dynamic'
import React from 'react'

export function ContentTopbar({ title = '', description = '', icon = null, action = false, actionName = '', actionIcon = '', onActionClick }) {

    const handleAcionClick = () => {
        onActionClick()
    }
    return (
        <div className='w-full dark:bg-darkSecondaryBackground p-4 rounded-md border flex flex-row items-center justify-between'>
            <div className='flex flex-col gap-1'>
                <h2 className='text-xl flex flex-row items-center gap-2'>
                    {icon && <DynamicIcon name={icon} className='h-5 w-5 text-sky-500' />}
                    <span>{title}</span>
                </h2>
                <h2 className='text-xs text-muted-foreground italic'>
                    {description}
                </h2>
            </div>
            {action && (
                <div>
                    <Button variant='save' size='sm' className='flex flex-row items-center gap-2' onClick={handleAcionClick}>
                        <DynamicIcon name={actionIcon} className='h-5 w-5 ' />
                        {actionName}
                    </Button>
                </div>
            )}
        </div>
    )
}
