'use client'
import React, { useEffect, useState } from 'react'
import { ArrowUpDown, Eye, FilePenLine, MoreHorizontal, Trash2, UserPlus } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuCheckboxItem, } from "@/components/ui/dropdown-menu"
import { ColumnDef, VisibilityState, flexRender, ColumnFiltersState, getFilteredRowModel, getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, } from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAction } from '@/hooks/use-action'
import { roleManagement } from '../_action/role-management'
import { useModal } from '@/hooks/useModal'
import { useSelector } from 'react-redux'

export default function RolePage() {
    const roles = useSelector((state) => state.management.roles)
    const [loading, setLoading] = useState(true)
    const { onOpen, refresh } = useModal()

    const columns = [

        {
            accessorKey: "title",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Title
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
        },
        {
            accessorKey: "description",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Description
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
        },
        {
            accessorKey: "permissions",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                    >
                        Permissions
                    </Button>
                )
            },
            cell: ({ row }) => {
                const permissions = row.original.permissions


                if (permissions.length > 0) {
                    return <div className='flex-wrap justify-center'>

                        {
                            permissions.map((item, index) => {
                                return (
                                    <Badge key={index} variant="outline" className='mr-1 mb-1 whitespace-nowrap text-inherit'>
                                        {item.title}
                                    </Badge>

                                )
                            })
                        }
                    </div>
                } else {
                    return (
                        <Badge variant="outline" className='mr-1 mb-1 whitespace-nowrap text-inherit'>
                            No Permission
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
                                ? <Badge variant="outline" className='mr-1 mb-1 whitespace-nowrap text-inherit bg-green-400 text-slate-800'>
                                    Active
                                </Badge>
                                : <Badge variant="outline" className='mr-1 mb-1 whitespace-nowrap text-inherit bg-red-400 text-slate-800'>
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
                                onOpen("editRole", { role: row.original })
                            }}>Edit
                                <FilePenLine className="h-4 w-4 ml-auto" />
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                                onOpen("deleteRole", { id: row.original.id })
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
        <div className='flex flex-col gap-4'>
            <div className='w-full dark:bg-[#151D24] p-4 rounded-lg border flex flex-row items-center justify-between'>
                <div>
                    <h2 className='text-xl'>Roles</h2>
                    <h2 className='text-xs text-white/50'>Manage all roles for your app</h2>
                </div>
                <Button variant='outline' size='sm' onClick={() => { onOpen("addRole", { roles }) }}>Add Role</Button>
            </div>


            <div className='w-full dark:bg-[#151D24] p-4 rounded-lg border'>
                <DataTable columns={columns} data={roles} />

            </div>
        </div>
    )
}

function DataTable({ columns, data, }) {
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
                    placeholder="Filter role..."
                    value={(table.getColumn("title")?.getFilterValue()) ?? ""}
                    onChange={(event) =>
                        table.getColumn("title")?.setFilterValue(event.target.value)
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

            <div>
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

const Loader = () => {
    return (
        <div className="flex flex-col items-center gap-2 mt-4">
            <Skeleton className="flex w-full h-12" />
            <Skeleton className="flex w-full h-12" />
            <Skeleton className="flex w-full h-12" />
            <Skeleton className="flex w-full h-12" />
        </div>
    )
}
