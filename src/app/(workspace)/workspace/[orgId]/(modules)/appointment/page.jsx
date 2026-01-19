'use client'
import React, { useEffect, useEffectEvent, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Button } from '@/components/ui/button'
import { useModal } from '@/hooks/useModal'
import { useOrg } from '@/providers/OrgProvider'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import moment from 'moment'
import { BarChart3, Bell, Calendar, CalendarRange, Eye, FilePenLine, LayoutDashboard, Megaphone, MoreHorizontal, Pencil, Plus, Stethoscope, Trash2, Trash2Icon, Users, View } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { ActionTooltip } from '@/components/global/ActionTooltip'
import { useSocket } from '@/providers/SocketProvider'
import { useSession } from 'next-auth/react'
import { ROLE } from '@prisma/client'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAppointment } from './_provider/appointmentProvider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import DashboardContent from './_components/sections/DashboardSection'
import AppointmentsContent from './_components/sections/AppointmentsSection'
import DoctorsContent from './_components/sections/DoctorsSection'
import PatientsContent from './_components/sections/PatientsSection'
import ReportsContent from './_components/sections/ReportsSection'
import SettingsContent from './_components/sections/SettingsSection'
import NewAppointmentSheet from './_components/NewAppointmentSheet'
import { ContentTopbar } from '../../(misc)/_components/ContentTopbar'

const tabs = [
    { value: "appointments", label: "Appointments", icon: Calendar },
    { value: "doctors", label: "Doctors", icon: Stethoscope },
    { value: "patients", label: "Patients", icon: Users },
    { value: "reports", label: "Reports", icon: BarChart3 },
];


export default function Appointments() {
    const [activeTab, setActiveTab] = useState("appointments");
    const { server, servers } = useOrg()
    const { data: session } = useSession()
    const { category, setCategory, appointments } = useAppointment()


    const allAppointments = useSelector((state) => state.appointment.appointments)
    const serverAppointments = allAppointments?.filter(appointment => appointment.serverId === server?.id)
    const appointmentData = servers.flatMap(group => group.appointments); //All appointment of all server
    const { onOpen } = useModal()
    const router = useRouter()
    const { orgId } = useParams()
    const dispatch = useDispatch()
    const { socket } = useSocket()
    const { newAppointmentNotification, patientInNotify } = useSocket()
    const [appointmentSheet, setAppointmentSheet] = useState({
        isOpen: false,
        mode: 'view',
    });


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
        <div className='absolute inset-0 flex flex-col gap-2'>

            <Tabs value={activeTab} onValueChange={setActiveTab}>

                <ContentTopbar
                    title='Appointments'
                    description="Welcome back! Here' s what's happening with your appointments today."
                    actionComp={
                        <div className='flex flex-row items-center gap-2'>
                            <TabsList className="flex flex-wrap justify-center gap-1 bg-card border border-border/60 p-1  rounded-lg h-auto">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <TabsTrigger
                                            key={tab.value}
                                            value={tab.value}
                                            className={cn(
                                                "flex items-center gap-2  rounded-lg text-sm font-medium transition-all",
                                                "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow-sm"
                                            )}
                                        >
                                            <Icon className="h-4 w-4" />
                                            <span className="hidden lg:inline">{tab.label}</span>
                                        </TabsTrigger>
                                    );
                                })}
                            </TabsList>
                            <Button
                                variant='default'
                                size='md'
                                onClick={() => {
                                    setAppointmentSheet({
                                        isOpen: true,
                                        mode: 'add'
                                    })
                                }}
                                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 shadow-glow-sm"
                            >
                                <Plus className="h-4 w-4" />
                                <span className="hidden sm:inline">New Appointment</span>
                                <span className="sm:hidden">New</span>
                            </Button>
                        </div>
                    }
                />


                <ScrollArea className='h-[86vh] flex flex-grow  '>

                    {/* <div className='flex flex-col gap-4 p-2'>

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
                    </div> */}

                    <div className="container mx-auto">
                        <TabsContent value="dashboard" className="mt-0">
                            <DashboardContent />
                        </TabsContent>

                        <TabsContent value="appointments" className="mt-0">
                            <AppointmentsContent />
                        </TabsContent>

                        <TabsContent value="doctors" className="mt-0">
                            <DoctorsContent />
                        </TabsContent>

                        <TabsContent value="patients" className="mt-0">
                            <PatientsContent />
                        </TabsContent>

                        <TabsContent value="reports" className="mt-0">
                            <ReportsContent />
                        </TabsContent>

                        <TabsContent value="settings" className="mt-0">
                            <SettingsContent />
                        </TabsContent>
                    </div>
                </ScrollArea>


            </Tabs>
            <NewAppointmentSheet
                open={appointmentSheet.isOpen}
                onOpenChange={() => {
                    setAppointmentSheet({
                        isOpen: false
                    })
                }}
            //onSave={handleSaveAppointment}
            //editingAppointment={editingAppointment}
            //existingAppointments={appointments}
            />

        </div >
    )
}





