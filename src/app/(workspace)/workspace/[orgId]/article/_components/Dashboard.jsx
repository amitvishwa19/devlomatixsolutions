
import moment from 'moment'
import { CustomBadge } from '../../(misc)/_components/CustomBadge'
import { useModal } from '@/hooks/useModal'
import { DashboardStatCard } from './DashboardStatCard'
import PostView from './PostView'
import PostEdit from './PostEdit'
import PostDelete from './PostDelete'
import { useArticle } from '../_provider/articleProvider'
import { DataTable } from '../../(misc)/_components/DataTable'
import { FileText } from 'lucide-react'






export default function Dashboard() {
    const { posts } = useArticle()
    const { onOpen } = useModal()

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
        <div className='flex flex-col gap-4 p-2'>

            <div className='group flex flex-row gap-2 '>
                <DashboardStatCard
                    title="Total posts"
                    value={posts?.length}

                    changeType='positive'
                    icon={'file-text'}
                    iconColor='#001BB7'
                    iconClassName='bg-[#172E3A]'
                />
                <DashboardStatCard
                    title="Published Posts"
                    value={posts?.filter(post => post?.status === 'published').length}

                    changeType='positive'
                    icon={'send'}
                    iconColor='#007E6E'
                    iconClassName='bg-[#172E3A]'
                />
                <DashboardStatCard
                    title="Draft posts"
                    value={posts?.filter(post => post?.status === 'draft').length}
                    changeType='positive'
                    icon={'notepad-text-dashed'}
                    iconColor='#FFA239'
                    iconClassName='bg-[#172E3A]'
                />
                <DashboardStatCard
                    title="AI Generated"
                    value={posts?.filter(post => post?.aitenerated).length}

                    changeType='positive'
                    icon={'sparkles'}
                    iconColor='#B4DEBD'
                    iconClassName='bg-[#172E3A]'
                />
            </div>

            <DataTable columns={columns} data={posts} />
        </div>
    )
}



