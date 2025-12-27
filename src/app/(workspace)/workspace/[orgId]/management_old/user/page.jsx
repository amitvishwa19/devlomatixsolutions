'use client'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { ArrowUpDown, Eye, FilePenLine, MoreHorizontal, Trash2, UserPlus } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuCheckboxItem, } from "@/components/ui/dropdown-menu"
import { ColumnDef, VisibilityState, flexRender, ColumnFiltersState, getFilteredRowModel, getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, } from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useModal } from '@/hooks/useModal'


export default function UserPage() {
    const users = useSelector((state) => state.management.users)


    const [loading, setLoading] = useState(true)
    const { onOpen, refresh } = useModal()


    const columns = [

        {
            id: "avatar",
            cell: ({ row }) => {
                //const dispatch = useDispatch()
                const payment = row.original

                return (
                    <Avatar className='rounded-sm'>
                        {/* <AvatarImage src={row.original.avatar} alt="@shadcn" /> */}
                        <AvatarFallback className='text-lg font-semibold bg-blue-600 rounded-sm'>{row.original.displayName?.substring(0, 1)}</AvatarFallback>
                    </Avatar >
                )
            },
        },
        {
            accessorKey: "displayName",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Name
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
        },
        {
            accessorKey: "email",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Email
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
        },
        {
            accessorKey: "roles",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                    >
                        Roles
                    </Button>
                )
            },
            cell: ({ row }) => {
                const roles = row.original.roles


                if (roles?.length > 0) {
                    return <div className='flex-wrap justify-center'>

                        {
                            roles?.map((item, index) => {
                                return (
                                    <Badge key={index} variant="outline" className='bg-green-500/10 text-green-500 border-green-500/20 mr-2'>
                                        {item.title}
                                    </Badge>

                                )
                            })
                        }
                    </div>
                } else {
                    return (
                        <Badge variant="outline" className='bg-yellow-500/10 text-yellow-500 border-yellow-500/20'>
                            No Roles
                        </Badge>
                    )
                }


            }
        },
        {
            accessorKey: "status",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Status
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: (({ row }) => {
                return (
                    <div className=' justify-center'>
                        {
                            row.original.status === true
                                ? <Badge variant="outline" className='bg-green-500/10 text-green-500 border-green-500/20'>
                                    Active
                                </Badge>
                                : <Badge variant="outline" className='bg-red-500/10 text-red-500 border-red-500/20'>
                                    Inactive
                                </Badge>
                        }

                    </div>
                )
            })
        },
        {
            id: "actions",
            cell: ({ row }) => {
                //const dispatch = useDispatch()
                const payment = row.original

                return (
                    <DropdownMenu className='ring-0	flex justify-end'>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="h-8 w-8 p-0 ring-0 focus-visible:ring-0  border-none">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className='dark:bg-darkSecondaryBackground'>
                            <DropdownMenuItem onClick={() => {
                                onOpen("edituser", { user: row.original })
                            }}>Edit
                                <FilePenLine className="h-4 w-4 ml-auto" />
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                                onOpen("deleteuser", { id: row.original.id })
                            }}>Delete
                                <Trash2 className="h-4 w-4 ml-auto" />
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },

    ]

    return (


        <div className='absolute inset-0 flex flex-col gap-2 p-2'>
            <div className='w-full dark:bg-darkSecondaryBackground p-4 rounded-lg border flex flex-row items-center justify-between'>
                <div>
                    <h2 className='text-xl'>Users</h2>
                    <h2 className='text-xs text-white/50'>All users associated to organization</h2>
                </div>
                <Button variant='outline' size='sm' onClick={() => { onOpen("addRole", { roles }) }}>Add User</Button>
            </div>


            <div className='w-full h-full dark:bg-darkSecondaryBackground p-4 rounded-lg border'>
                <DataTable columns={columns} data={users} />
            </div>
        </div>

    )
}


function DataTable({ columns, data, }) {
    const [globalFilter, setGlobalFilter] = useState([]);
    const [sorting, setSorting] = useState([])
    const [columnFilters, setColumnFilters] = useState([])
    const [columnVisibility, setColumnVisibility] = useState({})
    const [rowSelection, setRowSelection] = useState({})
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
            sorting,
            columnFilters,
            columnVisibility,
        },
    })

    return (
        <div>
            <div className="flex items-center py-4">

                <Input
                    placeholder="Search..."
                    value={(table.getColumn("displayName")?.getFilterValue()) ?? ""}
                    onChange={(event) =>
                        table.getColumn("displayName")?.setFilterValue(event.target.value)

                    }
                    className="max-w-sm"
                />

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

            <div className='border rounded-md'>
                <Table>
                    <TableHeader >

                        {table?.getHeaderGroups().map((headerGroup) => (

                            <TableRow key={headerGroup.id}>
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
