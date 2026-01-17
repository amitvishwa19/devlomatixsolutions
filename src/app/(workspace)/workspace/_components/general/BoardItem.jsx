'use client'
import React from 'react'
import { useRouter } from 'next/navigation';
import { Trash, Trash2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from "@/components/ui/tooltip"
import { Button } from '@/components/ui/button';

export function BoardItem({ board }) {
    const router = useRouter()

    const handleClick = () => {
        router.push(`/dashboard/org/${board?.serverId}/board/${board.id}`)
    }

    const totalCards = () => {
        let cards = 0

        board.lists.map((list) => {
            return cards = cards + list?.cards.length
        })

        return cards
    }

    return (
        <div
            className='flex group relative aspect-auto bg-no-repeat bg-center bg-cover dark:bg-[#162C46] bg-slate-200 border rounded-sm h-full w-full p-2 overflow-hidden cursor-pointer justify-start'
            onClick={handleClick}
        >
            <div className='flex flex-col  gap-2 text-md justify-start w-full'>
                <div className='flex items-center justify-between capitalize text-sm hover:text-red-400'>

                    <TooltipProvider>
                        <Tooltip delayDuration={40}>
                            <TooltipTrigger asChild>
                                <span className='truncate'>{board.title}</span>
                            </TooltipTrigger>
                            <TooltipContent>
                                {board.title}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>

                <span className='flex justify-start text-xs opacity-60'>
                    Total Lists: ({board?.lists?.length})
                </span>
                <span className='flex justify-start text-xs opacity-60'>
                    Total Cards: ({totalCards()})
                </span>
            </div>
        </div>
    )
}
