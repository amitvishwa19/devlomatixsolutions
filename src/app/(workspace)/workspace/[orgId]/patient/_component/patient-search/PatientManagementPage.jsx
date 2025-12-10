'use client'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { Avatar, AvatarFallback, AvatarImage, } from "@/components/ui/avatar"
import { ArrowUpDown, CalendarClock, CircleUser, Eye, FilePenLine, FileSliders, MoreHorizontal, Search, Trash2, UserPlus } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuCheckboxItem, } from "@/components/ui/dropdown-menu"
import { ColumnDef, VisibilityState, flexRender, ColumnFiltersState, getFilteredRowModel, getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, } from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger, } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useModal } from '@/hooks/useModal'
import { useOrg } from '@/providers/OrgProvider'
import { ROLE } from '@prisma/client'
import { getAge } from '@/utils/functions'
import moment from 'moment'
import { useParams, useRouter } from 'next/navigation'
import { usePatient } from '../../_provider/patientProvider'



export default function PatientManagementPage() {
    const { orgId } = useParams()
    const { patientsMapData, setSelectedPatient } = usePatient()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const { users } = useOrg()
    const patients = users?.filter(user => user.role === ROLE.PATIENT)
    const { onOpen } = useModal()

    const tempData = users?.filter(user => user.role === ROLE.PATIENT)
        .map(user => ({
            id: user.id,
            uuid: user.uuid,
            displayName: user?.medicalProfile?.personal?.firstname ? (user?.medicalProfile?.personal?.firstname + ' ' + user?.medicalProfile?.personal?.lastname) : user?.displayName,
            age: getAge(user?.medicalProfile?.personal?.dob) ? getAge(user?.medicalProfile?.personal?.dob) + ' Yrs' : 'NA',
            gender: user?.medicalProfile?.personal?.gender ? user?.medicalProfile?.personal?.gender : 'NA',
            phone: user?.medicalProfile?.contact?.basic?.phone ? user?.medicalProfile?.contact?.basic?.phone : 'NA',
            bloodgroup: user?.medicalProfile?.medicalInformation?.bloodGroup ? user?.medicalProfile?.medicalInformation?.bloodGroup : 'NA',
            lastvisit: moment(user?.medicalProfile?.updatedAt).format('MMMM Do YYYY'),
            user: user
        }))

    const columns = [

        {
            accessorKey: "patient",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Patient
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {

                return (
                    <div className='flex flex-row items-center gap-4'>
                        <Avatar className='rounded-md'>
                            <AvatarImage src={row?.orignal?.user?.avatar} alt="@shadcn" />
                            <AvatarFallback className='rounded-md bg-sky-500 text-xl font-bold'>{row.original.user.displayName.substring(0, 1)}</AvatarFallback>
                        </Avatar>
                        <div className='flex flex-col'>
                            <span>{row.original.user.displayName}</span>
                            <span className='text-[10px] text-muted-foreground'>{row.original.user.uuid}</span>
                        </div>

                    </div>
                )
            }
        },
        {
            accessorKey: "dob",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Date of Birth
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const dob = row.original.user?.medicalProfile?.personal?.dob
                return (
                    <div className='text-center'>
                        {dob ? moment(dob).format('MMMM Do, YYYY') : 'NA'}
                    </div>
                )
            }
        },
        {
            accessorKey: "phone",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Phone
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const mobile = row.original.user?.medicalProfile?.personal?.contact
                return (
                    <div className='text-center'>
                        {mobile ? mobile : 'NA'}
                    </div>
                )
            }
        },
        {
            accessorKey: "age",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Age
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ((row) => {

                return (
                    <div>

                    </div>
                )
            })
        },
        {
            accessorKey: "gender",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Gender
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
        },
        {
            accessorKey: "bloodgroup",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Blood Group
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
        },
        {
            accessorKey: "lastvisit",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Last Visit
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                //const dispatch = useDispatch()
                const payment = row.original

                return (

                    <div>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant={'ghost'} size='sm' className='p-0' onClick={() => {
                                    setSelectedPatient(row.original)
                                    router.push(`/workspace/${orgId}/patient/${row.original.id}/profile`)
                                }}>
                                    <CircleUser size={18} className='cursor-pointer' />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>View Profile</p>
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant={'ghost'} size='sm' className='p-0' onClick={() => { onOpen("view-patient", { user: row?.original?.user }) }}>
                                    <CalendarClock size={18} className='cursor-pointer' />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Book Appointment</p>
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant={'ghost'} size='sm' className='p-0' onClick={() => { onOpen("view-patient", { user: row?.original?.user }) }}>
                                    <FileSliders size={18} className='cursor-pointer' />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Add Note</p>
                            </TooltipContent>
                        </Tooltip>


                    </div>
                )
            },
        },

    ]



    return (
        <div className='flex flex-col gap-2'>
            <DataTable columns={columns} data={tempData} className='border' />
        </div>
    )
}



function DataTable({ columns, data, }) {
    const [globalFilter, setGlobalFilter] = useState('');
    const [sorting, setSorting] = useState([])
    const [columnFilters, setColumnFilters] = useState([])
    const [columnVisibility, setColumnVisibility] = useState({})
    const [rowSelection, setRowSelection] = useState({})
    const { onOpen, refresh } = useModal()
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
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            globalFilter
        },
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter, // ← add this
        enableGlobalFilter: true,             // optional but explicit [web:98]
    })

    return (
        <div className='flex flex-col gap-4'>

            <div className="flex flex-row gap-4 p-2 rounded-md border mb-10">
                <div className="flex items-center space-x-2 flex-1">
                    <Search size={18} />
                    <Input
                        placeholder="Search by patient name, ID, phone, or date of birth..."
                        value={globalFilter ?? ''}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className=" w-full border-0 outline-none focus:ring-0  "
                    />
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size={'sm'} className="ml-auto">
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


                <Button variant='outline' size='sm' onClick={() => { onOpen("patient-crud", { type: 'add' }) }}>Add Patient</Button>
            </div>

            <div className='border rounded-md'>
                <Table>
                    <TableHeader className='h-16'>

                        {table?.getHeaderGroups().map((headerGroup) => (

                            <TableRow key={headerGroup.id} className=''>
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
                                    className=''
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className='text-[14    px]'>
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
