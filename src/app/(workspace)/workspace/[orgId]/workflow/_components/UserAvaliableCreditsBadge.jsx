'use client'
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { GetAvaliableCredits } from '../_actions/grt-avaliable-credits'
import { CoinsIcon, Loader2Icon } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { Badge } from '@/components/ui/badge'
import CountupWrapper from './CountupWrapper'

export default function UserAvaliableCreditsBadge() {
    const { data: session } = useSession()

    const query = useQuery({
        queryKey: ['user-avaliable-credits'],
        queryFn: () => GetAvaliableCredits(session.user.userId),
        refetchInterval: 30 * 1000
    })


    return (
        <div>
            {/* <CoinsIcon size={20} />
            <span>
                {query.isLoading && <Loader2Icon className='w-4 h-4 animate-spin' />}
            </span> */}
            <Badge variant='outline' className={'space-x-4 flex gap-2 space-y-2 items-center'}>
                <div className='flex items-center gap-x-4 py-1'>
                    <div className='flex gap-2'>
                        <CoinsIcon size={18} />
                        <span>Credits</span>
                    </div>
                    <span>
                        {query.isLoading && <Loader2Icon className='w-4 h-4 animate-spin' />}
                        {!query.isLoading && query.data && <CountupWrapper value={query.data} />}
                    </span>
                </div>
            </Badge>
        </div>
    )
}
