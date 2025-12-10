'use client'
import React, { useEffect, useEffectEvent, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { capitalizeFirstLetter } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useModal } from '@/hooks/useModal'
import { useOrg } from '@/providers/OrgProvider'
import { flexRender, getFilteredRowModel, getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, } from "@tanstack/react-table"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import moment from 'moment'
import StatusSelector from './_components/StatusSelector'
import { DynamicIcon } from 'lucide-react/dynamic';
import EditAppointment from './_components/EditAppointment'
import { DatePicker } from '@/components/global/DatePicker'
import { setSelectedAppointment, setSelectedAppointments } from './_redux/appointment-slice'
import { Calendar, FilePenLine, MoreHorizontal, Trash2, View } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'

export default function Appointments() {
    const { server } = useOrg()
    const allAppointments = useSelector((state) => state.appointment.appointments)
    const serverAppointments = allAppointments?.filter(appointment => appointment.serverId === server?.id)
    const appointmentData = useSelector((state) => state.appointment.appointments)
    const { onOpen } = useModal()
    const router = useRouter()
    const { orgId } = useParams()
    const dispatch = useDispatch()



    const data = serverAppointments?.map((item) => {
        return {
            id: item?.id,
            patient: item?.patient?.displayName,
            patientDetails: item?.patient,
            doctor: 'Dr. ' + item?.doctor?.displayName,
            doctorDetails: item?.doctor,
            date: item?.date,
            slot: item?.slot,
            time: item?.time,
            type: item?.type,
            note: item?.note,
            additionalNote: item?.additionalNote,
            doctorNote: item?.doctorNote,
            status: item?.status,
            raw: item
        }
    })

    const columns = [

        {
            id: "select",
            cell: ({ row }) => (
                <div className='flex flex-row gap-4 items-center'>
                    <Avatar className='rounded-md h-8 w-8'>
                        <AvatarImage src={row?.original?.patientDetails?.avatar} alt="@shadcn" />
                        <AvatarFallback className='rounded-md'>{row?.original?.patientDetails?.displayName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <DynamicIcon name={row.original.type.icon} size={18} className='h-10 line-through' />
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "patient",
            header: "Patient",
        },
        {
            accessorKey: "doctor",
            header: "Doctor",

        },
        {
            id: "date",
            header: "Date",
            cell: ({ row }) => moment(row.original.date).format("Do MMM YY")
        },
        {
            accessorKey: "time",
            header: "Time",
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => <StatusSelector
                title={row.original.status}
                id={row.original.id}
            />
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
                            <DropdownMenuItem onClick={() => {
                                dispatch(setSelectedAppointment(JSON.stringify(row.original)))
                                router.push(`/workspace/${orgId}/appointment/${row.original.id}`)
                            }}>View
                                <View className="h-4 w-4 ml-auto" />
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

            <div className='w-full dark:bg-[#151D24] p-4 rounded-md border flex flex-row items-center justify-between'>
                <div>
                    <h2 className='text-xl'>Appointments</h2>
                    <h2 className='text-xs text-white/50'>Manage all your appointments</h2>
                </div>
                <div className='flex flex-row gap-2'>
                    {/* <Button variant={'outline'} size={'sm'} className='' onClick={() => {
                        //onOpen('appointment-crud', { type: 'add' })
                        router.push(`/workspace/${orgId}/appointment/new`)
                    }}>
                        Book Appointment
                    </Button> */}

                    <Button variant={'save'} size={'sm'} className='' onClick={() => { onOpen('add-appointment-modal', 'add') }}>
                        <Calendar />
                        Book Appointment
                    </Button>
                </div>
            </div>

            <div className='h-full dark:bg-darkSecondaryBackground p-4 rounded-md'>
                <DataTable columns={columns} data={data} />
            </div>
        </div >
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


    useEffect(() => {

        let filterData = []

        if (selector === 'all') {
            filterData = data
        } else if (selector === 'yesterday') {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            filterData = data?.filter(item => moment(item?.date).format('Do MMM YY') === moment(yesterday).format('Do MMM YY'))
        } else if (selector === 'today') {
            const today = new Date();
            //yesterday.setDate(yesterday.getDate() - 1);
            filterData = data?.filter(item => moment(item?.date).format('Do MMM YY') === moment(today).format('Do MMM YY'))
        } else if (selector === 'tomorrow') {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            filterData = data?.filter(item => moment(item?.date).format('Do MMM YY') === moment(tomorrow).format('Do MMM YY'))
        } else if (selector === 'week') {
            const week = new Date();
            filterData = data?.filter(item => {
                const appointmentDate = new Date(item?.date);
                const currentDate = new Date();
                const weeknext = new Date();
                weeknext.setDate(currentDate.getDate() + 6);
                return appointmentDate <= weeknext && appointmentDate >= currentDate;
            })
        } else if (selector === 'month') {
            filterData = data?.filter(item => {
                const appointmentDate = new Date(item?.date);
                const currentDate = new Date();
                return appointmentDate.getMonth() === currentDate.getMonth() && appointmentDate.getFullYear() === currentDate.getFullYear();
            });
        } else if (selector === 'date') {

            filterData = data?.filter(item => moment(item?.date).format('Do MMM YY') === moment(selectedDate).format('Do MMM YY'))
        }

        dispatch(setSelectedAppointments(JSON.stringify(filterData)))

    }, [selector, data, selectedDate])


    const table = useReactTable({
        data: selectedAppointments,
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

            <div className='flex flex-row'>
                <div className='flex flex-row gap-x-2 w-full'>

                    <SelectorButton title='all' onClick={(e) => { setSelector(e) }} value={selector} />

                    <SelectorButton title='yesterday' onClick={(e) => { setSelector(e) }} value={selector} />

                    <SelectorButton title='today' onClick={(e) => { setSelector(e) }} value={selector} />

                    <SelectorButton title='tomorrow' onClick={(e) => { setSelector(e) }} value={selector} />

                    <SelectorButton title='week' onClick={(e) => { setSelector(e) }} value={selector} />

                    <SelectorButton title='month' onClick={(e) => { setSelector(e) }} value={selector} />

                </div>
                <DatePicker onChange={(e) => { setSelector('date'); setSelectedDate(e) }} />
            </div>

            <div className="flex items-center py-4">

                <div className='flex flex-row justify-evenly gap-4'>
                    <Input
                        placeholder="Patient..."
                        value={(table.getColumn("patient")?.getFilterValue()) ?? ""}
                        onChange={(event) =>
                            table.getColumn("patient")?.setFilterValue(event.target.value)

                        }
                        className="max-w-sm"
                    />

                    <Input
                        placeholder="Doctor..."
                        value={(table.getColumn("doctor")?.getFilterValue()) ?? ""}
                        onChange={(event) =>
                            table.getColumn("doctor")?.setFilterValue(event.target.value)

                        }
                        className="max-w-sm"
                    />

                    <Input
                        placeholder="Status..."
                        value={(table.getColumn("status")?.getFilterValue()) ?? ""}
                        onChange={(event) =>
                            table.getColumn("status")?.setFilterValue(event.target.value)

                        }
                        className="max-w-sm"
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

const SelectorButton = ({ title, onClick, value }) => {

    return (
        <Button
            variant="secondary"
            className={`w-[10%] p-2 border rounded-md cursor-pointer
                        flex items-center justify-center hover:bg-slate-400
                        dark:bg-[#0E141B] hover:dark:bg-darkFocusColor hover:bg-primary/10    
                        ${value === title ? 'dark:bg-darkFocusColor bg-primary/10' : ''}`}
            onClick={() => onClick(title)}
            size='sm'
        >
            <span className=' capitalize'>{title}</span>
        </Button>
    )
}


