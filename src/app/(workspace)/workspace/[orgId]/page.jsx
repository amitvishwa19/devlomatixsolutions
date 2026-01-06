'use client'
import React, { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useDispatch, useSelector } from 'react-redux'
import { useOrg } from '@/providers/OrgProvider'
import moment from 'moment'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ContentTopbar } from './(misc)/_components/ContentTopbar'
import { Users, Calendar, BedDouble, Receipt, Stethoscope, Activity, TrendingUp, Clock } from "lucide-react";
import { ActivityFeed, BedOccupancy, DepartmentStats, DoctorsList, EmergencyAlerts, InventoryStatus, LiveStats, MiniCalendar, PatientDemographics, PatientOverview, PerformanceMetrics, QuickActions, RecentAppointments, RevenueChart, StaffSchedule, StatCard, UpcomingSurgeries } from './(misc)/_components/dashboard'



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






    return (
        <div className='absolute inset-0 flex flex-col gap-2 p-2'>

            <ContentTopbar
                title='Dashboard'
                description="Complete overview of all hospital operations and patient management. Monitor. Manage. Move forward."
            />


            <ScrollArea className='h-[85vh] flex flex-grow rounded-md '>
                <div className="space-y-2 animate-fade-in">


                    {/* Stats Grid - Top Row */}
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            title="Total Patients"
                            value="2,847"
                            change="+12% from last month"
                            changeType="positive"
                            icon={Users}
                        />
                        <StatCard
                            title="Appointments Today"
                            value="48"
                            change="8 pending confirmation"
                            changeType="neutral"
                            icon={Calendar}
                        />
                        <StatCard
                            title="Available Beds"
                            value="32"
                            change="75% occupancy rate"
                            changeType="neutral"
                            icon={BedDouble}
                        />
                        <StatCard
                            title="Revenue Today"
                            value="$42,580"
                            change="+8% from yesterday"
                            changeType="positive"
                            icon={Receipt}
                        />
                    </div>

                    {/* Stats Grid - Second Row */}
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            title="Active Doctors"
                            value="24"
                            change="3 on emergency"
                            changeType="neutral"
                            icon={Stethoscope}
                        />
                        <StatCard
                            title="Surgeries Today"
                            value="12"
                            change="4 completed"
                            changeType="positive"
                            icon={Activity}
                        />
                        <StatCard
                            title="Avg Wait Time"
                            value="14 min"
                            change="-3 min from avg"
                            changeType="positive"
                            icon={Clock}
                        />
                        <StatCard
                            title="Satisfaction"
                            value="94.2%"
                            change="+2.1% this week"
                            changeType="positive"
                            icon={TrendingUp}
                        />
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid gap-2 lg:grid-cols-12">
                        {/* Left Column */}
                        <div className="lg:col-span-8 space-y-2">
                            <RevenueChart />
                            <PatientOverview />
                            <UpcomingSurgeries />
                        </div>

                        {/* Right Column */}
                        <div className="lg:col-span-4 space-y-2">
                            <QuickActions />
                            <MiniCalendar />
                            <EmergencyAlerts />
                            <LiveStats />
                        </div>
                    </div>

                    {/* Middle Grid */}
                    <div className="grid gap-2 lg:grid-cols-3">
                        <DoctorsList />
                        <StaffSchedule />
                        <InventoryStatus />
                    </div>

                    {/* Bottom Grid */}
                    <div className="grid gap-2 lg:grid-cols-3">
                        <DepartmentStats />
                        <BedOccupancy />
                        <PatientDemographics />
                    </div>

                    {/* Bottom Section */}
                    <div className="grid gap-2 lg:grid-cols-2">
                        <RecentAppointments />
                        <PerformanceMetrics />
                    </div>

                    {/* Activity Feed */}
                    <ActivityFeed />
                </div>
            </ScrollArea>



            {/* <div className='h-96 bg-red-200' /> */}

        </div>
    )
}
