import React, { useEffect, useState } from 'react'
import { useContent } from '../_provider/contentProvider'
import { flexRender, getFilteredRowModel, getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, } from "@tanstack/react-table"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table"
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { FileText, MoreHorizontal, Pencil, Trash2, View } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDispatch, useSelector } from 'react-redux'
import { Input } from '@/components/ui/input'
import moment from 'moment'
import { CustomBadge } from '../../(misc)/_components/CustomBadge'
import { useModal } from '@/hooks/useModal'
import { DeletePost } from './DeletePostModal'
import PostPreviewModal from '../../appointment/_components/PostPreviewModal'


export default function Dashboard() {
    const { posts } = useContent()
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
                    {row.original.title}
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
                    <CustomBadge status={`${row.original.status === 'published' ? 'success' : 'info'}`}>
                        <span className=' capitalize'> {row.original.status}</span>
                    </CustomBadge>

                </div>
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const appointment = row.original

                return (
                    <DropdownMenu className='ring-0	flex justify-end'>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="h-8 w-8 p-0 ring-0 focus-visible:ring-0  border-none">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className='dark:bg-darkSecondaryBackground w-40'>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <PostPreviewModal data={row.original} />
                                <View className="h-4 w-4 ml-auto" />
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={() => {
                                //dispatch(setSelectedAppointment(JSON.stringify(row.original)))
                                //router.push(`/workspace/${orgId}/appointment/${row.original.id}`)
                            }}>
                                Edit
                                <Pencil className="h-4 w-4 ml-auto" />
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <DeletePost postId={row.original.id} />
                                <Trash2 className="h-4 w-4 ml-auto" />
                            </DropdownMenuItem>




                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]



    return (
        <div>

            <DataTable columns={columns} data={posts} />
        </div>
    )
}


function DataTable({ columns, data, }) {
    const [globalFilter, setGlobalFilter] = useState([]);
    const [sorting, setSorting] = useState([])
    const [columnFilters, setColumnFilters] = useState([])
    const [columnVisibility, setColumnVisibility] = useState({})
    const [rowSelection, setRowSelection] = useState({})
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 2 });
    const [selector, setSelector] = useState('today');
    const [selectedDate, setSelectedDate] = useState(null);
    const selectedAppointments = useSelector((state) => state.appointment.selectedAppointments)
    const dispatch = useDispatch()



    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onGlobalFilterChange: setGlobalFilter,
        //onRowSelectionChange: setRowSelection,
        state: {
            pagination,
        },
        state: {
            sorting,
            columnFilters,
            columnVisibility,
        },
    })

    return (
        <div>



            <div className="flex flex-row gap-4 items-center mb-4">

                <div className='flex flex-row w-full gap-4'>
                    <Input
                        placeholder="Search content by title..."
                        value={(table.getColumn("title")?.getFilterValue()) ?? ""}
                        onChange={(event) =>
                            table.getColumn("title")?.setFilterValue(event.target.value)

                        }
                        className="w-full"
                    />



                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            Columns
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter(
                                (column) => column.getCanHide()
                            )
                            .map((column) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }
                                    >
                                        {column.id}
                                    </DropdownMenuCheckboxItem>
                                )
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className='rounded-lg border  shadow-card overflow-hidden'>
                <Table className='rounded-md'>
                    <TableHeader >

                        {table?.getHeaderGroups().map((headerGroup) => (

                            <TableRow key={headerGroup.id} className=' rounded-md'>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className='text-md font-semibold'>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>

                        ))}

                    </TableHeader>

                    <TableBody>
                        {table?.getRowModel().rows?.length ? (
                            table?.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}

                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className='text-sm'>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className='flex flex-row items-center justify-end mt-4'>
                <div className='flex flex-row gap-4'>
                    <Button variant="outline" size="sm" onClick={() => { table.previousPage() }} disabled={!table.getCanPreviousPage()}>Prev</Button>
                    <Button variant="outline" size="sm" onClick={() => { table.nextPage() }} disabled={!table.getCanNextPage()}>Next</Button>
                </div>
            </div>

        </div>
    )
}

