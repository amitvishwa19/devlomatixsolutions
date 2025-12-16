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
import { DatePicker } from '@/components/global/DatePicker'
import { setSelectedAppointment, setSelectedAppointments } from './_redux/appointment-slice'
import { Bell, Calendar, CalendarRange, Eye, FilePenLine, Megaphone, MoreHorizontal, Pencil, Trash2, Trash2Icon, View } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { ActionTooltip } from '@/components/global/ActionTooltip'
import BookAppointment from './_components/appointment-manager/BookAppointment'
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText, } from "@/components/ui/button-group"
import ViewAppointment from './_components/appointment-manager/ViewAppointment'
import EditAppointment from './_components/appointment-manager/EditAppointment'
import { useSocket } from '@/providers/SocketProvider'
import { useSession } from 'next-auth/react'
import { ROLE } from '@prisma/client'


export default function Appointments() {
    const { server, servers } = useOrg()
    const { data: session } = useSession()
    const allAppointments = useSelector((state) => state.appointment.appointments)
    const serverAppointments = allAppointments?.filter(appointment => appointment.serverId === server?.id)
    const appointmentData = servers.flatMap(group => group.appointments); //All appointment of all server
    const { onOpen } = useModal()
    const router = useRouter()
    const { orgId } = useParams()
    const dispatch = useDispatch()
    const { socket } = useSocket()
    const { newAppointmentNotification, patientInNotify } = useSocket()
    const [viewAppointment, setViewAppointment] = useState({
        isOpen: false,
        mode: 'view',
        category: null,
        parentCategory: null
    });

    useEffect(() => {
        socket?.on('patientInNotify', (e) => {
            const { sender, data } = e

            if (e?.sender?.orgId !== orgId) {
                console.log('Patient in notification', e)
                setViewAppointment({
                    isOpen: true,
                    mode: 'view',
                    appointment: e.data
                });
            }
        })

    }, [socket])


    const handleViewAppointment = (e) => {
        console.log('view appointment', e)
        setViewAppointment({
            isOpen: true,
            mode: 'view',
            appointment: e
        });
    };

    const [editAppointment, setEditAppointment] = useState({
        isOpen: false,
        mode: 'edit',

    });


    const handleEditAppointment = (e) => {

        setEditAppointment({
            isOpen: true,
            mode: 'edit',
            appointment: e
        });
    };


    //console.log(session)
    const finaldata = session?.user?.role === ROLE.RECEPTIONIST ? appointmentData : serverAppointments

    const data = finaldata?.map((item) => {
        return {
            id: item?.id,
            uuid: item?.patient?.uuid,
            patient: item?.patient?.displayName,
            patientDetails: item?.patient,
            doctor: 'Dr. ' + item?.doctor?.displayName,
            doctorDetails: item?.doctor,
            date: item?.date,
            slot: item?.slot,
            time: item?.time,
            type: item?.type,
            visitType: item?.visitType,
            note: item?.note,
            additionalNote: item?.additionalNote,
            doctorNote: item?.doctorNote,
            status: item?.status,
            raw: item
        }
    })


    const notifyDoctor = (e) => {
        patientInNotify(e)
    }

    const columns = [
        {
            id: "patient",
            accessorKey: "patient",
            header: "Patient",
            cell: ({ row }) => (
                <div className='flex flex-row gap-4 items-center'>
                    <Avatar className='rounded-md h-8 w-8'>
                        <AvatarImage src={row?.original?.patientDetails?.avatar} alt="@shadcn" />
                        <AvatarFallback className='rounded-md'>{row?.original?.patientDetails?.displayName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className='flex flex-col items-start'>
                        <span>{row.original.patient}</span>
                        <span className='text-xs text-muted-foreground'>{row.original.uuid}</span>
                    </div>
                </div>
            ),
            enableSorting: true,
            enableHiding: true,
        },
        {
            id: "doctor",
            accessorKey: "doctor",
            header: "Doctor",
            cell: ({ row }) => (
                <div className='flex flex-col items-start'>
                    <span>{row.original.doctor}</span>
                    <span className='text-xs text-muted-foreground'>{row.original.doctorDetails?.uuid}</span>
                </div>
            )
        },
        {
            id: "info",
            header: "Appointment Info",
            cell: ({ row }) => (
                <div className='flex flex-col '>
                    <div>
                        {moment(row.original.date).format("Do MMM YY")} -
                        {row.original.time}
                    </div>
                    <span className=' capitalize text-xs text-muted-foreground'>{row.original.visitType}</span>
                </div>
            )
        },
        {
            id: "note",
            header: "Desctiption",
            cell: ({ row }) => (
                <div className='flex flex-wrap text-wrap overflow-hidden w-80 text-xs text-muted-foreground'>
                    <div>
                        {row.original.note}
                    </div>

                </div>
            )
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => <StatusSelector
                status={row.original.status}
                title={row.original.status}
                id={row.original.id}
            />
        },
        {
            id: "actions",
            enableHiding: false,
            header: "Actions",
            cell: ({ row }) => {
                const appointment = row.original

                return (
                    <div className='flex flex-row items-center gap-4'>
                        <ActionTooltip label={'Notify Doctor and open patient info'}>
                            <Megaphone size={18} className=' cursor-pointer' onClick={() => {
                                notifyDoctor(appointment)
                            }} />
                        </ActionTooltip>
                        <ActionTooltip label={'Edit Appointment'}>
                            <Eye size={18} className=' cursor-pointer' onClick={() => {
                                handleViewAppointment(appointment)
                            }} />
                        </ActionTooltip>

                        <ActionTooltip label={'Edit Appointment'}>
                            <Pencil size={18} className=' cursor-pointer' onClick={() => {
                                handleEditAppointment(appointment)
                            }}
                            />
                        </ActionTooltip>

                        <ActionTooltip label={'Delete Appointment'}>
                            <Trash2Icon size={18} className=' cursor-pointer' onClick={() => { onOpen('delete-appointment', { appointmentId: row.original.id }) }} />
                        </ActionTooltip>
                    </div>
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
                    <Button variant='save' size='sm' onClick={() => { onOpen('book-appointment') }}>
                        <CalendarRange />
                        Book Appointment
                    </Button>
                </div>
            </div>

            <div className='h-full dark:bg-darkSecondaryBackground p-4 rounded-md'>
                <DataTable columns={columns} data={data} />
            </div>

            <ViewAppointment
                isOpen={viewAppointment?.isOpen}
                onClose={() => { setViewAppointment({ ...viewAppointment, isOpen: false }) }}
                appointment={viewAppointment?.appointment}
            />

            <EditAppointment
                isOpen={editAppointment?.isOpen}
                onClose={() => { setEditAppointment({ ...editAppointment, isOpen: false }) }}
                appointment={editAppointment?.appointment}

            />
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

        state: {
            pagination,
        },
        state: {
            sorting,
            globalFilter,
            columnFilters,
            columnVisibility,
        },
    })

    const appointmentFilter = [
        { value: 'all', function: (e) => { setSelector(e) } },
        { value: 'yesterday', function: (e) => { setSelector(e) } },
        { value: 'today', function: (e) => { setSelector(e) } },
        { value: 'tomorrow', function: (e) => { setSelector(e) } },
        { value: 'week', function: (e) => { setSelector(e) } },
        { value: 'month', function: (e) => { setSelector(e) } }
    ]

    return (
        <div>

            <div className='flex flex-row justify-between'>
                <ButtonGroup size='sm'>
                    {appointmentFilter.map((item) => (
                        <Button
                            key={item.value}
                            variant={'outline'}
                            size={'sm'}
                            className={` capitalize w-32 border hover:bg-primary/10 hover:dark:bg-darkFocusColor ${selector === item.value && 'bg-primary/10 dark:bg-darkFocusColor'}`}
                            onClick={() => { item.function(item.value) }}
                        >
                            {item.value}
                        </Button>
                    ))}
                </ButtonGroup>


                <DatePicker onChange={(e) => { setSelector('date'); setSelectedDate(e) }} />
            </div>

            <div className="flex items-center py-4">

                <div className='flex flex-row justify-evenly gap-4'>
                    <Input
                        placeholder="Search Appointment..."
                        value={globalFilter ?? ''}
                        onChange={(event) => table.setGlobalFilter(String(event.target.value))}
                        className=""
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


