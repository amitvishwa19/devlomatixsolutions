'use client'
import React, { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useOrg } from '@/providers/OrgProvider'
import { ArrowUpDown, FilePenLine, MoreHorizontal, Shield, ShieldEllipsis, ShieldUser, Trash2 } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuCheckboxItem, } from "@/components/ui/dropdown-menu"
import { ColumnDef, VisibilityState, flexRender, ColumnFiltersState, getFilteredRowModel, getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, } from "@tanstack/react-table"
import { Skeleton } from "@/components/ui/skeleton"
import { useAction } from '@/hooks/use-action'
import { useModal } from '@/hooks/useModal'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage, } from "@/components/ui/avatar"
import { ROLE } from '@prisma/client'
import { removeMember } from '../_action/remove-member'
import { toast } from 'sonner'
import AddMemberModal from './AddMemberModal'
import { ScrollArea } from '@/components/ui/scroll-area'


export default function Members({ title, description }) {
    const { server, refreshServer } = useOrg()
    const { onOpen } = useModal()
    const [addMember, setAddMember] = useState(false)

    const data = useMemo(() => {
        return server?.members.map((item, index) => {
            return {
                id: item?.id,
                userId: item?.user?.id,
                name: item?.user?.displayName,
                email: item?.user?.email,
                avatar: item?.user?.avatar,
                role: { user: item?.user?.role, member: item?.role }
            };
        })
    }, [server])



    const { execute: remove } = useAction(removeMember, {
        onSuccess: (data) => {
            console.log('remove user')

            // toast.success('New appointment created successfully', { id: 'new-appointment' })
        },
        onError: (error) => {

        }
    })

    const columns = [
        {
            id: "avatar",
            cell: (({ row }) => {
                return (

                    <Avatar className='rounded-md h-8 w-8'>
                        <AvatarImage src={row?.original?.avatar} alt="@user" className='rounded-md' />
                        <AvatarFallback className='rounded-md'> {row?.original?.name?.substring(0, 1)}</AvatarFallback>
                    </Avatar>
                )
            })
        },
        {
            accessorKey: "name",
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
            accessorKey: "role",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Role
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: (({ row }) => {
                return (

                    <div className=''>
                        {/* {
                            row.original.role === ROLE.ADMIN
                                ? <Badge className="bg-green-500/10 text-green-500 border-green-500/20 border">{row.original.role}</Badge>
                                : <Badge variant="outline" className='bg-yellow-500/10 text-yellow-500 border-yellow-500/20'>
                                    {row.original.role.user}
                                </Badge>
                        } */}
                        {
                            <div className='flex flex-row gap-2 items-center'>
                                <Badge className="bg-green-500/10 text-green-500 border-green-500/20 border">{row.original.role.user}</Badge>
                                {row.original.role.member === ROLE.ADMIN && <ShieldEllipsis size={18} />}
                            </div>
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
                            <Button disabled={row.original.role.member === ROLE.ADMIN && true} variant="outline" className="h-8 w-8 p-0 ring-0 focus-visible:ring-0  border-none">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className='dark:bg-darkSecondaryBackground'>
                            <DropdownMenuItem onClick={async () => {
                                toast.loading('Removing member...', { id: 'remove-member' })
                                await remove({ id: row.original.id, userId: row.original.userId, serverId: server?.id });
                                await refreshServer().then(
                                    toast.success('Member removed from organization', { id: 'remove-member' })
                                )
                            }}>Remove
                                <Trash2 className="h-4 w-4 ml-auto" />
                            </DropdownMenuItem>
                        </DropdownMenuContent>

                    </DropdownMenu>
                )
            },
        },

    ]

    return (
        <div className='flex flex-col gap-2 absolute inset-0 overflow-hidden' >

            <div className='p-2 mb-4'>
                <div className='flex flex-row justify-between items-center'>
                    <div className='py-4 px-2 flex flex-col'>
                        <span>Members</span>
                        <span className='text-xs text-muted-foreground'>Add, remove, and manage team members.</span>
                    </div>
                    <Button variant={'outline'} size={'sm'} className='mr-2' onClick={() => { setAddMember(true) }}>Add Member</Button>
                </div>
                <div className='px-2'>
                    <Separator className='self-center' />
                </div>
            </div>


            <ScrollArea className='w-full h-full rounded-lg '>
                <div className='p-4'>
                    <Datatable columns={columns} data={data} />
                </div>
            </ScrollArea>
            <AddMemberModal open={addMember} setOpen={setAddMember} />
        </div>
    )
}

const Datatable = ({ columns, data, }) => {
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
                    placeholder="Filter member..."
                    value={(table.getColumn("name")?.getFilterValue()) ?? ""}
                    onChange={(event) =>
                        table.getColumn("name")?.setFilterValue(event.target.value)
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
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
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
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
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
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Next
                </Button>
            </div>
        </div>
    )
}
