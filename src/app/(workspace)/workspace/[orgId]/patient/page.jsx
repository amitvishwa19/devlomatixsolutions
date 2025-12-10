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
import { useModal } from '@/hooks/useModal'
import { useOrg } from '@/providers/OrgProvider'
import { ROLE } from '@prisma/client'
import { getAge } from '@/utils/functions'
import moment from 'moment'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText, } from "@/components/ui/button-group"
import { DynamicIcon } from 'lucide-react/dynamic'
import PatientSearchPage from './_component/patient-search/PatientSearchPage'
import MedicalRecordsPage from './_component/medical-records/MedicalRecordsPage'
import BillingManagementPage from './_component/billing-management/BillingManagementPage'
import PatientManagementPage from './_component/patient-search/PatientManagementPage'


export default function PatientPage() {

    const [loading, setLoading] = useState(true)
    const { onOpen, refresh } = useModal()
    const { users } = useOrg()
    const patients = users?.filter(user => user.role === ROLE.PATIENT)

    const [active, setActive] = useState({ title: 'Patients', icon: 'accessibility', component: <PatientManagementPage /> })
    const nav = [
        { title: 'Patients', icon: 'accessibility', component: <PatientManagementPage /> },
        { title: 'Medical Records', icon: 'square-activity', component: <MedicalRecordsPage /> },
        { title: 'Billing', icon: 'square-activity', component: <BillingManagementPage /> }
    ]

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
            accessorKey: "uuid",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        PatientId
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
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
                                //onOpen("edituser", { user: row.original })
                                onOpen("patient-crud", { user: row?.original?.user, type: 'edit' })
                            }}>Edit
                                <FilePenLine className="h-4 w-4 ml-auto" />
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                                onOpen("delete-patient", { id: row.original.id })
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
            <div className='w-full dark:bg-[#151D24] p-4 rounded-lg border flex flex-row items-center justify-between'>
                <div>
                    <h2 className='text-xl'>Patients</h2>
                    <h2 className='text-xs text-white/50'>
                        Search and access patient records using multiple criteria for efficient clinical operations
                    </h2>
                </div>
                {/* <Button variant='outline' size='sm' onClick={() => { onOpen("patient-crud", { type: 'add' }) }}>Add Patient</Button> */}
                <ButtonGroup>
                    {nav.map((item) => (
                        <Button
                            key={item.title} variant='ghost'
                            size={'sm'}
                            className={`border w-40 capitalize hover:bg-primary/20 dark:hover:bg-darkFocusColor ${active.title === item.title && 'bg-primary/20 dark:bg-darkFocusColor'}`}
                            onClick={() => { setActive(item) }}
                        >
                            <DynamicIcon name={item.icon} />
                            <span>{item.title}</span>
                        </Button>
                    ))}
                </ButtonGroup>
            </div>


            {/* <div className='w-full dark:bg-[#151D24] p-4 rounded-lg border'>
                <DataTable columns={columns} data={tempData} />
            </div> */}
            <div className='h-full flex flex-grow w-full dark:bg-darkSecondaryBackground rounded-md py-2'>
                <ScrollArea className='h-[85vh] w-full p-2'>
                    {active.component}
                </ScrollArea>
            </div>

        </div>
    )
}


function DataTable({ columns, data, }) {
    const [globalFilter, setGlobalFilter] = useState('');
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
        <div>
            <div className="flex items-center py-4">

                {/* <Input
                    placeholder="Search..."
                    value={(table.getColumn("displayName")?.getFilterValue()) ?? ""}
                    onChange={(event) =>
                        table.getColumn("displayName")?.setFilterValue(event.target.value)

                    }
                    className="max-w-sm"
                /> */}

                <Input
                    placeholder="Search..."
                    value={globalFilter ?? ''}
                    onChange={(e) => setGlobalFilter(e.target.value)}
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
