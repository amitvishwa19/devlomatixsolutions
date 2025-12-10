'use client'
import { OrgContext } from '@/providers/OrgProvider'
import React, { useContext, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import BoardNavbar from '../_components/_board/BoardNavbar'


export default function BoardIdLayout({ children }) {
    const { boardId, orgId } = useParams()
    const { server, loading } = useContext(OrgContext)
    const board = server?.boards?.find(i => i.id === boardId)
    const router = useRouter()

    useEffect(() => {
        if (board) {
            router.push(`/workspace/${orgId}/board/${boardId}`)
        } else {
            router.push(`/workspace/${orgId}`)
        }
    }, [board])


    //console.log('board', board)

    return (
        <div className='absolute flex flex-col flex-1  inset-0 ' style={{ backgroundImage: board?.showBackground ? `url(${board?.avatar})` : null, backgroundSize: 'cover' }}>
            {/* <div
                className='flex flex-col min-h-full bg-no-repeat bg-cover bg-center  -z-40'
                style={{ backgroundImage: board?.showBackground ? `url(${board?.avatar})` : null }}
            /> */}
            {
                board?.showBackground && <div className='absolute inset-0 bg-black/40 ' />
            }
            <div className='flex'>
                <BoardNavbar data={board} orgId={orgId} />
            </div>
            <ScrollArea className='flex flex-1'>

                <div className='flex flex-1 overflow-auto '>
                    {children}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>


        </div>
    )
}
