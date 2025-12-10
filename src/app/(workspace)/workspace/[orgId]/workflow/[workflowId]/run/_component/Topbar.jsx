'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeftIcon, RocketIcon } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

import React from 'react'

export default function Topbar() {
    const { orgId, workflowId } = useParams()


    return (
        <div className='flex items-center justify-between p-1 border-b-violet-200 bg-green-100/10 w-full'>
            <div className='flex items-center'>
                <Link href={`/workspace/${orgId}/workflow/${workflowId}`} >
                    <Button variant='ghost' className='mr-2 p-2'>
                        <ChevronLeftIcon size={20} />
                    </Button>
                </Link>
                <div>
                    <p className='font-bold text-ellipsis truncate text-sm'>Workflow run details</p>

                    <p className='text-xs  text-muted-foreground truncate text-ellipsis'>{workflowId}</p>

                </div>
            </div>
            <Link href={`/workspace/${orgId}/workflow/${workflowId}`}>
                <Button
                    size='sm'
                    className='bg-blue-600 hover:bg-blue-800 text-white '
                >
                    <RocketIcon size={16} className='mr-2 ' />


                    Editor
                </Button>
            </Link>
        </div>
    )
}
