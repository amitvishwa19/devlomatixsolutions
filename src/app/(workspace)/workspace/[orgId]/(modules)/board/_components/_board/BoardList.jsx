
import axios from '@/utils/axios'
import { User2, HelpCircle } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { BoardCreator } from './BoardCreator'
import { useAuth } from '@/providers/AuthProvider'
import { Hint } from '../Hint'
import { Skeleton } from '@/components/ui/skeleton'
import { useAction } from '@/hooks/use-action'
import { getBoards } from '@/app/workspace/[orgId]/board/_actions/get_boards'
import { toast } from 'sonner'



export const BoardList = ({ orgId }) => {
    const { activeOrg, handleSelectedOrg, organization, isLoaded } = useAuth()
    const [loading, setLoading] = useState(true)
    const [boards, setBoards] = useState([])

    const { execute: gettingOrgBoards } = useAction(getBoards, {
        onSuccess: (data) => {
            setBoards(data)
            setLoading(false)
        },
        onError: (error) => {
            console.log(error)
            toast.error(error)
        }
    })



    useEffect(() => {
        gettingOrgBoards({ orgId: orgId })
    }, [])




    return (
        <div className="space-y-4">

            <div className="flex items-center font-semibold text-md dark:text-slate-200 text-slate-600">
                <User2 className="h-6 w-6 mr-2" />
                Your boards
            </div>


            {
                loading ? <Loader /> :
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {

                            boards.map((board) => (
                                <Link
                                    key={board?.id}
                                    href={`/project/taskman/board/${board.id}`}
                                    className="group relative aspect-video bg-no-repeat bg-center bg-cover bg-sky-700 rounded-sm h-full w-full p-2 overflow-hidden"
                                    style={{ backgroundImage: `url(${board.avatar})` }}
                                >
                                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition" />
                                    <p className="relative font-semibold text-white">
                                        {board.title}
                                    </p>
                                </Link>
                            ))
                        }


                        <BoardCreator organization={organization} sideOffset={40} boards={boards} setBoards={setBoards}>
                            <div role='button' className='aspect-video relative h-full w-full bg-slate-200 dark:bg-muted rounded-sm flex flex-col gap-y-1 items-center justify-center hover:opacity-75 transition'>
                                <p className='text-sm'>Create new Board</p>
                                <span className='text-xs'>5 Remaning</span>
                                <Hint sideOffset={40} description={`Free workspase can have up to  5 more Boards. For unlimited board upgrade your workspace`}>
                                    <HelpCircle className='absolute bottom-2 right-2 h-[14px] w-[14px]' />
                                </Hint>
                            </div>
                        </BoardCreator>
                    </div>
            }




        </div>
    )
}

BoardList.Skeleton = function SkeletonBoardList() {
    return (
        <div className="grid gird-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <Skeleton className="aspect-video h-full w-full p-2" />
            <Skeleton className="aspect-video h-full w-full p-2" />
            <Skeleton className="aspect-video h-full w-full p-2" />
            <Skeleton className="aspect-video h-full w-full p-2" />
            <Skeleton className="aspect-video h-full w-full p-2" />
            <Skeleton className="aspect-video h-full w-full p-2" />
            <Skeleton className="aspect-video h-full w-full p-2" />
            <Skeleton className="aspect-video h-full w-full p-2" />
        </div>
    );
};

const Loader = () => {
    return (
        <div className="grid gird-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <Skeleton className="aspect-video h-full w-full p-2" />
            <Skeleton className="aspect-video h-full w-full p-2" />
            <Skeleton className="aspect-video h-full w-full p-2" />
            <Skeleton className="aspect-video h-full w-full p-2" />
            <Skeleton className="aspect-video h-full w-full p-2" />

        </div>
    );
};


