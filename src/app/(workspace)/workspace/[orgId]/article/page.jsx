'use client'
import { ScrollArea } from '@/components/ui/scroll-area'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { useArticle } from './_provider/articleProvider'
import { FileText, Plus } from 'lucide-react'
import { CustomBadge } from '../(misc)/_components/CustomBadge'
import PostView from './_components/PostView'
import PostDelete from './_components/PostDelete'
import PostEditor from './_components/PostEditor'
import Dashboard from './_components/Dashboard'
import { ButtonGroup } from '@/components/ui/button-group'
import { DynamicIcon } from 'lucide-react/dynamic'



export default function ArticlePage() {
    const { orgId } = useParams()
    const pathname = usePathname();
    const router = useRouter()
    const { posts } = useArticle()

    const navigationItems = [
        { label: 'Dashboard', icon: 'square-chart-gantt', component: <Dashboard /> },
        { label: 'New Post', icon: 'newspaper', component: <PostEditor onSuccessPost={() => { setSelected(navigationItems[0]) }} /> },
    ];

    const [selected, setSelected] = useState(navigationItems[0])

    const [postEditor, setPostEditor] = useState({
        isOpen: false,
        mode: 'add',
        post: null
    })

    const columns = [
        {
            id: "title",
            header: "Title",
            cell: ({ row }) => (
                <div className='flex flex-row gap-2 items-center'>
                    <div className='p-2 bg-primary/10 dark:bg-[#133932] m-2 rounded-md'>
                        <FileText size={16} />
                    </div>
                    {row?.original?.title}
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            id: "catagories",
            header: "Categories",
            cell: ({ row }) => {
                return (
                    <div className='flex flex-row items-center gap-2'>
                        {row?.original?.categories?.length > 0 ? (
                            row?.original?.categories?.map((item) => (
                                <CustomBadge key={item.id} status={'progress'} className=' capitalize'>
                                    {item.name}
                                </CustomBadge>
                            ))
                        ) : (
                            <div>
                                <CustomBadge status={'info'}>
                                    Uncategorized
                                </CustomBadge>
                            </div>
                        )}
                    </div>
                )
            },
            enableSorting: false,
            enableHiding: false,
        },
        {
            id: "tags",
            header: "Tags",
            cell: ({ row }) => {
                return (
                    <div className='flex flex-row flex-wrap items-center gap-2'>
                        {row?.original?.tags?.length > 0 ? (
                            row?.original?.tags?.map((item) => (
                                <CustomBadge key={item.id} status={'progress'} >
                                    {item.name}
                                </CustomBadge>
                            ))
                        ) : (
                            <div>
                                <CustomBadge status={'info'}>
                                    No Tags
                                </CustomBadge>
                            </div>
                        )}
                    </div>
                )
            },
            enableSorting: false,
            enableHiding: false,
        },
        {
            id: "date",
            header: "Date",
            cell: ({ row }) => moment(row?.original?.date).format("Do MMM YY")
        },
        {
            id: "status",
            header: "Status",
            cell: ({ row }) => (
                <div className='flex flex-row gap-4 items-center w-[20%]'>
                    <CustomBadge status={`${row?.original?.status === 'published' ? 'success' : 'info'}`}>
                        <span className=' capitalize'> {row?.original?.status}</span>
                    </CustomBadge>

                </div>
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            id: "actions",
            header: "Actions",
            enableHiding: false,
            cell: ({ row }) => {

                return (
                    <div className='flex flex-row gap-4 text-xs'>
                        <PostView post={row?.original} onClose={() => { console.log('post view close') }} />
                        <PostEdit post={row?.original} edit={true} />
                        <PostDelete post={row.original} />
                    </div>
                )
            },
        },
    ]


    return (
        <div className='absolute inset-0 flex flex-col gap-2 p-2'>

            <div className='w-full dark:bg-darkSecondaryBackground  p-4 rounded-md border flex flex-row items-center justify-between'>
                <div>
                    <h2 className='text-xl'>Article Management</h2>
                    <h2 className='text-xs text-muted-foreground'>Schedule, Post, and Track Across All Platforms Effortlessly</h2>
                </div>

                <div className='flex flex-row items-center gap-2'>

                    {/* <Button variant='save' size='sm' onClick={() => {
                        setPostEditor({
                            isOpen: true,
                            mode: 'add',
                            post: null
                        })
                    }} className='hover:dark:bg-darkFocusColor'>
                        <Plus className='h-4 w-4' />
                        New Post
                    </Button> */}

                    <ButtonGroup>
                        {navigationItems?.map((item, index) => (
                            <Button
                                key={index}
                                variant={`outline`}
                                size='sm'
                                className={`border ${selected.label === item.label && 'bg-primary/10 dark:bg-darkFocusColor'} hover:bg-primary/10 dark:hover:bg-darkFocusColor`}
                                onClick={() => { setSelected(item) }}
                            >
                                <DynamicIcon name={item.icon} size={18} className='h-10 line-through' />
                                {item.label}
                            </Button>
                        ))}
                    </ButtonGroup>

                </div>
            </div>



            <ScrollArea className='h-[70vh] flex flex-grow dark:bg-darkSecondaryBackground rounded-md border p-2'>
                <div>
                    {selected?.component}
                </div>
            </ScrollArea>


        </div >
    )
}
