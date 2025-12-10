'use client'
import React, { useEffect } from 'react'
import { useAction } from '@/hooks/use-action'
import { useSession } from 'next-auth/react'
import { useDispatch, useSelector } from 'react-redux'
import { setLoading } from '@/redux/slices/org'
import { ROLE } from '@prisma/client'
import { getDoctors } from './(misc)/_actions/get-doctors'
import { getAllUsers } from './(misc)/_actions/get-users'
import { getAppointments } from './appointment/_actions/get-appointments'
import { setAppointments, setDoctors, setPatients } from './appointment/_redux/appointment-slice'
import { StatsCard } from './appointment/_components/cards/StatsCard'
import { useOrg } from '@/providers/OrgProvider'
import AppointmentsList from './(misc)/_components/dashboard/AppointmentsList'
import QuickActions from './(misc)/_components/dashboard/QuickActions'
import ClinicOverview from './(misc)/_components/dashboard/ClinicOverview'
import RecentPatients from './(misc)/_components/dashboard/RecentPatients'
import { DoctorSchedule } from './(misc)/_components/dashboard/DoctorSchedule'
import { UpcomingTasks } from './(misc)/_components/dashboard/UpcomingTasks'
import { InventoryStatus } from './(misc)/_components/dashboard/InventoryStatus'
import { NotificationsPanel } from './(misc)/_components/dashboard/NotificationsPanel'
import { RevenueChart } from './(misc)/_components/dashboard/RevenueChart'
import moment from 'moment'




export default function Dashboard() {
    const { data: session } = useSession()
    const { server } = useOrg()
    const doctorsdata = useSelector((state) => state.appointment.doctors)
    const loading = useSelector((state) => state.org.loading)
    const dispatch = useDispatch()

    useEffect(() => {
        //dispatch(setLoading(true))
        //appointments({ userId: session?.user?.userId, role: session?.user?.role, serverId: server?.id })
        //doctors({ userId: session?.user?.userId })
        //users({ userId: session?.user?.userId })
    }, [session, server])



    const { execute: appointments } = useAction(getAppointments, {
        onSuccess: (data) => {
            console.log('@All appointments @Dashboard', data)
            dispatch(setAppointments(JSON.stringify(data.appointments)))
            dispatch(setLoading(false))
        },
        onError: (error) => {
            console.log(error)
            dispatch(setLoading(false))
            //toast.error(error)
        }
    })

    const { execute: doctors } = useAction(getDoctors, {
        onSuccess: (data) => {
            dispatch(setDoctors(JSON.stringify(data.doctors)))
        },
        onError: (error) => {
            console.log(error)
        }
    })

    const { execute: users } = useAction(getAllUsers, {
        onSuccess: (data) => {
            //dispatch(setDoctors(JSON.stringify(data.doctors)))
            //console.log(data?.users.filter((i) => i.role === ROLE.DOCTOR))
            dispatch(setDoctors(JSON.stringify(data?.users.filter((i) => i.role === ROLE.DOCTOR))))
            dispatch(setPatients(JSON.stringify(data?.users.filter((i) => i.role === ROLE.PATIENT))))
        },
        onError: (error) => {
            console.log(error)
        }
    })

    const formatChangeFromYesterday = (today, yesterday) => {
        if (!yesterday) return '0% from yesterday' // avoid divide by 0

        const change = ((today - yesterday) / yesterday) * 100
        const rounded = Math.round(change) // or toFixed(1)

        const sign = rounded > 0 ? '+' : ''
        return `${sign}${rounded}% from yesterday`
    }

    const todayAppointments = server?.appointments?.filter(item => moment(item?.date).format('Do MMM YY') === moment(new Date()).format('Do MMM YY'))

    const yesterday = new Date().setDate(new Date().getDate() - 1);
    const yesterdayAppointments = server?.appointments?.filter(item => moment(item?.date).format('Do MMM YY') === moment(yesterday).format('Do MMM YY'))
    const yesterdayCompletedCharge = yesterdayAppointments?.filter(appt => appt.status === 'completed').reduce((sum, appt) => sum + (appt?.type?.charge ?? 0), 0)


    //.reduce((total, appointment) => total + (appointment.fee || 0), 0);
    const todaysRevenu = todayAppointments?.filter(a => a.status === 'completed');
    const todaysCompletedCharge = todayAppointments?.filter(appt => appt.status === 'completed').reduce((sum, appt) => sum + (appt?.type?.charge ?? 0), 0)

    //console.log('yesterdayAppointments', yesterdayAppointments)
    //console.log('yesterdayCompletedCharge', yesterdayCompletedCharge)
    //console.log('totalCompletedCharge', todaysCompletedCharge)

    //console.log('@todayAppointments', todayAppointments)
    //console.log('All Appointments', server?.appointments)




    return (
        <div className='flex flex-col gap-y-2'>

            <div className='w-full dark:bg-[#151D24] p-4 rounded-lg border'>
                <h2 className='text-xl font-semibold'>Dashboard</h2>
                <h2 className='text-xs text-white/50'> Complete overview of all hospital operations and patient management. Monitor. Manage. Move forward.</h2>
            </div>



            <div className='grid gap-2 md:grid-cols-2 lg:grid-cols-4'>

                <StatsCard
                    title="Today's Revenue"
                    value={`₹ ${todaysCompletedCharge || 0}`}
                    change={formatChangeFromYesterday(todaysCompletedCharge, yesterdayCompletedCharge)}
                    changeType='positive'
                    icon={'indian-rupee'}
                    iconColor='#00FFFF'
                    iconClassName='bg-[#172E3A]'
                />

                <StatsCard
                    title="Today's Appointments"
                    value={todayAppointments?.length || 0}
                    change={`${todayAppointments?.filter(a => a.status !== 'completed').length} pending`}
                    changeType='positive'
                    icon={'calendar'}
                    iconColor='#7FFFD4'
                    iconClassName='bg-[#172E3A]'
                />

                <StatsCard
                    title='Active Doctors'
                    value='7'
                    change='2 on leave'
                    changeType='positive'
                    icon={'stethoscope'}
                    iconColor='#50C878'
                    iconClassName='bg-[#172E3A]'
                />

                <StatsCard
                    title='Avaliable Beds'
                    value='12'
                    change='-8% from yesterday'
                    changeType='negative'
                    icon={'bed-double'}
                    iconColor='#CF9FFF'
                    iconClassName='bg-[#172E3A]'
                />

            </div>


            <div className="grid gap-2 lg:grid-cols-3">

                {/* Left Column - Appointments */}
                <div className="lg:col-span-2 space-y-2">
                    <AppointmentsList appointments={todayAppointments} count={5} />
                    <RecentPatients />
                    <div className='grid gap-2 lg:grid-cols-2'>
                        <UpcomingTasks />
                        <InventoryStatus />
                    </div>
                    <RevenueChart />
                </div>

                {/* Right Column - Quick Actions & Overview */}
                <div className="space-y-2">
                    <QuickActions />
                    <DoctorSchedule />
                    <ClinicOverview />
                    <NotificationsPanel />
                </div>

            </div>
            {/* <div className='h-96 bg-red-200' /> */}

        </div>
    )
}
