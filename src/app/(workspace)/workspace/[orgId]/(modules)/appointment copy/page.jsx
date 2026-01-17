'use client'
import React, { useEffect, useEffectEvent, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Button } from '@/components/ui/button'
import { useModal } from '@/hooks/useModal'
import { useOrg } from '@/providers/OrgProvider'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import moment from 'moment'
import StatusSelector from './_components/StatusSelector'
import { Bell, Calendar, CalendarRange, Eye, FilePenLine, Megaphone, MoreHorizontal, Pencil, Trash2, Trash2Icon, View } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { ActionTooltip } from '@/components/global/ActionTooltip'
import ViewAppointment from './_components/appointment-manager/ViewAppointment'
import { useSocket } from '@/providers/SocketProvider'
import { useSession } from 'next-auth/react'
import { ROLE } from '@prisma/client'
import AppointmentEditor from './_components/appointment-manager/AppointmentEditor'
import { ScrollArea } from '@/components/ui/scroll-area'
import CategoryHierarchy from '../../_components/general/CategoryHierarchy'
import { useAppointment } from './_provider/appointmentProvider'
import DatePeriodSelector from '../(misc)/_components/DatePeriodSelector'
import { DataTable } from '../(misc)/_components/DataTable'


export default function Appointments() {
    const { server, servers } = useOrg()
    const { data: session } = useSession()
    const { category, setCategory } = useAppointment()


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

    const [appointmentEditor, setAppointmentEditor] = useState({
        isOpen: false,
        mode: 'edit',
        appointment: null
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
                                setAppointmentEditor({
                                    isOpen: true,
                                    mode: 'edit',
                                    appointment: row.original
                                })
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
                    <Button variant='save' size='sm' onClick={() => {
                        setAppointmentEditor({
                            isOpen: true,
                            mode: 'add',
                        })
                    }}>
                        <CalendarRange />
                        Book Appointment
                    </Button>
                </div>
            </div>




            <ScrollArea className='h-[85vh] flex flex-grow dark:bg-darkSecondaryBackground rounded-md p-2 border'>

                <div className='flex flex-col gap-4 p-2'>

                    <div className='flex flex-row gap-2 w-full '>


                        <div className='min-w-[75%]'>
                            <DataTable
                                columns={columns}
                                data={data}
                                onFiltersChange={(e) => { console.log('filter change', e) }}
                                filterTitle='Search appointments......'
                            />

                        </div>

                        <div className='w-full'>
                            <CategoryHierarchy
                                title='Appointment Hierarchy'
                                category={category}
                                onUpdate={(c) => { setCategory(c) }}
                            />
                        </div>

                    </div>
                </div>
            </ScrollArea>

            <ViewAppointment
                isOpen={viewAppointment?.isOpen}
                onClose={() => { setViewAppointment({ ...viewAppointment, isOpen: false }) }}
                appointment={viewAppointment?.appointment}
            />

            <AppointmentEditor
                isOpen={appointmentEditor.isOpen}
                mode={appointmentEditor.mode}
                onClose={() => {
                    setAppointmentEditor({
                        isOpen: false,
                        mode: 'add',
                    })
                }}
                appointment={appointmentEditor.appointment}
            />


        </div >
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


